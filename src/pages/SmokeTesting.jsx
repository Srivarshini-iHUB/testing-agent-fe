import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import axios from "axios";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

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

  console.log("report",report);
  

  // Get session token from localStorage or URL
  useEffect(() => {
    const storedToken = localStorage.getItem("session_token");
    if (storedToken) {
      setSessionToken(storedToken);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const token = params.get("session_token");
    if (token) {
      setSessionToken(token);
      localStorage.setItem("session_token", token);
      // Clean URL but stay on smoke testing page
      window.history.replaceState({}, document.title, "/smoke-testing");
    }
  }, []);

  // Fetch Repos
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
        params: { session_token: sessionToken } 
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
        .get(`${API_BASE}/auth/branches`, { params: { session_token: sessionToken, owner, repo } })
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

  
  // Run Smoke Test
  const handleRunTests = async () => {
    try {
      setIsRunning(true);
      setError("");
      setReport(null);
      const repoUrl = selectedRepo.startsWith("http") ? selectedRepo : `https://github.com/${selectedRepo}`;
      const res = await axios.post(`${API_BASE}/smoke/run`, {
        repo_url: repoUrl,
        branch: selectedBranch,
        commit_id: null
      });
      setReport(res.data || {});
      fetchReports(); // Refresh reports list
    } catch (err) {
      console.error(err);
      // attempt to show backend error message if present
      const msg = err?.response?.data?.detail || err.message || "Failed to run smoke tests";
      setError(msg);
    } finally {
      setIsRunning(false);
    }
  };

  // Helpers to flatten/format report fields into strings
  const stringifyItem = (item) => {
    if (!item && item !== 0) return "";
    if (typeof item === "string") return item;
    try {
      return JSON.stringify(item, null, 2);
    } catch {
      return String(item);
    }
  };

  // PDF generator using jsPDF with wrapping + pagination
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
              it.error || (it.missing && it.missing.join(", ")) || it.issue || stringifyItem(it);
            addParagraph(label + body);
          });
        }
      } else if (typeof content === "boolean") {
        addParagraph(content ? "✅ Yes" : "❌ No");
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

    // If LLM produced some raw text or fallback messages, include them
    if (summary._raw_llm_output) {
      addSection("LLM Raw Output", [ { file: "LLM", error: summary._raw_llm_output } ]);
    }

    // finalize
    const name = `smoke_report_${reportObj.commit_id || "latest"}.pdf`;
    doc.save(name);
  };

  // DOCX generator using docx + file-saver
  const downloadDOCX = async (reportObj) => {
    const summary = reportObj.summary || reportObj || {};

    const children = [];

    const pushParagraph = (text, bold = false) => {
      children.push(new Paragraph({
        children: [ new TextRun({ text: String(text), bold }) ]
      }));
    };

    pushParagraph("Smoke Test Report", true);
    pushParagraph(`Commit: ${reportObj.commit_id || "N/A"}`);
    pushParagraph(`Branch: ${reportObj.branch || selectedBranch || "N/A"}`);
    pushParagraph(`Overall Status: ${reportObj.status || "N/A"}`);
    children.push(new Paragraph({ text: "" })); // blank line

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
            const body = it.error || (it.missing && it.missing.join(", ")) || it.issue || stringifyItem(it);
            pushParagraph(`${idx + 1}. ${file}${body}`);
          }
        });
      }
      children.push(new Paragraph({ text: "" }));
    };

    const addBooleanSection = (title, val) => {
      pushParagraph(title, true);
      pushParagraph(val ? "✅ Yes" : "❌ No");
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
      sections: [{ properties: {}, children }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `smoke_report_${reportObj.commit_id || "latest"}.docx`);
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
            <span className="font-semibold text-gray-900 dark:text-white">Commit:</span>
            <span className="text-gray-600 dark:text-gray-300 font-mono text-xs">{report.commit_id?.substring(0, 8)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900 dark:text-white">Branch:</span>
            <span className="text-gray-600 dark:text-gray-300">{report.branch}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900 dark:text-white">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              report.status === 'completed' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
            }`}>
              {report.status}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">Critical Files</div>
              <div className={`text-sm font-semibold ${s.critical_files_present ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {s.critical_files_present ? '✅' : '❌'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">Build Ready</div>
              <div className={`text-sm font-semibold ${s.build_ready_for_regression ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {s.build_ready_for_regression ? '✅' : '❌'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="text-gray-500 dark:text-gray-400">Syntax Errors</div>
              <div className="font-semibold text-red-600 dark:text-red-400">{s.syntax_errors?.length || 0}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500 dark:text-gray-400">UI Issues</div>
              <div className="font-semibold text-blue-600 dark:text-blue-400">{s.ui_issues?.length || 0}</div>
            </div>
          </div>

          <div className="mt-2 text-gray-500 dark:text-gray-400 text-xs text-center">
            <small>Report generated by Gemini analysis</small>
          </div>
        </div>
      </div>
    );
  };

  // Empty Report Component
  const EmptyReport = () => (
    <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700/50 text-gray-600 dark:text-gray-400">
      <p>No smoke test report yet. Run a test to see the detailed report here.</p>
    </div>
  );

  // Login Screen
  if (!sessionToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-900 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl shadow-2xl p-12 border border-gray-200 dark:border-gray-700/50 text-center max-w-md">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-xl inline-block mb-6">
            <i className="fas fa-fire text-white text-3xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Welcome Back</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Sign in with GitHub to access your smoke testing dashboard</p>
          <a href={`${API_BASE}/auth/login?redirect_uri=${encodeURIComponent('http://localhost:5173/smoke-testing')}`}>
            <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 mx-auto">
              <i className="fab fa-github text-xl"></i>
              <span>Login with GitHub</span>
            </button>
          </a>
        </div>
      </div>
    );
  }

  // Dashboard
  const summary = report?.summary || report || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-900 text-gray-900 dark:text-white p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Back Button & Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="mb-4 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-300 font-semibold transition-all"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className="fas fa-fire text-4xl text-orange-600 dark:text-orange-400"></i>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Smoke Testing Agent</h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">AI-powered smoke testing for code quality and regression readiness</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Configuration Panel */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg h-fit">
            <div className="flex items-center gap-2 mb-6">
              <i className="fas fa-cog text-orange-600 dark:text-orange-400"></i>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Test Configuration</h2>
            </div>

            <div className="space-y-4">
              {/* Repository Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select Repository <span className="text-rose-500 dark:text-rose-400">*</span>
                </label>
                
                <select
                  onChange={(e) => { setSelectedRepo(e.target.value); setSelectedBranch(""); }}
                  value={selectedRepo}
                  className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
                >
                  <option value="">-- Select a Repository --</option>
                  {filteredRepos.map((r) => (
                    <option key={r.full_name} value={r.full_name}>{r.full_name}</option>
                  ))}
                </select>
                {selectedRepo && (
                  <div className="mt-2 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
                    <i className="fas fa-check-circle"></i>
                    <span>Repository selected: {selectedRepo}</span>
                  </div>
                )}
              </div>

              {/* Branch Selection */}
              {branches.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Select Branch <span className="text-rose-500 dark:text-rose-400">*</span>
                  </label>
                  <select
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    value={selectedBranch}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
                  >
                    <option value="">-- Select a Branch --</option>
                    {branches.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  {selectedBranch && (
                    <div className="mt-2 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
                      <i className="fas fa-check-circle"></i>
                      <span>Branch selected: {selectedBranch}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Run Test Button */}
              <div className="pt-2">
                <button
                  onClick={handleRunTests}
                  disabled={isRunning || !selectedRepo || !selectedBranch}
                  className={`w-full ${
                    isRunning
                      ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 "
                  } text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center space-x-2`}
                >
                  {isRunning ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Running Smoke Tests...</span>
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
                    <span className="text-red-600 dark:text-red-400 text-sm">{error}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Tips */}
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
                <div className="flex items-start gap-2">
                  <i className="fas fa-github text-gray-600 dark:text-gray-400 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-300">GitHub Integration</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Connect your repositories for automated testing</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <i className="fas fa-chart-line text-purple-600 dark:text-purple-400 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-300">Regression Ready</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Ensures code is ready for regression testing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Current Report */}
            <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <i className="fas fa-chart-line text-orange-600 dark:text-orange-400"></i>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Current Report</h3>
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
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Critical Files Present:</span>
                      <span className={`text-sm font-semibold ${summary.critical_files_present ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {summary.critical_files_present ? "✅ Yes" : "❌ No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Build Ready:</span>
                      <span className={`text-sm font-semibold ${summary.build_ready_for_regression ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {summary.build_ready_for_regression ? "✅ Yes" : "❌ No"}
                      </span>
                    </div>
                  </div>

                  {/* Detailed Summary */}
                  <div className="space-y-4">
                    {/* Syntax Errors */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <i className="fas fa-exclamation-triangle text-red-500"></i>
                        Syntax Errors ({summary.syntax_errors?.length || 0})
                      </h4>
                      {summary.syntax_errors && summary.syntax_errors.length > 0 ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                          {summary.syntax_errors.map((error, idx) => (
                            <div key={idx} className="text-xs text-red-800 dark:text-red-200 mb-2 last:mb-0">
                              <strong>{error.file}:</strong> {error.error}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <div className="text-xs text-green-800 dark:text-green-200 flex items-center gap-2">
                            <i className="fas fa-check-circle"></i>
                            No syntax errors found
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Missing Functions */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <i className="fas fa-functions text-orange-500"></i>
                        Missing Functions ({summary.missing_functions?.length || 0})
                      </h4>
                      {summary.missing_functions && summary.missing_functions.length > 0 ? (
                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                          {summary.missing_functions.map((func, idx) => (
                            <div key={idx} className="text-xs text-orange-800 dark:text-orange-200 mb-2 last:mb-0">
                              <strong>{func.file}:</strong> {func.missing?.join(", ") || "Missing functions detected"}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <div className="text-xs text-green-800 dark:text-green-200 flex items-center gap-2">
                            <i className="fas fa-check-circle"></i>
                            No missing functions found
                          </div>
                        </div>
                      )}
                    </div>

                    {/* UI Issues */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <i className="fas fa-palette text-blue-500"></i>
                        UI Issues ({summary.ui_issues?.length || 0})
                      </h4>
                      {summary.ui_issues && summary.ui_issues.length > 0 ? (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          {summary.ui_issues.map((issue, idx) => (
                            <div key={idx} className="text-xs text-blue-800 dark:text-blue-200 mb-3 last:mb-0">
                              <div className="font-semibold mb-1">{issue.file}:</div>
                              <div className="text-gray-700 dark:text-gray-300 leading-relaxed">{issue.issue}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <div className="text-xs text-green-800 dark:text-green-200 flex items-center gap-2">
                            <i className="fas fa-check-circle"></i>
                            No UI issues found
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Error Handling Issues */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <i className="fas fa-shield-alt text-purple-500"></i>
                        Error Handling Issues ({summary.error_handling_issues?.length || 0})
                      </h4>
                      {summary.error_handling_issues && summary.error_handling_issues.length > 0 ? (
                        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                          {summary.error_handling_issues.map((issue, idx) => (
                            <div key={idx} className="text-xs text-purple-800 dark:text-purple-200 mb-3 last:mb-0">
                              <div className="font-semibold mb-1">{issue.file}:</div>
                              <div className="text-gray-700 dark:text-gray-300 leading-relaxed">{issue.issue}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <div className="text-xs text-green-800 dark:text-green-200 flex items-center gap-2">
                            <i className="fas fa-check-circle"></i>
                            No error handling issues found
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Download Buttons */}
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => downloadPDF(report)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 text-sm"
                    >
                      <i className="fas fa-file-pdf"></i>
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={() => downloadDOCX(report)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 text-sm"
                    >
                      <i className="fas fa-file-word"></i>
                      <span>DOCX</span>
                    </button>
                    <button
                      onClick={() => {
                        const reportText = JSON.stringify(report, null, 2);
                        const blob = new Blob([reportText], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `smoke_report_${report.commit_id || 'latest'}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 text-sm"
                    >
                      <i className="fas fa-download"></i>
                      <span>JSON</span>
                    </button>
                  </div>
                </div>
              ) : (
                <EmptyReport />
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default SmokeTesting;
