import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Real Supabase queries to replace mock data
const getRealDashboardStats = async () => {
  // Get total users
  const { count: totalUsers, error: usersError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (usersError) throw usersError;

  // Get new users this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const { count: newUsersThisWeek, error: newUsersError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneWeekAgo.toISOString());

  if (newUsersError) throw newUsersError;

  // Get active chats
  const { count: activeChats, error: chatsError } = await supabase
    .from('chats')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  if (chatsError) throw chatsError;

  // Get average rating - with error handling
  let averageRating = 0;
  try {
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating');

    if (!reviewsError && reviews && reviews.length > 0) {
      averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    }
  } catch (error) {
    console.warn('Could not fetch reviews data:', error);
    // Continue with default value
  }

  // Get top skills from profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('skills_to_teach');

  if (profilesError) throw profilesError;

  // Count skills
  const skillCounts: { [key: string]: number } = {};
  profiles?.forEach(profile => {
    if (profile.skills_to_teach && Array.isArray(profile.skills_to_teach)) {
      profile.skills_to_teach.forEach((skill: any) => {
        if (skill.name) {
          skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
        }
      });
    }
  });

  const topSkills = Object.entries(skillCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Get users by country
  const { data: countryData, error: countryError } = await supabase
    .from('profiles')
    .select('country')
    .not('country', 'is', null);

  if (countryError) throw countryError;

  const countryCounts: { [key: string]: number } = {};
  countryData?.forEach(profile => {
    if (profile.country) {
      countryCounts[profile.country] = (countryCounts[profile.country] || 0) + 1;
    }
  });

  const usersByCountry = Object.entries(countryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Get users by gender
  const { data: genderData, error: genderError } = await supabase
    .from('profiles')
    .select('gender')
    .not('gender', 'is', null);

  if (genderError) throw genderError;

  const genderCounts: { [key: string]: number } = {};
  genderData?.forEach(profile => {
    if (profile.gender) {
      genderCounts[profile.gender] = (genderCounts[profile.gender] || 0) + 1;
    }
  });

  const usersByGender = Object.entries(genderCounts)
    .map(([gender, count]) => ({ gender, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalUsers: totalUsers || 0,
    newUsersThisWeek: newUsersThisWeek || 0,
    activeChats: activeChats || 0,
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    topSkills,
    usersByCountry,
    usersByGender,
  };
};

const getRealUsers = async () => {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(`
      id,
      display_name,
      email,
      country,
      created_at,
      skills_to_teach,
      skills_to_learn,
      user_type,
      status
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Get chat counts for each user
  const { data: chats, error: chatsError } = await supabase
    .from('chats')
    .select('user1_id, user2_id');

  if (chatsError) throw chatsError;

  // Get review counts and average ratings - with error handling
  let reviews: any[] = [];
  try {
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('reviewee_id, rating');

    if (!reviewsError && reviewsData) {
      reviews = reviewsData;
    }
  } catch (error) {
    console.warn('Could not fetch reviews data for users:', error);
    // Continue with empty reviews array
  }

  // Process user data
  const users = profiles?.map(profile => {
    // Count user's chats
    const userChats = chats?.filter(chat => 
      chat.user1_id === profile.id || chat.user2_id === profile.id
    ) || [];

    // Calculate average rating
    const userReviews = reviews?.filter(review => review.reviewee_id === profile.id) || [];
    const averageRating = userReviews.length > 0 
      ? userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length 
      : 0;

    return {
      id: profile.id,
      name: profile.display_name || 'Unknown User',
      email: profile.email || '',
      country: profile.country || 'Unknown',
      status: profile.status || 'active',
      userType: profile.user_type || 'free',
      joinedDate: new Date(profile.created_at).toISOString().split('T')[0],
      exchanges: userChats.length,
      rating: Math.round(averageRating * 10) / 10,
    };
  }) || [];

  return users;
};

const getRealInvitations = async () => {
  const { data: invitations, error } = await supabase
    .from('invitations')
    .select(`
      id,
      skill,
      status,
      created_at,
      updated_at,
      sender_id,
      recipient_id,
      sender:profiles!invitations_sender_id_fkey(display_name),
      recipient:profiles!invitations_recipient_id_fkey(display_name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return invitations?.map(invitation => ({
    id: invitation.id,
    senderName: invitation.sender?.display_name || 'Unknown User',
    receiverName: invitation.recipient?.display_name || 'Unknown User',
    skill: invitation.skill,
    status: invitation.status,
    sentDate: new Date(invitation.created_at).toISOString().split('T')[0],
    responseDate: invitation.status !== 'pending' 
      ? new Date(invitation.updated_at).toISOString().split('T')[0] 
      : null,
    completedDate: null, // You might want to add a completed_at field
  })) || [];
};

const getRealChatStats = async () => {
  // Get total conversations
  const { count: totalConversations, error: totalError } = await supabase
    .from('chats')
    .select('*', { count: 'exact', head: true });

  if (totalError) throw totalError;

  // Get active chats
  const { count: activeChats, error: activeError } = await supabase
    .from('chats')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  if (activeError) throw activeError;

  // Get completed chats
  const { count: completedChats, error: completedError } = await supabase
    .from('chats')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed');

  if (completedError) throw completedError;

  // Get average messages per chat
  const { data: messages, error: messagesError } = await supabase
    .from('chat_messages')
    .select('chat_id');

  if (messagesError) throw messagesError;

  const averageMessagesPerChat = totalConversations > 0 
    ? (messages?.length || 0) / totalConversations 
    : 0;

  const activeChatPercentage = totalConversations > 0 
    ? (activeChats / totalConversations) * 100 
    : 0;

  // Get top active skills
  const { data: activeChatsData, error: activeChatsError } = await supabase
    .from('chats')
    .select('skill')
    .eq('status', 'active');

  if (activeChatsError) throw activeChatsError;

  const skillCounts: { [key: string]: number } = {};
  activeChatsData?.forEach(chat => {
    skillCounts[chat.skill] = (skillCounts[chat.skill] || 0) + 1;
  });

  const topActiveSkills = Object.entries(skillCounts)
    .map(([skill, activeChats]) => ({ skill, activeChats }))
    .sort((a, b) => b.activeChats - a.activeChats)
    .slice(0, 5);

  return {
    totalConversations: totalConversations || 0,
    activeChats: activeChats || 0,
    completedChats: completedChats || 0,
    averageMessagesPerChat: Math.round(averageMessagesPerChat * 10) / 10,
    activeChatPercentage: Math.round(activeChatPercentage * 10) / 10,
    topActiveSkills,
  };
};

const getRealReviews = async () => {
  try {
    console.log('🔍 Fetching reviews data...');
    
    // Get all reviews with user names
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        skill,
        created_at,
        reviewer_id,
        reviewee_id,
        reviewer:profiles!reviews_reviewer_id_fkey(display_name),
        reviewee:profiles!reviews_reviewee_id_fkey(display_name)
      `)
      .order('created_at', { ascending: false });

    console.log('📊 Reviews query result:', { reviews, error });

    if (error) {
      console.warn('❌ Could not fetch reviews data:', error);
      // Return default values if table doesn't exist or has no data
      return {
        averageRating: 0,
        totalReviews: 0,
        reviewsThisMonth: 0,
        positiveReviews: 0,
        ratingDistribution: [5, 4, 3, 2, 1].map(stars => ({ stars, count: 0, percentage: 0 })),
        recentReviews: [],
      };
    }

    // Calculate statistics
    const totalReviews = reviews?.length || 0;
    const averageRating = totalReviews > 0 
      ? reviews!.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    // Get reviews this month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const reviewsThisMonth = reviews?.filter(review => 
      new Date(review.created_at) >= oneMonthAgo
    ).length || 0;

    // Calculate positive reviews (4-5 stars)
    const positiveReviews = reviews?.filter(review => review.rating >= 4).length || 0;
    const positiveReviewsPercentage = totalReviews > 0 
      ? (positiveReviews / totalReviews) * 100 
      : 0;

    // Calculate rating distribution
    const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
      const count = reviews?.filter(review => review.rating === stars).length || 0;
      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
      return { stars, count, percentage: Math.round(percentage * 10) / 10 };
    });

    // Get recent reviews
    const recentReviews = reviews?.slice(0, 5).map(review => ({
      id: review.id,
      reviewerName: review.reviewer?.display_name || 'Unknown User',
      revieweeName: review.reviewee?.display_name || 'Unknown User',
      skill: review.skill,
      rating: review.rating,
      comment: review.comment || '',
      date: new Date(review.created_at).toISOString().split('T')[0],
    })) || [];

    const result = {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      reviewsThisMonth,
      positiveReviews: Math.round(positiveReviewsPercentage * 10) / 10,
      ratingDistribution,
      recentReviews,
    };
    
    console.log('✅ Reviews data processed:', result);
    return result;
  } catch (error) {
    console.warn('❌ Error fetching reviews data:', error);
    // Return default values on any error
    return {
      averageRating: 0,
      totalReviews: 0,
      reviewsThisMonth: 0,
      positiveReviews: 0,
      ratingDistribution: [5, 4, 3, 2, 1].map(stars => ({ stars, count: 0, percentage: 0 })),
      recentReviews: [],
    };
  }
};

// React Query hooks using real data
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: getRealDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: getRealUsers,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAdminInvitations = () => {
  return useQuery({
    queryKey: ['admin', 'invitations'],
    queryFn: getRealInvitations,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAdminChatStats = () => {
  return useQuery({
    queryKey: ['admin', 'chat-stats'],
    queryFn: getRealChatStats,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useAdminReviews = () => {
  return useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: getRealReviews,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}; 