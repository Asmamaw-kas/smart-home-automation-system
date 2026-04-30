import apiService from './api';

class CameraService {
  // Get all cameras
  async getAllCameras(filters = {}) {
    try {
      const response = await apiService.get('/camera/cameras/', filters);
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

  // Get camera by ID
  async getCameraById(cameraId) {
    try {
      const response = await apiService.get(`/camera/cameras/${cameraId}/`);
      return {
        success: response.success,
        data: response.data || null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  }

  // Create new camera
  async createCamera(cameraData) {
    try {
      const response = await apiService.post('/camera/cameras/', cameraData);
      return {
        success: response.success,
        data: response.data || null,
        message: 'Camera added successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  }

  // Update camera
  async updateCamera(cameraId, cameraData) {
    try {
      const response = await apiService.patch(`/camera/cameras/${cameraId}/`, cameraData);
      return {
        success: response.success,
        data: response.data || null,
        message: 'Camera updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  }

  // Delete camera
  async deleteCamera(cameraId) {
    try {
      const response = await apiService.delete(`/camera/cameras/${cameraId}/`);
      return {
        success: response.success,
        message: 'Camera deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get stream URL
  getStreamUrl(cameraId) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    return `${baseUrl}/camera/stream/${cameraId}/`;
  }

  // Get MJPEG stream URL
getMjpegStreamUrl(cameraId) {
    // Temporarily hardcode to debug
    console.log('Stream URL for camera:', cameraId);
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const url = `${baseUrl}/camera/mjpeg/${cameraId}/`;
    console.log('Full URL:', url);
    return url;
}

  // Get snapshot URL
getSnapshotUrl(cameraId) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const url = `${baseUrl}/camera/snapshot/${cameraId}/`;
    console.log('Snapshot URL:', url);
    return url;
}

  // Start recording
  async startRecording(cameraId) {
    try {
      const response = await apiService.post(`/camera/cameras/${cameraId}/start_recording/`);
      return {
        success: response.success,
        message: response.message || 'Recording started'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Stop recording
  async stopRecording(cameraId) {
    try {
      const response = await apiService.post(`/camera/cameras/${cameraId}/stop_recording/`);
      return {
        success: response.success,
        message: response.message || 'Recording stopped'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Take snapshot
  async takeSnapshot(cameraId, notes = '') {
    try {
      const response = await apiService.post(`/camera/cameras/${cameraId}/take_snapshot/`, { notes });
      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Snapshot taken'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // PTZ control
  async ptzControl(cameraId, pan = null, tilt = null, zoom = null) {
    try {
      const data = {};
      if (pan !== null) data.pan = pan;
      if (tilt !== null) data.tilt = tilt;
      if (zoom !== null) data.zoom = zoom;
      
      const response = await apiService.post(`/camera/cameras/${cameraId}/ptz_control/`, data);
      return {
        success: response.success,
        data: response.data,
        message: response.message || 'PTZ control executed'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get recordings
  async getRecordings(cameraId = null) {
    try {
      let url = '/camera/cameras/recordings/';
      if (cameraId) {
        url = `/camera/cameras/${cameraId}/recordings_list/`;
      }
      const response = await apiService.get(url);
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

  // Get motion events
  async getMotionEvents() {
    try {
      const response = await apiService.get('/camera/cameras/motion_events/');
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
}

const cameraService = new CameraService();
export default cameraService;