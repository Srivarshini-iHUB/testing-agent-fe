import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

const SmokeTesting = () => {
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

  // Fetch repositories as soon as sessionToken is available
  useEffect(() => {
    const fetchRepos = async () => {
      if (!sessionToken) return;
      try {
        const res = await axios.get(`${API_BASE}/auth/repos`, {
          params: { session_token: sessionToken },
        });
        setRepos(res.data || []);
      } catch (err) {
        console.error(err);
        setMessage({ type: "error", text: "⚠️ Could not fetch repositories." });
      }
    };
    fetchRepos();
  }, [sessionToken]);

  // Fetch branches automatically when selectedRepo changes
  useEffect(() => {
    const fetchBranches = async () => {
      if (!selectedRepo || !sessionToken) return;
      const [owner, repo] = selectedRepo.split("/");
      try {
        const res = await axios.get(`${API_BASE}/auth/branches`, {
          params: { access_token: sessionToken, owner, repo },
        });
        const data = res.data;
        if (Array.isArray(data)) setBranches(data.map((b) => b.name));
        else if (data.branches) setBranches(data.branches.map((b) => b.name));
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
    const blob = new Blob([sarifJson], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "semgrep_report.sarif";
    link.click();
  };
  // Download CSV
const downloadCsv = () => {
  if (!scanResults.length) return;

  // Build CSV content
  const headers = ["Rule", "Message", "File", "Start Line", "End Line"];
  const rows = scanResults.map(r =>
    [r.rule, r.message, r.file, r.startLine, r.endLine]
      .map(field => `"${String(field).replace(/"/g, '""')}"`) // escape quotes
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

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        🔐 SAST Automation Dashboard
      </h1>

      {message.text && (
        <div
          className={`p-3 mb-4 rounded-md text-sm font-medium ${
            message.type === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {!sessionToken && (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Login with GitHub to start scanning your repositories.
          </p>
          <button
            onClick={handleLogin}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold transition"
          >
            Login with GitHub
          </button>
        </div>
      )}

      {sessionToken && (
        <>
          {/* Repo select */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">
              Repository
            </label>
            <select
              className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 dark:bg-gray-900 dark:text-white"
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

          {/* Branch select */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">
              Branch
            </label>
            <select
              className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 dark:bg-gray-900 dark:text-white"
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

          {/* Files input */}
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">
              Files/Folders to scan (comma-separated)
            </label>
            <textarea
              className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 dark:bg-gray-900 dark:text-white"
              placeholder="e.g. src/, app/, requirements.txt"
              value={filesInput}
              onChange={(e) => setFilesInput(e.target.value)}
            />
          </div>

          <button
            onClick={runScan}
            disabled={loading}
            className={`px-6 py-2 rounded-md font-semibold text-white transition ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Scanning..." : "Run Semgrep Scan"}
          </button>

          {scanResults.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-2">
  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
    Detected Issues
  </h2>
  <div className="flex gap-2">
    <button
      onClick={downloadSarif}
      className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
    >
      Download SARIF
    </button>
    <button
      onClick={downloadCsv}
      className="text-sm px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
    >
      Download CSV
    </button>
  </div>
</div>


              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 dark:border-gray-700 rounded-md">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="text-left p-2 border-b">Rule</th>
                      <th className="text-left p-2 border-b">Message</th>
                      <th className="text-left p-2 border-b">File</th>
                      <th className="text-left p-2 border-b">Start</th>
                      <th className="text-left p-2 border-b">End</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scanResults.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-2 border-b">{r.rule}</td>
                        <td className="p-2 border-b">{r.message}</td>
                        <td className="p-2 border-b">{r.file}</td>
                        <td className="p-2 border-b">{r.startLine}</td>
                        <td className="p-2 border-b">{r.endLine}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SmokeTesting;
