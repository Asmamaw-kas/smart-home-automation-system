"""
User models for authentication and profile management
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    """Custom User model extending Django's AbstractUser"""
    # Personal information
    phone_number = models.CharField(max_length=15, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    
    # Account status
    is_email_verified = models.BooleanField(default=False)
    is_2fa_enabled = models.BooleanField(default=False)
    
    # Security
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    
    # Preferences
    notification_enabled = models.BooleanField(default=True)
    theme_preference = models.CharField(
        max_length=10,
        choices=[('light', 'Light'), ('dark', 'Dark'), ('auto', 'Auto')],
        default='auto'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.username
    
    def get_full_name(self):
        """Return full name"""
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    def increment_login_attempts(self):
        """Increment failed login attempts and lock account if needed"""
        self.login_attempts += 1
        if self.login_attempts >= 5:  # Lock after 5 failed attempts
            self.locked_until = timezone.now() + timezone.timedelta(minutes=30)
        self.save()
    
    def reset_login_attempts(self):
        """Reset failed login attempts"""
        self.login_attempts = 0
        self.locked_until = None
        self.save()
    
    def is_account_locked(self):
        """Check if account is locked"""
        if self.locked_until and self.locked_until > timezone.now():
            return True
        return False


class LoginHistory(models.Model):
    """Track user login history"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_history')
    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    device_type = models.CharField(max_length=20, choices=[
        ('desktop', 'Desktop'),
        ('mobile', 'Mobile'),
        ('tablet', 'Tablet'),
        ('unknown', 'Unknown')
    ], default='unknown')
    browser = models.CharField(max_length=50, blank=True)
    os = models.CharField(max_length=50, blank=True)
    location = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('locked', 'Locked')
    ], default='success')
    
    class Meta:
        db_table = 'login_history'
        ordering = ['-login_time']
    
    def __str__(self):
        return f"{self.user.username} - {self.login_time}"


class SecurityQuestion(models.Model):
    """Security questions for password recovery"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='security_questions')
    question = models.CharField(max_length=200)
    answer = models.CharField(max_length=200)  # Should be hashed in production
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'security_questions'
    
    def __str__(self):
        return f"{self.user.username} - {self.question}"


class NotificationPreference(models.Model):
    """User notification preferences"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_prefs')
    
    # Email notifications
    email_login_alerts = models.BooleanField(default=True)
    email_device_alerts = models.BooleanField(default=True)
    email_security_alerts = models.BooleanField(default=True)
    email_daily_summary = models.BooleanField(default=False)
    
    # Push notifications (for future use)
    push_enabled = models.BooleanField(default=False)
    push_login_alerts = models.BooleanField(default=True)
    push_device_alerts = models.BooleanField(default=True)
    
    # SMS notifications
    sms_enabled = models.BooleanField(default=False)
    sms_phone_number = models.CharField(max_length=15, blank=True)
    sms_alerts = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'notification_preferences'
    
    def __str__(self):
        return f"{self.user.username}'s preferences"