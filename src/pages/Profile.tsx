import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Edit3, Save, LogOut, Trophy, Target, Calendar, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  username: string;
  full_name: string;
  age: number;
  weight: number;
  fitness_goals: string;
  fitness_level: number;
  total_points: number;
  rank_title: string;
  created_at: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  points_reward: number;
  earned_at: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAchievements();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setProfile(data);
        setEditedProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          id,
          earned_at,
          achievements (
            name,
            description,
            points_reward
          )
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (!error && data) {
        const formattedAchievements = data.map(ua => ({
          id: ua.id,
          name: (ua.achievements as any)?.name || '',
          description: (ua.achievements as any)?.description || '',
          points_reward: (ua.achievements as any)?.points_reward || 0,
          earned_at: ua.earned_at,
        }));
        setAchievements(formattedAchievements);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(editedProfile)
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile({ ...profile, ...editedProfile });
      setIsEditing(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to update profile",
        description: error.message || "An error occurred while updating your profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
          <h1 className="text-2xl font-bold glow-text">Profile</h1>
          <p className="text-muted-foreground">Manage your fitness journey</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Profile Header */}
            <Card className="gym-card">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {profile?.full_name || profile?.username || 'Unnamed User'}
                    </h2>
                    <p className="text-muted-foreground">@{profile?.username}</p>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <Badge className="rank-badge">
                      Level {profile?.fitness_level || 1}
                    </Badge>
                    <Badge variant="outline">
                      {profile?.rank_title || 'Beginner'}
                    </Badge>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <Zap className="h-6 w-6 mx-auto mb-1 text-primary" />
                    <div className="font-bold text-lg">{profile?.total_points || 0}</div>
                    <div className="text-xs text-muted-foreground">Total Points</div>
                  </div>
                  <div className="text-center p-3 bg-accent/5 rounded-lg">
                    <Trophy className="h-6 w-6 mx-auto mb-1 text-accent" />
                    <div className="font-bold text-lg">{achievements.length}</div>
                    <div className="text-xs text-muted-foreground">Achievements</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Details */}
            <Card className="gym-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profile Details</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={isEditing ? editedProfile.full_name || '' : profile?.full_name || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={isEditing ? editedProfile.age || '' : profile?.age || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, age: parseInt(e.target.value) || 0 })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={isEditing ? editedProfile.weight || '' : profile?.weight || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, weight: parseFloat(e.target.value) || 0 })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fitness-goals">Fitness Goals</Label>
                  <Textarea
                    id="fitness-goals"
                    placeholder="Describe your fitness goals..."
                    value={isEditing ? editedProfile.fitness_goals || '' : profile?.fitness_goals || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, fitness_goals: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>

                {isEditing && (
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full gym-button-primary"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="gym-card">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Member since {profile?.created_at ? formatDate(profile.created_at) : 'Unknown'}
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleSignOut}
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div className="text-center">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold">Your Achievements</h3>
              <p className="text-sm text-muted-foreground">
                {achievements.length} achievements unlocked
              </p>
            </div>

            {achievements.length === 0 ? (
              <Card className="gym-card">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No achievements yet!</p>
                  <p className="text-sm">Complete workouts to earn your first achievement</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className="gym-card">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-primary/20">
                          <Trophy className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{achievement.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {achievement.description}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Earned {formatDate(achievement.earned_at)}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="rank-badge">
                            +{achievement.points_reward} XP
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;