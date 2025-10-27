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

  useEffect(() => {
    // Initialize Google Sign-In when component mounts
    if (window.google && window.google.accounts && googleButtonRef.current) {
      window.google.accounts.id.initialize({
        client_id: authConfig.googleClientId,
        callback: async (response) => {
          console.log('Google OAuth callback received', response);
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
