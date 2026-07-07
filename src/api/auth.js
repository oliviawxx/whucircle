import { request, setToken, getToken } from "./client.js";

export async function sendEmailCode(email) {
  return request("/auth/email-code", {
    method: "POST",
    body: JSON.stringify({ email, scene: "REGISTER" }),
  });
}

export async function register(email, code, password, nickname) {
  const data = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, code, password, nickname }),
  });
  setToken(data.accessToken);
  return data;
}

export async function login(email, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.accessToken);
  return data;
}

export async function getMe() {
  return request("/auth/me");
}

export async function logout() {
  try {
    await request("/auth/logout", { method: "POST" });
  } catch {
    // 即使后端登出失败也清理本地 token
  }
  setToken("");
}
