import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import Dashboard from '../pages/Dashboard';
import UnitTestingAgent from '../pages/UnitTestingAgent';
import TestCaseGenerator from '../pages/TestCaseGenerator';
import E2ETestingAgent from '../pages/E2ETestingAgent';
import VisualTestingAgent from '../pages/VisualTestingAgent';
import E2EPytestReportPage from '../pages/E2EPytestReportPage';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, project } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname === '/';

  if (isDashboard) {
    return null;
  }

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <i className="fas fa-robot text-3xl"></i>
            <div>
              <h1 className="text-xl font-bold">Testing Agents Platform</h1>
              <p className="text-sm opacity-90">{project.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-100" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => navigate('/')}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 font-medium"
            >
              <i className="fas fa-home"></i>
              Dashboard
            </button>

            <div className="flex items-center gap-3">
              <div className="text-right hidden lg:block">
                <p className="font-semibold text-sm">{user.name}</p>
                <p className="text-xs opacity-90">@{user.username}</p>
              </div>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 font-bold shadow-md">
                {user.initials}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const AgentTabs = () => {
  const location = useLocation();

  const agents = [
    { 
      path: '/', 
      label: 'Dashboard',
      icon: '📊',
      description: 'Overview and statistics'
    },
    { 
      path: '/unit-testing', 
      label: 'Unit Testing Agent',
      icon: '🧪',
      description: 'Automated unit test generation'
    },
    { 
      path: '/test-case-generator', 
      label: 'Test Case Generator',
      icon: '📝',
      description: 'Intelligent test case creation'
    },
    { 
      path: '/e2e-testing', 
      label: 'E2E Testing Agent',
      icon: '🔄',
      description: 'End-to-end workflow testing'
    },
    { 
      path: '/visual-testing', 
      label: 'Visual Testing Agent',
      icon: '👁️',
      description: 'Visual regression testing'
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2 py-4">
          {agents.map((agent) => (
            <Link
              key={agent.path}
              to={agent.path}
              className={`group flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                location.pathname === agent.path
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-2 border-primary-200 dark:border-primary-700'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/50 border-2 border-gray-200 dark:border-gray-600 hover:border-primary-200 dark:hover:border-primary-700'
              }`}
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                {agent.icon}
              </span>
              <div className="flex flex-col">
                <span className={`font-medium text-sm ${
                  location.pathname === agent.path 
                    ? 'text-primary-700 dark:text-primary-300' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {agent.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {agent.description}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const Layout = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      {/* Show tabs only on non-dashboard pages */}
      {!isDashboard && <AgentTabs />}
      <main className={isDashboard ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {children}
      </main>
    </div>
  );
};

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Report viewer without layout */}
        <Route path="/pytest-report" element={<E2EPytestReportPage />} />
        
        {/* Main app routes with layout */}
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/unit-testing" element={<UnitTestingAgent />} />
              <Route path="/test-case-generator" element={<TestCaseGenerator />} />
              <Route path="/e2e-testing" element={<E2ETestingAgent />} />
              <Route path="/visual-testing" element={<VisualTestingAgent />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
};

export default AppRouter;
