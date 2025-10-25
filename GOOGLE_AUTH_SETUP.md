# Google Sign-In Setup for Frontend

This document explains how to set up Google Sign-In authentication for the Testing Agents frontend application.

## Prerequisites

1. A Google Cloud Console project
2. Google OAuth 2.0 credentials configured
3. Backend authentication API running

## Setup Instructions

### 1. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Enable the Google+ API and Google OAuth2 API
4. Go to "Credentials" in the left sidebar
5. Click "Create Credentials" → "OAuth 2.0 Client IDs"
6. Set application type to "Web application"
7. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)
8. Copy the Client ID

### 2. Environment Configuration

Create a `.env` file in the `testing-agent-fe` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8080

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

Replace `your_google_client_id_here` with your actual Google Client ID from step 1.

### 3. Backend Configuration

Ensure your backend is configured with the same Google Client ID and has the following endpoints:

- `POST /auth/google-login` - Authenticate with Google ID token
- `GET /auth/me` - Get current user information
- `GET /auth/verify-token` - Verify JWT token
- `POST /auth/logout` - Logout user

### 4. Frontend Components

The following components are available for Google authentication:

#### GoogleSignIn Component
```jsx
import GoogleSignIn from '../components/auth/GoogleSignIn';

<GoogleSignIn
  onSuccess={(user) => console.log('User signed in:', user)}
  onError={(error) => console.error('Sign-in error:', error)}
  variant="primary" // 'default', 'primary', 'outline', 'minimal'
  size="medium"     // 'small', 'medium', 'large'
  showText={true}   // Show/hide text
/>
```

#### UserProfile Component
```jsx
import UserProfile from '../components/auth/UserProfile';

<UserProfile className="custom-class" />
```

### 5. User Context Usage

The `UserContext` provides authentication state and methods:

```jsx
import { useUser } from '../contexts/UserContext';

const { 
  user, 
  isAuthenticated, 
  isLoading, 
  signInWithGoogle, 
  logout 
} = useUser();
```

### 6. API Client Integration

The API client automatically:
- Adds JWT tokens to requests
- Handles 401 errors by clearing auth state
- Dispatches logout events

### 7. Testing the Integration

1. Start the backend server
2. Start the frontend development server: `npm run dev`
3. Navigate to the landing page
4. Click "Continue with Google" or "Sign in with Google"
5. Complete the Google OAuth flow
6. Verify user information is displayed

## Troubleshooting

### Common Issues

1. **"Google Client ID not configured" warning**
   - Ensure `VITE_GOOGLE_CLIENT_ID` is set in your `.env` file
   - Restart the development server after adding environment variables

2. **"Invalid Google token" error**
   - Verify the Google Client ID matches between frontend and backend
   - Check that the authorized JavaScript origins include your domain

3. **CORS errors**
   - Ensure your backend allows requests from your frontend domain
   - Check that the API URL is correct

4. **Token verification fails**
   - Verify the JWT secret key is the same in frontend and backend
   - Check that the token hasn't expired

### Debug Mode

Enable debug logging by opening browser developer tools and checking the console for detailed authentication flow information.

## Security Considerations

1. Never expose your Google Client Secret in frontend code
2. Use HTTPS in production
3. Regularly rotate JWT secrets
4. Implement proper token expiration handling
5. Validate all user inputs on the backend

## Production Deployment

1. Update environment variables for production
2. Configure proper CORS settings
3. Use HTTPS for all communications
4. Set up proper error monitoring
5. Test the complete authentication flow

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify backend API endpoints are working
3. Ensure Google Cloud Console configuration is correct
4. Review the authentication flow in the browser network tab
