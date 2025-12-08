// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Create response object
  let response = NextResponse.next({ request });

  // Create client with cookie handlers
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // READ cookies
        getAll() {
          return request.cookies.getAll();
        },

        // WRITE cookies – must write to `res`, not to the request!
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Define routes
  const protectedRoutes = [
    "/dashboard",
    "/category",
    "/product",
    "/profile",
    "/pages/settings",
  ];
  const authRoutes = ["/sign-in", "/sign-up"];

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  // ⛔ Not logged in → Redirect to sign-in
  if (!user && isProtectedRoute) {
    const loginURL = new URL("/sign-in", request.url);
    loginURL.searchParams.set("redirect", path);

    const redirectResponse = NextResponse.redirect(loginURL);

    // forward Supabase cookies → critical
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });

    return redirectResponse;
  }

  // ✅ Logged in but visiting /auth → redirect to dashboard
  if (user && isAuthRoute) {
    const redirectResponse = NextResponse.redirect(
      new URL("/dashboard", request.url),
    );

    // forward Supabase cookies
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });

    return redirectResponse;
  }

  return response;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/category/:path*",
    "/product/:path*",
    "/user/:path*",
    "/pages/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
