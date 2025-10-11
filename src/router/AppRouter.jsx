import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Dashboard from '../pages/Dashboard';
import UnitTestingAgent from '../pages/UnitTestingAgent';
import TestCaseGenerator from '../pages/TestCaseGenerator';
import E2ETestingAgent from '../pages/E2ETestingAgent';
import VisualTestingAgent from '../pages/VisualTestingAgent';
import PytestReportPage from '../pages/PytestReportPage';
import ReportViewer from '../pages/ReportViewer';

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            Testing Agents
          </Link>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
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
    { 
      path: '/report-viewer', 
      label: 'Report Viewer',
      icon: '📄',
      description: 'View pytest test reports'
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
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <AgentTabs />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <Route path="/pytest-report" element={<PytestReportPage />} />
        
        {/* Main app routes with layout */}
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/unit-testing" element={<UnitTestingAgent />} />
              <Route path="/test-case-generator" element={<TestCaseGenerator />} />
              <Route path="/e2e-testing" element={<E2ETestingAgent />} />
              <Route path="/visual-testing" element={<VisualTestingAgent />} />
              <Route path="/report-viewer" element={<ReportViewer />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
};

export default AppRouter;


