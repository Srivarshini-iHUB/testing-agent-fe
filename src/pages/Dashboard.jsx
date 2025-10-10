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
         
          </div>
        ))}
      </div>

     
    </div>
  );
};

export default Dashboard;
