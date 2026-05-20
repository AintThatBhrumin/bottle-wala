import { NextResponse } from "next/server";

import { ROLE_COOKIE, secureCookie } from "@/lib/auth/cookies";
import { backendRequest, getAccessToken, refreshAccessToken } from "@/lib/api/backend";

export async function GET() {
  let accessToken = await getAccessToken();

  if (!accessToken) {
    const refreshed = await refreshAccessToken();
    accessToken = refreshed?.access ?? null;
  }

  if (!accessToken) {
    return NextResponse.json(
      {
        error: {
          code: "not_authenticated",
          detail: "Authentication required."
        }
      },
      { status: 401 }
    );
  }

  let response = await backendRequest({
    path: "auth/me/",
    accessToken
  });

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed?.access) {
      return NextResponse.json(
        {
          error: {
            code: "not_authenticated",
            detail: "Authentication required."
          }
        },
        { status: 401 }
      );
    }

    response = await backendRequest({
      path: "auth/me/",
      accessToken: refreshed.access
    });
  }

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  const nextResponse = NextResponse.json({ user: data }, { status: 200 });
  nextResponse.cookies.set(ROLE_COOKIE, data.role, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/"
  });

  return nextResponse;
}
