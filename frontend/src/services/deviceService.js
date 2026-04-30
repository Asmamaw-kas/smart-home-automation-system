import apiService from './api';

class DeviceService {
  // Get all devices
  async getAllDevices(filters = {}) {
    try {
      const response = await apiService.get('/devices/devices/', filters);
      return {
        success: response.success,
        data: response.data || []
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message
      };
    }
  }

  // Get device by ID
  async getDeviceById(deviceId) {
    try {
      const response = await apiService.get(`/devices/devices/${deviceId}/`);
      return {
        success: response.success,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  }

  // Create new device
  async createDevice(deviceData) {
    try {
      const response = await apiService.post('/devices/devices/', deviceData);
      return {
        success: response.success,
        data: response.data,
        message: 'Device created successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  }

  // Update device
  async updateDevice(deviceId, deviceData) {
    try {
      const response = await apiService.patch(`/devices/devices/${deviceId}/`, deviceData);
      return {
        success: response.success,
        data: response.data,
        message: 'Device updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  }

  // Delete device
  async deleteDevice(deviceId) {
    try {
      const response = await apiService.delete(`/devices/devices/${deviceId}/`);
      return {
        success: response.success,
        message: response.message || 'Device deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Control device
  async controlDevice(deviceId, action, value = null, duration = null) {
    try {
      const payload = { action };
      if (value !== null) payload.value = value;
      if (duration !== null) payload.duration = duration;

      const response = await apiService.post(`/devices/devices/${deviceId}/control/`, payload);
      return {
        success: response.success,
        data: response.data,
        message: response.message || `Device ${action} successful`
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get device history
  async getDeviceHistory(deviceId, hours = 24) {
    try {
      const response = await apiService.get(`/devices/devices/${deviceId}/history/`, { hours });
      return {
        success: response.success,
        data: response.data || []
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message
      };
    }
  }

  // Get devices grouped by room
  async getDevicesByRoom() {
    try {
      const response = await apiService.get('/devices/devices/by_room/');
      return {
        success: response.success,
        data: response.data || {}
      };
    } catch (error) {
      return {
        success: false,
        data: {},
        message: error.message
      };
    }
  }

  // Get device summary
  async getDeviceSummary() {
    try {
      const response = await apiService.get('/devices/devices/summary/');
      return {
        success: response.success,
        data: response.data || {}
      };
    } catch (error) {
      return {
        success: false,
        data: {},
        message: error.message
      };
    }
  }

  // Calibrate device
  async calibrateDevice(deviceId, value) {
    try {
      const response = await apiService.post(`/devices/devices/${deviceId}/calibrate/`, { value });
      return {
        success: response.success,
        message: response.message || 'Device calibrated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get all automation rules
  async getAutomationRules() {
    try {
      const response = await apiService.get('/devices/automations/');
      return {
        success: response.success,
        data: response.data || []
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message
      };
    }
  }

  // Create automation rule
  async createAutomationRule(ruleData) {
    try {
      const response = await apiService.post('/devices/automations/', ruleData);
      return {
        success: response.success,
        data: response.data,
        message: 'Automation rule created successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  }

  // Update automation rule
  async updateAutomationRule(ruleId, ruleData) {
    try {
      const response = await apiService.patch(`/devices/automations/${ruleId}/`, ruleData);
      return {
        success: response.success,
        data: response.data,
        message: 'Automation rule updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  }

  // Delete automation rule
  async deleteAutomationRule(ruleId) {
    try {
      const response = await apiService.delete(`/devices/automations/${ruleId}/`);
      return {
        success: response.success,
        message: 'Automation rule deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Test automation rule
  async testAutomationRule(ruleId, context = {}) {
    try {
      const response = await apiService.post(`/devices/automations/${ruleId}/test/`, { context });
      return {
        success: response.success,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Check all automation rules
  async checkAllAutomationRules(context = {}) {
    try {
      const response = await apiService.post('/devices/automations/check_all/', { context });
      return {
        success: response.success,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get all scenes
  async getScenes() {
    try {
      const response = await apiService.get('/devices/scenes/');
      return {
        success: response.success,
        data: response.data || []
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message
      };
    }
  }

  // Create scene
  async createScene(sceneData) {
    try {
      const response = await apiService.post('/devices/scenes/', sceneData);
      return {
        success: response.success,
        data: response.data,
        message: 'Scene created successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  }

  // Update scene
  async updateScene(sceneId, sceneData) {
    try {
      const response = await apiService.patch(`/devices/scenes/${sceneId}/`, sceneData);
      return {
        success: response.success,
        data: response.data,
        message: 'Scene updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  }

  // Delete scene
  async deleteScene(sceneId) {
    try {
      const response = await apiService.delete(`/devices/scenes/${sceneId}/`);
      return {
        success: response.success,
        message: 'Scene deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Activate scene
  async activateScene(sceneId) {
    try {
      const response = await apiService.post(`/devices/scenes/${sceneId}/activate/`);
      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Scene activated'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get all schedules
  async getSchedules() {
    try {
      const response = await apiService.get('/devices/schedules/');
      return {
        success: response.success,
        data: response.data || []
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message
      };
    }
  }

  // Create schedule
  async createSchedule(scheduleData) {
    try {
      const response = await apiService.post('/devices/schedules/', scheduleData);
      return {
        success: response.success,
        data: response.data,
        message: 'Schedule created successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  }

  // Update schedule
  async updateSchedule(scheduleId, scheduleData) {
    try {
      const response = await apiService.patch(`/devices/schedules/${scheduleId}/`, scheduleData);
      return {
        success: response.success,
        data: response.data,
        message: 'Schedule updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  }

  // Delete schedule
  async deleteSchedule(scheduleId) {
    try {
      const response = await apiService.delete(`/devices/schedules/${scheduleId}/`);
      return {
        success: response.success,
        message: 'Schedule deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Execute schedule
  async executeSchedule(scheduleId) {
    try {
      const response = await apiService.post(`/devices/schedules/${scheduleId}/execute/`);
      return {
        success: response.success,
        message: response.message || 'Schedule executed'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get upcoming schedules
  async getUpcomingSchedules() {
    try {
      const response = await apiService.get('/devices/schedules/upcoming/');
      return {
        success: response.success,
        data: response.data || []
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message
      };
    }
  }

  // Get device groups
  async getDeviceGroups() {
    try {
      const response = await apiService.get('/devices/groups/');
      return {
        success: response.success,
        data: response.data || []
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message
      };
    }
  }

  // Create device group
  async createDeviceGroup(groupData) {
    try {
      const response = await apiService.post('/devices/groups/', groupData);
      return {
        success: response.success,
        data: response.data,
        message: 'Group created successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  }

  // Update device group
  async updateDeviceGroup(groupId, groupData) {
    try {
      const response = await apiService.patch(`/devices/groups/${groupId}/`, groupData);
      return {
        success: response.success,
        data: response.data,
        message: 'Group updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  }

  // Delete device group
  async deleteDeviceGroup(groupId) {
    try {
      const response = await apiService.delete(`/devices/groups/${groupId}/`);
      return {
        success: response.success,
        message: 'Group deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Control device group
  async controlDeviceGroup(groupId, action, value = null) {
    try {
      const payload = { action };
      if (value !== null) payload.value = value;

      const response = await apiService.post(`/devices/groups/${groupId}/control/`, payload);
      return {
        success: response.success,
        data: response.data,
        message: response.message || `Group ${action} successful`
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get energy monitoring data
  async getEnergyData(filters = {}) {
    try {
      const response = await apiService.get('/devices/energy/', filters);
      return {
        success: response.success,
        data: response.data || []
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message
      };
    }
  }

  // Get energy summary
  async getEnergySummary(days = 7) {
    try {
      const response = await apiService.get('/devices/energy/summary/', { days });
      return {
        success: response.success,
        data: response.data || {}
      };
    } catch (error) {
      return {
        success: false,
        data: {},
        message: error.message
      };
    }
  }

  // Get device dashboard
  async getDashboard() {
    try {
      const response = await apiService.get('/devices/dashboard/');
      return {
        success: response.success,
        data: response.data || {}
      };
    } catch (error) {
      return {
        success: false,
        data: {},
        message: error.message
      };
    }
  }

  // Bulk control devices
  async bulkControlDevices(deviceIds, action, value = null) {
    try {
      const payload = {
        device_ids: deviceIds,
        action
      };
      if (value !== null) payload.value = value;

      const response = await apiService.post('/devices/bulk-control/', payload);
      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Bulk control executed'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Emergency control
  async emergencyControl(action) {
    try {
      const response = await apiService.post('/devices/emergency/', { action });
      return {
        success: response.success,
        message: response.message || 'Emergency action executed'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

const deviceService = new DeviceService();
export default deviceService;