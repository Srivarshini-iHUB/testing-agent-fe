import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import E2EHeader from '../components/e2e/E2EHeader';
import E2EConfigPanel from '../components/e2e/E2EConfigPanel';
import E2EResults from '../components/e2e/E2EResults';

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

  // Static option data omitted for brevity in refactor

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
      <E2EHeader />
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <E2EConfigPanel
            selectedFlow={selectedFlow}
            setSelectedFlow={setSelectedFlow}
            handleFileUpload={handleFileUpload}
            uploadedFiles={uploadedFiles}
            applicationUrl={applicationUrl}
            setApplicationUrl={setApplicationUrl}
            setupPlaywright={setupPlaywright}
            playwrightSetup={playwrightSetup}
            generateTestScript={generateTestScript}
            agentRunning={agentRunning}
          />
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Agent Capabilities</h3>
            <ul className="space-y-3">
              <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span><span className="text-gray-600 dark:text-gray-300">Multi-browser testing</span></li>
              <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span><span className="text-gray-600 dark:text-gray-300">Cross-device compatibility</span></li>
              <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span><span className="text-gray-600 dark:text-gray-300">API integration testing</span></li>
              <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span><span className="text-gray-600 dark:text-gray-300">Database validation</span></li>
              <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span><span className="text-gray-600 dark:text-gray-300">Screenshot capture</span></li>
            </ul>
          </div>
        </div>
        <E2EResults
          selectedFlow={selectedFlow}
          testResults={testResults}
          agentRunning={agentRunning}
          applicationUrl={applicationUrl}
          selectedBrowser={selectedBrowser}
          downloadScript={downloadScript}
          downloadReport={downloadReport}
        />
      </div>
    </div>
  );
};

export default E2ETestingAgent;
