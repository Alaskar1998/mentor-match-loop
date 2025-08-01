import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import heroImage from "@/assets/hero-image.jpg";
import { POPULAR_SKILLS, getSkillTranslation } from "@/data/skills";
import { isSearchDisabled } from "@/utils/userValidation";
import { getPopularSkillsFromDatabase, getCategoryEmoji, DatabaseSkill } from "@/services/skillService";
import { useLanguage } from "@/hooks/useLanguage";

export const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [popularSkills, setPopularSkills] = useState<DatabaseSkill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { language } = useLanguage();

  // Use centralized validation
  const searchDisabled = isSearchDisabled(user?.name);

  // Fetch popular skills from database
  useEffect(() => {
    const fetchPopularSkills = async () => {
      try {
        setIsLoadingSkills(true);
        const skills = await getPopularSkillsFromDatabase(20);
        setPopularSkills(skills);
      } catch (error) {
        console.error('Error fetching popular skills:', error);
        // Fallback to static skills if database fetch fails
        setPopularSkills(POPULAR_SKILLS.map(skill => ({
          name: skill.name,
          count: 1,
          category: skill.category
        })));
      } finally {
        setIsLoadingSkills(false);
      }
    };

    fetchPopularSkills();
  }, []);

  const handleSearch = (skill?: string) => {
    // Prevent search if user is disabled
    if (searchDisabled) {
      toast.error("Search is disabled for your account type");
      return;
    }
    
    const query = skill || searchQuery;
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
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
            {t('hero.title').split(',')[0]},
            <br />
            <span className="bg-gradient-to-r from-accent to-warm bg-clip-text text-transparent">
              {t('hero.title').split(',')[1]}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className={`relative group ${searchDisabled ? 'opacity-50' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-warm rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
              <div className="relative flex items-center bg-white rounded-full p-2 shadow-elegant">
                <Input
                  type="text"
                  placeholder={searchDisabled ? "Search disabled for your account" : t('hero.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => !searchDisabled && setSearchQuery(e.target.value)}
                  className="flex-1 border-0 focus-visible:ring-0 text-lg px-6 py-4 bg-transparent"
                  onKeyDown={(e) => !searchDisabled && e.key === "Enter" && handleSearch()}
                  disabled={searchDisabled}
                />
                <Button 
                  variant="hero" 
                  size="lg"
                  onClick={() => handleSearch()}
                  className="rounded-full px-8"
                  disabled={searchDisabled}
                >
                  <Search className="w-5 h-5 mr-2" />
                  {searchDisabled ? 'Disabled' : 'Search'}
                </Button>
              </div>
            </div>
          </div>

          {/* Popular Skills */}
          <div className="mb-12">
            <p className="text-white/80 mb-4 text-lg">
              {isLoadingSkills ? t('actions.loading') : t('actions.popularSkills')}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {isLoadingSkills ? (
                // Loading skeleton
                Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full animate-pulse"
                  >
                    <span className="mr-2">📝</span>
                    Loading...
                  </div>
                ))
              ) : (
                popularSkills.map((skill) => (
                  <button
                    key={skill.name}
                    onClick={() => !searchDisabled && handleSearch(skill.name)}
                    disabled={searchDisabled}
                    className={`bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full transition-all duration-300 border border-white/20 ${
                      searchDisabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-white/30 hover:scale-105'
                    }`}
                    title={`${skill.count} people teach this skill`}
                  >
                    <span className="mr-2">{getCategoryEmoji(skill.category || 'Other')}</span>
                    {language === 'ar' ? getSkillTranslation(skill.name) : skill.name}
                    <span className="ml-2 text-xs opacity-75">({skill.count})</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-white/80">{t('hero.stats.learners')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">5K+</div>
              <div className="text-white/80">{t('hero.stats.teachers')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">25K+</div>
              <div className="text-white/80">{t('hero.stats.exchanges')}</div>
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