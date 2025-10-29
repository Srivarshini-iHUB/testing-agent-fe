import apiClient from "../api/client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export const githubLogin = () => {
  window.location.href = `${BACKEND_URL}/auth/login`;
};

// Called after redirect from backend
export const fetchRepos = async (sessionToken) => {
  const res = await apiClient.get(`/auth/repos?session_token=${sessionToken}`);
  return res.data;
};

export const fetchBranches = async (sessionToken, owner, repo) => {
  const res = await apiClient.get(
    `/auth/branches?access_token=${sessionToken}&owner=${owner}&repo=${repo}`
  );
  return res.data;
};
