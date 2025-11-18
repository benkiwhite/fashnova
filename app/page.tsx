'use client';
import { useState } from 'react';
import Image from 'next/image';

type Item = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  url: string;
  source: string;
};

export default function Page() {
  const [q, setQ] = useState('ワンピース');
  const [file, setFile] = useState<File | null>(null);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [sort, setSort] = useState<'relevance' | 'price_asc' | 'price_desc'>('relevance');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Item[]>([]);

  async function onSearch() {
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      let embedding: number[] | undefined;
      if (file) {
        const form = new FormData();
        form.append('image', file);
        const e = await fetch('/api/embed', { method: 'POST', body: form });
        if (e.ok) {
          const ej = await e.json();
          embedding = ej.embedding;
        }
      }

      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          q,
          k: 12,
          embedding,
          minPrice: minPrice === '' ? undefined : Number(minPrice),
          maxPrice: maxPrice === '' ? undefined : Number(maxPrice),
          sort,
        }),
        cache: 'no-store',
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResults(Array.isArray(data.items) ? data.items : []);
    } catch (e: any) {
      setError(e?.message ?? '検索に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative">
      {/* 背景 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(124,58,237,.25),transparent_60%),radial-gradient(40%_60%_at_90%_10%,rgba(59,130,246,.15),transparent_60%)]" />

      {/* ヒーロー */}
      <section className="relative mx-auto max-w-6xl px-6 pt-16 pb-8">
        <div className="flex items-center gap-4">
          <Image src="/fashnova.png" alt="FashNova" width={56} height={56} className="rounded-xl" />
          <h1 className="text-3xl md:text-4xl font-extrabold">
            <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              FashNova
            </span>
            <span className="ml-2 text-zinc-300 text-lg md:text-xl font-semibold">
              創造の爆発で、ファッションの常識を塗り替える
            </span>
          </h1>
        </div>

        {/* 検索UI */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 hover:bg-white/15">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <span className="text-sm text-zinc-200">{file ? '画像を選択済み' : '画像をアップロード'}</span>
            </label>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="例：黒 ワンピース / 厚底 スニーカー"
              className="flex-1 h-11 rounded-xl border border-white/10 bg-zinc-900/60 px-4 text-sm outline-none placeholder:text-zinc-400"
            />

            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="最安(円)"
              className="h-11 w-28 rounded-xl border border-white/10 bg-zinc-900/60 px-3 text-sm"
            />
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="最高(円)"
              className="h-11 w-28 rounded-xl border border-white/10 bg-zinc-900/60 px-3 text-sm"
            />

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="h-11 rounded-xl border border-white/10 bg-zinc-900/60 px-3 text-sm"
              title="並び替え"
            >
              <option value="relevance">関連度</option>
              <option value="price_asc">価格（安い順）</option>
              <option value="price_desc">価格（高い順）</option>
            </select>

            <button
              onClick={onSearch}
              disabled={loading}
              className="h-11 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-600 px-5 text-sm font-semibold shadow hover:brightness-110 disabled:opacity-60"
            >
              {loading ? '検索中…' : '検索する'}
            </button>
          </div>

          {error && <div className="mt-3 text-sm text-rose-300">エラー: {error.slice(0, 200)}</div>}
        </div>
      </section>

      {/* 結果 */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        {!loading && !error && results.length === 0 && (
          <div className="text-zinc-400 text-sm">
            まずは画像をアップロードするか、キーワードを入力して「検索する」を押してください。
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {results.map((p) => (
            <a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                fetch('/api/track', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({ itemId: p.id, event: 'click' }),
                })
              }
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[.07] transition"
            >
              <div className="aspect-square w-full overflow-hidden bg-black/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-zinc-500">No Image</div>
                )}
              </div>

              <div className="p-3">
                <div className="line-clamp-2 text-sm font-semibold text-white/90">{p.title}</div>
                <div className="mt-1 flex items-center justify-between text-xs text-zinc-400">
                  <span>{p.source}</span>
                  <span className="font-semibold text-fuchsia-300">
                    {Number.isFinite(p.price) ? `¥${Math.round(p.price).toLocaleString()}` : ''}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* フッター */}
      <footer className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-6 pb-6 text-xs text-zinc-500">
        © {new Date().getFullYear()} Supernova Explosion / FashNova
      </footer>
    </main>
  );
}
