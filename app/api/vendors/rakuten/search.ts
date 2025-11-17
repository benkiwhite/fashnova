import type { NormalizedItem, SearchParams } from '../types';

const RAKUTEN_ENDPOINT =
  'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601';

/**
 * 楽天商品検索API（Ichiba Item Search）
 * - .env.local に RAKUTEN_APP_ID= を設定しておくこと
 * - 画像あり(item.imageFlag=1)のみ取得
 */
export async function searchRakuten(params: SearchParams): Promise<NormalizedItem[]> {
  const appId = process.env.RAKUTEN_APP_ID;
  if (!appId) throw new Error('Missing RAKUTEN_APP_ID');

  const { q, hits = 9, minPrice, maxPrice } = params;

  const url = new URL(RAKUTEN_ENDPOINT);
  url.searchParams.set('applicationId', appId);
  url.searchParams.set('keyword', q ?? '');
  url.searchParams.set('hits', String(Math.min(Math.max(hits, 1), 30))); // 1-30
  url.searchParams.set('imageFlag', '1'); // 画像あり

  if (minPrice != null) url.searchParams.set('minPrice', String(minPrice));
  if (maxPrice != null) url.searchParams.set('maxPrice', String(maxPrice));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000); // 10s タイムアウト

  try {
    const res = await fetch(url.toString(), { signal: controller.signal, cache: 'no-store' });
    if (!res.ok) {
      // APIからのエラー本文を短く添える
      const text = await res.text().catch(() => '');
      throw new Error(`Rakuten API ${res.status}: ${text.slice(0, 200)}`);
    }
    const json = await res.json();

    // 楽天の配列は { Items: [{ Item: {...} }, ...] } の形
    const items: NormalizedItem[] = (json.Items ?? [])
      .map((x: any) => x.Item)
      .filter((it: any) => it && it.itemUrl && it.itemName)
      .map((it: any) => {
        // 画像URLは medium > small の順で優先
        const image =
          it.mediumImageUrls?.[0]?.imageUrl?.replace('?_ex=128x128', '') ??
          it.smallImageUrls?.[0]?.imageUrl ??
          '';

        return {
          id: `rakuten-${it.itemCode ?? it.itemUrl}`,
          title: it.itemName,
          price: Number(it.itemPrice ?? 0),
          imageUrl: image,
          url: it.itemUrl,
          source: 'rakuten' as const,
        };
      });

    return items;
  } finally {
    clearTimeout(timeout);
  }
}
