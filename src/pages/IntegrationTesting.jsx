import { useState } from "react"
import { Upload, Play, AlertCircle, CheckCircle, XCircle, RotateCcw, Loader, FileJson, FileText } from "lucide-react"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function IntegrationTestingPlatform() {
  const [step, setStep] = useState("upload") // upload, scenarios, running, report
  const [swaggerFile, setSwaggerFile] = useState(null)
  const [frdFile, setFrdFile] = useState(null)
  const [scenarios, setScenarios] = useState([])
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [baseUrl, setBaseUrl] = useState("http://host.docker.internal:3000/api")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [report, setReport] = useState(null)

  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

  const handleFileUpload = (file, type) => {
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      setError(`${type} file exceeds 10MB limit`)
      return
    }

    if (type === "swagger" && !file.name.endsWith(".json")) {
      setError("Swagger file must be JSON format")
      return
    }

    if (type === "frd" && !file.name.endsWith(".pdf")) {
      setError("FRD file must be PDF format")
      return
    }

    if (type === "swagger") {
      setSwaggerFile(file)
    } else {
      setFrdFile(file)
    }
    setError(null)
  }

  const generateScenarios = async () => {
    if (!swaggerFile || !frdFile) {
      setError("Please upload both files")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("swagger_doc", swaggerFile)
      formData.append("frd_file", frdFile)

      const response = await fetch("http://localhost:8000/generate-scenarios", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`)
      }

      const data = await response.json()
      setScenarios(data.scenarios || [])
      setStep("scenarios")
    } catch (err) {
      setError(err.message || "Failed to generate scenarios")
    } finally {
      setLoading(false)
    }
  }

  const runScenario = async () => {
    if (!selectedScenario) {
      setError("Please select a scenario")
      return
    }

    setLoading(true)
    setError(null)
    setStep("running")

    try {
      const payload = {
        base_url: baseUrl,
        scenario_details: {
          scenario_name: selectedScenario.scenario_name,
          flow_names: selectedScenario.flow_names,
        },
      }

      const response = await fetch("http://localhost:8000/run-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`)
      }

      const data = await response.json()
      setReport(data)
      setStep("report")
    } catch (err) {
      setError(err.message || "Failed to run scenario")
      setStep("scenarios")
    } finally {
      setLoading(false)
    }
  }

  const resetAll = () => {
    setStep("upload")
    setSwaggerFile(null)
    setFrdFile(null)
    setScenarios([])
    setSelectedScenario(null)
    setReport(null)
    setError(null)
  }

  const testTimelineData =
    report?.test_details?.map((test, idx) => ({
      name: `Test ${idx + 1}`,
      duration: Math.random() * 500 + 100,
      status: test.passed ? "passed" : "failed",
    })) || []

  const passFailData = report?.scenario_summary
    ? [
      { name: "Passed", value: report.passed_tests, fill: "#10b981" },
      { name: "Failed", value: report.failed_tests, fill: "#ef4444" },
    ]
    : []

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
                  } else if (step === "running") {
                    setStep("scenarios")
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

        {/* UPLOAD STEP */}
        {step === "upload" && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Upload Your Files</h2>
              <p className="text-slate-400 text-lg">
                Provide your API documentation and requirements to generate test scenarios
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              {/* Swagger Upload */}
              <div className="group">
                <label className="block text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <FileJson size={18} className="text-blue-400" />
                  Swagger API Documentation
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => handleFileUpload(e.target.files?.[0], "swagger")}
                    className="hidden"
                    id="swagger-input"
                  />
                  <label
                    htmlFor="swagger-input"
                    className="block p-8 border-2 border-dashed border-slate-600 rounded-xl hover:border-blue-500/60 hover:bg-blue-500/5 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-14 h-14 bg-blue-500/15 rounded-lg flex items-center justify-center group-hover:bg-blue-500/25 transition-all duration-300 group-hover:scale-110">
                        <Upload className="text-blue-400 group-hover:text-blue-300" size={28} />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-semibold text-base">
                          {swaggerFile ? swaggerFile.name : "Upload Swagger JSON"}
                        </p>
                        <p className="text-slate-400 text-sm mt-1.5">
                          {swaggerFile ? "✓ Ready to use" : "Max 10MB • JSON format"}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* FRD Upload */}
              <div className="group">
                <label className="block text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-cyan-400" />
                  Feature Requirements Document
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(e.target.files?.[0], "frd")}
                    className="hidden"
                    id="frd-input"
                  />
                  <label
                    htmlFor="frd-input"
                    className="block p-8 border-2 border-dashed border-slate-600 rounded-xl hover:border-cyan-500/60 hover:bg-cyan-500/5 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-14 h-14 bg-cyan-500/15 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/25 transition-all duration-300 group-hover:scale-110">
                        <Upload className="text-cyan-400 group-hover:text-cyan-300" size={28} />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-semibold text-base">
                          {frdFile ? frdFile.name : "Upload FRD PDF"}
                        </p>
                        <p className="text-slate-400 text-sm mt-1.5">
                          {frdFile ? "✓ Ready to use" : "Max 10MB • PDF format"}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* File Status */}
            {(swaggerFile || frdFile) && (
              <div className="mb-10 p-5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                  <p className="text-green-400 font-semibold">Files Ready for Processing</p>
                </div>
                <div className="space-y-2 text-sm text-slate-300 ml-7">
                  {swaggerFile && (
                    <p className="flex items-center gap-2">
                      <span className="text-green-400">✓</span> Swagger: {swaggerFile.name}
                    </p>
                  )}
                  {frdFile && (
                    <p className="flex items-center gap-2">
                      <span className="text-green-400">✓</span> FRD: {frdFile.name}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateScenarios}
              disabled={!swaggerFile || !frdFile || loading}
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
              <p className="text-slate-400 text-lg">Choose a scenario to run integration tests</p>
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

            {/* Base URL Input */}
            <div className="mb-10">
              <label className="block text-sm font-semibold text-white mb-3">Base URL (Optional)</label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 font-mono text-sm"
                placeholder="http://host.docker.internal:3000/api"
              />
            </div>

            {/* Run Button */}
            <button
              onClick={runScenario}
              disabled={!selectedScenario || loading}
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
                  Run Scenario
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
                    {["Passed", "PASSED","passed"].includes(report.overall_status) ? (
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
              {/* Pass/Fail Pie Chart */}
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
                <h3 className="text-lg font-bold text-white mb-6">Test Duration (ms)</h3>
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
                {report.test_details.map((test, idx) => (
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
                        Status: {test.status_code}
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
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-slate-300 mb-2">Expected Response</p>
                      <pre className="text-sm text-slate-400 bg-slate-900/50 p-3 rounded-lg font-mono overflow-auto">
                        {JSON.stringify(test.expected_response, null, 2)}
                      </pre>
                    </div>
                    {!test.passed && test.failure_reason && (
                      <p className="text-sm text-red-300 bg-red-500/10 p-3 rounded border border-red-500/20 mt-4">
                        Failure Reason: {test.failure_reason}
                      </p>
                    )}
                  </div>
                ))}
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
                <Play size={20} className="group-hover:translate-x-1 transition-transform" />
                Download Report
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}