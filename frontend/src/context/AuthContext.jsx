import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

// Create context
const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      const storedUser = authService.getUser();
      if (storedUser && authService.isAuthenticated()) {
        setUser(storedUser);
        // Verify token with backend
        const result = await authService.checkAuth();
        if (result.isAuthenticated) {
          setUser(result.user);
        } else {
          logout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.login(username, password);
      
      if (result.success) {
        setUser(result.user);
        toast.success('Login successful!');
        return { success: true };
      } else {
        setError(result.message);
        toast.error(result.message || 'Login failed');
        return { success: false, error: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Login failed';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        setUser(result.user);
        toast.success('Registration successful!');
        return { success: true };
      } else {
        setError(result.message);
        toast.error(result.message || 'Registration failed');
        return { success: false, error: result.message, errors: result.errors };
      }
    } catch (error) {
      const errorMsg = error.message || 'Registration failed';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    setLoading(true);
    
    try {
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.updateProfile(profileData);
      
      if (result.success) {
        setUser(result.user);
        toast.success('Profile updated successfully');
        return { success: true };
      } else {
        setError(result.message);
        toast.error(result.message || 'Profile update failed');
        return { success: false, error: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Profile update failed';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (oldPassword, newPassword, newPassword2) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.changePassword(oldPassword, newPassword, newPassword2);
      
      if (result.success) {
        toast.success('Password changed successfully');
        return { success: true };
      } else {
        setError(result.message);
        toast.error(result.message || 'Password change failed');
        return { success: false, error: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Password change failed';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};