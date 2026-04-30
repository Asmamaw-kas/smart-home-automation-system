"""
Utility functions
"""
import random
import string
from datetime import datetime, timedelta
from django.utils import timezone

def generate_random_string(length=10):
    """Generate random string"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def format_datetime(dt):
    """Format datetime for API response"""
    if dt:
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    return None

def parse_datetime(dt_str):
    """Parse datetime from string"""
    try:
        return datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
    except:
        return None

def get_time_range(period):
    """Get time range for different periods"""
    now = timezone.now()
    
    if period == 'today':
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end = now
    elif period == 'week':
        start = now - timedelta(days=7)
        end = now
    elif period == 'month':
        start = now - timedelta(days=30)
        end = now
    else:
        start = None
        end = None
    
    return start, end

def calculate_energy_usage(device, start_time, end_time):
    """Calculate energy usage for a device"""
    from logs.models import DeviceLog
    
    logs = DeviceLog.objects.filter(
        device=device,
        timestamp__range=[start_time, end_time],
        action__in=['ON', 'OFF']
    ).order_by('timestamp')
    
    total_seconds = 0
    last_on = None
    
    for log in logs:
        if log.action == 'ON':
            last_on = log.timestamp
        elif log.action == 'OFF' and last_on:
            duration = (log.timestamp - last_on).total_seconds()
            total_seconds += duration
            last_on = None
    
    # If device is still on
    if last_on:
        duration = (end_time - last_on).total_seconds()
        total_seconds += duration
    
    # Convert to hours and calculate energy (assuming 100W for demo)
    hours = total_seconds / 3600
    energy_kwh = hours * 0.1  # 100W = 0.1kW
    
    return {
        'hours': round(hours, 2),
        'energy_kwh': round(energy_kwh, 2)
    }