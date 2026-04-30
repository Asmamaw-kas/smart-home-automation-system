"""
Models for device management and control
"""
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
import json

User = get_user_model()

# Define Commands here since it's used in the models
class Commands:
    """Command constants for Arduino communication"""
    # Device commands
    LIGHT_ON = "LIGHT_ON"
    LIGHT_OFF = "LIGHT_OFF"
    FAN_ON = "FAN_ON"
    FAN_OFF = "FAN_OFF"
    DOOR_OPEN = "DOOR_OPEN"
    DOOR_CLOSE = "DOOR_CLOSE"
    DOOR_LOCK = "DOOR_LOCK"
    DOOR_UNLOCK = "DOOR_UNLOCK"
    
    # Automation commands
    ENABLE_AUTO = "AUTO_ON"
    DISABLE_AUTO = "AUTO_OFF"
    
    # Emergency
    EMERGENCY_LOCK = "EMERGENCY"
    
    # Settings
    SET_TEMP_THRESHOLD = "TEMP_THRESHOLD:{}"
    SET_LIGHT_THRESHOLD = "LIGHT_THRESHOLD:{}"
    
    # Request commands
    REQUEST_STATUS = "STATUS"
    REQUEST_SENSORS = "SENSORS"


class Device(models.Model):
    """Model for physical devices/actuators"""
    
    DEVICE_TYPES = [
        ('light', 'Light'),
        ('fan', 'Fan'),
        ('door', 'Door'),
        ('lock', 'Smart Lock'),
        ('ac', 'Air Conditioner'),
        ('tv', 'Television'),
        ('speaker', 'Smart Speaker'),
        ('curtain', 'Curtain'),
        ('pump', 'Water Pump'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('maintenance', 'Under Maintenance'),
        ('error', 'Error'),
    ]
    
    # Basic info
    name = models.CharField(max_length=100)
    device_type = models.CharField(max_length=20, choices=DEVICE_TYPES)
    room = models.CharField(max_length=100, blank=True, help_text="Room where device is located")
    
    # Hardware info
    pin_number = models.IntegerField(null=True, blank=True, help_text="Arduino/GPIO pin number")
    arduino_id = models.CharField(max_length=50, blank=True, help_text="Arduino board identifier")
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='offline')
    is_active = models.BooleanField(default=True)
    
    # Current state
    current_state = models.CharField(max_length=20, default='off')  # on/off/open/closed/locked/unlocked
    last_updated = models.DateTimeField(auto_now=True)
    
    # Device capabilities
    supports_dimming = models.BooleanField(default=False)
    supports_color = models.BooleanField(default=False)
    supports_speed = models.BooleanField(default=False)
    supports_temperature = models.BooleanField(default=False)
    
    # Device settings
    min_value = models.IntegerField(default=0)
    max_value = models.IntegerField(default=100)
    current_value = models.IntegerField(default=0, help_text="Current value (brightness/speed/etc)")
    
    # Power consumption
    power_rating = models.FloatField(null=True, blank=True, help_text="Power rating in watts")
    energy_today = models.FloatField(default=0, help_text="Energy used today in kWh")
    energy_total = models.FloatField(default=0, help_text="Total energy used in kWh")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Icon/image
    icon = models.CharField(max_length=50, default='default-device')
    
    class Meta:
        db_table = 'devices'
        ordering = ['room', 'name']
        indexes = [
            models.Index(fields=['device_type']),
            models.Index(fields=['room']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_device_type_display()})"
    
    def get_status_color(self):
        """Get color for status display"""
        colors = {
            'online': 'green',
            'offline': 'gray',
            'maintenance': 'orange',
            'error': 'red'
        }
        return colors.get(self.status, 'gray')
    
    def update_state(self, new_state, value=None):
        """Update device state"""
        self.current_state = new_state
        if value is not None:
            self.current_value = value
        self.last_updated = timezone.now()
        self.save(update_fields=['current_state', 'current_value', 'last_updated'])
        
        # Create status record
        DeviceStatus.objects.create(
            device=self,
            status=new_state,
            value=value
        )
        
        # Create log entry - using string import to avoid circular import
        from logs.models import DeviceLog
        DeviceLog.objects.create(
            device_id=self.id,
            device_name=self.name,
            device_type=self.device_type,
            action=new_state.upper(),
            triggered_by='system'
        )
    
    def toggle(self):
        """Toggle device on/off"""
        if self.current_state in ['on', 'open', 'unlocked']:
            new_state = 'off' if self.device_type in ['light', 'fan'] else 'closed' if self.device_type == 'door' else 'locked'
        else:
            new_state = 'on' if self.device_type in ['light', 'fan'] else 'open' if self.device_type == 'door' else 'unlocked'
        
        self.update_state(new_state)


class DeviceStatus(models.Model):
    """Model for tracking device status over time"""
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=20)
    value = models.IntegerField(null=True, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'device_status'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['device', '-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.device.name} - {self.status} - {self.timestamp}"


class AutomationRule(models.Model):
    """Model for automation rules"""
    
    CONDITION_TYPES = [
        ('time', 'Time Based'),
        ('temperature', 'Temperature'),
        ('humidity', 'Humidity'),
        ('light', 'Light Level'),
        ('motion', 'Motion Detected'),
        ('door', 'Door Status'),
        ('schedule', 'Schedule'),
        ('manual', 'Manual Trigger'),
    ]
    
    OPERATORS = [
        ('gt', 'Greater Than (>)'),
        ('lt', 'Less Than (<)'),
        ('eq', 'Equal To (=)'),
        ('gte', 'Greater Than or Equal (≥)'),
        ('lte', 'Less Than or Equal (≤)'),
        ('ne', 'Not Equal (≠)'),
        ('between', 'Between'),
    ]
    
    ACTION_TYPES = [
        ('device_on', 'Turn Device On'),
        ('device_off', 'Turn Device Off'),
        ('device_toggle', 'Toggle Device'),
        ('device_lock', 'Lock Device'),
        ('device_unlock', 'Unlock Device'),
        ('device_open', 'Open Device'),
        ('device_close', 'Close Device'),
        ('device_value', 'Set Device Value'),
        ('notification', 'Send Notification'),
        ('webhook', 'Call Webhook'),
        ('scene', 'Activate Scene'),
    ]
    
    WEEKDAYS = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]
    
    # Basic info
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    # Priority (for conflicting rules)
    priority = models.IntegerField(default=0, help_text="Higher priority rules execute first")
    
    # Condition
    condition_type = models.CharField(max_length=20, choices=CONDITION_TYPES)
    operator = models.CharField(max_length=10, choices=OPERATORS, blank=True)
    
    # Condition values
    sensor = models.ForeignKey('sensors.Sensor', on_delete=models.SET_NULL, null=True, blank=True)
    threshold_value = models.FloatField(null=True, blank=True)
    threshold_max = models.FloatField(null=True, blank=True)  # For between operator
    
    # Time-based conditions
    specific_time = models.TimeField(null=True, blank=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    days_of_week = models.JSONField(default=list, blank=True)  # Store list of weekday numbers
    
    # Action
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    target_device = models.ForeignKey(Device, on_delete=models.CASCADE, null=True, blank=True, related_name='automation_rules')
    action_value = models.CharField(max_length=100, blank=True, help_text="Value to set (for device_value action)")
    
    # Additional actions (JSON for complex rules)
    additional_actions = models.JSONField(default=list, blank=True)
    
    # Cooldown (prevent spamming)
    cooldown_minutes = models.IntegerField(default=0)
    last_triggered = models.DateTimeField(null=True, blank=True)
    
    # Trigger count
    trigger_count = models.IntegerField(default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        db_table = 'automation_rules'
        ordering = ['-priority', 'name']
    
    def __str__(self):
        return self.name
    
    def can_trigger(self):
        """Check if rule can be triggered (cooldown)"""
        if not self.is_active:
            return False
        
        if self.cooldown_minutes > 0 and self.last_triggered:
            cooldown_end = self.last_triggered + timezone.timedelta(minutes=self.cooldown_minutes)
            if timezone.now() < cooldown_end:
                return False
        
        return True
    
    def check_condition(self, context=None):
        """Check if condition is met"""
        if not self.is_active:
            return False
        
        context = context or {}
        
        if self.condition_type == 'time':
            return self._check_time_condition()
        
        elif self.condition_type == 'temperature':
            value = context.get('temperature') or self._get_sensor_value('temperature')
            return self._compare_value(value)
        
        elif self.condition_type == 'light':
            value = context.get('light_level') or self._get_sensor_value('light')
            return self._compare_value(value)
        
        elif self.condition_type == 'motion':
            value = context.get('motion_detected') or self._get_sensor_value('motion')
            return bool(value)
        
        elif self.condition_type == 'schedule':
            return self._check_schedule()
        
        return False
    
    def _check_time_condition(self):
        """Check time-based condition"""
        now = timezone.now()
        
        if self.specific_time:
            # Check specific time (within 1 minute window)
            target_time = now.replace(
                hour=self.specific_time.hour,
                minute=self.specific_time.minute,
                second=0,
                microsecond=0
            )
            time_diff = abs((now - target_time).total_seconds())
            return time_diff < 60
        
        if self.start_time and self.end_time:
            current_time = now.time()
            return self.start_time <= current_time <= self.end_time
        
        return False
    
    def _check_schedule(self):
        """Check schedule condition"""
        now = timezone.now()
        
        # Check day of week
        if self.days_of_week:
            current_weekday = now.weekday()
            if current_weekday not in self.days_of_week:
                return False
        
        # Check time range
        if self.start_time and self.end_time:
            current_time = now.time()
            return self.start_time <= current_time <= self.end_time
        
        return True
    
    def _compare_value(self, value):
        """Compare value using operator"""
        if value is None:
            return False
        
        if self.operator == 'gt':
            return value > self.threshold_value
        elif self.operator == 'lt':
            return value < self.threshold_value
        elif self.operator == 'eq':
            return value == self.threshold_value
        elif self.operator == 'gte':
            return value >= self.threshold_value
        elif self.operator == 'lte':
            return value <= self.threshold_value
        elif self.operator == 'ne':
            return value != self.threshold_value
        elif self.operator == 'between':
            return self.threshold_value <= value <= self.threshold_max
        
        return False
    
    def _get_sensor_value(self, sensor_type):
        """Get latest value from sensor"""
        try:
            from sensors.models import SensorData
            latest = SensorData.objects.filter(
                sensor__sensor_type=sensor_type
            ).latest('timestamp')
            
            if sensor_type == 'temperature':
                return latest.temperature
            elif sensor_type == 'light':
                return latest.light_level
            elif sensor_type == 'motion':
                return latest.motion_detected
        except:
            pass
        return None
    
    def execute_action(self, triggered_by='automation'):
        """Execute the rule action"""
        if not self.can_trigger():
            return False
        
        # Import here to avoid circular imports
        from core.serial_handler import SerialHandler
        
        handler = SerialHandler()
        
        success = False
        
        # Map action to command
        if self.action_type == 'device_on':
            command = self._get_device_command('on')
            if command:
                success = handler.send_command(command)
        elif self.action_type == 'device_off':
            command = self._get_device_command('off')
            if command:
                success = handler.send_command(command)
        elif self.action_type == 'device_toggle':
            if self.target_device:
                command = f"TOGGLE:{self.target_device.pin_number}"
                success = handler.send_command(command)
        elif self.action_type == 'device_lock':
            command = Commands.DOOR_LOCK
            success = handler.send_command(command)
        elif self.action_type == 'device_unlock':
            command = Commands.DOOR_UNLOCK
            success = handler.send_command(command)
        elif self.action_type == 'device_open':
            command = Commands.DOOR_OPEN
            success = handler.send_command(command)
        elif self.action_type == 'device_close':
            command = Commands.DOOR_CLOSE
            success = handler.send_command(command)
        elif self.action_type == 'device_value' and self.action_value:
            # For dimming, speed control, etc.
            if self.target_device:
                if self.target_device.device_type == 'light':
                    command = f"LIGHT_VALUE:{self.action_value}"
                elif self.target_device.device_type == 'fan':
                    command = f"FAN_SPEED:{self.action_value}"
                else:
                    command = f"DEVICE_VALUE:{self.target_device.id}:{self.action_value}"
                success = handler.send_command(command)
        
        if success:
            # Update last triggered
            self.last_triggered = timezone.now()
            self.trigger_count += 1
            self.save(update_fields=['last_triggered', 'trigger_count'])
            
            # Update device state if target device exists
            if self.target_device:
                if self.action_type == 'device_on':
                    self.target_device.update_state('on')
                elif self.action_type == 'device_off':
                    self.target_device.update_state('off')
                elif self.action_type == 'device_lock':
                    self.target_device.update_state('locked')
                elif self.action_type == 'device_unlock':
                    self.target_device.update_state('unlocked')
                elif self.action_type == 'device_open':
                    self.target_device.update_state('open')
                elif self.action_type == 'device_close':
                    self.target_device.update_state('closed')
            
            # Log the automation trigger - import here to avoid circular imports
            from logs.models import ActivityLog
            ActivityLog.objects.create(
                action_type='AUTO_TRIGGERED',
                description=f"Automation rule '{self.name}' triggered",
                extra_data={
                    'rule_id': self.id,
                    'action': self.action_type,
                    'device': self.target_device.name if self.target_device else None
                }
            )
            
            # Execute additional actions if any
            for action in self.additional_actions:
                self._execute_additional_action(action)
        
        return success
    
    def _get_device_command(self, action):
        """Get device-specific command"""
        if not self.target_device:
            return None
        
        device_type = self.target_device.device_type
        
        command_map = {
            ('light', 'on'): Commands.LIGHT_ON,
            ('light', 'off'): Commands.LIGHT_OFF,
            ('fan', 'on'): Commands.FAN_ON,
            ('fan', 'off'): Commands.FAN_OFF,
            ('door', 'on'): Commands.DOOR_OPEN,
            ('door', 'off'): Commands.DOOR_CLOSE,
        }
        
        return command_map.get((device_type, action))
    
    def _execute_additional_action(self, action):
        """Execute additional action"""
        # TODO: Implement additional actions (notifications, webhooks, etc.)
        pass


class Scene(models.Model):
    """Model for scenes (group of device states)"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default='scene')
    
    # Scene devices states (JSON)
    device_states = models.JSONField(default=dict, help_text="Dictionary of device_id: state")
    
    # Schedule
    is_scheduled = models.BooleanField(default=False)
    schedule_time = models.TimeField(null=True, blank=True)
    schedule_days = models.JSONField(default=list, blank=True)
    
    # Metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        db_table = 'scenes'
    
    def __str__(self):
        return self.name
    
    def activate(self, triggered_by='manual'):
        """Activate the scene"""
        from core.serial_handler import SerialHandler
        handler = SerialHandler()
        
        success_count = 0
        for device_id, state in self.device_states.items():
            try:
                device = Device.objects.get(id=device_id)
                command = self._get_scene_command(device, state)
                if command and handler.send_command(command):
                    success_count += 1
                    
                    # Update device state
                    device.update_state(state)
            except Device.DoesNotExist:
                continue
        
        # Log scene activation
        from logs.models import ActivityLog
        ActivityLog.objects.create(
            action_type='SCENE_ACTIVATE',
            description=f"Scene '{self.name}' activated",
            extra_data={
                'scene_id': self.id,
                'devices_controlled': success_count,
                'triggered_by': triggered_by
            }
        )
        
        return success_count
    
    def _get_scene_command(self, device, state):
        """Get command for scene device state"""
        command_map = {
            'on': Commands.LIGHT_ON if device.device_type == 'light' else Commands.FAN_ON,
            'off': Commands.LIGHT_OFF if device.device_type == 'light' else Commands.FAN_OFF,
            'open': Commands.DOOR_OPEN,
            'close': Commands.DOOR_CLOSE,
            'lock': Commands.DOOR_LOCK,
            'unlock': Commands.DOOR_UNLOCK,
        }
        return command_map.get(state)


class Schedule(models.Model):
    """Model for scheduled device actions"""
    name = models.CharField(max_length=100)
    device = models.ForeignKey(Device, on_delete=models.CASCADE)
    
    # Schedule time
    time = models.TimeField()
    days = models.JSONField(default=list, help_text="List of weekday numbers (0-6)")
    
    # Action
    action = models.CharField(max_length=20)  # on/off/open/close/lock/unlock
    value = models.IntegerField(null=True, blank=True)  # For dimming/speed
    
    # Active until date (optional)
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField(null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    last_run = models.DateTimeField(null=True, blank=True)
    next_run = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'schedules'
    
    def __str__(self):
        return f"{self.name} - {self.time}"
    
    def should_run_today(self):
        """Check if schedule should run today"""
        today = timezone.now().weekday()
        
        # Check if today is in days list
        if self.days and today not in self.days:
            return False
        
        # Check date range
        today_date = timezone.now().date()
        if self.end_date and today_date > self.end_date:
            return False
        if today_date < self.start_date:
            return False
        
        return True
    
    def calculate_next_run(self):
        """Calculate the next run time for this schedule"""
        now = timezone.now()
        today = now.date()
        
        # Try each day in the next 7 days
        for days_ahead in range(8):
            check_date = today + timezone.timedelta(days=days_ahead)
            weekday = check_date.weekday()
            
            # Check if this weekday is in our schedule
            if not self.days or weekday in self.days:
                # Create datetime for this date at schedule time
                run_time = timezone.make_aware(
                    timezone.datetime.combine(check_date, self.time)
                )
                
                # If it's in the future, this is our next run
                if run_time > now:
                    self.next_run = run_time
                    self.save(update_fields=['next_run'])
                    return run_time
        
        return None


class DeviceGroup(models.Model):
    """Model for grouping devices"""
    name = models.CharField(max_length=100)
    devices = models.ManyToManyField(Device, related_name='groups')
    room = models.CharField(max_length=100, blank=True)
    
    class Meta:
        db_table = 'device_groups'
    
    def __str__(self):
        return self.name
    
    def control_all(self, action, value=None):
        """Control all devices in group"""
        from core.serial_handler import SerialHandler
        handler = SerialHandler()
        
        success_count = 0
        for device in self.devices.filter(is_active=True):
            command = self._get_group_command(device, action, value)
            if command and handler.send_command(command):
                success_count += 1
                device.update_state(action, value)
        
        return success_count
    
    def _get_group_command(self, device, action, value):
        """Get command for group device"""
        if action in ['on', 'off']:
            if device.device_type == 'light':
                return Commands.LIGHT_ON if action == 'on' else Commands.LIGHT_OFF
            elif device.device_type == 'fan':
                return Commands.FAN_ON if action == 'on' else Commands.FAN_OFF
        elif action in ['open', 'close']:
            return Commands.DOOR_OPEN if action == 'open' else Commands.DOOR_CLOSE
        elif action in ['lock', 'unlock']:
            return Commands.DOOR_LOCK if action == 'lock' else Commands.DOOR_UNLOCK
        return None


class EnergyMonitoring(models.Model):
    """Model for energy monitoring of devices"""
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='energy_readings')
    power = models.FloatField(help_text="Current power in watts")
    voltage = models.FloatField(null=True, blank=True)
    current = models.FloatField(null=True, blank=True)
    energy = models.FloatField(help_text="Energy in kWh")
    timestamp = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'energy_monitoring'
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.device.name} - {self.power}W - {self.timestamp}"