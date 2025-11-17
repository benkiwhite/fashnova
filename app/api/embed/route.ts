export const runtime = 'nodejs';  // ← これを最上部に
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { embedding, k = 9 } = await req.json();
  if (!embedding) {
    return NextResponse.json({ error: 'embedding required' }, { status: 400 });
  }

  const items = Array.from({ length: k }, (_, i) => ({
    id: `mock-${i}`,
    title: `Sample Item ${i + 1}`,
    price: 2000 + i * 120,
    imageUrl: `https://picsum.photos/seed/fn${i}/600/600`,
    url: `https://example.com/item/${i}`,
    source: i % 2 ? 'rakuten' : 'amazon',
    score: 1 - i * 0.05,
  }));

  return NextResponse.json({ items });
}

