import { type NextRequest, NextResponse } from "next/server"
import users from "@/data/users.json"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const user = users.users.find((u: any) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
