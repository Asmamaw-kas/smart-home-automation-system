import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import cameraService from '../services/cameraService';
import toast from 'react-hot-toast';

const CameraCard = ({ camera, onSelect, onDelete }) => {
  const { isDark } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusColor = () => {
    const colors = {
      online: 'bg-green-500',
      offline: 'bg-gray-500',
      error: 'bg-yellow-500',
      recording: 'bg-red-500'
    };
    return colors[camera.status] || 'bg-gray-500';
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    await onDelete(camera.id);
    setIsDeleting(false);
  };

  return (
    <div
      className={`card ${isDark ? 'bg-gray-800' : 'bg-white'} hover:shadow-lg transition-shadow cursor-pointer`}
      onClick={() => onSelect(camera)}
    >
      <div className="relative">
        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
          {camera.thumbnail ? (
            <img src={camera.thumbnail} alt={camera.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <span className="text-6xl">📷</span>
          )}
        </div>
        <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getStatusColor()}`} />
        {camera.is_recording && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs rounded-full animate-pulse">
            ● REC
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {camera.name}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {camera.location || 'Unknown location'}
            </p>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {camera.status || 'unknown'}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(camera);
              }}
              className={`px-2 py-1 text-xs rounded ${
                isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              👁️ View
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : '🗑 Delete'}
            </button>
          </div>

          {camera.motion_detection && (
            <span className="text-xs text-yellow-500">🚨 Motion Enabled</span>
          )}
        </div>
      </div>
    </div>
  );
};

const LiveStream = ({ camera, onClose }) => {
  const imgRef = useRef(null);
  const [showControls, setShowControls] = useState(true);
  const [streamError, setStreamError] = useState(false);
  const [streamLoaded, setStreamLoaded] = useState(false);
  const hideTimeoutRef = useRef(null);
  const streamKeyRef = useRef(0);

  // ← FIX: Build URL directly, no useState, no useEffect delay
  const streamUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/camera/mjpeg/${camera.id}/`;
  const snapshotUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/camera/snapshot/${camera.id}/`;

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (imgRef.current) {
        imgRef.current.src = '';
      }
    };
  }, []);

  const handleTakeSnapshot = async () => {
    try {
      const result = await cameraService.takeSnapshot(camera.id);
      if (result.success && result.data?.image) {
        const snapshotWindow = window.open();
        snapshotWindow.document.write(
          `<img src="data:image/jpeg;base64,${result.data.image}" style="width:100%" />`
        );
        toast.success('Snapshot captured');
      } else {
        window.open(snapshotUrl, '_blank');
        toast.success('Snapshot opened');
      }
    } catch (error) {
      toast.error('Failed to capture snapshot');
      window.open(snapshotUrl, '_blank');
    }
  };

  const handleImageError = () => {
    console.error('MJPEG stream failed:', streamUrl);
    setStreamError(true);
    setStreamLoaded(false);
  };

  const handleImageLoad = () => {
    setStreamLoaded(true);
    setStreamError(false);
  };

  const handleRetry = () => {
    setStreamError(false);
    setStreamLoaded(false);
    streamKeyRef.current += 1;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
      <div className="relative w-full h-full" onMouseMove={handleMouseMove}>

        {streamError ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-xl px-6">
              <span className="text-6xl mb-4 block">📷❌</span>
              <h3 className="text-white text-xl mb-2">Camera Stream Unavailable</h3>
              <p className="text-gray-400 mb-4">Cannot connect to camera stream.</p>
              <div className="text-left bg-black/40 p-4 rounded-lg mb-4 text-sm text-gray-300">
                <p><strong>Camera:</strong> {camera.name}</p>
                <p><strong>Stream URL:</strong> {streamUrl}</p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  🔄 Retry
                </button>
                <button
                  onClick={() => window.open(snapshotUrl, '_blank')}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  📸 Test Snapshot
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">

            {/* Loading spinner while connecting */}
            {!streamLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-3"></div>
                  <p className="text-white text-sm">Connecting to camera...</p>
                </div>
              </div>
            )}

            {/* 
              streamUrl is now always a valid string from the start.
              key prop forces full img remount on retry.
            */}
            <img
              key={streamKeyRef.current}
              ref={imgRef}
              src={streamUrl}
              alt={`${camera.name} stream`}
              className="w-full h-full object-contain"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          </div>
        )}

        {/* Top bar */}
        <div
          className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">{camera.name}</h3>
              <p className="text-gray-300 text-sm">{camera.location}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleTakeSnapshot}
                className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                title="Take Snapshot"
              >
                📸
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Live badge */}
        {streamLoaded && (
          <div className="absolute top-20 right-4 px-3 py-1 rounded-full text-xs font-medium bg-green-600 text-white animate-pulse">
            ● LIVE
          </div>
        )}

        <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-black/50 text-white">
          {camera.resolution} • {camera.fps} FPS
        </div>
      </div>
    </div>
  );
};

const AddCameraForm = ({ onClose, onSuccess }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    camera_id: 0,
    resolution: '640x480',
    fps: 30,
    has_ptz: false,
    motion_detection: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await cameraService.createCamera(formData);

    setLoading(false);

    if (result.success) {
      toast.success('Camera added successfully');
      onSuccess();
      onClose();
    } else {
      toast.error(result.message || 'Failed to add camera');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`max-w-md w-full rounded-xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Add Camera
            </h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Camera Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                placeholder="e.g., Front Door Camera"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                placeholder="e.g., Living Room, Front Door"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Camera ID (0 = default webcam)
              </label>
              <input
                type="number"
                value={formData.camera_id}
                onChange={(e) => setFormData({ ...formData, camera_id: parseInt(e.target.value) || 0 })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                0 = built-in webcam, 1 = external USB camera
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Resolution
              </label>
              <select
                value={formData.resolution}
                onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="640x480">640x480 (SD)</option>
                <option value="1280x720">1280x720 (HD)</option>
                <option value="1920x1080">1920x1080 (Full HD)</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                FPS
              </label>
              <input
                type="number"
                min="15"
                max="60"
                value={formData.fps}
                onChange={(e) => setFormData({ ...formData, fps: parseInt(e.target.value) || 30 })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.has_ptz}
                  onChange={(e) => setFormData({ ...formData, has_ptz: e.target.checked })}
                  className="mr-2"
                />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Has PTZ</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.motion_detection}
                  onChange={(e) => setFormData({ ...formData, motion_detection: e.target.checked })}
                  className="mr-2"
                />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Motion Detection</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Camera'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const SecurityCamera = () => {
  const { isDark } = useTheme();
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCameras = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await cameraService.getAllCameras();
      console.log('Camera API response:', result);

      if (result.success) {
        let cameraList = [];

        if (Array.isArray(result.data)) {
          cameraList = result.data;
        } else if (result.data && typeof result.data === 'object') {
          if (result.data.results && Array.isArray(result.data.results)) {
            cameraList = result.data.results;
          } else if (result.data.cameras && Array.isArray(result.data.cameras)) {
            cameraList = result.data.cameras;
          } else {
            const possibleArray = Object.values(result.data);
            if (possibleArray.length > 0 && possibleArray[0]?.id) {
              cameraList = possibleArray;
            } else {
              console.warn('Unexpected data structure:', result.data);
              cameraList = [];
            }
          }
        }

        console.log('Extracted camera list:', cameraList);
        setCameras(cameraList);

        if (cameraList.length === 0) {
          console.log('No cameras found in database');
        }
      } else {
        setError(result.message || 'Failed to load cameras');
        toast.error(result.message || 'Failed to load cameras');
      }
    } catch (err) {
      console.error('Error loading cameras:', err);
      setError(err.message);
      toast.error('Failed to connect to camera service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCameras();
  }, []);

  const handleDeleteCamera = async (cameraId) => {
    const result = await cameraService.deleteCamera(cameraId);
    if (result.success) {
      toast.success('Camera deleted successfully');
      loadCameras();
    } else {
      toast.error(result.message || 'Failed to delete camera');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        <p className="text-lg text-red-500">Error: {error}</p>
        <button
          onClick={loadCameras}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Security Cameras
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Monitor your home with live video surveillance
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          + Add Camera
        </button>
      </div>

      {cameras.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cameras.map((camera) => (
            <CameraCard
              key={camera.id}
              camera={camera}
              onSelect={setSelectedCamera}
              onDelete={handleDeleteCamera}
            />
          ))}
        </div>
      ) : (
        <div className={`text-center py-12 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg`}>
          <span className="text-6xl mb-4 block">📷</span>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No cameras added yet
          </p>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Click "Add Camera" to set up your first camera
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            + Add Camera
          </button>
        </div>
      )}

      {selectedCamera && (
        <LiveStream
          camera={selectedCamera}
          onClose={() => setSelectedCamera(null)}
        />
      )}

      {showAddForm && (
        <AddCameraForm
          onClose={() => setShowAddForm(false)}
          onSuccess={loadCameras}
        />
      )}
    </div>
  );
};

export default SecurityCamera;