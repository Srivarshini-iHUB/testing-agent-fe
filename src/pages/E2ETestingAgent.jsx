import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const E2ETestingAgent = () => {
  const { theme } = useTheme();
  const [selectedFlow, setSelectedFlow] = useState('manual');
  const [selectedBrowser, setSelectedBrowser] = useState('chrome');
  const [testScenario, setTestScenario] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [playwrightSetup, setPlaywrightSetup] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState(null);
  const [applicationUrl, setApplicationUrl] = useState('');
  const [agentRunning, setAgentRunning] = useState(false);

  const flows = [
    { id: 'manual', name: 'Manual Setup', description: 'Playwright configuration and CSV upload' },
    { id: 'agent', name: 'AI Agent', description: 'Automated test generation and execution' }
  ];

  const browsers = [
    { id: 'chrome', name: 'Chrome', icon: '🌐' },
    { id: 'firefox', name: 'Firefox', icon: '🦊' },
    { id: 'safari', name: 'Safari', icon: '🧭' },
    { id: 'edge', name: 'Edge', icon: '🔷' }
  ];

  const scenarios = [
    {
      id: 'user-registration',
      name: 'User Registration Flow',
      description: 'Complete user registration process',
      steps: ['Visit registration page', 'Fill form', 'Submit', 'Verify email']
    },
    {
      id: 'checkout-process',
      name: 'E-commerce Checkout',
      description: 'Complete purchase workflow',
      steps: ['Add to cart', 'Proceed to checkout', 'Enter payment', 'Confirm order']
    },
    {
      id: 'login-logout',
      name: 'Authentication Flow',
      description: 'User login and logout process',
      steps: ['Enter credentials', 'Login', 'Access dashboard', 'Logout']
    }
  ];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setUploadedFiles(file);
    } else {
      alert('Please upload a valid CSV file');
    }
  };

  const setupPlaywright = () => {
    setPlaywrightSetup(true);
    // Simulate setup process
    setTimeout(() => {
      setPlaywrightSetup(false);
      alert('Playwright setup completed successfully!');
    }, 3000);
  };

  const generateTestScript = () => {
    if (!uploadedFiles || !applicationUrl) {
      alert('Please upload CSV file and provide application URL');
      return;
    }
    
    if (selectedFlow === 'agent') {
      setAgentRunning(true);
      // Simulate agent processing
      setTimeout(() => {
        setAgentRunning(false);
        setTestResults({
          status: 'completed',
          scriptGenerated: true,
          reportGenerated: true
        });
      }, 5000);
    } else {
      setTestResults({
        status: 'completed',
        scriptGenerated: true
      });
    }
  };

  const downloadScript = () => {
    // Simulate file download
    const element = document.createElement('a');
    const file = new Blob(['# Generated Playwright Test Script\nimport pytest\nfrom playwright.sync_api import sync_playwright\n\n# Your test case implementation here'], 
      { type: 'text/python' });
    element.href = URL.createObjectURL(file);
    element.download = 'test_script.py';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadReport = () => {
    // Simulate report download
    const element = document.createElement('a');
    const file = new Blob(['# Test Execution Report\n## Summary\n- Total Tests: 10\n- Passed: 8\n- Failed: 2\n- Duration: 45s'], 
      { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = 'test_report.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const runE2ETest = () => {
    if (!testScenario.trim()) return;
    
    // Simulate E2E test execution
    setTestResults({
      status: 'running',
      progress: 0,
      totalSteps: 8,
      completedSteps: 0,
      currentStep: 'Initializing browser...',
      duration: '0s'
    });

    // Simulate progress
    const interval = setInterval(() => {
      setTestResults(prev => {
        const newProgress = prev.progress + 12.5;
        const newCompletedSteps = Math.floor(newProgress / 12.5);
        
        if (newProgress >= 100) {
          clearInterval(interval);
          return {
            ...prev,
            status: 'completed',
            progress: 100,
            completedSteps: prev.totalSteps,
            currentStep: 'Test completed successfully',
            duration: '45s',
            results: {
              passed: 7,
              failed: 1,
              skipped: 0,
              screenshots: 8
            }
          };
        }

        const steps = [
          'Initializing browser...',
          'Loading application...',
          'Navigating to login page...',
          'Entering credentials...',
          'Submitting login form...',
          'Verifying dashboard access...',
          'Testing navigation menu...',
          'Performing logout...'
        ];

        return {
          ...prev,
          progress: newProgress,
          completedSteps: newCompletedSteps,
          currentStep: steps[newCompletedSteps] || prev.currentStep,
          duration: `${Math.floor(newProgress * 0.45)}s`
        };
      });
    }, 500);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          🔄
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          End-to-End Testing Agent
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Comprehensive testing of complete user workflows across multiple browsers and devices with automated execution and reporting.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              E2E Test Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Testing Flow
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {flows.map((flow) => (
                    <button
                      key={flow.id}
                      onClick={() => setSelectedFlow(flow.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedFlow === flow.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {flow.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {flow.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedFlow === 'manual' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Playwright Setup
                    </label>
                    <button
                      onClick={setupPlaywright}
                      disabled={playwrightSetup}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {playwrightSetup ? 'Setting up Playwright...' : 'Setup Playwright'}
                    </button>
                    {playwrightSetup && (
                      <div className="mt-2 flex items-center text-blue-600 dark:text-blue-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Installing Playwright and browsers...
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Upload Test Case CSV File
                    </label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {uploadedFiles && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        ✓ {uploadedFiles.name} uploaded successfully
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Application URL
                    </label>
                    <input
                      type="url"
                      value={applicationUrl}
                      onChange={(e) => setApplicationUrl(e.target.value)}
                      placeholder="https://your-app.com"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sample Test Case File
                    </label>
                    <button 
                      onClick={() => {
                        // Simulate sample CSV download
                        const element = document.createElement('a');
                        const csvContent = 'test_id,test_name,action,selector,value,expected_result\n1,Login Test,click,#login-btn,,\n2,Fill Email,fill,#email,john@example.com,\n3,Fill Password,fill,#password,password123,\n4,Submit Form,click,#submit-btn,,Login successful';
                        const file = new Blob([csvContent], { type: 'text/csv' });
                        element.href = URL.createObjectURL(file);
                        element.download = 'sample_test_cases.csv';
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                      }}
                      className="w-full btn-secondary"
                    >
                      Download Sample Test Case File
                    </button>
                  </div>

                  <button
                    onClick={generateTestScript}
                    disabled={!uploadedFiles || !applicationUrl}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Playwright Script
                  </button>
                </>
              )}

              {selectedFlow === 'agent' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Upload Test Case CSV File
                    </label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {uploadedFiles && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        ✓ {uploadedFiles.name} uploaded successfully
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Application URL
                    </label>
                    <input
                      type="url"
                      value={applicationUrl}
                      onChange={(e) => setApplicationUrl(e.target.value)}
                      placeholder="https://your-app.com"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Browser Configuration
                    </label>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🌐</span>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Chrome</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Automatically configured</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={generateTestScript}
                    disabled={!uploadedFiles || !applicationUrl || agentRunning}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {agentRunning ? 'AI Agent Running...' : 'Run AI Agent'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Agent Capabilities
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Multi-browser testing</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Cross-device compatibility</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">API integration testing</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Database validation</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Screenshot capture</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* Agent Running State */}
          {agentRunning && (
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                AI Agent Processing
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    AI Agent is analyzing your test cases...
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Generating optimized Playwright scripts and running tests
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Analyzing CSV data</span>
                    <span className="text-green-600 dark:text-green-400">✓</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Generating test scripts</span>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Executing tests</span>
                    <span className="text-gray-400">⏳</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Generating report</span>
                    <span className="text-gray-400">⏳</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Manual Flow Results */}
          {selectedFlow === 'manual' && testResults && testResults.status === 'completed' && (
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Script Generation Complete
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-800 dark:text-green-200 font-medium">
                      Playwright test script generated successfully!
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-300">Test Cases Processed</span>
                    <span className="font-semibold text-gray-900 dark:text-white">12</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-300">Application URL</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm truncate ml-2">
                      {applicationUrl}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-300">File Format</span>
                    <span className="font-semibold text-gray-900 dark:text-white">Python (.py)</span>
                  </div>
                </div>

                <button
                  onClick={downloadScript}
                  className="w-full btn-primary"
                >
                  Download Test Script (.py)
                </button>
              </div>
            </div>
          )}

          {/* Agent Flow Results */}
          {selectedFlow === 'agent' && testResults && testResults.status === 'completed' && (
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                AI Agent Results
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-800 dark:text-green-200 font-medium">
                      AI Agent completed successfully!
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">8</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Tests Passed</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">2</div>
                    <div className="text-sm text-red-700 dark:text-red-300">Tests Failed</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-300">Browser Used</span>
                    <span className="font-semibold text-gray-900 dark:text-white capitalize">
                      {selectedBrowser}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-300">Execution Time</span>
                    <span className="font-semibold text-gray-900 dark:text-white">45s</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-300">Screenshots</span>
                    <span className="font-semibold text-gray-900 dark:text-white">12</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={downloadScript}
                    className="flex-1 btn-primary"
                  >
                    Download Script (.py)
                  </button>
                  <button
                    onClick={downloadReport}
                    className="flex-1 btn-secondary"
                  >
                    Download Report
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Default State */}
          {!testResults && !agentRunning && (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Ready for E2E Testing
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Choose your testing flow and upload test cases to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default E2ETestingAgent;
