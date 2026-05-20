import { NextResponse } from "next/server";

import { refreshAccessToken } from "@/lib/api/backend";

export async function POST() {
  const refreshed = await refreshAccessToken();

  if (!refreshed) {
    return NextResponse.json(
      {
        error: {
          code: "token_refresh_failed",
          detail: "Unable to refresh the current session."
        }
      },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
