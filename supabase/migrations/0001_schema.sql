-- Dogear simplified schema migration (Option B)
-- Tables: profiles, posts (8 fields), comments (5 fields)
-- Includes: RLS, auth profile trigger, check constraints, indexes, column grants, atomic upvotes RPC.

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,
  username text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT username_format CHECK (username ~ '^[A-Za-z][A-Za-z0-9_]{2,23}$'),
  CONSTRAINT username_not_reserved CHECK (lower(username) NOT IN ('admin', 'administrator', 'moderator', 'support', 'dogear'))
);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx ON public.profiles (lower(username));

-- 2. POSTS TABLE (Simplified: 8 fields)
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE RESTRICT,
  title text NOT NULL,
  content text,
  category text NOT NULL DEFAULT 'Opinion',
  image_url text,
  upvotes bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT posts_title_length CHECK (char_length(trim(title)) BETWEEN 1 AND 160),
  CONSTRAINT posts_content_length CHECK (content IS NULL OR char_length(content) <= 10000),
  CONSTRAINT posts_category_values CHECK (category IN ('Review', 'Question', 'Recommendation', 'Opinion')),
  CONSTRAINT posts_image_url_valid CHECK (image_url IS NULL OR (char_length(image_url) <= 2048 AND image_url ~* '^https?://')),
  CONSTRAINT posts_upvotes_nonnegative CHECK (upvotes >= 0)
);

-- Indexes for posts
CREATE INDEX IF NOT EXISTS posts_created_at_desc_id_desc_idx ON public.posts (created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS posts_upvotes_desc_created_at_desc_id_desc_idx ON public.posts (upvotes DESC, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS posts_category_created_at_desc_id_desc_idx ON public.posts (category, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS posts_author_id_idx ON public.posts (author_id);

-- 3. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE RESTRICT,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT comments_body_length CHECK (char_length(trim(body)) BETWEEN 1 AND 2000)
);

-- Indexes for comments
CREATE INDEX IF NOT EXISTS comments_post_id_created_at_id_idx ON public.comments (post_id, created_at ASC, id ASC);
CREATE INDEX IF NOT EXISTS comments_author_id_idx ON public.comments (author_id);

-- 4. PROFILE CREATION TRIGGER (on signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_username text;
BEGIN
  v_username := trim(new.raw_user_meta_data->>'username');

  IF v_username IS NULL OR v_username = '' THEN
    RAISE EXCEPTION 'Username is required';
  END IF;

  IF NOT (v_username ~ '^[A-Za-z][A-Za-z0-9_]{2,23}$') THEN
    RAISE EXCEPTION 'Username must start with a letter and contain 3-24 letters, numbers, or underscores';
  END IF;

  IF lower(v_username) IN ('admin', 'administrator', 'moderator', 'support', 'dogear') THEN
    RAISE EXCEPTION 'Username "%" is reserved', v_username;
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE lower(username) = lower(v_username)) THEN
    RAISE EXCEPTION 'Username "%" is already taken', v_username;
  END IF;

  INSERT INTO public.profiles (id, username, created_at)
  VALUES (new.id, v_username, now());

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Profiles: public read
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Posts: public read, authenticated insert, author update, author delete
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
CREATE POLICY "Posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
CREATE POLICY "Authenticated users can create posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their posts" ON public.posts;
CREATE POLICY "Authors can update their posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete their posts" ON public.posts;
CREATE POLICY "Authors can delete their posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Comments: public read, authenticated insert, author delete
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete their comments" ON public.comments;
CREATE POLICY "Authors can delete their comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- 6. COLUMN LEVEL GRANTS

-- Profiles
REVOKE ALL ON public.profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;

-- Posts: inserts/updates cannot directly modify author_id, upvotes, or created_at
REVOKE ALL ON public.posts FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.posts TO anon, authenticated;
GRANT INSERT (id, title, content, category, image_url) ON public.posts TO authenticated;
GRANT UPDATE (title, content, category, image_url) ON public.posts TO authenticated;
GRANT DELETE ON public.posts TO authenticated;

-- Comments: inserts cannot specify author_id directly
REVOKE ALL ON public.comments FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.comments TO anon, authenticated;
GRANT INSERT (id, post_id, body) ON public.comments TO authenticated;
GRANT DELETE ON public.comments TO authenticated;

-- 7. ATOMIC UPVOTES RPC
CREATE OR REPLACE FUNCTION public.increment_post_upvotes(post_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_count bigint;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE public.posts
  SET upvotes = upvotes + 1
  WHERE id = post_id
  RETURNING upvotes INTO new_count;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post not found';
  END IF;

  RETURN new_count;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_post_upvotes(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_post_upvotes(uuid) TO authenticated;
