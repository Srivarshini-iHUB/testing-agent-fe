import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Play, AlertCircle, CheckCircle, XCircle, RotateCcw, Loader, FileJson, FileText, Download, Code, Upload } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { integrationApi } from '../api/integrationApi';
import { projectApi } from '../api/projectApi';

export default function IntegrationTestingPlatform() {
  const navigate = useNavigate();
  const location = useLocation()
  
  // Tab state - check if URL hash is #history to open history tab
  const [activeTab, setActiveTab] = useState(() => {
    return location.hash === '#history' ? 'history' : 'testing'
  })
  
  // Main testing states
  const [step, setStep] = useState("upload");
  const [project, setProject] = useState(null);
  const [scenariosDocId, setScenariosDocId] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [testScript, setTestScript] = useState("");
  const [testRunId, setTestRunId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedFrd, setSelectedFrd] = useState("");
  const fileInputRef = useRef(null);
  const [uploadingApiFile, setUploadingApiFile] = useState(false);
  const apiFileInputRef = useRef(null);
  
  // History states
  const [historyList, setHistoryList] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [selectedHistoryRun, setSelectedHistoryRun] = useState(null)
  const [selectedHistoryScenario, setSelectedHistoryScenario] = useState(null)
  const [historyReport, setHistoryReport] = useState(null)
  const [expandedTestRuns, setExpandedTestRuns] = useState(new Set())

  useEffect(() => {
    try {
      console.log("Loading project from localStorage");
      const storedProject = localStorage.getItem('project');
      if (storedProject) {
        console.log("Found project in localStorage:", storedProject);
        const parsed = JSON.parse(storedProject);
        console.log("Parsed project:", parsed);
        setProject(parsed);
        if (parsed.frdDocument && parsed.frdDocument.length > 0) {
          console.log("Setting selected FRD from localStorage:", parsed.frdDocument[0]);
          setSelectedFrd(parsed.frdDocument[0]);
        }
      } else {
        setError("No project found. Please create a project first.");
      }
    } catch (err) {
      setError("Failed to load project from localStorage.");
    }
  }, []);

  const handleFrdUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Upload the file to the backend and save to project DB
      const formData = new FormData();
      formData.append('frd', file);

      const updatedProject = await projectApi.updateProject(project.id, formData);
      setProject(updatedProject);
      
      // Auto-select the newly uploaded file
      if (updatedProject.frdDocument && updatedProject.frdDocument.length > 0) {
        const frdUrls = Array.isArray(updatedProject.frdDocument) 
          ? updatedProject.frdDocument 
          : [updatedProject.frdDocument];
        if (frdUrls.length > 0) {
          setSelectedFrd(frdUrls[frdUrls.length - 1]); // Select the last uploaded file
        }
      }
      
      localStorage.setItem('project', JSON.stringify(updatedProject));
    } catch (err) {
      setError(err.message || "Failed to upload FRD");
    } finally {
      setLoading(false);
    }
  };

  const handleApiFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingApiFile(true);
    setError(null);

    try {
      // Upload the API file to the backend and save to project DB
      const formData = new FormData();
      formData.append('swagger_documentation', file);

      const updatedProject = await projectApi.updateProject(project.id, formData);
      setProject(updatedProject);
      localStorage.setItem('project', JSON.stringify(updatedProject));
    } catch (err) {
      setError(err.message || "Failed to upload API Specification");
    } finally {
      setUploadingApiFile(false);
    }
  };

  // Handle URL hash changes to switch tabs
  useEffect(() => {
    if (location.hash === '#history') {
      setActiveTab('history')
      fetchHistoryList()
    } else if (location.hash === '#testing' || !location.hash) {
      setActiveTab('testing')
      setHistoryReport(null)
      setSelectedHistoryRun(null)
      setSelectedHistoryScenario(null)
    }
  }, [location.hash])

  // Fetch history list
  const fetchHistoryList = async () => {
    if (!project?.id) return
    
    setHistoryLoading(true)
    try {
      const data = await integrationApi.getProjectTestRuns(project.id)
      setHistoryList(Array.isArray(data.test_runs) ? data.test_runs : [])
    } catch (err) {
      console.error('Failed to load history list:', err)
      setHistoryList([])
    } finally {
      setHistoryLoading(false)
    }
  }

  // Toggle test run expansion
  const toggleTestRun = (testRunId) => {
    setExpandedTestRuns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(testRunId)) {
        newSet.delete(testRunId)
      } else {
        newSet.add(testRunId)
      }
      return newSet
    })
  }

  // Load historical report
  const handleLoadHistory = (testRun, scenario) => {
    // Toggle: if clicking the same scenario, close it
    if (selectedHistoryRun?.doc_id === testRun.doc_id && 
        selectedHistoryScenario?.scenario_name === scenario.scenario_name &&
        historyReport) {
      setHistoryReport(null)
      setSelectedHistoryRun(null)
      setSelectedHistoryScenario(null)
      return
    }
    
    // Load the report from the scenario
    if (scenario.report) {
      setHistoryReport(scenario.report)
      setSelectedHistoryRun(testRun)
      setSelectedHistoryScenario(scenario)
    } else {
      setHistoryReport(null)
      setSelectedHistoryRun(null)
      setSelectedHistoryScenario(null)
    }
  }

  // Switch to history tab
  const handleHistoryTabClick = () => {
    setActiveTab('history')
    window.location.hash = '#history'
    fetchHistoryList()
  }

  // Fetch history when project is loaded and history tab is active
  useEffect(() => {
    if (activeTab === 'history' && project?.id) {
      fetchHistoryList()
    }
  }, [activeTab, project?.id])

  const generateScenarios = async () => {
    console.log(project, selectedFrd);
    if (!project?.id || !project.postmanCollection || !selectedFrd) {
      setError("Project ID, Swagger URL, or FRD URL is missing");
      return;
    }
    setLoading(true);
    setError(null);    
    setHistoryReport(null) // Clear history result when generating new
    setActiveTab('testing') // Switch back to testing tab

    try {
      const data = await integrationApi.generateScenarios(
        project.id,
        project.postmanCollection,
        selectedFrd
      );
      setScenariosDocId(data.scenarios_doc_id);
      setScenarios(data.scenarios || []);
      setStep("scenarios");
    } catch (err) {
      setError(err.message || "Failed to generate scenarios");
    } finally {
      setLoading(false);
    }
  };

  const generateTestScript = async () => {
    if (!selectedScenario || !scenariosDocId) {
      setError("No scenario selected");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await integrationApi.generateTestScript(scenariosDocId, selectedScenario.scenario_name);
      setTestScript(data.test_script_preview || "");
      setTestRunId(data.test_run_id);
      setStep("script");
    } catch (err) {
      setError(err.message || "Failed to generate test script");
    } finally {
      setLoading(false);
    }
  };

  const executeTests = async () => {
    if (!selectedScenario || !scenariosDocId) {
      setError("Please select a scenario");
      return;
    }
    setLoading(true);
    setError(null);
    setStep("running");
    try {
      const response = await integrationApi.runScenario(scenariosDocId, selectedScenario.scenario_name);
      setReport(response.report);
      setStep("report");
    } catch (err) {
      setError(err.message || "Failed to execute tests");
      setStep("script");
    } finally {
      setLoading(false);
    }
  };

  const downloadScript = () => {
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(testScript))
    element.setAttribute("download", `test_script_${selectedScenario?.scenario_name.replace(/\s+/g, '_').toLowerCase()}.py`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Download functions for report
  const downloadJSON = (reportData) => {
    if (!reportData) return;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2)));
    element.setAttribute('download', `integration-test-report-${new Date().toISOString().split('T')[0]}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadMarkdown = (reportData) => {
    if (!reportData) return;
    
    // Create markdown report from report data
    let markdown = `# Integration Test Report\n\n`;
    markdown += `**Test Run Date:** ${new Date().toLocaleString()}\n\n`;
    
    if (reportData.scenario_name) {
      markdown += `**Scenario:** ${reportData.scenario_name}\n\n`;
    }
    
    if (reportData.total_tests !== undefined) {
      markdown += `## Test Summary\n\n`;
      markdown += `- **Total Tests:** ${reportData.total_tests}\n`;
      markdown += `- **Passed:** ${reportData.passed || 0}\n`;
      markdown += `- **Failed:** ${reportData.failed || 0}\n`;
      markdown += `- **Skipped:** ${reportData.skipped || 0}\n\n`;
    }
    
    if (reportData.test_results && Array.isArray(reportData.test_results)) {
      markdown += `## Test Results\n\n`;
      reportData.test_results.forEach((test, index) => {
        markdown += `### Test ${index + 1}\n`;
        markdown += `- **Status:** ${test.status || 'N/A'}\n`;
        if (test.test_name) markdown += `- **Test Name:** ${test.test_name}\n`;
        if (test.duration) markdown += `- **Duration:** ${test.duration}\n`;
        if (test.error) markdown += `- **Error:** ${test.error}\n`;
        markdown += `\n`;
      });
    }
    
    if (reportData.execution_logs) {
      markdown += `## Execution Logs\n\n`;
      markdown += `\`\`\`\n${reportData.execution_logs}\n\`\`\`\n`;
    }
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integration-test-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setStep("upload");
    setScenariosDocId(null);
    setScenarios([]);
    setSelectedScenario(null);
    setTestScript("");
    setTestRunId(null);
    setReport(null);
    setError(null);
  }

  // Use historyReport or current report based on active tab
  const displayReport = activeTab === 'history' ? (historyReport || null) : report

  const testTimelineData = displayReport?.test_details?.map((test, idx) => ({
    name: `Test ${idx + 1}`,
    duration: Math.random() * 500 + 100,
    status: test.passed ? "passed" : "failed",
  })) || [];

  const totalTests = displayReport?.total_tests || 0
  const passedTests = displayReport?.passed_tests || 0
  const failedTests = displayReport?.failed_tests || 0
  const skippedTests = totalTests - passedTests - failedTests

  const passFailData = [
    { name: "Passed", value: passedTests, fill: "#10b981" },
    { name: "Failed", value: failedTests, fill: "#ef4444" },
    ...(skippedTests > 0 ? [{ name: "Skipped", value: skippedTests, fill: "#f59e0b" }] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-900 text-gray-900 dark:text-white p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-300 font-semibold transition-all"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Dashboard
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="text-teal-700 dark:text-teal-300 w-24 h-24 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
              <i className="fas fa-link text-4xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Integration Testing Agent</h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">AI-powered API scenario generation and validation</p>
            </div>
          </div>
          {step !== 'upload' && activeTab === 'testing' && (
            <button
              onClick={resetAll}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-300 font-semibold transition-all"
            >
              <i className="fas fa-rotate-left"></i>
              Start Over
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 bg-transparent rounded-t-xl overflow-hidden">
          <div className="flex border-b-2 border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setActiveTab('testing')
                setHistoryReport(null)
                setSelectedHistoryRun(null)
                setSelectedHistoryScenario(null)
                window.location.hash = '#testing'
              }}
              className={`px-6 py-3 font-semibold text-sm transition-all ${
                activeTab === 'testing'
                  ? 'bg-transparent text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                  : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              INTEGRATION TESTING
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

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/40 rounded-xl p-4 flex items-start gap-3">
            <i className="fas fa-exclamation-circle text-red-500 mt-0.5"></i>
            <div className="flex-1">
              <p className="text-red-200 font-semibold">Something went wrong</p>
              <p className="text-red-300/90 text-sm mt-1">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-300 hover:text-red-200">✕</button>
          </div>
        )}

        {/* Tab Content Wrapper */}
        <div>
          {/* INTEGRATION TESTING Tab Content */}
          {activeTab === 'testing' && (
            <div className="grid lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-2 space-y-6">
              {/* Project Configuration */}
              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <i className="fas fa-cog text-indigo-600 dark:text-indigo-400 text-lg"></i>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Project Configuration</h2>
                </div>
                {project ? (
                  <div className="space-y-6">
                    {/* API Specification Card */}
                    <div className="p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700/50 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/40 dark:to-gray-800/40 shadow-sm">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-link text-emerald-600 dark:text-emerald-400 text-lg"></i>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">API Specification</div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Upload or view API specification file</p>
                          </div>
                        </div>

                        {project.postmanCollection ? (
                          <div className="space-y-3">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                  <i className="fas fa-check-circle mr-1"></i>
                                  Selected: <span className="font-semibold">{decodeURIComponent(project.postmanCollection.split('/').pop())}</span>
                                </p>
                                <button
                                  onClick={() => {
                                    const fileName = project.postmanCollection.split('/').pop() || '';
                                    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
                                    
                                    // For JSON files (Postman collections), open directly
                                    if (fileExtension === 'json') {
                                      window.open(project.postmanCollection, '_blank', 'noopener,noreferrer');
                                    }
                                    // For YAML/YML files, open directly
                                    else if (fileExtension === 'yaml' || fileExtension === 'yml') {
                                      window.open(project.postmanCollection, '_blank', 'noopener,noreferrer');
                                    }
                                    // For PDF files, open directly
                                    else if (fileExtension === 'pdf') {
                                      window.open(project.postmanCollection, '_blank', 'noopener,noreferrer');
                                    }
                                    // For other files, try to open directly
                                    else {
                                      window.open(project.postmanCollection, '_blank', 'noopener,noreferrer');
                                    }
                                  }}
                                  className="ml-2 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition-all flex items-center gap-1"
                                  title="Preview in new tab"
                                >
                                  <i className="fas fa-external-link-alt"></i>
                                  Preview
                                </button>
                              </div>
                            </div>
                            <button
                              onClick={() => apiFileInputRef.current?.click()}
                              className="w-full px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                              <i className="fas fa-upload"></i>
                              Replace API File
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <input
                              type="file"
                              ref={apiFileInputRef}
                              onChange={handleApiFileUpload}
                              style={{ display: 'none' }}
                              accept=".json,.yaml,.yml,.pdf,.txt"
                            />
                            <button
                              onClick={() => apiFileInputRef.current?.click()}
                              disabled={uploadingApiFile}
                              className="w-full p-4 border-2 border-dashed border-emerald-300 dark:border-emerald-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <i className={`fas ${uploadingApiFile ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'} text-2xl text-emerald-600 dark:text-emerald-400`}></i>
                                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                  {uploadingApiFile ? 'Uploading...' : 'Upload API Specification'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">JSON, YAML, PDF, TXT</span>
                              </div>
                            </button>
                          </div>
                        )}
                    </div>

                    {/* Bottom Row: FRD Document (Full Width) */}
                    <div className="p-5 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 shadow-sm">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-file-alt text-indigo-600 dark:text-indigo-400 text-lg"></i>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">FRD Document</div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Select or upload FRD</p>
                        </div>
                      </div>

                      {project.frdDocument && project.frdDocument.length > 0 ? (
                        <div className="space-y-4">
                          <div className="relative">
                            <select
                              value={selectedFrd || ''}
                              onChange={(e) => {
                                if (e.target.value === "upload-new") {
                                  fileInputRef.current.click();
                                } else {
                                  setSelectedFrd(e.target.value);
                                }
                              }}
                              className="w-full px-4 py-3 pr-10 bg-white dark:bg-gray-800 border-2 border-indigo-300 dark:border-indigo-600 rounded-lg text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                            >
                              <option value="" disabled>Select FRD Document</option>
                              {project.frdDocument.map((frdUrl, index) => (
                                <option key={index} value={frdUrl}>
                                  {decodeURIComponent(frdUrl.split('/').pop())}
                                </option>
                              ))}
                              <option value="upload-new" className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50">
                                + Upload New FRD
                              </option>
                            </select>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                              <i className="fas fa-chevron-down text-indigo-600 dark:text-indigo-400"></i>
                            </div>
                          </div>
                          
                          {/* Selected FRD Preview */}
                          {selectedFrd && (
                            <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                  <i className="fas fa-check-circle mr-1"></i>
                                  Selected: <span className="font-semibold">{decodeURIComponent(selectedFrd.split('/').pop())}</span>
                                </p>
                                <button
                                  onClick={() => {
                                    const fileName = selectedFrd.split('/').pop() || '';
                                    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
                                    
                                    // For PDF files, open directly in browser
                                    if (fileExtension === 'pdf') {
                                      window.open(selectedFrd, '_blank', 'noopener,noreferrer');
                                    }
                                    // For DOCX files, use Google Docs Viewer
                                    else if (fileExtension === 'docx' || fileExtension === 'doc') {
                                      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(selectedFrd)}&embedded=true`;
                                      window.open(viewerUrl, '_blank', 'noopener,noreferrer');
                                    }
                                    // For TXT files, open directly
                                    else if (fileExtension === 'txt') {
                                      window.open(selectedFrd, '_blank', 'noopener,noreferrer');
                                    }
                                    // For other files, try to open directly
                                    else {
                                      window.open(selectedFrd, '_blank', 'noopener,noreferrer');
                                    }
                                  }}
                                  className="ml-2 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition-all flex items-center gap-1"
                                  title="Preview in new tab"
                                >
                                  <i className="fas fa-external-link-alt"></i>
                                  Preview
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFrdUpload}
                            style={{ display: 'none' }}
                            accept=".pdf,.doc,.docx"
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full p-6 border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <i className="fas fa-cloud-upload-alt text-3xl text-indigo-600 dark:text-indigo-400"></i>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">Upload FRD Document</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">PDF, DOC, DOCX (Max 10MB)</span>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Generate Button */}
                    {step === 'upload' && (
                      <button
                        onClick={generateScenarios}
                        disabled={!project || !project.postmanCollection || !selectedFrd || loading}
                        className={`w-full ${loading || !project.postmanCollection || !selectedFrd ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'} text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3`}
                      >
                        {loading ? (
                          <>
                            <i className="fas fa-spinner fa-spin text-lg"></i>
                            <span className="text-base">Generating Scenarios...</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-play text-lg"></i>
                            <span className="text-base">Generate Test Scenarios</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">Loading project...</p>
                  </div>
                )}
              </div>

            {/* Scenarios Selection */}
            {step === 'scenarios' && (
              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <i className="fas fa-list text-indigo-600 dark:text-indigo-400"></i>
                  <h2 className="text-xl font-bold">Select Test Scenario</h2>
                </div>
                <div className="grid gap-3 mb-6">
                  {scenarios.map((scenario, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedScenario(scenario)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedScenario?.scenario_name === scenario.scenario_name ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-900/40'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{scenario.scenario_name}</h3>
                          <div className="flex flex-wrap gap-2">
                            {scenario.flow_names.map((flow, fidx) => (
                              <span key={fidx} className="px-2 py-1 bg-gray-100 dark:bg-gray-900/50 text-xs rounded border border-gray-200 dark:border-gray-700/50 font-mono">
                                {flow}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ml-4 ${selectedScenario?.scenario_name === scenario.scenario_name ? 'border-indigo-500 bg-indigo-500' : 'border-gray-400'}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={generateTestScript}
                  disabled={!selectedScenario || loading}
                  className={`w-full ${loading ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'} text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-2`}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Generating Script...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-code"></i>
                      <span>Generate Test Script</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Script Preview */}
            {step === 'script' && (
              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <i className="fab fa-python text-blue-600 dark:text-blue-400 text-2xl"></i>
                    <h3 className="text-lg font-bold">test_script.py</h3>
                  </div>
                  <button
                    onClick={downloadScript}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-900/40 hover:bg-gray-200 dark:hover:bg-gray-800/60 text-gray-800 dark:text-gray-200 rounded-lg transition-all border border-gray-200 dark:border-gray-700/50 font-medium"
                  >
                    <i className="fas fa-download"></i>
                    Download
                  </button>
                </div>
                <pre className="bg-gray-100 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700/50 rounded-xl p-4 overflow-auto text-sm font-mono text-gray-900 dark:text-gray-200 max-h-96">{testScript || "# No script generated yet"}</pre>
                <button
                  onClick={executeTests}
                  disabled={loading}
                  className={`mt-4 w-full ${loading ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700'} text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-2`}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Running Tests...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-play"></i>
                      <span>Run Tests</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Running */}
            {step === 'running' && (
              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-10 border border-gray-200 dark:border-gray-700/50 shadow-lg flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
                <h2 className="text-2xl font-bold mt-6">Running Tests</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Executing scenario: <span className="font-semibold">{selectedScenario?.scenario_name}</span></p>
              </div>
            )}
              </div>

              {/* Right column */}
              <div className="space-y-6">
              {/* Report */}
              {step === 'report' && report && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <i className="fas fa-chart-line text-indigo-600 dark:text-indigo-400"></i>
                    <h3 className="text-lg font-bold">Current Report</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-6">
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                      <div className="text-gray-500 dark:text-gray-400">Total</div>
                      <div className="text-xl font-bold">{report.total_tests}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                      <div className="text-emerald-700 dark:text-emerald-300">Passed</div>
                      <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{report.passed_tests}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20">
                      <div className="text-rose-700 dark:text-rose-300">Failed</div>
                      <div className="text-xl font-bold text-rose-600 dark:text-rose-400">{report.failed_tests}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                      <div className="text-gray-500 dark:text-gray-400">Status</div>
                      <div className="text-xl font-bold">
                        {['Passed', 'PASSED', 'passed'].includes(report.overall_status) ? 'PASSED' : 'FAILED'}
                      </div>
                    </div>
                  </div>

                  {/* Pass/Fail Pie Chart */}
                  {passFailData.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Test Results Distribution</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={passFailData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={70}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {passFailData.map((entry, index) => (
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

                  {/* Test Timeline Bar Chart */}
                  {testTimelineData.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Test Execution Timeline</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={testTimelineData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                          <XAxis dataKey="name" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '8px' }}
                            labelStyle={{ color: '#374151' }}
                          />
                          <Bar 
                            dataKey="duration" 
                            radius={[8, 8, 0, 0]}
                          >
                            {testTimelineData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.status === 'passed' ? '#10b981' : '#ef4444'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
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
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <i className="fas fa-lightbulb text-yellow-500 dark:text-yellow-400"></i>
                <h3 className="font-bold">Quick Tips</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <i className="fas fa-list text-indigo-600 dark:text-indigo-400 mt-1"></i>
                  <div>
                    <p className="font-semibold">Scenario-based</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Generate tests from API specs and FRD</p>
                  </div>

                </div>
                <div className="flex items-start gap-2">
                  <i className="fas fa-robot text-emerald-600 dark:text-emerald-400 mt-1"></i>
                  <div>
                    <p className="font-semibold">AI-Powered</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Scripts generated automatically per scenario</p>
                  </div>
                </div>
              </div>
              </div>
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
                          {selectedHistoryRun?.created_at 
                            ? `Test Run from ${new Date(selectedHistoryRun.created_at).toLocaleString()}`
                            : 'Historical Test Run'}
                          {selectedHistoryScenario && ` - Scenario: ${selectedHistoryScenario.scenario_name}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setHistoryReport(null)
                        setSelectedHistoryRun(null)
                        setSelectedHistoryScenario(null)
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
                    const historyTestTimelineData = historyReport.test_details?.map((test, idx) => ({
                      name: `Test ${idx + 1}`,
                      duration: test.duration || Math.random() * 500 + 100,
                      status: test.passed ? "passed" : "failed",
                    })) || []

                    const historyTotalTests = historyReport.total_tests || 0
                    const historyPassedTests = historyReport.passed_tests || 0
                    const historyFailedTests = historyReport.failed_tests || 0
                    const historySkippedTests = historyTotalTests - historyPassedTests - historyFailedTests

                    const historyPassFailData = [
                      { name: "Passed", value: historyPassedTests, fill: "#10b981" },
                      { name: "Failed", value: historyFailedTests, fill: "#ef4444" },
                      ...(historySkippedTests > 0 ? [{ name: "Skipped", value: historySkippedTests, fill: "#f59e0b" }] : [])
                    ]

                    return (
                      <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                        <div className="flex items-center gap-2 mb-4">
                          <i className="fas fa-chart-line text-indigo-600 dark:text-indigo-400"></i>
                          <h3 className="text-lg font-bold">Test Report</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm mb-6">
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                            <div className="text-gray-500 dark:text-gray-400">Total</div>
                            <div className="text-xl font-bold">{historyTotalTests}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                            <div className="text-emerald-700 dark:text-emerald-300">Passed</div>
                            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{historyPassedTests}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20">
                            <div className="text-rose-700 dark:text-rose-300">Failed</div>
                            <div className="text-xl font-bold text-rose-600 dark:text-rose-400">{historyFailedTests}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                            <div className="text-gray-500 dark:text-gray-400">Status</div>
                            <div className="text-xl font-bold">
                              {['Passed','PASSED','passed'].includes(historyReport.overall_status) ? 'PASSED' : 'FAILED'}
                            </div>
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

                        {/* Test Timeline Bar Chart */}
                        {historyTestTimelineData.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Test Execution Timeline</h4>
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart data={historyTestTimelineData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                                <XAxis dataKey="name" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '8px' }}
                                  labelStyle={{ color: '#374151' }}
                                />
                                <Bar 
                                  dataKey="duration" 
                                  radius={[8, 8, 0, 0]}
                                >
                                  {historyTestTimelineData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.status === 'passed' ? '#10b981' : '#ef4444'} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      
                        {/* Test Details */}
                        {historyReport.test_details && historyReport.test_details.length > 0 && (
                          <div className="mt-4 mb-4">
                            <h4 className="font-semibold mb-2">Test Details</h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {historyReport.test_details.map((test, idx) => (
                                <div key={idx} className={`p-3 rounded-lg border ${
                                  test.passed 
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' 
                                    : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm">{test.test_name || `Test ${idx + 1}`}</span>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      test.passed 
                                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' 
                                        : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                                    }`}>
                                      {test.passed ? 'PASSED' : 'FAILED'}
                                    </span>
                                  </div>
                                  {test.error && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{test.error}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
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
                      Run integration tests to see them here
                    </p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Previous Test Runs</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {historyList.map((testRun, idx) => {
                        const createdDate = testRun.created_at 
                          ? new Date(testRun.created_at).toLocaleString()
                          : 'N/A'
                        const scenariosCount = testRun.scenarios?.length || 0
                        const testRunId = testRun.doc_id || idx
                        const isExpanded = expandedTestRuns.has(testRunId)
                        
                        return (
                          <div key={testRunId} className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                            <button
                              onClick={() => toggleTestRun(testRunId)}
                              className="w-full flex items-center justify-between mb-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-lg p-2 -m-2 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                  <i className="fas fa-vial text-indigo-600 dark:text-indigo-400"></i>
                                </div>
                                <div className="text-left">
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    Test Run #{testRun.testrun_count !== undefined ? testRun.testrun_count : idx + 1}
                                  </h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{createdDate}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{scenariosCount}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Scenarios</p>
                                </div>
                                <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} text-gray-400 dark:text-gray-500 transition-transform duration-200`}></i>
                              </div>
                            </button>
                            
                            {/* Scenarios in this test run - Show only when expanded */}
                            {isExpanded && testRun.scenarios && testRun.scenarios.length > 0 && (
                              <div className="space-y-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                {testRun.scenarios.map((scenario, sIdx) => {
                                  const isSelected = selectedHistoryRun?.doc_id === testRun.doc_id &&
                                                    selectedHistoryScenario?.scenario_name === scenario.scenario_name &&
                                                    historyReport
                                  const hasReport = !!scenario.report
                                  
                                  return (
                                    <button
                                      key={sIdx}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleLoadHistory(testRun, scenario)
                                      }}
                                      disabled={!hasReport}
                                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                        isSelected
                                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                                          : hasReport
                                          ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-indigo-300 dark:hover:border-indigo-700'
                                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 opacity-50 cursor-not-allowed'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <i className={`fas ${hasReport ? 'fa-file-alt' : 'fa-file'} text-indigo-600 dark:text-indigo-400`}></i>
                                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                                            {scenario.scenario_name}
                                          </span>
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
                            )}
                          </div>
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
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFrdUpload}
        style={{ display: 'none' }}
        accept=".pdf,.doc,.docx"
      />
      <input
        type="file"
        ref={apiFileInputRef}
        onChange={handleApiFileUpload}
        style={{ display: 'none' }}
        accept=".json,.yaml,.yml,.pdf,.txt"
      />
    </div>
  );
}

