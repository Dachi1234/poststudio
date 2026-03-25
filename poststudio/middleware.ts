import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const PROTECTED = ["/create", "/history", "/onboarding", "/brands"]

export default auth((req) => {
  const { pathname } = req.nextUrl

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  )

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (req.auth && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/create", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/create",
    "/create/:path*",
    "/history",
    "/history/:path*",
    "/onboarding",
    "/onboarding/:path*",
    "/brands",
    "/brands/:path*",
    "/login",
    "/signup",
  ],
}
