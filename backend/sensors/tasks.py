"""
Background tasks for sensors app
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Sensor, SensorData, SensorStatistics, SensorAlert
from logs.models import ActivityLog

@shared_task
def cleanup_old_sensor_data(days=30):
    """Delete sensor data older than specified days"""
    cutoff_date = timezone.now() - timedelta(days=days)
    deleted_count = SensorData.objects.filter(timestamp__lt=cutoff_date).delete()[0]
    
    ActivityLog.objects.create(
        action_type='CLEANUP',
        description=f"Cleaned up {deleted_count} old sensor records"
    )
    
    return f"Deleted {deleted_count} old sensor records"


@shared_task
def calculate_sensor_statistics():
    """Calculate hourly statistics for sensors"""
    end_time = timezone.now()
    start_time = end_time - timedelta(hours=1)
    
    for sensor in Sensor.objects.filter(is_active=True):
        data = SensorData.objects.filter(
            sensor=sensor,
            timestamp__range=[start_time, end_time]
        )
        
        if data.exists():
            # Calculate statistics
            if sensor.sensor_type == 'temperature':
                values = [d.temperature for d in data if d.temperature]
            elif sensor.sensor_type == 'light':
                values = [d.light_level for d in data if d.light_level]
            elif sensor.sensor_type == 'ultrasonic':
                values = [d.distance for d in data if d.distance]
            else:
                continue
            
            if values:
                SensorStatistics.objects.create(
                    sensor=sensor,
                    period_start=start_time,
                    period_end=end_time,
                    period_type='hour',
                    avg_value=sum(values) / len(values),
                    min_value=min(values),
                    max_value=max(values),
                    reading_count=len(values),
                    alert_count=SensorAlert.objects.filter(
                        sensor=sensor,
                        created_at__range=[start_time, end_time]
                    ).count()
                )
    
    return "Statistics calculated"


@shared_task
def check_sensor_offline():
    """Check for sensors that haven't reported data"""
    threshold = timezone.now() - timedelta(minutes=30)
    
    offline_sensors = Sensor.objects.filter(
        is_active=True,
        last_read_time__lt=threshold
    )
    
    for sensor in offline_sensors:
        SensorAlert.objects.create(
            sensor=sensor,
            alert_type='sensor_offline',
            severity='warning',
            message=f"Sensor {sensor.name} has not reported data for over 30 minutes"
        )
        
        sensor.status = 'error'
        sensor.save()
    
    return f"Found {offline_sensors.count()} offline sensors"