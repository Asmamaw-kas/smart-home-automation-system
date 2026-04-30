"""
Signals for sensors app
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SensorData, SensorAlert
from logs.models import ActivityLog

@receiver(post_save, sender=SensorData)
def log_sensor_data(sender, instance, created, **kwargs):
    """Log when sensor data is created"""
    if created:
        ActivityLog.objects.create(
            action_type='SENSOR_READING',
            description=f"New reading from {instance.sensor.name}: {instance.get_value_display()}",
        )

@receiver(post_save, sender=SensorAlert)
def log_sensor_alert(sender, instance, created, **kwargs):
    """Log when sensor alert is created"""
    if created:
        ActivityLog.objects.create(
            action_type='SENSOR_ALERT',
            description=f"Alert: {instance.message}",
        )