"""
Serializers for sensor data
"""
from rest_framework import serializers
from django.utils import timezone
from .models import (
    Sensor, SensorData, SensorAlert, 
    SensorThreshold, SensorStatistics, SensorCalibration
)

class SensorSerializer(serializers.ModelSerializer):
    """Serializer for Sensor model"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    status_color = serializers.SerializerMethodField()
    
    class Meta:
        model = Sensor
        fields = [
            'id', 'name', 'sensor_type', 'location', 'pin_number', 'unit',
            'status', 'status_display', 'status_color', 'is_active',
            'calibration_value', 'min_value', 'max_value',
            'last_reading', 'last_read_time', 'created_at', 'updated_at'
        ]
        read_only_fields = ['last_reading', 'last_read_time', 'created_at', 'updated_at']
    
    def get_status_color(self, obj):
        return obj.get_status_display_color()


class SensorDataSerializer(serializers.ModelSerializer):
    """Serializer for SensorData model"""
    sensor_name = serializers.CharField(source='sensor.name', read_only=True)
    sensor_type = serializers.CharField(source='sensor.sensor_type', read_only=True)
    location = serializers.CharField(source='sensor.location', read_only=True)
    
    class Meta:
        model = SensorData
        fields = [
            'id', 'sensor', 'sensor_name', 'sensor_type', 'location',
            'temperature', 'humidity', 'light_level', 'distance',
            'motion_detected', 'raw_value', 'calibrated_value',
            'timestamp', 'battery_level', 'signal_strength'
        ]
        read_only_fields = ['timestamp']


class SensorDataCreateSerializer(serializers.Serializer):
    """Serializer for creating sensor data from Arduino"""
    sensor_id = serializers.IntegerField(required=False)
    sensor_name = serializers.CharField(required=False)
    
    # Sensor readings
    temperature = serializers.FloatField(required=False, allow_null=True)
    humidity = serializers.FloatField(required=False, allow_null=True)
    light_level = serializers.IntegerField(required=False, allow_null=True)
    distance = serializers.FloatField(required=False, allow_null=True)
    motion = serializers.BooleanField(required=False, default=False)
    
    # Metadata
    battery = serializers.FloatField(required=False, allow_null=True)
    signal = serializers.IntegerField(required=False, allow_null=True)
    
    def validate(self, data):
        """Validate that at least one reading is provided"""
        readings = ['temperature', 'humidity', 'light_level', 'distance']
        if not any(data.get(r) is not None for r in readings):
            raise serializers.ValidationError("At least one sensor reading must be provided")
        return data
    
    def create(self, validated_data):
        # Find sensor by ID or name
        sensor = None
        if validated_data.get('sensor_id'):
            try:
                sensor = Sensor.objects.get(id=validated_data['sensor_id'])
            except Sensor.DoesNotExist:
                pass
        elif validated_data.get('sensor_name'):
            try:
                sensor = Sensor.objects.get(name=validated_data['sensor_name'])
            except Sensor.DoesNotExist:
                # Create sensor if it doesn't exist
                sensor = Sensor.objects.create(
                    name=validated_data['sensor_name'],
                    sensor_type=self.detect_sensor_type(validated_data),
                    location='Unknown',
                    is_active=True
                )
        
        if not sensor:
            raise serializers.ValidationError("Sensor not found")
        
        # Create sensor data
        sensor_data = SensorData.objects.create(
            sensor=sensor,
            temperature=validated_data.get('temperature'),
            humidity=validated_data.get('humidity'),
            light_level=validated_data.get('light_level'),
            distance=validated_data.get('distance'),
            motion_detected=validated_data.get('motion', False),
            battery_level=validated_data.get('battery'),
            signal_strength=validated_data.get('signal')
        )
        
        return sensor_data
    
    def detect_sensor_type(self, data):
        """Detect sensor type based on provided data"""
        if data.get('temperature') is not None and data.get('humidity') is not None:
            return 'temperature'  # DHT11 provides both
        elif data.get('light_level') is not None:
            return 'light'
        elif data.get('distance') is not None:
            return 'ultrasonic'
        elif data.get('motion') is not None:
            return 'motion'
        return 'unknown'


class SensorAlertSerializer(serializers.ModelSerializer):
    """Serializer for SensorAlert model"""
    sensor_name = serializers.CharField(source='sensor.name', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    
    class Meta:
        model = SensorAlert
        fields = [
            'id', 'sensor', 'sensor_name', 'alert_type', 'severity',
            'severity_display', 'message', 'value', 'threshold',
            'is_resolved', 'resolved_at', 'resolved_by',
            'created_at', 'acknowledged_at'
        ]
        read_only_fields = ['created_at']


class SensorThresholdSerializer(serializers.ModelSerializer):
    """Serializer for SensorThreshold model"""
    condition_display = serializers.CharField(source='get_condition_type_display', read_only=True)
    action_display = serializers.CharField(source='get_action_type_display', read_only=True)
    
    class Meta:
        model = SensorThreshold
        fields = [
            'id', 'sensor', 'name', 'condition_type', 'condition_display',
            'min_value', 'max_value', 'action_type', 'action_display',
            'action_config', 'is_time_restricted', 'start_time', 'end_time',
            'is_active', 'cooldown_minutes', 'last_triggered',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['last_triggered', 'created_at', 'updated_at']


class SensorStatisticsSerializer(serializers.ModelSerializer):
    """Serializer for SensorStatistics model"""
    sensor_name = serializers.CharField(source='sensor.name', read_only=True)
    
    class Meta:
        model = SensorStatistics
        fields = [
            'id', 'sensor', 'sensor_name', 'period_start', 'period_end',
            'period_type', 'avg_value', 'min_value', 'max_value',
            'median_value', 'std_deviation', 'reading_count', 'alert_count'
        ]


class SensorCalibrationSerializer(serializers.ModelSerializer):
    """Serializer for SensorCalibration model"""
    calibrated_by_username = serializers.CharField(source='calibrated_by.username', read_only=True)
    
    class Meta:
        model = SensorCalibration
        fields = [
            'id', 'sensor', 'old_offset', 'new_offset',
            'calibration_point', 'measured_value', 'calibrated_by',
            'calibrated_by_username', 'notes', 'created_at'
        ]
        read_only_fields = ['created_at']


class SensorDashboardSerializer(serializers.Serializer):
    """Serializer for sensor dashboard data"""
    total_sensors = serializers.IntegerField()
    active_sensors = serializers.IntegerField()
    alerts_count = serializers.IntegerField()
    
    current_readings = serializers.DictField()
    recent_data = SensorDataSerializer(many=True)
    active_alerts = SensorAlertSerializer(many=True)


class SensorChartDataSerializer(serializers.Serializer):
    """Serializer for chart data"""
    labels = serializers.ListField(child=serializers.CharField())
    datasets = serializers.ListField(child=serializers.DictField())