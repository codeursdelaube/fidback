import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const nextParam = requestUrl.searchParams.get("next");

  const supabase = await createClient();

  // 1. Handle PKCE code exchange
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      const role = data.user.user_metadata?.role || "user";
      const defaultTarget = role === "company" ? "/dashboard" : "/app";
      const destination = nextParam && nextParam !== "/login" ? nextParam : defaultTarget;
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  // 2. Handle token_hash verification (email confirmation links)
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });
    if (!error && data?.user) {
      const role = data.user.user_metadata?.role || "user";
      const defaultTarget = role === "company" ? "/dashboard" : "/app";
      const destination = nextParam && nextParam !== "/login" ? nextParam : defaultTarget;
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  // 3. Fallback: check if session already exists
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const role = user.user_metadata?.role || "user";
    const defaultTarget = role === "company" ? "/dashboard" : "/app";
    return NextResponse.redirect(new URL(defaultTarget, request.url));
  }

  // Return to login with error
  return NextResponse.redirect(
    new URL("/login?error=auth_callback_failed", request.url)
  );
}
