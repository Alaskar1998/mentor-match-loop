import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ArrowLeft, MapPin, Calendar, Mail, Trophy, Users, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { InvitationFlow } from '@/components/auth/InvitationFlow';
import { AuthModal } from '@/components/auth/AuthModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { notificationService } from '@/services/notificationService';
import { useLanguage } from '@/hooks/useLanguage';
import { useTranslation } from 'react-i18next';
import { translateCountry } from '@/utils/translationUtils';
import { logger } from '@/utils/logger';

interface UserProfile {
  id: string;
  display_name: string;
  email?: string;
  bio?: string;
  country?: string;
  age?: number;
  gender?: string;
  phone?: string;
  avatar_url?: string;
  skills_to_teach?: any;
  skills_to_learn?: string[];
  created_at?: string;
  updated_at?: string;
  willing_to_teach_without_return?: boolean;
}

interface Exchange {
  id: string;
  skill: string;
  status: string;
  created_at: string;
  partner_name: string;
}

export default function ProfileView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user: currentUser } = useAuth();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [stats, setStats] = useState({
    totalExchanges: 0,
    averageRating: 0,
    totalReviews: 0
  });
  
  useEffect(() => {
    if (id) {
      fetchUserProfile();
      // Create profile view notification (but not for viewing own profile)
      if (currentUser && currentUser.id !== id) {
        createProfileViewNotification();
      }
    }
  }, [id, currentUser]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) {
        logger.error('Error fetching profile:', profileError);
        toast.error(t('actions.userProfileNotFound'));
        navigate('/');
        return;
      }

      setUser(profileData);

      // Fetch user reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          skill_rating,
          communication_rating,
          review_text,
          skill,
          created_at,
          profiles!reviewer_id (
            display_name,
            avatar_url
          )
        `)
        .eq('reviewed_user_id', id)
        .order('created_at', { ascending: false });

      if (reviewsError) {
        logger.error('Error fetching reviews:', reviewsError);
      } else {
        setReviews(reviewsData || []);
      }

      // Fetch user exchanges (chats)
      const { data: exchangesData, error: exchangesError } = await supabase
        .from('chats')
        .select(`
          id,
          skill,
          exchange_state,
          created_at,
          user1_id,
          user2_id
        `)
        .or(`user1_id.eq.${id},user2_id.eq.${id}`)
        .eq('exchange_state', 'completed')
        .order('created_at', { ascending: false })
        .limit(5);

      if (exchangesError) {
        logger.error('Error fetching exchanges:', exchangesError);
      } else {
        // Transform exchanges to include partner names
        const transformedExchanges = await Promise.all(
          (exchangesData || []).map(async (exchange) => {
            const partnerId = exchange.user1_id === id ? exchange.user2_id : exchange.user1_id;
            const { data: partnerData } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', partnerId)
              .single();
            
            return {
              ...exchange,
              partner_name: partnerData?.display_name || 'Unknown User'
            };
          })
        );
        setExchanges(transformedExchanges);
      }

      // Calculate stats
      const totalExchanges = exchangesData?.length || 0;
      const averageRating = reviewsData && reviewsData.length > 0 
        ? reviewsData.reduce((sum, r) => sum + r.skill_rating, 0) / reviewsData.length 
        : 0;
      const totalReviews = reviewsData?.length || 0;

      setStats({
        totalExchanges,
        averageRating,
        totalReviews
      });

    } catch (error) {
      logger.error('Error:', error);
              toast.error(t('actions.failedToLoadProfile'));
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const createProfileViewNotification = async () => {
    try {
      if (!currentUser || !id) return;

      // Get the viewer's name
      const { data: viewerProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', currentUser.id)
        .single();

      const viewerName = viewerProfile?.display_name || 'Someone';

      await notificationService.createNotification({
        userId: id,
        title: t('actions.profileViewed'),
        message: `${viewerName} viewed your profile`,
        isRead: false,
        type: 'profile_viewed',
        actionUrl: '/profile',
        metadata: { 
          viewerId: currentUser.id,
          viewerName: viewerName
        }
      });
    } catch (error) {
      logger.error('Failed to create profile view notification:', error);
      // Don't show error to user as this is a background operation
    }
  };
  
  if (!id) {
    navigate('/');
    return null;
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>{t('actions.loadingProfile')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t('actions.profileNotFound')}</h2>
          <p className="text-muted-foreground mb-4">{t('actions.profileNotFoundDesc')}</p>
          <Button onClick={() => navigate('/')}>{t('actions.goHome')}</Button>
        </div>
      </div>
    );
  }

  const handleSendInvitation = () => {
    if (!isAuthenticated) {
      setShowSignupModal(true);
      return;
    }

    // For authenticated users, show invitation modal
    if (user.id === currentUser?.id) {
      toast.error(t('actions.cannotInviteSelf'));
      return;
    }

    setShowInvitationModal(true);
  };

  const handleAuthComplete = async (userData?: any) => {
    logger.debug('Auth completed:', userData);
    setShowSignupModal(false);
    setShowInvitationModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Profile Header with Stats */}
        <Card className="overflow-hidden shadow-lg border-0">
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex flex-col items-center lg:items-start">
                <Avatar className="w-40 h-40 border-4 border-white shadow-xl mb-4">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                    {user.display_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Send Invitation Button - Centered under avatar */}
                {((isAuthenticated && currentUser && user.id !== currentUser.id) || !isAuthenticated) && (
                  <Button 
                    onClick={handleSendInvitation} 
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Send Invitation
                  </Button>
                )}
              </div>
              
              <div className="flex-1 space-y-6">
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">{user.display_name || 'User'}</h1>
                  <div className="flex items-center gap-6 mb-4 text-gray-600">
                    {user.country && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">{translateCountry(user.country, language)}</span>
                      </div>
                    )}
                    {user.age && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-green-500" />
                        <span className="font-medium">{user.age} years old</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Core Stats - Rating and Exchanges */}
                  <div className="flex flex-wrap items-center gap-8 mb-6">
                    <div className="flex items-center gap-3 bg-white/80 rounded-xl px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        {renderStars(stats.averageRating)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xl">{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0'}</span>
                        <span className="text-sm text-gray-500">({stats.totalReviews} reviews)</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white/80 rounded-xl px-4 py-3 shadow-sm">
                      <Trophy className="w-6 h-6 text-yellow-500" />
                      <div className="flex flex-col">
                        <span className="font-bold text-xl">{stats.totalExchanges}</span>
                        <span className="text-sm text-gray-500">exchanges completed</span>
                      </div>
                    </div>
                  </div>

                  {user.bio && (
                    <div className="bg-white/80 rounded-xl p-4 shadow-sm">
                      <p className="text-gray-700 leading-relaxed text-lg italic">"{user.bio}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Skills - Moved to top */}
        {user.skills_to_teach && Array.isArray(user.skills_to_teach) && user.skills_to_teach.length > 0 && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                <div className="p-2 bg-green-100 rounded-full">
                  <Trophy className="w-7 h-7 text-green-600" />
                </div>
                Skills I Can Teach
                <Badge variant="secondary" className="ml-3 text-sm">
                  {user.skills_to_teach.length} skills
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-6">
                {user.skills_to_teach.map((skill: any, index: number) => (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900 text-xl">{skill.name || skill}</h3>
                      {skill.level && (
                        <Badge variant={
                          skill.level === 'Expert' ? 'default' : 
                          skill.level === 'Intermediate' ? 'secondary' : 'outline'
                        } className={
                          skill.level === 'Expert' ? 'bg-green-100 text-green-700 border-green-200' :
                          skill.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                          'bg-gray-100 text-gray-700 border-gray-200'
                        }>
                          {skill.level}
                        </Badge>
                      )}
                    </div>
                    {skill.description && (
                      <p className="text-gray-700 leading-relaxed text-base">{skill.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Latest Exchanges Section - Always show, even if empty */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
              <div className="p-2 bg-blue-100 rounded-full">
                <Clock className="w-7 h-7 text-blue-600" />
              </div>
              Latest Exchanges
              <Badge variant="secondary" className="ml-3 text-sm">
                {Math.min(exchanges.length, 3)} recent
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {exchanges.length > 0 ? (
              <div className="space-y-4">
                {exchanges.slice(0, 3).map((exchange) => (
                  <div key={exchange.id} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <Avatar className="w-12 h-12 border-2 border-blue-200">
                            <AvatarFallback className="text-sm font-semibold bg-blue-100 text-blue-700">
                              {exchange.partner_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{exchange.skill}</h3>
                            <p className="text-gray-600">
                              with <span className="font-semibold">{exchange.partner_name}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-2 bg-green-100 text-green-700 border-green-200">
                          {exchange.status}
                        </Badge>
                        <p className="text-sm text-gray-500 font-medium">
                          {formatDate(exchange.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No exchanges yet</h3>
                <p className="text-gray-500">Start exchanging skills to build your history!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews Section - Moved to bottom */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Star className="w-7 h-7 text-yellow-600" />
              </div>
              Reviews & Testimonials
              <Badge variant="secondary" className="ml-3 text-sm">
                {reviews.length} reviews
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-yellow-200">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12 border-2 border-yellow-200">
                        <AvatarImage src={review.profiles?.avatar_url} />
                        <AvatarFallback className="text-sm font-semibold bg-yellow-100 text-yellow-700">
                          {(review.profiles?.display_name || 'A').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-gray-900 text-lg">
                            {review.profiles?.display_name || 'Anonymous'}
                          </span>
                          <div className="flex items-center gap-2">
                            {renderStars(review.skill_rating)}
                            <span className="text-sm text-gray-500 font-medium">
                              {review.skill_rating}/5
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-base mb-3">{review.review_text}</p>
                        {review.skill && (
                          <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-200 text-yellow-700">
                            {review.skill}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-10 h-10 text-yellow-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No reviews yet</h3>
                <p className="text-gray-500">Be the first to leave a review!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onAuthComplete={handleAuthComplete}
      />

      {isAuthenticated && currentUser && user && (
        <InvitationFlow
          isOpen={showInvitationModal}
          onClose={() => setShowInvitationModal(false)}
          recipientId={user.id}
          recipientName={user.display_name || 'User'}
          userType={currentUser.userType}
          remainingInvites={currentUser.remainingInvites}
          isPremium={currentUser.userType === 'premium'}
          skillsToTeach={Array.isArray(user.skills_to_teach) ? user.skills_to_teach.map((s: any) => typeof s === 'string' ? s : s.name || s.skill || s.title || JSON.stringify(s)) : []}
        />
      )}
    </div>
  );
}