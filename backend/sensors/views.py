"""
Views for sensor data management
"""
from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.utils import timezone
from django.db.models import Avg, Min, Max, Count, Q
from django.shortcuts import get_object_or_404
from datetime import timedelta
import json

from .models import (
    Sensor, SensorData, SensorAlert, 
    SensorThreshold, SensorStatistics, SensorCalibration
)
from .serializers import (
    SensorSerializer, SensorDataSerializer, SensorDataCreateSerializer,
    SensorAlertSerializer, SensorThresholdSerializer,
    SensorStatisticsSerializer, SensorCalibrationSerializer,
    SensorDashboardSerializer, SensorChartDataSerializer
)
from core.serial_handler import SerialHandler
from logs.models import ActivityLog

class SensorViewSet(viewsets.ModelViewSet):
    """ViewSet for Sensor CRUD operations"""
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer
    
    def get_queryset(self):
        queryset = Sensor.objects.all()
        
        # Filter by type
        sensor_type = self.request.query_params.get('type', None)
        if sensor_type:
            queryset = queryset.filter(sensor_type=sensor_type)
        
        # Filter by status
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by location
        location = self.request.query_params.get('location', None)
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def readings(self, request, pk=None):
        """Get recent readings for a sensor"""
        sensor = self.get_object()
        
        # Get time range
        hours = int(request.query_params.get('hours', 24))
        start_time = timezone.now() - timedelta(hours=hours)
        
        readings = SensorData.objects.filter(
            sensor=sensor,
            timestamp__gte=start_time
        ).order_by('-timestamp')[:100]
        
        serializer = SensorDataSerializer(readings, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def calibrate(self, request, pk=None):
        """Calibrate a sensor"""
        sensor = self.get_object()
        
        serializer = SensorCalibrationSerializer(data=request.data)
        if serializer.is_valid():
            # Save old offset
            old_offset = sensor.calibration_value
            
            # Update sensor
            sensor.calibration_value = serializer.validated_data['new_offset']
            sensor.save()
            
            # Save calibration record
            serializer.save(
                sensor=sensor,
                old_offset=old_offset,
                calibrated_by=request.user if request.user.is_authenticated else None
            )
            
            # Log activity
            ActivityLog.objects.create(
                action_type='SENSOR_CALIBRATE',
                description=f"Sensor {sensor.name} calibrated",
                performed_by=request.user if request.user.is_authenticated else None
            )
            
            return Response({
                'success': True,
                'message': f"Sensor {sensor.name} calibrated successfully",
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def test(self, request, pk=None):
        """Test sensor connection"""
        sensor = self.get_object()
        
        # Send test command to Arduino
        handler = SerialHandler()
        command = f"TEST_SENSOR:{sensor.pin_number}"
        success = handler.send_command(command)
        
        if success:
            return Response({
                'success': True,
                'message': f"Test command sent to {sensor.name}"
            })
        else:
            return Response({
                'success': False,
                'message': "Failed to communicate with Arduino"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SensorDataView(generics.ListCreateAPIView):
    """View for sensor data"""
    serializer_class = SensorDataSerializer
    
    def get_queryset(self):
        queryset = SensorData.objects.all()
        
        # Filter by sensor
        sensor_id = self.request.query_params.get('sensor', None)
        if sensor_id:
            queryset = queryset.filter(sensor_id=sensor_id)
        
        # Filter by time range
        hours = self.request.query_params.get('hours', None)
        if hours:
            start_time = timezone.now() - timedelta(hours=int(hours))
            queryset = queryset.filter(timestamp__gte=start_time)
        
        # Filter by date
        date = self.request.query_params.get('date', None)
        if date:
            queryset = queryset.filter(timestamp__date=date)
        
        return queryset.order_by('-timestamp')
    
    def post(self, request, *args, **kwargs):
        """Create sensor data (for Arduino)"""
        serializer = SensorDataCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            sensor_data = serializer.save()
            
            # Check thresholds
            self.check_thresholds(sensor_data)
            
            # Return success
            return Response({
                'success': True,
                'message': 'Sensor data recorded',
                'data': SensorDataSerializer(sensor_data).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def check_thresholds(self, sensor_data):
        """Check if sensor data triggers any thresholds"""
        thresholds = SensorThreshold.objects.filter(
            sensor=sensor_data.sensor,
            is_active=True
        )
        
        for threshold in thresholds:
            value = None
            if threshold.sensor.sensor_type == 'temperature':
                value = sensor_data.temperature
            elif threshold.sensor.sensor_type == 'light':
                value = sensor_data.light_level
            elif threshold.sensor.sensor_type == 'ultrasonic':
                value = sensor_data.distance
            
            if value is not None and threshold.should_trigger(value):
                # Create alert
                alert = SensorAlert.objects.create(
                    sensor=sensor_data.sensor,
                    alert_type='threshold_exceeded',
                    severity='warning',
                    message=f"{threshold.name} triggered: {value}",
                    value=value,
                    threshold=threshold.min_value
                )
                
                # Update last triggered
                threshold.last_triggered = timezone.now()
                threshold.save()
                
                # Execute action
                self.execute_threshold_action(threshold, alert, value)
    
    def execute_threshold_action(self, threshold, alert, value):
        """Execute action for threshold trigger"""
        action_type = threshold.action_type
        config = threshold.action_config
        
        if action_type == 'alert':
            # Alert already created
            pass
            
        elif action_type == 'device_action':
            # Control device via Arduino
            handler = SerialHandler()
            device = config.get('device')
            action = config.get('action')
            
            if device and action:
                command_map = {
                    ('fan', 'on'): 'FAN_ON',
                    ('fan', 'off'): 'FAN_OFF',
                    ('light', 'on'): 'LIGHT_ON',
                    ('light', 'off'): 'LIGHT_OFF',
                }
                command = command_map.get((device, action))
                if command:
                    handler.send_command(command)
        
        # Log the alert
        ActivityLog.objects.create(
            action_type='SENSOR_ALERT',
            description=f"Threshold triggered: {threshold.name} - Value: {value}",
        )


class CurrentReadingsView(APIView):
    """Get current readings from all sensors"""
    
    def get(self, request):
        readings = {}
        
        # Get latest reading for each sensor type
        sensor_types = ['temperature', 'humidity', 'light', 'ultrasonic']
        
        for sensor_type in sensor_types:
            try:
                latest = SensorData.objects.filter(
                    sensor__sensor_type=sensor_type
                ).latest('timestamp')
                
                if sensor_type == 'temperature':
                    readings['temperature'] = latest.temperature
                    readings['humidity'] = latest.humidity
                elif sensor_type == 'light':
                    readings['light_level'] = latest.light_level
                elif sensor_type == 'ultrasonic':
                    readings['distance'] = latest.distance
                    
            except SensorData.DoesNotExist:
                # Mock data for testing
                if sensor_type == 'temperature':
                    readings['temperature'] = 25.5
                    readings['humidity'] = 60
                elif sensor_type == 'light':
                    readings['light_level'] = 450
                elif sensor_type == 'ultrasonic':
                    readings['distance'] = 150
        
        return Response({
            'success': True,
            'data': readings,
            'timestamp': timezone.now()
        })


class SensorAlertViewSet(viewsets.ModelViewSet):
    """ViewSet for sensor alerts"""
    queryset = SensorAlert.objects.all()
    serializer_class = SensorAlertSerializer
    
    def get_queryset(self):
        queryset = SensorAlert.objects.all()
        
        # Filter by resolved status
        resolved = self.request.query_params.get('resolved', None)
        if resolved is not None:
            is_resolved = resolved.lower() == 'true'
            queryset = queryset.filter(is_resolved=is_resolved)
        
        # Filter by severity
        severity = self.request.query_params.get('severity', None)
        if severity:
            queryset = queryset.filter(severity=severity)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """Acknowledge alert"""
        alert = self.get_object()
        alert.acknowledged_at = timezone.now()
        alert.save()
        
        return Response({
            'success': True,
            'message': 'Alert acknowledged'
        })
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolve alert"""
        alert = self.get_object()
        alert.is_resolved = True
        alert.resolved_at = timezone.now()
        alert.resolved_by = request.user if request.user.is_authenticated else None
        alert.save()
        
        return Response({
            'success': True,
            'message': 'Alert resolved'
        })


class SensorThresholdViewSet(viewsets.ModelViewSet):
    """ViewSet for sensor thresholds"""
    queryset = SensorThreshold.objects.all()
    serializer_class = SensorThresholdSerializer


class SensorDashboardView(APIView):
    """Get dashboard data for sensors"""
    
    def get(self, request):
        # Get statistics
        total_sensors = Sensor.objects.count()
        active_sensors = Sensor.objects.filter(is_active=True).count()
        alerts_count = SensorAlert.objects.filter(is_resolved=False).count()
        
        # Get current readings
        current_readings = {}
        
        # Temperature
        try:
            temp_sensor = SensorData.objects.filter(
                sensor__sensor_type='temperature'
            ).latest('timestamp')
            current_readings['temperature'] = {
                'value': temp_sensor.temperature,
                'humidity': temp_sensor.humidity,
                'time': temp_sensor.timestamp
            }
        except SensorData.DoesNotExist:
            current_readings['temperature'] = {'value': 25.5, 'humidity': 60}
        
        # Light
        try:
            light_sensor = SensorData.objects.filter(
                sensor__sensor_type='light'
            ).latest('timestamp')
            current_readings['light'] = {
                'value': light_sensor.light_level,
                'time': light_sensor.timestamp
            }
        except SensorData.DoesNotExist:
            current_readings['light'] = {'value': 450}
        
        # Distance
        try:
            distance_sensor = SensorData.objects.filter(
                sensor__sensor_type='ultrasonic'
            ).latest('timestamp')
            current_readings['distance'] = {
                'value': distance_sensor.distance,
                'time': distance_sensor.timestamp
            }
        except SensorData.DoesNotExist:
            current_readings['distance'] = {'value': 150}
        
        # Get recent data (last 10 readings)
        recent_data = SensorData.objects.all().order_by('-timestamp')[:10]
        
        # Get active alerts
        active_alerts = SensorAlert.objects.filter(is_resolved=False)[:5]
        
        dashboard_data = {
            'total_sensors': total_sensors,
            'active_sensors': active_sensors,
            'alerts_count': alerts_count,
            'current_readings': current_readings,
            'recent_data': SensorDataSerializer(recent_data, many=True).data,
            'active_alerts': SensorAlertSerializer(active_alerts, many=True).data
        }
        
        serializer = SensorDashboardSerializer(dashboard_data)
        return Response(serializer.data)


class SensorChartDataView(APIView):
    """Get chart data for sensors"""
    
    def get(self, request):
        sensor_type = request.query_params.get('type', 'temperature')
        period = request.query_params.get('period', '24h')
        
        # Determine time range
        if period == '24h':
            start_time = timezone.now() - timedelta(hours=24)
            interval = 'hour'
        elif period == '7d':
            start_time = timezone.now() - timedelta(days=7)
            interval = 'day'
        elif period == '30d':
            start_time = timezone.now() - timedelta(days=30)
            interval = 'day'
        else:
            start_time = timezone.now() - timedelta(hours=24)
            interval = 'hour'
        
        # Get data
        data = SensorData.objects.filter(
            sensor__sensor_type=sensor_type,
            timestamp__gte=start_time
        ).order_by('timestamp')
        
        # Prepare chart data
        labels = []
        values = []
        
        for reading in data:
            if interval == 'hour':
                labels.append(reading.timestamp.strftime('%H:00'))
            else:
                labels.append(reading.timestamp.strftime('%m/%d'))
            
            if sensor_type == 'temperature':
                values.append(reading.temperature)
            elif sensor_type == 'light':
                values.append(reading.light_level)
            elif sensor_type == 'ultrasonic':
                values.append(reading.distance)
        
        chart_data = {
            'labels': labels[-24:],  # Last 24 points
            'datasets': [{
                'label': sensor_type.capitalize(),
                'data': values[-24:],
                'borderColor': '#3b82f6',
                'backgroundColor': 'rgba(59, 130, 246, 0.1)',
                'fill': True
            }]
        }
        
        serializer = SensorChartDataSerializer(chart_data)
        return Response(serializer.data)


class SensorStatisticsView(generics.ListAPIView):
    """Get sensor statistics"""
    serializer_class = SensorStatisticsSerializer
    
    def get_queryset(self):
        return SensorStatistics.objects.all().order_by('-period_end')


class BulkSensorDataView(APIView):
    """Handle bulk sensor data upload"""
    
    def post(self, request):
        data_list = request.data.get('readings', [])
        
        if not data_list:
            return Response({
                'success': False,
                'message': 'No readings provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        created = []
        errors = []
        
        for item in data_list:
            serializer = SensorDataCreateSerializer(data=item)
            if serializer.is_valid():
                sensor_data = serializer.save()
                created.append(SensorDataSerializer(sensor_data).data)
            else:
                errors.append({
                    'data': item,
                    'errors': serializer.errors
                })
        
        return Response({
            'success': True,
            'message': f'Created {len(created)} readings, {len(errors)} errors',
            'created': created,
            'errors': errors
        })