import apiService, { BASE_URL } from './api';

class AuthService {
  constructor() {
    this.TOKEN_KEY = 'access_token';
    this.REFRESH_TOKEN_KEY = 'refresh_token';
    this.USER_KEY = 'user';
  }

  // Helper to extract tokens and user from API response
  _extractAuthData(response) {
    // Handle both response shapes:
    // Shape A: response.data = { user, tokens }
    // Shape B: response.data = { data: { user, tokens } }
    const payload = response.data?.data || response.data;
    
    const user = payload?.user;
    const tokens = payload?.tokens;
    
    if (!tokens?.access) {
      console.error('Auth response missing tokens. Full response:', JSON.stringify(response, null, 2));
      return null;
    }
    
    return { user, tokens };
  }

  // Login user
  async login(username, password) {
    // Clear stale tokens before login
    this.clearTokens();
    
    try {
      const response = await apiService.post('/auth/login/', {
        username,
        password
      });

      if (response.success && response.data) {
        const authData = this._extractAuthData(response);
        
        if (!authData) {
          return {
            success: false,
            message: 'Invalid response from server — no tokens received'
          };
        }
        
        const { tokens, user } = authData;
        
        // Store tokens and user data
        this.setTokens(tokens.access, tokens.refresh);
        this.setUser(user);
        
        return {
          success: true,
          user,
          message: 'Login successful'
        };
      }

      return {
        success: false,
        message: response.message || 'Login failed'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  }

  // Register new user
  async register(userData) {
    // Clear stale tokens before register
    this.clearTokens();
    
    try {
      const response = await apiService.post('/auth/register/', userData);

      if (response.success && response.data) {
        const authData = this._extractAuthData(response);
        
        if (!authData) {
          return {
            success: false,
            message: 'Invalid response from server — no tokens received'
          };
        }
        
        const { tokens, user } = authData;
        
        // Store tokens and user data
        this.setTokens(tokens.access, tokens.refresh);
        this.setUser(user);
        
        return {
          success: true,
          user,
          message: 'Registration successful'
        };
      }

      return {
        success: false,
        message: response.message || 'Registration failed',
        errors: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed'
      };
    }
  }

  // Logout user
  async logout() {
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        await apiService.post('/auth/logout/', {
          refresh: refreshToken
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
      this.clearUser();
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const response = await apiService.get('/auth/profile/');
      
      if (response.success) {
        this.setUser(response.data);
        return { success: true, user: response.data };
      }

      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await apiService.patch('/auth/profile/', profileData);

      if (response.success) {
        const currentUser = this.getUser();
        const updatedUser = { ...currentUser, ...response.data };
        this.setUser(updatedUser);
        return { success: true, user: updatedUser, message: 'Profile updated successfully' };
      }

      return { success: false, message: response.message, errors: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Change password
  async changePassword(oldPassword, newPassword, newPassword2) {
    try {
      const response = await apiService.post('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword2
      });

      return {
        success: response.success,
        message: response.message || 'Password changed successfully'
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Request password reset
  async requestPasswordReset(email) {
    try {
      const response = await apiService.post('/auth/password-reset/', { email });
      return {
        success: response.success,
        message: response.message || 'Password reset email sent'
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Confirm password reset
  async confirmPasswordReset(token, newPassword, newPassword2) {
    try {
      const response = await apiService.post('/auth/password-reset/confirm/', {
        token,
        new_password: newPassword,
        new_password2: newPassword2
      });
      return {
        success: response.success,
        message: response.message || 'Password reset successful'
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Verify email
  async verifyEmail() {
    try {
      const response = await apiService.post('/auth/verify-email/');
      return {
        success: response.success,
        message: response.message || 'Email verified successfully'
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Toggle 2FA
  async toggle2FA() {
    try {
      const response = await apiService.post('/auth/toggle-2fa/');
      return {
        success: response.success,
        message: response.message,
        is2FAEnabled: response.data?.is_2fa_enabled
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Get login history
  async getLoginHistory(limit = 20) {
    try {
      const response = await apiService.get('/auth/login-history/', { limit });
      return { success: response.success, data: response.data || [] };
    } catch (error) {
      return { success: false, data: [], message: error.message };
    }
  }

  // Get notification preferences
  async getNotificationPreferences() {
    try {
      const response = await apiService.get('/auth/notifications/');
      return { success: response.success, data: response.data };
    } catch (error) {
      return { success: false, data: null, message: error.message };
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(preferences) {
    try {
      const response = await apiService.patch('/auth/notifications/', preferences);
      return {
        success: response.success,
        data: response.data,
        message: 'Preferences updated successfully'
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Get security questions
  async getSecurityQuestions() {
    try {
      const response = await apiService.get('/auth/security-questions/');
      return { success: response.success, data: response.data || [] };
    } catch (error) {
      return { success: false, data: [], message: error.message };
    }
  }

  // Add security question
  async addSecurityQuestion(question, answer) {
    try {
      const response = await apiService.post('/auth/security-questions/', { question, answer });
      return {
        success: response.success,
        data: response.data,
        message: 'Security question added'
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Delete security question
  async deleteSecurityQuestion(questionId) {
    try {
      const response = await apiService.delete(`/auth/security-questions/${questionId}/`);
      return { success: response.success, message: 'Security question deleted' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Delete account
  async deleteAccount() {
    try {
      const response = await apiService.delete('/auth/delete-account/');
      if (response.success) {
        this.clearTokens();
        this.clearUser();
      }
      return {
        success: response.success,
        message: response.message || 'Account deleted successfully'
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Check authentication status
  async checkAuth() {
    try {
      const response = await apiService.get('/auth/check/');
      return { isAuthenticated: response.success, user: response.data?.user };
    } catch {
      return { isAuthenticated: false, user: null };
    }
  }

  // Token management
  setTokens(accessToken, refreshToken) {
    if (accessToken) {
      localStorage.setItem(this.TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  getAccessToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  clearTokens() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  setUser(user) {
    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  getUser() {
    const userStr = localStorage.getItem(this.USER_KEY);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  clearUser() {
    localStorage.removeItem(this.USER_KEY);
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }

  getAuthHeaders() {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

const authService = new AuthService();
export default authService;