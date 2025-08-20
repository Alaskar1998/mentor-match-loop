import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowUp } from 'lucide-react';
import { upgradeInterestService } from '@/services/upgradeInterestService';

interface UpgradeRequestButtonProps {
  planName: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
}

export const UpgradeRequestButton: React.FC<UpgradeRequestButtonProps> = ({
  planName,
  price,
  billingCycle
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const handleUpgradeRequest = () => {
    if (!user) {
      toast.error(t('pricing.upgradeError'));
      return;
    }

    // Track upgrade interest
    upgradeInterestService.trackInterest(
      user.id,
      user.email || '',
      user.name || 'Unknown User',
      billingCycle
    );

    // Show success message using translation key instead of hardcoded English
    toast.success(t('pricing.upgradeInterestRecorded'));
    
    // Show additional info using translation key instead of hardcoded English
    setTimeout(() => {
      toast.info(t('pricing.teamWillContact'), {
        duration: 8000,
      });
    }, 2000);
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleUpgradeRequest}
        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <ArrowUp className="w-4 h-4 mr-2" />
        {/* Replace hardcoded "Upgrade" text with translation key */}
        {t('pricing.upgrade')}
      </Button>
      
      <div className="text-xs text-muted-foreground text-center p-3 bg-pink-50 border border-pink-200 rounded-lg">
        {/* Replace hardcoded "How it works:" text with translation key */}
        <div className="font-medium text-pink-800 mb-1">{t('pricing.howItWorks')}</div>
        <div className="text-pink-700">
          {/* Replace hardcoded step descriptions with translation keys */}
          {(t('pricing.howItWorksSteps', { returnObjects: true }) as string[]).map((step: string, index: number) => (
            <React.Fragment key={index}>
              {index + 1}. {step}<br/>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
