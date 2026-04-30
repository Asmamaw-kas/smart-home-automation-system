import { useState, useCallback, useEffect } from 'react';
import { useDevices } from '../context/DeviceContext';
import deviceService from '../services/deviceService';
import toast from 'react-hot-toast';

export const useDevice = (deviceId) => {
  const { devices, controlDevice: contextControl, updateDevice: contextUpdate } = useDevices();
  const [device, setDevice] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Find device from context
  useEffect(() => {
    if (deviceId && devices.length > 0) {
      const found = devices.find(d => d.id === deviceId);
      setDevice(found || null);
    }
  }, [deviceId, devices]);

  // Load device history
  const loadHistory = useCallback(async (hours = 24) => {
    if (!deviceId) return;
    
    setLoading(true);
    try {
      const result = await deviceService.getDeviceHistory(deviceId, hours);
      if (result.success) {
        setHistory(result.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  // Control device
  const control = useCallback(async (action, value = null, duration = null) => {
    if (!deviceId) return { success: false };

    try {
      const result = await contextControl(deviceId, action, value, duration);
      if (result.success) {
        // Update local device state
        setDevice(prev => ({ ...prev, current_state: action, current_value: value }));
      }
      return result;
    } catch (err) {
      toast.error(`Failed to control device: ${err.message}`);
      return { success: false };
    }
  }, [deviceId, contextControl]);

  // Update device
  const update = useCallback(async (deviceData) => {
    if (!deviceId) return { success: false };

    try {
      const result = await contextUpdate(deviceId, deviceData);
      if (result.success) {
        toast.success('Device updated');
      }
      return result;
    } catch (err) {
      toast.error(`Failed to update device: ${err.message}`);
      return { success: false };
    }
  }, [deviceId, contextUpdate]);

  // Toggle device
  const toggle = useCallback(async () => {
    if (!device) return;
    
    const newState = device.current_state === 'on' ? 'off' : 'on';
    return control(newState);
  }, [device, control]);

  // Set value (for dimmers, etc.)
  const setValue = useCallback(async (value) => {
    return control('value', value);
  }, [control]);

  // Turn on
  const turnOn = useCallback(async () => {
    return control('on');
  }, [control]);

  // Turn off
  const turnOff = useCallback(async () => {
    return control('off');
  }, [control]);

  // Check if device is on
  const isOn = device?.current_state === 'on' || device?.current_state === 'open' || device?.current_state === 'unlocked';

  // Check if device is off
  const isOff = device?.current_state === 'off' || device?.current_state === 'closed' || device?.current_state === 'locked';

  // Get device status color
  const getStatusColor = () => {
    if (!device) return 'gray';
    
    if (device.status === 'online') {
      if (isOn) return 'green';
      return 'gray';
    }
    return device.status === 'offline' ? 'red' : 'orange';
  };

  // Get device icon based on type and state
  const getDeviceIcon = () => {
    if (!device) return 'default';
    
    const iconMap = {
      light: isOn ? 'lightbulb' : 'lightbulb_outline',
      fan: isOn ? 'toys' : 'toys_outline',
      door: device.current_state === 'open' ? 'door_open' : 'door_closed',
      lock: device.current_state === 'unlocked' ? 'lock_open' : 'lock',
    };
    
    return iconMap[device.device_type] || 'device';
  };

  return {
    device,
    history,
    loading,
    error,
    isOn,
    isOff,
    getStatusColor,
    getDeviceIcon,
    loadHistory,
    control,
    update,
    toggle,
    setValue,
    turnOn,
    turnOff
  };
};