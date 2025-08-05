# Create New Supabase Project

## Step 1: Create New Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Use a different email/account if needed
4. Choose a new project name (e.g., "mentor-match-dev-2")

## Step 2: Get New Credentials
1. Go to Settings > API
2. Copy the new URL and anon key
3. Update your `.env` file:

```env
VITE_SUPABASE_URL=https://your-new-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-new-anon-key
```

## Step 3: Run Your Migrations
1. Go to SQL Editor in your new project
2. Copy and paste your migration files from:
   - `supabase/migrations/20250725220004-add-skills-table.sql`
   - `supabase/migrations/20250725220006-cleanup-skills-data.sql`
   - Any other migration files

## Step 4: Test Your Application
1. Restart your development server
2. Test the search functionality
3. Add some test users with skills

## Benefits
- ✅ Fresh quota limits
- ✅ Clean database
- ✅ No billing issues
- ✅ Same functionality 