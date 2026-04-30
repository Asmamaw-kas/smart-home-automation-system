import React, { useState, useEffect, useMemo } from 'react';
import { useDevices } from '../context/DeviceContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime } from '../utils/helpers';
import toast from 'react-hot-toast';
import SecurityCamera from './Camera';

// PinPad Component
const PinPad = ({ onPinEntered, onClose, title = "Enter PIN", maxLength = 4 }) => {
  const { isDark } = useTheme();
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(30);

  useEffect(() => {
    let interval;
    if (locked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer(prev => {
          if (prev <= 1) {
            setLocked(false);
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [locked, lockTimer]);

  const handleNumberPress = (num) => {
    if (locked) return;
    if (pin.length < maxLength) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    if (locked) return;
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (locked) return;
    setPin('');
  };

  const handleSubmit = () => {
    if (locked) return;

    if (pin.length === maxLength) {
      const success = onPinEntered(pin);

      if (!success) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPin('');

        if (newAttempts >= 3) {
          setLocked(true);
          setLockTimer(30);
          toast.error('Too many attempts. Please wait 30 seconds.');
        } else {
          toast.error(`Incorrect PIN. ${3 - newAttempts} attempts remaining.`);
        }
      }
    }
  };

  const numbers = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ['C', 0, '⌫']
  ];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50`}>
      <div className={`max-w-sm w-full rounded-xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {title}
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
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex justify-center space-x-3">
                {Array.from({ length: maxLength }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full ${
                      i < pin.length
                        ? 'bg-primary-600'
                        : isDark ? 'bg-gray-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              {locked && (
                <p className="mt-2 text-sm text-red-500">
                  Locked for {lockTimer} seconds
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {numbers.map((row, rowIndex) => (
              row.map((item, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => {
                    if (item === 'C') handleClear();
                    else if (item === '⌫') handleDelete();
                    else handleNumberPress(item.toString());
                  }}
                  disabled={locked}
                  className={`p-4 text-xl font-semibold rounded-lg transition-colors ${
                    item === 'C' || item === '⌫'
                      ? isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : isDark
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {item}
                </button>
              ))
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={pin.length !== maxLength || locked}
            className="w-full mt-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

// Door Control Component
const DoorControl = ({ door, onControl, onClose }) => {
  const { isDark } = useTheme();
  const [showPinPad, setShowPinPad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);

  const handlePinEntered = (pin) => {
    if (pin === '1234') {
      setPinSuccess(true);
      setShowPinPad(false);
      toast.success('PIN verified');
      return true;
    }
    return false;
  };

  const handleAction = async (action) => {
    setLoading(true);
    try {
      await onControl(door.id, action);
      toast.success(`${door.name} ${action}ed`);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50`}>
        <div className={`max-w-md w-full rounded-xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {door.name}
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
              <div className={`p-6 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <span className="text-6xl">🚪</span>
                <h4 className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {door.current_state === 'locked' ? 'Locked' : 'Unlocked'}
                </h4>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Status: {door.status}
                </p>
                {door.last_updated && (
                  <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Last updated: {formatRelativeTime(door.last_updated)}
                  </p>
                )}
              </div>
            </div>

            {!pinSuccess && door.current_state === 'locked' ? (
              <button
                onClick={() => setShowPinPad(true)}
                className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 mb-3"
              >
                Enter PIN to Unlock
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAction('unlock')}
                  disabled={loading || door.current_state === 'unlocked'}
                  className={`py-3 px-4 rounded-lg font-medium ${
                    door.current_state === 'unlocked'
                      ? isDark
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {loading ? '...' : 'Unlock'}
                </button>
                <button
                  onClick={() => handleAction('lock')}
                  disabled={loading || door.current_state === 'locked'}
                  className={`py-3 px-4 rounded-lg font-medium ${
                    door.current_state === 'locked'
                      ? isDark
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {loading ? '...' : 'Lock'}
                </button>
              </div>
            )}

            {pinSuccess && (
              <p className="text-center text-sm text-green-500 mt-3">
                ✓ PIN verified. You can now control the door.
              </p>
            )}

            <button
              onClick={onClose}
              className={`w-full mt-3 py-2 text-sm ${
                isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {showPinPad && (
        <PinPad
          title="Enter Door PIN"
          onPinEntered={handlePinEntered}
          onClose={() => setShowPinPad(false)}
        />
      )}
    </>
  );
};

// Access Logs Component
const AccessLogs = ({ logs }) => {
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
    };
    return icons[eventType] || '📝';
  };

  const getEventColor = (eventType, result) => {
    if (result === 'failed') return 'text-red-500';
    if (result === 'success') return 'text-green-500';
    if (eventType === 'emergency') return 'text-red-500';
    if (eventType === 'unauthorized') return 'text-red-500';
    return isDark ? 'text-gray-300' : 'text-gray-700';
  };

  return (
    <div className={`card ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Recent Access Logs
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
                      <span className={`font-medium ${getEventColor(log.event_type, log.result)}`}>
                        {log.event_type?.replace('_', ' ').toUpperCase()}
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
                        PIN: {'•'.repeat(log.pin_entered.length)}
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
          <p className="text-lg">No access logs found</p>
          <p className="text-sm mt-2">Access logs will appear here</p>
        </div>
      )}
    </div>
  );
};

// Security Status Card
const SecurityStatusCard = ({ title, value, icon, color }) => {
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
        <div className={`p-3 rounded-lg ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

// Main Security Component
const Security = () => {
  const { isDark } = useTheme();
  const { devices, controlDevice } = useDevices();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('doors');
  const [selectedDoor, setSelectedDoor] = useState(null);
  const [showDoorControl, setShowDoorControl] = useState(false);
  const [accessLogs, setAccessLogs] = useState([]);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSetupStep, setPinSetupStep] = useState(1);

  // FIX: memoize doors so it doesn't become a new array on every render
  const doors = useMemo(() => {
    return devices.filter(d => d.device_type === 'door' || d.device_type === 'lock');
  }, [devices]);

  const securityStatus = useMemo(() => ({
    totalDoors: doors.length,
    lockedDoors: doors.filter(d => d.current_state === 'locked' || d.current_state === 'closed').length,
    failedAttempts: 3,
    securityLevel: 'high'
  }), [doors]);

  // FIX: depend only on stable values
  useEffect(() => {
    const mockLogs = [
      {
        event_type: 'door_access',
        result: 'success',
        description: 'Front door unlocked',
        username: user?.username || 'Admin',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        ip_address: '192.168.1.100',
        location: 'Main Entrance'
      },
      {
        event_type: 'pin_success',
        result: 'success',
        description: 'PIN verified for back door',
        username: user?.username || 'Admin',
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
        event_type: 'lock_status',
        result: 'success',
        description: 'All doors locked automatically',
        username: 'System',
        timestamp: new Date(Date.now() - 60 * 60000).toISOString()
      }
    ];
    setAccessLogs(mockLogs);
  }, [user?.username]);

  const handleDoorControl = async (doorId, action) => {
    return await controlDevice(doorId, action);
  };

  const handleEmergencyLock = async () => {
    if (window.confirm('⚠️ Emergency Lock: This will lock all doors immediately. Continue?')) {
      toast.promise(
        Promise.all(doors.map(door => controlDevice(door.id, 'lock'))),
        {
          loading: 'Locking all doors...',
          success: 'All doors locked successfully',
          error: 'Failed to lock some doors'
        }
      );
    }
  };

  const handlePinSetup = () => {
    if (newPin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }
    if (newPin.length < 4) {
      toast.error('PIN must be at least 4 digits');
      return;
    }
    toast.success('PIN updated successfully');
    setShowPinSetup(false);
    setNewPin('');
    setConfirmPin('');
    setPinSetupStep(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Security
        </h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Monitor and control your home security
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SecurityStatusCard
          title="Total Doors"
          value={securityStatus.totalDoors}
          icon="🚪"
          color="bg-blue-500"
        />
        <SecurityStatusCard
          title="Locked Doors"
          value={securityStatus.lockedDoors}
          icon="🔒"
          color="bg-green-500"
        />
        <SecurityStatusCard
          title="Failed Attempts"
          value={securityStatus.failedAttempts}
          icon="⚠️"
          color="bg-yellow-500"
        />
        <SecurityStatusCard
          title="Security Level"
          value={securityStatus.securityLevel.toUpperCase()}
          icon="🛡️"
          color="bg-purple-500"
        />
      </div>

      <div className={`p-6 rounded-lg ${isDark ? 'bg-red-900/20' : 'bg-red-50'} border border-red-200 dark:border-red-800`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-red-400' : 'text-red-700'}`}>
              Emergency Actions
            </h3>
            <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>
              Use these in case of emergency
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleEmergencyLock}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              🚨 Emergency Lock All
            </button>
            <button
              onClick={() => setShowPinSetup(true)}
              className={`px-4 py-2 rounded-lg ${
                isDark
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Change PIN
            </button>
          </div>
        </div>
      </div>

      <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('doors')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'doors'
                ? 'border-primary-600 text-primary-600'
                : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
            }`}
          >
            🚪 Doors & Locks
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-primary-600 text-primary-600'
                : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
            }`}
          >
            📝 Access Logs
          </button>
          <button
            onClick={() => setActiveTab('cameras')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cameras'
                ? 'border-primary-600 text-primary-600'
                : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
            }`}
          >
            📷 Security Cameras
          </button>
        </nav>
      </div>

      {activeTab === 'doors' && (
        <div>
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Doors & Locks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doors.map(door => (
              <div
                key={door.id}
                className={`card ${isDark ? 'bg-gray-800' : 'bg-white'} hover:shadow-lg transition-shadow cursor-pointer`}
                onClick={() => {
                  setSelectedDoor(door);
                  setShowDoorControl(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${
                      door.current_state === 'unlocked' || door.current_state === 'open'
                        ? isDark ? 'bg-green-900/30' : 'bg-green-100'
                        : isDark ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <span className="text-2xl">
                        {door.device_type === 'lock' ? '🔒' : '🚪'}
                      </span>
                    </div>
                    <div>
                      <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {door.name}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {door.room || 'No room'}
                      </p>
                    </div>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${
                    door.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className={`text-sm font-medium ${
                      door.current_state === 'unlocked' || door.current_state === 'open'
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}>
                      {door.current_state}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDoor(door);
                      setShowDoorControl(true);
                    }}
                    className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                  >
                    Control
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <AccessLogs logs={accessLogs} />
      )}

      {activeTab === 'cameras' && (
        <SecurityCamera />
      )}

      {showPinSetup && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50`}>
          <div className={`max-w-md w-full rounded-xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {pinSetupStep === 1 ? 'Enter New PIN' : 'Confirm New PIN'}
                </h3>
                <button
                  onClick={() => {
                    setShowPinSetup(false);
                    setNewPin('');
                    setConfirmPin('');
                    setPinSetupStep(1);
                  }}
                  className={`p-2 rounded-lg ${
                    isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {pinSetupStep === 1 ? (
                <>
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Enter a 4-6 digit PIN for door access
                  </p>
                  <input
                    type="password"
                    maxLength="6"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className={`w-full px-3 py-2 border rounded-lg text-center text-2xl tracking-widest ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="••••••"
                    autoFocus
                  />
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowPinSetup(false)}
                      className={`px-4 py-2 rounded-lg ${
                        isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (newPin.length >= 4) {
                          setPinSetupStep(2);
                        } else {
                          toast.error('PIN must be at least 4 digits');
                        }
                      }}
                      disabled={newPin.length < 4}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Confirm your new PIN
                  </p>
                  <input
                    type="password"
                    maxLength="6"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className={`w-full px-3 py-2 border rounded-lg text-center text-2xl tracking-widest ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="••••••"
                    autoFocus
                  />
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => {
                        setPinSetupStep(1);
                        setConfirmPin('');
                      }}
                      className={`px-4 py-2 rounded-lg ${
                        isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePinSetup}
                      disabled={confirmPin.length < 4 || confirmPin !== newPin}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                      Save PIN
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showDoorControl && selectedDoor && (
        <DoorControl
          door={selectedDoor}
          onControl={handleDoorControl}
          onClose={() => {
            setShowDoorControl(false);
            setSelectedDoor(null);
          }}
        />
      )}
    </div>
  );
};

export default Security;