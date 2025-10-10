import { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { testReportsApi } from "../api/testReportsApi";

const UnitTestingAgent = () => {
  const { theme } = useTheme();
  const [reports, setReports] = useState({});
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch reports every 10 seconds
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
    const interval = setInterval(fetchReports, 200000);
    return () => clearInterval(interval);
  }, []);

  const commits = Object.values(reports);

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

      {/* Commits list */}
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

            {/* Right: Code or HTML Report */}
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

                  {/* HTML Report */}
                  {selectedCommit.reports[selectedFile] && (
                    console.log("Report",selectedCommit.reports[selectedFile]),
                    <div className="mt-4">
                      <h4 className="font-semibold text-md mb-2 text-gray-700 dark:text-gray-300">
                        Jest HTML Report
                      </h4>
                      <iframe
  title="Jest Report"
  srcDoc={selectedCommit.reports[selectedFile]}
  className="w-full border rounded-lg bg-white"
  onLoad={(e) => {
    const iframe = e.target;
    const doc = iframe.contentDocument || iframe.contentWindow.document;
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
