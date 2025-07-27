import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DummyAd } from '@/data/dummyData';

interface DummyAdCardProps {
  ad: DummyAd;
  className?: string;
}

export const DummyAdCard = ({ ad, className = "" }: DummyAdCardProps) => {
  return (
    <Card className={`relative border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50 ${className}`}>
      {/* Ad Label */}
      <div className="absolute top-2 left-2 z-10">
        <Badge variant="secondary" className="bg-orange-500 text-white text-xs font-medium">
          AD
        </Badge>
      </div>
      
      {/* Sponsored By Label */}
      <div className="absolute top-2 right-2 z-10">
        <Badge variant="outline" className="bg-white/80 text-xs text-muted-foreground">
          Sponsored by {ad.sponsoredBy}
        </Badge>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {/* Placeholder Image */}
          <div className="w-16 h-16 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-lg flex items-center justify-center text-2xl border-2 border-dashed border-orange-300">
            {ad.imageUrl}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-800">{ad.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{ad.description}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Button 
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium"
          size="sm"
        >
          {ad.ctaText}
        </Button>
        
        {/* Dummy Data Notice */}
        <p className="text-xs text-gray-500 text-center mt-2 italic">
          This is dummy ad content for testing layout
        </p>
      </CardContent>
    </Card>
  );
}; 