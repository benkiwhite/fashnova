export type NormalizedItem = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  url: string;
  source: 'rakuten'; // 将来: 'amazon' | 'zozo' などを追加
};

export type SearchParams = {
  q: string;         // キーワード
  hits?: number;     // 取得件数（1–30）
  minPrice?: number; // 円
  maxPrice?: number; // 円
};
