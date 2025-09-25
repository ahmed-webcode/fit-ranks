import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Zap, Target, Calendar, Trophy, Dumbbell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Profile {
  username: string;
  fitness_level: number;
  total_points: number;
  rank_title: string;
}

interface WorkoutStats {
  totalWorkouts: number;
  thisWeekWorkouts: number;
  streak: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats>({
    totalWorkouts: 0,
    thisWeekWorkouts: 0,
    streak: 0
  });
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchWorkoutStats();
      fetchRecentWorkouts();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('username, fitness_level, total_points, rank_title')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  const fetchWorkoutStats = async () => {
    if (!user) return;

    // Get total workouts count
    const { count: totalWorkouts } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get this week's workouts
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const { count: thisWeekWorkouts } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfWeek.toISOString());

    setWorkoutStats({
      totalWorkouts: totalWorkouts || 0,
      thisWeekWorkouts: thisWeekWorkouts || 0,
      streak: Math.floor(Math.random() * 10) + 1, // TODO: Calculate actual streak
    });
  };

  const fetchRecentWorkouts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('workouts')
      .select('id, name, created_at, duration_minutes')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);

    if (!error && data) {
      setRecentWorkouts(data);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold glow-text">
                Welcome back, {profile?.username || 'Athlete'}!
              </h1>
              <p className="text-muted-foreground">Ready to crush your goals?</p>
            </div>
            <Badge className="rank-badge">
              {profile?.rank_title || 'Beginner'}
            </Badge>
          </div>

          {/* Level Progress */}
          <Card className="gym-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Level {profile?.fitness_level || 1}</span>
                <span className="text-sm text-muted-foreground">
                  {profile?.total_points || 0} XP
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="h-2 rounded-full gym-gradient transition-all duration-500"
                  style={{ 
                    width: `${Math.min(((profile?.total_points || 0) % 1000) / 10, 100)}%` 
                  }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {1000 - ((profile?.total_points || 0) % 1000)} XP to next level
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="gym-card">
            <CardContent className="p-3 text-center">
              <Dumbbell className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-lg font-bold">{workoutStats.totalWorkouts}</div>
              <div className="text-xs text-muted-foreground">Total Workouts</div>
            </CardContent>
          </Card>
          
          <Card className="gym-card">
            <CardContent className="p-3 text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-accent" />
              <div className="text-lg font-bold">{workoutStats.thisWeekWorkouts}</div>
              <div className="text-xs text-muted-foreground">This Week</div>
            </CardContent>
          </Card>
          
          <Card className="gym-card">
            <CardContent className="p-3 text-center">
              <Zap className="h-6 w-6 mx-auto mb-2 text-warning" />
              <div className="text-lg font-bold">{workoutStats.streak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button asChild className="gym-button-primary h-16 flex flex-col gap-1">
              <Link to="/workout/new">
                <Plus className="h-5 w-5" />
                <span className="text-sm">Start Workout</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-16 flex flex-col gap-1">
              <Link to="/analytics">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm">View Progress</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Recent Workouts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Workouts</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/workout/history">View All</Link>
            </Button>
          </div>
          
          <div className="space-y-2">
            {recentWorkouts.length === 0 ? (
              <Card className="gym-card">
                <CardContent className="p-4 text-center text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No workouts yet.</p>
                  <p className="text-sm">Start your fitness journey today!</p>
                </CardContent>
              </Card>
            ) : (
              recentWorkouts.map((workout) => (
                <Card key={workout.id} className="gym-card">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{workout.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(workout.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {workout.duration_minutes || 0} min
                        </div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Motivational Quote */}
        <Card className="gym-card border-primary/20">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
            <blockquote className="text-sm italic text-muted-foreground">
              "The only impossible journey is the one you never begin."
            </blockquote>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;