import apiClient from '../api/client';
import { authConfig, validateAuthConfig } from '../config/auth';

class GoogleAuthService {
  constructor() {
    this.isGoogleLoaded = false;
    this.googleClientId = authConfig.googleClientId;
    this.initializeGoogleAuth();
    
    // Validate configuration
    validateAuthConfig();
  }

  async initializeGoogleAuth() {
    if (this.isGoogleLoaded) return;

    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google && window.google.accounts) {
        this.isGoogleLoaded = true;
        resolve();
        return;
      }

      // Load Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.isGoogleLoaded = true;
        console.log('Google Identity Services loaded successfully');
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services'));
      };
      document.head.appendChild(script);
    });
  }

  async signIn() {
    try {
      // Check if Google Client ID is configured
      if (!this.googleClientId || this.googleClientId === 'your_google_client_id_here') {
        throw new Error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.');
      }

      await this.initializeGoogleAuth();
      
      return new Promise((resolve, reject) => {
        if (!window.google) {
          reject(new Error('Google Identity Services not loaded'));
          return;
        }

        console.log('Initializing Google Sign-In with Client ID:', this.googleClientId);

        // Initialize Google Identity Services
        window.google.accounts.id.initialize({
          client_id: this.googleClientId,
          callback: async (response) => {
            console.log('Google OAuth callback received', response);
            try {
              const result = await this.handleGoogleResponse(response);
              resolve(result);
            } catch (error) {
              console.error('Error handling Google response:', error);
              reject(error);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Use the One Tap flow
        window.google.accounts.id.prompt((notification) => {
          console.log('Google prompt notification:', notification);
          
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('One Tap not available, user needs to click the button manually');
            // Don't reject here - let the button component handle the interaction
            // The promise will resolve when the user clicks the button
          }
        });
      });
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  }

  async handleGoogleResponse(response) {
    try {
      // Send the Google ID token to our backend
      const authResponse = await apiClient.post('/auth/google-login', {
        token: response.credential
      });

      const { access_token, user } = authResponse.data;
      
      // Store the JWT token
      localStorage.setItem(authConfig.tokenKey, access_token);
      
      // Store user data
      localStorage.setItem(authConfig.userKey, JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        google_id: user.google_id,
        is_active: user.is_active,
        created_at: user.created_at,
        last_login: user.last_login
      }));

      return {
        success: true,
        user: user,
        token: access_token
      };
    } catch (error) {
      console.error('Authentication Error:', error);
      throw new Error(error.response?.data?.detail || 'Authentication failed');
    }
  }

  async signOut() {
    try {
      // Clear local storage
      localStorage.removeItem(authConfig.tokenKey);
      localStorage.removeItem(authConfig.userKey);
      
      // Sign out from Google
      if (window.google && window.google.accounts) {
        window.google.accounts.id.disableAutoSelect();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const token = localStorage.getItem(authConfig.tokenKey);
      if (!token) {
        return null;
      }

      const response = await apiClient.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      // If token is invalid, clear it
      if (error.response?.status === 401) {
        this.signOut();
      }
      return null;
    }
  }

  async verifyToken() {
    try {
      const token = localStorage.getItem(authConfig.tokenKey);
      if (!token) {
        return { valid: false };
      }

      const response = await apiClient.get('/auth/verify-token', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Token verification error:', error);
      return { valid: false };
    }
  }

  isAuthenticated() {
    return !!localStorage.getItem(authConfig.tokenKey);
  }

  getStoredUser() {
    const userData = localStorage.getItem(authConfig.userKey);
    return userData ? JSON.parse(userData) : null;
  }
}

// Create singleton instance
const googleAuthService = new GoogleAuthService();
export default googleAuthService;
