# 🚀 **QUICK REFERENCE GUIDE**

## 📋 **COMMON DEVELOPMENT TASKS**

### **🔧 Setup & Installation**

```bash
# Fresh setup
git clone <repo-url>
cd mentor-match-loop
npm install
npm run dev

# Reset everything
rm -rf node_modules package-lock.json
npm install
```

### **🛠️ Development Commands**

```bash
npm run dev          # Start development server (port 8081)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code quality
npm run lint:fix     # Fix code quality issues
npm run type-check   # TypeScript type checking
npm run format       # Format code with Prettier
```

### **🧪 Testing Commands**

```bash
npm run test         # Run all tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
```

---

## 🎯 **COMMON PATTERNS**

### **📝 Creating a New Component**

```typescript
// src/components/ExampleComponent.tsx
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';

interface ExampleComponentProps {
  title: string;
  onAction?: () => void;
}

export const ExampleComponent = ({ title, onAction }: ExampleComponentProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      // Your logic here
      onAction?.();
    } catch (error) {
      logger.error('Error in ExampleComponent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <Button
        onClick={handleClick}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Loading...' : 'Action'}
      </Button>
    </div>
  );
};
```

### **🎣 Creating a Custom Hook**

```typescript
// src/hooks/useExample.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

interface UseExampleReturn {
  data: any;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useExample = (): UseExampleReturn => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      // API call here
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err as Error);
      logger.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
};
```

### **🔌 Creating a Service**

```typescript
// src/services/exampleService.ts
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const exampleService = {
  async fetchData(userId: string) {
    try {
      const { data, error } = await supabase
        .from('table_name')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching data:', error);
      throw error;
    }
  },

  async createData(data: any) {
    try {
      const { data: result, error } = await supabase
        .from('table_name')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      logger.error('Error creating data:', error);
      throw error;
    }
  },

  async updateData(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('table_name')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating data:', error);
      throw error;
    }
  },

  async deleteData(id: string) {
    try {
      const { error } = await supabase.from('table_name').delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      logger.error('Error deleting data:', error);
      throw error;
    }
  },
};
```

---

## 🌍 **INTERNATIONALIZATION**

### **📝 Adding Translations**

```typescript
// src/i18n/locales/en.ts
export const en = {
  common: {
    welcome: 'Welcome',
    loading: 'Loading...',
    error: 'Something went wrong',
  },
  auth: {
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
  },
  // Add your translations here
};

// src/i18n/locales/ar.ts
export const ar = {
  common: {
    welcome: 'مرحباً',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ ما',
  },
  auth: {
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
  },
  // Add your translations here
};
```

### **🎯 Using Translations**

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// In JSX
<h1>{t('common.welcome')}</h1>
<button>{t('auth.login')}</button>

// With variables
<p>{t('user.greeting', { name: user.name })}</p>
```

---

## 🔐 **AUTHENTICATION PATTERNS**

### **🛡️ Protected Routes**

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: string;
}

export const ProtectedRoute = ({ children, fallback = '/login' }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};
```

### **👤 User Profile Management**

```typescript
// Example of updating user profile
const { updateUser } = useAuth();

const handleProfileUpdate = async (updates: Partial<User>) => {
  try {
    await updateUser(updates);
    toast.success('Profile updated successfully');
  } catch (error) {
    toast.error('Failed to update profile');
    logger.error('Profile update error:', error);
  }
};
```

---

## 🔍 **SEARCH & FILTERING**

### **🔎 Search Implementation**

```typescript
import { useOptimizedSearch } from '@/hooks/useOptimizedSearch';

const { searchQuery, setSearchQuery, searchResults, isLoading } = useOptimizedSearch();

// In JSX
<Input
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="Search users..."
/>
```

### **🎛️ Filter Implementation**

```typescript
const [filters, setFilters] = useState({
  skill: '',
  location: '',
  rating: 0,
});

const handleFilterChange = (key: string, value: any) => {
  setFilters(prev => ({ ...prev, [key]: value }));
};
```

---

## 💬 **REAL-TIME FEATURES**

### **📨 Chat Messages**

```typescript
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

useEffect(() => {
  const subscription = supabase
    .channel('chat_messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_id=eq.${chatId}`,
      },
      payload => {
        // Handle new message
        console.log('New message:', payload.new);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [chatId]);
```

### **🔔 Notifications**

```typescript
import { useNotifications } from '@/hooks/useNotifications';

const { notifications, markAsRead } = useNotifications();

// Mark notification as read
const handleNotificationClick = (notificationId: string) => {
  markAsRead(notificationId);
  // Navigate to relevant page
};
```

---

## 🎮 **GAMIFICATION**

### **🪙 Coin Management**

```typescript
import { useGamification } from '@/hooks/useGamification';

const { coins, earnCoins, spendCoins } = useGamification();

// Earn coins
await earnCoins(100, 'daily_login');

// Spend coins
await spendCoins(50, 'premium_feature');
```

### **🏆 Achievement Tracking**

```typescript
// Example achievement check
const checkAchievement = async (userId: string, type: string) => {
  // Check if user qualifies for achievement
  // Award coins/points
  // Update achievement status
};
```

---

## 📊 **DATA FETCHING**

### **🔄 React Query Patterns**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetching data
const { data, isLoading, error } = useQuery({
  queryKey: ['users', userId],
  queryFn: () => fetchUser(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Mutating data
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: updateUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    toast.success('User updated successfully');
  },
  onError: error => {
    toast.error('Failed to update user');
    logger.error('Update error:', error);
  },
});
```

### **📈 Optimistic Updates**

```typescript
const mutation = useMutation({
  mutationFn: updateUser,
  onMutate: async newUser => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['users', newUser.id] });

    // Snapshot previous value
    const previousUser = queryClient.getQueryData(['users', newUser.id]);

    // Optimistically update
    queryClient.setQueryData(['users', newUser.id], newUser);

    return { previousUser };
  },
  onError: (err, newUser, context) => {
    // Rollback on error
    queryClient.setQueryData(['users', newUser.id], context?.previousUser);
  },
  onSettled: () => {
    // Always refetch
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});
```

---

## 🎨 **UI COMPONENTS**

### **🎯 Common UI Patterns**

```typescript
// Loading state
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Error state
const ErrorMessage = ({ error }: { error: Error }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-red-800">{error.message}</p>
  </div>
);

// Empty state
const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-8">
    <p className="text-muted-foreground">{message}</p>
  </div>
);
```

### **📱 Responsive Design**

```typescript
// Tailwind responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>

// Mobile-first approach
<div className="p-4 sm:p-6 lg:p-8">
  {/* Content */}
</div>
```

---

## 🧪 **TESTING PATTERNS**

### **📝 Component Testing**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ExampleComponent } from './ExampleComponent';

describe('ExampleComponent', () => {
  it('renders correctly', () => {
    render(<ExampleComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const mockOnAction = jest.fn();
    render(<ExampleComponent title="Test" onAction={mockOnAction} />);

    fireEvent.click(screen.getByText('Action'));
    expect(mockOnAction).toHaveBeenCalled();
  });
});
```

### **🎣 Hook Testing**

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useExample } from './useExample';

describe('useExample', () => {
  it('returns expected data', async () => {
    const { result } = renderHook(() => useExample());

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

---

## 🚀 **DEPLOYMENT**

### **📦 Build Commands**

```bash
# Production build
npm run build

# Preview build
npm run preview

# Analyze bundle
npm run analyze
```

### **🌍 Environment Variables**

```bash
# .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_ENV=development
```

---

## 🔧 **TROUBLESHOOTING**

### **🐛 Common Issues & Solutions**

#### **Build Errors**

```bash
# Clear cache
rm -rf node_modules/.vite
npm run dev

# Reset everything
rm -rf node_modules package-lock.json
npm install
```

#### **TypeScript Errors**

```bash
# Check types
npm run type-check

# Fix common issues
npm run lint:fix
```

#### **Database Issues**

```typescript
// Check Supabase connection
const { data, error } = await supabase.from('profiles').select('*').limit(1);
if (error) {
  console.error('Database connection error:', error);
}
```

#### **Performance Issues**

```typescript
// Use React DevTools Profiler
// Check bundle size with npm run analyze
// Monitor network requests in browser dev tools
```

---

## 📚 **USEFUL COMMANDS**

### **🔍 Search & Replace**

```bash
# Find all console.log statements
grep -r "console.log" src/

# Find TypeScript errors
npm run type-check

# Find ESLint issues
npm run lint
```

### **📊 Code Analysis**

```bash
# Bundle analysis
npm run analyze

# Type checking
npm run type-check

# Code formatting
npm run format
```

---

## 🎯 **BEST PRACTICES CHECKLIST**

### **✅ Code Quality**

- [ ] Use TypeScript for all new code
- [ ] Follow ESLint rules
- [ ] Format code with Prettier
- [ ] Write meaningful commit messages
- [ ] Add proper error handling

### **✅ Performance**

- [ ] Use React.memo for expensive components
- [ ] Implement proper loading states
- [ ] Optimize bundle size
- [ ] Use React Query for caching
- [ ] Implement code splitting

### **✅ User Experience**

- [ ] Add loading indicators
- [ ] Handle error states gracefully
- [ ] Provide user feedback
- [ ] Implement proper form validation
- [ ] Add accessibility features

### **✅ Testing**

- [ ] Write unit tests for utilities
- [ ] Test component behavior
- [ ] Mock external dependencies
- [ ] Test error scenarios
- [ ] Maintain good test coverage

---

_This quick reference guide covers the most common development tasks. For detailed information, refer to the main onboarding guide._
