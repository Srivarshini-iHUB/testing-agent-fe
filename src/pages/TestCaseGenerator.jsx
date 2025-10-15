import { useState } from 'react';
import { useTestCaseGeneration } from '../hooks/useTestCaseGeneration';
import { useDownload } from '../hooks/useDownload';
import { useTheme } from '../contexts/ThemeContext';
import DocumentUpload from '../components/testcase/DocumentUpload';
import InsufficientAlert from '../components/testcase/InsufficientAlert';
import MismatchAlert from '../components/testcase/MismatchAlert';
import IncompleteStoriesAlert from '../components/testcase/IncompleteStoriesAlert';
import ProgressBar from '../components/testcase/ProgressBar';
import ResultsDashboard from '../components/testcase/ResultsDashboard';
import TestCaseTable from '../components/testcase/TestCaseTable';
import TestCaseModal from '../components/testcase/TestCaseModal';
function TestCaseGenerator() {
  const [frdFiles, setFrdFiles] = useState([]);
  const [userStoryFiles, setUserStoryFiles] = useState([]);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const { loading, progress, result, error, generate } = useTestCaseGeneration();
  const { downloading, downloadExcel, downloadJSON } = useDownload();
  const { theme, toggleTheme, isDark } = useTheme();
  const handleGenerate = async () => {
    try {
      await generate(frdFiles, userStoryFiles);
    } catch (err) {
      // Error handled in hook
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
      {/* Header */}
      {/* <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Test Case Generator Pro
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              AI-Powered Testing Intelligence
            </p>
          </div>
        </div>
      </header> */}

      <div className="text-center">
      <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
        📝
      </div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Test Case Generator
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        Automatically generates detailed test cases from FRDs, user stories, and acceptance criteria.
      </p>
    </div>
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Document Upload */}
        <DocumentUpload
          frdFiles={frdFiles}
          setFrdFiles={setFrdFiles}
          userStoryFiles={userStoryFiles}
          setUserStoryFiles={setUserStoryFiles}
        />
        {/* Generate Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleGenerate}
            disabled={loading || !frdFiles.length || !userStoryFiles.length}
            className="px-12 py-4 bg-primary-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            {loading ? 'Generating...' : 'Generate Test Cases'}
          </button>
        </div>
        {/* Progress Bar */}
        {loading && <ProgressBar progress={progress} />}
        {/* Error */}
        {error && !result && (
          <div className="bg-primary-50 dark:bg-primary-900 border-l-4 border-primary-500 dark:border-primary-700 p-4 rounded-xl mb-8">
            <p className="text-primary-700 dark:text-primary-300 font-medium">{error}</p>
          </div>
        )}
        {/* Alerts */}
        <InsufficientAlert data={result} />
        {result?.mismatched_features && (
          <MismatchAlert mismatched_features={result.mismatched_features} />
        )}
        {result?.incomplete_user_stories && (
          <IncompleteStoriesAlert incomplete_user_stories={result.incomplete_user_stories} />
        )}
        {/* Results */}
        {result?.status === 'ok' && (
          <>
            <ResultsDashboard result={result} />
            <TestCaseTable
              testCases={result.test_cases?.test_cases || []}
              onSelectTestCase={setSelectedTestCase}
            />
            {/* Download Buttons */}
            <div className="flex gap-4 justify-center mt-8">
              <button
                onClick={() => downloadExcel(result.test_cases?.test_cases || [])}
                disabled={downloading}
                className="px-6 py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 flex items-center gap-2"
              >
                <span>📊</span>
                {downloading ? 'Downloading...' : 'Download Excel (Simple)'}
              </button>
              
              {/* <button
                onClick={() => downloadDetailedExcel(result)}
                disabled={downloading}
                className="px-6 py-3 bg-green-600 dark:bg-green-500 text-white rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 flex items-center gap-2"
              >
                <span>📑</span>
                {downloading ? 'Downloading...' : 'Download Excel (Detailed)'}
              </button> */}
              
              <button
                onClick={() => downloadJSON(result.test_cases)}
                className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300 flex items-center gap-2"
              >
                <span>📝</span>
                Download JSON
              </button>
            </div>
          </>
        )}
      </main>
      {/* Test Case Detail Modal */}
      {selectedTestCase && (
        <TestCaseModal testCase={selectedTestCase} onClose={() => setSelectedTestCase(null)} />
      )}
    </div>
  );
}
export default TestCaseGenerator;