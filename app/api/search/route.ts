export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { searchRakuten } from '../vendors/rakuten/search';
import type { SearchParams } from '../vendors/types';

// ---- 超かんたんレート制限（IPあたり 10 req/分）
const bucket = new Map<string, number[]>();
function rateLimit(ip: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const arr = (bucket.get(ip) ?? []).filter(t => now - t < windowMs);
  arr.push(now); bucket.set(ip, arr);
  return arr.length <= limit;
}

// ---- 30秒キャッシュ（メモリ）
type CacheVal = { at: number; items: any[] };
const cache = new Map<string, CacheVal>();
const TTL = 30_000; // 30s

function keyOf(p: Record<string, any>) {
  return JSON.stringify(p);
}

export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') ?? 'local').split(',')[0].trim();
  if (!rateLimit(ip)) return NextResponse.json({ error: 'too many requests' }, { status: 429 });

  const body = await req.json().catch(() => ({} as any));
  const {
    embedding, // 将来用途
    q = 'ファッション',
    k = 12,
    minPrice,
    maxPrice,
    sort = 'relevance', // 'relevance' | 'price_asc' | 'price_desc'
  } = body as {
    embedding?: number[];
    q?: string;
    k?: number;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'relevance'|'price_asc'|'price_desc';
  };

  const params: SearchParams = {
    q,
    hits: Math.min(Math.max(k, 1), 30),
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
  };

  // ---- キャッシュ確認
  const ck = keyOf({ vendor: 'rakuten', ...params, sort });
  const now = Date.now();
  const cached = cache.get(ck);
  if (cached && now - cached.at < TTL) {
    let items = cached.items.slice();
    items = applySort(items, sort);
    return NextResponse.json({ items, cached: true });
  }

  try {
    // ベンダー呼び出し
    const rakuten = await searchRakuten(params);

    // 並び替え（楽天は価格のみ確実なのでそれ中心）
    const items = applySort(rakuten, sort);

    // キャッシュ格納
    cache.set(ck, { at: now, items });

    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'search failed' }, { status: 500 });
  }
}

function applySort(items: any[], sort: string) {
  const arr = items.slice();
  if (sort === 'price_asc') {
    arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  } else if (sort === 'price_desc') {
    arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  } // relevance はベンダー順のまま
  return arr;
}
