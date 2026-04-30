"""
Admin configuration for devices app
"""
from django.contrib import admin
from django.utils import timezone
from .models import (
    Device, DeviceStatus, AutomationRule, 
    Scene, Schedule, DeviceGroup, EnergyMonitoring
)

@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    """Device Admin"""
    list_display = ['name', 'device_type', 'room', 'status', 'current_state', 'last_updated']
    list_filter = ['device_type', 'status', 'is_active', 'room']
    search_fields = ['name', 'room']
    readonly_fields = ['last_updated', 'created_at', 'energy_today', 'energy_total']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'device_type', 'room', 'icon')
        }),
        ('Hardware', {
            'fields': ('pin_number', 'arduino_id')
        }),
        ('Status', {
            'fields': ('status', 'is_active', 'current_state', 'last_updated')
        }),
        ('Capabilities', {
            'fields': ('supports_dimming', 'supports_color', 'supports_speed', 'supports_temperature')
        }),
        ('Values', {
            'fields': ('min_value', 'max_value', 'current_value')
        }),
        ('Energy', {
            'fields': ('power_rating', 'energy_today', 'energy_total')
        }),
        ('Metadata', {
            'fields': ('created_at', 'created_by'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['turn_on', 'turn_off', 'reset_energy']
    
    def turn_on(self, request, queryset):
        queryset.update(current_state='on', last_updated=timezone.now())
        self.message_user(request, f"{queryset.count()} devices turned on")
    turn_on.short_description = "Turn on selected devices"
    
    def turn_off(self, request, queryset):
        queryset.update(current_state='off', last_updated=timezone.now())
        self.message_user(request, f"{queryset.count()} devices turned off")
    turn_off.short_description = "Turn off selected devices"
    
    def reset_energy(self, request, queryset):
        queryset.update(energy_today=0)
        self.message_user(request, f"Energy reset for {queryset.count()} devices")
    reset_energy.short_description = "Reset energy usage"


@admin.register(DeviceStatus)
class DeviceStatusAdmin(admin.ModelAdmin):
    """Device Status Admin"""
    list_display = ['device', 'status', 'timestamp']
    list_filter = ['status', 'timestamp']
    search_fields = ['device__name']
    date_hierarchy = 'timestamp'


@admin.register(AutomationRule)
class AutomationRuleAdmin(admin.ModelAdmin):
    """Automation Rule Admin"""
    list_display = ['name', 'condition_type', 'action_type', 'target_device', 'is_active', 'trigger_count']
    list_filter = ['condition_type', 'action_type', 'is_active', 'days_of_week']
    search_fields = ['name', 'description']
    readonly_fields = ['last_triggered', 'trigger_count', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'is_active', 'priority')
        }),
        ('Condition', {
            'fields': ('condition_type', 'operator', 'sensor', 'threshold_value', 'threshold_max')
        }),
        ('Time Conditions', {
            'fields': ('specific_time', 'start_time', 'end_time', 'days_of_week'),
            'classes': ('collapse',)
        }),
        ('Action', {
            'fields': ('action_type', 'target_device', 'action_value', 'additional_actions')
        }),
        ('Cooldown', {
            'fields': ('cooldown_minutes', 'last_triggered', 'trigger_count')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        })
    )


@admin.register(Scene)
class SceneAdmin(admin.ModelAdmin):
    """Scene Admin"""
    list_display = ['name', 'is_scheduled', 'schedule_time', 'is_active']
    list_filter = ['is_scheduled', 'is_active']


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    """Schedule Admin"""
    list_display = ['name', 'device', 'time', 'action', 'is_active']
    list_filter = ['is_active', 'days']
    search_fields = ['name', 'device__name']


@admin.register(DeviceGroup)
class DeviceGroupAdmin(admin.ModelAdmin):
    """Device Group Admin"""
    list_display = ['name', 'room', 'device_count']
    filter_horizontal = ['devices']
    
    def device_count(self, obj):
        return obj.devices.count()
    device_count.short_description = 'Devices'


@admin.register(EnergyMonitoring)
class EnergyMonitoringAdmin(admin.ModelAdmin):
    """Energy Monitoring Admin"""
    list_display = ['device', 'power', 'energy', 'timestamp']
    list_filter = ['timestamp']
    search_fields = ['device__name']
    date_hierarchy = 'timestamp'