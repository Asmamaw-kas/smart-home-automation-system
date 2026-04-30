"""
Serializers for devices app
"""
from rest_framework import serializers
from django.utils import timezone
from .models import (
    Device, DeviceStatus, AutomationRule, 
    Scene, Schedule, DeviceGroup, EnergyMonitoring
)

class DeviceSerializer(serializers.ModelSerializer):
    """Serializer for Device model"""
    status_color = serializers.SerializerMethodField()
    device_type_display = serializers.CharField(source='get_device_type_display', read_only=True)
    
    class Meta:
        model = Device
        fields = [
            'id', 'name', 'device_type', 'device_type_display', 'room',
            'pin_number', 'arduino_id',
            'status', 'status_color', 'is_active',
            'current_state', 'last_updated',
            'supports_dimming', 'supports_color', 'supports_speed', 'supports_temperature',
            'min_value', 'max_value', 'current_value',
            'power_rating', 'energy_today', 'energy_total',
            'icon', 'created_at'
        ]
        read_only_fields = ['last_updated', 'created_at', 'energy_today', 'energy_total']
    
    def get_status_color(self, obj):
        return obj.get_status_color()


class DeviceStatusSerializer(serializers.ModelSerializer):
    """Serializer for DeviceStatus model"""
    device_name = serializers.CharField(source='device.name', read_only=True)
    
    class Meta:
        model = DeviceStatus
        fields = ['id', 'device', 'device_name', 'status', 'value', 'timestamp']


class AutomationRuleSerializer(serializers.ModelSerializer):
    """Serializer for AutomationRule model"""
    condition_type_display = serializers.CharField(source='get_condition_type_display', read_only=True)
    operator_display = serializers.CharField(source='get_operator_display', read_only=True)
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)
    target_device_name = serializers.CharField(source='target_device.name', read_only=True)
    sensor_name = serializers.CharField(source='sensor.name', read_only=True)
    days_display = serializers.SerializerMethodField()
    
    class Meta:
        model = AutomationRule
        fields = [
            'id', 'name', 'description', 'is_active', 'priority',
            'condition_type', 'condition_type_display',
            'operator', 'operator_display',
            'sensor', 'sensor_name',
            'threshold_value', 'threshold_max',
            'specific_time', 'start_time', 'end_time',
            'days_of_week', 'days_display',
            'action_type', 'action_type_display',
            'target_device', 'target_device_name',
            'action_value', 'additional_actions',
            'cooldown_minutes', 'last_triggered', 'trigger_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['last_triggered', 'trigger_count', 'created_at', 'updated_at']
    
    def get_days_display(self, obj):
        """Convert days of week numbers to names"""
        if not obj.days_of_week:
            return 'Every day'
        
        day_names = {
            0: 'Mon', 1: 'Tue', 2: 'Wed', 3: 'Thu',
            4: 'Fri', 5: 'Sat', 6: 'Sun'
        }
        
        if len(obj.days_of_week) == 7:
            return 'Every day'
        
        return ', '.join(day_names.get(d, '') for d in sorted(obj.days_of_week))


class SceneSerializer(serializers.ModelSerializer):
    """Serializer for Scene model"""
    device_states_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Scene
        fields = [
            'id', 'name', 'description', 'icon',
            'device_states', 'device_states_display',
            'is_scheduled', 'schedule_time', 'schedule_days',
            'is_active', 'created_at'
        ]
    
    def get_device_states_display(self, obj):
        """Get human-readable device states"""
        from devices.models import Device
        display = {}
        
        for device_id, state in obj.device_states.items():
            try:
                device = Device.objects.get(id=device_id)
                display[device.name] = state
            except Device.DoesNotExist:
                display[f"Unknown ({device_id})"] = state
        
        return display
    
    def validate_device_states(self, value):
        """Validate device states"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Device states must be a dictionary")
        
        # Check if devices exist
        from devices.models import Device
        for device_id in value.keys():
            try:
                Device.objects.get(id=device_id)
            except Device.DoesNotExist:
                raise serializers.ValidationError(f"Device with id {device_id} does not exist")
        
        return value


class ScheduleSerializer(serializers.ModelSerializer):
    """Serializer for Schedule model"""
    device_name = serializers.CharField(source='device.name', read_only=True)
    days_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Schedule
        fields = [
            'id', 'name', 'device', 'device_name',
            'time', 'days', 'days_display',
            'action', 'value',
            'start_date', 'end_date',
            'is_active', 'last_run', 'next_run'
        ]
        read_only_fields = ['last_run', 'next_run']
    
    def get_days_display(self, obj):
        """Convert days of week numbers to names"""
        if not obj.days:
            return 'Every day'
        
        day_names = {
            0: 'Monday', 1: 'Tuesday', 2: 'Wednesday',
            3: 'Thursday', 4: 'Friday', 5: 'Saturday', 6: 'Sunday'
        }
        
        if len(obj.days) == 7:
            return 'Every day'
        
        return ', '.join(day_names.get(d, '') for d in sorted(obj.days))


class DeviceGroupSerializer(serializers.ModelSerializer):
    """Serializer for DeviceGroup model"""
    devices_count = serializers.IntegerField(source='devices.count', read_only=True)
    devices_list = DeviceSerializer(source='devices', many=True, read_only=True)
    
    class Meta:
        model = DeviceGroup
        fields = ['id', 'name', 'room', 'devices', 'devices_count', 'devices_list']


class EnergyMonitoringSerializer(serializers.ModelSerializer):
    """Serializer for EnergyMonitoring model"""
    device_name = serializers.CharField(source='device.name', read_only=True)
    
    class Meta:
        model = EnergyMonitoring
        fields = ['id', 'device', 'device_name', 'power', 'voltage', 'current', 'energy', 'timestamp']


class DeviceControlSerializer(serializers.Serializer):
    """Serializer for device control commands"""
    action = serializers.ChoiceField(choices=[
        'on', 'off', 'toggle',
        'open', 'close',
        'lock', 'unlock'
    ])
    value = serializers.IntegerField(required=False, min_value=0, max_value=100)
    duration = serializers.IntegerField(required=False, help_text="Duration in seconds")


class BulkDeviceControlSerializer(serializers.Serializer):
    """Serializer for controlling multiple devices"""
    device_ids = serializers.ListField(child=serializers.IntegerField())
    action = serializers.CharField()
    value = serializers.IntegerField(required=False)


class AutomationTestSerializer(serializers.Serializer):
    """Serializer for testing automation rules"""
    rule_id = serializers.IntegerField()
    context = serializers.DictField(required=False, default=dict)


class DeviceDashboardSerializer(serializers.Serializer):
    """Serializer for device dashboard"""
    total_devices = serializers.IntegerField()
    active_devices = serializers.IntegerField()
    devices_online = serializers.IntegerField()
    devices_offline = serializers.IntegerField()
    
    by_room = serializers.DictField()
    by_type = serializers.DictField()
    
    current_power = serializers.FloatField()
    energy_today = serializers.FloatField()
    
    recent_activity = DeviceStatusSerializer(many=True)
    active_automations = AutomationRuleSerializer(many=True)