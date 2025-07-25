import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { SignupModal } from "@/components/auth/SignupModal";
import { SignInModal } from "@/components/auth/SignInModal";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";

export const Header = () => {
  const { isAuthenticated } = useAuth();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);

  return (
    <>
      {/* Navigation Header */}
      <nav className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-bold text-xl hover:text-primary transition-colors">
              SkillExchange
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/requests-feed">
                <Button variant="ghost">Browse Requests</Button>
              </Link>
              <Link to="/create-request">
                <Button variant="outline">Create Request</Button>
              </Link>
              <Link to="/pricing">
                <Button variant="ghost">Pricing</Button>
              </Link>
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <NotificationDropdown type="general" />
                  <NotificationDropdown type="chat" />
                  <UserAvatar />
                </div>
              ) : (
                <Button onClick={() => setShowSignInModal(true)}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <SignInModal 
        isOpen={showSignInModal} 
        onClose={() => setShowSignInModal(false)}
        onSwitchToSignup={() => {
          setShowSignInModal(false);
          setShowSignupModal(true);
        }}
      />
      
      <SignupModal 
        isOpen={showSignupModal} 
        onClose={() => setShowSignupModal(false)}
        onSignupComplete={(userData) => {
          console.log('Signup completed:', userData);
          setShowSignupModal(false);
        }}
      />
    </>
  );
};