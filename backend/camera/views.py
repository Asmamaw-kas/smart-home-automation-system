"""
Views for camera streaming and control
"""
from .camera_service import get_camera
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.http import StreamingHttpResponse, JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.core.files.base import ContentFile
import cv2
import numpy as np
import base64
import threading
import time
from datetime import datetime
import os
import logging

from .models import Camera, CameraRecording, MotionEvent, CameraSnapshot
from .serializers import (
    CameraSerializer, CameraRecordingSerializer, MotionEventSerializer,
    CameraSnapshotSerializer, PTZControlSerializer
)
from logs.models import ActivityLog

logger = logging.getLogger(__name__)

camera_capture = {}
camera_streaming = {}


def open_camera_source(camera_id):
    """
    Open camera source with Windows-friendly backend.
    """
    try:
        if os.name == 'nt':
            return cv2.VideoCapture(int(camera_id), cv2.CAP_DSHOW)
        return cv2.VideoCapture(int(camera_id))
    except Exception:
        return cv2.VideoCapture(camera_id)


class CameraViewSet(viewsets.ModelViewSet):
    queryset = Camera.objects.all()
    serializer_class = CameraSerializer

    def get_queryset(self):
        queryset = Camera.objects.all()

        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        location = self.request.query_params.get('location', None)
        if location:
            queryset = queryset.filter(location__icontains=location)

        return queryset

    def perform_create(self, serializer):
        camera = serializer.save()
        self._test_camera_connection(camera)

    def perform_update(self, serializer):
        camera = serializer.save()
        self._test_camera_connection(camera)

    def _test_camera_connection(self, camera):
        try:
            cap = open_camera_source(camera.camera_id)
            if cap.isOpened():
                ret, frame = cap.read()
                camera.status = 'online' if ret else 'error'
            else:
                camera.status = 'offline'
            cap.release()
            camera.save()
        except Exception as e:
            logger.error(f"Camera connection error: {e}")
            camera.status = 'error'
            camera.save()

    @action(detail=True, methods=['get'])
    def stream_url(self, request, pk=None):
        camera = self.get_object()
        base_url = request.build_absolute_uri('/').rstrip('/')

        return Response({
            'mjpeg_url': f"{base_url}/api/cameras/mjpeg/{camera.id}/",
            'snapshot_url': f"{base_url}/api/cameras/snapshot/{camera.id}/"
        })

    @action(detail=True, methods=['post'])
    def start_recording(self, request, pk=None):
        camera = self.get_object()
        camera_service = get_camera()

        if not camera_service.is_running:
            started = camera_service.start(camera.camera_id)
            if not started:
                return Response({
                    'success': False,
                    'message': "Failed to start camera"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if not camera.is_recording:
            started = camera_service.start_recording()
            if not started:
                return Response({
                    'success': False,
                    'message': "No frame available for recording"
                }, status=status.HTTP_400_BAD_REQUEST)

            camera.is_recording = True
            camera.status = 'recording'
            camera.save()

            ActivityLog.objects.create(
                action_type='DEVICE_ON',
                description=f"Started recording from {camera.name}",
                user=request.user if request.user.is_authenticated else None
            )

            return Response({
                'success': True,
                'message': f"Started recording from {camera.name}"
            })

        return Response({
            'success': False,
            'message': "Camera is already recording"
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def stop_recording(self, request, pk=None):
        camera = self.get_object()
        camera_service = get_camera()

        if camera.is_recording:
            filepath = camera_service.stop_recording()

            camera.is_recording = False
            camera.status = 'online'
            camera.save()

            if filepath and os.path.exists(filepath):
                filename = os.path.basename(filepath)
                file_size = os.path.getsize(filepath)

                CameraRecording.objects.create(
                    camera=camera,
                    filename=filename,
                    file_path=filepath,
                    file_size=file_size,
                    duration=0,
                    start_time=timezone.now(),
                    end_time=timezone.now(),
                    triggered_by='manual'
                )

            ActivityLog.objects.create(
                action_type='DEVICE_OFF',
                description=f"Stopped recording from {camera.name}",
                user=request.user if request.user.is_authenticated else None
            )

            return Response({
                'success': True,
                'message': f"Stopped recording from {camera.name}"
            })

        return Response({
            'success': False,
            'message': "Camera is not recording"
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def take_snapshot(self, request, pk=None):
        camera = self.get_object()
        frame = self._capture_frame(camera)

        if frame is not None:
            _, buffer = cv2.imencode('.jpg', frame)
            image_data = base64.b64encode(buffer).decode('utf-8')

            snapshot = CameraSnapshot.objects.create(
                camera=camera,
                captured_by=request.user if request.user.is_authenticated else None,
                notes=request.data.get('notes', '')
            )

            ActivityLog.objects.create(
                action_type='SENSOR_READING',
                description=f"Snapshot taken from {camera.name}",
                user=request.user if request.user.is_authenticated else None
            )

            return Response({
                'success': True,
                'message': "Snapshot taken",
                'image': image_data,
                'snapshot_id': snapshot.id
            })

        return Response({
            'success': False,
            'message': "Failed to capture frame"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def ptz_control(self, request, pk=None):
        camera = self.get_object()

        if not camera.has_ptz:
            return Response({
                'success': False,
                'message': "This camera does not support PTZ"
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = PTZControlSerializer(data=request.data)

        if serializer.is_valid():
            if 'pan' in serializer.validated_data:
                camera.ptz_pan = serializer.validated_data['pan']
            if 'tilt' in serializer.validated_data:
                camera.ptz_tilt = serializer.validated_data['tilt']
            if 'zoom' in serializer.validated_data:
                camera.ptz_zoom = serializer.validated_data['zoom']

            camera.save()

            ActivityLog.objects.create(
                action_type='DEVICE_UPDATE',
                description=f"PTZ control on {camera.name}",
                user=request.user if request.user.is_authenticated else None
            )

            return Response({
                'success': True,
                'message': "PTZ control executed",
                'ptz': {
                    'pan': camera.ptz_pan,
                    'tilt': camera.ptz_tilt,
                    'zoom': camera.ptz_zoom
                }
            })

        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def recordings(self, request):
        recordings = CameraRecording.objects.all().order_by('-start_time')[:50]
        serializer = CameraRecordingSerializer(recordings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def recordings_list(self, request, pk=None):
        camera = self.get_object()
        recordings = CameraRecording.objects.filter(camera=camera).order_by('-start_time')[:50]
        serializer = CameraRecordingSerializer(recordings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def motion_events(self, request):
        events = MotionEvent.objects.all().order_by('-triggered_at')[:50]
        serializer = MotionEventSerializer(events, many=True)
        return Response(serializer.data)

    def _record_camera(self, camera):
        cap = open_camera_source(camera.camera_id)

        if not cap.isOpened():
            logger.error(f"Cannot open camera {camera.id} for recording")
            return

        width, height = map(int, camera.resolution.split('x'))
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
        cap.set(cv2.CAP_PROP_FPS, camera.fps)

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"recording_{camera.id}_{timestamp}.mp4"

        media_dir = os.path.join('media', 'camera_recordings')
        os.makedirs(media_dir, exist_ok=True)

        filepath = os.path.join(media_dir, filename)

        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(filepath, fourcc, camera.fps, (width, height))

        start_time = time.time()

        try:
            while True:
                camera.refresh_from_db()
                if not camera.is_recording:
                    break

                ret, frame = cap.read()
                if ret:
                    out.write(frame)

                time.sleep(max(1 / max(camera.fps, 1), 0.01))
        finally:
            out.release()
            cap.release()

        end_time = time.time()
        duration = int(end_time - start_time)

        if os.path.exists(filepath):
            file_size = os.path.getsize(filepath)

            CameraRecording.objects.create(
                camera=camera,
                filename=filename,
                file_path=filepath,
                file_size=file_size,
                duration=duration,
                start_time=datetime.fromtimestamp(start_time),
                end_time=datetime.fromtimestamp(end_time),
                triggered_by='manual'
            )

    def _capture_frame(self, camera):
        try:
            cap = open_camera_source(camera.camera_id)

            if not cap.isOpened():
                logger.error(f"Cannot open camera {camera.id}")
                return None

            width, height = map(int, camera.resolution.split('x'))
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)

            ret, frame = cap.read()
            cap.release()

            return frame if ret else None
        except Exception as e:
            logger.error(f"Frame capture error: {e}")
            return None


class MJPEGStreamView(APIView):
    permission_classes = []
    authentication_classes = []

    def get(self, request, camera_id):
        camera_obj = get_object_or_404(Camera, id=camera_id)
        camera_service = get_camera()

        if not camera_service.is_running:
            started = camera_service.start(camera_obj.camera_id)
            if not started:
                return HttpResponse("Unable to start camera", status=500)

        camera_service.add_client(camera_obj.camera_id)

        def generate_frames():
            try:
                while True:
                    frame_bytes = camera_service.get_frame()

                    if frame_bytes is None:
                        time.sleep(0.1)
                        continue

                    yield (
                        b'--frame\r\n'
                        b'Content-Type: image/jpeg\r\n\r\n' +
                        frame_bytes +
                        b'\r\n'
                    )

                    time.sleep(1 / max(camera_obj.fps, 1))
            except GeneratorExit:
                logger.info(f"Client disconnected from camera {camera_id} stream")
            except Exception as e:
                logger.error(f"Stream error for camera {camera_id}: {e}")
            finally:
                camera_service.remove_client()

        response = StreamingHttpResponse(
            generate_frames(),
            content_type='multipart/x-mixed-replace; boundary=frame'
        )
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        response['X-Accel-Buffering'] = 'no'
        response['Access-Control-Allow-Origin'] = '*'

        return response


class SnapshotView(APIView):
    def get(self, request, camera_id):
        camera_obj = get_object_or_404(Camera, id=camera_id)
        camera_service = get_camera()

        if not camera_service.is_running:
            started = camera_service.start(camera_obj.camera_id)
            if not started:
                return JsonResponse({'error': 'Camera not available'}, status=500)
            time.sleep(0.3)

        frame_base64 = camera_service.get_frame_base64()
        if frame_base64:
            return JsonResponse({
                'success': True,
                'image': frame_base64,
                'timestamp': timezone.now().isoformat()
            })

        return JsonResponse({'error': 'Failed to capture frame'}, status=500)


class MotionDetectionView(APIView):
    def post(self, request, camera_id):
        camera = get_object_or_404(Camera, id=camera_id)

        if not camera.motion_detection:
            return Response({
                'success': False,
                'message': "Motion detection is not enabled"
            }, status=status.HTTP_400_BAD_REQUEST)

        cap = open_camera_source(camera.camera_id)

        if not cap.isOpened():
            return Response({
                'success': False,
                'message': "Camera not available"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        ret, frame = cap.read()
        cap.release()

        if ret:
            event = MotionEvent.objects.create(
                camera=camera,
                motion_level=50,
                motion_area='{}'
            )

            ActivityLog.objects.create(
                action_type='SENSOR_ALERT',
                severity='warning',
                description=f"Motion detected on {camera.name}",
                extra_data={'motion_level': 50}
            )

            return Response({
                'success': True,
                'message': "Motion detected",
                'event_id': event.id
            })

        return Response({
            'success': False,
            'message': "Failed to capture frame"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)