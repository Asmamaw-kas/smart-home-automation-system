"""
Signals for devices app
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Device, DeviceStatus, AutomationRule
from logs.models import ActivityLog

@receiver(post_save, sender=Device)
def log_device_changes(sender, instance, created, **kwargs):
    """Log device creation/updates"""
    if created:
        ActivityLog.objects.create(
            action_type='DEVICE_ADD',
            description=f"New device added: {instance.name}",
            extra_data={
                'device_id': instance.id,
                'device_type': instance.device_type,
                'room': instance.room
            }
        )
    else:
        ActivityLog.objects.create(
            action_type='DEVICE_UPDATE',
            description=f"Device updated: {instance.name}",
            extra_data={
                'device_id': instance.id
            }
        )

@receiver(pre_save, sender=Device)
def track_device_state_change(sender, instance, **kwargs):
    """Track device state changes"""
    if instance.pk:
        try:
            old = Device.objects.get(pk=instance.pk)
            if old.current_state != instance.current_state:
                # Create status record
                DeviceStatus.objects.create(
                    device=instance,
                    status=instance.current_state,
                    value=instance.current_value
                )
                
                # Log state change
                ActivityLog.objects.create(
                    action_type=f"DEVICE_{instance.current_state.upper()}",
                    description=f"{instance.name} changed from {old.current_state} to {instance.current_state}",
                    content_object=instance
                )
        except Device.DoesNotExist:
            pass

@receiver(post_save, sender=AutomationRule)
def log_automation_changes(sender, instance, created, **kwargs):
    """Log automation rule changes"""
    if created:
        ActivityLog.objects.create(
            action_type='AUTO_RULE_ADD',
            description=f"New automation rule: {instance.name}",
            extra_data={
                'rule_id': instance.id,
                'condition': instance.condition_type
            }
        )
    else:
        ActivityLog.objects.create(
            action_type='AUTO_RULE_UPDATE',
            description=f"Automation rule updated: {instance.name}",
            extra_data={'rule_id': instance.id}
        )