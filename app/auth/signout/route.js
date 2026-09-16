import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { rejectCrossSite } from '../../api/_security';

export async function POST(request) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/auth', request.url), 303);
}
