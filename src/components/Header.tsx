import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Settings, Mail, Coins } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { toast } from "sonner";

export const Header = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signin');
  const [searchQuery, setSearchQuery] = useState("");

  // Function to check if search should be disabled based on user name
  const isSearchDisabled = () => {
    if (!user?.name) return false;
    
    // List of usernames that should have search disabled
    const disabledUsernames = [
      'test',
      'demo',
      'admin',
      'moderator',
      'system',
      'blocked',
      'suspended',
      'banned',
      'restricted'
    ];
    
    return disabledUsernames.some(disabledName => 
      user.name.toLowerCase().includes(disabledName.toLowerCase())
    );
  };

  const handleSearch = () => {
    // Prevent search if user is disabled
    if (isSearchDisabled()) {
      toast.error("Search is disabled for your account type");
      return;
    }
    
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleAuthClick = (mode: 'signup' | 'signin') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleAuthComplete = (userData?: any) => {
    console.log('Auth completed:', userData);
    setShowAuthModal(false);
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
              <div className={`relative w-full ${isSearchDisabled() ? 'opacity-50' : ''}`}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder={isSearchDisabled() ? "Search disabled" : "Search for skills only..."}
                  value={searchQuery}
                  onChange={(e) => !isSearchDisabled() && setSearchQuery(e.target.value)}
                  onKeyDown={(e) => !isSearchDisabled() && e.key === "Enter" && handleSearch()}
                  className="pl-10 pr-4"
                  disabled={isSearchDisabled()}
                />
                {searchQuery && !isSearchDisabled() && (
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
                  <Link to="/my-exchanges">
                    <Button variant="ghost" size="sm">My Exchanges</Button>
                  </Link>
                  <Link to="/dashboard/gamification">
                    <Button variant="ghost" size="sm" className="p-2">
                      <Coins className="w-5 h-5" />
                    </Button>
                  </Link>
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
                  <Button onClick={() => handleAuthClick('signin')} size="sm">
                    Sign In
                  </Button>
                  <Button onClick={() => handleAuthClick('signup')} size="sm">
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden mt-3">
            <div className={`relative ${isSearchDisabled() ? 'opacity-50' : ''}`}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder={isSearchDisabled() ? "Search disabled" : "Search for skills only..."}
                value={searchQuery}
                onChange={(e) => !isSearchDisabled() && setSearchQuery(e.target.value)}
                onKeyDown={(e) => !isSearchDisabled() && e.key === "Enter" && handleSearch()}
                className="pl-10"
                disabled={isSearchDisabled()}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
        onAuthComplete={handleAuthComplete}
      />
    </>
  );
};