import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MessageSquare, ArrowLeft, MapPin, Calendar, Mail, Phone } from 'lucide-react';

// This would normally fetch user data based on the ID from the URL
// For now, using mock data
const getUserById = (id: string) => {
  return {
    id,
    name: "Sarah Johnson",
    bio: "Experienced web developer and passionate guitar teacher. I love sharing knowledge and helping others grow in their creative and technical journeys.",
    country: "United States",
    age: 28,
    gender: "Female",
    phone: "+1 (555) 123-4567",
    profilePicture: "/placeholder.svg",
    rating: 4.8,
    totalExchanges: 47,
    skillsToTeach: [
      { name: "Guitar", level: "Expert", description: "Acoustic and electric guitar lessons for all levels" },
      { name: "JavaScript", level: "Expert", description: "Frontend development and React" },
      { name: "Photography", level: "Intermediate", description: "Portrait and landscape photography" }
    ],
    reviews: [
      { author: "John Doe", rating: 5, comment: "Amazing guitar teacher! Very patient and knowledgeable." },
      { author: "Jane Smith", rating: 5, comment: "Helped me understand React concepts perfectly." },
      { author: "Mike Wilson", rating: 4, comment: "Great photography tips, improved my skills significantly." }
    ]
  };
};

export default function ProfileView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  if (!id) {
    navigate('/');
    return null;
  }

  const user = getUserById(id);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="w-32 h-32">
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {user.country}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {user.age} years old
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {renderStars(user.rating)}
                    </div>
                    <span className="font-medium">{user.rating}</span>
                    <span className="text-muted-foreground">({user.totalExchanges} exchanges)</span>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed">{user.bio}</p>

                <div className="flex gap-3">
                  <Button className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invitation
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>Available via platform messaging</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{user.phone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills I Can Teach</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {user.skillsToTeach.map((skill, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{skill.name}</h3>
                    <Badge variant={
                      skill.level === 'Expert' ? 'default' : 
                      skill.level === 'Intermediate' ? 'secondary' : 'outline'
                    }>
                      {skill.level}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{skill.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Reviews & Testimonials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.reviews.map((review, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{review.author}</span>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}