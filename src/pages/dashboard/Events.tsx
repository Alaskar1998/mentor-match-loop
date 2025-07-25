import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Crown, Clock } from 'lucide-react';

const mockEvents = [
  {
    id: 'event-1',
    title: 'React Workshop: Advanced Hooks',
    date: 'Jan 25, 2024',
    time: '2:00 PM - 4:00 PM',
    location: 'Tech Hub Downtown',
    attendees: 12,
    maxAttendees: 20,
    skills: ['React', 'JavaScript'],
    level: 'Intermediate',
    type: 'Workshop',
    price: 'Free'
  },
  {
    id: 'event-2',
    title: 'Python for Beginners Bootcamp',
    date: 'Jan 28, 2024',
    time: '10:00 AM - 6:00 PM',
    location: 'Learning Center',
    attendees: 8,
    maxAttendees: 15,
    skills: ['Python', 'Programming'],
    level: 'Beginner',
    type: 'Bootcamp',
    price: '$50'
  },
  {
    id: 'event-3',
    title: 'UI/UX Design Meetup',
    date: 'Feb 1, 2024',
    time: '6:00 PM - 8:00 PM',
    location: 'Creative Space',
    attendees: 25,
    maxAttendees: 30,
    skills: ['UI/UX', 'Design'],
    level: 'All Levels',
    type: 'Meetup',
    price: 'Free'
  }
];

export default function Events() {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-500/10 text-green-500';
      case 'Intermediate':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'Advanced':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-blue-500/10 text-blue-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Workshop':
        return 'bg-purple-500/10 text-purple-500';
      case 'Bootcamp':
        return 'bg-orange-500/10 text-orange-500';
      case 'Meetup':
        return 'bg-blue-500/10 text-blue-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">Events</h1>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>
          <p className="text-muted-foreground">Join skill-building workshops and community events</p>
        </div>
        <Button>
          <Calendar className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Upcoming Events */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Upcoming Events</h2>
        {mockEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <Badge className={getTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                    <Badge className={getLevelColor(event.level)}>
                      {event.level}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.time}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.attendees}/{event.maxAttendees} attendees
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {event.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">
                      {event.price}
                    </span>
                    <Button size="sm">
                      Join Event
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Premium Features */}
      <Card>
        <CardHeader>
          <CardTitle>Premium Event Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium mb-1">Early Access</h3>
              <p className="text-sm text-muted-foreground">
                Get early access to event registration and premium workshops
              </p>
            </div>
            <div className="text-center p-4">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium mb-1">Exclusive Events</h3>
              <p className="text-sm text-muted-foreground">
                Access to premium-only workshops and networking events
              </p>
            </div>
            <div className="text-center p-4">
              <Crown className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium mb-1">Host Events</h3>
              <p className="text-sm text-muted-foreground">
                Create and host your own workshops and learning sessions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}