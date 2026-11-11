import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";

type ApiFetcherOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  tokenRequired?: boolean;
  headers?: Record<string, string>;
  multipart?: boolean;
};

const API_BASE_URL = process.env.API_SIAKAD_URL || "https://api.uinmataram.ac.id";
const API_KEY = process.env.API_SIAKAD_KEY;

let cachedSystemToken: { token: string; expiresAt: number } | null = null;

async function getSiakadSystemToken(): Promise<string | null> {
  const username = process.env.API_SIAKAD_USERNAME;
  const password = process.env.API_SIAKAD_PASSWORD;
  const apiKey = API_KEY;

  if (!username || !password || !apiKey) return null;

  // Gunakan cached token jika masih valid (buffer 60 detik)
  if (cachedSystemToken && Date.now() < cachedSystemToken.expiresAt - 60000) {
    return cachedSystemToken.token;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Gagal login sistem ke SIAKAD:", res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    const token = data?.token || data?.accessToken || data?.data?.token;
    const expiresIn = Number(data?.expiresIn) || 900;

    if (token) {
      cachedSystemToken = {
        token,
        expiresAt: Date.now() + expiresIn * 1000,
      };
      return token;
    }
  } catch (error) {
    console.error("Error mengambil token sistem SIAKAD:", error);
  }

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiFetcher<T = any>(
  path: string,
  options: ApiFetcherOptions = {},
  req?: NextRequest,
): Promise<T> {
  const {
    method = "GET",
    body,
    tokenRequired = false,
    headers = {},
    multipart = false,
  } = options;

  const finalHeaders: Record<string, string> = multipart
    ? {
      ...headers,
    }
    : {
      "Content-Type": "application/json",
      ...headers,
    };

  if (API_KEY) {
    if (!finalHeaders["X-API-Key"] && !finalHeaders["X-API-KEY"]) {
      finalHeaders["X-API-Key"] = API_KEY;
    }
  }

  if (tokenRequired) {
    let token: string | null = null;

    // Prioritaskan token sistem SIAKAD yang valid dan otomatis diperbarui
    token = await getSiakadSystemToken();

    // Fallback ke token session pengguna jika token sistem tidak tersedia
    if (!token) {
      try {
        const session = await getServerSession(authOptions);
        if (session?.user?.accessToken) {
          token = session.user.accessToken;
        }
      } catch {
        // Abaikan error session
      }
    }

    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${path}`;

  let res = await fetch(url, {
    method,
    headers: finalHeaders,
    ...(body && { body: multipart ? body : JSON.stringify(body) }),
    cache: "no-store",
  });

  // Jika 401 unauthorized (misal token JWT expired), refresh token sistem dan retry 1 kali
  if (res.status === 401 && tokenRequired) {
    cachedSystemToken = null;
    const freshToken = await getSiakadSystemToken();
    if (freshToken) {
      finalHeaders["Authorization"] = `Bearer ${freshToken}`;
      res = await fetch(url, {
        method,
        headers: finalHeaders,
        ...(body && { body: multipart ? body : JSON.stringify(body) }),
        cache: "no-store",
      });
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    if (
      errorData?.message === "Validation failed" ||
      errorData?.code === "VALIDATION_ERROR"
    ) {
      const validationError = new Error("Validation failed");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (validationError as any).details = errorData;
      throw validationError;
    }

    if (errorData?.message === "Unauthorized") {
      throw new Error("Your session has expired. Please log in again.");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = new Error(errorData?.message || res.statusText) as any;
    err.status = res.status;
    err.code = errorData?.code;
    throw err;
  }

  return res.json();
}
