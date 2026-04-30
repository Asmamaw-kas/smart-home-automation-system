"""
URLs for camera app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'cameras', views.CameraViewSet)

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # Streaming URLs
    path('stream/<int:camera_id>/', views.MJPEGStreamView.as_view(), name='camera-stream'),
    path('mjpeg/<int:camera_id>/', views.MJPEGStreamView.as_view(), name='camera-mjpeg'),
    path('snapshot/<int:camera_id>/', views.SnapshotView.as_view(), name='camera-snapshot'),
    
    # Motion detection
    path('motion/<int:camera_id>/', views.MotionDetectionView.as_view(), name='motion-detection'),
]