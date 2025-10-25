# Google Sign-In Troubleshooting Guide

## Quick Setup Steps

### 1. Set up Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google OAuth2 API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)
7. Copy the Client ID

### 2. Configure Environment Variables
Create a `.env.local` file in the `testing-agent-fe` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8080

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id_here
```

### 3. Start the Backend
Make sure your backend is running:
```bash
cd testing-agents
python -m app.main
```

### 4. Start the Frontend
```bash
cd testing-agent-fe
npm run dev
```

## Debugging Steps

### 1. Check the Debug Panel
The landing page now includes a debug panel that shows:
- Configuration status
- Google Client ID
- API URL
- Google script loading status

### 2. Check Browser Console
Open browser developer tools (F12) and look for:
- Configuration warnings
- Google OAuth errors
- Network request failures

### 3. Common Issues and Solutions

#### Issue: "Google Client ID not configured"
**Solution:** Set the `VITE_GOOGLE_CLIENT_ID` environment variable in `.env.local`

#### Issue: "Google Identity Services not loaded"
**Solution:** Check if the Google script is blocked by ad blockers or network issues

#### Issue: "Backend connection failed"
**Solution:** Make sure the backend is running on the correct port (8080)

#### Issue: "Google Sign-In was cancelled"
**Solution:** This is normal if user cancels the OAuth flow

#### Issue: "Failed to render Google Sign-In button"
**Solution:** Check if Google Client ID is valid and properly configured

### 4. Test Individual Components

Use the debug panel buttons to test:
- **Test Google Script**: Verifies Google Identity Services is loaded
- **Test Backend**: Checks if backend is accessible
- **Test Google Sign-In**: Attempts the full sign-in flow

## Expected Behavior

1. Click "Test Google Sign-In" button
2. A Google OAuth popup should appear
3. Sign in with your Google account
4. Popup should close and you should be signed in
5. User profile should appear in the top navigation

## Production Checklist

Before deploying to production:
- [ ] Set up production Google OAuth credentials
- [ ] Update authorized JavaScript origins
- [ ] Set production API URL
- [ ] Remove debug panel from landing page
- [ ] Test the complete flow

## Support

If you're still having issues:
1. Check the browser console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure backend is running and accessible
4. Test with a different Google account
5. Try in an incognito/private browser window
