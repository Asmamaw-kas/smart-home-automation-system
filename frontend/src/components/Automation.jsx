import React, { useState, useEffect } from 'react';
import { useDevices } from '../context/DeviceContext';
import { useTheme } from '../context/ThemeContext';
import { useForm } from '../hooks/useForm';
import { useSensor } from '../hooks/useSensor';
import { formatRelativeTime } from '../utils/helpers';
import { CONDITION_TYPES, OPERATORS, DAYS_OF_WEEK } from '../utils/constants';
import * as yup from 'yup';
import toast from 'react-hot-toast';

// Automation Rule Card Component
const AutomationRuleCard = ({ rule, onEdit, onDelete, onToggle }) => {
  const { isDark } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const getConditionIcon = (type) => {
    const icons = {
      time: '⏰',
      temperature: '🌡️',
      humidity: '💧',
      light: '☀️',
      motion: '🚶',
      door: '🚪',
      schedule: '📅',
    };
    return icons[type] || '⚙️';
  };

  const getActionIcon = (type) => {
    const icons = {
      device_on: '🔛',
      device_off: '🔴',
      device_toggle: '🔄',
      device_lock: '🔒',
      device_unlock: '🔓',
      device_open: '🚪',
      device_close: '🚪',
      notification: '📢',
    };
    return icons[type] || '⚡';
  };

  const formatCondition = () => {
    switch (rule.condition_type) {
      case 'time':
        return rule.specific_time 
          ? `At ${rule.specific_time}`
          : `${rule.start_time} - ${rule.end_time}`;
      case 'temperature':
        return `Temperature ${rule.operator} ${rule.threshold_value}°C`;
      case 'humidity':
        return `Humidity ${rule.operator} ${rule.threshold_value}%`;
      case 'light':
        return `Light level ${rule.operator} ${rule.threshold_value}`;
      case 'schedule':
        return `${rule.days_of_week?.length || 0} days selected`;
      default:
        return rule.condition_type;
    }
  };

  const formatAction = () => {
    if (rule.target_device) {
      return `${rule.action_type.replace('_', ' ')} ${rule.target_device_name}`;
    }
    return rule.action_type.replace('_', ' ');
  };

  return (
    <div className={`card ${isDark ? 'bg-gray-800' : 'bg-white'} hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-lg ${
            rule.is_active 
              ? isDark ? 'bg-green-900/30' : 'bg-green-100'
              : isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <span className="text-2xl">{getConditionIcon(rule.condition_type)}</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {rule.name}
              </h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                rule.priority > 0
                  ? 'bg-yellow-100 text-yellow-800'
                  : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}>
                Priority {rule.priority}
              </span>
            </div>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {rule.description || 'No description'}
            </p>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center space-x-1">
                <span className="text-lg">{getConditionIcon(rule.condition_type)}</span>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formatCondition()}
                </span>
              </div>
              <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>→</span>
              <div className="flex items-center space-x-1">
                <span className="text-lg">{getActionIcon(rule.action_type)}</span>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formatAction()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggle(rule.id, !rule.is_active)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              rule.is_active 
                ? 'bg-primary-600' 
                : isDark ? 'bg-gray-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                rule.is_active ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className={`p-2 rounded-lg ${
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <svg className={`w-5 h-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={() => onEdit(rule)}
            className={`p-2 rounded-lg ${
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(rule.id)}
            className={`p-2 rounded-lg ${
              isDark ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-500'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Condition Details
              </h4>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-medium">Type:</span> {rule.condition_type}
                </p>
                {rule.sensor && (
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-medium">Sensor:</span> {rule.sensor_name}
                  </p>
                )}
                {rule.operator && (
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-medium">Operator:</span> {rule.operator}
                  </p>
                )}
                {rule.threshold_value && (
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-medium">Value:</span> {rule.threshold_value}
                    {rule.condition_type === 'temperature' ? '°C' : rule.condition_type === 'humidity' ? '%' : ''}
                  </p>
                )}
                {rule.days_of_week?.length > 0 && (
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-medium">Days:</span> {rule.days_display}
                  </p>
                )}
              </div>
            </div>
            <div>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Action Details
              </h4>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-medium">Action:</span> {rule.action_type}
                </p>
                {rule.target_device && (
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-medium">Device:</span> {rule.target_device_name}
                  </p>
                )}
                {rule.action_value && (
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-medium">Value:</span> {rule.action_value}
                  </p>
                )}
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-medium">Cooldown:</span> {rule.cooldown_minutes} minutes
                </p>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-medium">Triggered:</span> {rule.trigger_count} times
                </p>
                {rule.last_triggered && (
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-medium">Last:</span> {formatRelativeTime(rule.last_triggered)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Scene Card Component
const SceneCard = ({ scene, onActivate, onEdit, onDelete }) => {
  const { isDark } = useTheme();
  const [activating, setActivating] = useState(false);

  const handleActivate = async () => {
    setActivating(true);
    await onActivate(scene.id);
    setActivating(false);
  };

  return (
    <div className={`card ${isDark ? 'bg-gray-800' : 'bg-white'} hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <span className="text-2xl">{scene.icon || '🎬'}</span>
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {scene.name}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {scene.description || 'No description'}
            </p>
          </div>
        </div>
        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {Object.keys(scene.device_states || {}).length} devices
        </span>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(scene.device_states || {}).slice(0, 5).map(([deviceId, state], idx) => (
            <span
              key={idx}
              className={`px-2 py-1 text-xs rounded-full ${
                isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {state}
            </span>
          ))}
          {Object.keys(scene.device_states || {}).length > 5 && (
            <span className={`px-2 py-1 text-xs rounded-full ${
              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}>
              +{Object.keys(scene.device_states).length - 5} more
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handleActivate}
          disabled={activating}
          className="flex-1 mr-2 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {activating ? (
            <svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : 'Activate Scene'}
        </button>
        <button
          onClick={() => onEdit(scene)}
          className={`p-2 rounded-lg ${
            isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(scene.id)}
          className={`p-2 rounded-lg ${
            isDark ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-500'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Schedule Card Component
const ScheduleCard = ({ schedule, onEdit, onDelete, onToggle }) => {
  const { isDark } = useTheme();

  const formatDays = (days) => {
    if (!days || days.length === 0) return 'Every day';
    if (days.length === 7) return 'Every day';
    
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(d => dayNames[d]).join(', ');
  };

  return (
    <div className={`card ${isDark ? 'bg-gray-800' : 'bg-white'} hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <span className="text-2xl">⏰</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {schedule.name}
              </h3>
            </div>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {schedule.device_name} → {schedule.action}
              {schedule.value && ` (${schedule.value}%)`}
            </p>
            <div className="flex items-center mt-2 space-x-4">
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {schedule.time}
              </span>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {formatDays(schedule.days)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggle(schedule.id, !schedule.is_active)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              schedule.is_active 
                ? 'bg-primary-600' 
                : isDark ? 'bg-gray-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                schedule.is_active ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <button
            onClick={() => onEdit(schedule)}
            className={`p-2 rounded-lg ${
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(schedule.id)}
            className={`p-2 rounded-lg ${
              isDark ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-500'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Automation Rule Form Modal
const AutomationRuleForm = ({ rule, onClose, onSuccess }) => {
  const { isDark } = useTheme();
  const { devices, createAutomation, updateAutomation } = useDevices();
  const { sensors } = useSensor();

  const validationSchema = yup.object({
    name: yup.string().required('Rule name is required'),
    description: yup.string(),
    condition_type: yup.string().required('Condition type is required'),
    operator: yup.string().when('condition_type', {
      is: (val) => ['temperature', 'humidity', 'light'].includes(val),
      then: yup.string().required('Operator is required'),
    }),
    sensor: yup.number().when('condition_type', {
      is: (val) => ['temperature', 'humidity', 'light', 'motion'].includes(val),
      then: yup.number().required('Sensor is required'),
    }),
    threshold_value: yup.number().when('condition_type', {
      is: (val) => ['temperature', 'humidity', 'light'].includes(val),
      then: yup.number().required('Threshold value is required'),
    }),
    specific_time: yup.string().when('condition_type', {
      is: 'time',
      then: yup.string().required('Time is required'),
    }),
    action_type: yup.string().required('Action type is required'),
    target_device: yup.number().when('action_type', {
      is: (val) => ['device_on', 'device_off', 'device_toggle', 'device_lock', 'device_unlock', 'device_open', 'device_close'].includes(val),
      then: yup.number().required('Target device is required'),
    }),
    priority: yup.number().min(0).max(10),
    cooldown_minutes: yup.number().min(0),
  });

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm(
    {
      name: rule?.name || '',
      description: rule?.description || '',
      condition_type: rule?.condition_type || 'time',
      operator: rule?.operator || 'gt',
      sensor: rule?.sensor || '',
      threshold_value: rule?.threshold_value || '',
      specific_time: rule?.specific_time || '',
      start_time: rule?.start_time || '',
      end_time: rule?.end_time || '',
      days_of_week: rule?.days_of_week || [],
      action_type: rule?.action_type || 'device_on',
      target_device: rule?.target_device || '',
      action_value: rule?.action_value || '',
      priority: rule?.priority || 0,
      cooldown_minutes: rule?.cooldown_minutes || 0,
    },
    validationSchema
  );

  const onSubmit = async (formValues) => {
    let result;
    if (rule) {
      result = await updateAutomation(rule.id, formValues);
    } else {
      result = await createAutomation(formValues);
    }

    if (result.success) {
      toast.success(rule ? 'Rule updated' : 'Rule created');
      onSuccess();
      onClose();
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto`}>
      <div className={`max-w-2xl w-full rounded-xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} my-8`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {rule ? 'Edit Automation Rule' : 'Create Automation Rule'}
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
            <div className="space-y-4 max-h-[60vh] overflow-y-auto px-2">
              {/* Basic Info */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Rule Name *
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
                  placeholder="e.g., Turn on lights at sunset"
                />
                {touched.name && errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  rows="2"
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Optional description"
                />
              </div>

              {/* Condition Type */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Condition Type *
                </label>
                <select
                  name="condition_type"
                  value={values.condition_type}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {CONDITION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition-specific fields */}
              {['temperature', 'humidity', 'light'].includes(values.condition_type) && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Sensor *
                      </label>
                      <select
                        name="sensor"
                        value={values.sensor}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="">Select sensor</option>
                        {sensors?.filter(s => s.sensor_type === values.condition_type).map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Operator *
                      </label>
                      <select
                        name="operator"
                        value={values.operator}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {OPERATORS.map(op => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Threshold Value *
                    </label>
                    <input
                      type="number"
                      name="threshold_value"
                      value={values.threshold_value}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={values.condition_type === 'temperature' ? 'e.g., 30' : 'e.g., 500'}
                    />
                  </div>
                </>
              )}

              {values.condition_type === 'time' && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Time *
                  </label>
                  <input
                    type="time"
                    name="specific_time"
                    value={values.specific_time}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              )}

              {values.condition_type === 'schedule' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Start Time
                      </label>
                      <input
                        type="time"
                        name="start_time"
                        value={values.start_time}
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
                        End Time
                      </label>
                      <input
                        type="time"
                        name="end_time"
                        value={values.end_time}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Days of Week
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {DAYS_OF_WEEK.map(day => (
                        <label key={day.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="days_of_week"
                            value={day.value}
                            checked={values.days_of_week.includes(day.value)}
                            onChange={(e) => {
                              const newDays = e.target.checked
                                ? [...values.days_of_week, day.value]
                                : values.days_of_week.filter(d => d !== day.value);
                              handleChange({ target: { name: 'days_of_week', value: newDays } });
                            }}
                            className="rounded border-gray-300 text-primary-600"
                          />
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {day.label.substring(0, 3)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Action Type */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Action Type *
                </label>
                <select
                  name="action_type"
                  value={values.action_type}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="device_on">Turn Device On</option>
                  <option value="device_off">Turn Device Off</option>
                  <option value="device_toggle">Toggle Device</option>
                  <option value="device_lock">Lock Device</option>
                  <option value="device_unlock">Unlock Device</option>
                  <option value="device_open">Open Device</option>
                  <option value="device_close">Close Device</option>
                  <option value="notification">Send Notification</option>
                </select>
              </div>

              {values.action_type !== 'notification' && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Target Device *
                  </label>
                  <select
                    name="target_device"
                    value={values.target_device}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Select device</option>
                    {devices.map(device => (
                      <option key={device.id} value={device.id}>
                        {device.name} ({device.room || 'No room'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {values.action_type === 'notification' && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Notification Message
                  </label>
                  <input
                    type="text"
                    name="action_value"
                    value={values.action_value}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Enter notification message"
                  />
                </div>
              )}

              {/* Additional Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Priority (0-10)
                  </label>
                  <input
                    type="number"
                    name="priority"
                    min="0"
                    max="10"
                    value={values.priority}
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
                    Cooldown (minutes)
                  </label>
                  <input
                    type="number"
                    name="cooldown_minutes"
                    min="0"
                    value={values.cooldown_minutes}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
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
                {rule ? 'Update Rule' : 'Create Rule'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Scene Form Modal
const SceneForm = ({ scene, devices, onClose, onSuccess }) => {
  const { isDark } = useTheme();

  const validationSchema = yup.object({
    name: yup.string().required('Scene name is required'),
    description: yup.string(),
    icon: yup.string(),
  });

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm(
    {
      name: scene?.name || '',
      description: scene?.description || '',
      icon: scene?.icon || '🎬',
      device_states: scene?.device_states || {},
    },
    validationSchema
  );

  const [deviceStates, setDeviceStates] = useState(values.device_states);

  const handleDeviceStateChange = (deviceId, state) => {
    setDeviceStates(prev => ({
      ...prev,
      [deviceId]: state
    }));
  };

  const onSubmit = async (formValues) => {
    // This would integrate with your scene service
    toast.success('Scene saved (demo)');
    onSuccess();
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto`}>
      <div className={`max-w-2xl w-full rounded-xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} my-8`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {scene ? 'Edit Scene' : 'Create Scene'}
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
            <div className="space-y-4 max-h-[60vh] overflow-y-auto px-2">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Scene Name *
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
                  placeholder="e.g., Movie Night"
                />
                {touched.name && errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  rows="2"
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="What does this scene do?"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Icon
                </label>
                <select
                  name="icon"
                  value={values.icon}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="🎬">Movie</option>
                  <option value="🌙">Night</option>
                  <option value="☀️">Day</option>
                  <option value="📖">Reading</option>
                  <option value="🍽️">Dinner</option>
                  <option value="🎉">Party</option>
                  <option value="😴">Sleep</option>
                  <option value="🏠">Home</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Device States
                </label>
                <div className="space-y-3">
                  {devices.map(device => (
                    <div key={device.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {device.name}
                          </span>
                          <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            ({device.room || 'No room'})
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {device.device_type === 'light' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDeviceStateChange(device.id, 'on')}
                              className={`px-3 py-1 rounded-lg text-sm ${
                                deviceStates[device.id] === 'on'
                                  ? 'bg-green-500 text-white'
                                  : isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              On
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeviceStateChange(device.id, 'off')}
                              className={`px-3 py-1 rounded-lg text-sm ${
                                deviceStates[device.id] === 'off'
                                  ? 'bg-red-500 text-white'
                                  : isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              Off
                            </button>
                          </>
                        )}
                        {device.device_type === 'fan' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDeviceStateChange(device.id, 'on')}
                              className={`px-3 py-1 rounded-lg text-sm ${
                                deviceStates[device.id] === 'on'
                                  ? 'bg-green-500 text-white'
                                  : isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              On
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeviceStateChange(device.id, 'off')}
                              className={`px-3 py-1 rounded-lg text-sm ${
                                deviceStates[device.id] === 'off'
                                  ? 'bg-red-500 text-white'
                                  : isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              Off
                            </button>
                          </>
                        )}
                        {device.device_type === 'door' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDeviceStateChange(device.id, 'open')}
                              className={`px-3 py-1 rounded-lg text-sm ${
                                deviceStates[device.id] === 'open'
                                  ? 'bg-green-500 text-white'
                                  : isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              Open
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeviceStateChange(device.id, 'closed')}
                              className={`px-3 py-1 rounded-lg text-sm ${
                                deviceStates[device.id] === 'closed'
                                  ? 'bg-red-500 text-white'
                                  : isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              Closed
                            </button>
                          </>
                        )}
                        {device.device_type === 'lock' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDeviceStateChange(device.id, 'unlocked')}
                              className={`px-3 py-1 rounded-lg text-sm ${
                                deviceStates[device.id] === 'unlocked'
                                  ? 'bg-green-500 text-white'
                                  : isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              Unlock
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeviceStateChange(device.id, 'locked')}
                              className={`px-3 py-1 rounded-lg text-sm ${
                                deviceStates[device.id] === 'locked'
                                  ? 'bg-red-500 text-white'
                                  : isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              Lock
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
                {scene ? 'Update Scene' : 'Create Scene'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Automation Component
const Automation = () => {
  const { isDark } = useTheme();
  const { 
    automations, 
    scenes, 
    schedules, 
    devices,
    loadAutomations,
    loadScenes,
    loadSchedules,
    deleteAutomation,
    deleteScene,
    deleteSchedule,
    activateScene,
    updateAutomation,
    updateSchedule
  } = useDevices();

  const [activeTab, setActiveTab] = useState('rules');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [showSceneForm, setShowSceneForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [editingScene, setEditingScene] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Filter items based on search
  const filteredAutomations = automations.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredScenes = scenes.filter(scene =>
    scene.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scene.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSchedules = schedules.filter(schedule =>
    schedule.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleRule = async (ruleId, isActive) => {
    const rule = automations.find(r => r.id === ruleId);
    await updateAutomation(ruleId, { ...rule, is_active: isActive });
    toast.success(`Rule ${isActive ? 'activated' : 'deactivated'}`);
  };

  const handleToggleSchedule = async (scheduleId, isActive) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    await updateSchedule(scheduleId, { ...schedule, is_active: isActive });
    toast.success(`Schedule ${isActive ? 'activated' : 'deactivated'}`);
  };

  const handleActivateScene = async (sceneId) => {
    const result = await activateScene(sceneId);
    if (result.success) {
      toast.success('Scene activated');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Automation
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Create smart rules, scenes, and schedules for your home
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rules'
                ? 'border-primary-600 text-primary-600'
                : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
            }`}
          >
            Automation Rules
          </button>
          <button
            onClick={() => setActiveTab('scenes')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'scenes'
                ? 'border-primary-600 text-primary-600'
                : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
            }`}
          >
            Scenes
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schedules'
                ? 'border-primary-600 text-primary-600'
                : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
            }`}
          >
            Schedules
          </button>
        </nav>
      </div>

      {/* Search and Add Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <button
          onClick={() => {
            if (activeTab === 'rules') {
              setEditingRule(null);
              setShowRuleForm(true);
            } else if (activeTab === 'scenes') {
              setEditingScene(null);
              setShowSceneForm(true);
            } else {
              setEditingSchedule(null);
              setShowScheduleForm(true);
            }
          }}
          className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add {activeTab === 'rules' ? 'Rule' : activeTab === 'scenes' ? 'Scene' : 'Schedule'}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {filteredAutomations.length > 0 ? (
            filteredAutomations.map(rule => (
              <AutomationRuleCard
                key={rule.id}
                rule={rule}
                onEdit={() => {
                  setEditingRule(rule);
                  setShowRuleForm(true);
                }}
                onDelete={deleteAutomation}
                onToggle={handleToggleRule}
              />
            ))
          ) : (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <p className="text-lg">No automation rules found</p>
              <p className="text-sm mt-2">Create your first rule to get started</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'scenes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScenes.length > 0 ? (
            filteredScenes.map(scene => (
              <SceneCard
                key={scene.id}
                scene={scene}
                onActivate={handleActivateScene}
                onEdit={() => {
                  setEditingScene(scene);
                  setShowSceneForm(true);
                }}
                onDelete={deleteScene}
              />
            ))
          ) : (
            <div className={`col-span-full text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <p className="text-lg">No scenes found</p>
              <p className="text-sm mt-2">Create your first scene to control multiple devices at once</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'schedules' && (
        <div className="space-y-4">
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map(schedule => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onEdit={() => {
                  setEditingSchedule(schedule);
                  setShowScheduleForm(true);
                }}
                onDelete={deleteSchedule}
                onToggle={handleToggleSchedule}
              />
            ))
          ) : (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <p className="text-lg">No schedules found</p>
              <p className="text-sm mt-2">Create your first schedule for automated actions</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showRuleForm && (
        <AutomationRuleForm
          rule={editingRule}
          onClose={() => {
            setShowRuleForm(false);
            setEditingRule(null);
          }}
          onSuccess={() => {
            loadAutomations();
          }}
        />
      )}

      {showSceneForm && (
        <SceneForm
          scene={editingScene}
          devices={devices}
          onClose={() => {
            setShowSceneForm(false);
            setEditingScene(null);
          }}
          onSuccess={() => {
            loadScenes();
          }}
        />
      )}
    </div>
  );
};

export default Automation;