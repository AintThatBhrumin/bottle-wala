import { cookies } from "next/headers";

import { ACCESS_COOKIE, REFRESH_COOKIE, secureCookie } from "@/lib/auth/cookies";

const backendBaseUrl = process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000/api";

type BackendRequestOptions = {
  method?: string;
  path: string;
  body?: BodyInit | null;
  contentType?: string | null;
  accessToken?: string | null;
};

export async function backendRequest<T>({
  method = "GET",
  path,
  body,
  contentType = "application/json",
  accessToken
}: BackendRequestOptions): Promise<Response> {
  const headers = new Headers();

  if (contentType && !(body instanceof FormData)) {
    headers.set("Content-Type", contentType);
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return fetch(`${backendBaseUrl}/${path}`, {
    method,
    headers,
    body,
    cache: "no-store"
  });
}

export async function refreshAccessToken() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refresh) {
    return null;
  }

  const response = await backendRequest<{
    access: string;
    refresh?: string;
  }>({
    method: "POST",
    path: "auth/token/refresh/",
    body: JSON.stringify({ refresh })
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { access: string; refresh?: string };

  cookieStore.set(ACCESS_COOKIE, payload.access, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/"
  });

  if (payload.refresh) {
    cookieStore.set(REFRESH_COOKIE, payload.refresh, {
      httpOnly: true,
      sameSite: "lax",
      secure: secureCookie,
      path: "/"
    });
  }

  return payload;
}

export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE)?.value ?? null;
}
