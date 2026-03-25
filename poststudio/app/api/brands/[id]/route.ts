import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { cookies } from "next/headers"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  try {
    const brand = await db.brandProfile.update({
      where: { id, userId: session.user.id },
      data: body,
    })
    return NextResponse.json({ brand })
  } catch {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    await db.brandProfile.delete({
      where: { id, userId: session.user.id },
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 })
  }
}

// Set active brand
export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const brand = await db.brandProfile.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 })
  }

  const cookieStore = await cookies()
  cookieStore.set("activeBrandId", id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  })

  return NextResponse.json({ ok: true, activeBrandId: id })
}
