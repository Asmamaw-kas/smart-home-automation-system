"""
Thread-safe camera service for webcam access
"""
import cv2
import threading
import time
from datetime import datetime
import os
import base64
import logging

logger = logging.getLogger(__name__)


class CameraService:
    """Thread-safe singleton camera service"""

    _instance = None
    _init_lock = threading.Lock()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            with cls._init_lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    def __init__(self):
        self.cap = None
        self.is_running = False
        self.frame = None
        self.recording = False
        self.video_writer = None
        self.recording_path = None
        self.frame_count = 0
        self.camera_id = 0

        self._frame_lock = threading.Lock()
        self._client_count = 0
        self._client_lock = threading.Lock()
        self._thread = None
        self._start_stop_lock = threading.Lock()

    def start(self, camera_id=0):
        """Start the camera capture"""
        with self._start_stop_lock:
            if self.is_running:
                logger.info("Camera already running")
                return True

            self.camera_id = camera_id

            try:
                if os.name == 'nt':
                    self.cap = cv2.VideoCapture(int(self.camera_id), cv2.CAP_DSHOW)
                else:
                    self.cap = cv2.VideoCapture(int(self.camera_id))
            except Exception:
                self.cap = cv2.VideoCapture(self.camera_id)

            if not self.cap or not self.cap.isOpened():
                logger.error(f"Failed to open camera {camera_id}")
                self.cap = None
                return False

            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.cap.set(cv2.CAP_PROP_FPS, 20)

            # warm-up
            for _ in range(5):
                self.cap.read()
                time.sleep(0.05)

            self.is_running = True
            self._thread = threading.Thread(target=self._capture_loop, daemon=True)
            self._thread.start()

            logger.info(f"Camera {camera_id} started successfully")
            return True

    def stop(self):
        """Stop the camera capture"""
        with self._start_stop_lock:
            self.is_running = False

            if self.recording:
                self.stop_recording()

            if self._thread:
                self._thread.join(timeout=2)
                self._thread = None

            if self.cap:
                self.cap.release()
                self.cap = None

            with self._frame_lock:
                self.frame = None

            logger.info("Camera stopped")

    def _capture_loop(self):
        """Continuous capture loop in background thread"""
        while self.is_running:
            try:
                if self.cap and self.cap.isOpened():
                    ret, frame = self.cap.read()
                    if ret and frame is not None:
                        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                        cv2.putText(
                            frame, timestamp, (10, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2
                        )

                        with self._frame_lock:
                            self.frame = frame.copy()
                            self.frame_count += 1

                        if self.recording and self.video_writer:
                            self.video_writer.write(frame)
                    else:
                        logger.warning("Failed to read frame from camera")
                        time.sleep(0.1)
                else:
                    logger.warning("Camera capture not opened")
                    time.sleep(0.2)

            except Exception as e:
                logger.error(f"Camera capture loop error: {e}")
                time.sleep(0.2)

            time.sleep(0.03)

    def get_raw_frame(self):
        """Get current raw frame safely"""
        with self._frame_lock:
            if self.frame is None:
                return None
            return self.frame.copy()

    def get_frame(self):
        """Get current frame as JPEG bytes"""
        frame = self.get_raw_frame()
        if frame is None:
            return None

        ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 75])
        if ret:
            return buffer.tobytes()
        return None

    def get_frame_base64(self):
        frame_bytes = self.get_frame()
        if frame_bytes:
            return base64.b64encode(frame_bytes).decode('utf-8')
        return None

    def add_client(self, camera_id=0):
        with self._client_lock:
            self._client_count += 1
            logger.info(f"Camera client added. Total: {self._client_count}")
            if self._client_count == 1:
                self.start(camera_id)

    def remove_client(self):
        with self._client_lock:
            self._client_count -= 1
            if self._client_count < 0:
                self._client_count = 0
            logger.info(f"Camera client removed. Total: {self._client_count}")
            if self._client_count == 0:
                self.stop()

    def start_recording(self):
        """Start video recording using already captured frames"""
        if self.recording:
            return False

        frame = self.get_raw_frame()
        if frame is None:
            return False

        height, width = frame.shape[:2]

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"recording_{timestamp}.mp4"
        filepath = os.path.join('media', 'camera_recordings', filename)
        os.makedirs(os.path.dirname(filepath), exist_ok=True)

        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        self.video_writer = cv2.VideoWriter(filepath, fourcc, 20.0, (width, height))

        self.recording = True
        self.recording_path = filepath

        logger.info(f"Recording started: {filepath}")
        return True

    def stop_recording(self):
        if not self.recording:
            return None

        self.recording = False
        if self.video_writer:
            self.video_writer.release()
            self.video_writer = None

        filepath = self.recording_path
        self.recording_path = None

        logger.info(f"Recording stopped: {filepath}")
        return filepath

    def take_snapshot(self):
        frame = self.get_raw_frame()
        if frame is None:
            return None

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"snapshot_{timestamp}.jpg"
        filepath = os.path.join('media', 'camera_snapshots', filename)
        os.makedirs(os.path.dirname(filepath), exist_ok=True)

        cv2.imwrite(filepath, frame)
        return filepath


def get_camera():
    return CameraService.get_instance()


def start_camera(camera_id=0):
    camera = get_camera()
    return camera.start(camera_id)


def stop_camera():
    camera = get_camera()
    camera.stop()