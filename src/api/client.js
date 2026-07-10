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

const BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";
const REQUEST_TIMEOUT_MS = 12_000;

export async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers, signal: controller.signal });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new ApiError(0, "请求超时，请稍后重试");
    }
    throw new ApiError(0, "网络连接失败，请确认后端已经启动");
  } finally {
    window.clearTimeout(timeoutId);
  }

  let body;
  try {
    body = await res.json();
  } catch {
    throw new ApiError(0, `服务器返回异常(${res.status})`);
  }

  if (body.code !== 0) {
    throw new ApiError(body.code, body.message || "未知错误");
  }

  return body.data;
}
