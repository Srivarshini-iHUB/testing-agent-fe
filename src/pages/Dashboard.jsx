import { useTheme } from '../contexts/ThemeContext';

const Dashboard = () => {
  const { theme } = useTheme();

  const agents = [
    {
      id: 'unit-testing',
      title: 'Unit Testing Agent',
      description: 'Automated unit test generation and execution for individual components and functions.',
      icon: '🧪',
      path: '/unit-testing',
      color: 'blue',
      features: ['Test Generation', 'Code Coverage', 'Mock Objects', 'Assertion Testing']
    },
    {
      id: 'test-case-generator',
      title: 'Test Case Generator',
      description: 'Intelligent test case creation based on requirements and user stories.',
      icon: '📝',
      path: '/test-case-generator',
      color: 'green',
      features: ['Requirement Analysis', 'Scenario Generation', 'Edge Case Detection', 'Test Data Creation']
    },
    {
      id: 'e2e-testing',
      title: 'End-to-End Testing Agent',
      description: 'Comprehensive testing of complete user workflows and system integration.',
      icon: '🔄',
      path: '/e2e-testing',
      color: 'purple',
      features: ['User Journey Testing', 'API Testing', 'Database Testing', 'Cross-Browser Testing']
    },
    {
      id: 'visual-testing',
      title: 'Visual Testing Agent',
      description: 'Automated visual regression testing and UI consistency validation.',
      icon: '👁️',
      path: '/visual-testing',
      color: 'orange',
      features: ['Screenshot Comparison', 'Layout Testing', 'Responsive Testing', 'Accessibility Testing']
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
      green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
      purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
      orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400'
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Testing Agents Dashboard
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Comprehensive AI-powered testing solutions for modern software development. 
          Choose from our specialized testing agents to automate and enhance your testing workflow.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-3xl mb-2">🧪</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Unit Tests</h3>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">1,247</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Generated</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">📝</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Test Cases</h3>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">892</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Created</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">🔄</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">E2E Tests</h3>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">156</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Executed</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">👁️</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Visual Tests</h3>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">324</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Validated</p>
        </div>
      </div>

      {/* Testing Agents Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="card hover:shadow-lg transition-all duration-300 hover:scale-105 group"
          >
            <div className="flex items-start mb-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl mr-4 ${getColorClasses(agent.color)}`}>
                {agent.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {agent.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {agent.description}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {agent.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  {feature}
                </span>
              ))}
            </div>
            
            <div className="mt-4 flex items-center text-primary-600 dark:text-primary-400 font-medium">
              <span className="text-sm">Use the tabs above to access this agent</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Recent Activity
        </h2>
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">Unit tests completed for UserService</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">2 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">New test cases generated for Payment module</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">15 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">Visual regression test completed</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">1 hour ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
