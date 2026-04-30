"""
URLs for sensors app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'sensors', views.SensorViewSet)
router.register(r'alerts', views.SensorAlertViewSet)
router.register(r'thresholds', views.SensorThresholdViewSet)

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # Sensor data
    path('data/', views.SensorDataView.as_view(), name='sensor-data'),
    path('data/bulk/', views.BulkSensorDataView.as_view(), name='sensor-data-bulk'),
    
    # Current readings
    path('current/', views.CurrentReadingsView.as_view(), name='current-readings'),
    
    # Dashboard
    path('dashboard/', views.SensorDashboardView.as_view(), name='sensor-dashboard'),
    path('charts/', views.SensorChartDataView.as_view(), name='sensor-charts'),
    
    # Statistics
    path('statistics/', views.SensorStatisticsView.as_view(), name='sensor-statistics'),
]