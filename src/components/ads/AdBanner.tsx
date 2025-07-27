import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, X } from 'lucide-react';

interface AdBannerProps {
  onClose?: () => void;
  onUpgrade?: () => void;
}

export const AdBanner = ({ onClose, onUpgrade }: AdBannerProps) => {
  return (
    <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                Ad
              </Badge>
              <span className="text-sm font-medium">Upgrade to Premium</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Remove ads and unlock unlimited invites, worldwide search, and all filters!
            </p>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                onClick={onUpgrade}
                className="gap-2"
              >
                <Crown className="w-4 h-4" />
                Upgrade Now - $4.99/mo
              </Button>
            </div>
          </div>
          {onClose && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 