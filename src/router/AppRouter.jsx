import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
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


const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, project } = useUser();

  return (
     <header className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {/* <i className="fas fa-robot text-3xl"></i> */}
              <div>
                <h1 className="text-2xl font-bold">Testing Agents Platform</h1>
              </div>
            </div>
             <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm opacity-90">{project.name}</p>

              </div>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 font-bold shadow-md">
                {user.initials}
              </div>
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
            </div>
          </div>
        </div>
      </header>
  );
};

const Layout = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname === '/';
  const isOnboarding = location.pathname === '/onboarding';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/unit-testing" element={<UnitTestingAgent />} />
              <Route path="/test-case-generator" element={<TestCaseGenerator />} />
              <Route path="/e2e-testing" element={<E2ETestingAgent />} />
              <Route path="/visual-testing" element={<VisualTestingAgent />} />
              <Route path="/performance-testing" element={<PerformanceTesting />} />
              <Route path="/smoke-testing" element={<SmokeTesting />} />
              <Route path="/security-testing" element={<SecurityTest />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
};

export default AppRouter;
