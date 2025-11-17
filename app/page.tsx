'use client';
import { useState } from 'react';

type Item = { id: string; title: string; price: number; imageUrl: string; url: string; source: string; };

export default function Page() {
  const [q, setQ] = useState('ワンピース');
  const [results, setResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  async function onSearch() {
    setLoading(true); setError(null); setResults([]);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ q, k: 8 }),
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResults(data.items ?? []);
    } catch (e:any) {
      setError(e?.message ?? 'search failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{padding:24, maxWidth:1000, margin:'0 auto'}}>
      <h1 style={{fontSize:28, fontWeight:800}}>FashNova</h1>
      <div style={{display:'flex', gap:8, marginTop:8}}>
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="キーワード"
               style={{padding:8, border:'1px solid #ccc', borderRadius:8, minWidth:280}}/>
        <button onClick={onSearch} disabled={loading}
                style={{padding:'8px 14px', border:'1px solid #ccc', borderRadius:8}}>
          {loading ? '検索中…' : '検索'}
        </button>
      </div>
      {error && <div style={{color:'crimson', marginTop:12}}>エラー: {error.slice(0,200)}</div>}
      <section style={{marginTop:16, display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12}}>
        {results.map(p=>(
          <a key={p.id} href={p.url} target="_blank" rel="noreferrer"
             style={{display:'block', border:'1px solid #eee', padding:10, borderRadius:10, textDecoration:'none', color:'inherit'}}>
            <div style={{width:'100%', aspectRatio:'1/1', overflow:'hidden', borderRadius:8, background:'#fafafa'}}>
              {p.imageUrl ? <img src={p.imageUrl} alt={p.title} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : 'No Image'}
            </div>
            <div style={{fontWeight:600, marginTop:6}}>{p.title}</div>
            <div style={{fontSize:12, color:'#666'}}>{p.source}</div>
          </a>
        ))}
      </section>
    </main>
  );
}
