// src/pages/E2ETestingAgent.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { authConfig } from '../config/auth';
import E2EHeader from '../components/e2e/E2EHeader';
import E2EConfigPanel from '../components/e2e/E2EConfigPanel';
import E2EResults from '../components/e2e/E2EResults';
import GitAutoRouting from '../components/e2e/GitAutoRouting';

const E2ETestingAgent = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // --- Existing State (Manual/AI Flow) ---
  const [selectedFlow, setSelectedFlow] = useState('manual');
  const [aiSubFlow, setAiSubFlow] = useState('old_ai');
  const [selectedBrowser, setSelectedBrowser] = useState('chrome');
  const [testScenario, setTestScenario] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [playwrightSetup, setPlaywrightSetup] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState(null);
  const [applicationUrl, setApplicationUrl] = useState('');
  const [agentRunning, setAgentRunning] = useState(false);
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
  const [testCases, setTestCases] = useState([]);
  const [reportId, setReportId] = useState('');
  const [bugSheetUrl, setBugSheetUrl] = useState('');
  const [appsScriptCode, setAppsScriptCode] = useState('');
  const [setupInstructions, setSetupInstructions] = useState('');
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // --- Git Auto Routing State ---
  const [sessionToken, setSessionToken] = useState('');
  const [repos, setRepos] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(''); // Full "owner/repo"
  const [selectedBranch, setSelectedBranch] = useState('');
  const [routeFiles, setRouteFiles] = useState([]); // List of frontend route files
  const [selectedFiles, setSelectedFiles] = useState([]); // Selected file paths
  const [routesPreview, setRoutesPreview] = useState([]); // Extracted routes
  const [testCasesPreview, setTestCasesPreview] = useState([]); // Editable mapped test cases
  const [projectUrl, setProjectUrl] = useState(''); // Used as project_id for filtering
  // UI states for login success message
  const [loginSuccessMessage, setLoginSuccessMessage] = useState('');

  // --- Common Helpers ---
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

  // --- Manual / Old AI Flow (unchanged) ---
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
      // Get project ID from localStorage
      const proj = JSON.parse(localStorage.getItem('project') || 'null');
      const projectId = proj?.id;
      
      if (!projectId) {
        alert('Project ID not found in localStorage. Please select a project first.');
        return;
      }

      const formData = new FormData();
      const arrayBuffer = await uploadedFiles.arrayBuffer();
      const stableFile = new File([arrayBuffer], uploadedFiles.name, { type: uploadedFiles.type || 'application/octet-stream' });
      formData.append("file", stableFile);
      formData.append("project_url", applicationUrl);
      formData.append("project_id", projectId);

      const res = await fetch("http://localhost:8080/parse_input", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      const script = data.script || "";
      setOutput(script);
      setTestCases(data.test_cases || []);
      setReportId(data.reportId || '');
      const cmd = `pytest --headed --browser chromium;`;
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

  // --- Git Auto Routing Flow Helpers (passed as props) ---
  const handleGitLogin = () => {
    const redirectUri = encodeURIComponent(window.location.href);
    window.location.href = `http://localhost:8080/auth/login?redirect_uri=${redirectUri}`;
  };

  const fetchRepos = async () => {
    const token = sessionToken || localStorage.getItem('session_token');
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/auth/repos?session_token=${encodeURIComponent(token)}`);
      if (!res.ok) {
        const errorDetail = await res.text();
        if (res.status === 401) {
          localStorage.removeItem('session_token');
          setSessionToken('');
          setRepos([]);
          setLoginSuccessMessage('');
        }
        console.error('Failed to fetch repos', res.status, errorDetail);
        return;
      }
      const data = await res.json();
      setRepos(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async (fullRepo) => {
    const token = sessionToken || localStorage.getItem('session_token');
    if (!token || !fullRepo) return;
    try {
      setLoading(true);
      const [owner, repo] = fullRepo.split('/');
      if (!owner || !repo) {
        console.warn('Invalid repo format', fullRepo);
        return;
      }
      const res = await fetch(`http://localhost:8080/auth/branches?session_token=${encodeURIComponent(token)}&owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`);
      if (!res.ok) {
        const errorDetail = await res.text();
        console.error('Failed to fetch branches', res.status, errorDetail);
        return;
      }
      const data = await res.json();
      setBranches(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRouteFiles = async () => {
    if (!selectedRepo || !selectedBranch) {
      alert('Select repo and branch first');
      return;
    }
    setLoading(true);
    setRouteFiles([]);
    try {
      const token = sessionToken || localStorage.getItem('session_token');
      const res = await fetch(`http://localhost:8080/api/route_files?repo=${encodeURIComponent(selectedRepo)}&branch=${encodeURIComponent(selectedBranch)}&session_token=${encodeURIComponent(token)}`);
      if (!res.ok) {
        const errorDetail = await res.text();
        throw new Error(`HTTP ${res.status}: ${res.statusText} - ${errorDetail}`);
      }
      const data = await res.json();
      setRouteFiles(data.files || []);
    } catch (err) {
      console.error(err);
      alert('Error fetching route files: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const extractAndMapTestCases = async () => {
    if (!selectedRepo || !selectedBranch || selectedFiles.length === 0 || !projectUrl) {
      alert('Select repo, branch, at least one file, and enter project ID');
      return;
    }
    setLoading(true);
    setRoutesPreview([]);
    setTestCasesPreview([]);
    try {
      const token = sessionToken || localStorage.getItem('session_token');
      const res = await fetch('http://localhost:8080/api/git_auto_mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: selectedRepo,
          branch: selectedBranch,
          selected_files: selectedFiles,
          project_id: projectUrl,
          session_token: token
        })
      });
      if (!res.ok) {
        const errorDetail = await res.text();
        throw new Error(`HTTP ${res.status}: ${res.statusText} - ${errorDetail}`);
      }
      const data = await res.json();
      setRoutesPreview(data.routes || []);
      // Initialize editable test cases preview with matched routes under expected_result
      const editableTestCases = (data.mapped_test_cases || []).map(tc => ({
        ...tc,
        edited_route: tc.matched_route ? `${tc.matched_route.method || 'GET'} ${tc.matched_route.path}` : '',
        original_route: tc.matched_route ? `${tc.matched_route.method || 'GET'} ${tc.matched_route.path}` : ''
      }));
      setTestCasesPreview(editableTestCases);
    } catch (err) {
      console.error(err);
      alert('Error extracting routes and mapping: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTestCase = (index, field, value) => {
    const updated = [...testCasesPreview];
    updated[index][field] = value;
    setTestCasesPreview(updated);
  };

  const generateScriptFromMapping = async () => {
    if (testCasesPreview.length === 0) {
      alert('No mapped test cases available. Extract routes first.');
      return;
    }
    setLoading(true);
    try {
      const token = sessionToken || localStorage.getItem('session_token');
      // Prepare mapped test cases with edited routes
      const finalMapped = testCasesPreview.map(tc => {
        const routeMatch = tc.edited_route ? tc.edited_route.match(/^(GET|POST|PUT|DELETE|PATCH)?\s*(.+)$/) : null;
        return {
          ...tc,
          matched_route: tc.edited_route ? {
            method: routeMatch?.[1] || 'GET',
            path: routeMatch?.[2] || tc.edited_route,
            source_file: tc.original_route ? 'user_edited' : 'auto_mapped'
          } : (tc.matched_route || null),
          match_score: tc.edited_route ? 100 : (tc.match_score || 0) // Assume edited is perfect match
        };
      });
      const res = await fetch('http://localhost:8080/api/generate_script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mapped_test_cases: finalMapped,
          project_id: projectUrl,
          repo: selectedRepo,
          branch: selectedBranch,
          session_token: token
        })
      });
      if (!res.ok) {
        const errorDetail = await res.text();
        throw new Error(`HTTP ${res.status}: ${res.statusText} - ${errorDetail}`);
      }
      const data = await res.json();
      setOutput(data.script || '');
      setRunCommand(`pytest --headed --browser chromium generated_script.py`);
      setTestResults({
        status: 'completed',
        scriptGenerated: true,
        testCaseCount: finalMapped.filter(tc => tc.matched_route).length
      });
    } catch (err) {
      console.error(err);
      alert('Error generating script: ' + err.message);
      setOutput("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('session_token');
    setSessionToken('');
    setRepos([]);
    setBranches([]);
    setSelectedRepo('');
    setSelectedBranch('');
    setRouteFiles([]);
    setSelectedFiles([]);
    setLoginSuccessMessage('');
    setRoutesPreview([]);
    setTestCasesPreview([]);
    setOutput('');
  };

  // --- Common Download/Run Helpers (unchanged) ---
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
      // Ensure Drive/Sheets consent via user gesture (popup); silently continue if user cancels
      // Consent is now handled at login; do not prompt here

      const response = await fetch("http://localhost:8080/run_docker_tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem(authConfig.tokenKey) || ''}`
        },
        body: JSON.stringify({
          test_script: output,
          project_url: applicationUrl,
          test_cases: testCases, // Pass the stored test case data
          reportId: reportId, // Pass the reportId to update the existing MongoDB document
          user_token: localStorage.getItem(authConfig.tokenKey) // Include JWT so backend can use user's Google Drive
        }),
      });
      if (!response.ok) {
        if (authConfig.debug) console.error('[Page] run_docker_tests HTTP error', response.status);
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

  // --- Effects ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('session_token');
    if (tokenFromUrl) {
      localStorage.setItem('session_token', tokenFromUrl);
      setSessionToken(tokenFromUrl);
      setLoginSuccessMessage('GitHub login successful ✅');
      // Auto-select AI Agent > Git Auto Routing flow on login redirect
      setSelectedFlow('ai_agent');
      setAiSubFlow('git_auto');
      const cleanPath = window.location.pathname;
      window.history.replaceState({}, document.title, cleanPath);
      fetchRepos();
      return;
    }
    const stored = localStorage.getItem('session_token');
    if (stored) {
      setSessionToken(stored);
      setLoginSuccessMessage('GitHub login successful ✅');
      // Ensure we're in Git Auto flow if token exists
      setSelectedFlow('ai_agent');
      setAiSubFlow('git_auto');
      fetchRepos();
    }
  }, []);

  useEffect(() => {
    if (selectedRepo) {
      fetchBranches(selectedRepo);
    } else {
      setBranches([]);
    }
  }, [selectedRepo]);

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-900 text-gray-900 dark:text-white p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-300 font-semibold transition-all"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Dashboard
        </button>
        {/* Header */}
        <E2EHeader />
        {/* Flow Selection Buttons */}
        <div className="mb-4 flex space-x-4">
          <button
            onClick={() => setSelectedFlow('manual')}
            className={`px-4 py-2 rounded-md ${selectedFlow === 'manual' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Manual Setup
          </button>
          <button
            onClick={() => setSelectedFlow('ai_agent')}
            className={`px-4 py-2 rounded-md ${selectedFlow === 'ai_agent' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            AI Agent
          </button>
        </div>
        {/* AI Sub-Flow Selection */}
        {selectedFlow === 'ai_agent' && (
          <div className="mt-2 ml-4 flex space-x-4">
            <button
              onClick={() => setAiSubFlow('old_ai')}
              className={`px-4 py-2 rounded-md ${aiSubFlow === 'old_ai' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              Normal AI Flow
            </button>
            <button
              onClick={() => setAiSubFlow('git_auto')}
              className={`px-4 py-2 rounded-md ${aiSubFlow === 'git_auto' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              Auto Routing with GitHub
            </button>
          </div>
        )}
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-2">
            {selectedFlow === 'manual' && (
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
            )}
            {selectedFlow === 'ai_agent' && aiSubFlow === 'old_ai' && (
              <E2EConfigPanel
                selectedFlow="agent"
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
            )}
            {selectedFlow === 'ai_agent' && aiSubFlow === 'git_auto' && (
              <GitAutoRouting
                loading={loading}
                projectUrl={projectUrl}
                setProjectUrl={setProjectUrl}
                sessionToken={sessionToken}
                repos={repos}
                branches={branches}
                selectedRepo={selectedRepo}
                setSelectedRepo={setSelectedRepo}
                selectedBranch={selectedBranch}
                setSelectedBranch={setSelectedBranch}
                routeFiles={routeFiles}
                setRouteFiles={setRouteFiles}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                routesPreview={routesPreview}
                setRoutesPreview={setRoutesPreview}
                testCasesPreview={testCasesPreview}
                setTestCasesPreview={setTestCasesPreview}
                loginSuccessMessage={loginSuccessMessage}
                handleGitLogin={handleGitLogin}
                fetchRepos={fetchRepos}
                fetchBranches={fetchBranches}
                fetchRouteFiles={fetchRouteFiles}
                extractAndMapTestCases={extractAndMapTestCases}
                handleUpdateTestCase={handleUpdateTestCase}
                generateScriptFromMapping={generateScriptFromMapping}
                handleLogout={handleLogout}
                output={output}
                handleDownload={handleDownload}
                handleRunWithDocker={handleRunWithDocker}
                dockerRunning={dockerRunning}
              />
            )}
          </div>
          {/* Results Panel */}
          <div>
            <E2EResults
              selectedFlow={selectedFlow}
              testResults={testResults}
              agentRunning={agentRunning}
              applicationUrl={applicationUrl || projectUrl}
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