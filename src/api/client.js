let token = localStorage.getItem("whu-token") || "";

export function setToken(t) {
  token = t;
  if (t) localStorage.setItem("whu-token", t);
  else localStorage.removeItem("whu-token");
}

export function getToken() {
  return token;
}

export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const BASE = "/api/v1";

export async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(0, "网络连接失败，请确认后端已启动");
  }

  let body;
  try {
    body = await res.json();
  } catch {
    throw new ApiError(0, `服务器返回异常 (${res.status})`);
  }

  if (body.code !== 0) {
    throw new ApiError(body.code, body.message || "未知错误");
  }

  return body.data;
}
