import { type NextRequest, NextResponse } from "next/server"

// Proxy login to standalone backend (Express)
// Backend base URL: process.env.NEXT_PUBLIC_API_BASE_URL or http://localhost:4000
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // Pass through credentials if needed
    })
    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }
    const response = NextResponse.json(data.user, { status: 200 })
    if (data.token) {
      response.cookies.set({
        name: "auth_token",
        value: data.token,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
    }
    return response
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
