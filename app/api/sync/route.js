import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { rejectCrossSite, rejectLargeBody } from '../_security';

async function authenticatedClient() {
  const supabase = await createClient();
  if (!supabase) return {};
  const { data } = await supabase.auth.getClaims();
  return { supabase, userId: data?.claims?.sub };
}

export async function GET() {
  const { supabase, userId } = await authenticatedClient();
  if (!supabase || !userId) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const { data, error } = await supabase.from('app_state').select('state, updated_at').eq('user_id', userId).maybeSingle();
  if (error) return NextResponse.json({ error: 'Cloud sync is not ready. Run the database schema first.' }, { status: 503 });
  return NextResponse.json({ state: data?.state || null, updatedAt: data?.updated_at || null });
}

export async function PUT(request) {
  const blocked = rejectCrossSite(request) || rejectLargeBody(request, 2_000_000);
  if (blocked) return blocked;
  const { supabase, userId } = await authenticatedClient();
  if (!supabase || !userId) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body?.state || typeof body.state !== 'object') return NextResponse.json({ error: 'Invalid sync payload.' }, { status: 400 });
  const { error } = await supabase.from('app_state').upsert({ user_id: userId, state: body.state, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: 'Could not save cloud data.' }, { status: 500 });
  return NextResponse.json({ saved: true });
}
