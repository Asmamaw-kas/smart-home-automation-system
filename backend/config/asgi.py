"""
ASGI config for WebSocket support
"""
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Initialize Django ASGI application early
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import re_path

# Import consumers - make sure they exist
try:
    from sensors.consumers import SensorConsumer
    from devices.consumers import DeviceConsumer
    
    websocket_urlpatterns = [
        re_path(r'ws/sensors/$', SensorConsumer.as_asgi()),
        re_path(r'ws/devices/$', DeviceConsumer.as_asgi()),
    ]
except ImportError as e:
    print(f"Consumer import error: {e}")
    # Create placeholder consumers
    from channels.generic.websocket import AsyncWebsocketConsumer
    import json
    
    class PlaceholderConsumer(AsyncWebsocketConsumer):
        async def connect(self):
            await self.accept()
            await self.send(text_data=json.dumps({
                'message': 'WebSocket connected. Consumer not fully implemented yet.'
            }))
        
        async def disconnect(self, close_code):
            pass
        
        async def receive(self, text_data):
            await self.send(text_data=json.dumps({
                'message': f'Received: {text_data}'
            }))
    
    websocket_urlpatterns = [
        re_path(r'ws/sensors/$', PlaceholderConsumer.as_asgi()),
        re_path(r'ws/devices/$', PlaceholderConsumer.as_asgi()),
    ]

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})