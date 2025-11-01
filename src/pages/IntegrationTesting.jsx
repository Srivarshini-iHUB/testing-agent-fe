import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Play, AlertCircle, CheckCircle, XCircle, RotateCcw, Loader, FileJson, FileText, Download, Code } from "lucide-react"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { integrationApi } from '../api/integrationApi'; // Adjust path as needed

export default function IntegrationTestingPlatform() {
  const navigate = useNavigate()
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
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl shadow-lg">🔗</div>
            <div>
              <h1 className="text-3xl font-bold">Integration Testing Agent</h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">AI-powered API scenario generation and validation</p>
            </div>
          </div>
          {step !== 'upload' && (
            <button
              onClick={resetAll}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-300 font-semibold transition-all"
            >
              <i className="fas fa-rotate-left"></i>
              Start Over
            </button>
          )}
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

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Project Configuration */}
            <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <i className="fas fa-cog text-indigo-600 dark:text-indigo-400"></i>
                <h2 className="text-xl font-bold">Project Configuration</h2>
              </div>
              {project ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-900/40">
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-1 font-semibold">Project</div>
                      <div className="text-gray-900 dark:text-white">{project.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">ID: {project.id}</div>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-900/40">
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-1 font-semibold">Files</div>
                      <div className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-500">{project.postmanCollection ? '✓' : '•'}</span>
                          API Spec: {project.postmanCollection ? project.postmanCollection.split('/').pop() : 'Not provided'}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-500">{project.frdDocument?.[0] ? '✓' : '•'}</span>
                          FRD: {project.frdDocument?.[0] ? project.frdDocument[0].split('/').pop() : 'Not provided'}
                        </div>
                      </div>
                    </div>
                  </div>
                  {step === 'upload' && (
                    <button
                      onClick={generateScenarios}
                      disabled={!project || loading}
                      className={`w-full ${loading ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'} text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-2`}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          <span>Generating Scenarios...</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-play"></i>
                          <span>Generate Test Scenarios</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600 dark:text-gray-300">Loading project...</div>
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
              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <i className="fas fa-chart-line text-indigo-600 dark:text-indigo-400"></i>
                  <h3 className="text-lg font-bold">Current Report</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
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
                      {['Passed','PASSED','passed'].includes(report.overall_status) ? 'PASSED' : 'FAILED'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={resetAll}
                    className="flex-1 bg-gray-100 dark:bg-gray-900/40 hover:bg-gray-200 dark:hover:bg-gray-800/60 text-gray-800 dark:text-gray-200 py-2 px-3 rounded-lg text-sm transition-all"
                  >
                    Run Another Test
                  </button>
                  <button
                    onClick={() => {
                      const element = document.createElement('a')
                      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2)))
                      element.setAttribute('download', 'test-report.json')
                      element.style.display = 'none'
                      document.body.appendChild(element)
                      element.click()
                      document.body.removeChild(element)
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-2 px-3 rounded-lg text-sm transition-all"
                  >
                    Download Report
                  </button>
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
      </div>
    </div>
  )
}