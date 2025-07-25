import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Crown, Search } from 'lucide-react';

const mockNearbyUsers = [
  {
    id: 'user-1',
    name: 'Sarah Chen',
    distance: '2.3 km',
    skills: ['React', 'TypeScript'],
    rating: 4.8,
    location: 'Downtown'
  },
  {
    id: 'user-2',
    name: 'Mike Johnson',
    distance: '3.7 km',
    skills: ['Python', 'Machine Learning'],
    rating: 4.9,
    location: 'Tech District'
  },
  {
    id: 'user-3',
    name: 'Emma Davis',
    distance: '5.1 km',
    skills: ['UI/UX Design', 'Figma'],
    rating: 4.7,
    location: 'Creative Quarter'
  }
];

export default function Map() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">Map Search</h1>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>
          <p className="text-muted-foreground">Find learning partners near your location</p>
        </div>
        <Button>
          <Search className="w-4 h-4 mr-2" />
          Search Area
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Placeholder */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Interactive Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Interactive Map Coming Soon</h3>
                <p className="text-muted-foreground">
                  Premium users will be able to see nearby learners and teachers on an interactive map
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nearby Users */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Nearby Learning Partners</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockNearbyUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium">{user.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {user.distance} • {user.location}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {user.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{user.rating}⭐</div>
                  <Button variant="outline" size="sm" className="mt-2">
                    Connect
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Premium Features */}
      <Card>
        <CardHeader>
          <CardTitle>Premium Map Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium mb-1">Location-Based Search</h3>
              <p className="text-sm text-muted-foreground">
                Find learners and teachers within your preferred distance
              </p>
            </div>
            <div className="text-center p-4">
              <Search className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium mb-1">Advanced Filters</h3>
              <p className="text-sm text-muted-foreground">
                Filter by skills, rating, availability, and more
              </p>
            </div>
            <div className="text-center p-4">
              <Crown className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium mb-1">Priority Matching</h3>
              <p className="text-sm text-muted-foreground">
                Get priority in search results and recommendations
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}