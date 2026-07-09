import { ApiError, getToken } from "./client.js";

const BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const headers = { "ngrok-skip-browser-warning": "true" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}/files/images`, {
      method: "POST",
      headers,
      body: formData,
    });
  } catch {
    throw new ApiError(0, "网络连接失败，请确认后端已经启动");
  }

  let body;
  try {
    body = await res.json();
  } catch {
    throw new ApiError(0, `服务器返回异常(${res.status})`);
  }

  if (body.code !== 0) {
    throw new ApiError(body.code, body.message || "图片上传失败");
  }

  return body.data;
}
