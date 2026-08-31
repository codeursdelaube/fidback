import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/* ─── Security Headers ─────────────────────────────────────────────────────── */
function applySecurityHeaders(response: NextResponse): NextResponse {
  // Strict Transport Security (force HTTPS)
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Permissions policy — restrict access to sensitive browser APIs
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  );
  // Content-Security-Policy
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // required by Next.js
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );
  return response;
}

/* ─── Simple in-memory rate limiter for proxy ──────────────────────────────── */
// Limits auth endpoints to 10 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string, pathname: string): boolean {
  // Only rate-limit auth paths
  const authPaths = ["/login", "/register", "/register-company", "/signup", "/auth/callback"];
  if (!authPaths.some((p) => pathname.startsWith(p))) return false;

  const now = Date.now();
  const key = `${ip}:auth`;
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  entry.count += 1;
  if (entry.count > 20) return true; // Block after 20 req/min per IP

  return false;
}

/* ─── Proxy handler ────────────────────────────────────────────────────────── */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get client IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Rate limiting check for auth routes
  if (isRateLimited(ip, pathname)) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": "60",
        "Content-Type": "text/plain",
      },
    });
  }

  const { supabaseResponse, user } = await updateSession(request);

  // ── Auth Guards for Protected Routes ──────────────────────────────────────
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isUserAppRoute = pathname.startsWith("/app");
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/register-company" ||
    pathname.startsWith("/signup");

  // Redirect already authenticated users away from login/register/signup
  if (isAuthRoute && user) {
    const userRole = user.user_metadata?.role || "user";
    if (userRole === "company") {
      return applySecurityHeaders(
        NextResponse.redirect(new URL("/dashboard", request.url))
      );
    } else {
      return applySecurityHeaders(
        NextResponse.redirect(new URL("/app", request.url))
      );
    }
  }

  if (isDashboardRoute || isUserAppRoute) {
    if (!user) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      redirectUrl.searchParams.set("role", isDashboardRoute ? "company" : "user");
      const redirectResp = NextResponse.redirect(redirectUrl);
      return applySecurityHeaders(redirectResp);
    }

    const userRole = user.user_metadata?.role || "user";

    // 0. Strict Separation: User vs Company spaces
    if (isDashboardRoute) {
      // Users cannot access company dashboard -> redirect to user app
      if (userRole === "user") {
        return applySecurityHeaders(NextResponse.redirect(new URL("/app", request.url)));
      }

      // TEMP: accès ouvert pour les startups pilotes, réactiver la vérification subscriptionStatus avant le lancement payant
      /*
      const subscriptionStatus = user.user_metadata?.subscriptionStatus || "INACTIVE";
      if (subscriptionStatus !== "ACTIVE") {
        const checkoutUrl = new URL("/checkout", request.url);
        checkoutUrl.searchParams.set("reason", "inactive_subscription");
        return applySecurityHeaders(NextResponse.redirect(checkoutUrl));
      }
      */
    }

    if (isUserAppRoute) {
      // Companies cannot access user tester space -> redirect to company dashboard
      if (userRole === "company") {
        return applySecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
      }
    }
  }

  return applySecurityHeaders(supabaseResponse);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/app/:path*",
    "/login",
    "/register",
    "/register-company",
    "/signup/:path*",
    "/auth/:path*",
  ],
};
