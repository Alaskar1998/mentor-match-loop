import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const contributors = [
  {
    id: 1,
    name: "Sarah Chen",
    avatar: "👩‍🎨",
    title: "Design Master",
    badges: ["Teacher of the Month", "🌟 Mentor Badge", "Top Contributor"],
    skills: ["UI/UX Design", "Figma", "Illustration"],
    studentsHelped: 127,
    rating: 4.9
  },
  {
    id: 2,
    name: "Marcus Johnson",
    avatar: "👨‍💻",
    title: "Code Wizard",
    badges: ["Most Active", "🌟 Mentor Badge", "Community Hero"],
    skills: ["React", "Node.js", "Python"],
    studentsHelped: 203,
    rating: 5.0
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    avatar: "👩‍🍳",
    title: "Culinary Expert",
    badges: ["🌟 Mentor Badge", "Rising Star", "Patience Pro"],
    skills: ["Baking", "Vegan Cooking", "Meal Prep"],
    studentsHelped: 89,
    rating: 4.8
  },
  {
    id: 4,
    name: "David Kim",
    avatar: "🎸",
    title: "Music Mentor",
    badges: ["🌟 Mentor Badge", "Inspiration Award", "Most Loved"],
    skills: ["Guitar", "Music Theory", "Songwriting"],
    studentsHelped: 156,
    rating: 4.9
  }
];

export const TopContributorsSection = () => {
  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            🎖 Community Heroes
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Meet our amazing contributors who make learning possible for everyone. 
            These passionate teachers have helped thousands of students achieve their goals.
          </p>
        </div>

        {/* Contributors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {contributors.map((contributor, index) => (
            <Card 
              key={contributor.id}
              className="group shadow-card hover:shadow-elegant transition-all duration-500 hover:scale-105 border-0 bg-gradient-to-br from-card via-card to-muted overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardContent className="p-6 text-center relative z-10">
                {/* Avatar & Name */}
                <div className="mb-4">
                  <div className="w-20 h-20 mx-auto mb-3 bg-gradient-primary rounded-full flex items-center justify-center text-3xl shadow-elegant group-hover:shadow-glow transition-all duration-300">
                    {contributor.avatar}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {contributor.name}
                  </h3>
                  <p className="text-sm text-accent font-medium">
                    {contributor.title}
                  </p>
                </div>

                {/* Badges */}
                <div className="mb-4 space-y-2">
                  {contributor.badges.map((badge) => (
                    <Badge 
                      key={badge} 
                      variant="secondary" 
                      className="text-xs mx-1 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 transition-all duration-300"
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                    Expertise
                  </p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {contributor.skills.map((skill) => (
                      <span 
                        key={skill}
                        className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">
                      {contributor.studentsHelped}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Students Helped
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-accent flex items-center justify-center gap-1">
                      {contributor.rating}
                      <span className="text-xs">⭐</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Rating
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground mb-4">
            Want to become a community hero?
          </p>
          <Badge 
            variant="outline" 
            className="text-sm px-4 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 cursor-pointer"
          >
            Start Teaching Today
          </Badge>
        </div>
      </div>
    </section>
  );
};