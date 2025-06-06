import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/profile(.*)", "/"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  const pathname = req.nextUrl.pathname;

  if (!userId) {
    if (pathname.startsWith("/sign-in")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const isProfileCompleted = (
    sessionClaims as {
      metadata?: { isProfileCompleted?: boolean };
    }
  )?.metadata?.isProfileCompleted;

  const isOnProfilePage = pathname.startsWith("/profile");
  const isOnSignInPage = pathname.startsWith("/sign-in");
  const isOnHomePage = pathname === "/";

  if (!isProfileCompleted && !isOnProfilePage && !isOnSignInPage) {
    return NextResponse.redirect(new URL("/profile", req.url));
  }
  if (isProfileCompleted && isOnProfilePage && !isOnHomePage) {
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
