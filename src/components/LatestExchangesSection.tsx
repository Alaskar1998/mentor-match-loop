import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOptimizedPolling } from "@/hooks/useOptimizedPolling";
import { getLatestExchanges, getExchangeCount, LatestExchange } from "@/services/exchangeService";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";

export const LatestExchangesSection = React.memo(() => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [counter, setCounter] = useState(3248);
  const [isVisible, setIsVisible] = useState(true);
  const [exchanges, setExchanges] = useState<LatestExchange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();
  const { language } = useLanguage();

  // Fetch real exchange data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [exchangeData, countData] = await Promise.all([
          getLatestExchanges(10, language === 'ar'),
          getExchangeCount()
        ]);
        
        setExchanges(exchangeData);
        setCounter(countData);
      } catch (error) {
        console.error('Error fetching exchange data:', error);
        // Fallback to default data is handled in the service
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [language]);

  // Visibility detection to pause animations when not visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Consolidated optimized polling for carousel and counter updates
  const { isActive: isAnimating } = useOptimizedPolling(
    async () => {
      if (!isVisible) return; // Pause animations when not visible
      
      // Update carousel if we have exchanges
      if (exchanges.length > 0) {
        setCurrentIndex((prev) => (prev + 1) % exchanges.length);
      }
      
      // Update counter with random increment
      setCounter((prev) => prev + Math.floor(Math.random() * 3) + 1);
    },
    { 
      interval: 4000, // Use the faster interval for better UX
      enabled: isVisible && exchanges.length > 0, // Only animate when visible and have data
      maxRetries: 3
    }
  );

  const nextSlide = () => {
    if (exchanges.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % exchanges.length);
    }
  };

  const prevSlide = () => {
    if (exchanges.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + exchanges.length) % exchanges.length);
    }
  };

  const visibleExchanges = exchanges.length > 0 ? [
    exchanges[currentIndex],
    exchanges[(currentIndex + 1) % exchanges.length],
    exchanges[(currentIndex + 2) % exchanges.length]
  ] : [];

  // Loading skeleton
  if (isLoading) {
    return (
      <section ref={sectionRef} className="py-20 bg-background">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              🔥 {t('latestExchanges.title')}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {t('latestExchanges.subtitle')}
            </p>
            
            {/* Loading Counter */}
            <div className="inline-flex items-center gap-2 bg-gradient-warm text-warm-foreground px-6 py-3 rounded-full shadow-elegant animate-pulse">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                          <span className="font-semibold text-lg">
              {t('actions.loadingExchanges')}
            </span>
            </div>
          </div>

          {/* Loading Carousel */}
          <div className="relative max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card 
                  key={index}
                  className="shadow-card animate-pulse border-0 bg-gradient-to-br from-card to-muted"
                >
                  <CardContent className="p-6 text-center">
                    {/* Loading Avatar */}
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center text-2xl">
                      📝
                    </div>

                    {/* Loading Content */}
                    <div className="mb-4">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded"></div>
                    </div>

                    {/* Loading Rating */}
                    <div className="flex items-center justify-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="w-4 h-4 bg-muted rounded"></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            🔥 {t('latestExchanges.title')}
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t('latestExchanges.subtitle')}
          </p>
          
          {/* Live Counter */}
          <div className="inline-flex items-center gap-2 bg-gradient-warm text-warm-foreground px-6 py-3 rounded-full shadow-elegant animate-scale-in">
            <div className={`w-3 h-3 bg-success rounded-full ${isVisible ? 'animate-pulse' : ''}`} />
            <span className="font-semibold text-lg">
              {counter.toLocaleString()} {t('actions.skillExchanges')}
            </span>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative max-w-6xl mx-auto">
          {exchanges.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {visibleExchanges.map((exchange, index) => (
                  <Card 
                    key={`${exchange.id}-${currentIndex}-${index}`}
                    className="shadow-card hover:shadow-elegant transition-all duration-300 hover:scale-105 animate-scale-in border-0 bg-gradient-to-br from-card to-muted"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-6 text-center">
                      {/* Avatar */}
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center text-2xl shadow-elegant">
                        {exchange.avatar}
                      </div>

                      {/* Content */}
                      <div className="mb-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="font-semibold text-foreground">{exchange.student}</span>
                          <span className="text-muted-foreground">{t(`latestExchanges.cardContent.${exchange.action}`)}</span>
                          <span className="font-semibold text-primary">{exchange.skill}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                          <span>{t('latestExchanges.with')}</span>
                          <span className="font-medium">{exchange.mentor}</span>
                          <span className="text-accent">{exchange.mentorBadge}</span>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center justify-center gap-1">
                        {Array.from({ length: exchange.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevSlide}
                  className="rounded-full hover:bg-primary hover:text-primary-foreground"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex gap-2">
                  {exchanges.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex ? "bg-primary w-6" : "bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextSlide}
                  className="rounded-full hover:bg-primary hover:text-primary-foreground"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            // No exchanges found
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤝</div>
              <h3 className="text-2xl font-semibold text-foreground mb-2">
                {t('actions.noExchangesYet')}
              </h3>
              <p className="text-muted-foreground">
                {t('actions.beFirstToExchange')}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});