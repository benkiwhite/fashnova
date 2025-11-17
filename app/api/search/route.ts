// ✅ Edge回避：pg/外部APIを使うので Node ランタイムで実行
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { searchRakuten } from '../vendors/rakuten/search';
import type { SearchParams } from '../vendors/types';

// （任意）すごく簡単なレート制限：IPあたり10req/分
const bucket = new Map<string, number[]>();
function rateLimit(ip: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const arr = (bucket.get(ip) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  bucket.set(ip, arr);
  return arr.length <= limit;
}

export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') ?? 'local').split(',')[0].trim();
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'too many requests' }, { status: 429 });
  }

  // フロントから埋め込みやキーワード、価格帯が来る想定
  const body = await req.json().catch(() => ({} as any));
  const {
    embedding,              // いまは未使用（将来：埋め込み→キーワード推定に利用）
    q = 'ファッション',     // 暫定の検索キーワード（なければデフォルト）
    k = 12,                 // 取得件数（1–30）
    minPrice,
    maxPrice,
  } = body as {
    embedding?: number[];
    q?: string;
    k?: number;
    minPrice?: number;
    maxPrice?: number;
  };

  const params: SearchParams = {
    q,
    hits: Math.min(Math.max(k, 1), 30),
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
  };

  try {
    // 楽天アダプタを呼び出し（vendors/rakuten/search.ts）
    const rakuten = await searchRakuten(params);

    // 将来：amazon/zozo等をここで併合し、重複除去・スコア統合
    return NextResponse.json({ items: rakuten });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'search failed' }, { status: 500 });
  }
}
