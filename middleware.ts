import { NextResponse } from "next/server";
import { auth } from "@/auth";

const publicRoutes = new Set(["/", "/login", "/register", "/reset-password"]);

export default auth((request) => {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;
  const isLoggedIn = Boolean(request.auth);
  const isPublicRoute = publicRoutes.has(pathname);
  const isAuthRoute = pathname === "/login" || pathname === "/register" || pathname === "/reset-password";

  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${request.nextUrl.origin}${pathname}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isLoggedIn && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|html)$).*)"],
};
