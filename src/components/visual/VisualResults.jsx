const VisualResults = ({ testResults, downloadVisualReport }) => {
  if (!testResults) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">👁️</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Ready for Visual Testing
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Configure your visual test settings and run comprehensive UI validation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {testResults.status === 'running' && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Generating Visual Diff
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Progress</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {testResults.progress.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${testResults.progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Status</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {testResults.currentStep}
              </span>
            </div>
          </div>
        </div>
      )}

      {testResults.status === 'completed' && testResults.results && (
        <>
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Visual Diff Result
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Actual (Baseline)</div>
                <img src={testResults.results.actualSrc} alt="Actual" className="w-full rounded-lg border border-gray-200 dark:border-gray-700" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Developed (Current)</div>
                <img src={testResults.results.developedSrc} alt="Developed" className="w-full rounded-lg border border-gray-200 dark:border-gray-700" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Diff Overlay</div>
                <div className="relative w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img src={testResults.results.actualSrc} alt="Actual" className="w-full opacity-70" />
                  <img src={testResults.results.developedSrc} alt="Developed" className="w-full mix-blend-difference opacity-70 absolute inset-0" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {testResults.results.totalComparisons}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Comparisons</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {testResults.results.failed}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">Mismatches</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {testResults.results.diffPercent}
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">Diff %</div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button onClick={downloadVisualReport} className="flex-1 btn-secondary">Download Report</button>
          </div>
        </>
      )}
    </div>
  );
};

export default VisualResults;


