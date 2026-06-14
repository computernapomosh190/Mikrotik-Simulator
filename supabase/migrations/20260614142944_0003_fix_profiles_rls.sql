-- Add INSERT policy for profiles (users can create their own profile)
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- Also allow public read for leaderboard (display names)
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT
  TO authenticated USING (true);

-- Drop the old restrictive select policy
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;