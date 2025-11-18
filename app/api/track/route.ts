export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const { itemId, event = 'click' } = body as { itemId?: string; event?: 'click'|'view'|'fav'|'purchase' };
  if (!itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 });

  // ここで将来はDBに保存する（lib/db.ts を使って user_events へ）
  console.log('[track]', new Date().toISOString(), { itemId, event });

  return NextResponse.json({ ok: true });
}
