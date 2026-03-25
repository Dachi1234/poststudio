import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { cookies } from "next/headers"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only return posts that have been explicitly saved (template chosen)
  const posts = await db.generatedPost.findMany({
    where: {
      userId: session.user.id,
      NOT: { templateId: null },
    },
    include: { brand: { select: { id: true, name: true, primaryColor: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return NextResponse.json({ posts })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { platform, goal, brief, headline, caption, hashtags, cta, imageUrl, imageModel, templateId } = body

    const cookieStore = await cookies()
    let brandId = cookieStore.get("activeBrandId")?.value

    if (!brandId) {
      const firstBrand = await db.brandProfile.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "asc" },
      })
      brandId = firstBrand?.id
    }

    if (!brandId) {
      const defaultBrand = await db.brandProfile.create({
        data: { userId: session.user.id, name: "My Brand", isDefault: true },
      })
      brandId = defaultBrand.id
    }

    const post = await db.generatedPost.create({
      data: {
        userId: session.user.id,
        brandId,
        platform,
        goal,
        brief,
        headline,
        caption,
        hashtags: hashtags ?? [],
        cta,
        imageUrl,
        imageModel,
        templateId,
      },
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (err) {
    console.error("[POST /api/posts]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
