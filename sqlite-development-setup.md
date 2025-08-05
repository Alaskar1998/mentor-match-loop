# SQLite Development Setup

## Why SQLite?
- ✅ No installation required
- ✅ No usage limits
- ✅ File-based database
- ✅ Perfect for development
- ✅ Easy to backup/restore

## Step 1: Install SQLite Dependencies
```bash
npm install better-sqlite3 @types/better-sqlite3
```

## Step 2: Create Local Database Service
Create `src/services/localDatabase.ts`:

```typescript
import Database from 'better-sqlite3';
import { logger } from '@/utils/logger';

class LocalDatabase {
  private db: Database.Database;

  constructor() {
    this.db = new Database('mentor-match.db');
    this.initDatabase();
  }

  private initDatabase() {
    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        display_name TEXT,
        skills_to_teach TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        category TEXT,
        emoji TEXT,
        description TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  // Add methods for your database operations
  getProfiles() {
    return this.db.prepare('SELECT * FROM profiles').all();
  }

  getSkills() {
    return this.db.prepare('SELECT * FROM skills WHERE is_active = 1').all();
  }

  // Add more methods as needed
}

export const localDb = new LocalDatabase();
```

## Step 3: Update Your Services
Modify your services to use local database in development:

```typescript
// src/services/skillService.ts
const isDevelopment = import.meta.env.DEV;

export const getPopularSkillsFromDatabase = async (limit: number = 20) => {
  if (isDevelopment) {
    // Use local database
    return localDb.getSkills();
  } else {
    // Use Supabase
    return supabase.getSkills();
  }
};
```

## Step 4: Add to .gitignore
```
# Local database
*.db
*.db-journal
```

## Benefits
- ✅ No external dependencies
- ✅ No usage limits
- ✅ Fast development
- ✅ Easy to reset data 