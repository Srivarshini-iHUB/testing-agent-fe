import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const VisualTestingAgent = () => {
  const { theme } = useTheme();
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const [testType, setTestType] = useState('regression');
  const [testResults, setTestResults] = useState(null);

  const devices = [
    { id: 'desktop', name: 'Desktop', icon: '🖥️', resolution: '1920x1080' },
    { id: 'tablet', name: 'Tablet', icon: '📱', resolution: '768x1024' },
    { id: 'mobile', name: 'Mobile', icon: '📱', resolution: '375x667' },
    { id: 'large-desktop', name: 'Large Desktop', icon: '🖥️', resolution: '2560x1440' }
  ];

  const testTypes = [
    { id: 'regression', name: 'Visual Regression', description: 'Compare with baseline images' },
    { id: 'layout', name: 'Layout Testing', description: 'Check element positioning' },
    { id: 'responsive', name: 'Responsive Design', description: 'Test across screen sizes' },
    { id: 'accessibility', name: 'Accessibility', description: 'Color contrast and readability' }
  ];

  const runVisualTest = () => {
    // Simulate visual test execution
    setTestResults({
      status: 'running',
      progress: 0,
      currentStep: 'Capturing baseline images...',
      duration: '0s'
    });

    // Simulate progress
    const interval = setInterval(() => {
      setTestResults(prev => {
        const newProgress = prev.progress + 20;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          return {
            ...prev,
            status: 'completed',
            progress: 100,
            currentStep: 'Visual test completed',
            duration: '32s',
            results: {
              totalComparisons: 12,
              passed: 10,
              failed: 2,
              differences: [
                {
                  page: 'Homepage',
                  element: 'Navigation Menu',
                  difference: '2.3%',
                  severity: 'Minor'
                },
                {
                  page: 'Product Page',
                  element: 'Add to Cart Button',
                  difference: '8.7%',
                  severity: 'Major'
                }
              ]
            }
          };
        }

        const steps = [
          'Capturing baseline images...',
          'Loading test pages...',
          'Taking screenshots...',
          'Comparing images...',
          'Analyzing differences...'
        ];

        const stepIndex = Math.floor(newProgress / 20);

        return {
          ...prev,
          progress: newProgress,
          currentStep: steps[stepIndex] || prev.currentStep,
          duration: `${Math.floor(newProgress * 0.32)}s`
        };
      });
    }, 400);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          👁️
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Visual Testing Agent
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Automated visual regression testing and UI consistency validation with pixel-perfect comparisons and accessibility checks.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Visual Test Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Devices
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {devices.map((device) => (
                    <button
                      key={device.id}
                      onClick={() => setSelectedDevice(device.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedDevice === device.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="text-2xl mb-1">{device.icon}</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {device.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        {device.resolution}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Type
                </label>
                <div className="space-y-2">
                  {testTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setTestType(type.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
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
                  Sensitivity Level
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="low">Low - Major changes only</option>
                  <option value="medium">Medium - Moderate changes</option>
                  <option value="high">High - Minor changes</option>
                  <option value="strict">Strict - Pixel-perfect</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pages to Test
                </label>
                <div className="space-y-2">
                  {['Homepage', 'Product Page', 'Checkout', 'User Dashboard'].map((page) => (
                    <label key={page} className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="mr-3 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{page}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={runVisualTest}
                className="w-full btn-primary"
              >
                Run Visual Test
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Visual Testing Features
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Screenshot comparison</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Layout shift detection</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Cross-browser consistency</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Color contrast analysis</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Responsive design validation</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {testResults ? (
            <>
              {/* Progress */}
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Visual Test Progress
                </h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Progress</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {testResults.progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${testResults.progress}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Current Step</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {testResults.currentStep}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Duration</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {testResults.duration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Results */}
              {testResults.status === 'completed' && testResults.results && (
                <>
                  <div className="card">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Visual Test Results
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {testResults.results.totalComparisons}
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">Total</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {testResults.results.passed}
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">Passed</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-lg">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {testResults.results.failed}
                        </div>
                        <div className="text-sm text-red-700 dark:text-red-300">Failed</div>
                      </div>
                    </div>
                  </div>

                  {/* Differences */}
                  {testResults.results.differences.length > 0 && (
                    <div className="card">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Visual Differences Found
                      </h3>
                      <div className="space-y-3">
                        {testResults.results.differences.map((diff, index) => (
                          <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {diff.page} - {diff.element}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  Difference: {diff.difference}
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                diff.severity === 'Major' 
                                  ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                                  : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                              }`}>
                                {diff.severity}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <button className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded text-sm">
                                View Diff
                              </button>
                              <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-sm">
                                Approve
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">👁️</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Ready for Visual Testing
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Configure your visual test settings and run comprehensive UI validation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualTestingAgent;
