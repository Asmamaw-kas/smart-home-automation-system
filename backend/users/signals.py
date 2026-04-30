"""
Signals for users app - Handles user lifecycle events
"""
from django.db.models.signals import post_save, pre_save, post_delete
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import LoginHistory, NotificationPreference, SecurityQuestion

User = get_user_model()

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create user profile and default settings when a new user is created"""
    if created:
        # Create notification preferences
        NotificationPreference.objects.get_or_create(user=instance)
        
        # Log user creation
        from logs.models import ActivityLog
        ActivityLog.objects.create(
            action_type='USER_ADD',
            severity='info',
            description=f"New user account created: {instance.username}",
            user=instance,
            username=instance.username,
            extra_data={
                'email': instance.email,
                'is_staff': instance.is_staff
            }
        )

@receiver(pre_save, sender=User)
def track_user_changes(sender, instance, **kwargs):
    """Track changes to user accounts before saving"""
    if instance.pk:
        try:
            old_user = User.objects.get(pk=instance.pk)
            
            # Track important changes
            changes = []
            
            if old_user.is_active != instance.is_active:
                changes.append(f"active status changed from {old_user.is_active} to {instance.is_active}")
            
            if old_user.is_staff != instance.is_staff:
                changes.append(f"staff status changed from {old_user.is_staff} to {instance.is_staff}")
            
            if old_user.email != instance.email:
                changes.append(f"email changed from {old_user.email} to {instance.email}")
            
            if old_user.username != instance.username:
                changes.append(f"username changed from {old_user.username} to {instance.username}")
            
            # Store changes to be logged after save
            if changes:
                instance._changed_fields = changes
        except User.DoesNotExist:
            pass

@receiver(post_save, sender=User)
def log_user_changes(sender, instance, created, **kwargs):
    """Log changes to user accounts after saving"""
    if not created and hasattr(instance, '_changed_fields'):
        from logs.models import ActivityLog
        ActivityLog.objects.create(
            action_type='USER_UPDATE',
            severity='info',
            description=f"User account updated: {instance.username}",
            user=instance,
            username=instance.username,
            extra_data={
                'changes': instance._changed_fields
            }
        )
        del instance._changed_fields

@receiver(post_delete, sender=User)
def log_user_deletion(sender, instance, **kwargs):
    """Log when a user is deleted"""
    from logs.models import ActivityLog
    ActivityLog.objects.create(
        action_type='USER_DELETE',
        severity='warning',
        description=f"User account deleted: {instance.username}",
        username=instance.username,
        extra_data={
            'email': instance.email,
            'was_staff': instance.is_staff
        }
    )

@receiver(user_logged_in)
def handle_user_login(sender, request, user, **kwargs):
    """Handle successful user login"""
    # Get client info
    ip_address = request.META.get('REMOTE_ADDR')
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    # Determine device type
    device_type = 'unknown'
    browser = 'unknown'
    os = 'unknown'
    
    if user_agent:
        user_agent_lower = user_agent.lower()
        
        # Detect device type
        if 'mobile' in user_agent_lower:
            device_type = 'mobile'
        elif 'tablet' in user_agent_lower or 'ipad' in user_agent_lower:
            device_type = 'tablet'
        elif 'windows' in user_agent_lower or 'mac' in user_agent_lower or 'linux' in user_agent_lower:
            device_type = 'desktop'
        
        # Detect browser
        if 'chrome' in user_agent_lower and 'edge' not in user_agent_lower:
            browser = 'Chrome'
        elif 'firefox' in user_agent_lower:
            browser = 'Firefox'
        elif 'safari' in user_agent_lower and 'chrome' not in user_agent_lower:
            browser = 'Safari'
        elif 'edge' in user_agent_lower:
            browser = 'Edge'
        
        # Detect OS
        if 'windows' in user_agent_lower:
            os = 'Windows'
        elif 'mac' in user_agent_lower:
            os = 'macOS'
        elif 'linux' in user_agent_lower:
            os = 'Linux'
        elif 'android' in user_agent_lower:
            os = 'Android'
        elif 'ios' in user_agent_lower or 'iphone' in user_agent_lower or 'ipad' in user_agent_lower:
            os = 'iOS'
    
    # Create login history record
    LoginHistory.objects.create(
        user=user,
        ip_address=ip_address,
        user_agent=user_agent,
        device_type=device_type,
        browser=browser,
        os=os,
        status='success'
    )
    
    # Update user's last login info
    user.last_login = timezone.now()
    user.last_login_ip = ip_address
    user.save(update_fields=['last_login', 'last_login_ip'])
    
    # Reset login attempts on successful login
    user.reset_login_attempts()
    
    # Log to activity log
    from logs.models import ActivityLog
    ActivityLog.objects.create(
        action_type='LOGIN',
        severity='info',
        description=f"User {user.username} logged in successfully",
        user=user,
        username=user.username,
        ip_address=ip_address,
        user_agent=user_agent,
        device_type=device_type,
        browser=browser,
        os=os
    )
    
    # Check if this is a new device (simplified check)
    recent_logins = LoginHistory.objects.filter(
        user=user,
        device_type=device_type,
        browser=browser,
        os=os
    ).exclude(id=user.login_history.latest('id').id if user.login_history.exists() else None).count()
    
    if recent_logins == 0 and user.notification_prefs.email_login_alerts:
        # This would trigger an email notification about new device login
        # You can implement email sending here
        pass

@receiver(user_logged_out)
def handle_user_logout(sender, request, user, **kwargs):
    """Handle user logout"""
    if user:
        # Update the most recent login record with logout time
        try:
            latest_login = LoginHistory.objects.filter(
                user=user,
                logout_time__isnull=True
            ).latest('login_time')
            latest_login.logout_time = timezone.now()
            latest_login.save(update_fields=['logout_time'])
        except LoginHistory.DoesNotExist:
            pass
        
        # Log to activity log
        from logs.models import ActivityLog
        ActivityLog.objects.create(
            action_type='LOGOUT',
            severity='info',
            description=f"User {user.username} logged out",
            user=user,
            username=user.username,
            ip_address=request.META.get('REMOTE_ADDR')
        )

@receiver(user_login_failed)
def handle_failed_login(sender, credentials, request, **kwargs):
    """Handle failed login attempt"""
    username = credentials.get('username', 'unknown')
    ip_address = request.META.get('REMOTE_ADDR') if request else None
    user_agent = request.META.get('HTTP_USER_AGENT', '') if request else ''
    
    # Try to find the user
    try:
        user = User.objects.get(username=username)
        
        # Increment login attempts
        user.increment_login_attempts()
        
        # Create login history record
        LoginHistory.objects.create(
            user=user,
            ip_address=ip_address,
            user_agent=user_agent,
            status='failed'
        )
        
        # Check if account is now locked
        if user.is_account_locked():
            from logs.models import ActivityLog, NotificationLog
            ActivityLog.objects.create(
                action_type='ACCOUNT_LOCKED',
                severity='warning',
                description=f"User account {username} locked due to too many failed attempts",
                user=user,
                username=username,
                ip_address=ip_address,
                extra_data={'attempts': user.login_attempts}
            )
            
            # Could send notification email here
            
    except User.DoesNotExist:
        # User doesn't exist, just log the attempt
        pass
    
    # Log failed login attempt
    from logs.models import ActivityLog
    ActivityLog.objects.create(
        action_type='LOGIN_FAILED',
        severity='warning',
        description=f"Failed login attempt for username: {username}",
        username=username,
        ip_address=ip_address,
        user_agent=user_agent
    )

@receiver(post_save, sender=NotificationPreference)
def handle_notification_preference_change(sender, instance, created, **kwargs):
    """Log when notification preferences are changed"""
    if not created:
        from logs.models import ActivityLog
        ActivityLog.objects.create(
            action_type='CONFIG_CHANGE',
            severity='info',
            description=f"User {instance.user.username} updated notification preferences",
            user=instance.user,
            username=instance.user.username
        )

@receiver(post_save, sender=SecurityQuestion)
def handle_security_question_added(sender, instance, created, **kwargs):
    """Log when security questions are added/updated"""
    if created:
        from logs.models import ActivityLog
        ActivityLog.objects.create(
            action_type='CONFIG_CHANGE',
            severity='info',
            description=f"User {instance.user.username} added a security question",
            user=instance.user,
            username=instance.user.username
        )

@receiver(post_delete, sender=SecurityQuestion)
def handle_security_question_deleted(sender, instance, **kwargs):
    """Log when security questions are deleted"""
    from logs.models import ActivityLog
    ActivityLog.objects.create(
        action_type='CONFIG_CHANGE',
        severity='warning',
        description=f"User {instance.user.username} removed a security question",
        user=instance.user,
        username=instance.user.username
    )

# Signal to clean up related data when user is deactivated
@receiver(pre_save, sender=User)
def handle_user_deactivation(sender, instance, **kwargs):
    """Handle user deactivation - clean up sessions, tokens, etc."""
    if instance.pk:
        try:
            old_user = User.objects.get(pk=instance.pk)
            if old_user.is_active and not instance.is_active:
                # User is being deactivated
                from logs.models import ActivityLog
                ActivityLog.objects.create(
                    action_type='USER_INACTIVE',
                    severity='warning',
                    description=f"User account {instance.username} deactivated",
                    user=instance,
                    username=instance.username
                )
                # Here you could also:
                # - Invalidate all user sessions
                # - Revoke all refresh tokens
                # - Close any open WebSocket connections
        except User.DoesNotExist:
            pass

# Signal for when a user changes their password (can be called from views)
def log_password_change(user, request=None):
    """Log when user changes password (called from views, not a signal)"""
    from logs.models import ActivityLog
    ip_address = request.META.get('REMOTE_ADDR') if request else None
    
    ActivityLog.objects.create(
        action_type='PASSWORD_CHANGE',
        severity='info',
        description=f"User {user.username} changed their password",
        user=user,
        username=user.username,
        ip_address=ip_address
    )

# Signal for when admin resets user password
def log_password_reset(user, reset_by=None):
    """Log when password is reset (called from views)"""
    from logs.models import ActivityLog
    ActivityLog.objects.create(
        action_type='PASSWORD_RESET',
        severity='info',
        description=f"Password reset for user {user.username}",
        user=user,
        username=user.username,
        extra_data={'reset_by': reset_by.username if reset_by else 'system'}
    )

# Signal for when 2FA is toggled
def log_2fa_toggle(user, enabled):
    """Log when 2FA is enabled/disabled (called from views)"""
    from logs.models import ActivityLog
    ActivityLog.objects.create(
        action_type='CONFIG_CHANGE',
        severity='info',
        description=f"User {user.username} {'enabled' if enabled else 'disabled'} 2FA",
        user=user,
        username=user.username
    )

# Signal for when email is verified
def log_email_verified(user):
    """Log when email is verified (called from views)"""
    from logs.models import ActivityLog
    ActivityLog.objects.create(
        action_type='CONFIG_CHANGE',
        severity='info',
        description=f"User {user.username} verified their email",
        user=user,
        username=user.username
    )

# Signal to check for suspicious activity
@receiver(post_save, sender=LoginHistory)
def check_suspicious_activity(sender, instance, created, **kwargs):
    """Check for suspicious login patterns"""
    if created and instance.status == 'success':
        # Check for multiple failed attempts before success
        recent_failures = LoginHistory.objects.filter(
            user=instance.user,
            status='failed',
            login_time__gte=timezone.now() - timezone.timedelta(minutes=30)
        ).count()
        
        if recent_failures >= 3:
            from logs.models import ActivityLog
            ActivityLog.objects.create(
                action_type='SECURITY_ALERT',
                severity='warning',
                description=f"Suspicious activity: Successful login after {recent_failures} failed attempts",
                user=instance.user,
                username=instance.user.username,
                ip_address=instance.ip_address,
                extra_data={'failed_attempts': recent_failures}
            )
        
        # Check for login from different geographic locations in short time
        # This would require IP geolocation - can be added later