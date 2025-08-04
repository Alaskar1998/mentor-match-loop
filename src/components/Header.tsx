import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Settings, Mail, Coins, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { isSearchDisabled } from "@/utils/userValidation";

export const Header = () => {
  const { isAuthenticated, user, isSessionRestoring } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signin');
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Use centralized validation
  const searchDisabled = isSearchDisabled(user?.name);

  // Show loading state while session is being restored
  if (isSessionRestoring) {
    return (
      <nav className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </div>
      </nav>
    );
  }

  const handleSearch = () => {
    // Prevent search if user is disabled
    if (searchDisabled) {
      toast.error(t('actions.searchDisabled'));
      return;
    }
    
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const handleAuthClick = (mode: 'signup' | 'signin') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setMobileMenuOpen(false);
  };

  const handleAuthComplete = (userData?: unknown) => {
    console.log('Auth completed:', userData);
    setShowAuthModal(false);
  };

  const handleCoinClick = () => {
    navigate('/gamification');
    setMobileMenuOpen(false);
  };

  const handleMobileNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Navigation Header */}
      <nav className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className={`font-bold text-xl hover:text-primary transition-colors flex-shrink-0 ${isRTL ? 'order-10' : 'order-1'}`}>
              {t('nav.maharatHub')}
            </Link>

            {/* Desktop Navigation Links */}
            <div className={`hidden lg:flex items-center gap-2 ${isRTL ? 'order-8' : 'order-2'}`}>
              <Link to="/requests-feed">
                <Button variant="ghost" size="sm">{t('nav.requestsFeed')}</Button>
              </Link>
              <Link to="/pricing">
                <Button variant="ghost" size="sm">{t('nav.pricing')}</Button>
              </Link>
            </div>

            {/* Desktop Search Bar - Center */}
            <div className={`hidden md:flex flex-1 max-w-md mx-4 ${isRTL ? 'order-5' : 'order-3'}`}>
              <div className={`relative w-full ${searchDisabled ? 'opacity-50' : ''}`}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder={searchDisabled ? t('actions.searchDisabledPlaceholder') : t('hero.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => !searchDisabled && setSearchQuery(e.target.value)}
                  onKeyDown={(e) => !searchDisabled && e.key === "Enter" && handleSearch()}
                  className="pl-10 pr-4"
                  disabled={searchDisabled}
                />
                {searchQuery && !searchDisabled && (
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

            {/* Desktop Right side elements */}
            <div className={`hidden md:flex items-center gap-2 lg:gap-4 ${isRTL ? 'order-1' : 'order-4'}`}>
              {/* Language Switcher */}
              <LanguageSwitcher />
              
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  {/* Coin Display - Icon only */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCoinClick}
                    className="flex items-center text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                  >
                    <Coins className="w-4 h-4" />
                  </Button>
                  
                  <Link to="/messages">
                    <Button variant="ghost" size="sm">{t('nav.messages')}</Button>
                  </Link>
                  <Link to="/my-exchanges">
                    <Button variant="ghost" size="sm">{t('nav.myExchanges')}</Button>
                  </Link>
                  <NotificationDropdown type="general" />
                  <NotificationDropdown type="chat" />
                  <UserAvatar />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/help">
                    <Button variant="ghost" size="sm">{t('nav.help')}</Button>
                  </Link>
                  <Link to="/contact">
                    <Button variant="ghost" size="sm">{t('nav.contact')}</Button>
                  </Link>
                  <Button onClick={() => handleAuthClick('signin')} size="sm">
                    {t('nav.signIn')}
                  </Button>
                  <Button onClick={() => handleAuthClick('signup')} size="sm">
                    {t('nav.signUp')}
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden mt-3">
            <div className={`relative ${searchDisabled ? 'opacity-50' : ''}`}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder={searchDisabled ? t('actions.searchDisabledPlaceholder') : t('hero.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => !searchDisabled && setSearchQuery(e.target.value)}
                onKeyDown={(e) => !searchDisabled && e.key === "Enter" && handleSearch()}
                className="pl-10"
                disabled={searchDisabled}
              />
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="space-y-3">
                {/* Mobile Navigation Links */}
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="ghost"
                    onClick={() => handleMobileNavClick('/requests-feed')}
                    className="justify-start"
                  >
                    {t('nav.requestsFeed')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleMobileNavClick('/pricing')}
                    className="justify-start"
                  >
                    {t('nav.pricing')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleMobileNavClick('/help')}
                    className="justify-start"
                  >
                    {t('nav.help')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleMobileNavClick('/contact')}
                    className="justify-start"
                  >
                    {t('nav.contact')}
                  </Button>
                </div>

                {/* Mobile Language Switcher */}
                <div className="pt-2 border-t">
                  <LanguageSwitcher />
                </div>

                {/* Mobile Auth/User Section */}
                {isAuthenticated ? (
                  <div className="pt-2 border-t space-y-2">
                    <Button
                      variant="ghost"
                      onClick={handleCoinClick}
                      className="justify-start text-yellow-600"
                    >
                      <Coins className="w-4 h-4 mr-2" />
                      {t('actions.coins')}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleMobileNavClick('/messages')}
                      className="justify-start"
                    >
                      {t('nav.messages')}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleMobileNavClick('/my-exchanges')}
                      className="justify-start"
                    >
                      {t('nav.myExchanges')}
                    </Button>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('actions.notifications')}</span>
                      <div className="flex gap-2">
                        <NotificationDropdown type="general" />
                        <NotificationDropdown type="chat" />
                      </div>
                    </div>
                    <UserAvatar />
                  </div>
                ) : (
                  <div className="pt-2 border-t space-y-2">
                    <Button
                      onClick={() => handleAuthClick('signin')}
                      className="w-full"
                    >
                      {t('nav.signIn')}
                    </Button>
                    <Button
                      onClick={() => handleAuthClick('signup')}
                      variant="outline"
                      className="w-full"
                    >
                      {t('nav.signUp')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
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