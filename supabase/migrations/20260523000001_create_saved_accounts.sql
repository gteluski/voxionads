-- Migration: Create saved_accounts table and enable RLS
CREATE TABLE IF NOT EXISTS saved_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  account_id text not null,
  account_name text,
  business_name text,
  last_accessed timestamp default now(),
  created_at timestamp default now(),
  unique(user_id, account_id)
);

ALTER TABLE saved_accounts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'saved_accounts' AND policyname = 'Users can manage their saved accounts'
  ) THEN
    CREATE POLICY "Users can manage their saved accounts"
    ON saved_accounts FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;
