import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/", "/profile"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn, sessionClaims } = await auth();
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Skip middleware for static assets and _next
  if (
    pathname.startsWith("/_next") ||
    pathname.match(
      /\.(js|ts|css|jpg|jpeg|png|svg|woff2?|ttf|ico|json|csv|txt|docx?|xlsx?|zip|webmanifest)$/
    )
  ) {
    return NextResponse.next();
  }

  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn({ returnBackUrl: url });
  }

  const isProfileCompleted = (sessionClaims as any)?.publicMetadata
    ?.isProfileCompleted;

  if (userId) {
    if (!isProfileCompleted && pathname !== "/profile") {
      return NextResponse.redirect(new URL("/profile", req.url));
    }

    if (isProfileCompleted && pathname === "/profile") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/:path*"],
};
