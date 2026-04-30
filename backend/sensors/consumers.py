"""
WebSocket consumers for real-time sensor data
"""
import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from sensors.models import SensorData


class SensorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'sensors'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        await self.send_initial_data()

        # Each consumer polls and sends ONLY to itself — no group_send in loop
        self.update_task = asyncio.create_task(self.send_updates())

    async def disconnect(self, close_code):
        if hasattr(self, 'update_task'):
            self.update_task.cancel()

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            command = data.get('command')

            if command == 'get_history':
                await self.send_history(data.get('hours', 24))
            elif command == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': timezone.now().isoformat()
                }))
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))

    async def send_initial_data(self):
        latest_data = await self.get_latest_sensor_data()
        if latest_data:
            await self.send(text_data=json.dumps({
                'type': 'initial',
                'data': latest_data
            }))

    async def send_updates(self):
        """Poll and send directly to THIS client only — no group_send"""
        try:
            while True:
                await asyncio.sleep(2)
                sensor_data = await self.get_latest_sensor_data()

                if sensor_data:
                    await self.send(text_data=json.dumps({
                        'type': 'update',
                        'data': sensor_data
                    }))
        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f"Sensor update error: {e}")

    # Keep this handler for EXTERNAL pushes (e.g., from Arduino serial handler)
    async def sensor_broadcast(self, event):
        """Receive group_send from outside (e.g., serial_handler pushes new reading)"""
        await self.send(text_data=json.dumps({
            'type': 'update',
            'data': event['data']
        }))

    async def send_history(self, hours):
        history = await self.get_sensor_history(hours)
        await self.send(text_data=json.dumps({
            'type': 'history',
            'data': history
        }))

    @database_sync_to_async
    def get_latest_sensor_data(self):
        try:
            latest = SensorData.objects.latest('timestamp')
            return {
                'temperature': latest.temperature,
                'humidity': latest.humidity,
                'light_level': latest.light_level,
                'motion_detected': latest.motion_detected,
                'timestamp': latest.timestamp.isoformat()
            }
        except SensorData.DoesNotExist:
            return {
                'temperature': 25.5,
                'humidity': 60,
                'light_level': 450,
                'motion_detected': False,
                'timestamp': timezone.now().isoformat()
            }

    @database_sync_to_async
    def get_sensor_history(self, hours):
        from datetime import timedelta
        start_time = timezone.now() - timedelta(hours=hours)

        data = SensorData.objects.filter(
            timestamp__gte=start_time
        ).order_by('timestamp')[:100]

        return [{
            'temperature': d.temperature,
            'humidity': d.humidity,
            'light_level': d.light_level,
            'timestamp': d.timestamp.isoformat()
        } for d in data]