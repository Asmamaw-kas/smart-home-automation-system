"""
Admin configuration for users app
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, LoginHistory, SecurityQuestion, NotificationPreference

class CustomUserAdmin(UserAdmin):
    """Custom User Admin"""
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_active', 'is_staff', 'last_login')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'is_email_verified', 'is_2fa_enabled')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('phone_number', 'profile_picture', 'is_email_verified', 
                      'is_2fa_enabled', 'last_login_ip', 'login_attempts', 
                      'locked_until', 'notification_enabled', 'theme_preference')
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('email', 'first_name', 'last_name', 'phone_number')
        }),
    )


@admin.register(LoginHistory)
class LoginHistoryAdmin(admin.ModelAdmin):
    """Login History Admin"""
    list_display = ('user', 'login_time', 'ip_address', 'device_type', 'status')
    list_filter = ('device_type', 'status', 'login_time')
    search_fields = ('user__username', 'ip_address')
    date_hierarchy = 'login_time'


@admin.register(SecurityQuestion)
class SecurityQuestionAdmin(admin.ModelAdmin):
    """Security Question Admin"""
    list_display = ('user', 'question', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'question')


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    """Notification Preference Admin"""
    list_display = ('user', 'email_login_alerts', 'push_enabled', 'sms_enabled')
    list_filter = ('email_login_alerts', 'push_enabled', 'sms_enabled')
    search_fields = ('user__username',)

# Register the custom user admin
admin.site.register(User, CustomUserAdmin)