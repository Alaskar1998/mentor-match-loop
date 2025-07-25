import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hero-image.jpg";

const popularSkills = [
  { emoji: "🎸", name: "Guitar" },
  { emoji: "🍳", name: "Cooking" },
  { emoji: "💻", name: "Coding" },
  { emoji: "🎨", name: "Design" },
  { emoji: "📷", name: "Photography" },
  { emoji: "🎯", name: "Marketing" },
];

export const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (skill?: string) => {
    const query = skill || searchQuery;
    if (query) {
      console.log(`Searching for: ${query}`);
      // Navigation logic would go here
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-primary/40 to-accent/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Exchange Skills,
            <br />
            <span className="bg-gradient-to-r from-accent to-warm bg-clip-text text-transparent">
              Build Community
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Connect with passionate learners and teachers worldwide. Share knowledge for free and grow together.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-warm rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
              <div className="relative flex items-center bg-white rounded-full p-2 shadow-elegant">
                <Input
                  type="text"
                  placeholder="What do you want to learn?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 focus-visible:ring-0 text-lg px-6 py-4 bg-transparent"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button 
                  variant="hero" 
                  size="lg"
                  onClick={() => handleSearch()}
                  className="rounded-full px-8"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Popular Skills */}
          <div className="mb-12">
            <p className="text-white/80 mb-4 text-lg">Popular skills:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {popularSkills.map((skill) => (
                <button
                  key={skill.name}
                  onClick={() => handleSearch(skill.name)}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 border border-white/20"
                >
                  <span className="mr-2">{skill.emoji}</span>
                  {skill.name}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-white/80">Active Learners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">5K+</div>
              <div className="text-white/80">Expert Teachers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">25K+</div>
              <div className="text-white/80">Skills Exchanged</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute bottom-10 left-10 animate-float">
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 text-white text-2xl">
          🎓
        </div>
      </div>
      <div className="absolute top-20 right-20 animate-float" style={{ animationDelay: '1s' }}>
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 text-white text-2xl">
          🤝
        </div>
      </div>
    </section>
  );
};