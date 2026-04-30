"""
Main URL configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Swagger documentation
schema_view = get_schema_view(
    openapi.Info(
        title="Smart Home API",
        default_version='v1',
        description="API for Smart Home Automation System",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@smarthome.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # API Endpoints
    path('api/auth/', include('users.urls')),
    path('api/devices/', include('devices.urls')),
    path('api/camera/', include('camera.urls')),
    path('api/sensors/', include('sensors.urls')),
    path('api/logs/', include('logs.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)