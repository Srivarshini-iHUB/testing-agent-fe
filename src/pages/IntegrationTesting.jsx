import { useState, useEffect } from "react"
import { Play, AlertCircle, CheckCircle, XCircle, RotateCcw, Loader, FileJson, FileText, Download, Code } from "lucide-react"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { integrationApi } from '../api/integrationApi'; // Adjust path as needed

export default function IntegrationTestingPlatform() {
  const [step, setStep] = useState("upload") // upload, scenarios, script, running, report
  const [project, setProject] = useState(null)
  const [scenariosDocId, setScenariosDocId] = useState(null)
  const [scenarios, setScenarios] = useState([])
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [baseUrl, setBaseUrl] = useState("")
  const [testScript, setTestScript] = useState("")
  const [testRunId, setTestRunId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [report, setReport] = useState(null)

  useEffect(() => {
    try {
      const storedProject = localStorage.getItem('project')
      if (storedProject) {
        const parsed = JSON.parse(storedProject)
        setProject(parsed)
      } else {
        setError("No project found in localStorage. Please create a project first.")
      }
    } catch (err) {
      setError("Failed to load project from localStorage.")
    }
  }, [])

  const generateScenarios = async () => {
    if (!project?.id) {
      setError("No project ID available")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await integrationApi.generateScenarios(project.id)
      setScenariosDocId(data.scenarios_doc_id)
      setScenarios(data.scenarios || [])
      setStep("scenarios")
    } catch (err) {
      setError(err.message || "Failed to generate scenarios")
    } finally {
      setLoading(false)
    }
  }

  const generateTestScript = async () => {
    if (!selectedScenario || !scenariosDocId) {
      setError("No scenario or document ID available")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await integrationApi.generateTestScript(scenariosDocId, selectedScenario.scenario_name)
      setTestScript(data.test_script_preview || "")
      setTestRunId(data.test_run_id)
      setStep("script")
    } catch (err) {
      setError(err.message || "Failed to generate test script")
    } finally {
      setLoading(false)
    }
  }

  const executeTests = async () => {
    if (!selectedScenario || !scenariosDocId ) {
      setError("Please select a scenario and provide a base URL")
      return
    }

    setLoading(true)
    setError(null)
    setStep("running")

    try {
   

      const response = await integrationApi.runScenario(scenariosDocId, selectedScenario.scenario_name);
      setReport(response.report)
      setStep("report")
    } catch (err) {
      setError(err.message || "Failed to execute tests")
      setStep("script")
    } finally {
      setLoading(false)
    }
  }

  const downloadScript = () => {
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(testScript))
    element.setAttribute("download", `test_script_${selectedScenario?.scenario_name.replace(/\s+/g, '_').toLowerCase()}.py`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const resetAll = () => {
    setStep("upload")
    setScenariosDocId(null)
    setScenarios([])
    setSelectedScenario(null)
    setBaseUrl("")
    setTestScript("")
    setTestRunId(null)
    setReport(null)
    setError(null)
  }

  const testTimelineData = report?.test_details?.map((test, idx) => ({
    name: `Test ${idx + 1}`,
    duration: Math.random() * 500 + 100, // Placeholder; no actual duration provided
    status: test.passed ? "passed" : "failed",
  })) || []

  const totalTests = report?.total_tests || 0
  const passedTests = report?.passed_tests || 0
  const failedTests = report?.failed_tests || 0
  const skippedTests = totalTests - passedTests - failedTests

  const passFailData = [
    { name: "Passed", value: passedTests, fill: "#10b981" },
    { name: "Failed", value: failedTests, fill: "#ef4444" },
    ...(skippedTests > 0 ? [{ name: "Skipped", value: skippedTests, fill: "#f59e0b" }] : [])
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-blue-500/20">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">IT</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Integration Tester</h1>
                <p className="text-sm text-slate-400">API Testing & Validation Platform</p>
              </div>
            </div>
            {step !== "upload" && (
              <button
                onClick={resetAll}
                className="group flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 hover:text-white rounded-lg transition-all duration-300 border border-slate-700/50 hover:border-slate-600/50 font-medium"
              >
                <RotateCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                Start Over
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Alert */}
        {error && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 flex items-start gap-4 backdrop-blur-sm">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={22} />
              <div className="flex-1">
                <p className="text-red-200 font-semibold">Something went wrong</p>
                <p className="text-red-300/80 text-sm mt-1.5 leading-relaxed">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0 hover:bg-red-500/10 p-1 rounded"
              >
                ✕
              </button>
            </div>
            {step !== "upload" && (
              <button
                onClick={() => {
                  if (step === "scenarios") {
                    setError(null)
                  } else if (step === "script") {
                    setError(null)
                  } else if (step === "running") {
                    setStep(step === "script" ? "script" : "scenarios")
                    setError(null)
                  }
                }}
                className="mt-4 px-5 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-lg transition-all duration-200 text-sm font-semibold border border-red-500/20 hover:border-red-500/40"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* UPLOAD STEP (Now Project Info) */}
        {step === "upload" && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Project Configuration</h2>
              <p className="text-slate-400 text-lg">
                Using stored project data to generate test scenarios
              </p>
            </div>

            {project ? (
              <div className="space-y-6 mb-10">
                <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                  <h3 className="text-lg font-bold text-white mb-4">Project: {project.name}</h3>
                  <p className="text-sm text-slate-400 mb-4">ID: {project.id}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* API Spec */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <FileJson size={18} className="text-blue-400" />
                      API Specification
                    </label>
                    <div className="p-6 border-2 border-dashed border-slate-600 rounded-xl bg-slate-800/30">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-14 h-14 bg-blue-500/15 rounded-lg flex items-center justify-center">
                          <FileJson className="text-blue-400" size={28} />
                        </div>
                        <div className="text-center">
                          <p className="text-white font-semibold text-base">{project.postmanCollection ? project.postmanCollection.split('/').pop() : "No file"}</p>
                          {project.postmanCollection ? (
                            <a
                              href={project.postmanCollection}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm mt-1.5 inline-flex items-center gap-1"
                            >
                              View File <span aria-hidden="true">→</span>
                            </a>
                          ) : (
                            <p className="text-slate-400 text-sm mt-1.5">Postman Collection URL</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FRD */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <FileText size={18} className="text-cyan-400" />
                      Requirements Document
                    </label>
                    <div className="p-6 border-2 border-dashed border-slate-600 rounded-xl bg-slate-800/30">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-14 h-14 bg-cyan-500/15 rounded-lg flex items-center justify-center">
                          <FileText className="text-cyan-400" size={28} />
                        </div>
                        <div className="text-center">
                          <p className="text-white font-semibold text-base">{project.frdDocument?.[0] ? project.frdDocument[0].split('/').pop() : "No file"}</p>
                          {project.frdDocument?.[0] ? (
                            <a
                              href={project.frdDocument[0]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 text-sm mt-1.5 inline-flex items-center gap-1"
                            >
                              View File <span aria-hidden="true">→</span>
                            </a>
                          ) : (
                            <p className="text-slate-400 text-sm mt-1.5">FRD Document URL</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Status */}
                {(project.postmanCollection || project.frdDocument?.[0]) && (
                  <div className="mb-10 p-5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                      <p className="text-green-400 font-semibold">Project Files Ready</p>
                    </div>
                    <div className="space-y-2 text-sm text-slate-300 ml-7">
                      {project.postmanCollection && (
                        <p className="flex items-center gap-2">
                          <span className="text-green-400">✓</span> API Spec: {project.postmanCollection.split('/').pop()}
                        </p>
                      )}
                      {project.frdDocument?.[0] && (
                        <p className="flex items-center gap-2">
                          <span className="text-green-400">✓</span> FRD: {project.frdDocument[0].split('/').pop()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg">Loading project...</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateScenarios}
              disabled={!project || loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:shadow-none text-lg"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={22} />
                  Generating Scenarios...
                </>
              ) : (
                <>
                  <Play size={22} className="group-hover:translate-x-1 transition-transform" />
                  Generate Test Scenarios
                </>
              )}
            </button>
          </div>
        )}

        {/* SCENARIOS STEP */}
        {step === "scenarios" && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Select Test Scenario</h2>
              <p className="text-slate-400 text-lg">Choose a scenario to generate script and run integration tests</p>
            </div>

            <div className="grid gap-4 mb-10">
              {scenarios.map((scenario, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedScenario(scenario)}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${selectedScenario?.scenario_name === scenario.scenario_name
                      ? "border-blue-500/60 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                      : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50 hover:bg-slate-800/50"
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-3">{scenario.scenario_name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {scenario.flow_names.map((flow, fidx) => (
                          <span
                            key={fidx}
                            className="px-3 py-1.5 bg-slate-700/50 text-slate-300 text-xs rounded-lg font-mono font-semibold border border-slate-600/50"
                          >
                            {flow}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ml-4 ${selectedScenario?.scenario_name === scenario.scenario_name
                          ? "border-blue-500 bg-blue-500"
                          : "border-slate-600"
                        }`}
                    >
                      {selectedScenario?.scenario_name === scenario.scenario_name && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* <div className="mb-10">
              <label className="block text-sm font-semibold text-white mb-3">Base URL *</label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 font-mono text-sm"
                placeholder="e.g., http://host.docker.internal:8000"
              />
            </div> */}

            {/* Generate Script Button */}
            <button
              onClick={generateTestScript}
              disabled={!selectedScenario  || loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 disabled:shadow-none text-lg"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={22} />
                  Generating Script...
                </>
              ) : (
                <>
                  <Code size={22} className="group-hover:translate-x-1 transition-transform" />
                  Generate Test Script
                </>
              )}
            </button>
          </div>
        )}

        {/* SCRIPT STEP */}
        {step === "script" && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Test Script Preview</h2>
              <p className="text-slate-400 text-lg">Review the generated Python test script for {selectedScenario?.scenario_name}</p>
            </div>

            {/* Script Display */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code size={20} className="text-purple-400" />
                  test_script.py
                </h3>
                <button
                  onClick={downloadScript}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 hover:text-white rounded-lg transition-all duration-300 border border-slate-700/50 hover:border-slate-600/50 font-medium"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
              <pre className="bg-slate-900/90 border border-slate-700/50 rounded-xl p-6 overflow-auto text-sm font-mono text-slate-200 max-h-96">
                {testScript || "// No script generated yet"}
              </pre>
            </div>

            {/* Run Button */}
            <button
              onClick={executeTests}
              disabled={ loading}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group shadow-lg shadow-green-500/20 hover:shadow-green-500/40 disabled:shadow-none text-lg"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={22} />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play size={22} className="group-hover:translate-x-1 transition-transform" />
                  Run Tests
                </>
              )}
            </button>
          </div>
        )}

        {/* RUNNING STEP */}
        {step === "running" && (
          <div className="animate-in fade-in duration-500 flex flex-col items-center justify-center py-24">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse opacity-75 blur-xl" />
              <div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-spin opacity-50"
                style={{ animationDuration: "3s" }}
              />
              <div className="absolute inset-3 bg-slate-900 rounded-full flex items-center justify-center">
                <Loader className="animate-spin text-blue-400" size={40} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 text-center">Running Tests</h2>
            <p className="text-slate-400 text-center max-w-md text-lg">
              Executing scenario: <span className="text-blue-300 font-semibold">{selectedScenario?.scenario_name}</span>
            </p>
            <div className="mt-10 w-full max-w-md h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 animate-pulse" />
            </div>
          </div>
        )}

        {/* REPORT STEP */}
        {step === "report" && report && (
          <div className="animate-in fade-in duration-500">
            {/* Summary Cards */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">{report.scenario_summary}</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-slate-600/50 transition-all duration-300">
                  <p className="text-slate-400 text-sm font-semibold mb-3">Total Tests</p>
                  <p className="text-4xl font-bold text-white">{report.total_tests}</p>
                </div>
                <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl hover:border-green-500/50 transition-all duration-300">
                  <p className="text-green-400 text-sm font-semibold mb-3">Passed</p>
                  <p className="text-4xl font-bold text-green-400">{report.passed_tests}</p>
                </div>
                <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl hover:border-red-500/50 transition-all duration-300">
                  <p className="text-red-400 text-sm font-semibold mb-3">Failed</p>
                  <p className="text-4xl font-bold text-red-400">{report.failed_tests}</p>
                </div>
                <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-slate-600/50 transition-all duration-300">
                  <p className="text-slate-400 text-sm font-semibold mb-3">Status</p>
                  <div className="flex items-center gap-2">
                    {["Passed", "PASSED", "passed"].includes(report.overall_status) ? (
                      <>
                        <CheckCircle className="text-green-500" size={28} />
                        <span className="text-green-400 font-bold text-lg">PASSED</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="text-red-500" size={28} />
                        <span className="text-red-400 font-bold text-lg">FAILED</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              {/* Pass/Fail/Skipped Pie Chart */}
              <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-slate-600/50 transition-all duration-300">
                <h3 className="text-lg font-bold text-white mb-6">Test Results Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={passFailData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {passFailData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                      }}
                      labelStyle={{ color: "#fff", fontWeight: "bold" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Test Timeline */}
              <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-slate-600/50 transition-all duration-300">
                <h3 className="text-lg font-bold text-white mb-6">Test Timeline (Estimated Duration ms)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={testTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                      }}
                      labelStyle={{ color: "#fff", fontWeight: "bold" }}
                    />
                    <Bar dataKey="duration" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

        

            {/* Test Details */}
            <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-slate-600/50 transition-all duration-300 mb-10">
              <h3 className="text-lg font-bold text-white mb-6">Test Details</h3>
              <div className="space-y-4">
                {report.test_details?.map((test, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-lg border transition-all duration-300 ${test.passed
                        ? "bg-green-500/5 border-green-500/30 hover:border-green-500/50"
                        : "bg-red-500/5 border-red-500/30 hover:border-red-500/50"
                      }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        {test.passed ? (
                          <CheckCircle className="text-green-500 flex-shrink-0" size={22} />
                        ) : (
                          <XCircle className="text-red-500 flex-shrink-0" size={22} />
                        )}
                        <div>
                          <p className="font-bold text-white">{test.test_name}</p>
                          <p className="text-sm text-slate-400 font-mono">{test.endpoint}</p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 ${test.passed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                          }`}
                      >
                        {test.status_code} (exp: {test.expected_status})
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-300 mb-2">Request Payload</p>
                        <pre className="text-sm text-slate-400 bg-slate-900/50 p-3 rounded-lg font-mono overflow-auto">
                          {JSON.stringify(test.payload, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-300 mb-2">Response</p>
                        <pre className="text-sm text-slate-400 bg-slate-900/50 p-3 rounded-lg font-mono overflow-auto">
                          {JSON.stringify(test.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                    {!test.passed && test.failure_reason && (
                      <p className="text-sm text-red-300 bg-red-500/10 p-3 rounded border border-red-500/20 mt-4">
                        Failure Reason: {test.failure_reason}
                      </p>
                    )}
                  </div>
                )) || <p className="text-slate-400 text-center py-8">No test details available.</p>}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={resetAll}
                className="flex-1 py-4 bg-slate-800/50 hover:bg-slate-700/50 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-slate-700/50 hover:border-slate-600/50 group"
              >
                <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                Run Another Test
              </button>
              <button
                onClick={() => {
                  const element = document.createElement("a")
                  element.setAttribute(
                    "href",
                    "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2)),
                  )
                  element.setAttribute("download", "test-report.json")
                  element.style.display = "none"
                  document.body.appendChild(element)
                  element.click()
                  document.body.removeChild(element)
                }}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 group"
              >
                <Download size={20} className="group-hover:translate-x-1 transition-transform" />
                Download Report
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}