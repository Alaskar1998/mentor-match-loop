# 🚀 **MENTOR MATCH LOOP - DEVELOPER ONBOARDING GUIDE**

## 📋 **TABLE OF CONTENTS**

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Database Schema](#database-schema)
5. [Key Features & Business Logic](#key-features--business-logic)
6. [Development Setup](#development-setup)
7. [Code Organization](#code-organization)
8. [State Management](#state-management)
9. [Authentication & Authorization](#authentication--authorization)
10. [Internationalization](#internationalization)
11. [Performance Optimizations](#performance-optimizations)
12. [Testing Strategy](#testing-strategy)
13. [Deployment](#deployment)
14. [Common Patterns & Best Practices](#common-patterns--best-practices)
15. [Troubleshooting](#troubleshooting)
16. [Resources & Documentation](#resources--documentation)

---

## 🎯 **PROJECT OVERVIEW**

### **What is Mentor Match Loop?**

Mentor Match Loop is a **skill exchange platform** that connects people who want to learn skills with those who want to teach them. Users can:

- **Search** for mentors by skills
- **Send invitations** to potential mentors
- **Chat** with mentors/mentees
- **Complete exchanges** and leave reviews
- **Earn coins** through gamification
- **Request learning help** from the community

### **Core Value Proposition**

- **Skill Exchange**: Users teach skills they know in exchange for learning skills they want
- **Community-Driven**: Peer-to-peer learning without traditional teacher-student hierarchy
- **Gamified Experience**: Coin economy, achievements, and engagement features
- **Multilingual**: Support for English and Arabic

---

## 🛠️ **TECHNOLOGY STACK**

### **Frontend**

- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router DOM** for routing
- **TanStack Query** for data fetching and caching
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **Radix UI** for accessible primitives

### **Backend & Database**

- **Supabase** (PostgreSQL + Auth + Real-time)
- **PostgreSQL** for data storage
- **Row Level Security (RLS)** for data protection
- **Real-time subscriptions** for live updates

### **Development Tools**

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Vite** for fast development

### **Key Libraries**

- **React Hook Form** for form handling
- **Zod** for validation
- **i18next** for internationalization
- **Lucide React** for icons
- **Sonner** for toast notifications
- **Recharts** for data visualization

---

## 🏗️ **PROJECT ARCHITECTURE**

### **Directory Structure**

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   ├── auth/           # Authentication components
│   ├── chat/           # Chat-related components
│   ├── search/         # Search functionality
│   ├── admin/          # Admin dashboard components
│   └── gamification/   # Gamification features
├── hooks/              # Custom React hooks
├── pages/              # Route components
├── services/           # API and business logic
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── i18n/               # Internationalization
├── integrations/       # Third-party integrations
└── data/               # Static data and constants
```

### **Architecture Patterns**

- **Component-Based**: Modular, reusable components
- **Hook-Based**: Custom hooks for business logic
- **Service Layer**: Centralized API calls and business logic
- **Type Safety**: Comprehensive TypeScript usage
- **Error Boundaries**: Graceful error handling

---

## 🗄️ **DATABASE SCHEMA**

### **Core Tables**

#### **profiles**

- User profile information
- Skills to teach/learn
- Personal details (age, country, etc.)

#### **chats**

- Chat sessions between users
- Exchange state management
- Skill being exchanged

#### **chat_messages**

- Individual messages in chats
- Real-time messaging support

#### **invitations**

- Skill exchange invitations
- Status tracking (pending, accepted, declined)

#### **reviews**

- User reviews after exchanges
- Rating and feedback system

#### **notifications**

- System notifications
- Real-time updates

#### **learning_requests**

- Public learning requests
- Community help system

#### **exchange_contracts**

- Exchange agreements
- Terms and conditions tracking

### **Key Relationships**

- Users can have multiple chats
- Chats belong to two users
- Reviews are linked to chats
- Notifications are user-specific

---

## 🎯 **KEY FEATURES & BUSINESS LOGIC**

### **1. Authentication System**

```typescript
// src/hooks/useAuth.tsx
const { user, login, signup, logout } = useAuth();
```

- **Supabase Auth** integration
- **Social login** (Google, Facebook, Apple)
- **Session management** with auto-refresh
- **Profile completion** tracking

### **2. Search & Discovery**

```typescript
// src/services/searchService.ts
const searchResults = await searchUsers(query, filters);
```

- **Real-time search** with debouncing
- **Skill-based filtering**
- **Location-based search**
- **Popular skills** suggestions

### **3. Exchange System**

```typescript
// src/services/exchangeService.ts
const invitation = await sendInvitation(recipientId, skill, message);
```

- **Invitation workflow**
- **Chat system** with real-time messaging
- **Exchange completion** tracking
- **Review system** after exchanges

### **4. Gamification**

```typescript
// src/hooks/useGamification.tsx
const { coins, earnCoins, spendCoins } = useGamification();
```

- **Coin economy** system
- **Daily login bonuses**
- **Achievement tracking**
- **Leaderboards**

### **5. Notification System**

```typescript
// src/hooks/useNotifications.tsx
const { notifications, markAsRead } = useNotifications();
```

- **Real-time notifications**
- **Email notifications**
- **Push notifications**
- **Notification preferences**

---

## 🚀 **DEVELOPMENT SETUP**

### **Prerequisites**

- Node.js 18+
- npm or yarn
- Git
- VS Code (recommended)

### **Initial Setup**

```bash
# Clone the repository
git clone <repository-url>
cd mentor-match-loop

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:8081
```

### **Environment Variables**

```bash
# Create .env.local file
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Available Scripts**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript type checking
npm run format       # Format code with Prettier
```

---

## 📁 **CODE ORGANIZATION**

### **Component Structure**

```typescript
// Example component structure
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';

export const ExampleComponent = () => {
  const { user } = useAuth();

  // Component logic here

  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### **Custom Hooks Pattern**

```typescript
// src/hooks/useExample.tsx
export const useExample = () => {
  // Hook logic
  return {
    // Return values
  };
};
```

### **Service Layer Pattern**

```typescript
// src/services/exampleService.ts
export const exampleService = {
  async fetchData() {
    // API call logic
  },

  async updateData(data) {
    // Update logic
  },
};
```

---

## 🔄 **STATE MANAGEMENT**

### **React Query (TanStack Query)**

```typescript
// Data fetching and caching
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### **Context Providers**

- **AuthProvider**: User authentication state
- **GamificationProvider**: Coin economy state
- **NotificationProvider**: Notification state
- **LanguageProvider**: Internationalization state

### **Local State**

- **useState**: Component-level state
- **useReducer**: Complex state logic
- **useMemo**: Expensive computations
- **useCallback**: Function memoization

---

## 🔐 **AUTHENTICATION & AUTHORIZATION**

### **Authentication Flow**

1. **User signs up/logs in** via Supabase Auth
2. **Profile is created** in profiles table
3. **Session is maintained** with auto-refresh
4. **Protected routes** check authentication status

### **Authorization Patterns**

```typescript
// Route protection
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;

  return children;
};
```

### **Role-Based Access**

- **Regular users**: Basic platform access
- **Premium users**: Enhanced features
- **Admin users**: Dashboard access

---

## 🌍 **INTERNATIONALIZATION**

### **Supported Languages**

- **English** (default)
- **Arabic** (RTL support)

### **Translation Usage**

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
const translatedText = t('common.welcome');
```

### **Language Switching**

```typescript
import { useLanguage } from '@/hooks/useLanguage';

const { language, setLanguage } = useLanguage();
```

---

## ⚡ **PERFORMANCE OPTIMIZATIONS**

### **Code Splitting**

- **Lazy loading** of pages and components
- **Route-based** code splitting
- **Dynamic imports** for heavy components

### **Caching Strategy**

- **React Query** for API data caching
- **Browser caching** for static assets
- **Service Worker** for offline support

### **Bundle Optimization**

- **Tree shaking** for unused code removal
- **Chunk splitting** for better loading
- **Compression** for smaller bundle sizes

### **Performance Monitoring**

```typescript
// src/hooks/usePerformanceMonitor.tsx
const { startRender, endRender } = usePerformanceMonitor('ComponentName');
```

---

## 🧪 **TESTING STRATEGY**

### **Testing Tools**

- **Vitest** for unit testing
- **React Testing Library** for component testing
- **MSW** for API mocking

### **Test Structure**

```typescript
// Example test
import { render, screen } from '@testing-library/react';
import { ExampleComponent } from './ExampleComponent';

describe('ExampleComponent', () => {
  it('renders correctly', () => {
    render(<ExampleComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### **Testing Commands**

```bash
npm run test           # Run all tests
npm run test:ui        # Run tests with UI
npm run test:coverage  # Run tests with coverage
```

---

## 🚀 **DEPLOYMENT**

### **Build Process**

```bash
npm run build  # Creates optimized production build
```

### **Deployment Options**

- **Vercel**: Recommended for React apps
- **Netlify**: Alternative hosting
- **AWS S3 + CloudFront**: Custom setup
- **Supabase Edge Functions**: Backend functions

### **Environment Configuration**

- **Development**: Local development
- **Staging**: Pre-production testing
- **Production**: Live application

---

## 📝 **COMMON PATTERS & BEST PRACTICES**

### **1. Error Handling**

```typescript
// Always wrap async operations
try {
  const result = await apiCall();
} catch (error) {
  logger.error('API call failed:', error);
  toast.error('Something went wrong');
}
```

### **2. Loading States**

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
});

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

### **3. Form Handling**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: {
    // form defaults
  },
});
```

### **4. Type Safety**

```typescript
// Always define proper types
interface User {
  id: string;
  name: string;
  email: string;
}

// Use strict typing
const user: User = {
  id: '123',
  name: 'John',
  email: 'john@example.com',
};
```

### **5. Component Composition**

```typescript
// Prefer composition over inheritance
const Card = ({ children, ...props }) => (
  <div className="card" {...props}>
    {children}
  </div>
);
```

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues**

#### **1. Build Errors**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **2. TypeScript Errors**

```bash
# Check types
npm run type-check

# Fix common issues
npm run lint:fix
```

#### **3. Database Connection Issues**

- Check Supabase credentials
- Verify network connectivity
- Check RLS policies

#### **4. Performance Issues**

- Use React DevTools Profiler
- Check bundle analyzer
- Monitor network requests

### **Debug Tools**

- **React DevTools**: Component inspection
- **Redux DevTools**: State debugging
- **Network tab**: API request monitoring
- **Console**: Error logging

---

## 📚 **RESOURCES & DOCUMENTATION**

### **Official Documentation**

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### **Project-Specific Docs**

- `README.md`: Basic setup instructions
- `DEVELOPER_IMPROVEMENTS.md`: Development workflow
- `FINAL_PROJECT_STATUS.md`: Current project status

### **Code Quality Tools**

- **ESLint**: Code linting rules
- **Prettier**: Code formatting
- **TypeScript**: Type checking

### **Development Tools**

- **VS Code Extensions**: Recommended extensions
- **Git Hooks**: Pre-commit hooks
- **CI/CD**: Automated testing and deployment

---

## 🎯 **NEXT STEPS FOR NEW DEVELOPERS**

### **Week 1: Setup & Familiarization**

1. ✅ Complete development setup
2. ✅ Read through this guide
3. ✅ Explore the codebase structure
4. ✅ Set up VS Code with recommended extensions
5. ✅ Run the application locally

### **Week 2: Core Features**

1. 🔍 Study authentication flow
2. 🔍 Understand search functionality
3. 🔍 Learn about the exchange system
4. 🔍 Explore gamification features
5. 🔍 Review notification system

### **Week 3: Advanced Topics**

1. 🚀 Deep dive into performance optimizations
2. 🚀 Study internationalization
3. 🚀 Learn about testing strategies
4. 🚀 Understand deployment process
5. 🚀 Review error handling patterns

### **Week 4: Contribution**

1. 🎯 Pick up first bug fix or feature
2. 🎯 Follow coding standards
3. 🎯 Write tests for new code
4. 🎯 Submit pull request
5. 🎯 Get code review feedback

---

## 🤝 **GETTING HELP**

### **Team Communication**

- **Slack/Discord**: Team chat
- **GitHub Issues**: Bug reports and feature requests
- **Code Reviews**: Feedback on pull requests

### **Mentorship**

- **Senior Developers**: Technical guidance
- **Code Reviews**: Learning from feedback
- **Pair Programming**: Collaborative learning

### **Resources**

- **Stack Overflow**: General programming questions
- **React Community**: React-specific help
- **Supabase Community**: Database questions

---

## 🎉 **WELCOME TO THE TEAM!**

You're now ready to contribute to Mentor Match Loop! Remember:

- **Ask questions** when you're stuck
- **Follow the established patterns**
- **Write clean, maintainable code**
- **Test your changes thoroughly**
- **Document your work**

**Happy coding! 🚀**

---

_This guide is a living document. Please update it as the project evolves._
