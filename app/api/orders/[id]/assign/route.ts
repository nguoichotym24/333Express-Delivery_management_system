import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get("auth_token")?.value
    const body = await req.json()
    const { id } = params
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
