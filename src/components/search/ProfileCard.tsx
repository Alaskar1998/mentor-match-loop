import { Star, MessageCircle, Eye, MapPin, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/pages/SearchResults";
import { useNavigate } from "react-router-dom";

interface ProfileCardProps {
  user: UserProfile;
}

export const ProfileCard = ({ user }: ProfileCardProps) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/profile/${user.id}`);
  };

  const handleSendInvitation = () => {
    console.log(`Sending invitation to ${user.name}`);
    // This would trigger the invitation flow
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

  return (
    <Card className="group shadow-card hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] border-0 bg-gradient-to-br from-card to-muted overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-2xl shadow-elegant group-hover:shadow-glow transition-all duration-300">
              {user.profilePicture}
            </div>
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
              {user.willingToTeachWithoutReturn && (
                <Badge variant="secondary" className="text-xs bg-accent/10 text-accent border-accent/20">
                  🌟 Mentor
                </Badge>
              )}
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
                {skill}
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
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleSendInvitation}
            className="flex-1"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Send Invitation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};