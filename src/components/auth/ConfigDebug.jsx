import React, { useState, useEffect } from 'react';
import { authConfig } from '../../config/auth';

const ConfigDebug = () => {
  const [config, setConfig] = useState({});
  const [backendStatus, setBackendStatus] = useState('checking...');

  useEffect(() => {
    // Check configuration
    const configData = {
      googleClientId: authConfig.googleClientId,
      apiBaseUrl: authConfig.apiBaseUrl,
      isConfigured: authConfig.googleClientId !== 'your_google_client_id_here',
      hasValidClientId: authConfig.googleClientId && 
        authConfig.googleClientId.length > 20 && 
        authConfig.googleClientId.includes('.apps.googleusercontent.com'),
      windowLocation: window.location.origin,
      userAgent: navigator.userAgent
    };
    setConfig(configData);

    // Test backend connection
    testBackend();
  }, []);

  const testBackend = async () => {
    try {
      const response = await fetch(`${authConfig.apiBaseUrl}/auth/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setBackendStatus(`✅ Backend responding: ${data.message} | Google configured: ${data.google_configured}`);
    } catch (error) {
      setBackendStatus(`❌ Backend error: ${error.message}`);
    }
  };

  const testGoogleScript = () => {
    if (window.google) {
      alert('✅ Google Identity Services is loaded!');
      console.log('Google object:', window.google);
    } else {
      alert('❌ Google Identity Services is not loaded. Check console for errors.');
    }
  };

  const testGoogleAuth = async () => {
    try {
      if (!window.google) {
        alert('❌ Google Identity Services not loaded');
        return;
      }

      // Test Google initialization
      window.google.accounts.id.initialize({
        client_id: authConfig.googleClientId,
        callback: (response) => {
          console.log('Google callback test:', response);
          alert('✅ Google OAuth callback working!');
        },
        auto_select: false
      });

      alert('✅ Google initialization successful!');
    } catch (error) {
      alert(`❌ Google auth test failed: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">🔧 Configuration Debug</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Configuration:</h4>
          <div className="bg-white dark:bg-gray-700 p-3 rounded text-sm">
            <pre>{JSON.stringify(config, null, 2)}</pre>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Backend Status:</h4>
          <p className="text-sm">{backendStatus}</p>
        </div>

        <div className="mb-4 space-y-2">
          <div>
            <p className="text-sm font-medium mb-1">Current Browser Origin:</p>
            <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs block">
              {window.location.origin}
            </code>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Google Client ID:</p>
            <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs block break-all">
              {authConfig.googleClientId}
            </code>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              ✅ Add this exact origin to Google Cloud Console:<br/>
              <code className="font-mono">{window.location.origin}</code>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={testGoogleScript}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            Test Google Script
          </button>
          
          <button
            onClick={testGoogleAuth}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
          >
            Test Google Auth
          </button>
          
          <button
            onClick={testBackend}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
          >
            Test Backend Again
          </button>
        </div>

        {!config.isConfigured && (
          <div className="bg-red-100 dark:bg-red-900 p-3 rounded">
            <p className="text-red-800 dark:text-red-200 text-sm">
              <strong>❌ Google Client ID not configured!</strong><br/>
              Set VITE_GOOGLE_CLIENT_ID in your .env.local file
            </p>
          </div>
        )}

        {config.isConfigured && !config.hasValidClientId && (
          <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>⚠️ Invalid Google Client ID format!</strong><br/>
              Should end with .apps.googleusercontent.com
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigDebug;
