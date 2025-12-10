'use server'
import { signOut } from "next-auth/react";
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
  if (tokenRequired) {
    const session = await getServerSession(authOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let token: any = null;
    
    if (session?.user?.accessToken) {
      token = session.user.accessToken;
    }

    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token ?? ""}`;
    }
  }

  // Merge search params from path and req
  let url = `${API_BASE_URL}${path}`;

  if (req) {
    const baseUrl = new URL(`${API_BASE_URL}${path}`);
    const reqUrl = new URL(req.url);

    // Merge all search params
    reqUrl.searchParams.forEach((value, key) => {
      baseUrl.searchParams.append(key, value);
    });
    url = baseUrl.toString();
  }

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    ...(body && { body: multipart ? body : JSON.stringify(body) }),
    cache: "no-store",
  });
  
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
      if (typeof window !== "undefined") {
        await signOut({ callbackUrl: "/login?from=session_expired" });
      }
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
