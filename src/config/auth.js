// Authentication configuration
export const authConfig = {
  // Google OAuth Client ID
  // Get this from Google Cloud Console: https://console.cloud.google.com/
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '1009020036903-vtonch0rn6v9ciosaf4enr5kbhta5rnp.apps.googleusercontent.com',
  
  // API Base URL
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  
  // Token storage key
  tokenKey: 'auth_token',
  
  // User storage key
  userKey: 'user',

  // Enable verbose console logging for auth flows
  debug: (import.meta.env.VITE_AUTH_DEBUG || 'false') === 'true'
};

// Validate required configuration
export const validateAuthConfig = () => {
  if (!authConfig.googleClientId || authConfig.googleClientId === '1009020036903-vtonch0rn6v9ciosaf4enr5kbhta5rnp.apps.googleusercontent.com') {
    console.warn('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.');
    return false;
  }
  return true;
};
