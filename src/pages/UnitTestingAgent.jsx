import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { testReportsApi } from "../api/testReportsApi";

const UnitTestingAgent = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [reports, setReports] = useState({});
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await testReportsApi.getReports();
        setReports(data);
      } catch (err) {
        console.error("Failed to load reports", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
    // Optional: refresh periodically
    const interval = setInterval(fetchReports, 20000);
    return () => clearInterval(interval);
  }, []);

  const commits = Object.values(reports);

  // Extract detailed test results from Jest report
  const getTestDetails = (fileReport) => {
    if (!fileReport) return null;

    const {
      numPassedTests,
      numFailedTests,
      numTotalTests,
      numPassedTestSuites,
      numFailedTestSuites,
      testResults,
    } = fileReport;

    // Extract individual test assertions
    const allTests = testResults
      ? testResults.flatMap((result) =>
          result.assertionResults.map((assertion) => ({
            title: assertion.title,
            fullName: assertion.fullName,
            status: assertion.status,
            duration: assertion.duration,
            ancestorTitles: assertion.ancestorTitles,
            failureMessages: assertion.failureMessages || [],
            failureDetails: assertion.failureDetails || [],
            numPassingAsserts: assertion.numPassingAsserts,
          }))
        )
      : [];

    return {
      numPassedTests,
      numFailedTests,
      numTotalTests,
      numPassedTestSuites,
      numFailedTestSuites,
      allTests,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-900 text-gray-900 dark:text-white p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-300 font-semibold transition-all"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-4xl shadow-lg">
              🧪
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Unit Testing Agent
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Automatically generates Jest tests and displays real-time HTML reports
              </p>
            </div>
          </div>
        </div>

        {/* Commits List */}
        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <i className="fas fa-code-branch text-indigo-600 dark:text-indigo-400"></i>
            Latest Commits
          </h2>

          {loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading commits...</p>
            </div>
          )}

          {!loading && commits.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-inbox text-4xl text-gray-400"></i>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">No commits processed yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Push commits to your repository to see test reports here</p>
            </div>
          )}

          <div className="space-y-3">
            {commits.map((commit) => (
              <div
                key={commit.commit}
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <i className="fas fa-folder text-indigo-600 dark:text-indigo-400"></i>
                    <span className="font-bold text-gray-900 dark:text-white text-lg">
                      {commit.repo}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <i className="fas fa-code-commit"></i>
                      {commit.commit.slice(0, 8)}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="fas fa-file-code"></i>
                      {Object.keys(commit.files).length} files
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCommit(commit);
                    setSelectedFile(null);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-semibold transition-all shadow-lg flex items-center gap-2"
                >
                  <i className="fas fa-eye"></i>
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Commit Details */}
        {selectedCommit && (
          <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <i className="fas fa-folder-open text-indigo-600 dark:text-indigo-400"></i>
                Commit Report — {selectedCommit.repo}
              </h2>
              <button
                onClick={() => setSelectedCommit(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                <i className="fas fa-times"></i>
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Jest Test Files */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <i className="fas fa-file-code text-blue-600 dark:text-blue-400"></i>
                  Jest Test Files
                </h3>
                <div className="space-y-2">
                  {Object.keys(selectedCommit.files).map((filePath) => (
                    <button
                      key={filePath}
                      className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                        selectedFile === filePath
                          ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-300 border-2 border-indigo-500 dark:border-indigo-400"
                          : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                      }`}
                      onClick={() => setSelectedFile(filePath)}
                    >
                      <div className="flex items-center gap-2">
                        <i className="fas fa-file-alt text-sm"></i>
                        <span className="truncate">{filePath}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Jest Code & Report */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                {!selectedFile && (
                  <div className="text-center py-12">
                    <i className="fas fa-hand-pointer text-5xl text-gray-300 dark:text-gray-600 mb-4"></i>
                    <p className="text-gray-500 dark:text-gray-400">
                      Select a file from the left to view its Jest code and test results
                    </p>
                  </div>
                )}

                {selectedFile && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <i className="fab fa-js-square text-yellow-500"></i>
                        {selectedFile.split('/').pop()}
                      </h3>
                    </div>

                    {/* Jest Code */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <i className="fas fa-code"></i>
                        Test Code
                      </h4>
                      <pre className="p-4 bg-gray-900 text-emerald-400 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono custom-scrollbar max-h-96 border border-gray-700">
                        {selectedCommit.files[selectedFile]}
                      </pre>
                    </div>

                    {/* Jest Test Results */}
                    {selectedCommit.reports[selectedFile] && (
                      <div>
                        <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                          <i className="fas fa-chart-bar text-indigo-600 dark:text-indigo-400"></i>
                          Test Results
                        </h4>
                        {(() => {
                          const testDetails = getTestDetails(
                            selectedCommit.reports[selectedFile]
                          );
                          if (!testDetails)
                            return (
                              <p className="text-gray-500">No report available.</p>
                            );

                          return (
                            <div className="space-y-4">
                              {/* Summary Stats */}
                              <div className="grid grid-cols-3 gap-3">
                                <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {testDetails.numPassedTests}
                                  </div>
                                  <div className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold mt-1">
                                    Passed
                                  </div>
                                </div>
                                <div className="text-center p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
                                  <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                                    {testDetails.numFailedTests}
                                  </div>
                                  <div className="text-xs text-rose-700 dark:text-rose-300 font-semibold mt-1">
                                    Failed
                                  </div>
                                </div>
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {testDetails.numTotalTests}
                                  </div>
                                  <div className="text-xs text-blue-700 dark:text-blue-300 font-semibold mt-1">
                                    Total Tests
                                  </div>
                                </div>
                              </div>

                              {/* Individual Test Cases */}
                              <div className="space-y-3">
                                <h5 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                  <i className="fas fa-list-check"></i>
                                  Test Cases ({testDetails.allTests.length})
                                </h5>
                                <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                                  {testDetails.allTests.map((test, idx) => (
                                    <div
                                      key={idx}
                                      className={`p-4 rounded-lg border-2 transition-all ${
                                        test.status === "passed"
                                          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                                          : test.status === "failed"
                                          ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800"
                                          : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                      }`}
                                    >
                                      {/* Test Title */}
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl">
                                          {test.status === "passed"
                                            ? "✅"
                                            : test.status === "failed"
                                            ? "❌"
                                            : "⚪"}
                                        </span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                          {test.title}
                                        </span>
                                      </div>

                                      {/* Ancestor Titles */}
                                      {test.ancestorTitles.length > 0 && (
                                        <div className="ml-8 text-xs text-gray-500 dark:text-gray-400 mb-1">
                                          {test.ancestorTitles.join(" › ")}
                                        </div>
                                      )}

                                      {/* Full Name */}
                                      <div className="ml-8 text-sm text-gray-600 dark:text-gray-300 mb-2">
                                        {test.fullName}
                                      </div>

                                      {/* Test Details */}
                                      <div className="ml-8 flex flex-wrap gap-3 text-xs">
                                        <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300">
                                          <i className="fas fa-clock mr-1"></i>
                                          {test.duration}ms
                                        </span>
                                        {test.numPassingAsserts > 0 && (
                                          <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300">
                                            <i className="fas fa-check-double mr-1"></i>
                                            {test.numPassingAsserts} assertions
                                          </span>
                                        )}
                                        <span
                                          className={`px-2 py-1 rounded font-bold uppercase ${
                                            test.status === "passed"
                                              ? "bg-emerald-600 text-white"
                                              : test.status === "failed"
                                              ? "bg-rose-600 text-white"
                                              : "bg-gray-600 text-white"
                                          }`}
                                        >
                                          {test.status}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Optional HTML Report iframe */}
                    {selectedCommit.reports[selectedFile]?.html && (
                      <div>
                        <h4 className="font-semibold text-md mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <i className="fas fa-file-code"></i>
                          Jest HTML Report
                        </h4>
                        <iframe
                          title="Jest Report"
                          srcDoc={selectedCommit.reports[selectedFile].html}
                          className="w-full border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white"
                          onLoad={(e) => {
                            const iframe = e.target;
                            const doc =
                              iframe.contentDocument ||
                              iframe.contentWindow.document;
                            iframe.style.height = doc.body.scrollHeight + "px";
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitTestingAgent;
