"""
Admin configuration for sensors app
"""
from django.contrib import admin
from django.utils import timezone
from .models import Sensor, SensorData, SensorAlert, SensorThreshold, SensorStatistics, SensorCalibration

@admin.register(Sensor)
class SensorAdmin(admin.ModelAdmin):
    """Sensor Admin"""
    list_display = ['name', 'sensor_type', 'location', 'status', 'is_active', 'last_reading', 'last_read_time']
    list_filter = ['sensor_type', 'status', 'is_active', 'location']
    search_fields = ['name', 'location']
    readonly_fields = ['last_reading', 'last_read_time', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'sensor_type', 'location', 'pin_number', 'unit')
        }),
        ('Status', {
            'fields': ('status', 'is_active', 'last_reading', 'last_read_time')
        }),
        ('Calibration', {
            'fields': ('calibration_value', 'min_value', 'max_value')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(SensorData)
class SensorDataAdmin(admin.ModelAdmin):
    """Sensor Data Admin"""
    list_display = ['sensor', 'temperature', 'humidity', 'light_level', 'distance', 'motion_detected', 'timestamp']
    list_filter = ['sensor', 'timestamp', 'motion_detected']
    search_fields = ['sensor__name']
    date_hierarchy = 'timestamp'
    readonly_fields = ['timestamp']


@admin.register(SensorAlert)
class SensorAlertAdmin(admin.ModelAdmin):
    """Sensor Alert Admin"""
    list_display = ['sensor', 'alert_type', 'severity', 'message', 'is_resolved', 'created_at']
    list_filter = ['alert_type', 'severity', 'is_resolved', 'created_at']
    search_fields = ['sensor__name', 'message']
    readonly_fields = ['created_at']
    
    actions = ['resolve_alerts']
    
    def resolve_alerts(self, request, queryset):
        queryset.update(is_resolved=True, resolved_at=timezone.now())
    resolve_alerts.short_description = "Mark selected alerts as resolved"


@admin.register(SensorThreshold)
class SensorThresholdAdmin(admin.ModelAdmin):
    """Sensor Threshold Admin"""
    list_display = ['name', 'sensor', 'condition_type', 'min_value', 'max_value', 'action_type', 'is_active']
    list_filter = ['condition_type', 'action_type', 'is_active']
    search_fields = ['name', 'sensor__name']


@admin.register(SensorStatistics)
class SensorStatisticsAdmin(admin.ModelAdmin):
    """Sensor Statistics Admin"""
    list_display = ['sensor', 'period_type', 'period_start', 'period_end', 'avg_value', 'reading_count']
    list_filter = ['period_type', 'sensor']
    readonly_fields = ['period_start', 'period_end']


@admin.register(SensorCalibration)
class SensorCalibrationAdmin(admin.ModelAdmin):
    """Sensor Calibration Admin"""
    list_display = ['sensor', 'old_offset', 'new_offset', 'calibrated_by', 'created_at']
    list_filter = ['created_at']
    search_fields = ['sensor__name', 'calibrated_by__username']
    readonly_fields = ['created_at']