import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Heart, Share2, Users, Search } from 'lucide-react';
import { workoutShareSchema } from '@/lib/validations';

interface SharedWorkout {
  id: string;
  workout_id: string;
  user_id: string;
  caption: string;
  likes_count: number;
  created_at: string;
  profiles: {
    username: string;
    profile_picture_url: string | null;
  };
  workouts: {
    name: string;
    duration_minutes: number | null;
  };
}

export default function Social() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sharedWorkouts, setSharedWorkouts] = useState<SharedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [likedWorkouts, setLikedWorkouts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSharedWorkouts();
    fetchUserLikes();
  }, []);

  const fetchSharedWorkouts = async () => {
    try {
      // First get workout shares
      const { data: shares, error: sharesError } = await supabase
        .from('workout_shares')
        .select('*, workouts(name, duration_minutes)')
        .order('created_at', { ascending: false });

      if (sharesError) throw sharesError;

      // Then get profiles for each share
      const userIds = shares?.map(share => share.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, profile_picture_url')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const enrichedShares = shares?.map(share => {
        const profile = profiles?.find(p => p.user_id === share.user_id);
        return {
          ...share,
          profiles: profile || { username: 'Unknown', profile_picture_url: null }
        };
      }) || [];

      setSharedWorkouts(enrichedShares);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('workout_likes')
        .select('share_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setLikedWorkouts(new Set(data?.map(like => like.share_id) || []));
    } catch (error: any) {
      console.error('Error fetching likes:', error);
    }
  };

  const handleLike = async (shareId: string) => {
    if (!user) return;

    try {
      const isLiked = likedWorkouts.has(shareId);

      if (isLiked) {
        const { error } = await supabase
          .from('workout_likes')
          .delete()
          .eq('share_id', shareId)
          .eq('user_id', user.id);

        if (error) throw error;

        setLikedWorkouts(prev => {
          const newSet = new Set(prev);
          newSet.delete(shareId);
          return newSet;
        });

        setSharedWorkouts(prev =>
          prev.map(workout =>
            workout.id === shareId
              ? { ...workout, likes_count: workout.likes_count - 1 }
              : workout
          )
        );
      } else {
        const { error } = await supabase
          .from('workout_likes')
          .insert({ share_id: shareId, user_id: user.id });

        if (error) throw error;

        setLikedWorkouts(prev => new Set(prev).add(shareId));

        setSharedWorkouts(prev =>
          prev.map(workout =>
            workout.id === shareId
              ? { ...workout, likes_count: workout.likes_count + 1 }
              : workout
          )
        );
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredWorkouts = sharedWorkouts.filter(workout =>
    workout.profiles.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workout.workouts.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-24 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold glow-text">Social Feed</h1>
        <Users className="h-8 w-8 text-primary" />
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workouts or users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredWorkouts.length === 0 ? (
          <Card className="p-8 text-center glass-card">
            <p className="text-muted-foreground">No shared workouts yet</p>
          </Card>
        ) : (
          filteredWorkouts.map((workout) => (
            <Card key={workout.id} className="p-6 gym-card hover-lift animate-scale-in">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {workout.profiles.username[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{workout.profiles.username}</h3>
                    <span className="text-sm text-muted-foreground">
                      {new Date(workout.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-medium text-primary mb-2">{workout.workouts.name}</h4>
                  {workout.caption && (
                    <p className="text-muted-foreground mb-3">{workout.caption}</p>
                  )}
                  {workout.workouts.duration_minutes && (
                    <p className="text-sm text-muted-foreground mb-3">
                      Duration: {workout.workouts.duration_minutes} minutes
                    </p>
                  )}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(workout.id)}
                      className={likedWorkouts.has(workout.id) ? 'text-primary' : ''}
                    >
                      <Heart
                        className={`h-4 w-4 mr-1 ${
                          likedWorkouts.has(workout.id) ? 'fill-primary' : ''
                        }`}
                      />
                      {workout.likes_count}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
