import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { cookies } from "next/headers"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const cookieStore = await cookies()
  const activeBrandId = cookieStore.get("activeBrandId")?.value

  const [user, brands] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, plan: true, avatarUrl: true, createdAt: true },
    }),
    db.brandProfile.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    }),
  ])

  const activeBrand =
    brands.find((b) => b.id === activeBrandId) ??
    brands.find((b) => b.isDefault) ??
    brands[0] ??
    null

  return NextResponse.json({ user, brands, activeBrand })
}
