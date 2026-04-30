from django.contrib import admin
from .models import Camera, CameraRecording, MotionEvent, CameraSnapshot

@admin.register(Camera)
class CameraAdmin(admin.ModelAdmin):
    list_display = ['name', 'location', 'status', 'is_recording', 'motion_detection', 'is_active']
    list_filter = ['status', 'is_recording', 'motion_detection', 'is_active']
    search_fields = ['name', 'location']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(CameraRecording)
class CameraRecordingAdmin(admin.ModelAdmin):
    list_display = ['camera', 'start_time', 'end_time', 'duration', 'file_size']
    list_filter = ['camera', 'triggered_by', 'start_time']
    date_hierarchy = 'start_time'

@admin.register(MotionEvent)
class MotionEventAdmin(admin.ModelAdmin):
    list_display = ['camera', 'triggered_at', 'motion_level', 'is_acknowledged']
    list_filter = ['camera', 'is_acknowledged', 'triggered_at']
    date_hierarchy = 'triggered_at'

@admin.register(CameraSnapshot)
class CameraSnapshotAdmin(admin.ModelAdmin):
    list_display = ['camera', 'captured_at', 'captured_by']
    list_filter = ['camera', 'captured_at']
    date_hierarchy = 'captured_at'