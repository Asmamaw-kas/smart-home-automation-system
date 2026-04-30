import apiService from './api';

class SensorService {
  // Get all sensors
  async getAllSensors(filters = {}) {
    try {
      const response = await apiService.get('/sensors/sensors/', filters);
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

  // Get sensor by ID
  async getSensorById(sensorId) {
    try {
      const response = await apiService.get(`/sensors/sensors/${sensorId}/`);
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

  // Create new sensor
  async createSensor(sensorData) {
    try {
      const response = await apiService.post('/sensors/sensors/', sensorData);
      return {
        success: response.success,
        data: response.data,
        message: 'Sensor created successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  }

  // Update sensor
  async updateSensor(sensorId, sensorData) {
    try {
      const response = await apiService.patch(`/sensors/sensors/${sensorId}/`, sensorData);
      return {
        success: response.success,
        data: response.data,
        message: 'Sensor updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  }

  // Delete sensor
  async deleteSensor(sensorId) {
    try {
      const response = await apiService.delete(`/sensors/sensors/${sensorId}/`);
      return {
        success: response.success,
        message: 'Sensor deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get sensor readings
  async getSensorReadings(sensorId, hours = 24) {
    try {
      const response = await apiService.get(`/sensors/sensors/${sensorId}/readings/`, { hours });
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

  // Calibrate sensor
  async calibrateSensor(sensorId, calibrationData) {
    try {
      const response = await apiService.post(`/sensors/sensors/${sensorId}/calibrate/`, calibrationData);
      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Sensor calibrated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Test sensor
  async testSensor(sensorId) {
    try {
      const response = await apiService.post(`/sensors/sensors/${sensorId}/test/`);
      return {
        success: response.success,
        message: response.message || 'Sensor test completed'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get all sensor data
  async getAllSensorData(filters = {}) {
    try {
      const response = await apiService.get('/sensors/data/', filters);
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

  // Get current readings
  async getCurrentReadings() {
    try {
      const response = await apiService.get('/sensors/current/');
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

  // Get sensor alerts
  async getAlerts(filters = {}) {
    try {
      const response = await apiService.get('/sensors/alerts/', filters);
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

  // Acknowledge alert
  async acknowledgeAlert(alertId) {
    try {
      const response = await apiService.post(`/sensors/alerts/${alertId}/acknowledge/`);
      return {
        success: response.success,
        message: 'Alert acknowledged'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Resolve alert
  async resolveAlert(alertId) {
    try {
      const response = await apiService.post(`/sensors/alerts/${alertId}/resolve/`);
      return {
        success: response.success,
        message: 'Alert resolved'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get sensor thresholds
  async getThresholds() {
    try {
      const response = await apiService.get('/sensors/thresholds/');
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

  // Create sensor threshold
  async createThreshold(thresholdData) {
    try {
      const response = await apiService.post('/sensors/thresholds/', thresholdData);
      return {
        success: response.success,
        data: response.data,
        message: 'Threshold created successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  }

  // Update sensor threshold
  async updateThreshold(thresholdId, thresholdData) {
    try {
      const response = await apiService.patch(`/sensors/thresholds/${thresholdId}/`, thresholdData);
      return {
        success: response.success,
        data: response.data,
        message: 'Threshold updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  }

  // Delete sensor threshold
  async deleteThreshold(thresholdId) {
    try {
      const response = await apiService.delete(`/sensors/thresholds/${thresholdId}/`);
      return {
        success: response.success,
        message: 'Threshold deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get sensor dashboard
  async getDashboard() {
    try {
      const response = await apiService.get('/sensors/dashboard/');
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

  // Get chart data
  async getChartData(sensorType = 'temperature', period = '24h') {
    try {
      const response = await apiService.get('/sensors/charts/', {
        type: sensorType,
        period
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

  // Get sensor statistics
  async getStatistics() {
    try {
      const response = await apiService.get('/sensors/statistics/');
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

  // Bulk upload sensor data (for testing/development)
  async bulkUploadData(readings) {
    try {
      const response = await apiService.post('/sensors/data/bulk/', { readings });
      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Bulk upload completed'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

const sensorService = new SensorService();
export default sensorService;