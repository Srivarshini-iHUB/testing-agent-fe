import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { authConfig } from '../../config/auth';

const GoogleSignIn = ({ 
  onSuccess, 
  onError, 
  className = '', 
  variant = 'default',
  size = 'medium',
  showText = true 
}) => {
  const { isLoading } = useUser();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const googleButtonRef = useRef(null);
  const initializedRef = useRef(false);
  const consentRequestedRef = useRef(false);

  const requestDriveSheetsConsent = (loginHint) => {
    return new Promise((resolve, reject) => {
      try {
        if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
          reject(new Error('Google OAuth2 not available'));
          return;
        }
        const client = window.google.accounts.oauth2.initCodeClient({
          client_id: authConfig.googleClientId,
          scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets',
          ux_mode: 'popup',
          prompt: 'consent',
          // Use hint to avoid showing the account chooser again
          hint: loginHint || undefined,
          include_granted_scopes: true,
          callback: async (resp) => {
            if (resp.error) {
              if (authConfig.debug) console.warn('[Login] Consent error', resp.error);
              reject(resp.error);
              return;
            }
            try {
              const token = localStorage.getItem('auth_token');
              const res = await fetch(`${authConfig.apiBaseUrl}/auth/google-oauth-callback`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                  code: resp.code,
                  redirect_uri: 'postmessage'
                })
              });
              if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || 'OAuth exchange failed');
              }
              if (authConfig.debug) console.debug('[Login] Consent stored');
              resolve();
            } catch (e) {
              if (authConfig.debug) console.error('[Login] Consent store failed', e);
              reject(e);
            }
          }
        });
        if (authConfig.debug) console.debug('[Login] Requesting Drive/Sheets consent');
        client.requestCode();
      } catch (e) {
        if (authConfig.debug) console.error('[Login] Consent init failed', e);
        reject(e);
      }
    });
  };

  useEffect(() => {
    // Initialize Google Sign-In when component mounts
    if (initializedRef.current) return;
    if (window.google && window.google.accounts && googleButtonRef.current) {
      initializedRef.current = true;
      window.google.accounts.id.initialize({
        client_id: authConfig.googleClientId,
        callback: async (response) => {
          if (authConfig.debug) console.debug('[Login] One Tap received');
          setIsSigningIn(true);
          try {
            // Send the Google ID token to backend
            const response2 = await fetch(`${authConfig.apiBaseUrl}/auth/google-login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token: response.credential })
            });

            if (!response2.ok) {
              throw new Error('Authentication failed');
            }

            const data = await response2.json();
            
            // Store tokens
            localStorage.setItem('auth_token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Immediately request Drive/Sheets consent during login
            try {
              await requestDriveSheetsConsent(data?.user?.email);
            } catch (e) {
              if (authConfig.debug) console.warn('[Login] User skipped/failed consent', e);
            }
            // Prevent future auto prompts
            try { window.google.accounts.id.disableAutoSelect(); } catch (_) {}
            
            onSuccess?.(data.user);
          } catch (error) {
            console.error('Authentication error:', error);
            onError?.(error.message);
          } finally {
            setIsSigningIn(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Render the Google button
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: variant === 'primary' ? 'filled_blue' : 'outline',
        size: size === 'large' ? 'large' : size === 'small' ? 'small' : 'medium',
        type: 'standard',
        text: 'continue_with',
        width: 250
      });
    }
  }, [variant, size]);


  return (
    <div className={className}>
      <div ref={googleButtonRef}></div>
      {isSigningIn && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
          Signing in...
        </div>
      )}
    </div>
  );
};

export default GoogleSignIn;
