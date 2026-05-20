import { NextResponse } from "next/server";

import { backendRequest, getAccessToken, refreshAccessToken } from "@/lib/api/backend";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

async function forward(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const search = new URL(request.url).search;
  const backendPath = `${path.join("/")}/${search}`;

  const contentType = request.headers.get("content-type");
  let body: BodyInit | null = null;

  if (request.method !== "GET" && request.method !== "HEAD") {
    if (contentType?.includes("multipart/form-data")) {
      body = await request.formData();
    } else {
      body = await request.text();
    }
  }

  let accessToken = await getAccessToken();
  if (!accessToken) {
    accessToken = (await refreshAccessToken())?.access ?? null;
  }

  let response = await backendRequest({
    method: request.method,
    path: backendPath,
    body,
    contentType,
    accessToken
  });

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed?.access) {
      response = await backendRequest({
        method: request.method,
        path: backendPath,
        body,
        contentType,
        accessToken: refreshed.access
      });
    }
  }

  const raw = await response.text();
  const responseType = response.headers.get("content-type") ?? "application/json";

  return new NextResponse(raw, {
    status: response.status,
    headers: {
      "Content-Type": responseType
    }
  });
}

export async function GET(request: Request, context: RouteContext) {
  return forward(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return forward(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return forward(request, context);
}
