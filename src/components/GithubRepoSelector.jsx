// src/components/GithubRepoSelector.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function GitRepoBranchPicker() {
  // ----- state (plain JS) -----
  const [repos, setRepos] = useState([]);
  const [branches, setBranches] = useState([]);
  const [commits, setCommits] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [jestCode, setJestCode] = useState("");
  const [jestReport, setJestReport] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  /* ------------------------------------------------------------------ */
  /*  Load repos on mount (token already in localStorage)               */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const token = localStorage.getItem("github_token");
    if (token) fetchRepos(token);
  }, []);

  const fetchRepos = async (token) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/auth/github/repos`, {
        headers: { Authorization: `token ${token}` },
      });
      if (data.ok) setRepos(data.repos);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async (repo) => {
    const token = localStorage.getItem("github_token");
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/auth/github/branches`, {
        params: { repo },
        headers: { Authorization: `token ${token}` },
      });
      if (data.ok) setBranches(data.branches);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommits = async (repo, branch) => {
    const token = localStorage.getItem("github_token");
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/auth/github/commits`, {
        params: { repo, branch },
        headers: { Authorization: `token ${token}` },
      });
      if (data.ok) setCommits(data.commits);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async (commitSha) => {
    const token = localStorage.getItem("github_token");
    if (!selectedRepo) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/auth/github/files`, {
        params: { repo: selectedRepo, commit_sha: commitSha },
        headers: { Authorization: `token ${token}` },
      });
      if (data.ok) setFiles(data.files);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Click a file → generate + run Jest in ONE call                     */
  /* ------------------------------------------------------------------ */
  const handleFileClick = async (file) => {
    setSelectedFile(file.filename);
    setStatus("Generating Jest tests …");

    const token = localStorage.getItem("github_token");
    const parts = selectedRepo.split("/");
    const owner = parts[0];
    const repo = parts[1];

    const form = new FormData();
    form.append("owner", owner);
    form.append("repo", repo);
    form.append("path", file.filename);
    form.append("ref", selectedCommit.sha);
    form.append("run_jest", "true");

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/unit-test/run-jest`, {
        method: "POST",
        headers: { Authorization: `token ${token}` },
        body: form,
      });
      const payload = await res.json();

      if (!payload.ok) {
        throw new Error(payload.detail || "unknown error");
      }

      // `jest_code` is not returned by the endpoint any more
      setJestCode(payload.jest_code || "");
      setJestReport(payload.json_report);
      setStatus("Tests finished");
    } catch (e) {
      setStatus(`Error: ${e.message}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  UI                                                               */
  /* ------------------------------------------------------------------ */
  return (
    <div className="p-4 border rounded-md bg-gray-50 space-y-4 max-w-4xl mx-auto">
      <h3 className="font-semibold text-lg">Git Repository Picker</h3>

      {/* ── REPOS ── */}
      <select
        className="border p-2 rounded w-full"
        value={selectedRepo}
        onChange={(e) => {
          const v = e.target.value;
          setSelectedRepo(v);
          setBranches([]);
          setCommits([]);
          setFiles([]);
          if (v) fetchBranches(v);
        }}
      >
        <option value="">Select Repo</option>
        {repos.map((r) => (
          <option key={r.full_name} value={r.full_name}>
            {r.full_name}
          </option>
        ))}
      </select>

      {/* ── BRANCHES ── */}
      {branches.length > 0 && (
        <select
          className="border p-2 rounded w-full"
          value={selectedBranch}
          onChange={(e) => {
            const b = e.target.value;
            setSelectedBranch(b);
            fetchCommits(selectedRepo, b);
          }}
        >
          <option value="">Select Branch</option>
          {branches.map((b) => (
            <option key={b.name} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>
      )}

      {/* ── COMMITS ── */}
      {commits.length > 0 && (
        <div className="border-t pt-3">
          <h4 className="font-semibold mb-2">Commits (last 5)</h4>
          <ul className="space-y-1 max-h-48 overflow-y-auto">
            {commits.map((c) => (
              <li key={c.sha}>
                <button
                  className={`text-left w-full px-2 py-1 rounded ${
                    selectedCommit && selectedCommit.sha === c.sha
                      ? "bg-blue-100"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setSelectedCommit(c);
                    setFiles([]);
                    fetchFiles(c.sha);
                  }}
                >
                  <strong>{c.message.split("\n")[0]}</strong> — {c.author}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── CHANGED FILES ── */}
      {files.length > 0 && (
        <div className="border-t pt-3">
          <h4 className="font-semibold mb-2">JS/TS files changed</h4>
          <ul className="space-y-1">
            {files.map((f) => (
              <li key={f.filename}>
                <button
                  className={`text-left w-full px-2 py-1 rounded text-sm ${
                    selectedFile === f.filename ? "bg-blue-100" : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleFileClick(f)}
                >
                  {f.filename}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── STATUS ── */}
      {status && <p className="text-sm italic">{status}</p>}

      {/* ── JEST CODE (optional) ── */}
      {jestCode && (
        <div className="mt-4">
          <h4 className="font-semibold mb-1">Generated Jest</h4>
          <pre className="bg-black text-green-400 p-3 rounded overflow-x-auto text-xs">
            {jestCode}
          </pre>
        </div>
      )}

      {/* ── TEST RESULT ── */}
      {jestReport && (
        <div className="mt-4 border-t pt-3">
          <h4 className="font-semibold mb-2">Test Result</h4>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2 mb-3 text-center">
            <div className="p-2 bg-green-100 rounded">
              <div className="text-2xl font-bold text-green-700">
                {(jestReport.numPassedTests !== undefined ? jestReport.numPassedTests : 0)}
              </div>
              <div className="text-xs">Passed</div>
            </div>
            <div className="p-2 bg-red-100 rounded">
              <div className="text-2xl font-bold text-red-700">
                {(jestReport.numFailedTests !== undefined ? jestReport.numFailedTests : 0)}
              </div>
              <div className="text-xs">Failed</div>
            </div>
            <div className="p-2 bg-blue-100 rounded">
              <div className="text-2xl font-bold text-blue-700">
                {(jestReport.numTotalTests !== undefined ? jestReport.numTotalTests : 0)}
              </div>
              <div className="text-xs">Total</div>
            </div>
          </div>

          {/* Individual assertions */}
          {jestReport.testResults &&
            jestReport.testResults.map((suite, i) => (
              <details key={i} className="mb-2">
                <summary className="cursor-pointer font-medium">
                  {suite.name} ({suite.assertionResults.length} tests)
                </summary>
                <ul className="ml-4 mt-1 space-y-1">
                  {suite.assertionResults.map((a, j) => (
                    <li
                      key={j}
                      className={`text-sm p-1 rounded ${
                        a.status === "passed"
                          ? "bg-green-50 text-green-800"
                          : "bg-red-50 text-red-800"
                      }`}
                    >
                      {a.status === "passed" ? "Pass" : "Fail"} {a.title}
                      {a.failureMessages && a.failureMessages.length > 0 && (
                        <pre className="mt-1 text-xs whitespace-pre-wrap">
                          {a.failureMessages.join("\n")}
                        </pre>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
        </div>
      )}

      {loading && <p className="text-gray-500">Loading…</p>}
    </div>
  );
} 