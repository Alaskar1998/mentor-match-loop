import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";

export const Footer = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-bold text-base sm:text-lg">{t('nav.maharatHub')}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-semibold text-sm sm:text-base">{t('footer.sections.platform')}</h4>
            <nav className="flex flex-col space-y-1 sm:space-y-2">
              <Link to="/requests-feed" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('footer.links.browseRequests')}
              </Link>
              <Link to="/pricing" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.pricing')}
              </Link>
              <Link to="/my-exchanges" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.myExchanges')}
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-semibold text-sm sm:text-base">{t('footer.sections.support')}</h4>
            <nav className="flex flex-col space-y-1 sm:space-y-2">
              <Link to="/help" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.help')}
              </Link>
              <Link to="/contact" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('footer.links.contact')}
              </Link>
              <Link to="/settings" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.settings')}
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-semibold text-sm sm:text-base">{t('footer.sections.legal')}</h4>
            <nav className="flex flex-col space-y-1 sm:space-y-2">
              <Link to="/terms" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.terms')}
              </Link>
              <Link to="/privacy" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.privacy')}
              </Link>
            </nav>
          </div>
        </div>

        <Separator className="my-4 sm:my-6" />
        
        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            {t('footer.copyright')}
          </div>
          
          {/* Social Media Links - Only LinkedIn and Instagram */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="text-xs sm:text-sm text-muted-foreground">
              {t('footer.social')}:
            </span>
            <a 
              href="https://www.linkedin.com/company/maharat-hub" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
            >
              LinkedIn
            </a>
            <a 
              href="https://www.instagram.com/maharathub/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};