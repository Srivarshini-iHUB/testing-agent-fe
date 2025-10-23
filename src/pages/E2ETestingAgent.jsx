import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import E2EHeader from '../components/e2e/E2EHeader';
import E2EConfigPanel from '../components/e2e/E2EConfigPanel';
import E2EResults from '../components/e2e/E2EResults';

const E2ETestingAgent = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [selectedFlow, setSelectedFlow] = useState('manual');
  const [selectedBrowser, setSelectedBrowser] = useState('chrome');
  const [testScenario, setTestScenario] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [playwrightSetup, setPlaywrightSetup] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState(null);
  const [applicationUrl, setApplicationUrl] = useState('');
  const [agentRunning, setAgentRunning] = useState(false);

  // Enhanced functionality state
  const [projectPath, setProjectPath] = useState('');
  const [output, setOutput] = useState('');
  const [runCommand, setRunCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [dockerRunning, setDockerRunning] = useState(false);
  const [dockerOutput, setDockerOutput] = useState('');
  const [dockerResults, setDockerResults] = useState(null);
  const [reportUrl, setReportUrl] = useState('');
  
  // New bug sheet integration state
  const [testCases, setTestCases] = useState([]);
  const [reportId, setReportId] = useState('');
  const [bugSheetUrl, setBugSheetUrl] = useState('');
  const [appsScriptCode, setAppsScriptCode] = useState('');
  const [setupInstructions, setSetupInstructions] = useState('');
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const formatSeconds = (seconds) => {
    const total = Math.max(0, Math.round(Number(seconds || 0)));
    const minutes = Math.floor(total / 60);
    const secs = total % 60;
    return minutes ? `${minutes}m ${secs}s` : `${secs}s`;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFiles(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'text/csv' || file.type.includes('spreadsheet') || file.type.includes('excel'))) {
      setUploadedFiles(file);
    } else {
      alert('Please upload a valid CSV, XLSX, or XLS file');
    }
  };

  const setupPlaywright = () => {
    if (!projectPath) return alert("Enter folder path");
    setTestResults(null);
    setPlaywrightSetup(true);

    const evtSource = new EventSource(
      `http://localhost:8080/setup_playwright_project?path=${encodeURIComponent(projectPath)}`
    );

    const logs = [];
    
    evtSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      logs.push(data);
      setTestResults({
        status: 'running',
        logs: [...logs]
      });
      
      if (data.message.includes("🎉")) {
        evtSource.close();
        setPlaywrightSetup(false);
        setTestResults({
          status: 'completed',
          logs: [...logs]
        });
      }
    };

    evtSource.onerror = () => {
      evtSource.close();
      setPlaywrightSetup(false);
      setTestResults({
        status: 'error',
        logs: [...logs, { type: 'error', message: 'Setup failed. Please check your path and try again.' }]
      });
    };
  };

  const generateTestScript = async () => {
    if (!uploadedFiles || !applicationUrl) {
      alert('Please upload CSV file and provide application URL');
      return;
    }
    
    if (selectedFlow === 'agent') {
      setAgentRunning(true);
    }
    setLoading(true);
    setOutput('');
    setRunCommand('');

    try {
      const formData = new FormData();
      const arrayBuffer = await uploadedFiles.arrayBuffer();
      const stableFile = new File([arrayBuffer], uploadedFiles.name, { type: uploadedFiles.type || 'application/octet-stream' });
      formData.append("file", stableFile);
      formData.append("project_url", applicationUrl);

      const res = await fetch("http://localhost:8080/parse_input", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      const script = data.script || "";
      setOutput(script);
      setTestCases(data.test_cases || []); // Store test case data
      setReportId(data.reportId || ''); // Store reportId from parse_input response

      const cmd = `pytest --headed --browser chromium`;
      setRunCommand(cmd);

      if (selectedFlow === 'manual') {
        const tc = data.test_cases || data.testcases || data.testCases;
        const testCaseCount =
          (typeof tc === 'number' && !Number.isNaN(tc)) ? Number(tc) :
          (Array.isArray(tc) ? tc.length : (
            (tc && typeof tc === 'object') ? Object.keys(tc).length : 0
          ));
        setTestResults({
          status: 'completed',
          scriptGenerated: true,
          testCaseCount
        });
      }

    } catch (err) {
      setOutput("Error: " + err.message);
      setTestResults({
        status: 'error',
        error: err.message
      });
    } finally {
      setLoading(false);
      if (selectedFlow === 'agent') {
        setAgentRunning(false);
      }
    }
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "test_script.py";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(runCommand);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleRunWithDocker = async () => {
    if (!output) {
      alert("Please generate a test script first");
      return;
    }

    setDockerRunning(true);
    setDockerOutput("");
    setDockerResults(null);

    try {
      const response = await fetch("http://localhost:8080/run_docker_tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test_script: output,
          project_url: applicationUrl,
          test_cases: testCases, // Pass the stored test case data
          reportId: reportId // Pass the reportId to update the existing MongoDB document
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullOutput = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              fullOutput += data.message + "\n";
              setDockerOutput(fullOutput);
              
              if (data.type === 'result') {
                const result = data.result || {};
                setDockerResults(result);
                setReportUrl(result.reportUrl || '');
                
                // Store bug sheet data
                setBugSheetUrl(result.bugSheetUrl || '');
                setAppsScriptCode(result.appsScriptCode || '');
                setSetupInstructions(result.setupInstructions || '');
                
                const durationSec = Number(
                  (result && (result.durationSec)) ||
                  ((result && result.completedAt && result.startedAt) ? (result.completedAt - result.startedAt) : 0)
                );
                const executionTimeStr = (durationSec && durationSec > 0)
                  ? formatSeconds(durationSec)
                  : (result.executionTime || '');
                setTestResults({
                  status: 'completed',
                  passed: Number(result.passed || 0),
                  failed: Number(result.failed || 0),
                  total: Number(result.total || (Number(result.passed || 0) + Number(result.failed || 0))),
                  executionTime: executionTimeStr,
                  screenshots: Array.isArray(result.screenshots) ? result.screenshots.length : Number(result.screenshots || 0) || 0,
                  reportUrl: result.reportUrl || '',
                  summaryUrl: result.summaryUrl || '',
                  pdfUrl: result.pdfUrl || '',
                  bugSheetUrl: result.bugSheetUrl || '',
                  appsScriptCode: result.appsScriptCode || '',
                  setupInstructions: result.setupInstructions || ''
                });
              }
            } catch (e) {
              fullOutput += line + "\n";
              setDockerOutput(fullOutput);
            }
          }
        }
      }
    } catch (err) {
      setDockerOutput("Error running Docker tests: " + err.message);
      console.error(err);
    } finally {
      setDockerRunning(false);
    }
  };

  const downloadScript = () => {
    if (!output) {
      alert('No script generated yet');
      return;
    }
    handleDownload();
  };

  const downloadReport = () => {
    if (!testResults || !testResults.reportUrl) {
      alert('Report not available yet');
      return;
    }
    window.open(testResults.reportUrl, '_blank', 'noopener,noreferrer');
  };

  const fetchReportData = async (reportUrl) => {
    setReportLoading(true);
    try {
      const response = await fetch(reportUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      alert('Failed to load report data: ' + error.message);
    } finally {
      setReportLoading(false);
    }
  };

  const runE2ETest = () => {
    if (!testScenario.trim()) return;
    
    setTestResults({
      status: 'running',
      progress: 0,
      totalSteps: 8,
      completedSteps: 0,
      currentStep: 'Initializing browser...',
      duration: '0s'
    });

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
        <E2EHeader />
        
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          {/* Configuration Panel - Takes 2 columns */}
          <div className="lg:col-span-2">
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
              projectPath={projectPath}
              setProjectPath={setProjectPath}
              handleDrag={handleDrag}
              handleDrop={handleDrop}
              dragActive={dragActive}
              loading={loading}
              output={output}
              runCommand={runCommand}
              handleDownload={handleDownload}
              copyToClipboard={copyToClipboard}
              copySuccess={copySuccess}
              handleRunWithDocker={handleRunWithDocker}
              dockerRunning={dockerRunning}
              testCases={testCases}
              setTestCases={setTestCases}
              reportId={reportId}
              setReportId={setReportId}
              bugSheetUrl={bugSheetUrl}
              appsScriptCode={appsScriptCode}
              setupInstructions={setupInstructions}
            />
          </div>

          {/* Results Panel - Takes 1 column */}
          <div>
        <E2EResults
          selectedFlow={selectedFlow}
          testResults={testResults}
          agentRunning={agentRunning}
          applicationUrl={applicationUrl}
          selectedBrowser={selectedBrowser}
          downloadScript={downloadScript}
          downloadReport={downloadReport}
          reportData={reportData}
          reportLoading={reportLoading}
          fetchReportData={fetchReportData}
        />
          </div>
        </div>
      </div>
    </div>
  );
};

export default E2ETestingAgent;
