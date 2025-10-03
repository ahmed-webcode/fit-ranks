import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Plus, Users } from 'lucide-react';

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string | null;
  difficulty_level: string | null;
  category: string | null;
  is_public: boolean;
  times_used: number;
  creator_id: string;
}

export default function Templates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'mine' | 'public'>('all');

  useEffect(() => {
    fetchTemplates();
  }, [filter]);

  const fetchTemplates = async () => {
    try {
      let query = supabase
        .from('workout_templates')
        .select('*')
        .order('times_used', { ascending: false });

      if (filter === 'mine') {
        query = query.eq('creator_id', user?.id);
      } else if (filter === 'public') {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTemplates(data || []);
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

  const useTemplate = async (templateId: string) => {
    try {
      // Increment times_used counter
      const { error } = await supabase
        .from('workout_templates')
        .update({ times_used: templates.find(t => t.id === templateId)!.times_used + 1 })
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Template applied! Create your workout from this template.',
      });
      
      fetchTemplates();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getDifficultyColor = (level: string | null) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/20 text-green-500';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-500';
      case 'advanced': return 'bg-red-500/20 text-red-500';
      default: return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-24 max-w-6xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold glow-text">Workout Templates</h1>
        <BookOpen className="h-8 w-8 text-primary" />
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All Templates
        </Button>
        <Button
          variant={filter === 'mine' ? 'default' : 'outline'}
          onClick={() => setFilter('mine')}
        >
          My Templates
        </Button>
        <Button
          variant={filter === 'public' ? 'default' : 'outline'}
          onClick={() => setFilter('public')}
        >
          Public Templates
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.length === 0 ? (
          <Card className="col-span-full p-8 text-center glass-card">
            <p className="text-muted-foreground">No templates found</p>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="p-6 gym-card hover-lift animate-scale-in">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-lg">{template.name}</h3>
                {template.is_public && (
                  <Badge variant="secondary" className="ml-2">
                    <Users className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                )}
              </div>
              
              {template.description && (
                <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
              )}
              
              <div className="flex items-center gap-2 mb-4">
                {template.difficulty_level && (
                  <Badge className={getDifficultyColor(template.difficulty_level)}>
                    {template.difficulty_level}
                  </Badge>
                )}
                {template.category && (
                  <Badge variant="outline">{template.category}</Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Used {template.times_used} times
                </span>
                <Button
                  size="sm"
                  onClick={() => useTemplate(template.id)}
                  className="gym-button-primary"
                >
                  Use Template
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
