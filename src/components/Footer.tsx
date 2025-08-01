import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Maharat Hub</h3>
            <p className="text-sm text-muted-foreground">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Platform</h4>
            <nav className="flex flex-col space-y-2">
              <Link to="/requests-feed" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Browse Requests
              </Link>
              <Link to="/create-request" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Create Request
              </Link>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.pricing')}
              </Link>
              <Link to="/my-exchanges" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.myExchanges')}
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold">Support</h4>
            <nav className="flex flex-col space-y-2">
              <Link to="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.help')}
              </Link>
              <a href="mailto:support@Maharat Hub.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('footer.links.contact')}
              </a>
              <a href="mailto:feedback@Maharat Hub.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Send Feedback
              </a>
              <Link to="/settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.settings')}
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold">Legal</h4>
            <nav className="flex flex-col space-y-2">
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.terms')}
              </Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.privacy')}
              </Link>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cookie Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                DMCA
              </a>
            </nav>
          </div>
        </div>

        <Separator className="my-6" />
        
        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {t('footer.copyright')}
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('footer.social')}
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Twitter
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              LinkedIn
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};