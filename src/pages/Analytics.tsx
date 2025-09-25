import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Target, Calendar, Award, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalWorkouts: number;
  totalExercises: number;
  averageWorkoutTime: number;
  personalBests: number;
  currentStreak: number;
  longestStreak: number;
}

const Analytics = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalWorkouts: 0,
    totalExercises: 0,
    averageWorkoutTime: 0,
    personalBests: 0,
    currentStreak: 7,
    longestStreak: 12,
  });
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user, timeRange]);

  const fetchAnalyticsData = async () => {
    if (!user) return;

    try {
      // Get total workouts
      const { count: totalWorkouts } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get total exercises done
      const { data: workoutExercises } = await supabase
        .from('workout_exercises')
        .select('workout_id')
        .in('workout_id', 
          (await supabase
            .from('workouts')
            .select('id')
            .eq('user_id', user.id)
          ).data?.map(w => w.id) || []
        );

      // Get personal bests count
      const { count: personalBests } = await supabase
        .from('personal_bests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get average workout time
      const { data: workouts } = await supabase
        .from('workouts')
        .select('duration_minutes')
        .eq('user_id', user.id)
        .not('duration_minutes', 'is', null);

      const avgTime = workouts && workouts.length > 0 
        ? workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / workouts.length
        : 0;

      setAnalyticsData({
        totalWorkouts: totalWorkouts || 0,
        totalExercises: workoutExercises?.length || 0,
        averageWorkoutTime: Math.round(avgTime),
        personalBests: personalBests || 0,
        currentStreak: 7, // TODO: Calculate actual streak
        longestStreak: 12, // TODO: Calculate actual longest streak
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Workouts',
      value: analyticsData.totalWorkouts,
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Exercises Completed',
      value: analyticsData.totalExercises,
      icon: Target,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Avg. Workout Time',
      value: `${analyticsData.averageWorkoutTime}m`,
      icon: Zap,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Personal Bests',
      value: analyticsData.personalBests,
      icon: Award,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Current Streak',
      value: `${analyticsData.currentStreak}d`,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Longest Streak',
      value: `${analyticsData.longestStreak}d`,
      icon: BarChart3,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold glow-text">Analytics</h1>
          <p className="text-muted-foreground">Track your fitness progress</p>
        </div>

        {/* Time Range Filter */}
        <Card className="gym-card">
          <CardContent className="p-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="gym-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {stat.title}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Progress Chart Placeholder */}
        <Card className="gym-card">
          <CardHeader>
            <CardTitle className="text-lg">Progress Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-center text-muted-foreground">
              <div>
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Progress charts coming soon!</p>
                <p className="text-sm">Track your improvements over time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Bests Section */}
        <Card className="gym-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Personal Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.personalBests === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No personal records yet!</p>
                <p className="text-sm">Complete workouts to set your first PR</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                  <div>
                    <div className="font-medium">Bench Press</div>
                    <div className="text-sm text-muted-foreground">Strength</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">80kg</div>
                    <div className="text-xs text-muted-foreground">+5kg from last</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-accent/5 rounded-lg">
                  <div>
                    <div className="font-medium">Running</div>
                    <div className="text-sm text-muted-foreground">Cardio</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-accent">5.2km</div>
                    <div className="text-xs text-muted-foreground">Best distance</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;