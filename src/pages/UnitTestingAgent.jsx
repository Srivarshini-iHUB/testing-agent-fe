import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const UnitTestingAgent = () => {
  const { theme } = useTheme();
  const [selectedFramework, setSelectedFramework] = useState('jest');
  const [testResults, setTestResults] = useState(null);

  const frameworks = [
    { id: 'jest', name: 'Jest', description: 'JavaScript testing framework' },
    { id: 'mocha', name: 'Mocha', description: 'Flexible testing framework' },
    { id: 'vitest', name: 'Vitest', description: 'Fast unit test framework' },
    { id: 'cypress', name: 'Cypress', description: 'End-to-end testing' }
  ];

  const generateTests = () => {
    // Simulate test generation
    setTestResults({
      totalTests: 12,
      passed: 10,
      failed: 2,
      coverage: 85,
      duration: '2.3s'
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          🧪
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Unit Testing Agent
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Automatically generate comprehensive unit tests for your code with intelligent test case creation and coverage analysis.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Test Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Testing Framework
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {frameworks.map((framework) => (
                    <button
                      key={framework.id}
                      onClick={() => setSelectedFramework(framework.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedFramework === framework.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {framework.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {framework.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target File
                </label>
                <input
                  type="text"
                  placeholder="src/components/Button.jsx"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Coverage Target
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="80">80% - Good</option>
                  <option value="90">90% - Excellent</option>
                  <option value="95">95% - Comprehensive</option>
                  <option value="100">100% - Complete</option>
                </select>
              </div>

              <button
                onClick={generateTests}
                className="w-full btn-primary"
              >
                Generate Unit Tests
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Agent Capabilities
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Automatic test case generation</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Mock object creation</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Edge case detection</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Code coverage analysis</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Assertion optimization</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {testResults ? (
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Test Results
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {testResults.passed}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">Passed</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {testResults.failed}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">Failed</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Coverage</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {testResults.coverage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${testResults.coverage}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Duration</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {testResults.duration}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Total Tests</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {testResults.totalTests}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">🧪</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Ready to Generate Tests
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Configure your settings and click "Generate Unit Tests" to get started.
              </p>
            </div>
          )}

          {/* Sample Test Code */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Generated Test Example
            </h3>
            <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100">
{`import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });
});`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitTestingAgent;
