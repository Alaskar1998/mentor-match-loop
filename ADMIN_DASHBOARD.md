# Admin Dashboard Documentation

## Overview

The admin dashboard is a comprehensive management interface for the skill-exchange platform, built with React 18, TypeScript, and shadcn/ui components.

## Features

### ✅ Implemented Features

1. **Authentication & Access Control**
   - Supabase Auth integration
   - Role-based access control (admin role required)
   - Automatic redirect for unauthorized users

2. **Responsive Layout**
   - Collapsible sidebar navigation
   - Mobile-friendly design
   - Modern UI with shadcn/ui components

3. **Dashboard Pages**
   - **Dashboard**: Overview with metrics and charts
   - **Users**: User management with search and filters
   - **Invitations**: Track skill exchange invitations
   - **Chats**: Monitor conversations and activity
   - **Reviews**: User feedback and ratings

4. **Internationalization**
   - Full English and Arabic support
   - RTL layout support for Arabic
   - All text is translatable

5. **Data Management**
   - React Query for server state
   - Mock data structure ready for real API integration
   - Optimized caching and polling

## File Structure

```
src/
├── components/admin/
│   ├── AdminLayout.tsx      # Main admin layout wrapper
│   ├── Sidebar.tsx          # Navigation sidebar
│   ├── Topbar.tsx           # Top navigation bar
│   ├── StatsCard.tsx        # Reusable stats card
│   ├── ChartCard.tsx        # Reusable chart container
│   └── ActivityChart.tsx    # Sample Recharts component
├── pages/admin/
│   ├── index.tsx            # Dashboard page export
│   ├── Dashboard.tsx        # Main dashboard
│   ├── Users.tsx            # User management
│   ├── Invitations.tsx      # Invitation tracking
│   ├── Chats.tsx            # Chat monitoring
│   └── Reviews.tsx          # Review management
├── hooks/
│   └── useAdminData.tsx     # React Query hooks for admin data
└── i18n/locales/
    ├── en.ts                # English translations
    └── ar.ts                # Arabic translations
```

## Usage

### Accessing the Admin Dashboard

1. Navigate to `/admin` in your browser
2. You must be logged in and have `role = 'admin'` in the `profiles` table
3. If not authorized, you'll see an "Access Denied" page

### Adding Admin Role to a User

To make a user an admin, update their profile in the Supabase database:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'user-uuid-here';
```

### Connecting Real Data

The dashboard currently uses mock data. To connect real data:

1. **Update React Query hooks** in `src/hooks/useAdminData.tsx`:

```typescript
// Replace mock functions with real Supabase queries
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
```

2. **Add real charts** using Recharts:

```typescript
import { ActivityChart } from '@/components/admin/ActivityChart';

// In your component
<ActivityChart 
  data={realData} 
  title="Activity Over Time" 
/>
```

### Customization

#### Adding New Pages

1. Create a new page component in `src/pages/admin/`
2. Add the route to `src/App.tsx`:

```typescript
const AdminNewPage = lazy(() => import("./pages/admin/NewPage"));

// In the Routes section
<Route path="new-page" element={<AdminNewPage />} />
```

3. Add navigation item to `src/components/admin/Sidebar.tsx`:

```typescript
const navigationItems = [
  // ... existing items
  {
    href: "/admin/new-page",
    icon: NewIcon,
    label: t('admin.sidebar.newPage', 'New Page'),
  },
];
```

4. Add translations to both `en.ts` and `ar.ts`

#### Styling

All styling uses Tailwind CSS classes. The admin dashboard follows the same design system as the main app:

- Primary colors: `bg-primary`, `text-primary`
- Secondary colors: `bg-secondary`, `text-secondary`
- Muted colors: `bg-muted`, `text-muted-foreground`

#### Adding Charts

Use Recharts for data visualization:

```typescript
import { LineChart, BarChart, PieChart } from 'recharts';

// Example line chart
<LineChart data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="value" stroke="#8884d8" />
</LineChart>
```

## Security Considerations

1. **Role-based access**: Only users with `role = 'admin'` can access
2. **Server-side validation**: Always validate admin status on the server
3. **Row Level Security**: Ensure RLS policies are properly configured in Supabase

## Performance Optimizations

1. **Lazy loading**: All admin pages are lazy-loaded
2. **React Query caching**: Efficient data fetching and caching
3. **Optimized re-renders**: Components are memoized where appropriate
4. **Bundle splitting**: Admin code is separated from main app

## Future Enhancements

1. **Real-time updates**: WebSocket integration for live data
2. **Advanced filtering**: More sophisticated search and filter options
3. **Export functionality**: CSV/PDF export for reports
4. **Bulk actions**: Mass user management operations
5. **Analytics integration**: Google Analytics or similar
6. **Audit logging**: Track admin actions for security

## Troubleshooting

### Common Issues

1. **Access Denied**: Ensure user has `role = 'admin'` in profiles table
2. **Loading issues**: Check React Query configuration
3. **Translation not working**: Verify i18n setup and translation keys
4. **Charts not rendering**: Ensure Recharts is properly installed

### Debug Mode

Enable debug logging by adding to your environment:

```typescript
// In development
console.log('Admin access check:', { user, isAdmin });
```

## Contributing

When adding new features to the admin dashboard:

1. Follow the existing file structure
2. Use TypeScript for all components
3. Add proper translations for both English and Arabic
4. Include loading states and error handling
5. Test on both desktop and mobile
6. Update this documentation

## Dependencies

- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Query
- Recharts (for charts)
- React Router DOM
- i18next (internationalization)
- Supabase (backend) 