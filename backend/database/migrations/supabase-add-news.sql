-- Bảng lưu tin tức cho trang News
-- Chạy script này trong Supabase SQL Editor

create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text,
  summary text,
  content text,
  image_url text,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  authorid uuid references users(id),
  createdat timestamptz default now(),
  updatedat timestamptz default now()
);

create index if not exists news_status_published_at_idx on news(status, published_at desc);

