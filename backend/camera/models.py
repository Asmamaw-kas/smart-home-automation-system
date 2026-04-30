"""
Models for camera and video streaming
"""
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()

class Camera(models.Model):
    """Model for camera devices"""
    
    STATUS_CHOICES = [
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('recording', 'Recording'),
        ('error', 'Error'),
    ]
    
    RESOLUTION_CHOICES = [
        ('640x480', '640x480'),
        ('1280x720', '1280x720 (HD)'),
        ('1920x1080', '1920x1080 (Full HD)'),
    ]
    
    # Basic info
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100, help_text="Where is the camera installed?")
    
    # Camera settings
    camera_id = models.IntegerField(default=0, help_text="Camera device ID (0 for default)")
    resolution = models.CharField(max_length=20, choices=RESOLUTION_CHOICES, default='640x480')
    fps = models.IntegerField(default=30, help_text="Frames per second")
    
    # Network settings
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    port = models.IntegerField(default=8080)
    rtsp_url = models.URLField(blank=True, help_text="RTSP URL for IP cameras")
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='offline')
    is_active = models.BooleanField(default=True)
    
    # Recording settings
    is_recording = models.BooleanField(default=False)
    recording_quality = models.IntegerField(default=80, help_text="Recording quality (1-100)")
    motion_detection = models.BooleanField(default=False)
    
    # Features
    has_audio = models.BooleanField(default=False)
    has_ptz = models.BooleanField(default=False, help_text="Pan-Tilt-Zoom support")
    
    # PTZ settings (if supported)
    ptz_pan = models.IntegerField(default=0)
    ptz_tilt = models.IntegerField(default=0)
    ptz_zoom = models.IntegerField(default=100)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cameras'
        ordering = ['location', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.location})"
    
    def get_status_color(self):
        colors = {
            'online': 'green',
            'offline': 'gray',
            'recording': 'red',
            'error': 'orange',
        }
        return colors.get(self.status, 'gray')


class CameraRecording(models.Model):
    """Model for camera recordings"""
    
    camera = models.ForeignKey(Camera, on_delete=models.CASCADE, related_name='recordings')
    
    # Recording info
    filename = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField(default=0, help_text="File size in bytes")
    duration = models.IntegerField(default=0, help_text="Duration in seconds")
    
    # Timestamps
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    
    # Metadata
    triggered_by = models.CharField(max_length=50, choices=[
        ('manual', 'Manual'),
        ('motion', 'Motion Detection'),
        ('schedule', 'Schedule'),
        ('alert', 'Security Alert'),
    ], default='manual')
    
    has_motion = models.BooleanField(default=False)
    thumbnail = models.ImageField(upload_to='camera_thumbnails/', null=True, blank=True)
    
    # Created at
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'camera_recordings'
        ordering = ['-start_time']
    
    def __str__(self):
        return f"{self.camera.name} - {self.start_time}"
    
    def get_file_size_mb(self):
        return round(self.file_size / (1024 * 1024), 2)


class MotionEvent(models.Model):
    """Model for motion detection events"""
    
    camera = models.ForeignKey(Camera, on_delete=models.CASCADE, related_name='motion_events')
    
    # Event info
    triggered_at = models.DateTimeField(auto_now_add=True)
    snapshot = models.ImageField(upload_to='motion_snapshots/', null=True, blank=True)
    
    # Motion details
    motion_level = models.IntegerField(help_text="Motion intensity (0-100)")
    motion_area = models.TextField(blank=True, help_text="JSON of motion area coordinates")
    
    # Status
    is_acknowledged = models.BooleanField(default=False)
    acknowledged_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'motion_events'
        ordering = ['-triggered_at']
    
    def __str__(self):
        return f"Motion at {self.camera.name} - {self.triggered_at}"
    
    def acknowledge(self, user):
        self.is_acknowledged = True
        self.acknowledged_by = user
        self.acknowledged_at = timezone.now()
        self.save()


class CameraSnapshot(models.Model):
    """Model for manual snapshots"""
    
    camera = models.ForeignKey(Camera, on_delete=models.CASCADE, related_name='snapshots')
    image = models.ImageField(upload_to='camera_snapshots/')
    captured_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    captured_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'camera_snapshots'
        ordering = ['-captured_at']
    
    def __str__(self):
        return f"Snapshot from {self.camera.name} - {self.captured_at}"