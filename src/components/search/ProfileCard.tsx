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
import { useLanguage } from "@/hooks/useLanguage";
import { translateCountry } from "@/utils/translationUtils";

interface ProfileCardProps {
  user: UserProfile;
  isBlurred?: boolean;
  searchResult?: SearchResult;
}

export const ProfileCard = React.memo(({ user, isBlurred = false, searchResult }: ProfileCardProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, user: currentUser, signup } = useAuth();
  const { language } = useLanguage();
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
      toast.error(t('actions.cannotInviteSelf'));
      return;
    }

    setShowInvitationModal(true);
  };

  const handleSignupComplete = async (userData: unknown) => {
    // After successful signup, show the invitation modal
    setShowSignupModal(false);
    if (userData) {
      setShowInvitationModal(true);
    }
  };

  const handleAuthComplete = async (userData?: unknown) => {
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
        className={`w-3 h-3 sm:w-4 sm:h-4 ${
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
        <span className="bg-accent/20 text-accent font-medium">
          {skill}
        </span>
      );
    }
    
    return skill;
  };

  const getMatchTypeBadge = () => {
    if (!searchResult) return null;
    
    if (searchResult.matchType === 'exact') {
      return (
        <Badge variant="secondary" className="text-xs bg-success/10 text-success border-success/20">
          Exact Match
        </Badge>
      );
    } else if (searchResult.matchType === 'partial') {
      return (
        <Badge variant="secondary" className="text-xs bg-accent/10 text-accent border-accent/20">
          Partial Match
        </Badge>
      );
    }
    
    return null;
  };

  return (
    <Card className={`shadow-card hover:shadow-elegant transition-all duration-300 ${isBlurred ? 'blur-sm' : ''}`}>
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar 
              className="w-12 h-12 sm:w-16 sm:h-16 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              <AvatarImage src={user.profilePicture} alt={user.name} />
              <AvatarFallback className="bg-gradient-primary text-white text-lg sm:text-xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Name & Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
              <h3 
                className="text-base sm:text-lg font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                onClick={() => navigate(`/profile/${user.id}`)}
              >
                {user.name}
              </h3>
              <div className="flex items-center gap-1 sm:gap-2">
                {(user.isMentor || user.willingToTeachWithoutReturn) && (
                  <Badge variant="secondary" className="text-xs bg-accent/10 text-accent border-accent/20">
                    🌟 Mentor
                  </Badge>
                )}
                {getMatchTypeBadge()}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {translateCountry(user.country, language)}
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
              <span className="text-xs sm:text-sm font-medium text-foreground">
                {user.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Skill Level Badge */}
          <Badge 
            variant="outline" 
            className={`${getSkillLevelColor(user.skillLevel)} border text-xs`}
          >
            {user.skillLevel}
          </Badge>
        </div>

        {/* Bio */}
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
          {user.bio}
        </p>

        {/* Skills */}
        <div className="mb-3 sm:mb-4">
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
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleViewProfile}
            className="flex-1 hover:bg-muted text-xs sm:text-sm"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            View Profile
          </Button>
          {((isAuthenticated && currentUser && user.id !== currentUser.id) || !isAuthenticated) && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSendInvitation}
              className="flex-1 text-xs sm:text-sm"
            >
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
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
          isPremium={currentUser.userType === 'premium'}
          skillsToTeach={user.skills || []}
        />
      )}
    </Card>
  );
});