import React from 'react';
import { useUser } from '../../contexts/UserContext';
import GoogleSignIn from './GoogleSignIn';

const AuthGuard = ({ 
  children, 
  fallback = null,
  showSignIn = true,
  redirectTo = null 
}) => {
  const { isAuthenticated, isLoading } = useUser();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If not authenticated, show fallback or sign-in
  if (!isAuthenticated) {
    if (fallback) {
      return fallback;
    }

    if (showSignIn) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please sign in with your Google account to continue.
            </p>
          </div>
          
          <GoogleSignIn
            onSuccess={() => {
              if (redirectTo) {
                window.location.href = redirectTo;
              }
            }}
            onError={(error) => {
              console.error('Sign-in error:', error);
            }}
            variant="primary"
            size="large"
          />
        </div>
      );
    }

    return null;
  }

  // If authenticated, render children
  return children;
};

export default AuthGuard;
