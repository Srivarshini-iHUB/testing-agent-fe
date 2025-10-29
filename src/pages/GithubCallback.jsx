// src/pages/GithubCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GithubCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("session_token");

    if (token) {
      localStorage.setItem("session_token", token);
      navigate("/security-testing");
    } else {
      console.error("❌ No session token found in callback URL");
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen text-lg">
      Authenticating with GitHub...
    </div>
  );
}
