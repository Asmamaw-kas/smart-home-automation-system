import { useState, useCallback, useEffect } from 'react';
import sensorService from '../services/sensorService';
import { useWebSocket } from './useWebSocket';

export const useSensor = (sensorId = null, sensorType = null) => {
  const [sensor, setSensor] = useState(null);
  const [readings, setReadings] = useState([]);
  const [currentReading, setCurrentReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { subscribe, isConnected } = useWebSocket('sensors');

  // Subscribe to real-time updates
  useEffect(() => {
    if (!subscribe) return;

    const unsubscribe = subscribe('update', (message) => {
      // Consumer sends { type: 'update', data: { temperature, humidity, ... } }
      const reading = message?.data || message;
      if (!reading) return;

      if (!sensorId || reading.sensor_id === sensorId) {
        setCurrentReading(reading);
        setReadings(prev => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return [reading, ...prevArray].slice(0, 100);
        });
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [sensorId, subscribe]);

  const loadSensor = useCallback(async () => {
    if (!sensorId) return;

    setLoading(true);
    try {
      const result = await sensorService.getSensorById(sensorId);
      if (result.success) {
        setSensor(result.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sensorId]);

  const loadReadings = useCallback(async (hours = 24) => {
    if (!sensorId && !sensorType) return;

    setLoading(true);
    try {
      let result;
      if (sensorId) {
        result = await sensorService.getSensorReadings(sensorId, hours);
      } else {
        result = await sensorService.getAllSensorData({ type: sensorType, hours });
      }

      if (result.success) {
        const data = Array.isArray(result.data) ? result.data : [];
        setReadings(data);
        if (data.length > 0) {
          setCurrentReading(data[0]);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sensorId, sensorType]);

  const getLatestReading = useCallback(() => {
    if (readings.length > 0) return readings[0];
    return currentReading;
  }, [readings, currentReading]);

  const getAverageReading = useCallback((field, count = 10) => {
    const recent = readings.slice(0, count);
    if (recent.length === 0) return null;
    const sum = recent.reduce((acc, r) => acc + (r[field] || 0), 0);
    return sum / recent.length;
  }, [readings]);

  const getMinReading = useCallback((field, count = 10) => {
    const recent = readings.slice(0, count);
    if (recent.length === 0) return null;
    return Math.min(...recent.map(r => r[field] || Infinity));
  }, [readings]);

  const getMaxReading = useCallback((field, count = 10) => {
    const recent = readings.slice(0, count);
    if (recent.length === 0) return null;
    return Math.max(...recent.map(r => r[field] || -Infinity));
  }, [readings]);

  const isAboveThreshold = useCallback((field, threshold) => {
    const latest = getLatestReading();
    return latest ? (latest[field] || 0) > threshold : false;
  }, [getLatestReading]);

  const isBelowThreshold = useCallback((field, threshold) => {
    const latest = getLatestReading();
    return latest ? (latest[field] || 0) < threshold : false;
  }, [getLatestReading]);

  const formatReading = useCallback((value, field) => {
    if (value === null || value === undefined) return '--';
    const units = { temperature: '°C', humidity: '%', light_level: '', distance: 'cm' };
    const unit = units[field] || '';
    if (field === 'temperature') return `${value.toFixed(1)}${unit}`;
    return `${Math.round(value)}${unit}`;
  }, []);

  const getReadingStatus = useCallback((field) => {
    const value = getLatestReading()?.[field];
    if (value === null || value === undefined) return 'normal';
    const thresholds = {
      temperature: { warning: 30, critical: 35 },
      humidity: { warning: 70, critical: 80 },
      light_level: { warning: 800, critical: 900 }
    };
    const threshold = thresholds[field];
    if (!threshold) return 'normal';
    if (value > threshold.critical) return 'critical';
    if (value > threshold.warning) return 'warning';
    return 'normal';
  }, [getLatestReading]);

  const getStatusColor = useCallback((status) => {
    const colors = { normal: 'green', warning: 'yellow', critical: 'red' };
    return colors[status] || 'gray';
  }, []);

  return {
    sensor, readings, currentReading, loading, error, isConnected,
    loadSensor, loadReadings, getLatestReading, getAverageReading,
    getMinReading, getMaxReading, isAboveThreshold, isBelowThreshold,
    formatReading, getReadingStatus, getStatusColor
  };
};