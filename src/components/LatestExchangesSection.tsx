import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const exchanges = [
  {
    id: 1,
    student: "Anna",
    mentor: "Carlos",
    skill: "Guitar",
    action: "learned",
    rating: 5,
    avatar: "🎸",
    mentorBadge: "🌟"
  },
  {
    id: 2,
    student: "Ali",
    mentor: "Sarah",
    skill: "Photoshop",
    action: "mastered",
    rating: 5,
    avatar: "🎨",
    mentorBadge: "🌟"
  },
  {
    id: 3,
    student: "Lucas",
    mentor: "Maria",
    skill: "Cooking",
    action: "learned",
    rating: 5,
    avatar: "🍳",
    mentorBadge: "🌟"
  },
  {
    id: 4,
    student: "Mei",
    mentor: "David",
    skill: "JavaScript",
    action: "mastered",
    rating: 5,
    avatar: "💻",
    mentorBadge: "🌟"
  },
  {
    id: 5,
    student: "Alex",
    mentor: "Luna",
    skill: "Photography",
    action: "learned",
    rating: 5,
    avatar: "📷",
    mentorBadge: "🌟"
  }
];

export const LatestExchangesSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [counter, setCounter] = useState(3248);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % exchanges.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const counterInterval = setInterval(() => {
      setCounter((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 5000);

    return () => clearInterval(counterInterval);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % exchanges.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + exchanges.length) % exchanges.length);
  };

  const visibleExchanges = [
    exchanges[currentIndex],
    exchanges[(currentIndex + 1) % exchanges.length],
    exchanges[(currentIndex + 2) % exchanges.length]
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            🔥 Latest Exchanges
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            See what our community has been learning and teaching
          </p>
          
          {/* Live Counter */}
          <div className="inline-flex items-center gap-2 bg-gradient-warm text-warm-foreground px-6 py-3 rounded-full shadow-elegant animate-scale-in">
            <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
            <span className="font-semibold text-lg">
              {counter.toLocaleString()} skill exchanges this month!
            </span>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative max-w-6xl mx-auto">
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
                      <span className="text-muted-foreground">{exchange.action}</span>
                      <span className="font-semibold text-primary">{exchange.skill}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <span>with</span>
                      <span className="font-medium">{exchange.mentor}</span>
                      <span className="text-accent">{exchange.mentorBadge} Mentor</span>
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
        </div>
      </div>
    </section>
  );
};