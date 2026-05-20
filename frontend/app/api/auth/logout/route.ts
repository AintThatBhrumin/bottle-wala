import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE } from "@/lib/auth/cookies";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
  cookieStore.delete(ROLE_COOKIE);

  return NextResponse.json({ success: true }, { status: 200 });
}
