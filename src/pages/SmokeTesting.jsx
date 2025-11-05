import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import axios from "axios";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Highlight, themes } from 'prism-react-renderer';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { smokeApi } from '../api/smokeApi';

const API_BASE = "http://localhost:8080";

function SmokeTesting() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  
  // Tab state - check if URL hash is #history to open history tab
  const [activeTab, setActiveTab] = useState(() => {
    return location.hash === '#history' ? 'history' : 'testing';
  });
  
  // Main testing states
  const [projectUrl, setProjectUrl] = useState("");
  const [testCasesFile, setTestCasesFile] = useState(null);
  const [generatedScript, setGeneratedScript] = useState("");
  const [generatedTestCases, setGeneratedTestCases] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [report, setReport] = useState(null);
  const createdSmokeIdRef = useRef("");
  
  // History states
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [historyReport, setHistoryReport] = useState(null);
  const [project, setProject] = useState(null);
  
  // Load project from localStorage
  useEffect(() => {
    try {
      const storedProject = localStorage.getItem('project');
      if (storedProject) {
        const parsed = JSON.parse(storedProject);
        setProject(parsed);
      }
    } catch (err) {
      console.error('Failed to load project from localStorage:', err);
    }
  }, []);
  
  // Handle URL hash changes to switch tabs
  useEffect(() => {
    if (location.hash === '#history') {
      setActiveTab('history');
      if (project?.id) {
        fetchHistoryList();
      }
    } else if (location.hash === '#testing' || !location.hash) {
      setActiveTab('testing');
      setHistoryReport(null);
      setSelectedHistoryId(null);
    }
  }, [location.hash, project?.id]);
  
  // Fetch history list
  const fetchHistoryList = async () => {
    if (!project?.id) return;
    
    setHistoryLoading(true);
    try {
      const data = await smokeApi.getProjectSmokeTests(project.id);
      // Handle both array response and object with array property
      const historyArray = Array.isArray(data) 
        ? data 
        : (Array.isArray(data?.smoke_tests) ? data.smoke_tests : (Array.isArray(data?.data) ? data.data : []));
      setHistoryList(historyArray);
    } catch (err) {
      console.error('Failed to load history list:', err);
      setHistoryList([]);
    } finally {
      setHistoryLoading(false);
    }
  };
  
  // Load historical report
  const handleLoadHistory = (smokeTest) => {
    // Toggle: if clicking the same test, close it
    const testId = smokeTest.id || smokeTest._id;
    if (selectedHistoryId === testId && historyReport) {
      setHistoryReport(null);
      setSelectedHistoryId(null);
      return;
    }
    
    // Load the report from the smoke test - construct report from smoke test data
    // Smoke test has: total_tests, passed, failed, skipped, duration, exit_code, test_results
    if (smokeTest.test_results || smokeTest.total_tests !== undefined) {
      // Construct report object from smoke test data to match the format used in current report
      // The test_results field is a Dict[str, Any] that may contain execution_logs, json_report, etc.
      const testResults = smokeTest.test_results || {};
      
      const reportData = {
        total_tests: smokeTest.total_tests || 0,
        total: smokeTest.total_tests || 0,
        passed: smokeTest.passed || 0,
        failed: smokeTest.failed || 0,
        skipped: smokeTest.skipped || 0,
        duration: smokeTest.duration || "0s",
        exit_code: smokeTest.exit_code || 0,
        test_results: testResults,
        // Extract execution_logs from test_results or from root level
        execution_logs: testResults.execution_logs || testResults.logs || smokeTest.execution_logs || null,
        // Extract json_report from test_results - it may have a summary field
        json_report: testResults.json_report || (testResults.summary ? { summary: testResults.summary } : testResults) || null
      };
      setHistoryReport(reportData);
      setSelectedHistoryId(testId);
    } else {
      setHistoryReport(null);
      setSelectedHistoryId(null);
    }
  };
  
  // Switch to history tab
  const handleHistoryTabClick = () => {
    setActiveTab('history');
    window.location.hash = '#history';
    fetchHistoryList();
  };
  
  // Fetch history when project is loaded and history tab is active
  useEffect(() => {
    if (activeTab === 'history' && project?.id) {
      fetchHistoryList();
    }
  }, [activeTab, project?.id]);

  // Generate Smoke Tests
  const handleGenerateTests = async (e) => {
    e.preventDefault();
    if (!testCasesFile) {
      setGenerateError("Please select a test cases file.");
      toast.error("Please select a test cases file.");
      return;
    }
    if (!projectUrl) {
      setGenerateError("Please enter a project URL.");
      toast.error("Please enter a project URL.");
      return;
    }
    setIsGenerating(true);
    setGenerateError("");
    setHistoryReport(null); // Clear history result when generating new
    setActiveTab('testing'); // Switch back to testing tab
    
    try {
      // Get project ID from localStorage
      const proj = JSON.parse(localStorage.getItem('project') || 'null');
      const projectId = proj?.id;
      
      if (!projectId) {
        setGenerateError('Project ID not found in localStorage. Please select a project first.');
        setIsGenerating(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", testCasesFile);
      formData.append("project_url", projectUrl);
      formData.append("project_id", projectId);
      
      const res = await axios.post(`${API_BASE}/generate_smoke_tests`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      let scriptRaw = res.data.script || "";
      scriptRaw = scriptRaw
        .replace(/^\s*```python\s*/i, "")
        .replace(/```\s*$/i, "")
        .replace(/^\s*python\s*[\r\n]+/i, "");
      
      setGeneratedScript(scriptRaw);
      setGeneratedTestCases(res.data.test_cases || []);
      
      const createdId = res.data.createdSmokeTestId || "";
      if (createdId) {
        createdSmokeIdRef.current = createdId;
        try { 
          localStorage.setItem('last_smoke_id', createdId); 
        } catch (_) {}
      }
      
      toast.success("Test script generated successfully!");
    } catch (err) {
      const msg = err.response?.data?.detail?.[0]?.msg ||
        err.response?.data?.message ||
        "Failed to generate smoke tests";
      setGenerateError(msg);
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Run Docker Tests
  const handleRunDocker = async () => {
    try {
      setIsRunning(true);
      const resp = await fetch(`${API_BASE}/run_smoke_docker_tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_script: generatedScript,
          project_url: projectUrl,
          smoke_test_id: (createdSmokeIdRef.current || localStorage.getItem('last_smoke_id') || ''),
        })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Docker run failed');
      setReport(data?.result || {});
      toast.success('Tests executed successfully!');
    } catch (e) {
      toast.error(e.message || 'Execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  // Download Script
  const downloadScript = () => {
    const blob = new Blob([generatedScript], { type: "text/plain" });
    saveAs(blob, "smoke_test_script.py");
    toast.success('Script downloaded!');
  };

  // Download functions for report
  const downloadJSON = (reportData) => {
    if (!reportData) return;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2)));
    element.setAttribute('download', `smoke-test-report-${new Date().toISOString().split('T')[0]}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Report downloaded!');
  };

  const downloadMarkdown = (reportData) => {
    if (!reportData) return;
    
    // Create markdown report from report data
    let markdown = `# Smoke Test Report\n\n`;
    markdown += `**Test Run Date:** ${new Date().toLocaleString()}\n\n`;
    
    if (reportData.total_tests !== undefined) {
      markdown += `## Test Summary\n\n`;
      markdown += `- **Total Tests:** ${reportData.total_tests}\n`;
      markdown += `- **Passed:** ${reportData.passed || 0}\n`;
      markdown += `- **Failed:** ${reportData.failed || 0}\n`;
      markdown += `- **Skipped:** ${reportData.skipped || 0}\n\n`;
    }
    
    if (reportData.duration) {
      markdown += `**Duration:** ${reportData.duration}\n\n`;
    }
    
    if (reportData.execution_logs) {
      markdown += `## Execution Logs\n\n`;
      markdown += `\`\`\`\n${reportData.execution_logs}\n\`\`\`\n`;
    }
    
    if (reportData.json_report) {
      markdown += `## Detailed Test Results\n\n`;
      markdown += `\`\`\`json\n${JSON.stringify(reportData.json_report, null, 2)}\n\`\`\`\n`;
    }
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smoke-test-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Report downloaded!');
  };

  // Use historyReport or current report based on active tab
  const displayReport = activeTab === 'history' ? (historyReport || null) : report;

  // Prepare chart data for display
  const totalTests = displayReport?.total_tests || displayReport?.total || 0;
  const passedTests = displayReport?.passed || 0;
  const failedTests = displayReport?.failed || 0;
  const skippedTests = totalTests - passedTests - failedTests;

  const passFailData = [
    { name: "Passed", value: passedTests, fill: "#10b981" },
    { name: "Failed", value: failedTests, fill: "#ef4444" },
    ...(skippedTests > 0 ? [{ name: "Skipped", value: skippedTests, fill: "#f59e0b" }] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-900 text-gray-900 dark:text-white p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-300 font-semibold transition-all"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <div className="text-orange-700 dark:text-orange-300 w-24 h-24 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
              <i className="fas fa-fire text-4xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Smoke Testing
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                AI-powered smoke test generation for deployed applications
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 bg-transparent rounded-t-xl overflow-hidden">
          <div className="flex border-b-2 border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setActiveTab('testing');
                setHistoryReport(null);
                setSelectedHistoryId(null);
                window.location.hash = '#testing';
              }}
              className={`px-6 py-3 font-semibold text-sm transition-all ${
                activeTab === 'testing'
                  ? 'bg-transparent text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                  : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              SMOKE TESTING
            </button>
            <button
              onClick={handleHistoryTabClick}
              className={`px-6 py-3 font-semibold text-sm transition-all ${
                activeTab === 'history'
                  ? 'bg-transparent text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                  : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              AGENT HISTORY
            </button>
          </div>
        </div>

        {/* SMOKE TESTING Tab Content */}
        {activeTab === 'testing' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration Panel */}
            <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <i className="fas fa-cog text-orange-600 dark:text-orange-400"></i>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Test Configuration
                </h2>
              </div>

              <form onSubmit={handleGenerateTests} className="space-y-6">
                {/* Project URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Project URL (Deployed) <span className="text-rose-500 dark:text-rose-400">*</span>
                  </label>
                  <input
                    type="url"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    placeholder="https://your-deployed-app.com"
                    required
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {/* Test Cases File */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Test Cases File <span className="text-rose-500 dark:text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => setTestCasesFile(e.target.files[0])}
                      accept=".csv,.xlsx"
                      required
                      id="testcases-upload"
                      className="hidden"
                    />
                    <label
                      htmlFor="testcases-upload"
                      className="block w-full bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-500 dark:hover:border-orange-500 rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-900/70"
                    >
                      <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2 block"></i>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {testCasesFile ? testCasesFile.name : 'Click to upload test cases'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">CSV, XLSX (Max 10MB)</p>
                    </label>
                  </div>
                  {testCasesFile && (
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        <i className="fas fa-check-circle mr-1"></i>
                        File selected
                      </span>
                      <button
                        type="button"
                        onClick={() => setTestCasesFile(null)}
                        className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold"
                      >
                        <i className="fas fa-times mr-1"></i>Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* Error Display */}
                {generateError && (
                  <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-300 dark:border-rose-500 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <i className="fas fa-exclamation-triangle text-rose-600 dark:text-rose-400"></i>
                      <div>
                        <h4 className="font-bold text-rose-800 dark:text-rose-300">Error</h4>
                        <p className="text-sm text-rose-700 dark:text-rose-200 mt-1">{generateError}</p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Generated Script Display */}
            {generatedScript && (
              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <i className="fab fa-python text-blue-600 dark:text-blue-400 text-2xl"></i>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generated Python Script</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedScript);
                        toast.success('Copied to clipboard!');
                      }}
                      className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all text-sm font-semibold"
                    >
                      <i className="fas fa-copy"></i>
                      Copy
                    </button>
                    <button
                      onClick={downloadScript}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-semibold"
                    >
                      <i className="fas fa-download"></i>
                      Download
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 overflow-x-auto max-h-96 border border-gray-200 dark:border-gray-700">
                  <Highlight code={generatedScript} language="python" theme={themes.vsDark}>
                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                      <pre className={className} style={{ ...style, background: 'transparent' }}>
                        {tokens.map((line, i) => (
                          <div key={i} {...getLineProps({ line, key: i })}>
                            {line.map((token, key) => (
                              <span key={key} {...getTokenProps({ token, key })} />
                            ))}
                          </div>
                        ))}
                      </pre>
                    )}
                  </Highlight>
                </div>
              </div>
            )}

            {/* Test Cases Table */}
            {generatedTestCases.length > 0 && (
              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  <i className="fas fa-table text-orange-600 dark:text-orange-400 mr-2"></i>
                  Generated Test Cases
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-800">
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Scenario</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Expected Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedTestCases.map((tc, i) => (
                        <tr key={i} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-300">{tc.Scenario}</td>
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-300">{tc['Scenario Description']}</td>
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-300">{tc['Expected Result']}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Actions & Results Panel */}
          <div className="space-y-6">
            {/* Actions Card */}
            <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
              <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Actions</h2>
              
              {/* Generate Button */}
              <button
                onClick={handleGenerateTests}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-600 hover:from-orange-500 hover:to-orange-500 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-semibold shadow-lg disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mb-3"
              >
                <i className={`fas ${isGenerating ? 'fa-spinner fa-spin' : 'fa-magic'}`}></i>
                {isGenerating ? 'Generating...' : 'Generate Tests'}
              </button>

              {/* Run Docker Button */}
              {generatedScript && (
                <button
                  onClick={handleRunDocker}
                  disabled={isRunning}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-semibold shadow-lg disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <i className={`fas ${isRunning ? 'fa-spinner fa-spin' : 'fa-play'}`}></i>
                  {isRunning ? 'Running...' : 'Run in Docker'}
                </button>
              )}

              {!generatedScript && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  <i className="fas fa-info-circle mr-1"></i>
                  Generate tests to enable execution
                </p>
              )}
            </div>

            {/* Quick Tips */}
            <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <i className="fas fa-lightbulb text-yellow-500 dark:text-yellow-400"></i>
                <h3 className="font-bold text-gray-900 dark:text-white">Quick Tips</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <i className="fas fa-check text-emerald-600 dark:text-emerald-400 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-300">Auto Generation</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">AI creates Python test scripts from your test cases</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <i className="fab fa-docker text-blue-600 dark:text-blue-400 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-300">Docker Execution</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Run tests in isolated containers</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <i className="fas fa-download text-purple-600 dark:text-purple-400 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-300">Export Ready</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Download scripts and detailed reports</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Results */}
            {report && (
              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  <i className="fas fa-chart-bar text-green-600 dark:text-green-400 mr-2"></i>
                  Test Results
                </h3>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Tests</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Number(report.total_tests || report.total || 0)}
                    </p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">Passed</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {Number(report.passed || 0)}
                    </p>
                  </div>
                  <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-rose-700 dark:text-rose-400 mb-1">Failed</p>
                    <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                      {Number(report.failed || 0)}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">Duration</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {report.duration || "0s"}
                    </p>
                  </div>
                </div>

                {/* Pass/Fail Pie Chart */}
                {passFailData.length > 0 && passFailData.some(d => d.value > 0) && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Test Results Distribution</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={passFailData.filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {passFailData.filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '8px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Additional Details */}
                {report.json_report?.summary && (
                  <div className="pt-4 mb-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Exit Code:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {Number(report.exit_code || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Collected:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {Number(report.json_report.summary.collected || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Execution Logs */}
                {report.execution_logs && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400">
                      <i className="fas fa-terminal mr-2"></i>
                      View Execution Logs
                    </summary>
                    <pre className="mt-3 max-h-48 overflow-auto text-xs bg-gray-100 dark:bg-gray-900/50 p-3 rounded border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                      {report.execution_logs}
                    </pre>
                  </details>
                )}

                {/* Download Section */}
                <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Export Test Report</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Download in your preferred format</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => downloadJSON(report)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all shadow-md"
                      >
                        <i className="fas fa-code"></i>
                        JSON
                      </button>
                      <button
                        onClick={() => downloadMarkdown(report)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-all shadow-md"
                      >
                        <i className="fas fa-file-alt"></i>
                        Markdown
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* AGENT HISTORY Tab Content */}
        {activeTab === 'history' && (
          <div className="mt-6">
            {historyReport ? (
              // Show report in full screen when selected
              <div className="space-y-6">
                {/* Viewing Historical Result Banner */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-4 text-white shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-history text-2xl"></i>
                      <div>
                        <h2 className="text-lg font-bold">Viewing Historical Result</h2>
                        <p className="text-sm text-white/90">
                          {selectedHistoryId ? `Smoke Test ID: ${selectedHistoryId}` : 'Historical Test Run'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setHistoryReport(null);
                        setSelectedHistoryId(null);
                      }}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-sm font-medium"
                    >
                      <i className="fas fa-times mr-2"></i>
                      Close Report
                    </button>
                  </div>
                </div>

                {/* Download Section */}
                <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Export Test Report</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Download in your preferred format</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => downloadJSON(historyReport)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all shadow-md"
                      >
                        <i className="fas fa-code"></i>
                        JSON
                      </button>
                      <button
                        onClick={() => downloadMarkdown(historyReport)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-all shadow-md"
                      >
                        <i className="fas fa-file-alt"></i>
                        Markdown
                      </button>
                    </div>
                  </div>
                </div>

                {/* Historical Report Display - Full Screen */}
                {(() => {
                  // Prepare chart data for history report
                  const historyTotalTests = historyReport?.total_tests || historyReport?.total || 0;
                  const historyPassedTests = historyReport?.passed || 0;
                  const historyFailedTests = historyReport?.failed || 0;
                  const historySkippedTests = historyTotalTests - historyPassedTests - historyFailedTests;

                  const historyPassFailData = [
                    { name: "Passed", value: historyPassedTests, fill: "#10b981" },
                    { name: "Failed", value: historyFailedTests, fill: "#ef4444" },
                    ...(historySkippedTests > 0 ? [{ name: "Skipped", value: historySkippedTests, fill: "#f59e0b" }] : [])
                  ];

                  return (
                    <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        <i className="fas fa-chart-bar text-green-600 dark:text-green-400 mr-2"></i>
                        Test Results
                      </h3>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Tests</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {Number(historyTotalTests)}
                          </p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">Passed</p>
                          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {Number(historyPassedTests)}
                          </p>
                        </div>
                        <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-3 text-center">
                          <p className="text-xs text-rose-700 dark:text-rose-400 mb-1">Failed</p>
                          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                            {Number(historyFailedTests)}
                          </p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                          <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">Duration</p>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {historyReport?.duration || "0s"}
                          </p>
                        </div>
                      </div>

                      {/* Pass/Fail Pie Chart */}
                      {historyPassFailData.length > 0 && historyPassFailData.some(d => d.value > 0) && (
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Test Results Distribution</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={historyPassFailData.filter(d => d.value > 0)}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={70}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {historyPassFailData.filter(d => d.value > 0).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '8px' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* Additional Details */}
                      {historyReport?.json_report?.summary && (
                        <div className="pt-4 mb-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Exit Code:</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {Number(historyReport.exit_code || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Collected:</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {Number(historyReport.json_report.summary.collected || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Execution Logs */}
                      {historyReport?.execution_logs && (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400">
                            <i className="fas fa-terminal mr-2"></i>
                            View Execution Logs
                          </summary>
                          <pre className="mt-3 max-h-48 overflow-auto text-xs bg-gray-100 dark:bg-gray-900/50 p-3 rounded border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                            {historyReport.execution_logs}
                          </pre>
                        </details>
                      )}

                    </div>
                  )
                })()}
              </div>
            ) : (
              // Show history list when no report is selected
              <div className="space-y-6">
                {historyLoading ? (
                  <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-10 border border-gray-200 dark:border-gray-700/50 shadow-lg flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
                    <h2 className="text-xl font-bold mt-6">Loading History...</h2>
                  </div>
                ) : historyList.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <i className="fas fa-inbox text-6xl text-gray-400 dark:text-gray-600 mb-4"></i>
                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">No history found</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Run smoke tests to see them here
                    </p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Previous Test Runs</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {historyList.map((smokeTest, idx) => {
                        const testId = smokeTest.id || smokeTest._id;
                        const createdDate = smokeTest.created_at 
                          ? new Date(smokeTest.created_at).toLocaleString()
                          : 'N/A';
                        // Check if smoke test has been executed (has test_results or total_tests)
                        const hasReport = !!(smokeTest.test_results || smokeTest.total_tests !== undefined);
                        const isSelected = selectedHistoryId === testId && historyReport;
                        
                        return (
                          <button
                            key={testId || idx}
                            onClick={() => handleLoadHistory(smokeTest)}
                            disabled={!hasReport}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                              isSelected
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                                : hasReport
                                ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-indigo-300 dark:hover:border-indigo-700'
                                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                  <i className="fas fa-fire text-orange-600 dark:text-orange-400"></i>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    Smoke Test #{idx + 1}
                                  </h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{createdDate}</p>
                                </div>
                                {hasReport && (
                                  <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
                                    Has Report
                                  </span>
                                )}
                              </div>
                              {hasReport && (
                                <i className={`fas fa-chevron-right text-gray-400 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : ''}`}></i>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default SmokeTesting;
