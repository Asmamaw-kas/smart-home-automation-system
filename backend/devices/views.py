"""
Views for devices app
"""
from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.utils import timezone
from django.db.models import Count, Sum, Q
from django.shortcuts import get_object_or_404
from datetime import timedelta, datetime

from .models import (
    Device, DeviceStatus, AutomationRule, 
    Scene, Schedule, DeviceGroup, EnergyMonitoring
)
from .serializers import (
    DeviceSerializer, DeviceStatusSerializer, AutomationRuleSerializer,
    SceneSerializer, ScheduleSerializer, DeviceGroupSerializer,
    EnergyMonitoringSerializer, DeviceControlSerializer,
    BulkDeviceControlSerializer, AutomationTestSerializer,
    DeviceDashboardSerializer
)
from core.serial_handler import SerialHandler, Commands
from logs.models import ActivityLog, DeviceLog

class DeviceViewSet(viewsets.ModelViewSet):
    """ViewSet for Device CRUD operations"""
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer
    
    def get_queryset(self):
        queryset = Device.objects.all()
        
        # Filter by type
        device_type = self.request.query_params.get('type', None)
        if device_type:
            queryset = queryset.filter(device_type=device_type)
        
        # Filter by room
        room = self.request.query_params.get('room', None)
        if room:
            queryset = queryset.filter(room__icontains=room)
        
        # Filter by status
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by active
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def control(self, request, pk=None):
        """Control a device"""
        device = self.get_object()
        serializer = DeviceControlSerializer(data=request.data)
        
        if serializer.is_valid():
            action = serializer.validated_data['action']
            value = serializer.validated_data.get('value')
            duration = serializer.validated_data.get('duration')
            
            # Map action to command
            command = self._get_command(device, action, value)
            
            # Send command to Arduino
            handler = SerialHandler()
            success = handler.send_command(command)
            
            if success:
                # Update device state
                device.update_state(action, value)
                
                # Log the action
                DeviceLog.objects.create(
                    device_id=device.id,
                    device_name=device.name,
                    device_type=device.device_type,
                    action=action.upper(),
                    triggered_by='remote',
                    user=request.user if request.user.is_authenticated else None,
                    duration=duration
                )
                
                # If duration specified, schedule turn off
                if duration and action in ['on', 'open', 'unlock']:
                    self._schedule_auto_off(device, action, duration)
                
                return Response({
                    'success': True,
                    'message': f"{device.name} turned {action}",
                    'device': DeviceSerializer(device).data
                })
            else:
                return Response({
                    'success': False,
                    'message': "Failed to communicate with Arduino"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def _get_command(self, device, action, value=None):
        """Get Arduino command for device action"""
        device_type = device.device_type
        
        if action == 'on':
            return Commands.LIGHT_ON if device_type == 'light' else Commands.FAN_ON
        elif action == 'off':
            return Commands.LIGHT_OFF if device_type == 'light' else Commands.FAN_OFF
        elif action == 'open':
            return Commands.DOOR_OPEN
        elif action == 'close':
            return Commands.DOOR_CLOSE
        elif action == 'lock':
            return Commands.DOOR_LOCK
        elif action == 'unlock':
            return Commands.DOOR_UNLOCK
        elif action == 'toggle':
            return f"TOGGLE:{device.pin_number}"
        elif action == 'value' and value is not None:
            return f"SET_VALUE:{device.pin_number}:{value}"
        
        return None
    
    def _schedule_auto_off(self, device, action, duration):
        """Schedule automatic turn off after duration"""
        # This would typically use Celery or Django's async tasks
        # For now, we'll just log it
        ActivityLog.objects.create(
            action_type='SCHEDULE',
            description=f"Scheduled {device.name} to turn off after {duration} seconds",
            extra_data={
                'device_id': device.id,
                'duration': duration,
                'scheduled_time': (timezone.now() + timedelta(seconds=duration)).isoformat()
            }
        )
    
    @action(detail=False, methods=['get'])
    def by_room(self, request):
        """Get devices grouped by room"""
        devices = Device.objects.filter(is_active=True)
        
        rooms = {}
        for device in devices:
            room = device.room or 'Other'
            if room not in rooms:
                rooms[room] = []
            rooms[room].append(DeviceSerializer(device).data)
        
        return Response(rooms)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get device summary statistics"""
        total = Device.objects.count()
        online = Device.objects.filter(status='online').count()
        offline = Device.objects.filter(status='offline').count()
        
        by_type = Device.objects.values('device_type').annotate(
            count=Count('id')
        )
        
        by_room = Device.objects.values('room').annotate(
            count=Count('id')
        )
        
        return Response({
            'total': total,
            'online': online,
            'offline': offline,
            'by_type': by_type,
            'by_room': by_room
        })
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Get device status history"""
        device = self.get_object()
        hours = int(request.query_params.get('hours', 24))
        
        start_time = timezone.now() - timedelta(hours=hours)
        history = DeviceStatus.objects.filter(
            device=device,
            timestamp__gte=start_time
        ).order_by('-timestamp')
        
        serializer = DeviceStatusSerializer(history, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def calibrate(self, request, pk=None):
        """Calibrate device (for dimmers, etc.)"""
        device = self.get_object()
        value = request.data.get('value')
        
        if value is not None:
            device.current_value = value
            device.save()
            
            return Response({
                'success': True,
                'message': f"{device.name} calibrated to {value}"
            })
        
        return Response({
            'success': False,
            'message': "Value required"
        }, status=status.HTTP_400_BAD_REQUEST)


class AutomationRuleViewSet(viewsets.ModelViewSet):
    """ViewSet for AutomationRule CRUD operations"""
    queryset = AutomationRule.objects.all()
    serializer_class = AutomationRuleSerializer
    
    def get_queryset(self):
        queryset = AutomationRule.objects.all()
        
        # Filter by active
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Filter by condition type
        condition_type = self.request.query_params.get('condition_type', None)
        if condition_type:
            queryset = queryset.filter(condition_type=condition_type)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def test(self, request, pk=None):
        """Test automation rule"""
        rule = self.get_object()
        serializer = AutomationTestSerializer(data=request.data)
        
        if serializer.is_valid():
            context = serializer.validated_data.get('context', {})
            
            # Check condition
            condition_met = rule.check_condition(context)
            
            # Execute if condition met
            if condition_met:
                success = rule.execute_action(triggered_by='test')
                
                return Response({
                    'success': True,
                    'condition_met': True,
                    'action_executed': success,
                    'message': 'Rule condition met and action executed'
                })
            else:
                return Response({
                    'success': True,
                    'condition_met': False,
                    'action_executed': False,
                    'message': 'Rule condition not met'
                })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def check_all(self, request):
        """Check all automation rules with given context"""
        context = request.data.get('context', {})
        rules = AutomationRule.objects.filter(is_active=True)
        
        triggered = []
        for rule in rules:
            if rule.check_condition(context):
                rule.execute_action()
                triggered.append({
                    'id': rule.id,
                    'name': rule.name
                })
        
        return Response({
            'success': True,
            'rules_checked': rules.count(),
            'rules_triggered': len(triggered),
            'triggered': triggered
        })


class SceneViewSet(viewsets.ModelViewSet):
    """ViewSet for Scene CRUD operations"""
    queryset = Scene.objects.all()
    serializer_class = SceneSerializer
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a scene"""
        scene = self.get_object()
        devices_controlled = scene.activate(triggered_by='manual')
        
        return Response({
            'success': True,
            'message': f"Scene '{scene.name}' activated",
            'devices_controlled': devices_controlled
        })


class ScheduleViewSet(viewsets.ModelViewSet):
    """ViewSet for Schedule CRUD operations"""
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    
    def get_queryset(self):
        queryset = Schedule.objects.all()
        
        # Filter by device
        device_id = self.request.query_params.get('device_id', None)
        if device_id:
            queryset = queryset.filter(device_id=device_id)
        
        # Filter by active
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming scheduled actions"""
        today = timezone.now()
        schedules = Schedule.objects.filter(
            is_active=True,
            time__gte=today.time()
        ).order_by('time')[:10]
        
        serializer = self.get_serializer(schedules, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """Manually execute a schedule"""
        schedule = self.get_object()
        
        # Send command to device
        handler = SerialHandler()
        
        if schedule.action in ['on', 'off']:
            command = Commands.LIGHT_ON if schedule.action == 'on' else Commands.LIGHT_OFF
        elif schedule.action in ['open', 'close']:
            command = Commands.DOOR_OPEN if schedule.action == 'open' else Commands.DOOR_CLOSE
        else:
            command = None
        
        if command:
            success = handler.send_command(command)
            
            if success:
                schedule.last_run = timezone.now()
                schedule.save()
                
                DeviceLog.objects.create(
                    device_id=schedule.device.id,
                    device_name=schedule.device.name,
                    device_type=schedule.device.device_type,
                    action=schedule.action.upper(),
                    triggered_by='schedule'
                )
                
                return Response({
                    'success': True,
                    'message': f"Schedule '{schedule.name}' executed"
                })
        
        return Response({
            'success': False,
            'message': "Failed to execute schedule"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DeviceGroupViewSet(viewsets.ModelViewSet):
    """ViewSet for DeviceGroup CRUD operations"""
    queryset = DeviceGroup.objects.all()
    serializer_class = DeviceGroupSerializer
    
    @action(detail=True, methods=['post'])
    def control(self, request, pk=None):
        """Control all devices in group"""
        group = self.get_object()
        action = request.data.get('action')
        value = request.data.get('value')
        
        if not action:
            return Response({
                'success': False,
                'message': "Action required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        success_count = group.control_all(action, value)
        
        return Response({
            'success': True,
            'message': f"Controlled {success_count} devices in group '{group.name}'",
            'devices_controlled': success_count
        })


class EnergyMonitoringViewSet(viewsets.ModelViewSet):
    """ViewSet for EnergyMonitoring"""
    queryset = EnergyMonitoring.objects.all()
    serializer_class = EnergyMonitoringSerializer
    
    def get_queryset(self):
        queryset = EnergyMonitoring.objects.all()
        
        # Filter by device
        device_id = self.request.query_params.get('device_id', None)
        if device_id:
            queryset = queryset.filter(device_id=device_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get energy usage summary"""
        days = int(request.query_params.get('days', 7))
        start_time = timezone.now() - timedelta(days=days)
        
        # Get all energy readings in period
        readings = EnergyMonitoring.objects.filter(timestamp__gte=start_time)
        
        # Total energy by device
        by_device = readings.values('device__name').annotate(
            total_energy=Sum('energy')
        ).order_by('-total_energy')
        
        # Daily totals
        daily_totals = []
        for i in range(days):
            day = timezone.now() - timedelta(days=i)
            day_readings = readings.filter(
                timestamp__year=day.year,
                timestamp__month=day.month,
                timestamp__day=day.day
            )
            daily_totals.append({
                'date': day.date().isoformat(),
                'energy': day_readings.aggregate(Sum('energy'))['energy__sum'] or 0
            })
        
        return Response({
            'total_energy': readings.aggregate(Sum('energy'))['energy__sum'] or 0,
            'by_device': by_device,
            'daily_totals': daily_totals
        })


class DeviceDashboardView(APIView):
    """Get device dashboard data"""
    
    def get(self, request):
        try:
            # Basic counts
            total_devices = Device.objects.count()
            active_devices = Device.objects.filter(is_active=True).count()
            devices_online = Device.objects.filter(status='online').count()
            devices_offline = Device.objects.filter(status='offline').count()
            
            # Group by room
            by_room = {}
            for device in Device.objects.filter(is_active=True):
                room = device.room or 'Other'
                if room not in by_room:
                    by_room[room] = []
                by_room[room].append({
                    'id': device.id,
                    'name': device.name,
                    'type': device.device_type,
                    'state': device.current_state
                })
            
            # Group by type — convert QuerySet to list of dicts
            by_type = list(
                Device.objects.values('device_type').annotate(count=Count('id'))
            )
            
            # Current power consumption
            current_power = EnergyMonitoring.objects.filter(
                timestamp__gte=timezone.now() - timedelta(minutes=5)
            ).aggregate(total=Sum('power'))['total'] or 0
            
            # Energy today
            today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
            energy_today = EnergyMonitoring.objects.filter(
                timestamp__gte=today_start
            ).aggregate(total=Sum('energy'))['total'] or 0
            
            # Recent activity — wrap in try/except in case model/serializer is missing
            try:
                recent_activity = DeviceStatus.objects.all().order_by('-timestamp')[:10]
                recent_activity_data = DeviceStatusSerializer(recent_activity, many=True).data
            except Exception:
                recent_activity_data = []
            
            # Active automations
            try:
                active_automations = AutomationRule.objects.filter(is_active=True)[:5]
                active_automations_data = AutomationRuleSerializer(active_automations, many=True).data
            except Exception:
                active_automations_data = []
            
            dashboard_data = {
                'total_devices': total_devices,
                'active_devices': active_devices,
                'devices_online': devices_online,
                'devices_offline': devices_offline,
                'by_room': by_room,
                'by_type': by_type,
                'current_power': float(current_power),
                'energy_today': float(energy_today),
                'recent_activity': recent_activity_data,
                'active_automations': active_automations_data,
            }
            
            # Return dict directly — no need for DeviceDashboardSerializer
            return Response(dashboard_data)
        
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=500
            )

class BulkDeviceControlView(APIView):
    """Control multiple devices at once"""
    
    def post(self, request):
        serializer = BulkDeviceControlSerializer(data=request.data)
        
        if serializer.is_valid():
            device_ids = serializer.validated_data['device_ids']
            action = serializer.validated_data['action']
            value = serializer.validated_data.get('value')
            
            devices = Device.objects.filter(id__in=device_ids, is_active=True)
            handler = SerialHandler()
            
            results = []
            for device in devices:
                # Get command
                if action in ['on', 'off']:
                    command = Commands.LIGHT_ON if action == 'on' else Commands.LIGHT_OFF
                elif action in ['open', 'close']:
                    command = Commands.DOOR_OPEN if action == 'open' else Commands.DOOR_CLOSE
                elif action in ['lock', 'unlock']:
                    command = Commands.DOOR_LOCK if action == 'lock' else Commands.DOOR_UNLOCK
                else:
                    command = None
                
                if command:
                    success = handler.send_command(command)
                    if success:
                        device.update_state(action, value)
                    
                    results.append({
                        'device_id': device.id,
                        'name': device.name,
                        'success': success
                    })
            
            success_count = sum(1 for r in results if r['success'])
            
            return Response({
                'success': True,
                'message': f"Controlled {success_count}/{len(devices)} devices",
                'results': results
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class EmergencyControlView(APIView):
    """Emergency control for all devices"""
    
    def post(self, request):
        action = request.data.get('action', 'lockdown')
        handler = SerialHandler()
        
        if action == 'lockdown':
            # Lock all doors, turn off all non-essential devices
            commands = [
                Commands.DOOR_LOCK,
                Commands.LIGHT_OFF,
                Commands.FAN_OFF
            ]
            
            for command in commands:
                handler.send_command(command)
            
            # Update device states
            Device.objects.filter(device_type='door').update(current_state='locked')
            Device.objects.filter(device_type='light').update(current_state='off')
            Device.objects.filter(device_type='fan').update(current_state='off')
            
            # Log emergency
            ActivityLog.objects.create(
                action_type='EMERGENCY_LOCK',
                severity='critical',
                description="Emergency lockdown activated",
                user=request.user if request.user.is_authenticated else None,
                extra_data={'action': action}
            )
            
            return Response({
                'success': True,
                'message': "Emergency lockdown activated"
            })
        
        elif action == 'all_on':
            # Turn everything on (for emergencies)
            commands = [
                Commands.LIGHT_ON,
                Commands.FAN_ON,
                Commands.DOOR_OPEN
            ]
            
            for command in commands:
                handler.send_command(command)
            
            return Response({
                'success': True,
                'message': "All devices turned on"
            })
        
        elif action == 'all_off':
            # Turn everything off
            commands = [
                Commands.LIGHT_OFF,
                Commands.FAN_OFF,
                Commands.DOOR_CLOSE
            ]
            
            for command in commands:
                handler.send_command(command)
            
            return Response({
                'success': True,
                'message': "All devices turned off"
            })
        
        return Response({
            'success': False,
            'message': "Invalid emergency action"
        }, status=status.HTTP_400_BAD_REQUEST)