import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MessageSquare, ArrowLeft, MapPin, Calendar, Mail, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { InvitationFlow } from '@/components/auth/InvitationFlow';
import { SignupModal } from '@/components/auth/SignupModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { notificationService } from '@/services/notificationService';

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

export default function ProfileView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user: currentUser } = useAuth();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  
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
        console.error('Error fetching profile:', profileError);
        toast.error("User profile not found");
        navigate('/');
        return;
      }

      setUser(profileData);

      // Fetch user reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          rating,
          comment,
          skill,
          created_at,
          profiles!reviewer_id (
            display_name
          )
        `)
        .eq('reviewee_id', id)
        .order('created_at', { ascending: false });

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
      } else {
        setReviews(reviewsData || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to load profile");
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
        title: 'Profile Viewed',
        message: `${viewerName} viewed your profile`,
        isRead: false,
        type: 'profile_viewed',
        actionUrl: '/dashboard/profile',
        metadata: { 
          viewerId: currentUser.id,
          viewerName: viewerName
        }
      });
    } catch (error) {
      console.error('Failed to create profile view notification:', error);
      // Don't show error to user as this is a background operation
    }
  };
  
  if (!id) {
    navigate('/');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
          <p className="text-muted-foreground mb-4">The user profile you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const handleSendInvitation = () => {
    if (!isAuthenticated) {
      setShowSignupModal(true);
    } else {
      setShowInvitationModal(true);
    }
  };

  const handleSignupComplete = async (userData: any) => {
    console.log('Signup completed:', userData);
    setShowSignupModal(false);
    setShowInvitationModal(true);
  };

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

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="w-32 h-32">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="text-2xl">{user.display_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">{user.display_name || 'User'}</h1>
                  <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                    {user.country && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {user.country}
                      </div>
                    )}
                    {user.age && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {user.age} years old
                      </div>
                    )}
                  </div>
                </div>

                {reviews.length > 0 && (
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {renderStars(
                          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                        )}
                      </div>
                      <span className="font-medium">
                        {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">({reviews.length} reviews)</span>
                    </div>
                  </div>
                )}

                {user.bio && (
                  <p className="text-muted-foreground leading-relaxed">{user.bio}</p>
                )}

                <div className="flex gap-3">
                  <Button className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" onClick={handleSendInvitation}>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invitation
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>Available via platform messaging</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{user.phone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        {user.skills_to_teach && Array.isArray(user.skills_to_teach) && user.skills_to_teach.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Skills I Can Teach</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {user.skills_to_teach.map((skill: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{skill.name || skill}</h3>
                      {skill.level && (
                        <Badge variant={
                          skill.level === 'Expert' ? 'default' : 
                          skill.level === 'Intermediate' ? 'secondary' : 'outline'
                        }>
                          {skill.level}
                        </Badge>
                      )}
                    </div>
                    {skill.description && (
                      <p className="text-muted-foreground">{skill.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Reviews & Testimonials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {review.profiles?.display_name || 'Anonymous'}
                      </span>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                    {review.skill && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        {review.skill}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSignupComplete={handleSignupComplete}
      />

      {isAuthenticated && currentUser && (
        <InvitationFlow
          isOpen={showInvitationModal}
          onClose={() => setShowInvitationModal(false)}
          recipientId={user.id}
          recipientName={user.display_name || 'User'}
          userType={currentUser.userType}
          remainingInvites={currentUser.remainingInvites}
          appCoins={currentUser.appCoins}
        />
      )}
    </div>
  );
}