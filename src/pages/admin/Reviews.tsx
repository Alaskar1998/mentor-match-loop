import { useTranslation } from "react-i18next";
import { Star, TrendingUp, MessageSquare, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminReviews } from "@/hooks/useAdminData";

const Reviews = () => {
  const { t } = useTranslation();
  const { data: reviewStats, isLoading, error } = useAdminReviews();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('admin.reviews.title', 'Reviews')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.reviews.subtitle', 'Monitor user feedback and ratings')}
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading review statistics...</p>
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
            {t('admin.reviews.title', 'Reviews')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.reviews.subtitle', 'Monitor user feedback and ratings')}
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <p className="text-destructive">Error loading review statistics</p>
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
          {t('admin.reviews.title', 'Reviews')}
        </h1>
        <p className="text-muted-foreground">
          {t('admin.reviews.subtitle', 'Monitor user feedback and ratings')}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.reviews.stats.averageRating', 'Average Rating')}
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewStats?.averageRating || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('admin.reviews.stats.averageRatingDesc', 'Out of 5 stars')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.reviews.stats.totalReviews', 'Total Reviews')}
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewStats?.totalReviews || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('admin.reviews.stats.totalReviewsDesc', 'All time reviews')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.reviews.stats.reviewsThisMonth', 'Reviews This Month')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewStats?.reviewsThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('admin.reviews.stats.reviewsThisMonthDesc', 'Current month')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.reviews.stats.positiveReviews', 'Positive Reviews')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewStats?.positiveReviews || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {t('admin.reviews.stats.positiveReviewsDesc', '4-5 star reviews')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating distribution and recent reviews */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.reviews.ratingDistribution', 'Rating Distribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviewStats?.ratingDistribution?.map((rating) => (
                <div key={rating.stars} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span>{rating.stars} stars</span>
                      <span className="text-muted-foreground">({rating.count})</span>
                    </div>
                    <span className="font-medium">{rating.percentage}%</span>
                  </div>
                  <Progress value={rating.percentage} className="h-2" />
                </div>
              )) || (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No rating data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.reviews.recentReviews', 'Recent Reviews')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviewStats?.recentReviews?.map((review) => (
                <div key={review.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{review.reviewerName}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium">{review.revieweeName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline">{review.skill}</Badge>
                    <span className="text-muted-foreground">{review.date}</span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {review.comment}
                    </p>
                  )}
                </div>
              )) || (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No recent reviews available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.reviews.activityChart', 'Review Activity Over Time')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
            <div className="text-center space-y-2">
              <Star className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                {t('admin.reviews.chartPlaceholder', 'Chart placeholder - Connect Recharts for real data')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('admin.reviews.chartData', 'Data: Review activity and rating trends over time')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reviews; 