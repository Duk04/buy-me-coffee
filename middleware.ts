import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/profile(.*)", "/"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const pathname = req.nextUrl.pathname;

  // Allow unauthenticated users to access sign-in
  if (!userId) {
    if (pathname.startsWith("/sign-in")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Check Clerk public metadata for profile completion
  const isProfileCompleted = (
    sessionClaims as {
      publicMetadata?: { isProfileCompleted?: boolean };
    }
  )?.publicMetadata?.isProfileCompleted;

  const isOnProfilePage = pathname.startsWith("/profile");
  const isOnSignInPage = pathname.startsWith("/sign-in");

  // If profile not completed, force user to /profile
  if (!isProfileCompleted && !isOnProfilePage && !isOnSignInPage) {
    return NextResponse.redirect(new URL("/profile", req.url));
  }

  // If profile completed, prevent access to /profile (redirect to main page)
  if (isProfileCompleted && isOnProfilePage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
