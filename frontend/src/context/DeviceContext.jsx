import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';  // ADD THIS
import deviceService from '../services/deviceService';
import websocketService from '../services/websocket';
import toast from 'react-hot-toast';

const DeviceContext = createContext(null);

export const useDevices = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevices must be used within a DeviceProvider');
  }
  return context;
};

export const DeviceProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();  // ADD THIS

  const [devices, setDevices] = useState([]);
  const [groups, setGroups] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [energyData, setEnergyData] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);

  // ✅ FIXED: Only load data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    } else {
      // Clear data on logout
      setDevices([]);
      setGroups([]);
      setScenes([]);
      setAutomations([]);
      setSchedules([]);
      setEnergyData([]);
      setDashboard(null);
    }
  }, [isAuthenticated]);

  // ✅ FIXED: Only connect WebSocket when authenticated
 useEffect(() => {
    if (!realtimeEnabled || !isAuthenticated) return;

    // ✅ Get the token from localStorage (or wherever your AuthContext stores it)
    const token = localStorage.getItem('access_token');

    const unsubscribe = websocketService.subscribeToDevices((message) => {
        handleWebSocketMessage(message);
    }, token);  // ← Pass the token!

    return () => {
        unsubscribe();
    };
}, [realtimeEnabled, isAuthenticated]);
  // ... keep EVERYTHING else exactly the same from here down ...

  // Handle WebSocket messages
  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      case 'status_update':
      case 'device_update':
        updateDeviceInList(message.data);
        break;
      case 'command_success':
        toast.success(message.data.message);
        break;
      case 'command_failed':
        toast.error(message.data.message);
        break;
      case 'emergency':
        toast.error('🚨 Emergency mode activated!', { duration: 5000 });
        break;
      default:
        break;
    }
  };

  // Update device in list
  const updateDeviceInList = (updatedDevice) => {
    setDevices(prevDevices =>
      prevDevices.map(device =>
        device.id === updatedDevice.id ? { ...device, ...updatedDevice } : device
      )
    );
  };

  // Load all data
  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadDevices(),
        loadGroups(),
        loadScenes(),
        loadAutomations(),
        loadSchedules(),
        loadDashboard()
      ]);
    } catch (error) {
      console.error('Error loading device data:', error);
      toast.error('Failed to load device data');
    } finally {
      setLoading(false);
    }
  };

  // Load devices
const loadDevices = async (filters = {}) => {
  
  try {
    const result = await deviceService.getAllDevices(filters);
    if (result.success) {
      // Handle both paginated and non-paginated responses
      const data = result.data;
      setDevices(Array.isArray(data) ? data : data.results || []);
    }
    return result;
    
  } catch (error) {
    setError(error.message);
    return { success: false };
  }
  
};

  // Load groups
 const loadGroups = async () => {
  try {
    const result = await deviceService.getDeviceGroups();
    if (result.success) {
      const data = result.data;
      setGroups(Array.isArray(data) ? data : data.results || []);
    }
    return result;
  } catch (error) {
    setError(error.message);
    return { success: false };
  }
};

  // Load scenes
const loadScenes = async () => {
  try {
    const result = await deviceService.getScenes();
    if (result.success) {
      const data = result.data;
      setScenes(Array.isArray(data) ? data : data.results || []);
    }
    return result;
  } catch (error) {
    setError(error.message);
    return { success: false };
  }
};

  // Load automations
const loadAutomations = async () => {
  try {
    const result = await deviceService.getAutomationRules();
    if (result.success) {
      const data = result.data;
      setAutomations(Array.isArray(data) ? data : data.results || []);
    }
    return result;
  } catch (error) {
    setError(error.message);
    return { success: false };
  }
};

  // Load schedules
const loadSchedules = async () => {
  try {
    const result = await deviceService.getSchedules();
    if (result.success) {
      const data = result.data;
      setSchedules(Array.isArray(data) ? data : data.results || []);
    }
    return result;
  } catch (error) {
    setError(error.message);
    return { success: false };
  }
};

  // Load dashboard
  const loadDashboard = async () => {
    try {
      const result = await deviceService.getDashboard();
      if (result.success) {
      const data = result.data;
      setDashboard(Array.isArray(data) ? data : data.results || []);
      }
      return result;
    } catch (error) {
      setError(error.message);
      return { success: false };
    }
  };

  // Control device
  const controlDevice = async (deviceId, action, value = null, duration = null) => {
    try {
      const result = await deviceService.controlDevice(deviceId, action, value, duration);
      
      if (result.success && realtimeEnabled) {
        // Optimistic update
        updateDeviceInList({ id: deviceId, current_state: action });
      }
      
      return result;
    } catch (error) {
      toast.error(`Failed to control device: ${error.message}`);
      return { success: false };
    }
  };

  // Control group
  const controlGroup = async (groupId, action, value = null) => {
    try {
      const result = await deviceService.controlDeviceGroup(groupId, action, value);
      
      if (result.success) {
        // Reload devices to get updated states
        await loadDevices();
        toast.success(result.message);
      }
      
      return result;
    } catch (error) {
      toast.error(`Failed to control group: ${error.message}`);
      return { success: false };
    }
  };

  // Activate scene
  const activateScene = async (sceneId) => {
    try {
      const result = await deviceService.activateScene(sceneId);
      
      if (result.success) {
        await loadDevices(); // Reload devices to get updated states
        toast.success(`Scene activated: ${scenes.find(s => s.id === sceneId)?.name}`);
      }
      
      return result;
    } catch (error) {
      toast.error(`Failed to activate scene: ${error.message}`);
      return { success: false };
    }
  };

  // Create device
  const createDevice = async (deviceData) => {
    try {
      const result = await deviceService.createDevice(deviceData);
      
      if (result.success) {
        await loadDevices();
        toast.success('Device created successfully');
      }
      
      return result;
    } catch (error) {
      toast.error(`Failed to create device: ${error.message}`);
      return { success: false };
    }
  };

  // Update device
  const updateDevice = async (deviceId, deviceData) => {
    try {
      const result = await deviceService.updateDevice(deviceId, deviceData);
      
      if (result.success) {
        await loadDevices();
        toast.success('Device updated successfully');
      }
      
      return result;
    } catch (error) {
      toast.error(`Failed to update device: ${error.message}`);
      return { success: false };
    }
  };

  // Delete device
  const deleteDevice = async (deviceId) => {
    try {
      const result = await deviceService.deleteDevice(deviceId);
      
      if (result.success) {
        await loadDevices();
        toast.success('Device deleted successfully');
      }
      
      return result;
    } catch (error) {
      toast.error(`Failed to delete device: ${error.message}`);
      return { success: false };
    }
  };

  // Create automation
  const createAutomation = async (ruleData) => {
    try {
      const result = await deviceService.createAutomationRule(ruleData);
      
      if (result.success) {
        await loadAutomations();
        toast.success('Automation rule created');
      }
      
      return result;
    } catch (error) {
      toast.error(`Failed to create automation: ${error.message}`);
      return { success: false };
    }
  };

  // Update automation
  const updateAutomation = async (ruleId, ruleData) => {
    try {
      const result = await deviceService.updateAutomationRule(ruleId, ruleData);
      
      if (result.success) {
        await loadAutomations();
        toast.success('Automation rule updated');
      }
      
      return result;
    } catch (error) {
      toast.error(`Failed to update automation: ${error.message}`);
      return { success: false };
    }
  };

  // Delete automation
  const deleteAutomation = async (ruleId) => {
    try {
      const result = await deviceService.deleteAutomationRule(ruleId);
      
      if (result.success) {
        await loadAutomations();
        toast.success('Automation rule deleted');
      }
      
      return result;
    } catch (error) {
      toast.error(`Failed to delete automation: ${error.message}`);
      return { success: false };
    }
  };

  // Emergency control
  const emergencyControl = async (action) => {
    try {
      const result = await deviceService.emergencyControl(action);
      
      if (result.success) {
        await loadDevices();
        toast.warning(`Emergency action: ${action}`, { duration: 5000 });
      }
      
      return result;
    } catch (error) {
      toast.error(`Emergency action failed: ${error.message}`);
      return { success: false };
    }
  };

  // Toggle realtime updates
  const toggleRealtime = (enabled) => {
    setRealtimeEnabled(enabled);
    if (!enabled) {
      websocketService.disconnect('devices');
    }
  };

  // Context value
  const value = {
    // State
    devices,
    groups,
    scenes,
    automations,
    schedules,
    energyData,
    dashboard,
    loading,
    error,
    realtimeEnabled,

    // CRUD operations
    loadDevices,
    loadGroups,
    loadScenes,
    loadAutomations,
    loadSchedules,
    loadDashboard,
    createDevice,
    updateDevice,
    deleteDevice,
    createAutomation,
    updateAutomation,
    deleteAutomation,

    // Control operations
    controlDevice,
    controlGroup,
    activateScene,
    emergencyControl,

    // Settings
    toggleRealtime,

    // Utility functions
    getDeviceById: (id) => devices.find(d => d.id === id),
    getDevicesByRoom: () => {
      const byRoom = {};
      devices.forEach(device => {
        const room = device.room || 'Other';
        if (!byRoom[room]) byRoom[room] = [];
        byRoom[room].push(device);
      });
      return byRoom;
    },
    getDevicesByType: (type) => devices.filter(d => d.device_type === type),
    getOnlineCount: () => devices.filter(d => d.status === 'online').length,
    getOfflineCount: () => devices.filter(d => d.status === 'offline').length
  };

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
};