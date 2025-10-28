import React, { createContext, useContext, useState, useEffect } from 'react';
import googleAuthService from '../services/googleAuthService';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return googleAuthService.isAuthenticated();
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const [project, setProject] = useState(() => {
    const savedProject = localStorage.getItem('project');
    return savedProject ? JSON.parse(savedProject) : {
      name: 'MyWebApp v2.1',
      repository: 'github.com/BMajaykumar/MyWebApp',
      frdDocument: 'Functional_Requirements_v2.pdf',
      userStories: 'User_Stories_Q3.docx',
      postmanCollection: 'MyWebApp_API.json',
      figmaUrl: '',
      figmaToken: '',
      createdAt: new Date().toISOString()
    };
  });

  // Initialize authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (isAuthenticated && !user) {
        try {
          const currentUser = await googleAuthService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Failed to get current user:', error);
          setIsAuthenticated(false);
        }
      }
    };
    
    initializeAuth();
  }, [isAuthenticated, user]);

  // Listen for auth logout events from API client
  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  // Save to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  // Save to localStorage whenever project changes
  useEffect(() => {
    localStorage.setItem('project', JSON.stringify(project));
  }, [project]);

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const updateProject = (updates) => {
    setProject(prev => ({ ...prev, ...updates }));
  };

  const resetProject = () => {
    setProject({
      name: '',
      repository: '',
      frdDocument: '',
      userStories: '',
      postmanCollection: '',
      figmaUrl: '',
      figmaToken: '',
      createdAt: new Date().toISOString()
    });
    localStorage.removeItem('project');
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await googleAuthService.signIn();
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true, user: result.user };
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await googleAuthService.signOut();
      setUser(null);
      setIsAuthenticated(false);
      resetProject();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if Google logout fails
      setUser(null);
      setIsAuthenticated(false);
      resetProject();
    }
  };

  const value = {
    user,
    setUser,
    updateUser,
    project,
    setProject,
    updateProject,
    resetProject,
    logout,
    signInWithGoogle,
    isAuthenticated,
    isLoading
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
