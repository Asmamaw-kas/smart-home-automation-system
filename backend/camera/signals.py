"""
Signals for camera app
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import MotionEvent, CameraRecording
from logs.models import ActivityLog

@receiver(post_save, sender=MotionEvent)
def log_motion_event(sender, instance, created, **kwargs):
    """Log motion events"""
    if created:
        ActivityLog.objects.create(
            action_type='SENSOR_ALERT',
            severity='warning',
            description=f"Motion detected on {instance.camera.name} (Level: {instance.motion_level})",
            extra_data={
                'camera_id': instance.camera.id,
                'motion_level': instance.motion_level
            }
        )

@receiver(post_save, sender=CameraRecording)
def log_recording(sender, instance, created, **kwargs):
    """Log camera recordings"""
    if created:
        ActivityLog.objects.create(
            action_type='DEVICE_ON',
            description=f"Recording saved from {instance.camera.name} - Duration: {instance.duration}s",
            extra_data={
                'camera_id': instance.camera.id,
                'duration': instance.duration,
                'file_size': instance.file_size
            }
        )