import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function GitRepoBranchPicker() {
  const [repos, setRepos] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // ✅ Read username and token from localStorage or URL params after OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlUsername = params.get("username");
    const urlToken = params.get("access_token");

    if (urlUsername && urlToken) {
      localStorage.setItem("github_user", urlUsername);
      localStorage.setItem("github_token", urlToken);
      // Remove params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Fetch repos if token exists
    const username = localStorage.getItem("github_user");
    const token = localStorage.getItem("github_token");
    if (username && token) {
      fetchRepos(username, token);
    }
  }, []);

  // Fetch repositories
  const fetchRepos = async (username, token) => {
    if (!username || !token) return;
    try {
      setLoadingRepos(true);
      const res = await axios.get(`${API_URL}/auth/github/repos`, {
        params: { username },
        headers: { Authorization: `token ${token}` },
      });
      if (res.data.ok) setRepos(res.data.repos);
    } catch (err) {
      console.error("Failed to fetch repos:", err);
    } finally {
      setLoadingRepos(false);
    }
  };

  // Fetch branches for selected repo
  const fetchBranches = async (repo) => {
    const username = localStorage.getItem("github_user");
    const token = localStorage.getItem("github_token");
    if (!repo || !username || !token) return;

    try {
      setLoadingBranches(true);
      const res = await axios.get(`${API_URL}/auth/github/branches`, {
        params: { username, repo },
        headers: { Authorization: `token ${token}` },
      });
      if (res.data.ok) setBranches(res.data.branches);
    } catch (err) {
      console.error("Failed to fetch branches:", err);
    } finally {
      setLoadingBranches(false);
    }
  };

  return (
    <div className="p-4 border rounded-md bg-gray-50 space-y-3">
      <h3 className="font-semibold text-lg">📁 Select Git Repository</h3>

      {loadingRepos ? (
        <p>Loading repositories...</p>
      ) : (
        <select
          className="border p-2 rounded w-full"
          onChange={(e) => {
            setSelectedRepo(e.target.value);
            fetchBranches(e.target.value);
          }}
          value={selectedRepo}
        >
          <option value="">Select Repository</option>
          {repos.map((r) => (
            <option key={r.name} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
      )}

      {loadingBranches && <p>Loading branches...</p>}

      {branches.length > 0 && (
        <div>
          <h4 className="font-medium mt-2">🌿 Branches</h4>
          <ul className="list-disc pl-5">
            {branches.map((b) => (
              <li key={b.name}>{b.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
