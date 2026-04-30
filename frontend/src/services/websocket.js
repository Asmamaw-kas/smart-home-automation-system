// services/websocket.js
class WebSocketService {
  constructor() {
    this.sockets = {};
    this.reconnectAttempts = {};
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
  }

  // Get WebSocket URL
  getWebSocketUrl(path) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = 'localhost:8001'; // Your Django server
    return `${protocol}//${host}${path}`;
  }

  // Connect to WebSocket
  connect(namespace = 'sensors', token = null) {
    if (this.sockets[namespace]) {
      return this.sockets[namespace];
    }

    const wsUrl = this.getWebSocketUrl(`/ws/${namespace}/`);
    const url = token ? `${wsUrl}?token=${token}` : wsUrl;
    
    const socket = new WebSocket(url);
    
    socket.onopen = () => {
      console.log(`WebSocket connected to ${namespace}`);
      this.reconnectAttempts[namespace] = 0;
      this.emit('connection_change', { namespace, connected: true });
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(namespace, data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    socket.onclose = (event) => {
      console.log(`WebSocket disconnected from ${namespace}:`, event.code);
      this.emit('connection_change', { namespace, connected: false });
      this.attemptReconnect(namespace, token);
    };

    socket.onerror = (error) => {
      console.error(`WebSocket error for ${namespace}:`, error);
    };

    this.sockets[namespace] = socket;
    return socket;
  }

  // Handle incoming messages
  handleMessage(namespace, data) {
    const { type } = data;
    
    // Emit to namespace-specific listeners
    this.emit(`${namespace}_${type}`, data);
    
    // Emit to general listeners
    this.emit('message', { namespace, ...data });
  }

  // Send message
  send(namespace, message) {
    const socket = this.sockets[namespace];
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
      return true;
    }
    console.warn(`Cannot send message to ${namespace}: not connected`);
    return false;
  }

  // Attempt reconnection
  attemptReconnect(namespace, token) {
    const attempts = this.reconnectAttempts[namespace] || 0;
    
    if (attempts < this.maxReconnectAttempts) {
      this.reconnectAttempts[namespace] = attempts + 1;
      
      console.log(`Attempting to reconnect to ${namespace}... (${attempts + 1}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        delete this.sockets[namespace];
        this.connect(namespace, token);
      }, this.reconnectInterval);
    } else {
      console.log(`Max reconnection attempts reached for ${namespace}`);
    }
  }

  // Disconnect
  disconnect(namespace = null) {
    if (namespace) {
      const socket = this.sockets[namespace];
      if (socket) {
        socket.close();
        delete this.sockets[namespace];
        delete this.reconnectAttempts[namespace];
      }
    } else {
      // Disconnect all
      Object.keys(this.sockets).forEach(ns => {
        this.sockets[ns].close();
      });
      this.sockets = {};
      this.reconnectAttempts = {};
    }
  }

  // Subscribe to sensors
  subscribeToSensors(callback, token) {
    const socket = this.connect('sensors', token);
    
    const handleSensorMessage = (data) => {
      callback(data);
    };

    this.on('sensors_update', handleSensorMessage);
    this.on('sensors_initial', handleSensorMessage);
    this.on('sensors_history', handleSensorMessage);
    this.on('sensors_broadcast', handleSensorMessage);

    return () => {
      this.off('sensors_update', handleSensorMessage);
      this.off('sensors_initial', handleSensorMessage);
      this.off('sensors_history', handleSensorMessage);
      this.off('sensors_broadcast', handleSensorMessage);
    };
  }

  // Subscribe to devices
  subscribeToDevices(callback, token) {
    const socket = this.connect('devices', token);
    
    const handleDeviceMessage = (data) => {
      callback(data);
    };

    this.on('devices_status', handleDeviceMessage);
    this.on('devices_device_update', handleDeviceMessage);
    this.on('devices_command_success', handleDeviceMessage);
    this.on('devices_command_failed', handleDeviceMessage);
    this.on('devices_emergency', handleDeviceMessage);
    this.on('devices_automation', handleDeviceMessage);
    this.on('devices_threshold_set', handleDeviceMessage);
    this.on('devices_error', handleDeviceMessage);

    return () => {
      this.off('devices_status', handleDeviceMessage);
      this.off('devices_device_update', handleDeviceMessage);
      this.off('devices_command_success', handleDeviceMessage);
      this.off('devices_command_failed', handleDeviceMessage);
      this.off('devices_emergency', handleDeviceMessage);
      this.off('devices_automation', handleDeviceMessage);
      this.off('devices_threshold_set', handleDeviceMessage);
      this.off('devices_error', handleDeviceMessage);
    };
  }

  // Device control methods
  controlDevice(device, action, value = null) {
    return this.send('devices', {
      command: 'control_device',
      device,
      action,
      value
    });
  }

  requestDeviceStatus() {
    return this.send('devices', { command: 'get_status' });
  }

  enableAutomation() {
    return this.send('devices', { command: 'enable_automation' });
  }

  disableAutomation() {
    return this.send('devices', { command: 'disable_automation' });
  }

  emergencyLock() {
    return this.send('devices', { command: 'emergency_lock' });
  }

  setThreshold(device, value) {
    return this.send('devices', {
      command: 'set_threshold',
      device,
      value
    });
  }

  // Sensor methods
  requestSensorHistory(hours = 24) {
    return this.send('sensors', {
      command: 'get_history',
      hours
    });
  }

  ping() {
    return this.send('sensors', { command: 'ping' });
  }

  // Event system
  listeners = {};

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      if (callback) {
        this.listeners[event] = this.listeners[event]
          .filter(cb => cb !== callback);
      } else {
        delete this.listeners[event];
      }
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket listener:', error);
        }
      });
    }
  }

  // Connection status
  isConnected(namespace) {
    return this.sockets[namespace]?.readyState === WebSocket.OPEN;
  }

  getConnectionStatus() {
    const status = {};
    Object.keys(this.sockets).forEach(namespace => {
      status[namespace] = this.isConnected(namespace);
    });
    return status;
  }
}

const websocketService = new WebSocketService();
export default websocketService;