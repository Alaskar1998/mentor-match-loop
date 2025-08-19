import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { translateSkill } from "@/utils/translationUtils";

export const TopContributorsSection = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const contributors = [
    {
      id: 1,
      name: language === 'ar' ? "فاطمة أحمد" : "Fatima Ahmed",
      avatar: "👩‍🎨",
      title: t('communityHeroes.cardContent.designMaster'),
      badges: [t('communityHeroes.badges.teacherOfMonth'), t('communityHeroes.badges.mentorBadge'), t('communityHeroes.badges.topContributor')],
      skills: ["UI/UX Design", "Figma", "Illustration"],
      studentsHelped: 127,
      rating: 4.9
    },
    {
      id: 2,
      name: language === 'ar' ? "خالد حسن" : "Khaled Hassan",
      avatar: "👨‍💻",
      title: t('communityHeroes.cardContent.codeWizard'),
      badges: [t('communityHeroes.badges.mostActive'), t('communityHeroes.badges.mentorBadge'), t('communityHeroes.badges.communityHero')],
      skills: ["React", "Node.js", "Python"],
      studentsHelped: 203,
      rating: 5.0
    },
    {
      id: 3,
      name: language === 'ar' ? "عائشة عمر" : "Aisha Omar",
      avatar: "👩‍🍳",
      title: t('communityHeroes.cardContent.culinaryExpert'),
      badges: [t('communityHeroes.badges.mentorBadge'), t('communityHeroes.badges.risingStar'), t('communityHeroes.badges.patiencePro')],
      skills: ["Baking", "Vegan Cooking", "Meal Prep"],
      studentsHelped: 89,
      rating: 4.8
    },
    {
      id: 4,
      name: language === 'ar' ? "محمد يوسف" : "Mohammed Yusuf",
      avatar: "🎸",
      title: t('communityHeroes.cardContent.musicMentor'),
      badges: [t('communityHeroes.badges.mentorBadge'), t('communityHeroes.badges.inspirationAward'), t('communityHeroes.badges.mostLoved')],
      skills: ["Guitar", "Music Theory", "Songwriting"],
      studentsHelped: 156,
      rating: 4.9
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 px-2">
            {t('communityHeroes.title')}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            {t('communityHeroes.subtitle')}
          </p>
        </div>

        {/* Contributors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {contributors.map((contributor, index) => (
            <Card
              key={contributor.id}
              className="group hover:shadow-elegant transition-all duration-300 hover:scale-105 animate-fade-in border-0 bg-gradient-to-br from-card to-muted"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-4 sm:p-6 text-center">
                {/* Avatar */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gradient-primary rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-elegant">
                  {contributor.avatar}
                </div>

                {/* Name & Title */}
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                  {contributor.name}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                  {contributor.title}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-3 sm:mb-4">
                  {contributor.badges.map((badge, badgeIndex) => (
                    <Badge
                      key={badgeIndex}
                      variant="outline"
                      className="text-xs bg-primary/10 border-primary/20 text-primary"
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>

                {/* Skills */}
                <div className="mb-3 sm:mb-4">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">{t('actions.skills')}</p>
                  <div className="flex flex-wrap justify-center gap-1">
                    {contributor.skills.map((skill, skillIndex) => (
                      <Badge
                        key={skillIndex}
                        variant="secondary"
                        className="text-xs"
                      >
                        {translateSkill(skill, language)}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <div>
                    <div className="font-semibold text-foreground">
                      {contributor.studentsHelped}
                    </div>
                    <div className="text-muted-foreground">{t('actions.students')}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {contributor.rating}
                    </div>
                    <div className="text-muted-foreground">{t('actions.rating')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};