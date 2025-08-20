import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { MessageSquare, Loader2 } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgradeRequest = async () => {
    if (!user) {
      toast.error(t('pricing.upgradeError'));
      return;
    }

    setIsLoading(true);
    
    try {
      // Track upgrade interest using the service
      upgradeInterestService.trackInterest(
        user.id,
        user.email || '',
        user.name || 'Unknown User',
        billingCycle
      );
      
      // Show success message
      toast.success(t('pricing.upgradeRequestSent'));
      
      // Show additional info
      setTimeout(() => {
        toast.info(t('pricing.willReachOutEmail'), {
          duration: 8000,
        });
      }, 2000);
      
    } catch (error) {
      console.error('Upgrade request error:', error);
      toast.error(t('pricing.failedToSendRequest'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleUpgradeRequest}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {/* Replace hardcoded "Sending Request..." text with translation key */}
            {t('pricing.sendingRequest')}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            {/* Replace hardcoded "Request Upgrade" text with translation key */}
            {t('pricing.requestUpgrade')}
          </div>
        )}
      </Button>
      
      <div className="text-xs text-muted-foreground text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
        {/* Replace hardcoded "How it works:" text with translation key */}
        <div className="font-medium text-blue-800 mb-1">{t('pricing.paypalHowItWorks')}</div>
        <div className="text-blue-700 space-y-1">
          {/* Replace hardcoded step descriptions with translation keys */}
          {(t('pricing.paypalHowItWorksSteps', { returnObjects: true }) as string[]).map((step: string, index: number) => (
            <div key={index}>{index + 1}. {step}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpgradeRequestButton;
