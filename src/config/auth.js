// Authentication configuration
export const authConfig = {
  // Google OAuth Client ID
  // Get this from Google Cloud Console: https://console.cloud.google.com/
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id_here',
  
  // API Base URL
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  
  // Token storage key
  tokenKey: 'auth_token',
  
  // User storage key
  userKey: 'user'
};

// Validate required configuration
export const validateAuthConfig = () => {
  if (!authConfig.googleClientId || authConfig.googleClientId === 'your_google_client_id_here') {
    console.warn('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.');
    return false;
  }
  return true;
};
