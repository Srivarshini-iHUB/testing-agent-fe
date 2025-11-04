import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function GithubConnect() {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    // Check if GitHub redirected back with ?user=...&token=...
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = params.get("user");

    if (token && user) {
      // Save token and user in localStorage
      localStorage.setItem("github_token", token);
      localStorage.setItem("github_user", user);
      setUsername(user);

      // Remove query params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // If already logged in previously
      const savedUser = localStorage.getItem("github_user");
      if (savedUser) setUsername(savedUser);
    }
  }, []);

  const handleConnect = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/github/login`);
      // Redirect browser to GitHub OAuth URL
      window.location.href = res.data.auth_url;
    } catch (err) {
      console.error("GitHub Connect Error:", err);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {username ? (
        <p className="text-green-600 font-semibold">
          ✅ Connected as {username}
        </p>
      ) : (
        <button
          onClick={handleConnect}
          className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          Connect GitHub
        </button>
      )}
    </div>
  );
}
