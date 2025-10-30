// client/src/api/user.api.js
const BASE_URL = import.meta.env.VITE_SERVER_URL;

const API = (path) =>
  `${BASE_URL?.replace(/\/?$/, "/")}${String(path).replace(/^\//, "")}`;

export async function register(data) {
  const res = await fetch(API("user/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function login({ data, password }) {
  const res = await fetch(API("user/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // ✅ cookies
    body: JSON.stringify({ data, password }),
  });
  return res.json();
}

export async function currentUser() {
  const res = await fetch(API("user/current"), {
    credentials: "include", // ✅ cookies
  });
  return res.json();
}

export async function logout() {
  const res = await fetch(API("user/logout"), {
    method: "POST",
    credentials: "include",
  });
  return res.json();
}

export async function updateProfile(payload) {
  const res = await fetch(API("user/profile"), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function googleAuth(token) {
  const res = await fetch(API("user/google"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token }),
  });
  return res.json();
}
