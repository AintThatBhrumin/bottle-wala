import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE, secureCookie } from "@/lib/auth/cookies";
import { backendRequest } from "@/lib/api/backend";

export async function POST(request: Request) {
  const payload = await request.json();

  const response = await backendRequest({
    method: "POST",
    path: "auth/login/",
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, data.access, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/"
  });
  cookieStore.set(REFRESH_COOKIE, data.refresh, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/"
  });
  cookieStore.set(ROLE_COOKIE, data.user.role, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/"
  });

  return NextResponse.json({ user: data.user }, { status: 200 });
}
