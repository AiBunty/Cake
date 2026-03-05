import { NextRequest, NextResponse } from "next/server";

const APPS_SCRIPT_BASE_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_BASE_URL || "";
const APPS_SCRIPT_API_KEY =
  process.env.APPS_SCRIPT_API_KEY || process.env.NEXT_PUBLIC_APPS_SCRIPT_API_KEY || "";

const buildTargetUrl = (request: NextRequest) => {
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(APPS_SCRIPT_BASE_URL);

  incomingUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  if (APPS_SCRIPT_API_KEY && !targetUrl.searchParams.has("x-api-key")) {
    targetUrl.searchParams.set("x-api-key", APPS_SCRIPT_API_KEY);
  }

  return targetUrl.toString();
};

export async function GET(request: NextRequest) {
  try {
    if (!APPS_SCRIPT_BASE_URL) {
      return NextResponse.json(
        { ok: false, error: "Apps Script URL is not configured" },
        { status: 500 }
      );
    }

    const targetUrl = buildTargetUrl(request);
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "x-api-key": APPS_SCRIPT_API_KEY,
      },
      cache: "no-store",
    });

    const responseText = await response.text();

    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown proxy error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!APPS_SCRIPT_BASE_URL) {
      return NextResponse.json(
        { ok: false, error: "Apps Script URL is not configured" },
        { status: 500 }
      );
    }

    const targetUrl = buildTargetUrl(request);
    const body = await request.text();

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": APPS_SCRIPT_API_KEY,
      },
      body,
      cache: "no-store",
    });

    const responseText = await response.text();

    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown proxy error",
      },
      { status: 500 }
    );
  }
}
