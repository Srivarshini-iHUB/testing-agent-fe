import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import LandingPage from '../pages/LandingPage';
import Dashboard from '../pages/Dashboard';
import Onboarding from '../pages/Onboarding';
import SmokeTesting from '../pages/SmokeTesting';
import UnitTestingAgent from '../pages/UnitTestingAgent';
import TestCaseGenerator from '../pages/TestCaseGenerator';
import E2ETestingAgent from '../pages/E2ETestingAgent';
import VisualTestingAgent from '../pages/VisualTestingAgent';
import E2EPytestReportPage from '../pages/E2EPytestReportPage';
import PerformanceTesting from '../pages/PerformanceTesting';
import SecurityTest from '../pages/SecurityTest';
import NewProjectPopup from '../pages/NewProjectPopup';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, project, logout } = useUser();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12 py-3">
        <div className="flex justify-between items-center">

          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-robot text-white text-lg"></i>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 dark:text-white block leading-tight">
                Testing Agents
              </span>
              {project?.name && (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {project.name}
                </span>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <i className="fas fa-sun text-lg"></i>
              ) : (
                <i className="fas fa-moon text-lg"></i>
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
              >
                {/* User Avatar */}
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {user.initials || user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                
                {/* User Info - Hidden on mobile */}
                <div className="text-left hidden md:block">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>

                {/* Dropdown Icon */}
                <i className={`fas fa-chevron-down text-xs text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}></i>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute top-full mt-2 right-0 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fadeIn">
                  {/* User Info Header */}
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {user.initials || user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/dashboard');
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all flex items-center gap-3"
                    >
                      <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <i className="fas fa-th-large text-indigo-600 dark:text-indigo-400"></i>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">Dashboard</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">View your projects</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/profile');
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all flex items-center gap-3"
                    >
                      <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <i className="fas fa-user-circle text-blue-600 dark:text-blue-400"></i>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">My Profile</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">View and edit profile</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/settings');
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all flex items-center gap-3"
                    >
                      <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <i className="fas fa-cog text-gray-600 dark:text-gray-400"></i>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">Settings</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Account preferences</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/help');
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all flex items-center gap-3"
                    >
                      <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <i className="fas fa-question-circle text-purple-600 dark:text-purple-400"></i>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">Help & Support</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Documentation & FAQs</p>
                      </div>
                    </button>
                  </div>

                  {/* Logout Button */}
                  <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center gap-3 rounded-lg group"
                    >
                      <div className="w-9 h-9 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                        <i className="fas fa-sign-out-alt text-red-600 dark:text-red-400"></i>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-red-600 dark:text-red-400">Logout</p>
                        <p className="text-xs text-red-600/75 dark:text-red-400/75">Sign out of your account</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Layout = ({ children }) => {
  const location = useLocation();
  const isOnboarding = location.pathname === '/onboarding';
  const isNewProject = location.pathname === '/NewProjectPopup';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {!isOnboarding && !isNewProject && <Header />}
      <main>
        {children}
      </main>
    </div>
  );
};

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Landing Page - No layout */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Onboarding - No header */}
        <Route path="/onboarding" element={<Onboarding />} />
        
        {/* Report viewer - No layout */}
        <Route path="/pytest-report" element={<E2EPytestReportPage />} />
        
        {/* Main app routes with layout */}
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/dashboard/:projectId" element={<Dashboard />} />
              <Route path="/NewProjectPopup" element={<NewProjectPopup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/unit-testing" element={<UnitTestingAgent />} />
              <Route path="/test-case-generator" element={<TestCaseGenerator />} />
              <Route path="/e2e-testing" element={<E2ETestingAgent />} />
              <Route path="/visual-testing" element={<VisualTestingAgent />} />
              <Route path="/performance-testing" element={<PerformanceTesting />} />
              <Route path="/smoke-testing" element={<SmokeTesting />} />
              <Route path="/security-testing" element={<SecurityTest />} />
              
              {/* Catch-all redirect to landing page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
};

export default AppRouter;
