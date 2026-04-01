import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  
  // 1. Define Public Routes (including their sub-paths)
  const publicPrefixes = ["/", "/shop", "/sign-in", "/category", "/product"];
  const isPublicRoute = publicPrefixes.some(prefix => 
    nextUrl.pathname === prefix || nextUrl.pathname.startsWith(`${prefix}/`)
  );

  // 2. Define Protected Routes
  const isUserRoute = nextUrl.pathname.startsWith("/user");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  // Allow all API Auth routes immediately
  if (isApiAuthRoute) return null;

  // 3. Logic for Admin Routes
  if (isAdminRoute) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/sign-in", nextUrl);
      signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return Response.redirect(signInUrl);
    }
    
    // Check for ADMIN role specifically
    if (req.auth?.user?.role !== "ADMIN") {
      return Response.redirect(new URL("/", nextUrl));
    }
    return null;
  }

  // 4. Logic for User Routes
  if (isUserRoute && !isLoggedIn) {
    const signInUrl = new URL("/sign-in", nextUrl);
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return Response.redirect(signInUrl);
  }

  // 5. Redirect logged-in users away from Auth pages
  if (isLoggedIn && (nextUrl.pathname === "/sign-in" || nextUrl.pathname === "/register")) {
    return Response.redirect(new URL("/", nextUrl));
  }

  // Allow everything else (Public routes or non-specified routes)
  return null;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};