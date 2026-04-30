import { useState, useEffect, useCallback, useRef } from 'react';
import websocketService from '../services/websocket';
import toast from 'react-hot-toast';

export const useWebSocket = (namespace = 'sensors') => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const messageHandlers = useRef(new Map());

  // Get token helper
  const getToken = useCallback(() => {
    return localStorage.getItem('access_token'); // adjust to match your auth storage
  }, []);

  // Connection status tracking
  useEffect(() => {
    const handleConnectionChange = (data) => {
      if (data.namespace === namespace) {
        setIsConnected(data.connected);
        if (data.connected) {
          toast.success(`${namespace} connection established`);
        } else {
          toast.error(`${namespace} connection lost`);
        }
      }
    };

    websocketService.on('connection_change', handleConnectionChange);

    return () => {
      websocketService.off('connection_change', handleConnectionChange);
    };
  }, [namespace]);

  // Subscribe to messages
  const subscribe = useCallback((messageType, handler) => {
    if (!messageHandlers.current.has(messageType)) {
      messageHandlers.current.set(messageType, new Set());
    }
    messageHandlers.current.get(messageType).add(handler);

    const token = getToken();

    const wrappedHandler = (message) => {
      if (message.type === messageType) {
        setLastMessage(message);
        handler(message.data);
      }
    };

    if (namespace === 'sensors') {
      return websocketService.subscribeToSensors(wrappedHandler, token);
    } else if (namespace === 'devices') {
      return websocketService.subscribeToDevices(wrappedHandler, token);
    }
    return () => {};
  }, [namespace, getToken]);

  // Send command
  const sendCommand = useCallback((command, ...args) => {
    try {
      websocketService.send(namespace, { command, ...args });
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to send command: ${err.message}`);
    }
  }, [namespace]);

  const controlDevice = useCallback((device, action, value = null) => {
    websocketService.controlDevice(device, action, value);
  }, []);

  const requestStatus = useCallback(() => {
    websocketService.requestDeviceStatus();
  }, []);

  const enableAutomation = useCallback(() => {
    websocketService.enableAutomation();
  }, []);

  const disableAutomation = useCallback(() => {
    websocketService.disableAutomation();
  }, []);

  const emergencyLock = useCallback(() => {
    websocketService.emergencyLock();
  }, []);

  const setThreshold = useCallback((device, value) => {
    websocketService.setThreshold(device, value);
  }, []);

  const requestHistory = useCallback((hours = 24) => {
    websocketService.requestSensorHistory(hours);
  }, []);

  const ping = useCallback(() => {
    websocketService.ping();
  }, []);

  const reconnect = useCallback(() => {
    const token = getToken();
    websocketService.disconnect(namespace);
    websocketService.connect(namespace, token);
  }, [namespace, getToken]);

  return {
    isConnected, lastMessage, error,
    subscribe, sendCommand, controlDevice,
    requestStatus, enableAutomation, disableAutomation,
    emergencyLock, setThreshold, requestHistory,
    ping, reconnect
  };
};