import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = ["/", "/store", "/sign-in", "/category"].includes(nextUrl.pathname);
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  // 1. Allow all API Auth routes
  if (isApiAuthRoute) return null;

  // 2. Redirect logged-in users away from Login/Register
  if (isLoggedIn && (nextUrl.pathname === "/sign-in" || nextUrl.pathname === "/register")) {
    return Response.redirect(new URL("/", nextUrl));
  }

 // 3. Protect Admin Routes
  if (isAdminRoute) {
    if (!isLoggedIn) {
      // Create a URL for sign-in and append the current path as callbackUrl
      const signInUrl = new URL("/sign-in", nextUrl);
      signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return Response.redirect(signInUrl);
    }
    
    if (req.auth?.user?.role !== "ADMIN") {
      return Response.redirect(new URL("/", nextUrl));
    }
  }

  // 4. Protect specific user routes
  if (!isLoggedIn && !isPublicRoute) {
    const signInUrl = new URL("/sign-in", nextUrl);
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return Response.redirect(signInUrl);
  }

  return null;
});

// Matcher determines which paths the middleware runs on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};