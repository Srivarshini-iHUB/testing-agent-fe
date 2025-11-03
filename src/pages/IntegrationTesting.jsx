import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from "framer-motion"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { integrationApi } from '../api/integrationApi'

export default function IntegrationTestingPlatform() {
  const navigate = useNavigate()
  const [step, setStep] = useState("upload")
  const [project, setProject] = useState(null)
  const [scenariosDocId, setScenariosDocId] = useState(null)
  const [scenarios, setScenarios] = useState([])
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [testScript, setTestScript] = useState("")
  const [testRunId, setTestRunId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [report, setReport] = useState(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    try {
      const storedProject = localStorage.getItem('project')
      if (storedProject) {
        const parsed = JSON.parse(storedProject)
        setProject(parsed)
      } else {
        setError("No project found. Please create a project first.")
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
      setError("No scenario selected")
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
    if (!selectedScenario || !scenariosDocId) {
      setError("Please select a scenario")
      return
    }

    setLoading(true)
    setError(null)
    setStep("running")

    try {
      const response = await integrationApi.runScenario(scenariosDocId, selectedScenario.scenario_name)
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
    setTestScript("")
    setTestRunId(null)
    setReport(null)
    setError(null)
  }

  const testTimelineData = report?.test_details?.map((test, idx) => ({
    name: `Test ${idx + 1}`,
    duration: Math.random() * 500 + 100,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-900 text-gray-900 dark:text-white p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Back Button & Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-300 font-semibold transition-all"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <i className="fas fa-link text-4xl text-indigo-600 dark:text-indigo-400"></i>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Integration Testing</h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">API Testing & Validation Platform</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-300 dark:border-rose-500 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <i className="fas fa-exclamation-triangle text-rose-600 dark:text-rose-400 text-xl"></i>
                <div className="flex-1">
                  <h3 className="font-bold text-rose-800 dark:text-rose-300">Error</h3>
                  <p className="text-sm text-rose-700 dark:text-rose-200 mt-1">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-200"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* UPLOAD STEP */}
        {step === "upload" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Configuration Panel */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <i className="fas fa-cog text-indigo-600 dark:text-indigo-400"></i>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Project Configuration</h2>
              </div>

              {project ? (
                <div className="space-y-6">
                  {/* Project Info */}
                  <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-folder text-indigo-600 dark:text-indigo-400"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white truncate">{project.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ID: {project.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Files Display */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* API Spec */}
                    <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700/50">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        <i className="fas fa-file-code text-blue-500 dark:text-blue-400 mr-2"></i>
                        API Specification
                      </label>
                      {project.postmanCollection ? (
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <i className="fas fa-check-circle text-emerald-600 dark:text-emerald-400"></i>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                              {project.postmanCollection.split('/').pop()}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">Postman Collection</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No file uploaded</p>
                      )}
                    </div>

                    {/* FRD */}
                    <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700/50">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        <i className="fas fa-file-alt text-purple-500 dark:text-purple-400 mr-2"></i>
                        Requirements Document
                      </label>
                      {project.frdDocument?.[0] ? (
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <i className="fas fa-check-circle text-emerald-600 dark:text-emerald-400"></i>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                              {project.frdDocument[0].split('/').pop()}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">FRD Document</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No file uploaded</p>
                      )}
                    </div>
                  </div>

                  {/* Success Status */}
                  {(project.postmanCollection || project.frdDocument?.[0]) && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-500 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <i className="fas fa-check-circle text-emerald-600 dark:text-emerald-400"></i>
                        <div>
                          <p className="font-semibold text-emerald-800 dark:text-emerald-300">Project Files Ready</p>
                          <p className="text-sm text-emerald-700 dark:text-emerald-200 mt-1">All required documents are available for testing</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Advanced Options */}
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors"
                  >
                    <i className={`fas fa-cog ${showAdvanced ? 'fa-spin' : ''}`}></i>
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                  </button>

                  {showAdvanced && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-700/50">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Test Mode</label>
                        <select className="w-full bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:outline-none">
                          <option>Full Test Suite</option>
                          <option>Quick Smoke Test</option>
                          <option>Critical Paths Only</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Retry Policy</label>
                        <select className="w-full bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:outline-none">
                          <option>No Retry</option>
                          <option>1 Retry</option>
                          <option>3 Retries</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                  <p className="text-gray-600 dark:text-gray-400">Loading project...</p>
                </div>
              )}
            </div>

            {/* Actions Panel */}
            <div className="space-y-6">
              {/* Start Button */}
              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Actions</h2>
                <button
                  onClick={generateScenarios}
                  disabled={loading || !project}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-400 disabled:to-gray-500 dark:disabled:from-gray-600 dark:disabled:to-gray-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-play'}`}></i>
                  {loading ? 'Generating...' : 'Generate Test Scenarios'}
                </button>

                {!project && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                    <i className="fas fa-info-circle mr-1"></i>
                    Loading project configuration...
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
                      <p className="font-semibold text-gray-900 dark:text-gray-300">API Flow Testing</p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Tests complete integration scenarios</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="fas fa-robot text-indigo-600 dark:text-indigo-400 mt-1"></i>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-300">Auto Script Generation</p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Python test scripts created automatically</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="fas fa-chart-line text-purple-600 dark:text-purple-400 mt-1"></i>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-300">Detailed Reports</p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Comprehensive test results & analytics</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCENARIOS STEP */}
        {step === "scenarios" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                  <i className="fas fa-list text-indigo-600 dark:text-indigo-400"></i>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Select Test Scenario</h2>
                </div>

                <div className="space-y-3">
                  {scenarios.map((scenario, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedScenario(scenario)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedScenario?.scenario_name === scenario.scenario_name
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-2">{scenario.scenario_name}</h3>
                          <div className="flex flex-wrap gap-2">
                            {scenario.flow_names.map((flow, fidx) => (
                              <span
                                key={fidx}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium"
                              >
                                {flow}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 ${
                            selectedScenario?.scenario_name === scenario.scenario_name
                              ? "border-indigo-500 bg-indigo-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {selectedScenario?.scenario_name === scenario.scenario_name && (
                            <i className="fas fa-check text-white text-xs"></i>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Actions</h2>
                <button
                  onClick={generateTestScript}
                  disabled={!selectedScenario || loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-400 disabled:to-gray-500 dark:disabled:from-gray-600 dark:disabled:to-gray-600 text-white py-4 rounded-xl font-semibold shadow-lg disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-code'}`}></i>
                  {loading ? 'Generating...' : 'Generate Test Script'}
                </button>

                {!selectedScenario && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                    <i className="fas fa-info-circle mr-1"></i>
                    Select a scenario to continue
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SCRIPT STEP */}
        {step === "script" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-file-code text-purple-600 dark:text-purple-400"></i>
                    <h3 className="font-bold text-gray-900 dark:text-white">test_script.py</h3>
                  </div>
                  <button
                    onClick={downloadScript}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all font-medium text-sm"
                  >
                    <i className="fas fa-download"></i>
                    Download
                  </button>
                </div>
                <pre className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 overflow-auto text-sm font-mono text-gray-800 dark:text-gray-200 max-h-96 border border-gray-200 dark:border-gray-700">
                  {testScript || "// No script generated yet"}
                </pre>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Actions</h2>
                <button
                  onClick={executeTests}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-semibold shadow-lg disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-play'}`}></i>
                  {loading ? 'Running...' : 'Run Tests'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RUNNING STEP */}
        {step === "running" && (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-lg">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-ping opacity-75"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                <i className="fas fa-spinner fa-spin text-white text-2xl"></i>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Running Tests</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              Executing scenario: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedScenario?.scenario_name}</span>
            </p>
          </div>
        )}

        {/* REPORT STEP */}
        {step === "report" && report && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-sm">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Tests</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{report.total_tests}</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                <p className="text-emerald-700 dark:text-emerald-400 text-sm mb-2">Passed</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{report.passed_tests}</p>
              </div>
              <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-6 border border-rose-200 dark:border-rose-800 shadow-sm">
                <p className="text-rose-700 dark:text-rose-400 text-sm mb-2">Failed</p>
                <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{report.failed_tests}</p>
              </div>
              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-sm">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Status</p>
                <div className="flex items-center gap-2">
                  {["Passed", "PASSED", "passed"].includes(report.overall_status) ? (
                    <>
                      <i className="fas fa-check-circle text-emerald-500 text-2xl"></i>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">PASSED</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-times-circle text-rose-500 text-2xl"></i>
                      <span className="text-rose-600 dark:text-rose-400 font-bold">FAILED</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Test Results Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={passFailData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {passFailData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Test Timeline</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={testTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Bar dataKey="duration" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Test Details */}
            <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Test Details</h3>
              <div className="space-y-3">
                {report.test_details?.map((test, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      test.passed
                        ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
                        : "bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <i className={`fas ${test.passed ? 'fa-check-circle text-emerald-600 dark:text-emerald-400' : 'fa-times-circle text-rose-600 dark:text-rose-400'}`}></i>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{test.test_name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{test.endpoint}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        test.passed ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200' : 'bg-rose-200 dark:bg-rose-800 text-rose-800 dark:text-rose-200'
                      }`}>
                        {test.status_code}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Request</p>
                        <pre className="text-xs bg-gray-100 dark:bg-gray-900/50 p-3 rounded font-mono overflow-auto max-h-32 text-gray-800 dark:text-gray-200">
                          {JSON.stringify(test.payload, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Response</p>
                        <pre className="text-xs bg-gray-100 dark:bg-gray-900/50 p-3 rounded font-mono overflow-auto max-h-32 text-gray-800 dark:text-gray-200">
                          {JSON.stringify(test.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                    {!test.passed && test.failure_reason && (
                      <p className="text-sm text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/20 p-3 rounded mt-3">
                        <strong>Failure:</strong> {test.failure_reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Download Section */}
            <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Export Test Report</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Download results in your preferred format</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={resetAll}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-all"
                  >
                    <i className="fas fa-redo"></i>
                    Run Another Test
                  </button>
                  <button
                    onClick={() => {
                      const element = document.createElement("a")
                      element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2)))
                      element.setAttribute("download", "test-report.json")
                      element.style.display = "none"
                      document.body.appendChild(element)
                      element.click()
                      document.body.removeChild(element)
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-semibold transition-all shadow-lg"
                  >
                    <i className="fas fa-download"></i>
                    Download JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
