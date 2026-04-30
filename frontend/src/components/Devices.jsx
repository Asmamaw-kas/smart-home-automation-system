import React, { useState, useEffect } from 'react';
import { useDevices } from '../context/DeviceContext';
import { useTheme } from '../context/ThemeContext';
import { useDevice } from '../hooks/useDevice';
import { useForm } from '../hooks/useForm';
import { formatRelativeTime, getDeviceStateColor } from '../utils/helpers';
import { DEVICE_TYPES } from '../utils/constants';
import * as yup from 'yup';
import toast from 'react-hot-toast';

// Device Control Component
const DeviceControl = ({ device, onClose, onUpdate }) => {
  const { isDark } = useTheme();
  const { controlDevice } = useDevices();
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');

  const handleAction = async (action, value = null) => {
    setLoading(true);
    setSelectedAction(action);
    try {
      const result = await controlDevice(device.id, action, value);
      if (result.success) {
        toast.success(`${device.name} ${action} successful`);
        if (onUpdate) onUpdate();
      }
    } finally {
      setLoading(false);
      setSelectedAction('');
    }
  };

  const getActionButtons = () => {
    switch (device.device_type) {
      case 'light':
      case 'fan':
        return (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAction('on')}
              disabled={loading || device.current_state === 'on'}
              className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                device.current_state === 'on'
                  ? isDark
                    ? 'bg-green-600 text-white cursor-not-allowed'
                    : 'bg-green-500 text-white cursor-not-allowed'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {loading && selectedAction === 'on' ? (
                <svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : 'Turn On'}
            </button>
            <button
              onClick={() => handleAction('off')}
              disabled={loading || device.current_state === 'off'}
              className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                device.current_state === 'off'
                  ? isDark
                    ? 'bg-gray-600 text-white cursor-not-allowed'
                    : 'bg-gray-400 text-white cursor-not-allowed'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {loading && selectedAction === 'off' ? (
                <svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : 'Turn Off'}
            </button>
          </div>
        );

      case 'door':
        return (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAction('open')}
              disabled={loading || device.current_state === 'open'}
              className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                device.current_state === 'open'
                  ? isDark
                    ? 'bg-green-600 text-white cursor-not-allowed'
                    : 'bg-green-500 text-white cursor-not-allowed'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {loading && selectedAction === 'open' ? '...' : 'Open'}
            </button>
            <button
              onClick={() => handleAction('close')}
              disabled={loading || device.current_state === 'closed'}
              className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                device.current_state === 'closed'
                  ? isDark
                    ? 'bg-gray-600 text-white cursor-not-allowed'
                    : 'bg-gray-400 text-white cursor-not-allowed'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {loading && selectedAction === 'close' ? '...' : 'Close'}
            </button>
          </div>
        );

      case 'lock':
        return (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAction('unlock')}
              disabled={loading || device.current_state === 'unlocked'}
              className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                device.current_state === 'unlocked'
                  ? isDark
                    ? 'bg-green-600 text-white cursor-not-allowed'
                    : 'bg-green-500 text-white cursor-not-allowed'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {loading && selectedAction === 'unlock' ? '...' : 'Unlock'}
            </button>
            <button
              onClick={() => handleAction('lock')}
              disabled={loading || device.current_state === 'locked'}
              className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                device.current_state === 'locked'
                  ? isDark
                    ? 'bg-gray-600 text-white cursor-not-allowed'
                    : 'bg-gray-400 text-white cursor-not-allowed'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {loading && selectedAction === 'lock' ? '...' : 'Lock'}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50`}>
      <div className={`max-w-md w-full rounded-xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Control {device.name}
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${
                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  device.status === 'online'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {device.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Current State</span>
                <span className={`font-medium ${getDeviceStateColor(device.current_state, device.device_type)}-600`}>
                  {device.current_state}
                </span>
              </div>
              {device.supports_dimming && (
                <div className="mt-4">
                  <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Brightness: {device.current_value}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={device.current_value || 0}
                    onChange={(e) => handleAction('value', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {getActionButtons()}

          <div className="mt-4 text-center">
            <button
              onClick={onClose}
              className={`text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Device Detail Component
const DeviceDetail = ({ deviceId, onClose }) => {
  const { isDark } = useTheme();
  const { device, history, loading, loadHistory } = useDevice(deviceId);

  useEffect(() => {
    if (deviceId) {
      loadHistory(48); // Load last 48 hours
    }
  }, [deviceId]);

  if (!device) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50`}>
      <div className={`max-w-2xl w-full rounded-xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {device.name} - Details
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${
                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Type</p>
              <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {device.device_type}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Room</p>
              <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {device.room || 'Not assigned'}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pin Number</p>
              <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {device.pin_number || 'N/A'}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Power Rating</p>
              <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {device.power_rating ? `${device.power_rating}W` : 'N/A'}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              History (Last 48 Hours)
            </h4>
            <div className={`max-h-60 overflow-y-auto ${isDark ? 'scrollbar-dark' : ''}`}>
              {history.length > 0 ? (
                <div className="space-y-2">
                  {history.map((item, index) => (
                    <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${getDeviceStateColor(item.status, device.device_type)}-600`}>
                          {item.status}
                        </span>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatRelativeTime(item.timestamp)}
                        </span>
                      </div>
                      {item.value !== null && (
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Value: {item.value}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No history available
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add/Edit Device Modal
const DeviceForm = ({ device, onClose, onSuccess }) => {
  const { isDark } = useTheme();
  const { createDevice, updateDevice } = useDevices();

  const validationSchema = yup.object({
    name: yup.string().required('Device name is required'),
    device_type: yup.string().required('Device type is required'),
    room: yup.string(),
    pin_number: yup.number().nullable(),
    power_rating: yup.number().nullable(),
    supports_dimming: yup.boolean(),
  });

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm(
    {
      name: device?.name || '',
      device_type: device?.device_type || 'light',
      room: device?.room || '',
      pin_number: device?.pin_number || '',
      power_rating: device?.power_rating || '',
      supports_dimming: device?.supports_dimming || false,
    },
    validationSchema
  );

  const onSubmit = async (formValues) => {
    let result;
    if (device) {
      result = await updateDevice(device.id, formValues);
    } else {
      result = await createDevice(formValues);
    }

    if (result.success) {
      toast.success(device ? 'Device updated' : 'Device created');
      onSuccess();
      onClose();
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50`}>
      <div className={`max-w-md w-full rounded-xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {device ? 'Edit Device' : 'Add New Device'}
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${
                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(onSubmit);
          }}>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Device Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${touched.name && errors.name ? 'border-red-500' : ''}`}
                />
                {touched.name && errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Device Type *
                </label>
                <select
                  name="device_type"
                  value={values.device_type}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {DEVICE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} {type.icon}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Room
                </label>
                <input
                  type="text"
                  name="room"
                  value={values.room}
                  onChange={handleChange}
                  placeholder="e.g., Living Room, Bedroom"
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Pin Number
                </label>
                <input
                  type="number"
                  name="pin_number"
                  value={values.pin_number}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Power Rating (Watts)
                </label>
                <input
                  type="number"
                  name="power_rating"
                  value={values.power_rating}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="supports_dimming"
                  checked={values.supports_dimming}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 rounded border-gray-300"
                />
                <label className={`ml-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Supports Dimming/Speed Control
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                {device ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Devices Component
const Devices = () => {
  const { isDark } = useTheme();
  const { devices, groups, loadDevices, deleteDevice } = useDevices();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRoom, setFilterRoom] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showControl, setShowControl] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Get unique rooms
  const rooms = ['all', ...new Set(devices.map(d => d.room).filter(Boolean))];

  // Filter devices
  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (device.room && device.room.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || device.device_type === filterType;
    const matchesRoom = filterRoom === 'all' || device.room === filterRoom;
    return matchesSearch && matchesType && matchesRoom;
  });

  // Group by room for display
  const devicesByRoom = filteredDevices.reduce((acc, device) => {
    const room = device.room || 'Other';
    if (!acc[room]) acc[room] = [];
    acc[room].push(device);
    return acc;
  }, {});

  const handleEdit = (device) => {
    setEditingDevice(device);
    setShowForm(true);
  };

  const handleDelete = async (deviceId) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      const result = await deleteDevice(deviceId);
      if (result.success) {
        toast.success('Device deleted');
      }
    }
  };

  const handleControl = (device) => {
    setSelectedDevice(device);
    setShowControl(true);
  };

  const handleViewDetails = (device) => {
    setSelectedDevice(device);
    setShowDetail(true);
  };

  const getDeviceIcon = (device) => {
    const icons = {
      light: device.current_state === 'on' ? '💡' : '⚫',
      fan: device.current_state === 'on' ? '🌀' : '⏹️',
      door: device.current_state === 'open' ? '🚪' : '🚪',
      lock: device.current_state === 'unlocked' ? '🔓' : '🔒',
    };
    return icons[device.device_type] || '📱';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Devices
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage and control all your smart devices
          </p>
        </div>
        
        <button
          onClick={() => {
            setEditingDevice(null);
            setShowForm(true);
          }}
          className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Device
        </button>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Type filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`px-3 py-2 border rounded-lg ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">All Types</option>
            {DEVICE_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          {/* Room filter */}
          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className={`px-3 py-2 border rounded-lg ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {rooms.map(room => (
              <option key={room} value={room}>
                {room === 'all' ? 'All Rooms' : room}
              </option>
            ))}
          </select>

          {/* View mode toggle */}
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-primary-600 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Device count */}
      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Showing {filteredDevices.length} of {devices.length} devices
      </p>

      {/* Devices display */}
      {viewMode === 'grid' ? (
        // Grid view
        <div className="space-y-8">
          {Object.entries(devicesByRoom).map(([room, roomDevices]) => (
            <div key={room}>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {room}
                <span className={`ml-2 text-sm font-normal ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({roomDevices.length} devices)
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roomDevices.map(device => (
                  <div
                    key={device.id}
                    className={`card ${isDark ? 'bg-gray-800' : 'bg-white'} hover:shadow-lg transition-shadow`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg ${
                          device.current_state === 'on' || device.current_state === 'open' || device.current_state === 'unlocked'
                            ? isDark ? 'bg-green-900/30' : 'bg-green-100'
                            : isDark ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <span className="text-2xl">{getDeviceIcon(device)}</span>
                        </div>
                        <div>
                          <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {device.name}
                          </h3>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {device.room || 'No room'}
                          </p>
                        </div>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${
                        device.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    </div>

                    <div className="mb-4">
                      <span className={`text-sm font-medium ${
                        getDeviceStateColor(device.current_state, device.device_type)
                      }-600`}>
                        {device.current_state}
                      </span>
                      {device.supports_dimming && device.current_value && (
                        <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          ({device.current_value}%)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleControl(device)}
                        className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                      >
                        Control
                      </button>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(device)}
                          className={`p-1.5 rounded-lg ${
                            isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                          }`}
                          title="View Details"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(device)}
                          className={`p-1.5 rounded-lg ${
                            isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                          }`}
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(device.id)}
                          className={`p-1.5 rounded-lg ${
                            isDark ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-500'
                          }`}
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List view
        <div className={`rounded-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  State
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredDevices.map(device => (
                <tr key={device.id} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${
                        device.current_state === 'on' || device.current_state === 'open' || device.current_state === 'unlocked'
                          ? isDark ? 'bg-green-900/30' : 'bg-green-100'
                          : isDark ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <span className="text-xl">{getDeviceIcon(device)}</span>
                      </div>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {device.name}
                      </span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {device.device_type}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {device.room || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      device.status === 'online'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {device.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                    getDeviceStateColor(device.current_state, device.device_type)
                  }-600`}>
                    {device.current_state}
                    {device.supports_dimming && device.current_value && (
                      <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        ({device.current_value}%)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <button
                      onClick={() => handleControl(device)}
                      className="px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                    >
                      Control
                    </button>
                    <button
                      onClick={() => handleViewDetails(device)}
                      className={`px-3 py-1 rounded-lg ${
                        isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showControl && selectedDevice && (
        <DeviceControl
          device={selectedDevice}
          onClose={() => {
            setShowControl(false);
            setSelectedDevice(null);
          }}
          onUpdate={() => loadDevices()}
        />
      )}

      {showDetail && selectedDevice && (
        <DeviceDetail
          deviceId={selectedDevice.id}
          onClose={() => {
            setShowDetail(false);
            setSelectedDevice(null);
          }}
        />
      )}

      {showForm && (
        <DeviceForm
          device={editingDevice}
          onClose={() => {
            setShowForm(false);
            setEditingDevice(null);
          }}
          onSuccess={() => loadDevices()}
        />
      )}
    </div>
  );
};

export default Devices;