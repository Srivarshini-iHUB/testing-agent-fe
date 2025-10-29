import axios from "./client";

export const githubAuthApi = {
  login: () => {
    window.location.href = "http://localhost:8000/auth/github/login";
  },
  getUser: async (code) => {
    const res = await axios.get(`/auth/github/callback?code=${code}`);
    return res.data;
  },
};
