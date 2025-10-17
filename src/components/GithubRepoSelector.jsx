import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function GitRepoBranchPicker() {
  const [repos, setRepos] = useState([]);
  const [branches, setBranches] = useState([]);
  const [commits, setCommits] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCommit, setSelectedCommit] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [jestCode, setJestCode] = useState("");
  const [jestOutput, setJestOutput] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Load repos
  useEffect(() => {
    const username = localStorage.getItem("github_user");
    const token = localStorage.getItem("github_token");
    if (username && token) fetchRepos(username, token);
  }, []);

  const fetchRepos = async (username, token) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/auth/github/repos`, {
        headers: { Authorization: `token ${token}` },
      });
      if (res.data.ok) setRepos(res.data.repos);
    } catch (err) {
      console.error("Failed to fetch repos:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async (repo) => {
    const token = localStorage.getItem("github_token");
    if (!repo || !token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/auth/github/branches`, {
        params: { repo },
        headers: { Authorization: `token ${token}` },
      });
      if (res.data.ok) setBranches(res.data.branches);
    } catch (err) {
      console.error("Failed to fetch branches:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommits = async (repo, branch) => {
    const token = localStorage.getItem("github_token");
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/auth/github/commits`, {
        params: { repo, branch },
        headers: { Authorization: `token ${token}` },
      });
      if (res.data.ok) setCommits(res.data.commits);
    } catch (err) {
      console.error("Failed to fetch commits:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async (commitSha) => {
    const token = localStorage.getItem("github_token");
    if (!selectedRepo || !commitSha) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/auth/github/files`, {
        params: { repo: selectedRepo, commit_sha: commitSha },
        headers: { Authorization: `token ${token}` },
      });
      if (res.data.ok) setFiles(res.data.files);
    } catch (err) {
      console.error("Failed to fetch files:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateAndRunTests = async (fileUrl, filename) => {
    try {
      setStatusMessage(`⚙️ Generating Jest tests for ${filename}...`);
      const fileCode = await axios.get(fileUrl);

      // Step 1: Generate Jest code via backend agent
      const jestRes = await axios.post(`${API_URL}/unittest/generate`, {
        js_code: fileCode.data,
      });
      const jestCode = jestRes.data.jest_code || jestRes.data.output || "";
      setJestCode(jestCode);

      // Step 2: Run Jest tests
      setStatusMessage("🚀 Running Jest tests...");
      const runRes = await axios.post(`${API_URL}/unittest/run`, {
        js_code: fileCode.data,
        jest_code: jestCode,
        file_path: filename,
      });

      setJestOutput(JSON.stringify(runRes.data, null, 2));
      setStatusMessage("✅ Test completed!");
    } catch (err) {
      console.error("Test generation or execution failed:", err);
      setStatusMessage("❌ Error running tests.");
    }
  };

  return (
    <div className="p-4 border rounded-md bg-gray-50 space-y-4">
      <h3 className="font-semibold text-lg">📂 Git Repository</h3>

      {/* Repos */}
      <select
        className="border p-2 rounded w-full"
        value={selectedRepo}
        onChange={(e) => {
          const repo = e.target.value;
          setSelectedRepo(repo);
          setBranches([]);
          setCommits([]);
          setFiles([]);
          fetchBranches(repo);
        }}
      >
        <option value="">Select Repository</option>
        {repos.map((r) => (
          <option key={r.full_name} value={r.full_name}>
            {r.full_name}
          </option>
        ))}
      </select>

      {/* Branches */}
      {branches.length > 0 && (
        <select
          className="border p-2 rounded w-full"
          value={selectedBranch}
          onChange={(e) => {
            const branch = e.target.value;
            setSelectedBranch(branch);
            fetchCommits(selectedRepo, branch);
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

      {/* Commits */}
      {commits.length > 0 && (
        <div className="border-t pt-3">
          <h4 className="font-semibold mb-2">🕒 Commits</h4>
          <ul className="space-y-1">
            {commits.map((c) => (
              <li key={c.sha}>
                <button
                  className={`text-left w-full px-2 py-1 rounded ${
                    selectedCommit === c.sha
                      ? "bg-blue-100"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setSelectedCommit(c.sha);
                    setFiles([]);
                    fetchFiles(c.sha);
                  }}
                >
                  <strong>{c.message}</strong> — {c.author} (
                  {new Date(c.date).toLocaleString()})
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Files */}
      {files.length > 0 && (
        <div className="border-t pt-3">
          <h4 className="font-semibold mb-2">📄 Changed Files</h4>
          <ul className="space-y-1">
            {files.map((f) => (
              <li key={f.filename}>
                <button
                  className={`text-left w-full px-2 py-1 rounded ${
                    selectedFile === f.filename
                      ? "bg-blue-100"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setSelectedFile(f.filename);
                    generateAndRunTests(f.raw_url, f.filename);
                  }}
                >
                  {f.filename} ({f.status})
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Results */}
      {statusMessage && (
        <p className="text-sm text-gray-700 italic mt-2">{statusMessage}</p>
      )}

      {jestCode && (
        <div className="mt-3">
          <h4 className="font-semibold text-lg mb-1">🧪 Generated Jest Code</h4>
          <pre className="bg-black text-green-400 p-3 rounded overflow-x-auto text-sm whitespace-pre-wrap">
            {jestCode}
          </pre>
        </div>
      )}

      {jestOutput && (
        <div className="mt-3">
          <h4 className="font-semibold text-lg mb-1">📊 Jest Test Output</h4>
          <pre className="bg-gray-900 text-white p-3 rounded overflow-x-auto text-sm whitespace-pre-wrap">
            {jestOutput}
          </pre>
        </div>
      )}
    </div>
  );
}
