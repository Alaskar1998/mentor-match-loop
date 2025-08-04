import { useTranslation } from "react-i18next";
import { MessageSquare, TrendingUp, Users, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAdminChatStats } from "@/hooks/useAdminData";

const Chats = () => {
  const { t } = useTranslation();
  const { data: chatStats, isLoading, error } = useAdminChatStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('admin.chats.title', 'Chats')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.chats.subtitle', 'Monitor chat activity and conversations')}
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading chat statistics...</p>
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
            {t('admin.chats.title', 'Chats')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.chats.subtitle', 'Monitor chat activity and conversations')}
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <p className="text-destructive">Error loading chat statistics</p>
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
          {t('admin.chats.title', 'Chats')}
        </h1>
        <p className="text-muted-foreground">
          {t('admin.chats.subtitle', 'Monitor chat activity and conversations')}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.chats.stats.totalConversations', 'Total Conversations')}
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chatStats?.totalConversations || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('admin.chats.stats.totalConversationsDesc', 'All time conversations')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.chats.stats.activeChats', 'Active Chats')}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chatStats?.activeChats || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('admin.chats.stats.activeChatsDesc', 'Currently active')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.chats.stats.completedChats', 'Completed Chats')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chatStats?.completedChats || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('admin.chats.stats.completedChatsDesc', 'Successfully completed')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.chats.stats.avgMessages', 'Avg Messages/Chat')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chatStats?.averageMessagesPerChat || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('admin.chats.stats.avgMessagesDesc', 'Average per conversation')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Chat Percentage */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.chats.activeChatPercentage', 'Active Chat Percentage')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {t('admin.chats.activeChatPercentageDesc', 'Currently active conversations')}
                </span>
                <span className="text-2xl font-bold">{chatStats?.activeChatPercentage || 0}%</span>
              </div>
              <Progress value={chatStats?.activeChatPercentage || 0} className="w-full" />
              <p className="text-xs text-muted-foreground">
                {t('admin.chats.activeChatPercentageNote', 'Percentage of total conversations that are currently active')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Top Active Skills */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.chats.topActiveSkills', 'Top Active Skills')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chatStats?.topActiveSkills?.map((skill, index) => (
                <div key={skill.skill} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{skill.skill}</span>
                  </div>
                  <Badge variant="secondary">{skill.activeChats}</Badge>
                </div>
              )) || (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No active skills data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.chats.activityChart', 'Chat Activity Over Time')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
            <div className="text-center space-y-2">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                {t('admin.chats.chartPlaceholder', 'Chart placeholder - Connect Recharts for real data')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('admin.chats.chartData', 'Data: Chat activity trends over time')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chats; 