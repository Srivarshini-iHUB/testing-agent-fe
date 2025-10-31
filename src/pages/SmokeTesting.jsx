import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import axios from "axios";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Highlight, themes } from 'prism-react-renderer';
import { toast } from 'react-toastify';

const API_BASE = "http://localhost:8080";

function SmokeTesting() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [sessionToken, setSessionToken] = useState(null);
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [projectUrl, setProjectUrl] = useState("");
  const [testCasesFile, setTestCasesFile] = useState(null);
  const [generatedScript, setGeneratedScript] = useState("");
  const [generatedTestCases, setGeneratedTestCases] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const createdSmokeIdRef = useRef("");

  // Get session token from localStorage or URL
  useEffect(() => {
    const storedToken = localStorage.getItem("session_token");
    if (storedToken) {
      setSessionToken(storedToken);
    }
    const params = new URLSearchParams(window.location.search);
    const token = params.get("session_token");
    if (token) {
      setSessionToken(token);
      localStorage.setItem("session_token", token);
      window.history.replaceState({}, document.title, "/smoke-testing");
    }
  }, []);

  // Fetch Repos (only if sessionToken exists)
  useEffect(() => {
    if (sessionToken) {
      setLoading(true);
      setError("");
      axios
        .get(`${API_BASE}/auth/repos`, { params: { session_token: sessionToken } })
        .then((res) => {
          setRepos(res.data);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to fetch repositories");
          setLoading(false);
        });
      fetchReports();
    }
  }, [sessionToken]);

  // Fetch Reports
  const fetchReports = async () => {
    try {
      const res = await axios.get(`${API_BASE}/reports`, {
        params: { session_token: sessionToken },
      });
      setReports(res.data);
    } catch (e) {
      console.error("Failed to fetch reports:", e);
    }
  };

  // Fetch Branches
  useEffect(() => {
    if (selectedRepo && sessionToken) {
      setLoading(true);
      setError("");
      const [owner, repo] = selectedRepo.split("/");
      axios
        .get(`${API_BASE}/auth/branches`, {
          params: { session_token: sessionToken, owner, repo },
        })
        .then((res) => {
          setBranches(res.data.map((b) => b.name));
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to fetch branches");
          setLoading(false);
        });
    }
  }, [selectedRepo, sessionToken]);

  // Run Smoke Test (Before Deployment)
  const handleRunTests = async () => {
    try {
      setIsRunning(true);
      setError("");
      setReport(null);
      const repoUrl = selectedRepo.startsWith("http")
        ? selectedRepo
        : `https://github.com/${selectedRepo}`;
      const res = await axios.post(`${API_BASE}/smoke/run`, {
        repo_url: repoUrl,
        branch: selectedBranch,
        commit_id: null,
      });
      setReport(res.data || {});
      fetchReports();
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.detail || err.message || "Failed to run smoke tests";
      setError(msg);
    } finally {
      setIsRunning(false);
    }
  };

  // Generate Smoke Tests (After Deployment)
  const handleGenerateTests = async (e) => {
    e.preventDefault();
    if (!testCasesFile) {
      setGenerateError("Please select a test cases file.");
      return;
    }
    if (!projectUrl) {
      setGenerateError("Please enter a project URL.");
      return;
    }
    setIsGenerating(true);
    setGenerateError("");
    try {
      const formData = new FormData();
      formData.append("file", testCasesFile);
      formData.append("project_url", projectUrl);
      formData.append("project_id", "PROJ_3");
      const res = await axios.post(
        `${API_BASE}/generate_smoke_tests`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      let scriptRaw = res.data.script || "";
      // Remove leading code fence/lang tag and trailing fence
      scriptRaw = scriptRaw
        .replace(/^\s*```(?:python)?\s*/i, "")
        .replace(/```\s*$/i, "")
        .replace(/^\s*python\s*[\r\n]+/i, "");
      setGeneratedScript(scriptRaw);
      setGeneratedTestCases(res.data.test_cases);
      const createdId = res.data.createdSmokeTestId || "";
      if (createdId) {
        createdSmokeIdRef.current = createdId;
        try { localStorage.setItem('last_smoke_id', createdId); } catch (_) {}
      }
    } catch (err) {
      setGenerateError(
        err.response?.data?.detail?.[0]?.msg ||
        err.response?.data?.message ||
        "Failed to generate smoke tests"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Download Generated Script
  const downloadScript = () => {
    const originalScript = generatedScript;
    const blob = new Blob([originalScript], { type: "text/plain" });
    saveAs(blob, "smoke_test_script.py");
  };

  // PDF generator using jsPDF
  const downloadPDF = (reportObj) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = 12;
    let y = 40;
    const addTitle = (text, fontSize = 16) => {
      doc.setFontSize(fontSize);
      doc.text(text, margin, y);
      y += fontSize + 8;
    };
    const addParagraph = (text, fontSize = 11) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((ln) => {
        if (y + lineHeight > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(ln, margin, y);
        y += lineHeight;
      });
    };
    addTitle("Smoke Test Report", 18);
    addParagraph(`Commit: ${reportObj.commit_id || "N/A"}`);
    addParagraph(`Branch: ${reportObj.branch || selectedBranch || "N/A"}`);
    addParagraph(`Overall Status: ${reportObj.status || "N/A"}`);
    y += 6;
    const summary = reportObj.summary || reportObj || {};
    const addSection = (title, content) => {
      addTitle(title, 13);
      if (Array.isArray(content)) {
        if (content.length === 0) {
          addParagraph("None");
        } else {
          content.forEach((it, idx) => {
            const label = it.file ? `${idx + 1}. ${it.file}: ` : `${idx + 1}. `;
            const body =
              it.error ||
              (it.missing && it.missing.join(", ")) ||
              it.issue ||
              stringifyItem(it);
            addParagraph(label + body);
          });
        }
      } else if (typeof content === "boolean") {
        addParagraph(content ? "Yes" : "No");
      } else {
        addParagraph(stringifyItem(content || "None"));
      }
      y += 4;
    };
    addSection("Critical Files Present", summary.critical_files_present);
    addSection("Build Ready for Regression", summary.build_ready_for_regression);
    addSection("Syntax Errors", summary.syntax_errors || []);
    addSection("Missing Functions", summary.missing_functions || []);
    addSection("UI Issues", summary.ui_issues || []);
    addSection("Error Handling Issues", summary.error_handling_issues || []);
    if (summary._raw_llm_output) {
      addSection("LLM Raw Output", [{ file: "LLM", error: summary._raw_llm_output }]);
    }
    const name = `smoke_report_${reportObj.commit_id || "latest"}.pdf`;
    doc.save(name);
  };

  // DOCX generator
  const downloadDOCX = async (reportObj) => {
    const summary = reportObj.summary || reportObj || {};
    const children = [];
    const pushParagraph = (text, bold = false) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: String(text), bold })],
        })
      );
    };
    pushParagraph("Smoke Test Report", true);
    pushParagraph(`Commit: ${reportObj.commit_id || "N/A"}`);
    pushParagraph(`Branch: ${reportObj.branch || selectedBranch || "N/A"}`);
    pushParagraph(`Overall Status: ${reportObj.status || "N/A"}`);
    children.push(new Paragraph({ text: "" }));
    const addArraySection = (title, arr) => {
      pushParagraph(title, true);
      if (!arr || arr.length === 0) {
        pushParagraph("None");
      } else {
        arr.forEach((it, idx) => {
          if (typeof it === "string") {
            pushParagraph(`${idx + 1}. ${it}`);
          } else {
            const file = it.file ? `${it.file}: ` : "";
            const body =
              it.error ||
              (it.missing && it.missing.join(", ")) ||
              it.issue ||
              stringifyItem(it);
            pushParagraph(`${idx + 1}. ${file}${body}`);
          }
        });
      }
      children.push(new Paragraph({ text: "" }));
    };
    const addBooleanSection = (title, val) => {
      pushParagraph(title, true);
      pushParagraph(val ? "Yes" : "No");
      children.push(new Paragraph({ text: "" }));
    };
    addBooleanSection("Critical Files Present", summary.critical_files_present);
    addBooleanSection("Build Ready for Regression", summary.build_ready_for_regression);
    addArraySection("Syntax Errors", summary.syntax_errors || []);
    addArraySection("Missing Functions", summary.missing_functions || []);
    addArraySection("UI Issues", summary.ui_issues || []);
    addArraySection("Error Handling Issues", summary.error_handling_issues || []);
    if (summary._raw_llm_output) {
      pushParagraph("LLM Raw Output", true);
      pushParagraph(summary._raw_llm_output);
    }
    const doc = new Document({
      sections: [{ properties: {}, children }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `smoke_report_${reportObj.commit_id || "latest"}.docx`);
  };

  // Helper
  const stringifyItem = (item) => {
    if (!item && item !== 0) return "";
    if (typeof item === "string") return item;
    try {
      return JSON.stringify(item, null, 2);
    } catch {
      return String(item);
    }
  };

  // Filter repos
  const filteredRepos = repos.filter((r) =>
    r.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ReportCard Component
  const ReportCard = ({ report }) => {
    if (!report) return null;
    const s = report.summary || {};
    return (
      <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700/50 mb-3">
        <div className="text-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900 dark:text-white">
              Commit:
            </span>
            <span className="text-gray-600 dark:text-gray-300 font-mono text-xs">
              {report.commit_id?.substring(0, 8)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900 dark:text-white">
              Branch:
            </span>
            <span className="text-gray-600 dark:text-gray-300">
              {report.branch}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900 dark:text-white">
              Status:
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                report.status === "completed"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
              }`}
            >
              {report.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Critical Files
              </div>
              <div
                className={`text-sm font-semibold ${
                  s.critical_files_present
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {s.critical_files_present ? "Yes" : "No"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Build Ready
              </div>
              <div
                className={`text-sm font-semibold ${
                  s.build_ready_for_regression
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {s.build_ready_for_regression ? "Yes" : "No"}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="text-gray-500 dark:text-gray-400">
                Syntax Errors
              </div>
              <div className="font-semibold text-red-600 dark:text-red-400">
                {s.syntax_errors?.length || 0}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500 dark:text-gray-400">UI Issues</div>
              <div className="font-semibold text-blue-600 dark:text-blue-400">
                {s.ui_issues?.length || 0}
              </div>
            </div>
          </div>
          <div className="mt-2 text-gray-500 dark:text-gray-400 text-xs text-center">
            <small>Report generated by Gemini analysis</small>
          </div>
        </div>
      </div>
    );
  };

  // Empty Report
  const EmptyReport = () => (
    <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700/50 text-gray-600 dark:text-gray-400">
      <p>No smoke test report yet. Run a test to see the detailed report here.</p>
    </div>
  );

  // Handlers
  const handleBeforeDeploymentClick = () => {
  if (!sessionToken) {
    // Optional: Show loading state or disable button
    toast.info("Redirecting to GitHub for login...", {
      position: "top-right",
      autoClose: 2000,
    });
    window.location.href = `${API_BASE}/auth/login?redirect_uri=${encodeURIComponent(
      "http://localhost:5173/smoke-testing"
    )}`;
  } else {
    setActiveTab("before");
  }
};

  const handleAfterDeploymentClick = () => {
    setActiveTab("after");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-900 text-gray-900 dark:text-white p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/")}
            className="mb-4 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-300 font-semibold transition-all"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className="fas fa-fire text-4xl text-orange-600 dark:text-orange-400"></i>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Smoke Testing Agent
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  AI-powered smoke testing for code quality and regression readiness
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        {!activeTab && (
          <div className="flex flex-col items-center justify-center mb-6 max-w-4xl mx-auto">
            {/* Roadmap Container */}
            <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4 relative">
              {/* Before Deployment Card */}
              <div
                className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer w-full md:w-1/3"
              >
                <div className="flex items-center gap-2 mb-4">
                  <i className="fas fa-code-branch text-orange-600 dark:text-orange-400"></i>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Before Deployment
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                  Test your code before deployment. Login with GitHub, select repo, and run smoke tests.
                </p>
                <button
                  onClick={handleBeforeDeploymentClick}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  {sessionToken ? (
                    <>
                      <i className="fas fa-check-circle"></i>
                      Explore
                    </>
                  ) : (
                    <>
                      <i className="fab fa-github"></i>
                      Github Login to Explore
                    </>
                  )}
                </button>
              </div>
              {/* Deployment Center Card (Non-clickable) */}
              <div className="flex flex-col items-center justify-center p-4 md:my-0 my-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-full p-4 shadow-lg">
                  <i className="fas fa-rocket text-white text-2xl"></i>
                </div>
                <h3 className="mt-2 text-lg font-bold text-gray-900 dark:text-white">Deployment</h3>
              </div>
              {/* After Deployment Card */}
              <div
                className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer w-full md:w-1/3"
              >
                <div className="flex items-center gap-2 mb-4">
                  <i className="fas fa-rocket text-green-600 dark:text-green-400"></i>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    After Deployment
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                  Test your deployed project. Upload test cases and generate smoke test scripts.
                </p>
                <button
                  onClick={handleAfterDeploymentClick}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Explore
                </button>
              </div>
              {/* Connecting Arrows (Visual Roadmap) */}
              <div className="hidden md:flex absolute w-full justify-between px-4">
                <div className="flex-grow border-t-2 border-dashed border-gray-300 dark:border-gray-600 mx-2 mt-10"></div>
                <div className="flex-grow border-t-2 border-dashed border-gray-300 dark:border-gray-600 mx-2 mt-10"></div>
              </div>
            </div>
          </div>
        )}
        {/* Before Deployment Tab */}
        {activeTab === "before" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Config Panel */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg h-fit">
              <div className="flex items-center gap-2 mb-6">
                <i className="fas fa-cog text-orange-600 dark:text-orange-400"></i>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Test Configuration
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Select Repository <span className="text-rose-500">*</span>
                  </label>
                  <select
                    onChange={(e) => {
                      setSelectedRepo(e.target.value);
                      setSelectedBranch("");
                    }}
                    value={selectedRepo}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
                  >
                    <option value="">-- Select a Repository --</option>
                    {filteredRepos.map((r) => (
                      <option key={r.full_name} value={r.full_name}>
                        {r.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                {branches.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Select Branch <span className="text-rose-500">*</span>
                    </label>
                    <select
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      value={selectedBranch}
                      className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
                    >
                      <option value="">-- Select a Branch --</option>
                      {branches.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="pt-2">
                  <button
                    onClick={handleRunTests}
                    disabled={isRunning || !selectedRepo || !selectedBranch}
                    className={`w-full ${
                      isRunning
                        ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    } text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center space-x-2`}
                  >
                    {isRunning ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Running...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-play"></i>
                        <span>Run Smoke Tests</span>
                      </>
                    )}
                  </button>
                  {error && (
                    <div className="mt-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center space-x-2">
                      <i className="fas fa-exclamation-circle text-red-500"></i>
                      <span className="text-red-600 dark:text-red-400 text-sm">
                        {error}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* Tips */}
              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <i className="fas fa-lightbulb text-yellow-500 dark:text-yellow-400"></i>
                  <h3 className="font-bold text-gray-900 dark:text-white">Quick Tips</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <i className="fas fa-shield-alt text-emerald-600 dark:text-emerald-400 mt-1"></i>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-300">Critical Checks</p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Verifies essential files and build readiness</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="fas fa-download text-blue-600 dark:text-blue-400 mt-1"></i>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-300">Export Reports</p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Download detailed reports in PDF, DOCX, or JSON</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Results */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <i className="fas fa-chart-line text-orange-600 dark:text-orange-400"></i>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Current Report
                  </h3>
                </div>
                {report ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <div className="text-sm space-y-2">
                        <div><strong>Commit:</strong> {report.commit_id || "N/A"}</div>
                        <div><strong>Branch:</strong> {report.branch || selectedBranch}</div>
                        <div><strong>Status:</strong> {report.status || "Completed"}</div>
                      </div>
                    </div>
                    {/* Summary */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Critical Files:</span>
                        <span className={report.summary?.critical_files_present ? "text-green-600" : "text-red-600"}>
                          {report.summary?.critical_files_present ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Build Ready:</span>
                        <span className={report.summary?.build_ready_for_regression ? "text-green-600" : "text-red-600"}>
                          {report.summary?.build_ready_for_regression ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                    {/* Download Buttons */}
                    <div className="flex gap-2 pt-4">
                      <button onClick={() => downloadPDF(report)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1">
                        <i className="fas fa-file-pdf"></i> PDF
                      </button>
                      <button onClick={() => downloadDOCX(report)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1">
                        <i className="fas fa-file-word"></i> DOCX
                      </button>
                      <button
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
                          saveAs(blob, `smoke_report_${report.commit_id || "latest"}.json`);
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1"
                      >
                        <i className="fas fa-download"></i> JSON
                      </button>
                    </div>
                  </div>
                ) : (
                  <EmptyReport />
                )}
              </div>
            </div>
          </div>
        )}

        {/* After Deployment Tab */}
        {activeTab === "after" && (
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Smoke Testing After Deployment
            </h2>
            <form onSubmit={handleGenerateTests} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Project URL (Deployed)
                </label>
                <input
                  type="url"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  required
                  className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Test Cases (CSV/XLSX)
                </label>
                <input
                  type="file"
                  onChange={(e) => setTestCasesFile(e.target.files[0])}
                  accept=".csv,.xlsx"
                  required
                  className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-play"></i>
                    <span>Generate Smoke Tests</span>
                  </>
                )}
              </button>
            </form>
            {generateError && (
              <div className="mt-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center space-x-2">
                <i className="fas fa-exclamation-circle text-red-500"></i>
                <span className="text-red-600 dark:text-red-400 text-sm">{generateError}</span>
              </div>
            )}
            {generatedScript && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <i className="fab fa-python text-3xl text-blue-600 dark:text-blue-400"></i>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Python Script</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedScript);
                        toast.success("Copied!", { position: "top-right", autoClose: 2000 });
                      }}
                      className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-1 px-3 rounded-lg transition-all"
                    >
                      <i className="fas fa-copy"></i> Copy
                    </button>
                    <button
                      onClick={async () => {
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
                          toast.success('Docker run completed');
                        } catch (e) {
                          toast.error(e.message || 'Docker run failed');
                        } finally {
                          setIsRunning(false);
                        }
                      }}
                      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1 px-3 rounded-lg transition-all"
                    >
                      <i className="fas fa-play"></i> Run in Docker
                    </button>
                  </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-4 overflow-x-auto">
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
                <button
                  onClick={downloadScript}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  <i className="fas fa-download"></i>
                  <span>Download Script</span>
                </button>
              </div>
            )}
            {report && (
              <div className="mt-6 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Docker Run Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Total</div>
                    <div className="font-semibold">{Number(report.total_tests || report.total || 0)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Passed</div>
                    <div className="font-semibold text-emerald-600">{Number(report.passed || 0)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Failed</div>
                    <div className="font-semibold text-rose-600">{Number(report.failed || 0)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Duration</div>
                    <div className="font-semibold">{report.duration || "0s"}</div>
                  </div>
                </div>
                {report.json_report && report.json_report.summary && (
                  <div className="mt-4 text-xs text-gray-600 dark:text-gray-300">
                    <div>Pytest exit code: {Number(report.exit_code || 0)}</div>
                    <div>Collected: {Number(report.json_report.summary.collected || 0)}</div>
                    {typeof report.json_report.summary.error !== 'undefined' && (
                      <div>Errors: {Number(report.json_report.summary.error || 0)}</div>
                    )}
                  </div>
                )}
                {report.execution_logs && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-semibold">Execution Logs</summary>
                    <pre className="mt-2 max-h-64 overflow-auto text-xs bg-gray-100 dark:bg-gray-900/50 p-3 rounded">{report.execution_logs}</pre>
                  </details>
                )}
              </div>
            )}
            {generatedTestCases.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Test Cases</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-800">
                        <th className="py-2 px-4 text-left text-sm font-semibold">Scenario</th>
                        <th className="py-2 px-4 text-left text-sm font-semibold">Description</th>
                        <th className="py-2 px-4 text-left text-sm font-semibold">Expected Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedTestCases.map((tc, i) => (
                        <tr key={i} className="border-t">
                          <td className="py-2 px-4 text-sm">{tc.Scenario}</td>
                          <td className="py-2 px-4 text-sm">{tc["Scenario Description"]}</td>
                          <td className="py-2 px-4 text-sm">{tc["Expected Result"]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
