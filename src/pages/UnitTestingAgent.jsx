import { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { testReportsApi } from "../api/testReportsApi";
import GithubConnect from "../components/GithubConnect";
import GitRepoBranchPicker from "../components/GithubRepoSelector";
import GithubRepoSelector from "../components/GithubRepoSelector";


const UnitTestingAgent = () => {
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
    // const interval = setInterval(fetchReports, 20000);
    // return () => clearInterval(interval);
     const params = new URLSearchParams(window.location.search);
  const username = params.get("username");
  const token = params.get("access_token");

  if (username && token) {
    localStorage.setItem("github_user", username);
    localStorage.setItem("github_token", token);
    // remove params from URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          🧪
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Unit Testing Agent
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Automatically generates Jest tests and displays real-time HTML reports.
        </p>
      </div>
      <div className="flex justify-end mb-4">
<div className="space-y-6">
      <GithubConnect />
      <GitRepoBranchPicker />
    </div>
</div>

      {/* Commits List */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Latest Commits
        </h2>
        {loading && <p className="text-gray-500">Loading...</p>}
        {!loading && commits.length === 0 && (
          <p className="text-gray-500">No commits processed yet.</p>
        )}

        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {commits.map((commit) => (
            <li
              key={commit.commit}
              className="py-3 flex justify-between items-center"
            >
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {commit.repo}
                </div>
                <div className="text-sm text-gray-500">
                  Commit: {commit.commit.slice(0, 8)}
                </div>
                <div className="text-sm text-gray-500">
                  Files: {Object.keys(commit.files).length}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedCommit(commit);
                  setSelectedFile(null);
                }}
                className="btn-primary px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
              >
                View Details
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Selected Commit Details */}
      {selectedCommit && (
        <div className="card mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Commit Report — {selectedCommit.repo}
            </h2>
            <button
              onClick={() => setSelectedCommit(null)}
              className="text-sm text-blue-600 hover:underline"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Jest Test Files */}
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                Jest Test Files
              </h3>
              <ul className="space-y-2">
                {Object.keys(selectedCommit.files).map((filePath) => (
                  <li key={filePath}>
                    <button
                      className={`text-left w-full px-2 py-1 rounded ${
                        selectedFile === filePath
                          ? "bg-blue-100 dark:bg-blue-900"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => setSelectedFile(filePath)}
                    >
                      {filePath}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Jest Code & Report */}
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              {!selectedFile && (
                <p className="text-gray-500">
                  Select a file from the left to view its Jest code or report.
                </p>
              )}

              {selectedFile && (
                <>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                    {selectedFile}
                  </h3>

                  {/* Jest Code */}
                  <pre className="p-3 bg-gray-900 text-green-400 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                    {selectedCommit.files[selectedFile]}
                  </pre>

                  {/* Jest Test Results */}
                  {selectedCommit.reports[selectedFile] && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
                        Test Results
                      </h4>
                      {(() => {
                        const testDetails = getTestDetails(
                          selectedCommit.reports[selectedFile]
                        );
                        if (!testDetails) return <p>No report available.</p>;

                        return (
                          <div className="space-y-4">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                  {testDetails.numPassedTests}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                  Passed
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                  {testDetails.numFailedTests}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                  Failed
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                  {testDetails.numTotalTests}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                  Total Tests
                                </div>
                              </div>
                              {/* <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                  {testDetails.numPassedTestSuites}/{testDetails.numTotalTestSuites}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                  Test Suites
                                </div>
                              </div> */}
                            </div>

                            {/* Individual Test Cases */}
                            <div className="space-y-2">
                              <h5 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                                Test Cases ({testDetails.allTests.length})
                              </h5>
                              {testDetails.allTests.map((test, idx) => (
                                <div
                                  key={idx}
                                  className={`p-3 rounded-lg border ${
                                    test.status === "passed"
                                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                      : test.status === "failed"
                                      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                      : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      {/* Test Title */}
                                      <div className="flex items-center gap-2 mb-1">
                                        <span
                                          className={`text-lg ${
                                            test.status === "passed"
                                              ? "text-green-600 dark:text-green-400"
                                              : test.status === "failed"
                                              ? "text-red-600 dark:text-red-400"
                                              : "text-gray-600 dark:text-gray-400"
                                          }`}
                                        >
                                          {test.status === "passed"
                                            ? "✓"
                                            : test.status === "failed"
                                            ? "✗"
                                            : "○"}
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                          {test.title}
                                        </span>
                                      </div>

                                      {/* Ancestor Titles (describe blocks) */}
                                      {test.ancestorTitles.length > 0 && (
                                        <div className="ml-7 text-xs text-gray-500 dark:text-gray-400 mb-1">
                                          {test.ancestorTitles.join(" › ")}
                                        </div>
                                      )}

                                      {/* Full Name */}
                                      <div className="ml-7 text-sm text-gray-600 dark:text-gray-300">
                                        {test.fullName}
                                      </div>

                                      {/* Test Details */}
                                      <div className="ml-7 mt-2 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                                        <span>
                                          Duration: <strong>{test.duration}ms</strong>
                                        </span>
                                        {test.numPassingAsserts > 0 && (
                                          <span>
                                            Assertions:{" "}
                                            <strong>{test.numPassingAsserts}</strong>
                                          </span>
                                        )}
                                        <span
                                          className={`font-semibold uppercase ${
                                            test.status === "passed"
                                              ? "text-green-600 dark:text-green-400"
                                              : test.status === "failed"
                                              ? "text-red-600 dark:text-red-400"
                                              : "text-gray-600 dark:text-gray-400"
                                          }`}
                                        >
                                          {test.status}
                                        </span>
                                      </div>

                                      {/* Failure Messages */}
                                      {/* {test.failureMessages.length > 0 && (
                                        <div className="ml-7 mt-3 p-2 bg-red-100 dark:bg-red-900/40 rounded border border-red-300 dark:border-red-700">
                                          <div className="font-semibold text-sm text-red-800 dark:text-red-300 mb-1">
                                            Error Details:
                                          </div>
                                          <pre className="text-xs text-red-700 dark:text-red-200 overflow-x-auto whitespace-pre-wrap font-mono">
                                            {test.failureMessages.join("\n\n")}
                                          </pre>
                                        </div>
                                      )} */}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Optional HTML Report iframe */}
                  {selectedCommit.reports[selectedFile]?.html && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-md mb-2 text-gray-700 dark:text-gray-300">
                        Jest HTML Report
                      </h4>
                      <iframe
                        title="Jest Report"
                        srcDoc={selectedCommit.reports[selectedFile].html}
                        className="w-full border rounded-lg bg-white"
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitTestingAgent;
