import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useDevices } from '../context/DeviceContext';
import toast from 'react-hot-toast';

// Navbar Component
const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { isConnected } = useDevices();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-30 ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border-b transition-colors duration-200`}>
      <div className="px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            {/* Sidebar toggle button */}
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-lg ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              } focus:outline-none transition-colors duration-200`}
            >
              {isSidebarOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl">🏠</span>
              <span className={`text-xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                SmartHome
              </span>
            </Link>
          </div>

          {/* Center section - Connection status */}
          <div className="hidden md:flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              } focus:outline-none transition-colors duration-200`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Notifications */}
            <button
              className={`p-2 rounded-lg ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              } focus:outline-none transition-colors duration-200 relative`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 focus:outline-none"
              >
                <div className={`w-8 h-8 rounded-full ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                } flex items-center justify-center`}>
                  <span className="text-sm font-medium">
                    {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className={`hidden md:block text-sm font-medium ${
                  isDark ? 'text-white' : 'text-gray-700'
                }`}>
                  {user?.first_name || user?.username}
                </span>
                <svg className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {showProfileMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 ${
                  isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                } z-50`}>
                  <Link
                    to="/profile"
                    className={`block px-4 py-2 text-sm ${
                      isDark 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    } transition-colors duration-200`}
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/settings"
                    className={`block px-4 py-2 text-sm ${
                      isDark 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    } transition-colors duration-200`}
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Settings
                  </Link>
                  <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} my-1`}></div>
                  <button
                    onClick={handleLogout}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      isDark 
                        ? 'text-red-400 hover:bg-gray-700' 
                        : 'text-red-600 hover:bg-gray-100'
                    } transition-colors duration-200`}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Sidebar Component
const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { isDark } = useTheme();
  const { devices: rawDevices } = useDevices();
  const devices = Array.isArray(rawDevices) ? rawDevices : [];

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: '📊' },
    { path: '/devices', name: 'Devices', icon: '📱', badge: devices.length },
    { path: '/automation', name: 'Automation', icon: '⚡' },
    { path: '/security', name: 'Security', icon: '🔒' },
    { path: '/logs', name: 'Logs', icon: '📝' },
    { path: '/settings', name: 'Settings', icon: '⚙️' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-16 left-0 bottom-0 z-40 w-64 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-r overflow-y-auto`}>
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? isDark
                          ? 'bg-gray-700 text-white'
                          : 'bg-primary-50 text-primary-700'
                        : isDark
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {item.badge > 0 && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        isDark
                          ? 'bg-gray-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Quick stats */}
          <div className={`mt-8 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Quick Stats
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Online</span>
                <span className={isDark ? 'text-green-400' : 'text-green-600'}>
                  {devices.filter(d => d.status === 'online').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Offline</span>
                <span className={isDark ? 'text-red-400' : 'text-red-600'}>
                  {devices.filter(d => d.status === 'offline').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Active</span>
                <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>
                  {devices.filter(d => d.current_state === 'on' || d.current_state === 'open' || d.current_state === 'unlocked').length}
                </span>
              </div>
            </div>
          </div>

          {/* System info */}
          <div className={`mt-4 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} text-center`}>
            <p>SmartHome v1.0.0</p>
            <p className="mt-1">© 2026 All rights reserved</p>
          </div>
        </nav>
      </aside>
    </>
  );
};

// Footer Component
const Footer = () => {
  const { isDark } = useTheme();
  
  return (
    <footer className={`mt-auto py-4 px-6 text-center text-sm ${
      isDark ? 'text-gray-500 border-gray-800' : 'text-gray-400 border-gray-200'
    } border-t`}>
      <p>Smart Home Automation System • All rights reserved</p>
    </footer>
  );
};

// Main Layout Component
const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isDark } = useTheme();
  const location = useLocation();

  // Close sidebar on route change (mobile)
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  // Check if current route is auth page
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className={`min-h-screen flex flex-col ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    } transition-colors duration-200`}>
      <Navbar 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      
      <div className="flex flex-1 pt-16">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <main className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-64' : 'ml-0'
        }`}>
          <div className="p-6">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Layout;