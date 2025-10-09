import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const TestCaseGenerator = () => {
  const { theme } = useTheme();
  const [requirement, setRequirement] = useState('');
  const [generatedCases, setGeneratedCases] = useState(null);
  const [testType, setTestType] = useState('functional');

  const testTypes = [
    { id: 'functional', name: 'Functional', description: 'Core functionality tests' },
    { id: 'integration', name: 'Integration', description: 'Component interaction tests' },
    { id: 'edge-case', name: 'Edge Cases', description: 'Boundary condition tests' },
    { id: 'negative', name: 'Negative', description: 'Error handling tests' }
  ];

  const generateTestCases = () => {
    if (!requirement.trim()) return;
    
    // Simulate test case generation
    setGeneratedCases({
      totalCases: 8,
      categories: [
        { name: 'Happy Path', count: 3 },
        { name: 'Edge Cases', count: 2 },
        { name: 'Error Handling', count: 2 },
        { name: 'Boundary Tests', count: 1 }
      ],
      cases: [
        {
          id: 1,
          title: 'Valid user login with correct credentials',
          priority: 'High',
          steps: ['Enter valid email', 'Enter valid password', 'Click login button'],
          expected: 'User should be logged in successfully'
        },
        {
          id: 2,
          title: 'Login with invalid email format',
          priority: 'Medium',
          steps: ['Enter invalid email format', 'Enter password', 'Click login button'],
          expected: 'Error message should be displayed'
        },
        {
          id: 3,
          title: 'Login with empty password field',
          priority: 'High',
          steps: ['Enter valid email', 'Leave password empty', 'Click login button'],
          expected: 'Password required error should be shown'
        }
      ]
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          📝
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Test Case Generator
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Transform requirements and user stories into comprehensive test cases with intelligent analysis and categorization.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Generate Test Cases
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Requirement/User Story
                </label>
                <textarea
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  placeholder="As a user, I want to be able to log in to my account so that I can access my personal dashboard..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Type Focus
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {testTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setTestType(type.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        testType === type.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {type.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {type.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Complexity Level
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="basic">Basic - Essential test cases</option>
                  <option value="comprehensive">Comprehensive - Detailed coverage</option>
                  <option value="exhaustive">Exhaustive - Complete analysis</option>
                </select>
              </div>

              <button
                onClick={generateTestCases}
                disabled={!requirement.trim()}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Test Cases
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Generator Features
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Natural language processing</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Automatic categorization</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Edge case detection</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Priority assignment</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Test data generation</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {generatedCases ? (
            <>
              {/* Summary */}
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Generated Test Cases
                </h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {generatedCases.totalCases}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Total Cases</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {generatedCases.categories.length}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">Categories</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {generatedCases.categories.map((category, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                      <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full text-sm">
                        {category.count} cases
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Cases List */}
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Test Cases Details
                </h3>
                <div className="space-y-4">
                  {generatedCases.cases.map((testCase) => (
                    <div key={testCase.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {testCase.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          testCase.priority === 'High' 
                            ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {testCase.priority}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Steps:</h5>
                        <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          {testCase.steps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Result:</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{testCase.expected}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Ready to Generate Test Cases
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Enter your requirement or user story to generate comprehensive test cases.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestCaseGenerator;
