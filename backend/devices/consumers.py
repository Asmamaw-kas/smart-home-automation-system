"""
WebSocket consumers for device control
"""
import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from django.utils import timezone
from .models import Device

User = get_user_model()

class DeviceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Handle WebSocket connection"""
        # Get JWT token from query params
        query_string = self.scope.get('query_string', b'').decode()
        token = None
        
        for param in query_string.split('&'):
            if param.startswith('token='):
                token = param.split('=', 1)[1]
                break
        
        if not token:
            await self.close(code=4001)
            return
        
        # Verify JWT token
        try:
            access_token = AccessToken(token)
            user = await self.get_user(access_token['user_id'])
            if not user:
                await self.close(code=4002)
                return
            self.user = user
        except Exception as e:
            print(f"Token verification failed: {e}")
            await self.close(code=4003)
            return
        
        # Join user's device group
        self.group_name = f'user_{self.user.id}_devices'
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()
        print(f"WebSocket connected for user {self.user.username}")
        
        # Send initial device status
        await self.send_device_status()
    
    async def disconnect(self, close_code):
        """Handle disconnection"""
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
        print(f"WebSocket disconnected: {close_code}")
    
    async def receive(self, text_data):
        """Handle received messages"""
        try:
            data = json.loads(text_data)
            command = data.get('command')
            
            if command == 'control_device':
                await self.handle_device_control(data)
            elif command == 'get_status':
                await self.send_device_status()
            elif command == 'emergency_lock':
                await self.handle_emergency_lock()
            elif command == 'enable_automation':
                await self.handle_automation(True)
            elif command == 'disable_automation':
                await self.handle_automation(False)
            elif command == 'set_threshold':
                await self.handle_set_threshold(data)
            else:
                await self.send_error(f"Unknown command: {command}")
                
        except json.JSONDecodeError:
            await self.send_error("Invalid JSON")
        except Exception as e:
            await self.send_error(str(e))
    
    async def handle_device_control(self, data):
        """Handle device control commands"""
        device_name = data.get('device')
        action = data.get('action')
        value = data.get('value')
        
        if not device_name or not action:
            await self.send_error("Missing device or action")
            return
        
        try:
            device = await self.get_device_by_name(device_name)
            if not device:
                await self.send_error(f"Device '{device_name}' not found")
                return
            
            # Send command to Arduino (you'll need to implement this)
            success = await self.send_arduino_command(device, action, value)
            
            if success:
                # Update device status
                if action in ['on', 'off']:
                    device.status = action == 'on'
                await database_sync_to_async(device.save)()
                
                # Send success response
                await self.send(text_data=json.dumps({
                    'type': 'command_success',
                    'device': device_name,
                    'action': action,
                    'value': value,
                    'timestamp': timezone.now().isoformat()
                }))
                
                # Broadcast to group
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        'type': 'device_update',
                        'device': device_name,
                        'action': action,
                        'value': value,
                        'status': device.status
                    }
                )
            else:
                await self.send_error(f"Failed to control {device_name}")
                
        except Exception as e:
            await self.send_error(f"Device control error: {str(e)}")
    
    async def handle_emergency_lock(self):
        """Handle emergency lock command"""
        try:
            # Lock all devices
            devices = await self.get_user_devices()
            for device in devices:
                if device['type'] == 'door':
                    await self.send_arduino_command_by_name(device['name'], 'lock')
                elif device['type'] in ['light', 'fan']:
                    await self.send_arduino_command_by_name(device['name'], 'off')
            
            await self.send(text_data=json.dumps({
                'type': 'emergency',
                'message': 'Emergency lock activated',
                'timestamp': timezone.now().isoformat()
            }))
            
        except Exception as e:
            await self.send_error(f"Emergency lock failed: {str(e)}")
    
    async def handle_automation(self, enabled):
        """Handle automation enable/disable"""
        try:
            # You can store automation state in user profile or settings
            action = 'enabled' if enabled else 'disabled'
            
            await self.send(text_data=json.dumps({
                'type': 'automation',
                'action': action,
                'timestamp': timezone.now().isoformat()
            }))
            
        except Exception as e:
            await self.send_error(f"Automation toggle failed: {str(e)}")
    
    async def handle_set_threshold(self, data):
        """Handle threshold setting"""
        device_name = data.get('device')
        value = data.get('value')
        
        try:
            # Store threshold (implement based on your needs)
            await self.send(text_data=json.dumps({
                'type': 'threshold_set',
                'device': device_name,
                'value': value,
                'timestamp': timezone.now().isoformat()
            }))
            
        except Exception as e:
            await self.send_error(f"Set threshold failed: {str(e)}")
    
    async def send_device_status(self):
        """Send current device status"""
        try:
            devices = await self.get_user_devices()
            await self.send(text_data=json.dumps({
                'type': 'status',
                'data': devices,
                'timestamp': timezone.now().isoformat()
            }))
        except Exception as e:
            await self.send_error(f"Failed to get device status: {str(e)}")
    
    async def send_error(self, message):
        """Send error message"""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message,
            'timestamp': timezone.now().isoformat()
        }))
    
    async def send_arduino_command(self, device, action, value=None):
        """Send command to Arduino - implement based on your serial handler"""
        try:
            # Import your serial handler
            from core.serial_handler import SerialHandler
            
            # Create command based on device type and action
            if device.type == 'light':
                command = f"LIGHT_{action.upper()}"
            elif device.type == 'fan':
                command = f"FAN_{action.upper()}"
            elif device.type == 'door':
                command = f"DOOR_{action.upper()}"
            else:
                return False
            
            # Send to Arduino (implement this method in your serial handler)
            result = await database_sync_to_async(
                lambda: SerialHandler.send_command(command)
            )()
            
            return result
            
        except Exception as e:
            print(f"Arduino command failed: {e}")
            return False
    
    async def send_arduino_command_by_name(self, device_name, action):
        """Helper method to send command by device name"""
        device = await self.get_device_by_name(device_name)
        if device:
            return await self.send_arduino_command(device, action)
        return False
    
    # Group message handlers
    async def device_update(self, event):
        """Handle device update broadcast"""
        await self.send(text_data=json.dumps({
            'type': 'device_update',
            'device': event['device'],
            'action': event['action'],
            'value': event['value'],
            'status': event['status'],
            'timestamp': timezone.now().isoformat()
        }))
    
    # Database methods
    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None
    
    @database_sync_to_async
    def get_device_by_name(self, device_name):
        try:
            return Device.objects.get(name=device_name, user=self.user)
        except Device.DoesNotExist:
            return None
    
    @database_sync_to_async
    def get_user_devices(self):
        devices = Device.objects.filter(user=self.user)
        return [{
            'id': d.id,
            'name': d.name,
            'type': d.type,
            'status': d.status,
            'room': getattr(d, 'room', 'Unknown')
        } for d in devices]