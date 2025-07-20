import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthSessionRoute = pathname === "/api/auth/session";
  
  // Skip authentication check for login page to avoid redirect loops
  if (pathname === "/login") {
    return NextResponse.next();
  }
  
  // Check if the current route requires authentication
  if (isAdminRoute || isAuthSessionRoute) {
    try {
      const session = await auth();
      
      if (!session?.user) {
        // For admin routes, redirect to login page
        if (isAdminRoute) {
          const loginUrl = new URL("/login", request.url);
          loginUrl.searchParams.set("callbackUrl", pathname);
          return NextResponse.redirect(loginUrl);
        }
        
        // For API auth session route, return 401 Unauthorized
        if (isAuthSessionRoute) {
          return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
          );
        }
      }
    } catch (error) {
      console.error("Middleware auth error:", error);
      
      // For admin routes, redirect to login on auth error
      if (isAdminRoute) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      // For API routes, return 500 error
      if (isAuthSessionRoute) {
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all admin routes
    "/admin/:path*",
    // Match auth session API route
    "/api/auth/session",
  ],
};
