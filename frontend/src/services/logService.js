import apiService from './api';

class LogService {
  // Get activity logs
  async getActivityLogs(filters = {}) {
    try {
      const response = await apiService.get('/logs/activity/', filters);
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

  // Get recent activity logs
  async getRecentActivity(limit = 20) {
    try {
      const response = await apiService.get('/logs/activity/recent/', { limit });
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

  // Get logs by user
  async getLogsByUser(userId, days = 7) {
    try {
      const response = await apiService.get('/logs/activity/by_user/', {
        user_id: userId,
        days
      });
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

  // Get device logs
  async getDeviceLogs(filters = {}) {
    try {
      const response = await apiService.get('/logs/device/', filters);
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

  // Get device statistics
  async getDeviceStats(deviceId, days = 7) {
    try {
      const response = await apiService.get('/logs/device/stats/', {
        device_id: deviceId,
        days
      });
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

  // Get security logs
  async getSecurityLogs(filters = {}) {
    try {
      const response = await apiService.get('/logs/security/', filters);
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

  // Get PIN attempt statistics
  async getPinStats(days = 7) {
    try {
      const response = await apiService.get('/logs/security/pin_attempts/', { days });
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

  // Get system logs
  async getSystemLogs(filters = {}) {
    try {
      const response = await apiService.get('/logs/system/', filters);
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

  // Get system errors
  async getSystemErrors() {
    try {
      const response = await apiService.get('/logs/system/errors/');
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

  // Get energy logs
  async getEnergyLogs(filters = {}) {
    try {
      const response = await apiService.get('/logs/energy/', filters);
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
  async getEnergySummary(days = 30) {
    try {
      const response = await apiService.get('/logs/energy/summary/', { days });
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

  // Get notification logs
  async getNotificationLogs(filters = {}) {
    try {
      const response = await apiService.get('/logs/notifications/', filters);
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

  // Get log dashboard
  async getDashboard() {
    try {
      const response = await apiService.get('/logs/dashboard/');
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

  // Export logs
  async exportLogs(logType, startDate = null, endDate = null, format = 'json') {
    try {
      const payload = {
        log_type: logType,
        format
      };
      if (startDate) payload.start_date = startDate;
      if (endDate) payload.end_date = endDate;

      const response = await apiService.post('/logs/export/', payload);
      
      if (response.success && format === 'json') {
        return {
          success: true,
          data: response.data
        };
      }
      
      return {
        success: response.success,
        message: response.message || 'Logs exported successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Clear old logs
  async clearLogs(olderThan = 30, logType = 'all') {
    try {
      const response = await apiService.delete('/logs/clear/', {
        older_than: olderThan,
        type: logType
      });
      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Logs cleared successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Search logs
  async searchLogs(searchTerm, logType = 'all', limit = 50) {
    try {
      let response;
      const params = { search: searchTerm, limit };

      if (logType === 'activity' || logType === 'all') {
        response = await apiService.get('/logs/activity/', params);
      } else if (logType === 'device') {
        response = await apiService.get('/logs/device/', params);
      } else if (logType === 'security') {
        response = await apiService.get('/logs/security/', params);
      } else if (logType === 'system') {
        response = await apiService.get('/logs/system/', params);
      }

      return {
        success: response?.success || false,
        data: response?.data || []
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message
      };
    }
  }

  // Get log statistics
  async getStatistics() {
    try {
      const response = await apiService.get('/logs/dashboard/');
      return {
        success: response.success,
        data: {
          total_logs: response.data?.total_logs || 0,
          activity_count: response.data?.activity_count || 0,
          device_count: response.data?.device_count || 0,
          security_count: response.data?.security_count || 0,
          system_count: response.data?.system_count || 0,
          energy_count: response.data?.energy_count || 0,
          critical_logs: response.data?.critical_logs || 0,
          warning_logs: response.data?.warning_logs || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        data: {},
        message: error.message
      };
    }
  }
}

const logService = new LogService();
export default logService;