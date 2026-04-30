"""
URLs for devices app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'devices', views.DeviceViewSet)
router.register(r'automations', views.AutomationRuleViewSet)
router.register(r'scenes', views.SceneViewSet)
router.register(r'schedules', views.ScheduleViewSet)
router.register(r'groups', views.DeviceGroupViewSet)
router.register(r'energy', views.EnergyMonitoringViewSet)

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # Dashboard
    path('dashboard/', views.DeviceDashboardView.as_view(), name='device-dashboard'),
    
    # Bulk operations
    path('bulk-control/', views.BulkDeviceControlView.as_view(), name='bulk-control'),
    path('emergency/', views.EmergencyControlView.as_view(), name='emergency-control'),
]