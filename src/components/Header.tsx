import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Settings, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SignupModal } from "@/components/auth/SignupModal";
import { SignInModal } from "@/components/auth/SignInModal";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";

export const Header = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Navigation Header */}
      <nav className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="font-bold text-xl hover:text-primary transition-colors flex-shrink-0">
              SkillExchange
            </Link>

            {/* Navigation Links - Left of Search Bar */}
            <div className="hidden lg:flex items-center gap-2">
              <Link to="/requests-feed">
                <Button variant="ghost" size="sm">Requests Feed</Button>
              </Link>
              <Link to="/create-request">
                <Button variant="ghost" size="sm">Create Request</Button>
              </Link>
              <Link to="/pricing">
                <Button variant="ghost" size="sm">Pricing</Button>
              </Link>
            </div>

            {/* Search Bar - Center */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search for skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 pr-4"
                />
                {searchQuery && (
                  <Button
                    size="sm"
                    onClick={handleSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 px-3"
                  >
                    Search
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <NotificationDropdown type="general" />
                  <Link to="/messages">
                    <Button variant="ghost" size="sm" className="p-2">
                      <Mail className="w-5 h-5" />
                    </Button>
                  </Link>
                  <UserAvatar />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/help">
                    <Button variant="ghost" size="sm">Help</Button>
                  </Link>
                  <Button onClick={() => setShowSignInModal(true)} size="sm">
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search for skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
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