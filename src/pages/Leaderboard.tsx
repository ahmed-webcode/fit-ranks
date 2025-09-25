import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Crown, TrendingUp, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardUser {
  id: string;
  user_id: string;
  username: string;
  rank_title: string;
  total_points: number;
  fitness_level: number;
  totalWorkouts?: number;
}

const Leaderboard = () => {
  const { user } = useAuth();
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      // Get top users by total points
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, username, rank_title, total_points, fitness_level, user_id')
        .order('total_points', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get workout counts for each user
      const usersWithWorkouts = await Promise.all(
        (users || []).map(async (profile) => {
          const { count } = await supabase
            .from('workouts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.user_id);

          return {
            ...profile,
            totalWorkouts: count || 0,
          };
        })
      );

      setTopUsers(usersWithWorkouts);

      // Find current user's rank
      if (user) {
        const userIndex = usersWithWorkouts.findIndex(u => u.user_id === user.id);
        setUserRank(userIndex >= 0 ? userIndex + 1 : null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-400" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return 'rank-badge';
    if (rank <= 10) return 'bg-primary/20 text-primary';
    return 'bg-muted text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold glow-text">Leaderboard</h1>
          <p className="text-muted-foreground">See who's crushing their goals</p>
        </div>

        {/* User's Current Rank */}
        {userRank && (
          <Card className="gym-card border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getRankIcon(userRank)}
                  <div>
                    <div className="font-medium">Your Rank</div>
                    <div className="text-sm text-muted-foreground">Keep pushing!</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">#{userRank}</div>
                  <div className="text-sm text-muted-foreground">Global</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="points" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="points" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Points
            </TabsTrigger>
            <TabsTrigger value="workouts" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Workouts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="points" className="space-y-3 mt-6">
            <div className="text-sm font-medium text-muted-foreground mb-4">
              Ranked by total points earned
            </div>
            
            {topUsers.map((profile, index) => {
              const rank = index + 1;
              const isCurrentUser = profile.user_id === user?.id;
              
              return (
                <Card 
                  key={profile.id} 
                  className={`gym-card ${isCurrentUser ? 'border-primary/50 bg-primary/5' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getRankIcon(rank)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {profile.username}
                            {isCurrentUser && <span className="text-primary ml-1">(You)</span>}
                          </span>
                          <Badge className={getRankBadgeColor(rank)}>
                            Lv.{profile.fitness_level}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {profile.rank_title}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-primary">
                          {profile.total_points.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Points</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="workouts" className="space-y-3 mt-6">
            <div className="text-sm font-medium text-muted-foreground mb-4">
              Ranked by total workouts completed
            </div>
            
            {[...topUsers]
              .sort((a, b) => (b.totalWorkouts || 0) - (a.totalWorkouts || 0))
              .map((profile, index) => {
                const rank = index + 1;
                const isCurrentUser = profile.user_id === user?.id;
                
                return (
                  <Card 
                    key={`workout-${profile.id}`} 
                    className={`gym-card ${isCurrentUser ? 'border-primary/50 bg-primary/5' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {getRankIcon(rank)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {profile.username}
                              {isCurrentUser && <span className="text-primary ml-1">(You)</span>}
                            </span>
                            <Badge className={getRankBadgeColor(rank)}>
                              Lv.{profile.fitness_level}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {profile.rank_title}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-bold text-accent">
                            {profile.totalWorkouts}
                          </div>
                          <div className="text-xs text-muted-foreground">Workouts</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </TabsContent>
        </Tabs>

        {/* Achievement Showcase */}
        <Card className="gym-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Top Achievements This Week
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-400" />
                <div>
                  <div className="font-medium">Most Workouts</div>
                  <div className="text-sm text-muted-foreground">FitnessKing92</div>
                </div>
              </div>
              <div className="text-primary font-bold">12 workouts</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Medal className="h-8 w-8 text-amber-600" />
                <div>
                  <div className="font-medium">Biggest PR</div>
                  <div className="text-sm text-muted-foreground">PowerLifter21</div>
                </div>
              </div>
              <div className="text-accent font-bold">+15kg</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;