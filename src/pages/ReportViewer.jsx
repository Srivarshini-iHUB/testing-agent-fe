import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ReportViewer = () => {
  const [reportUrl, setReportUrl] = useState('');
  const [artifactId, setArtifactId] = useState('');
  const navigate = useNavigate();

  const handleViewByUrl = (e) => {
    e.preventDefault();
    if (reportUrl.trim()) {
      window.open(`/pytest-report?url=${encodeURIComponent(reportUrl)}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleViewByArtifactId = (e) => {
    e.preventDefault();
    if (artifactId.trim()) {
      const url = `http://localhost:8080/artifacts/${artifactId}/reports/report.json`;
      window.open(`/pytest-report?url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Pytest Report Viewer
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          View pytest JSON reports with a beautiful, interactive interface
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* View by URL */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            📄 View by Report URL
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Enter the full URL to your pytest JSON report
          </p>
          
          <form onSubmit={handleViewByUrl} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Report URL
              </label>
              <input
                type="text"
                value={reportUrl}
                onChange={(e) => setReportUrl(e.target.value)}
                placeholder="http://localhost:8080/artifacts/bf2cd60b/reports/report.json"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <button
              type="submit"
              disabled={!reportUrl.trim()}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              View Report
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              💡 Example URLs
            </h3>
            <div className="space-y-2 text-xs text-blue-800 dark:text-blue-400">
              <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                http://localhost:8080/artifacts/bf2cd60b/reports/report.json
              </div>
              <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                http://localhost:8080/reports/latest.json
              </div>
            </div>
          </div>
        </div>

        {/* View by Artifact ID */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🔍 View by Artifact ID
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Enter the artifact ID to view its report
          </p>
          
          <form onSubmit={handleViewByArtifactId} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Artifact ID
              </label>
              <input
                type="text"
                value={artifactId}
                onChange={(e) => setArtifactId(e.target.value)}
                placeholder="bf2cd60b"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <button
              type="submit"
              disabled={!artifactId.trim()}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              View Report
            </button>
          </form>

          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">
              ℹ️ About Artifact IDs
            </h3>
            <p className="text-xs text-green-800 dark:text-green-400">
              Artifact IDs are unique identifiers for test runs. They're typically found in the URL path when viewing test results.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          ✨ Report Viewer Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Summary Dashboard</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              View test counts, pass/fail rates, and execution time at a glance
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg">
            <div className="text-2xl mb-2">🔍</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Detailed Test Info</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Expand individual tests to see setup, execution, and teardown phases
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-lg">
            <div className="text-2xl mb-2">🐛</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Error Tracking</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              View detailed error messages, tracebacks, and crash information
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg">
            <div className="text-2xl mb-2">⏱️</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Performance Metrics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              See execution times for each test phase and overall duration
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-lg">
            <div className="text-2xl mb-2">🏷️</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Test Metadata</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              View keywords, line numbers, and test node identifiers
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-lg">
            <div className="text-2xl mb-2">🌓</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Dark Mode</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Seamless dark mode support for comfortable viewing
            </p>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          📖 Usage Instructions
        </h2>
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. Generate Pytest JSON Report</h3>
            <p className="mb-2">Run pytest with the <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">--json-report</code> flag:</p>
            <pre className="bg-gray-900 text-gray-300 p-3 rounded-lg text-sm font-mono overflow-x-auto">
              pytest --json-report --json-report-file=report.json
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. Access Your Report</h3>
            <p className="mb-2">Use one of the methods above to view your report:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Enter the full URL to your report JSON file</li>
              <li>Or enter the artifact ID if using the artifact system</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. Direct URL Access</h3>
            <p className="mb-2">You can also directly navigate to:</p>
            <pre className="bg-gray-900 text-gray-300 p-3 rounded-lg text-sm font-mono overflow-x-auto">
              /pytest-report?url=YOUR_REPORT_URL
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportViewer;

