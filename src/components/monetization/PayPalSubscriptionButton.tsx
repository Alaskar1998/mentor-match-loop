import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { MessageSquare, Loader2 } from 'lucide-react';
import { upgradeRequestService } from '@/services/upgradeRequestService';

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
      // Create upgrade request using the service
      const upgradeRequest = await upgradeRequestService.createRequest({
        userId: user.id,
        userEmail: user.email,
        userName: user.name || user.email,
        planName,
        billingCycle,
        price,
        notes: `User requested ${billingCycle} ${planName} upgrade`
      });

      console.log('Upgrade request created:', upgradeRequest);
      
      // Show success message
      toast.success('Upgrade request sent! We\'ll contact you soon to arrange payment.');
      
      // Show additional info
      setTimeout(() => {
        toast.info('We\'ll reach out via email to discuss the best payment method for you.', {
          duration: 8000,
        });
      }, 2000);
      
    } catch (error) {
      console.error('Upgrade request error:', error);
      toast.error('Failed to send upgrade request. Please try again.');
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
            Sending Request...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Request Upgrade
          </div>
        )}
      </Button>
      
      <div className="text-xs text-muted-foreground text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="font-medium text-blue-800 mb-1">How it works:</div>
        <div className="text-blue-700 space-y-1">
          <div>1. Click "Request Upgrade"</div>
          <div>2. We'll contact you within 24 hours</div>
          <div>3. Choose your preferred payment method</div>
          <div>4. Get premium features activated</div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeRequestButton;
