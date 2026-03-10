-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
CREATE TABLE public.news (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text,
  summary text,
  content text,
  image_url text,
  status text NOT NULL DEFAULT 'draft'::text CHECK (
    status = ANY (ARRAY ['draft'::text, 'published'::text])
  ),
  published_at timestamp with time zone,
  authorid uuid,
  createdat timestamp with time zone DEFAULT now(),
  updatedat timestamp with time zone DEFAULT now(),
  CONSTRAINT news_pkey PRIMARY KEY (id),
  CONSTRAINT news_authorid_fkey FOREIGN KEY (authorid) REFERENCES public.users(id)
);
CREATE TABLE public.pending_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'user'::text,
  enable_2fa boolean NOT NULL DEFAULT false,
  verify_token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT pending_registrations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.properties (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  price bigint NOT NULL,
  area numeric NOT NULL,
  address text NOT NULL,
  district text NOT NULL,
  city text NOT NULL,
  type text NOT NULL CHECK (
    type = ANY (
      ARRAY ['apartment'::text, 'house'::text, 'villa'::text, 'land'::text, 'commercial'::text]
    )
  ),
  projectname text,
  images jsonb DEFAULT '[]'::jsonb,
  videourl text,
  commission numeric DEFAULT 1,
  package text NOT NULL DEFAULT 'free'::text CHECK (
    package = ANY (
      ARRAY ['free'::text, 'vip'::text, 'diamond'::text]
    )
  ),
  agentid uuid NOT NULL,
  status text NOT NULL DEFAULT 'for-sale'::text,
  isactive boolean NOT NULL DEFAULT true,
  isapproved boolean NOT NULL DEFAULT false,
  view_count integer NOT NULL DEFAULT 0,
  createdat timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  bedrooms integer,
  direction text,
  mapurl text,
  CONSTRAINT properties_pkey PRIMARY KEY (id),
  CONSTRAINT properties_agentid_fkey FOREIGN KEY (agentid) REFERENCES public.users(id)
);
CREATE TABLE public.refresh_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token_hash text NOT NULL UNIQUE,
  device_info text,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (
    char_length(full_name) >= 2
    AND char_length(full_name) <= 100
  ),
  email text NOT NULL UNIQUE,
  phone text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role USER - DEFINED NOT NULL DEFAULT 'user'::user_role,
  is_active boolean NOT NULL DEFAULT true,
  is_email_verified boolean NOT NULL DEFAULT false,
  totp_secret text,
  is_2fa_enabled boolean NOT NULL DEFAULT false,
  email_verify_token text,
  email_verify_expires timestamp with time zone,
  refresh_token_hash text,
  password_reset_token text,
  password_reset_expires timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  avatar_url text,
  title text,
  license_code text,
  join_year text,
  experience text,
  success_deals text,
  bio text,
  areas ARRAY,
  property_types ARRAY,
  facebook text,
  zalo text,
  address text,
  cover_url text,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);