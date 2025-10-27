import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { authConfig } from '../../config/auth';

const GoogleSignInDebug = () => {
  const { signInWithGoogle, isLoading } = useUser();
  const [debugInfo, setDebugInfo] = useState({});
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    // Check configuration
    const config = {
      googleClientId: authConfig.googleClientId,
      apiBaseUrl: authConfig.apiBaseUrl,
      isConfigured: authConfig.googleClientId !== 'your_google_client_id_here',
      googleScriptLoaded: !!window.google,
      windowLocation: window.location.origin
    };
    setDebugInfo(config);
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const result = await signInWithGoogle();
      console.log('Sign-in result:', result);
      alert(result.success ? 'Sign-in successful!' : `Sign-in failed: ${result.error}`);
    } catch (error) {
      console.error('Sign-in error:', error);
      alert(`Sign-in error: ${error.message}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  const testGoogleScript = () => {
    if (window.google) {
      alert('Google Identity Services is loaded!');
    } else {
      alert('Google Identity Services is not loaded. Check console for errors.');
    }
  };

  const testBackendConnection = async () => {
    try {
      const response = await fetch(`${authConfig.apiBaseUrl}/auth/verify-token`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      alert(`Backend connection test: ${response.status} ${response.statusText}`);
    } catch (error) {
      alert(`Backend connection failed: ${error.message}`);
    }
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Google Sign-In Debug</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Configuration Status:</h4>
          <div className="bg-white dark:bg-gray-700 p-3 rounded text-sm">
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSignIn}
            disabled={isLoading || isSigningIn}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading || isSigningIn ? 'Signing in...' : 'Test Google Sign-In'}
          </button>
          
          <button
            onClick={testGoogleScript}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Test Google Script
          </button>
          
          <button
            onClick={testBackendConnection}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Test Backend
          </button>
        </div>

        {!debugInfo.isConfigured && (
          <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded">
            <p className="text-yellow-800 dark:text-yellow-200">
              <strong>Warning:</strong> Google Client ID is not configured. 
              Please set VITE_GOOGLE_CLIENT_ID in your environment variables.
            </p>
          </div>
        )}

        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>Check the browser console for detailed error messages.</p>
          <p>Make sure your backend is running on {authConfig.apiBaseUrl}</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleSignInDebug;
