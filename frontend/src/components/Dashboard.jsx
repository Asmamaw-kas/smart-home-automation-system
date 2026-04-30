import React, { useState, useEffect } from 'react';
import { useDevices } from '../context/DeviceContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { useSensor } from '../hooks/useSensor';
import { 
  formatTemperature, 
  formatHumidity, 
  formatLightLevel, 
  formatDistanceMetric,
  formatRelativeTime,
  getDeviceStateColor 
} from '../utils/helpers';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import toast from 'react-hot-toast';

// Sensor Card Component
const SensorCard = ({ title, value, unit, icon, color, trend, status }) => {
  const { isDark } = useTheme();
  
  const getStatusColor = () => {
    if (status === 'critical') return 'text-red-500';
    if (status === 'warning') return 'text-yellow-500';
    return isDark ? 'text-green-400' : 'text-green-600';
  };

  return (
    <div className={`card ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {title}
          </p>
          <div className="flex items-baseline mt-2">
            <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </h3>
            <span className={`ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {unit}
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        {trend && (
          <div className="flex items-center">
            {trend.direction === 'up' ? (
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            <span className={`ml-1 text-sm ${trend.direction === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {trend.value}%
            </span>
          </div>
        )}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {status === 'critical' ? 'Critical' : status === 'warning' ? 'Warning' : 'Normal'}
        </span>
      </div>
    </div>
  );
};

// Device Card Component
const DeviceCard = ({ device, onControl }) => {
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleControl = async (action) => {
    setIsLoading(true);
    try {
      await onControl(device.id, action);
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceIcon = () => {
    const icons = {
      light: device.current_state === 'on' ? '💡' : '⚫',
      fan: device.current_state === 'on' ? '🌀' : '⏹️',
      door: device.current_state === 'open' ? '🚪' : '🚪',
      lock: device.current_state === 'unlocked' ? '🔓' : '🔒',
    };
    return icons[device.device_type] || '📱';
  };

  const getStateColor = () => {
    return getDeviceStateColor(device.current_state, device.device_type);
  };

  const getActionButton = () => {
    if (device.device_type === 'light' || device.device_type === 'fan') {
      return (
        <button
          onClick={() => handleControl(device.current_state === 'on' ? 'off' : 'on')}
          disabled={isLoading}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            device.current_state === 'on'
              ? isDark 
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
              : isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          {isLoading ? '...' : device.current_state === 'on' ? 'Turn Off' : 'Turn On'}
        </button>
      );
    }
    
    if (device.device_type === 'door') {
      return (
        <button
          onClick={() => handleControl(device.current_state === 'open' ? 'close' : 'open')}
          disabled={isLoading}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            device.current_state === 'open'
              ? isDark 
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
              : isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          {isLoading ? '...' : device.current_state === 'open' ? 'Close' : 'Open'}
        </button>
      );
    }

    if (device.device_type === 'lock') {
      return (
        <button
          onClick={() => handleControl(device.current_state === 'unlocked' ? 'lock' : 'unlock')}
          disabled={isLoading}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            device.current_state === 'unlocked'
              ? isDark 
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
              : isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          {isLoading ? '...' : device.current_state === 'unlocked' ? 'Lock' : 'Unlock'}
        </button>
      );
    }

    return null;
  };

  return (
    <div className={`card ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            device.current_state === 'on' || device.current_state === 'open' || device.current_state === 'unlocked'
              ? isDark ? 'bg-green-900/30' : 'bg-green-100'
              : isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <span className="text-xl">{getDeviceIcon()}</span>
          </div>
          <div>
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {device.name}
            </h4>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {device.room || 'No room'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full bg-${getStateColor()}-500`} />
          {getActionButton()}
        </div>
      </div>

      {device.supports_dimming && (
        <div className="mt-3">
          <input
            type="range"
            min="0"
            max="100"
            value={device.current_value || 0}
            onChange={(e) => handleControl('value', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      )}
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon, change }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`card ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
      {change && (
        <div className="mt-2">
          <span className={`text-sm ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} ml-1`}>
            vs yesterday
          </span>
        </div>
      )}
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { 
    devices, 
    dashboard: deviceDashboard,
    controlDevice,
    loadDashboard 
  } = useDevices();
  
  const { 
    currentReading: sensorReading,
    loadReadings: loadSensorReadings,
    getReadingStatus 
  } = useSensor(null, 'temperature');
  
  const { isConnected } = useWebSocket('sensors');
  
  const [timeRange, setTimeRange] = useState('24h');
  const [sensorHistory, setSensorHistory] = useState([]);
  const [energyHistory, setEnergyHistory] = useState([]);

  useEffect(() => {
    loadDashboard();
    loadSensorReadings(24);
    
    // Load sensor history for chart
    const loadHistory = async () => {
      // This would come from your API
      const mockHistory = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        temperature: 20 + Math.random() * 10,
        humidity: 50 + Math.random() * 20,
      }));
      setSensorHistory(mockHistory);
    };
    loadHistory();
  }, []);

  // Get online/offline counts
  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const offlineDevices = devices.filter(d => d.status === 'offline').length;
  const activeAutomations = deviceDashboard?.active_automations?.length || 0;

  // Get sensor status
  const tempStatus = getReadingStatus('temperature');
  const humidityStatus = getReadingStatus('humidity');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Dashboard
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Welcome back, {user?.first_name || user?.username}!
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-primary-500`}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Devices"
          value={devices.length}
          icon="📱"
          change={5}
        />
        <StatsCard 
          title="Online Devices"
          value={onlineDevices}
          icon="🟢"
        />
        <StatsCard 
          title="Active Automations"
          value={activeAutomations}
          icon="⚡"
          change={-2}
        />
        <StatsCard 
          title="Energy Today"
          value={`${deviceDashboard?.energy_today?.toFixed(1) || 0} kWh`}
          icon="⚡"
          change={12}
        />
      </div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SensorCard 
          title="Temperature"
          value={sensorReading ? formatTemperature(sensorReading.temperature) : '--'}
          unit="°C"
          icon="🌡️"
          status={tempStatus}
          trend={{ direction: 'up', value: 2 }}
        />
        <SensorCard 
          title="Humidity"
          value={sensorReading ? formatHumidity(sensorReading.humidity) : '--'}
          unit="%"
          icon="💧"
          status={humidityStatus}
          trend={{ direction: 'down', value: 5 }}
        />
        <SensorCard 
          title="Light Level"
          value={sensorReading ? formatLightLevel(sensorReading.light_level) : '--'}
          unit="lux"
          icon="☀️"
          status="normal"
        />
        <SensorCard 
          title="Distance"
          value={sensorReading ? formatDistanceMetric(sensorReading.distance) : '--'}
          unit="cm"
          icon="📏"
          status="normal"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature & Humidity Chart */}
        <div className={`card ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Temperature & Humidity
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sensorHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="time" 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                />
                <YAxis 
                  yAxisId="left"
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    borderColor: isDark ? '#374151' : '#e5e7eb',
                    color: isDark ? '#ffffff' : '#000000'
                  }}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.1}
                  name="Temperature °C"
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.1}
                  name="Humidity %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Energy Consumption Chart */}
        <div className={`card ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Energy Consumption
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="time" 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                />
                <YAxis 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    borderColor: isDark ? '#374151' : '#e5e7eb',
                    color: isDark ? '#ffffff' : '#000000'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={false}
                  name="Energy kWh"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Devices */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Recent Devices
          </h2>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.slice(0, 6).map(device => (
            <DeviceCard 
              key={device.id} 
              device={device} 
              onControl={controlDevice}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`card ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Recent Activity
          </h3>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {deviceDashboard?.recent_activity?.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-0 border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <span className="text-xl">
                  {activity.action === 'ON' ? '💡' : activity.action === 'OFF' ? '⚫' : '🔧'}
                </span>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {activity.device_name} was turned {activity.action.toLowerCase()}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {activity.triggered_by}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard