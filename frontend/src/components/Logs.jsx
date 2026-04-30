import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useDevices } from '../context/DeviceContext';
import { formatDate, formatRelativeTime } from '../utils/helpers';
import { LOG_SEVERITY } from '../utils/constants';
import toast from 'react-hot-toast';

// Custom hook for log management
const useLogs = () => {
  const { user } = useAuth();
  const { devices } = useDevices();
  
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState({
    activity: [],
    device: [],
    security: [],
    system: [],
    energy: []
  });
  const [statistics, setStatistics] = useState({
    totalLogs: 0,
    activityCount: 0,
    deviceCount: 0,
    securityCount: 0,
    systemCount: 0,
    energyCount: 0,
    criticalLogs: 0,
    warningLogs: 0
  });
  const [timelineData, setTimelineData] = useState({});

  // This function contains all the setState calls
  const fetchLogs = useCallback(() => {
    setLoading(true);
    
    // Mock data loading - replace with actual API calls
    setTimeout(() => {
      // Mock activity logs
      const mockActivityLogs = [
        {
          action_type: 'LOGIN',
          severity: 'info',
          description: 'User logged in successfully',
          user_name: user?.username,
          timestamp: new Date().toISOString(),
          ip_address: '192.168.1.100'
        },
        {
          action_type: 'DEVICE_ON',
          severity: 'info',
          description: 'Living Room Light turned on',
          user_name: user?.username,
          timestamp: new Date(Date.now() - 15 * 60000).toISOString()
        },
        {
          action_type: 'AUTO_TRIGGERED',
          severity: 'info',
          description: 'Automation rule "Evening Lights" triggered',
          timestamp: new Date(Date.now() - 30 * 60000).toISOString()
        },
        {
          action_type: 'DEVICE_OFF',
          severity: 'info',
          description: 'Bedroom Fan turned off',
          user_name: user?.username,
          timestamp: new Date(Date.now() - 60 * 60000).toISOString()
        },
        {
          action_type: 'LOGIN_FAILED',
          severity: 'warning',
          description: 'Failed login attempt for user "admin"',
          timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
          ip_address: '10.0.0.50'
        }
      ];

      // Mock device logs
      const mockDeviceLogs = devices.slice(0, 10).map((device, index) => ({
        device_name: device.name,
        device_type: device.device_type,
        action: index % 2 === 0 ? 'ON' : 'OFF',
        triggered_by: index % 3 === 0 ? 'automation' : 'manual',
        user_name: index % 3 === 0 ? null : user?.username,
        timestamp: new Date(Date.now() - index * 30 * 60000).toISOString(),
        duration: index % 2 === 0 ? 3600 : null,
        energy_usage: index % 2 === 0 ? 0.15 : null
      }));

      // Mock security logs
      const mockSecurityLogs = [
        {
          event_type: 'door_access',
          result: 'success',
          description: 'Front door unlocked',
          username: user?.username,
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          ip_address: '192.168.1.100',
          location: 'Main Entrance'
        },
        {
          event_type: 'pin_success',
          result: 'success',
          description: 'PIN verified for back door',
          username: user?.username,
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          pin_entered: '****'
        },
        {
          event_type: 'pin_failed',
          result: 'failed',
          description: 'Invalid PIN attempt for garage door',
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          pin_entered: '****',
          attempts: 2,
          ip_address: '192.168.1.105'
        },
        {
          event_type: 'emergency',
          result: 'success',
          description: 'Emergency lockdown activated',
          username: 'System',
          timestamp: new Date(Date.now() - 60 * 60000).toISOString()
        }
      ];

      // Mock system logs
      const mockSystemLogs = [
        {
          level: 'info',
          component: 'system',
          message: 'System started successfully',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          level: 'warning',
          component: 'database',
          message: 'Slow query detected',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        },
        {
          level: 'error',
          component: 'websocket',
          message: 'Connection timeout',
          error_code: 'WS001',
          timestamp: new Date(Date.now() - 10800000).toISOString()
        }
      ];

      // Mock energy logs
      const mockEnergyLogs = [
        {
          device_name: 'Living Room Light',
          power_consumption: 60,
          energy_used: 0.06,
          duration_seconds: 3600,
          start_time: new Date(Date.now() - 7200000).toISOString(),
          end_time: new Date(Date.now() - 3600000).toISOString(),
          timestamp: new Date().toISOString(),
          total_cost: 0.009
        },
        {
          device_name: 'Bedroom Fan',
          power_consumption: 75,
          energy_used: 0.15,
          duration_seconds: 7200,
          start_time: new Date(Date.now() - 14400000).toISOString(),
          end_time: new Date(Date.now() - 7200000).toISOString(),
          timestamp: new Date().toISOString(),
          total_cost: 0.0225
        }
      ];

      // Mock timeline data
      const mockTimeline = {};
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        mockTimeline[dateStr] = Math.floor(Math.random() * 50) + 10;
      }

      // Update all state at once
      setLogs({
        activity: mockActivityLogs,
        device: mockDeviceLogs,
        security: mockSecurityLogs,
        system: mockSystemLogs,
        energy: mockEnergyLogs
      });

      setStatistics({
        totalLogs: mockActivityLogs.length + mockDeviceLogs.length + mockSecurityLogs.length + mockSystemLogs.length + mockEnergyLogs.length,
        activityCount: mockActivityLogs.length,
        deviceCount: mockDeviceLogs.length,
        securityCount: mockSecurityLogs.length,
        systemCount: mockSystemLogs.length,
        energyCount: mockEnergyLogs.length,
        criticalLogs: 1,
        warningLogs: 2
      });

      setTimelineData(mockTimeline);
      setLoading(false);
    }, 1000);
  }, [devices, user]);

  return {
    loading,
    logs,
    statistics,
    timelineData,
    fetchLogs
  };
};

// Log Filter Component
const LogFilters = ({ filters, onFilterChange, onExport, onClear }) => {
  const { isDark } = useTheme();

  return (
    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm mb-6`}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search logs..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
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

        {/* Log Type */}
        <select
          value={filters.logType || 'all'}
          onChange={(e) => onFilterChange({ ...filters, logType: e.target.value })}
          className={`px-3 py-2 border rounded-lg ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="all">All Logs</option>
          <option value="activity">Activity Logs</option>
          <option value="device">Device Logs</option>
          <option value="security">Security Logs</option>
          <option value="system">System Logs</option>
          <option value="energy">Energy Logs</option>
        </select>

        {/* Severity */}
        <select
          value={filters.severity || 'all'}
          onChange={(e) => onFilterChange({ ...filters, severity: e.target.value })}
          className={`px-3 py-2 border rounded-lg ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="all">All Severities</option>
          {LOG_SEVERITY.map(sev => (
            <option key={sev.value} value={sev.value}>{sev.label}</option>
          ))}
        </select>

        {/* Date Range */}
        <select
          value={filters.dateRange || '24h'}
          onChange={(e) => onFilterChange({ ...filters, dateRange: e.target.value })}
          className={`px-3 py-2 border rounded-lg ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-4">
        <button
          onClick={onClear}
          className={`px-4 py-2 rounded-lg ${
            isDark
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Clear Filters
        </button>
        <button
          onClick={onExport}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Export Logs
        </button>
      </div>
    </div>
  );
};

// Log Statistics Component
const LogStatistics = ({ stats }) => {
  const { isDark } = useTheme();

  const statCards = [
    { label: 'Total Logs', value: stats.totalLogs, icon: '📊', color: 'bg-blue-500' },
    { label: 'Activity', value: stats.activityCount, icon: '👤', color: 'bg-green-500' },
    { label: 'Device', value: stats.deviceCount, icon: '📱', color: 'bg-purple-500' },
    { label: 'Security', value: stats.securityCount, icon: '🔒', color: 'bg-yellow-500' },
    { label: 'System', value: stats.systemCount, icon: '⚙️', color: 'bg-orange-500' },
    { label: 'Energy', value: stats.energyCount, icon: '⚡', color: 'bg-red-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div key={index} className={`card ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="text-center">
            <div className={`inline-flex p-3 rounded-lg ${stat.color} bg-opacity-20 mb-2`}>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stat.value}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Timeline Chart Component
const TimelineChart = ({ data }) => {
  const { isDark } = useTheme();
  
  const chartData = useMemo(() => {
    if (!data) return [];
    
    return Object.entries(data)
      .map(([date, count]) => ({ date, count }))
      .slice(-7);
  }, [data]);

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  return (
    <div className={`card ${isDark ? 'bg-gray-800' : 'bg-white'} mb-6`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Activity Timeline (Last 7 Days)
      </h3>
      <div className="h-48 flex items-end justify-between space-x-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full relative group">
              <div
                className="bg-primary-500 hover:bg-primary-600 transition-all duration-200 rounded-t-lg"
                style={{ height: `${(item.count / maxCount) * 150}px` }}
              >
                <div className={`absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block ${
                  isDark ? 'bg-gray-700' : 'bg-gray-800'
                } text-white text-xs rounded px-2 py-1 whitespace-nowrap`}>
                  {item.count} events
                </div>
              </div>
            </div>
            <span className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {item.date.split('-').slice(1).join('/')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Activity Log Component
const ActivityLogs = ({ logs, loading }) => {
  const { isDark } = useTheme();

  const getActionIcon = (actionType) => {
    const icons = {
      LOGIN: '🔑',
      LOGOUT: '🚪',
      LOGIN_FAILED: '❌',
      PASSWORD_CHANGE: '🔐',
      DEVICE_ON: '💡',
      DEVICE_OFF: '⚫',
      DEVICE_LOCK: '🔒',
      DEVICE_UNLOCK: '🔓',
      DEVICE_OPEN: '🚪',
      DEVICE_CLOSE: '🚪',
      SENSOR_READING: '🌡️',
      SENSOR_ALERT: '⚠️',
      AUTO_TRIGGERED: '⚡',
      EMERGENCY_LOCK: '🚨',
      USER_ADD: '👤+',
      USER_UPDATE: '👤✏️',
      USER_DELETE: '👤🗑️',
    };
    return icons[actionType] || '📝';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      info: isDark ? 'text-blue-400' : 'text-blue-600',
      warning: isDark ? 'text-yellow-400' : 'text-yellow-600',
      error: isDark ? 'text-red-400' : 'text-red-600',
      critical: isDark ? 'text-red-500' : 'text-red-700',
    };
    return colors[severity] || (isDark ? 'text-gray-400' : 'text-gray-600');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className={`card ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Activity Logs
      </h3>
      
      {logs.length > 0 ? (
        <div className="space-y-4">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getActionIcon(log.action_type)}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${getSeverityColor(log.severity)}`}>
                        {log.action_type?.replace(/_/g, ' ')}
                      </span>
                      {log.severity && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          log.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          log.severity === 'error' ? 'bg-red-100 text-red-800' :
                          log.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {log.severity}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {log.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatRelativeTime(log.timestamp)}
                      </span>
                      {log.user_name && (
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          by {log.user_name}
                        </span>
                      )}
                      {log.ip_address && (
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          📍 {log.ip_address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {formatDate(log.timestamp, 'HH:mm')}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <p className="text-lg">No activity logs found</p>
          <p className="text-sm mt-2">Activity logs will appear here</p>
        </div>
      )}
    </div>
  );
};

// Device Logs Component
const DeviceLogs = ({ logs, loading }) => {
  const { isDark } = useTheme();

  const getDeviceIcon = (deviceType) => {
    const icons = {
      light: '💡',
      fan: '🌀',
      door: '🚪',
      lock: '🔒',
      ac: '❄️',
      tv: '📺',
      speaker: '🔊',
    };
    return icons[deviceType] || '📱';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className={`card ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Device Logs
      </h3>
      
      {logs.length > 0 ? (
        <div className="space-y-4">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getDeviceIcon(log.device_type)}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {log.device_name}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        log.action === 'ON' || log.action === 'OPEN' || log.action === 'UNLOCK'
                          ? 'bg-green-100 text-green-800'
                          : log.action === 'OFF' || log.action === 'CLOSE' || log.action === 'LOCK'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {log.action}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {log.triggered_by === 'automation' ? '🤖 ' : ''}
                      {log.triggered_by === 'remote' ? '📱 ' : ''}
                      {log.triggered_by === 'schedule' ? '⏰ ' : ''}
                      {log.triggered_by === 'manual' ? '👤 ' : ''}
                      {log.description || `${log.device_name} was turned ${log.action.toLowerCase()}`}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatRelativeTime(log.timestamp)}
                      </span>
                      {log.user_name && (
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          by {log.user_name}
                        </span>
                      )}
                      {log.duration && (
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          ⏱️ {log.duration}s
                        </span>
                      )}
                      {log.energy_usage && (
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          ⚡ {log.energy_usage}kWh
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {formatDate(log.timestamp, 'HH:mm')}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <p className="text-lg">No device logs found</p>
          <p className="text-sm mt-2">Device logs will appear here</p>
        </div>
      )}
    </div>
  );
};

// Security Logs Component
const SecurityLogs = ({ logs, loading }) => {
  const { isDark } = useTheme();

  const getEventIcon = (eventType) => {
    const icons = {
      door_access: '🚪',
      pin_attempt: '🔢',
      pin_success: '✅',
      pin_failed: '❌',
      lock_status: '🔒',
      unauthorized: '⚠️',
      emergency: '🚨',
      system_arm: '🛡️',
      system_disarm: '🔓',
    };
    return icons[eventType] || '📝';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className={`card ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Security Logs
      </h3>
      
      {logs.length > 0 ? (
        <div className="space-y-4">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getEventIcon(log.event_type)}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${
                        log.result === 'failed' ? 'text-red-500' :
                        log.result === 'success' ? 'text-green-500' :
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {log.event_type?.replace(/_/g, ' ')}
                      </span>
                      {log.result && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          log.result === 'success'
                            ? 'bg-green-100 text-green-800'
                            : log.result === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {log.result}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {log.description}
                    </p>
                    {log.pin_entered && (
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        PIN: {'•'.repeat(log.pin_entered.length)} {log.pin_valid ? '✓' : '✗'}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatRelativeTime(log.timestamp)}
                      </span>
                      {log.username && (
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          by {log.username}
                        </span>
                      )}
                      {log.location && (
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          📍 {log.location}
                        </span>
                      )}
                      {log.attempts > 1 && (
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Attempts: {log.attempts}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {log.ip_address && (
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {log.ip_address}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <p className="text-lg">No security logs found</p>
          <p className="text-sm mt-2">Security events will appear here</p>
        </div>
      )}
    </div>
  );
};

// System Logs Component
const SystemLogs = ({ logs, loading }) => {
  const { isDark } = useTheme();

  const getLevelIcon = (level) => {
    const icons = {
      debug: '🐛',
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      critical: '🔥',
    };
    return icons[level] || '📝';
  };

  const getLevelColor = (level) => {
    const colors = {
      debug: isDark ? 'text-gray-400' : 'text-gray-600',
      info: isDark ? 'text-blue-400' : 'text-blue-600',
      warning: isDark ? 'text-yellow-400' : 'text-yellow-600',
      error: isDark ? 'text-red-400' : 'text-red-600',
      critical: isDark ? 'text-red-500' : 'text-red-700',
    };
    return colors[level] || (isDark ? 'text-gray-400' : 'text-gray-600');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className={`card ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        System Logs
      </h3>
      
      {logs.length > 0 ? (
        <div className="space-y-4">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getLevelIcon(log.level)}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${getLevelColor(log.level)}`}>
                        [{log.level?.toUpperCase()}]
                      </span>
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {log.component}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {log.message}
                    </p>
                    {log.traceback && (
                      <details className="mt-2">
                        <summary className={`text-xs cursor-pointer ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          View details
                        </summary>
                        <pre className={`mt-2 p-2 text-xs rounded overflow-x-auto ${
                          isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {log.traceback}
                        </pre>
                      </details>
                    )}
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatRelativeTime(log.timestamp)}
                      </span>
                      {log.error_code && (
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Code: {log.error_code}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {formatDate(log.timestamp, 'HH:mm')}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <p className="text-lg">No system logs found</p>
          <p className="text-sm mt-2">System events will appear here</p>
        </div>
      )}
    </div>
  );
};

// Energy Logs Component
const EnergyLogs = ({ logs, loading }) => {
  const { isDark } = useTheme();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className={`card ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Energy Logs
      </h3>
      
      {logs.length > 0 ? (
        <div className="space-y-4">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {log.device_name}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        log.power_consumption > 1000
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {log.power_consumption}W
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Used {log.energy_used} kWh in {Math.round(log.duration_seconds / 60)} minutes
                    </p>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Power</p>
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {log.power_consumption} W
                        </p>
                      </div>
                      {log.voltage && (
                        <div>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Voltage</p>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {log.voltage} V
                          </p>
                        </div>
                      )}
                      {log.current && (
                        <div>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Current</p>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {log.current} A
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDate(log.start_time, 'MMM d, HH:mm')} - {formatDate(log.end_time, 'HH:mm')}
                      </span>
                      {log.total_cost && (
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Cost: ${log.total_cost.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {formatDate(log.timestamp, 'HH:mm')}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <p className="text-lg">No energy logs found</p>
          <p className="text-sm mt-2">Energy consumption data will appear here</p>
        </div>
      )}
    </div>
  );
};

// Main Logs Component
const Logs = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('activity');
  const [filters, setFilters] = useState({
    search: '',
    logType: 'all',
    severity: 'all',
    dateRange: '24h'
  });
  
  const { loading, logs, statistics, timelineData, fetchLogs } = useLogs();

  // Initial load
  useEffect(() => {
    fetchLogs();
  }, []); // Intentionally empty - we want this to run only once

  // Handle filter changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 500);

    return () => clearTimeout(timer);
  }, [filters, fetchLogs]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      logType: 'all',
      severity: 'all',
      dateRange: '24h'
    });
  }, []);

  const handleExport = useCallback(() => {
    toast.success('Logs exported successfully');
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Logs
        </h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          View and analyze system logs
        </p>
      </div>

      {/* Statistics */}
      <LogStatistics stats={statistics} />

      {/* Filters */}
      <LogFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onExport={handleExport}
        onClear={handleClearFilters}
      />

      {/* Timeline Chart */}
      <TimelineChart data={timelineData} />

      {/* Tabs */}
      <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'activity'
                ? 'border-primary-600 text-primary-600'
                : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
            }`}
          >
            Activity Logs
          </button>
          <button
            onClick={() => setActiveTab('device')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'device'
                ? 'border-primary-600 text-primary-600'
                : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
            }`}
          >
            Device Logs
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-primary-600 text-primary-600'
                : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
            }`}
          >
            Security Logs
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'system'
                ? 'border-primary-600 text-primary-600'
                : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
            }`}
          >
            System Logs
          </button>
          <button
            onClick={() => setActiveTab('energy')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'energy'
                ? 'border-primary-600 text-primary-600'
                : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
            }`}
          >
            Energy Logs
          </button>
        </nav>
      </div>

      {/* Log Content */}
      {activeTab === 'activity' && (
        <ActivityLogs logs={logs.activity} loading={loading} />
      )}
      {activeTab === 'device' && (
        <DeviceLogs logs={logs.device} loading={loading} />
      )}
      {activeTab === 'security' && (
        <SecurityLogs logs={logs.security} loading={loading} />
      )}
      {activeTab === 'system' && (
        <SystemLogs logs={logs.system} loading={loading} />
      )}
      {activeTab === 'energy' && (
        <EnergyLogs logs={logs.energy} loading={loading} />
      )}
    </div>
  );
};

export default Logs;