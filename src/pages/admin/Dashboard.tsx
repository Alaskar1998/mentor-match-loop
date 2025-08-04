import { useTranslation } from "react-i18next";
import { 
  Users, 
  UserPlus, 
  MessageSquare, 
  Star,
  TrendingUp,
  Globe,
  Users as UsersIcon
} from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardStats } from "@/hooks/useAdminData";

const Dashboard = () => {
  const { t } = useTranslation();
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('admin.dashboard.title', 'Dashboard')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.dashboard.subtitle', 'Overview of your platform metrics and activity')}
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('admin.dashboard.title', 'Dashboard')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.dashboard.subtitle', 'Overview of your platform metrics and activity')}
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <p className="text-destructive">Error loading dashboard data</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('admin.dashboard.title', 'Dashboard')}
        </h1>
        <p className="text-muted-foreground">
          {t('admin.dashboard.subtitle', 'Overview of your platform metrics and activity')}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('admin.dashboard.totalUsers', 'Total Users')}
          value={stats?.totalUsers.toLocaleString() || '0'}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title={t('admin.dashboard.newUsers', 'New Users This Week')}
          value={stats?.newUsersThisWeek || 0}
          icon={UserPlus}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title={t('admin.dashboard.activeChats', 'Active Chats')}
          value={stats?.activeChats || 0}
          icon={MessageSquare}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title={t('admin.dashboard.averageRating', 'Average Rating')}
          value={stats?.averageRating || 0}
          icon={Star}
          trend={{ value: 2, isPositive: true }}
        />
      </div>

      {/* Charts and data */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Users by Country */}
        <ChartCard 
          title={t('admin.dashboard.usersByCountry', 'Users by Country')}
          description={t('admin.dashboard.usersByCountryDesc', 'Top 5 countries by user count')}
          className="lg:col-span-1"
        >
          <div className="space-y-3">
            {stats?.usersByCountry?.map((item, index) => (
              <div key={item.country} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{item.country}</span>
                </div>
                <Badge variant="secondary">{item.count}</Badge>
              </div>
            )) || (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No country data available</p>
              </div>
            )}
          </div>
        </ChartCard>

        {/* Users by Gender */}
        <ChartCard 
          title={t('admin.dashboard.usersByGender', 'Users by Gender')}
          description={t('admin.dashboard.usersByGenderDesc', 'Gender distribution')}
          className="lg:col-span-1"
        >
          <div className="space-y-3">
            {stats?.usersByGender?.map((item) => (
              <div key={item.gender} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UsersIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{item.gender}</span>
                </div>
                <Badge variant="secondary">{item.count}</Badge>
              </div>
            )) || (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No gender data available</p>
              </div>
            )}
          </div>
        </ChartCard>

        {/* Top Skills */}
        <ChartCard 
          title={t('admin.dashboard.topSkills', 'Top Exchanged Skills')}
          description={t('admin.dashboard.topSkillsDesc', 'Most popular skills')}
          className="lg:col-span-1"
        >
          <div className="space-y-3">
            {stats?.topSkills?.map((skill, index) => (
              <div key={skill.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{skill.name}</span>
                </div>
                <Badge variant="outline">{skill.count}</Badge>
              </div>
            )) || (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No skills data available</p>
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Activity Chart Placeholder */}
      <ChartCard 
        title={t('admin.dashboard.activityChart', 'Skill Exchange Activity')}
        description={t('admin.dashboard.activityChartDesc', 'Monthly exchange activity')}
        className="lg:col-span-3"
      >
        <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
          <div className="text-center space-y-2">
            <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              {t('admin.dashboard.chartPlaceholder', 'Chart placeholder - Connect Recharts for real data')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('admin.dashboard.chartData', 'Data: Monthly exchange activity over time')}
            </p>
          </div>
        </div>
      </ChartCard>
    </div>
  );
};

export default Dashboard; 