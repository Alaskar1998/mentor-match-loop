import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchResults } from "@/components/search/SearchResults";
import { FilterBar } from "@/components/search/FilterBar";
import { SearchHeader } from "@/components/search/SearchHeader";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  name: string;
  profilePicture: string;
  isMentor: boolean;
  rating: number;
  successfulExchanges: number;
  skillLevel: "Beginner" | "Intermediate" | "Expert";
  bio: string;
  skills: string[];
  country: string;
  gender: "Male" | "Female" | "Other";
  willingToTeachWithoutReturn: boolean;
}

export interface SearchFilters {
  country: string;
  skillLevel: string;
  rating: string;
  gender: string[];
  mentorOnly: boolean;
}

// Mock data for demonstration
const mockUsers: UserProfile[] = [
  {
    id: "1",
    name: "Sarah Chen",
    profilePicture: "👩‍🎨",
    isMentor: true,
    rating: 4.9,
    successfulExchanges: 127,
    skillLevel: "Expert",
    bio: "UI/UX Designer with 8 years of experience. Love teaching design principles and Figma workflows.",
    skills: ["UI/UX Design", "Figma", "Illustration", "Prototyping"],
    country: "Singapore",
    gender: "Female",
    willingToTeachWithoutReturn: true
  },
  {
    id: "2",
    name: "Marcus Johnson",
    profilePicture: "👨‍💻",
    isMentor: true,
    rating: 5.0,
    successfulExchanges: 203,
    skillLevel: "Expert",
    bio: "Full-stack developer passionate about React and Node.js. Teaching coding since 2019.",
    skills: ["React", "Node.js", "Python", "TypeScript"],
    country: "United States",
    gender: "Male",
    willingToTeachWithoutReturn: true
  },
  {
    id: "3",
    name: "Elena Rodriguez",
    profilePicture: "👩‍🍳",
    isMentor: true,
    rating: 4.8,
    successfulExchanges: 89,
    skillLevel: "Intermediate",
    bio: "Professional chef specializing in plant-based cuisine. Love sharing healthy cooking techniques!",
    skills: ["Vegan Cooking", "Baking", "Meal Prep", "Nutrition"],
    country: "Spain",
    gender: "Female",
    willingToTeachWithoutReturn: true
  },
  {
    id: "4",
    name: "David Kim",
    profilePicture: "🎸",
    isMentor: false,
    rating: 4.6,
    successfulExchanges: 45,
    skillLevel: "Intermediate",
    bio: "Guitar enthusiast and music teacher. Also learning piano and would love to exchange knowledge!",
    skills: ["Guitar", "Music Theory", "Songwriting"],
    country: "South Korea",
    gender: "Male",
    willingToTeachWithoutReturn: false
  },
  {
    id: "5",
    name: "Amanda Silva",
    profilePicture: "📷",
    isMentor: true,
    rating: 4.7,
    successfulExchanges: 112,
    skillLevel: "Expert",
    bio: "Professional photographer and Adobe expert. Teaching photo editing and camera techniques.",
    skills: ["Photography", "Lightroom", "Photoshop", "Portrait Photography"],
    country: "Brazil",
    gender: "Female",
    willingToTeachWithoutReturn: true
  },
  {
    id: "6",
    name: "Alex Thompson",
    profilePicture: "🏃‍♂️",
    isMentor: false,
    rating: 4.3,
    successfulExchanges: 28,
    skillLevel: "Beginner",
    bio: "Fitness enthusiast learning about nutrition and workout planning. Happy to teach basic running techniques!",
    skills: ["Running", "Basic Fitness", "Motivation"],
    country: "Canada",
    gender: "Other",
    willingToTeachWithoutReturn: false
  }
];

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    country: "",
    skillLevel: "",
    rating: "",
    gender: [],
    mentorOnly: false
  });
  const [isPremium] = useState(false); // Mock user subscription status

  const searchQuery = searchParams.get("q") || "";

  // Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*');

        if (error) {
          console.error('Error fetching profiles:', error);
          return;
        }

        // Transform Supabase data to UserProfile format
        const transformedUsers: UserProfile[] = (profiles || []).map(profile => {
          // Extract skills from skills_to_teach array
          const skills = Array.isArray(profile.skills_to_teach) 
            ? profile.skills_to_teach.map((skill: any) => 
                typeof skill === 'object' ? skill.name : skill
              ).filter(Boolean)
            : [];

          return {
            id: profile.id,
            name: profile.display_name || 'Anonymous User',
            profilePicture: profile.avatar_url || '👤',
            isMentor: profile.willing_to_teach_without_return || false,
            rating: 4.5, // Default rating - you could calculate this from reviews
            successfulExchanges: 0, // Default - you could track this
            skillLevel: "Intermediate" as const, // Default - you could derive this from experience
            bio: profile.bio || '',
            skills: skills,
            country: profile.country || '',
            gender: (profile.gender || 'Other') as "Male" | "Female" | "Other",
            willingToTeachWithoutReturn: profile.willing_to_teach_without_return || false
          };
        });

        setUsers(transformedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search query and filters
    let filtered = users;

    // Text search
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.skills.some(skill => 
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.bio.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.country) {
      filtered = filtered.filter(user => user.country === filters.country);
    }

    if (filters.skillLevel) {
      filtered = filtered.filter(user => user.skillLevel === filters.skillLevel);
    }

    if (filters.rating) {
      const ratingThreshold = parseFloat(filters.rating);
      filtered = filtered.filter(user => user.rating >= ratingThreshold);
    }

    if (filters.gender.length > 0) {
      filtered = filtered.filter(user => filters.gender.includes(user.gender));
    }

    if (filters.mentorOnly) {
      filtered = filtered.filter(user => user.willingToTeachWithoutReturn);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, filters, users]);

  return (
    <div className="min-h-screen bg-background">
      <SearchHeader searchQuery={searchQuery} resultCount={filteredUsers.length} />
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <FilterBar 
              filters={filters}
              onFiltersChange={setFilters}
              isPremium={isPremium}
            />
          </div>

          {/* Search Results */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <SearchResults users={filteredUsers} searchQuery={searchQuery} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;