# Local PostgreSQL Development Setup

## Option 1: Docker (Easiest)

### Install Docker Desktop
1. Download from https://www.docker.com/products/docker-desktop/
2. Install and start Docker Desktop

### Run PostgreSQL Container
```bash
docker run --name mentor-match-db \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=mentor_match \
  -p 5432:5432 \
  -d postgres:15
```

### Update Environment Variables
Create `.env.local` file:
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_local_key
```

## Option 2: Local PostgreSQL Installation

### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set

### macOS
```bash
brew install postgresql
brew services start postgresql
```

### Linux
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Option 3: Supabase Local Development

### Install Supabase CLI
```bash
npm install -g supabase
```

### Initialize Local Supabase
```bash
supabase init
supabase start
```

This will give you:
- Local PostgreSQL database
- Local Supabase API
- Local dashboard at http://localhost:54323

## Update Your Application

### 1. Update Supabase Client Configuration
```typescript
// src/integrations/supabase/client.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your_local_key'
```

### 2. Run Your Migrations
```bash
# If using Supabase CLI
supabase db reset

# Or manually run your SQL files
psql -h localhost -U postgres -d mentor_match -f supabase/migrations/*.sql
```

## Benefits of Local Development
- ✅ No usage limits
- ✅ Faster development
- ✅ Offline development
- ✅ Full control over data
- ✅ No billing concerns

## Production Deployment
When ready for production:
1. Use Supabase paid plan
2. Or deploy to your own PostgreSQL server
3. Update environment variables for production 