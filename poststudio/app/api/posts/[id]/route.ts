import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  try {
    const post = await db.generatedPost.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ post })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  try {
    const body = await req.json()
    const { templateId, colorTheme, imageUrl, imageModel, isSaved, exportedAt, canvasState } = body

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {}
    if (templateId   !== undefined) data.templateId   = templateId
    if (colorTheme   !== undefined) data.colorTheme   = colorTheme
    if (imageUrl     !== undefined) data.imageUrl     = imageUrl
    if (imageModel   !== undefined) data.imageModel   = imageModel
    if (isSaved      !== undefined) data.isSaved      = isSaved
    if (exportedAt   !== undefined) data.exportedAt   = new Date(exportedAt)
    if (canvasState  !== undefined) data.canvasState  = canvasState

    const post = await db.generatedPost.update({
      where: { id, userId: session.user.id },
      data,
    })
    return NextResponse.json({ post })
  } catch {
    return NextResponse.json({ error: "Post not found" }, { status: 404 })
  }
}
