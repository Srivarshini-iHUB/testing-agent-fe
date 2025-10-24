import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import ProfilePage from '../pages/ProfilePage';
import NewProjectPopup from '../pages/NewProjectPopup';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, project } = useUser();

  return (
  <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
    <div className="max-w-8xl mx-auto px-4 sm:px-12 lg:px-12 py-2">
      <div className="flex justify-between items-center h-16">

        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <i className="fas fa-flask text-white text-lg"></i>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Testing Agents
          </span>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm opacity-90">{project.name}</p>
          </div>

          <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-indigo-600 font-bold shadow-md">
            {user.initials}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <i className="fas fa-sun"></i>
            ) : (
              <i className="fas fa-moon"></i>
            )}
          </button>
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
      <main className="max-w-8xl mx-auto">
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
              <Route path="/ProfilePage" element={<ProfilePage />} />
              <Route path="/profile" element={<ProfilePage />} />
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
