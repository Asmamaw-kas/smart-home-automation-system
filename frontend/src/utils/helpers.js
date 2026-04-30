import { format as dateFormat, formatDistance, formatRelative, parseISO } from 'date-fns';

// Date formatting
export const formatDate = (date, formatStr = 'PPpp') => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateFormat(dateObj, formatStr);
  } catch {
    return '';
  }
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(dateObj, new Date(), { addSuffix: true });
  } catch {
    return '';
  }
};

export const formatTimeAgo = (date) => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatRelative(dateObj, new Date());
  } catch {
    return '';
  }
};

// Number formatting
export const formatNumber = (num, decimals = 1) => {
  if (num === null || num === undefined) return '--';
  return Number(num).toFixed(decimals);
};

export const formatPercentage = (num, decimals = 1) => {
  if (num === null || num === undefined) return '--%';
  return `${formatNumber(num, decimals)}%`;
};

export const formatTemperature = (temp) => {
  if (temp === null || temp === undefined) return '--°C';
  return `${formatNumber(temp, 1)}°C`;
};

export const formatHumidity = (humidity) => {
  if (humidity === null || humidity === undefined) return '--%';
  return `${Math.round(humidity)}%`;
};

// Renamed from formatDistance to formatDistanceMetric to avoid conflict
export const formatDistanceMetric = (distance) => {
  if (distance === null || distance === undefined) return '--cm';
  return `${Math.round(distance)}cm`;
};

export const formatLightLevel = (level) => {
  if (level === null || level === undefined) return '--';
  return level.toString();
};

export const formatEnergy = (kwh) => {
  if (kwh === null || kwh === undefined) return '-- kWh';
  return `${formatNumber(kwh, 2)} kWh`;
};

export const formatPower = (watts) => {
  if (watts === null || watts === undefined) return '-- W';
  if (watts > 1000) {
    return `${formatNumber(watts / 1000, 1)} kW`;
  }
  return `${Math.round(watts)} W`;
};

// Device state formatting
export const formatDeviceState = (state, deviceType) => {
  const stateMap = {
    light: { on: 'On', off: 'Off' },
    fan: { on: 'On', off: 'Off' },
    door: { open: 'Open', closed: 'Closed' },
    lock: { unlocked: 'Unlocked', locked: 'Locked' },
  };
  
  return stateMap[deviceType]?.[state] || state;
};

export const getDeviceStateColor = (state, deviceType) => {
  const colorMap = {
    light: { on: 'green', off: 'gray' },
    fan: { on: 'green', off: 'gray' },
    door: { open: 'green', closed: 'gray' },
    lock: { unlocked: 'green', locked: 'gray' },
  };
  
  return colorMap[deviceType]?.[state] || 'gray';
};

// Sensor status
export const getSensorStatusColor = (status) => {
  const colors = {
    active: 'green',
    inactive: 'gray',
    maintenance: 'yellow',
    error: 'red',
  };
  return colors[status] || 'gray';
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generate random ID
export const generateId = (length = 8) => {
  return Math.random().toString(36).substring(2, length + 2);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Group array by key
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

// Sort array by key
export const sortBy = (array, key, ascending = true) => {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return ascending ? -1 : 1;
    if (a[key] > b[key]) return ascending ? 1 : -1;
    return 0;
  });
};

// Filter array by search term
export const filterBySearch = (array, searchTerm, keys) => {
  if (!searchTerm) return array;
  const term = searchTerm.toLowerCase();
  return array.filter(item => {
    return keys.some(key => {
      const value = item[key];
      return value && value.toString().toLowerCase().includes(term);
    });
  });
};

// Calculate average
export const calculateAverage = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

// Convert Celsius to Fahrenheit
export const celsiusToFahrenheit = (celsius) => {
  return (celsius * 9/5) + 32;
};

// Convert Fahrenheit to Celsius
export const fahrenheitToCelsius = (fahrenheit) => {
  return (fahrenheit - 32) * 5/9;
};

// Check if value is within range
export const isInRange = (value, min, max) => {
  return value >= min && value <= max;
};

// Get status from value based on thresholds
export const getThresholdStatus = (value, warning, critical) => {
  if (value >= critical) return 'critical';
  if (value >= warning) return 'warning';
  return 'normal';
};

// Format bytes to human readable
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
export const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};

// Capitalize first letter
export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Convert to title case
export const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Download file
export const downloadFile = (data, filename, type = 'text/plain') => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// Validate email
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate phone number
export const isValidPhone = (phone) => {
  const re = /^\+?[\d\s-]{10,}$/;
  return re.test(phone);
};

// Get browser info
export const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  
  return browser;
};

// Get OS info
export const getOSInfo = () => {
  const ua = navigator.userAgent;
  let os = 'Unknown';
  
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS')) os = 'iOS';
  
  return os;
};