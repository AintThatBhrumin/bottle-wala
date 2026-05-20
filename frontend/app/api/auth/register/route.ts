import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE, secureCookie } from "@/lib/auth/cookies";
import { backendRequest } from "@/lib/api/backend";

export async function POST(request: Request) {
  const payload = await request.json();

  const registerResponse = await backendRequest({
    method: "POST",
    path: "auth/register/",
    body: JSON.stringify(payload)
  });

  const registerData = await registerResponse.json();

  if (!registerResponse.ok) {
    return NextResponse.json(registerData, { status: registerResponse.status });
  }

  const loginResponse = await backendRequest({
    method: "POST",
    path: "auth/login/",
    body: JSON.stringify({
      email: payload.email,
      password: payload.password
    })
  });

  const loginData = await loginResponse.json();
  if (!loginResponse.ok) {
    return NextResponse.json(loginData, { status: loginResponse.status });
  }

  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, loginData.access, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/"
  });
  cookieStore.set(REFRESH_COOKIE, loginData.refresh, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/"
  });
  cookieStore.set(ROLE_COOKIE, loginData.user.role, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/"
  });

  return NextResponse.json({ user: loginData.user }, { status: loginResponse.status });
}
