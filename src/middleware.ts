import { NextResponse } from "next/server";

// TODO: better-auth認証を後で有効化する
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/projects/:path*",
    "/admin/:path*",
  ],
};
