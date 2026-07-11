import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          // @supabase/ssr passes Cache-Control/Expires/Pragma headers here
          // whenever it writes fresh auth cookies (e.g. right after the
          // /auth/confirm redirect lands back on "/" and this middleware
          // refreshes the session). Without applying them, Vercel's edge
          // network can cache that response and keep serving the
          // pre-auth version until the cache naturally expires -- which
          // looked like "sign-in doesn't show until I manually refresh".
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // Refreshes the session cookie if it's expired. Do not add code between
  // client creation and this call.
  await supabase.auth.getClaims();

  return response;
}
