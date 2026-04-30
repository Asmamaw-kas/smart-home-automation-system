"""
Automation rules engine
"""
import logging
from datetime import datetime
from django.utils import timezone
from devices.models import Device, DeviceLog
from sensors.models import SensorData
from core.serial_handler import SerialHandler, Commands

logger = logging.getLogger(__name__)

class AutomationEngine:
    def __init__(self):
        self.serial_handler = SerialHandler()
        self.rules = {}
        self.load_rules()
    
    def load_rules(self):
        """Load automation rules from database"""
        from devices.models import AutomationRule
        rules = AutomationRule.objects.filter(is_active=True)
        for rule in rules:
            self.rules[rule.id] = rule
    
    def process_sensor_data(self, sensor_data):
        """Process sensor data and trigger automation rules"""
        for rule_id, rule in self.rules.items():
            self._check_rule(rule, sensor_data)
    
    def _check_rule(self, rule, sensor_data):
        """Check if rule conditions are met"""
        condition_met = False
        
        if rule.condition_type == 'TEMPERATURE':
            if rule.operator == 'GT' and sensor_data.temperature > rule.threshold_value:
                condition_met = True
            elif rule.operator == 'LT' and sensor_data.temperature < rule.threshold_value:
                condition_met = True
                
        elif rule.condition_type == 'LIGHT':
            if rule.operator == 'GT' and sensor_data.light_level > rule.threshold_value:
                condition_met = True
            elif rule.operator == 'LT' and sensor_data.light_level < rule.threshold_value:
                condition_met = True
        
        if condition_met:
            self._execute_action(rule)
    
    def _execute_action(self, rule):
        """Execute automation action"""
        try:
            if rule.action_type == 'FAN' and rule.action_value == 'ON':
                self.serial_handler.send_command(Commands.FAN_ON)
                DeviceLog.objects.create(
                    device=Device.objects.get(name='Fan'),
                    action='AUTO_ON',
                    performed_by=None
                )
            elif rule.action_type == 'FAN' and rule.action_value == 'OFF':
                self.serial_handler.send_command(Commands.FAN_OFF)
                
            elif rule.action_type == 'LIGHT' and rule.action_value == 'ON':
                self.serial_handler.send_command(Commands.LIGHT_ON)
            elif rule.action_type == 'LIGHT' and rule.action_value == 'OFF':
                self.serial_handler.send_command(Commands.LIGHT_OFF)
                
            logger.info(f"Executed automation rule {rule.id}: {rule.action_type} {rule.action_value}")
        except Exception as e:
            logger.error(f"Error executing automation rule: {e}")
    
    def add_rule(self, rule):
        """Add a new automation rule"""
        self.rules[rule.id] = rule
    
    def remove_rule(self, rule_id):
        """Remove an automation rule"""
        if rule_id in self.rules:
            del self.rules[rule_id]
    
    def update_rule(self, rule):
        """Update an existing rule"""
        self.rules[rule.id] = rule