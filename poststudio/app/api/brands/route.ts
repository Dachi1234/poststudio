import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { cookies } from "next/headers"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const brands = await db.brandProfile.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json({ brands })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      name,
      tagline,
      primaryColor,
      secondaryColor,
      accentColor,
      fontFamily,
      toneOfVoice,
      description,
      audience,
      logoUrl,
      websiteUrl,
    } = body

    if (!name) {
      return NextResponse.json({ error: "Brand name required" }, { status: 400 })
    }

    // Check if this is the first brand (make it default)
    const existing = await db.brandProfile.count({
      where: { userId: session.user.id },
    })
    const isDefault = existing === 0

    // If making this default, clear other defaults
    if (isDefault) {
      await db.brandProfile.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const brand = await db.brandProfile.create({
      data: {
        userId: session.user.id,
        name,
        tagline,
        primaryColor: primaryColor ?? "#FD8D6E",
        secondaryColor: secondaryColor ?? "#2E2E2E",
        accentColor: accentColor ?? "#5A8DEE",
        fontFamily: fontFamily ?? "Inter",
        toneOfVoice,
        description,
        audience,
        logoUrl,
        websiteUrl,
        isDefault,
      },
    })

    // Set active brand cookie
    const cookieStore = await cookies()
    cookieStore.set("activeBrandId", brand.id, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    })

    return NextResponse.json({ brand }, { status: 201 })
  } catch (err) {
    console.error("[POST /api/brands]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
