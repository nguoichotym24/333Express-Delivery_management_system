import { NextRequest, NextResponse } from "next/server"

export async function POST(_req: NextRequest) {
  // Clear auth cookie by setting empty value and maxAge=0
  const res = NextResponse.json({ ok: true }, { status: 200 })
  res.cookies.set({
    name: "auth_token",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  })
  return res
}

