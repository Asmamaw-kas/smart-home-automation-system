"""
Serializers for camera app
"""
from rest_framework import serializers
from .models import Camera, CameraRecording, MotionEvent, CameraSnapshot

class CameraSerializer(serializers.ModelSerializer):
    """Serializer for Camera model"""
    status_color = serializers.SerializerMethodField()
    resolution_display = serializers.CharField(source='get_resolution_display', read_only=True)
    
    class Meta:
        model = Camera
        fields = [
            'id', 'name', 'location', 'camera_id', 'resolution', 'resolution_display',
            'fps', 'ip_address', 'port', 'rtsp_url', 'status', 'status_color',
            'is_active', 'is_recording', 'recording_quality', 'motion_detection',
            'has_audio', 'has_ptz', 'ptz_pan', 'ptz_tilt', 'ptz_zoom',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_status_color(self, obj):
        return obj.get_status_color()


class CameraRecordingSerializer(serializers.ModelSerializer):
    """Serializer for CameraRecording model"""
    camera_name = serializers.CharField(source='camera.name', read_only=True)
    file_size_mb = serializers.SerializerMethodField()
    
    class Meta:
        model = CameraRecording
        fields = [
            'id', 'camera', 'camera_name', 'filename', 'file_path',
            'file_size', 'file_size_mb', 'duration', 'start_time', 'end_time',
            'triggered_by', 'has_motion', 'thumbnail', 'created_at'
        ]
    
    def get_file_size_mb(self, obj):
        return obj.get_file_size_mb()


class MotionEventSerializer(serializers.ModelSerializer):
    """Serializer for MotionEvent model"""
    camera_name = serializers.CharField(source='camera.name', read_only=True)
    acknowledged_by_name = serializers.CharField(source='acknowledged_by.username', read_only=True)
    
    class Meta:
        model = MotionEvent
        fields = [
            'id', 'camera', 'camera_name', 'triggered_at', 'snapshot',
            'motion_level', 'motion_area', 'is_acknowledged',
            'acknowledged_by', 'acknowledged_by_name', 'acknowledged_at'
        ]
        read_only_fields = ['triggered_at']


class CameraSnapshotSerializer(serializers.ModelSerializer):
    """Serializer for CameraSnapshot model"""
    camera_name = serializers.CharField(source='camera.name', read_only=True)
    captured_by_name = serializers.CharField(source='captured_by.username', read_only=True)
    
    class Meta:
        model = CameraSnapshot
        fields = [
            'id', 'camera', 'camera_name', 'image', 'captured_by',
            'captured_by_name', 'captured_at', 'notes'
        ]
        read_only_fields = ['captured_at']


class PTZControlSerializer(serializers.Serializer):
    """Serializer for PTZ control commands"""
    pan = serializers.IntegerField(min_value=-100, max_value=100, required=False)
    tilt = serializers.IntegerField(min_value=-100, max_value=100, required=False)
    zoom = serializers.IntegerField(min_value=0, max_value=100, required=False)
    direction = serializers.ChoiceField(
        choices=['left', 'right', 'up', 'down', 'stop'],
        required=False
    )


class CameraControlSerializer(serializers.Serializer):
    """Serializer for camera control commands"""
    action = serializers.ChoiceField(choices=[
        'start_recording', 'stop_recording', 'enable_motion',
        'disable_motion', 'take_snapshot'
    ])