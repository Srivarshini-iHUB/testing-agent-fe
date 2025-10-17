import React, { createContext, useContext, useState, useEffect } from 'react';

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
    return savedUser ? JSON.parse(savedUser) : {
      name: 'Ajay Kumar',
      initials: 'AJ',
      username: 'ajaykumar',
      email: 'ajay@example.com',
      avatar: null
    };
  });

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

  // Save to localStorage whenever user changes
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
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

  const logout = () => {
    setUser({
      name: '',
      initials: '',
      username: '',
      email: '',
      avatar: null
    });
    resetProject();
    localStorage.removeItem('user');
  };

  const value = {
    user,
    setUser,
    updateUser,
    project,
    setProject,
    updateProject,
    resetProject,
    logout
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
