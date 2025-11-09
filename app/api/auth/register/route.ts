import { type NextRequest, NextResponse } from "next/server"

// Proxy register to standalone backend (Express)
// Backend base URL: process.env.NEXT_PUBLIC_API_BASE_URL or http://localhost:4000
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Create user in backend
    const reg = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const regData = await reg.json().catch(() => ({}))
    if (!reg.ok) {
      return NextResponse.json(regData, { status: reg.status })
    }

    // Best-effort login immediately to issue auth cookie
    try {
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: body?.email, password: body?.password }),
      })
      const loginData = await loginRes.json().catch(() => ({}))
      if (loginRes.ok && loginData?.token) {
        const response = NextResponse.json(regData, { status: 201 })
        response.cookies.set({
          name: "auth_token",
          value: String(loginData.token),
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        })
        return response
      }
    } catch {
      // Ignore login failure, still return created user
    }

    // Fallback: return user without setting cookie
    return NextResponse.json(regData, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

