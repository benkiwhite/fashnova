-- pgvectorを有効化
create extension if not exists vector;

-- 商品テーブル（embeddingはベクトル列）
create table if not exists items (
  id text primary key,
  title text not null,
  image_url text,
  url text not null,
  source text not null,
  price integer,
  embedding vector(16),  -- まずは16次元（/api/embedのダミーと合わせる）
  updated_at timestamp default now()
);

-- 類似検索を速くするインデックス
-- ivfflatはベクトル数が増えたら有効（少数のうちは不要でもOK）
create index if not exists idx_items_embedding
  on items using ivfflat (embedding vector_l2_ops)
  with (lists = 100);

-- ユーザー行動ログ（クリック等）
create table if not exists user_events (
  id bigserial primary key,
  user_id text,
  item_id text references items(id),
  event text,      -- view/click/fav/purchase
  score float,     -- 1.0(購入) > 0.5(お気に入り) > 0.2(クリック)
  created_at timestamp default now()
);
