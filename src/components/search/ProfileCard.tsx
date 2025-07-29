import React, { useState } from "react";
import { Star, MessageCircle, Eye, MapPin, Award } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/pages/SearchResults";
import { SearchResult } from "@/services/searchService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { InvitationFlow } from "@/components/auth/InvitationFlow";
import { AuthModal } from "@/components/auth/AuthModal";

interface ProfileCardProps {
  user: UserProfile;
  isBlurred?: boolean;
  searchResult?: SearchResult;
}

export const ProfileCard = React.memo(({ user, isBlurred = false, searchResult }: ProfileCardProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, user: currentUser, signup } = useAuth();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showInvitationModal, setShowInvitationModal] = useState(false);

  const handleViewProfile = () => {
    navigate(`/profile/${user.id}`);
  };

  const handleSendInvitation = () => {
    if (!isAuthenticated) {
      setShowSignupModal(true);
      return;
    }

    // For authenticated users, show invitation modal
    if (user.id === currentUser?.id) {
      toast.error("You cannot send an invitation to yourself");
      return;
    }

    setShowInvitationModal(true);
  };

  const handleSignupComplete = async (userData: any) => {
    // After successful signup, show the invitation modal
    setShowSignupModal(false);
    if (userData) {
      setShowInvitationModal(true);
    }
  };

  const handleAuthComplete = async (userData?: any) => {
    // After successful authentication, show the invitation modal
    setShowSignupModal(false);
    if (userData) {
      setShowInvitationModal(true);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "fill-accent text-accent"
            : "text-muted-foreground/30"
        }`}
      />
    ));
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-success/10 text-success border-success/20";
      case "Intermediate":
        return "bg-accent/10 text-accent border-accent/20";
      case "Expert":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Highlight matched skills
  const getSkillDisplay = (skill: string) => {
    if (!searchResult) return skill;
    
    const isMatched = searchResult.matchedSkills.some(
      matchedSkill => matchedSkill.toLowerCase() === skill.toLowerCase()
    );
    
    if (isMatched) {
      return (
        <span className="bg-yellow-200 text-yellow-800 px-1 rounded font-medium">
          {skill}
        </span>
      );
    }
    
    return skill;
  };

  // Get match type badge
  const getMatchTypeBadge = () => {
    if (!searchResult) return null;
    
    const badgeConfig = {
      exact: { label: 'Exact Match', className: 'bg-green-100 text-green-800 border-green-200' },
      prefix: { label: 'Prefix Match', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      suffix: { label: 'Suffix Match', className: 'bg-orange-100 text-orange-800 border-orange-200' },
      partial: { label: 'Partial Match', className: 'bg-gray-100 text-gray-800 border-gray-200' }
    };
    
    const config = badgeConfig[searchResult.matchType];
    if (!config) return null;
    
    return (
      <Badge variant="outline" className={`text-xs ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="group shadow-card hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] border-0 bg-gradient-to-br from-card to-muted overflow-hidden relative">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Profile Picture */}
          <div className="relative">
            <Avatar className="w-16 h-16 shadow-elegant group-hover:shadow-glow transition-all duration-300">
              <AvatarImage 
                src={user.profilePicture.startsWith('http') ? user.profilePicture : undefined} 
                alt={user.name} 
              />
              <AvatarFallback className="bg-gradient-primary text-2xl">
                {user.profilePicture.startsWith('http') ? user.name.charAt(0) : user.profilePicture}
              </AvatarFallback>
            </Avatar>
            {user.isMentor && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-sm">
                🌟
              </div>
            )}
          </div>

          {/* Name & Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {user.name}
              </h3>
              {user.isMentor && (
                <Badge variant="secondary" className="text-xs bg-accent/10 text-accent border-accent/20">
                  🌟 Mentor
                </Badge>
              )}
              {user.willingToTeachWithoutReturn && (
                <Badge variant="secondary" className="text-xs bg-accent/10 text-accent border-accent/20">
                  🌟 Mentor
                </Badge>
              )}
              {getMatchTypeBadge()}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {user.country}
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3" />
                {user.successfulExchanges} exchanges
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(user.rating)}
              </div>
              <span className="text-sm font-medium text-foreground">
                {user.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Skill Level Badge */}
          <Badge 
            variant="outline" 
            className={`${getSkillLevelColor(user.skillLevel)} border`}
          >
            {user.skillLevel}
          </Badge>
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {user.bio}
        </p>

        {/* Skills */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {user.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full"
              >
                {getSkillDisplay(skill)}
              </span>
            ))}
            {user.skills.length > 3 && (
              <span className="text-xs text-muted-foreground px-2 py-1">
                +{user.skills.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleViewProfile}
            className="flex-1 hover:bg-muted"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Profile
          </Button>
          {((isAuthenticated && currentUser && user.id !== currentUser.id) || !isAuthenticated) && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSendInvitation}
              className="flex-1"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          )}
        </div>
      </CardContent>

      {/* Modals */}
      <AuthModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onAuthComplete={handleAuthComplete}
      />

      {isAuthenticated && currentUser && (
        <InvitationFlow
          isOpen={showInvitationModal}
          onClose={() => setShowInvitationModal(false)}
          recipientId={user.id}
          recipientName={user.name}
          userType={currentUser.userType}
          remainingInvites={currentUser.remainingInvites}
          appCoins={currentUser.appCoins}
          skillsToTeach={user.skills || []}
        />
      )}
    </Card>
  );
});