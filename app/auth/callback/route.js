import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

function safeDestination(value) {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/';
}

export async function GET(request) {
  const url = new URL(request.url);
  const destination = safeDestination(url.searchParams.get('next'));
  const successResponse = NextResponse.redirect(new URL(destination, url.origin));
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(new URL('/auth?error=Authentication%20is%20not%20configured.', url.origin));
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => successResponse.cookies.set(name, value, options));
      },
    },
  });

  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  let error = null;

  if (tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }));
  } else if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else {
    error = new Error('The confirmation link is incomplete or has expired.');
  }

  if (error) {
    const message = encodeURIComponent(error.message || 'Unable to confirm this account.');
    return NextResponse.redirect(new URL(`/auth?error=${message}`, url.origin));
  }

  return successResponse;
}
