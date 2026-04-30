"""
Models for sensor data management
"""
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()

class Sensor(models.Model):
    """Model for physical sensors"""
    SENSOR_TYPES = [
        ('temperature', 'Temperature Sensor'),
        ('humidity', 'Humidity Sensor'),
        ('light', 'Light Sensor (LDR)'),
        ('ultrasonic', 'Ultrasonic Sensor'),
        ('motion', 'Motion Sensor'),
        ('gas', 'Gas Sensor'),
        ('smoke', 'Smoke Sensor'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('maintenance', 'Under Maintenance'),
        ('error', 'Error'),
    ]
    
    name = models.CharField(max_length=100)
    sensor_type = models.CharField(max_length=20, choices=SENSOR_TYPES)
    location = models.CharField(max_length=100, help_text="Where is the sensor installed?")
    
    # Hardware info
    pin_number = models.IntegerField(null=True, blank=True, help_text="Arduino pin number")
    unit = models.CharField(max_length=10, blank=True, help_text="Measurement unit (e.g., °C, %, cm)")
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='inactive')
    is_active = models.BooleanField(default=True)
    
    # Calibration
    calibration_value = models.FloatField(default=0.0, help_text="Calibration offset")
    min_value = models.FloatField(null=True, blank=True)
    max_value = models.FloatField(null=True, blank=True)
    
    # Metadata
    last_reading = models.FloatField(null=True, blank=True)
    last_read_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'sensors'
        ordering = ['sensor_type', 'location']
    
    def __str__(self):
        return f"{self.name} ({self.get_sensor_type_display()})"
    
    def update_reading(self, value):
        """Update last reading"""
        self.last_reading = value
        self.last_read_time = timezone.now()
        self.save(update_fields=['last_reading', 'last_read_time'])
    
    def get_status_display_color(self):
        """Get color for status display"""
        colors = {
            'active': 'green',
            'inactive': 'gray',
            'maintenance': 'orange',
            'error': 'red'
        }
        return colors.get(self.status, 'gray')


class SensorData(models.Model):
    """Model for sensor readings"""
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name='readings')
    
    # Readings
    temperature = models.FloatField(null=True, blank=True)
    humidity = models.FloatField(null=True, blank=True)
    light_level = models.IntegerField(null=True, blank=True, help_text="LDR value (0-1023)")
    distance = models.FloatField(null=True, blank=True, help_text="Distance in cm")
    motion_detected = models.BooleanField(default=False)
    
    # Additional readings
    raw_value = models.FloatField(null=True, blank=True)
    calibrated_value = models.FloatField(null=True, blank=True)
    
    # Metadata
    timestamp = models.DateTimeField(default=timezone.now)
    battery_level = models.FloatField(null=True, blank=True)
    signal_strength = models.IntegerField(null=True, blank=True)
    
    class Meta:
        db_table = 'sensor_data'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['sensor', '-timestamp']),
            models.Index(fields=['timestamp']),
        ]
    
    def __str__(self):
        return f"{self.sensor.name} - {self.timestamp}"
    
    def save(self, *args, **kwargs):
        """Override save to update sensor's last reading"""
        super().save(*args, **kwargs)
        
        # Update sensor's last reading
        if self.temperature is not None:
            self.sensor.update_reading(self.temperature)
        elif self.light_level is not None:
            self.sensor.update_reading(self.light_level)
        elif self.distance is not None:
            self.sensor.update_reading(self.distance)


class SensorAlert(models.Model):
    """Model for sensor alerts and thresholds"""
    ALERT_TYPES = [
        ('threshold_exceeded', 'Threshold Exceeded'),
        ('threshold_below', 'Threshold Below'),
        ('sensor_error', 'Sensor Error'),
        ('sensor_offline', 'Sensor Offline'),
        ('battery_low', 'Battery Low'),
    ]
    
    SEVERITY_LEVELS = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
    ]
    
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    severity = models.CharField(max_length=10, choices=SEVERITY_LEVELS, default='warning')
    
    # Alert details
    message = models.TextField()
    value = models.FloatField(null=True, blank=True)
    threshold = models.FloatField(null=True, blank=True)
    
    # Status
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'sensor_alerts'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.sensor.name} - {self.alert_type}"
    
    def acknowledge(self, user=None):
        """Acknowledge alert"""
        self.acknowledged_at = timezone.now()
        self.save()
    
    def resolve(self, user=None):
        """Resolve alert"""
        self.is_resolved = True
        self.resolved_at = timezone.now()
        self.resolved_by = user
        self.save()


class SensorThreshold(models.Model):
    """Model for sensor thresholds and automation rules"""
    CONDITION_TYPES = [
        ('gt', 'Greater Than'),
        ('lt', 'Less Than'),
        ('eq', 'Equal To'),
        ('between', 'Between'),
    ]
    
    ACTION_TYPES = [
        ('alert', 'Send Alert'),
        ('email', 'Send Email'),
        ('sms', 'Send SMS'),
        ('webhook', 'Call Webhook'),
        ('device_action', 'Control Device'),
    ]
    
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name='thresholds')
    name = models.CharField(max_length=100)
    
    # Threshold condition
    condition_type = models.CharField(max_length=10, choices=CONDITION_TYPES)
    min_value = models.FloatField(null=True, blank=True)
    max_value = models.FloatField(null=True, blank=True)
    
    # Action to take
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    action_config = models.JSONField(default=dict, help_text="Configuration for the action")
    
    # Schedule (optional)
    is_time_restricted = models.BooleanField(default=False)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    cooldown_minutes = models.IntegerField(default=5, help_text="Minutes between alerts")
    last_triggered = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'sensor_thresholds'
    
    def __str__(self):
        return f"{self.sensor.name} - {self.name}"
    
    def should_trigger(self, value):
        """Check if threshold should trigger based on value"""
        now = timezone.now()
        
        # Check cooldown
        if self.last_triggered:
            cooldown_end = self.last_triggered + timezone.timedelta(minutes=self.cooldown_minutes)
            if now < cooldown_end:
                return False
        
        # Check time restrictions
        if self.is_time_restricted and self.start_time and self.end_time:
            current_time = now.time()
            if not (self.start_time <= current_time <= self.end_time):
                return False
        
        # Check condition
        if self.condition_type == 'gt':
            return value > self.min_value
        elif self.condition_type == 'lt':
            return value < self.min_value
        elif self.condition_type == 'eq':
            return value == self.min_value
        elif self.condition_type == 'between':
            return self.min_value <= value <= self.max_value
        
        return False


class SensorStatistics(models.Model):
    """Model for aggregated sensor statistics"""
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name='statistics')
    
    # Time period
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    period_type = models.CharField(max_length=10, choices=[
        ('hour', 'Hourly'),
        ('day', 'Daily'),
        ('week', 'Weekly'),
        ('month', 'Monthly'),
    ])
    
    # Statistics
    avg_value = models.FloatField(null=True, blank=True)
    min_value = models.FloatField(null=True, blank=True)
    max_value = models.FloatField(null=True, blank=True)
    median_value = models.FloatField(null=True, blank=True)
    std_deviation = models.FloatField(null=True, blank=True)
    
    # Counts
    reading_count = models.IntegerField(default=0)
    alert_count = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'sensor_statistics'
        unique_together = ['sensor', 'period_start', 'period_type']
    
    def __str__(self):
        return f"{self.sensor.name} - {self.period_type} stats"


class SensorCalibration(models.Model):
    """Model for sensor calibration history"""
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name='calibrations')
    
    # Calibration values
    old_offset = models.FloatField()
    new_offset = models.FloatField()
    calibration_point = models.FloatField(help_text="Reference value used for calibration")
    measured_value = models.FloatField(help_text="Actual measured value")
    
    # Metadata
    calibrated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'sensor_calibrations'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.sensor.name} calibration - {self.created_at}"