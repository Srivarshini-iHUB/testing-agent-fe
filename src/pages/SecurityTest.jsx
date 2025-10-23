import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

const SecurityTesting = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [sessionToken, setSessionToken] = useState("");
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [filesInput, setFilesInput] = useState("");
  const [scanResults, setScanResults] = useState([]);
  const [sarifJson, setSarifJson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Read session_token from URL on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("session_token");
    if (token) {
      setSessionToken(token);
      setMessage({ type: "success", text: "✅ Logged in successfully via GitHub" });
    }
  }, []);

  // Fetch repositories when sessionToken is available
  useEffect(() => {
    const fetchRepos = async () => {
      if (!sessionToken) return;
      try {
        const res = await axios.get(`${API_BASE}/auth/repos`, {
          params: { session_token: sessionToken },
        });
        const reposData = Array.isArray(res.data) ? res.data : res.data.repos || [];
        setRepos(reposData);
        if (reposData.length === 0) {
          setMessage({ type: "error", text: "⚠️ No repositories found for this user." });
        }
      } catch (err) {
        console.error(err);
        setMessage({ type: "error", text: "⚠️ Could not fetch repositories." });
      }
    };
    fetchRepos();
  }, [sessionToken]);

  // Fetch branches when selectedRepo changes
  useEffect(() => {
    const fetchBranches = async () => {
      if (!selectedRepo || !sessionToken) return;
      const [owner, repo] = selectedRepo.split("/");
      try {
        const res = await axios.get(`${API_BASE}/auth/branches`, {
          params: { access_token: sessionToken, owner, repo },
        });
        const data = res.data;
        if (Array.isArray(data)) setBranches(data.map((b) => (b.name ? b.name : b)));
        else if (data.branches) setBranches(data.branches.map((b) => (b.name ? b.name : b)));
        else setBranches([]);
      } catch (err) {
        console.error(err);
        setMessage({ type: "error", text: "⚠️ Could not fetch branches." });
      }
    };
    fetchBranches();
  }, [selectedRepo, sessionToken]);

  // Run Semgrep scan
  const runScan = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    setScanResults([]);
    setSarifJson(null);

    const filesList = filesInput
      ? filesInput.split(",").map((f) => f.trim())
      : null;

    const payload = {
      repo_url: `https://github.com/${selectedRepo}.git`,
      token: sessionToken,
      branch: selectedBranch,
      files: filesList,
    };

    try {
      const res = await axios.post(`${API_BASE}/scan/advanced`, payload);
      const data = res.data;

      if (!data.sarif) {
        setMessage({ type: "error", text: "❌ Scan failed or no SARIF output." });
        setLoading(false);
        return;
      }

      const sarif = JSON.parse(data.sarif);
      setSarifJson(data.sarif);

      const results = [];
      sarif.runs?.forEach((run) => {
        run.results?.forEach((result) => {
          const loc = result.locations?.[0]?.physicalLocation || {};
          const region = loc.region || {};
          results.push({
            rule: result.ruleId,
            message: result.message?.text || "",
            file: loc.artifactLocation?.uri || "",
            startLine: region.startLine,
            endLine: region.endLine,
          });
        });
      });

      setScanResults(results);
      setMessage({
        type: "success",
        text:
          results.length > 0
            ? `🔍 Found ${results.length} issues`
            : "✅ No issues found in scan results!",
      });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "❌ Error running scan. Check backend logs." });
    }
    setLoading(false);
  };

  // Download SARIF
  const downloadSarif = () => {
    if (!sarifJson) return;
    const blob = new Blob([sarifJson], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "semgrep_report.sarif";
    link.click();
  };

  // Download CSV
  const downloadCsv = () => {
    if (!scanResults.length) return;
    const headers = ["Rule", "Message", "File", "Start Line", "End Line"];
    const rows = scanResults.map((r) =>
      [r.rule, r.message, r.file, r.startLine, r.endLine]
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "semgrep_report.csv";
    link.click();
  };

  // GitHub login redirect
  const handleLogin = () => {
    window.location.href = `${API_BASE}/auth/login`;
  };

  // Logout function
  const handleLogout = () => {
    setSessionToken("");
    setSelectedRepo("");
    setSelectedBranch("");
    setFilesInput("");
    setScanResults([]);
    setSarifJson(null);
    setMessage({ type: "", text: "" });
    navigate("/");
  };

  // Login Screen
  if (!sessionToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg text-center max-w-md">
          <h2 className="text-3xl font-bold mb-4">Welcome Back</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Sign in with GitHub to access your security testing dashboard
          </p>
          <button
            onClick={handleLogin}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition"
          >
            Login with GitHub
          </button>
        </div>
      </div>
    );
  }

  // Main Dashboard UI
  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto">
        {/* Back & Logout */}
        <div className="flex justify-between mb-6">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            ← Back to Dashboard
          </button>
          {/* <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button> */}
        </div>

        {/* Header */}
        <h1 className="text-3xl font-bold mb-6">Security Testing Dashboard</h1>

        {/* Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Scan Configuration */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-6 border border-gray-200 dark:border-gray-700">
          {/* Repository */}
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Repository</label>
            <select
              className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600"
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
            >
              <option value="">-- Select Repository --</option>
              {repos.map((r) => (
                <option key={r.full_name} value={r.full_name}>
                  {r.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Branch */}
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Branch</label>
            <select
              className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="">-- Select Branch --</option>
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Files */}
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Files/Folders to scan</label>
            <textarea
              className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600"
              value={filesInput}
              onChange={(e) => setFilesInput(e.target.value)}
              rows={3}
              placeholder="e.g. src/, app/, requirements.txt"
            />
          </div>

          {/* Run Scan */}
          <button
            onClick={runScan}
            disabled={loading || !selectedRepo || !selectedBranch}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading ? "Scanning..." : "Run Security Scan"}
          </button>
        </div>

        {/* Results */}
        {scanResults.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold text-lg">Detected Security Issues</h2>
              <div className="flex gap-2">
                <button
                  onClick={downloadSarif}
                  className="px-4 py-2 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/30 transition"
                >
                  Download SARIF
                </button>
                <button
                  onClick={downloadCsv}
                  className="px-4 py-2 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-500/30 transition"
                >
                  Download CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-4">Rule</th>
                    <th className="text-left py-2 px-4">Message</th>
                    <th className="text-left py-2 px-4">File</th>
                    <th className="text-left py-2 px-4">Start Line</th>
                    <th className="text-left py-2 px-4">End Line</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {scanResults.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-2 px-4">{r.rule}</td>
                      <td className="py-2 px-4">{r.message}</td>
                      <td className="py-2 px-4 font-mono">{r.file}</td>
                      <td className="py-2 px-4">{r.startLine}</td>
                      <td className="py-2 px-4">{r.endLine}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityTesting;