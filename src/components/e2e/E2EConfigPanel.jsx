const E2EConfigPanel = ({
  selectedFlow,
  setSelectedFlow,
  handleFileUpload,
  uploadedFiles,
  applicationUrl,
  setApplicationUrl,
  setupPlaywright,
  playwrightSetup,
  generateTestScript,
  agentRunning
}) => {
  const flows = [
    { id: 'manual', name: 'Manual Setup', description: 'Playwright configuration and CSV upload' },
    { id: 'agent', name: 'AI Agent', description: 'Automated test generation and execution' }
  ];

  return (
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
  );
};

export default E2EConfigPanel;


