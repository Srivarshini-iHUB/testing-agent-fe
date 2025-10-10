import React from 'react';

const VisualResults = ({ testResults, actualInputRef, developedInputRef }) => {
  const downloadVisualReport = async () => {
    if (!actualInputRef.current?.files[0] || !developedInputRef.current?.files[0]) {
      alert('Please upload both baseline and current images to download the report.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('baseline', actualInputRef.current.files[0]);
      formData.append('current', developedInputRef.current.files[0]);

      const response = await fetch('http://localhost:8000/api/visual-testing-report', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to download report: ' + (await response.text()));
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'visual_regression_report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download the report: ' + error.message);
    }
  };

  if (!testResults || typeof testResults !== 'object') {
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

  if (testResults.status === 'running') {
    return (
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
    );
  }

  if (testResults.status === 'completed' && testResults.results) {
    const { report, ssim_score, baseline_base64, annotated_current_base64 } = testResults.results;
    const differences = report?.differences || [];
    const summary = report?.summary || 'No summary provided.';
    const status = report?.status || 'unknown';

    return (
      <div className="space-y-6">
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Visual Diff Result
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Baseline Image
              </div>
              <img
                src={`data:image/jpeg;base64,${baseline_base64}`}
                alt="Baseline"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Image (Annotated)
              </div>
              <img
                src={`data:image/jpeg;base64,${annotated_current_base64}`}
                alt="Annotated Current"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Comparisons</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {differences.length}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">Mismatches</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {((1 - ssim_score) * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">Diff %</div>
            </div>
          </div>
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Summary
            </h4>
            <p className="text-gray-600 dark:text-gray-300">{summary}</p>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-4">
              SSIM Score
            </h4>
            <p className="text-gray-600 dark:text-gray-300">{ssim_score.toFixed(4)}</p>
            {differences.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Detected Differences
                </h4>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="p-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Location (x, y, w, h)
                      </th>
                      <th className="p-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </th>
                      <th className="p-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Severity
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {differences.map((diff, index) => (
                      <tr key={index} className="border-b dark:border-gray-700">
                        <td className="p-2 text-sm text-gray-600 dark:text-gray-300">
                          ({diff.location.x}, {diff.location.y}, {diff.location.w}, {diff.location.h})
                        </td>
                        <td className="p-2 text-sm text-gray-600 dark:text-gray-300">
                          {diff.description}
                        </td>
                        <td className="p-2 text-sm text-gray-600 dark:text-gray-300">
                          {diff.severity.charAt(0).toUpperCase() + diff.severity.slice(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          <button onClick={downloadVisualReport} className="flex-1 btn-secondary">
            Download Report
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default VisualResults;