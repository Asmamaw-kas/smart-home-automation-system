// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login/',
  REGISTER: '/auth/register/',
  LOGOUT: '/auth/logout/',
  REFRESH_TOKEN: '/auth/token/refresh/',
  PROFILE: '/auth/profile/',
  CHANGE_PASSWORD: '/auth/change-password/',
  
  // Devices
  DEVICES: '/devices/devices/',
  DEVICE_CONTROL: (id) => `/devices/devices/${id}/control/`,
  DEVICE_HISTORY: (id) => `/devices/devices/${id}/history/`,
  DEVICE_GROUPS: '/devices/groups/',
  DEVICE_AUTOMATIONS: '/devices/automations/',
  DEVICE_SCENES: '/devices/scenes/',
  DEVICE_SCHEDULES: '/devices/schedules/',
  DEVICE_DASHBOARD: '/devices/dashboard/',
  
  // Sensors
  SENSORS: '/sensors/sensors/',
  SENSOR_DATA: '/sensors/data/',
  SENSOR_CURRENT: '/sensors/current/',
  SENSOR_ALERTS: '/sensors/alerts/',
  SENSOR_DASHBOARD: '/sensors/dashboard/',
  SENSOR_CHARTS: '/sensors/charts/',
  
  // Logs
  ACTIVITY_LOGS: '/logs/activity/',
  DEVICE_LOGS: '/logs/device/',
  SECURITY_LOGS: '/logs/security/',
  SYSTEM_LOGS: '/logs/system/',
  ENERGY_LOGS: '/logs/energy/',
  LOG_DASHBOARD: '/logs/dashboard/',
};

// Device Types
export const DEVICE_TYPES = [
  { value: 'light', label: 'Light', icon: '💡' },
  { value: 'fan', label: 'Fan', icon: '🌀' },
  { value: 'door', label: 'Door', icon: '🚪' },
  { value: 'lock', label: 'Smart Lock', icon: '🔒' },
  { value: 'ac', label: 'Air Conditioner', icon: '❄️' },
  { value: 'tv', label: 'Television', icon: '📺' },
  { value: 'speaker', label: 'Smart Speaker', icon: '🔊' },
  { value: 'curtain', label: 'Curtain', icon: '🪟' },
  { value: 'pump', label: 'Water Pump', icon: '💧' },
  { value: 'other', label: 'Other', icon: '📱' },
];

// Sensor Types
export const SENSOR_TYPES = [
  { value: 'temperature', label: 'Temperature', unit: '°C', icon: '🌡️' },
  { value: 'humidity', label: 'Humidity', unit: '%', icon: '💧' },
  { value: 'light', label: 'Light', unit: '', icon: '☀️' },
  { value: 'ultrasonic', label: 'Distance', unit: 'cm', icon: '📏' },
  { value: 'motion', label: 'Motion', unit: '', icon: '🚶' },
  { value: 'gas', label: 'Gas', unit: 'ppm', icon: '💨' },
  { value: 'smoke', label: 'Smoke', unit: '', icon: '🔥' },
];

// Device Actions
export const DEVICE_ACTIONS = {
  light: [
    { value: 'on', label: 'Turn On', icon: '💡' },
    { value: 'off', label: 'Turn Off', icon: '⚫' },
    { value: 'toggle', label: 'Toggle', icon: '🔄' },
  ],
  fan: [
    { value: 'on', label: 'Turn On', icon: '🌀' },
    { value: 'off', label: 'Turn Off', icon: '⏹️' },
    { value: 'toggle', label: 'Toggle', icon: '🔄' },
  ],
  door: [
    { value: 'open', label: 'Open', icon: '🚪' },
    { value: 'close', label: 'Close', icon: '🚪' },
  ],
  lock: [
    { value: 'lock', label: 'Lock', icon: '🔒' },
    { value: 'unlock', label: 'Unlock', icon: '🔓' },
  ],
};

// Automation Condition Types
export const CONDITION_TYPES = [
  { value: 'time', label: 'Time Based' },
  { value: 'temperature', label: 'Temperature' },
  { value: 'humidity', label: 'Humidity' },
  { value: 'light', label: 'Light Level' },
  { value: 'motion', label: 'Motion Detected' },
  { value: 'door', label: 'Door Status' },
  { value: 'schedule', label: 'Schedule' },
];

// Automation Operators
export const OPERATORS = [
  { value: 'gt', label: 'Greater Than (>)' },
  { value: 'lt', label: 'Less Than (<)' },
  { value: 'eq', label: 'Equal To (=)' },
  { value: 'gte', label: 'Greater Than or Equal (≥)' },
  { value: 'lte', label: 'Less Than or Equal (≤)' },
  { value: 'ne', label: 'Not Equal (≠)' },
  { value: 'between', label: 'Between' },
];

// Log Severity Levels
export const LOG_SEVERITY = [
  { value: 'info', label: 'Info', color: 'blue' },
  { value: 'warning', label: 'Warning', color: 'yellow' },
  { value: 'error', label: 'Error', color: 'red' },
  { value: 'critical', label: 'Critical', color: 'darkred' },
];

// Days of Week
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

// Time Periods for Charts
export const TIME_PERIODS = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '3m', label: 'Last 3 Months' },
];

// Chart Colors
export const CHART_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6366f1', // indigo
  '#14b8a6', // teal
];

// Theme Options
export const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
];

// Accent Colors
export const ACCENT_COLORS = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
];

// Camera Resolutions
export const CAMERA_RESOLUTIONS = [
  { value: '640x480', label: '640x480 (SD)', width: 640, height: 480 },
  { value: '1280x720', label: '1280x720 (HD)', width: 1280, height: 720 },
  { value: '1920x1080', label: '1920x1080 (Full HD)', width: 1920, height: 1080 },
];

// Camera Status
export const CAMERA_STATUS = [
  { value: 'online', label: 'Online', color: 'green' },
  { value: 'offline', label: 'Offline', color: 'gray' },
  { value: 'recording', label: 'Recording', color: 'red' },
  { value: 'error', label: 'Error', color: 'yellow' },
];

// PTZ Directions
export const PTZ_DIRECTIONS = [
  { value: 'left', label: 'Left', icon: '◀' },
  { value: 'right', label: 'Right', icon: '▶' },
  { value: 'up', label: 'Up', icon: '▲' },
  { value: 'down', label: 'Down', icon: '▼' },
  { value: 'stop', label: 'Stop', icon: '●' },
];
// Font Sizes
export const FONT_SIZES = [
  { value: 'small', label: 'Small', class: 'text-sm' },
  { value: 'medium', label: 'Medium', class: 'text-base' },
  { value: 'large', label: 'Large', class: 'text-lg' },
];

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  ACCENT_COLOR: 'accentColor',
  FONT_SIZE: 'fontSize',
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  DEVICE_LAYOUT: 'deviceLayout',
  DASHBOARD_PREFERENCES: 'dashboardPreferences',
};

// WebSocket Events
export const WS_EVENTS = {
  SENSOR_UPDATE: 'update',
  SENSOR_BROADCAST: 'broadcast',
  SENSOR_INITIAL: 'initial',
  SENSOR_HISTORY: 'history',
  DEVICE_STATUS: 'status',
  DEVICE_UPDATE: 'device_update',
  DEVICE_COMMAND_SUCCESS: 'command_success',
  DEVICE_COMMAND_FAILED: 'command_failed',
  DEVICE_EMERGENCY: 'emergency',
};

// Default Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Toast Duration
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 4000,
  LONG: 6000,
};

// Date Formats
export const DATE_FORMATS = {
  FULL: 'MMMM Do YYYY, h:mm:ss a',
  SHORT: 'MMM Do, h:mm a',
  TIME: 'h:mm a',
  DATE: 'MMMM Do YYYY',
  TIME_ONLY: 'HH:mm',
  DATE_ONLY: 'YYYY-MM-DD',
};