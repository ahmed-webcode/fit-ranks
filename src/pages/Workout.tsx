import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, Trash2, Clock, Weight, Hash } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Exercise {
  id: string;
  name: string;
  category: string;
}

interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number[];
  weight: number[];
}

const Workout = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('id, name, category')
      .order('name');

    if (!error && data) {
      setExercises(data);
    }
  };

  const addExercise = () => {
    setWorkoutExercises([
      ...workoutExercises,
      {
        exerciseId: '',
        exerciseName: '',
        sets: 1,
        reps: [0],
        weight: [0],
      },
    ]);
  };

  const updateExercise = (index: number, field: keyof WorkoutExercise, value: any) => {
    const updated = [...workoutExercises];
    if (field === 'exerciseId') {
      const selectedExercise = exercises.find(ex => ex.id === value);
      updated[index].exerciseId = value;
      updated[index].exerciseName = selectedExercise?.name || '';
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setWorkoutExercises(updated);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: number) => {
    const updated = [...workoutExercises];
    if (field === 'reps') {
      updated[exerciseIndex].reps[setIndex] = value;
    } else {
      updated[exerciseIndex].weight[setIndex] = value;
    }
    setWorkoutExercises(updated);
  };

  const addSet = (exerciseIndex: number) => {
    const updated = [...workoutExercises];
    updated[exerciseIndex].sets += 1;
    updated[exerciseIndex].reps.push(0);
    updated[exerciseIndex].weight.push(0);
    setWorkoutExercises(updated);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...workoutExercises];
    if (updated[exerciseIndex].sets > 1) {
      updated[exerciseIndex].sets -= 1;
      updated[exerciseIndex].reps.splice(setIndex, 1);
      updated[exerciseIndex].weight.splice(setIndex, 1);
    }
    setWorkoutExercises(updated);
  };

  const removeExercise = (index: number) => {
    setWorkoutExercises(workoutExercises.filter((_, i) => i !== index));
  };

  const saveWorkout = async () => {
    if (!user || !workoutName.trim() || workoutExercises.length === 0) {
      toast({
        title: "Invalid workout",
        description: "Please provide a workout name and add at least one exercise.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert([{
          user_id: user.id,
          name: workoutName,
          duration_minutes: 0, // Will be calculated
        }])
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Add exercises to workout
      const workoutExerciseData = workoutExercises
        .filter(ex => ex.exerciseId)
        .map(ex => ({
          workout_id: workout.id,
          exercise_id: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
        }));

      const { error: exerciseError } = await supabase
        .from('workout_exercises')
        .insert(workoutExerciseData);

      if (exerciseError) throw exerciseError;

      toast({
        title: "Workout saved!",
        description: "Your workout has been successfully saved.",
      });

      // Reset form
      setWorkoutName('');
      setWorkoutExercises([]);
    } catch (error: any) {
      toast({
        title: "Failed to save workout",
        description: error.message || "An error occurred while saving your workout.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold glow-text">Start Workout</h1>
          <p className="text-muted-foreground">Track your exercises and sets</p>
        </div>

        {/* Workout Name */}
        <Card className="gym-card">
          <CardContent className="p-4">
            <Label htmlFor="workout-name">Workout Name</Label>
            <Input
              id="workout-name"
              placeholder="e.g., Push Day, Leg Day"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Exercises */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Exercises</h2>
            <Button onClick={addExercise} size="sm" className="gym-button-primary">
              <Plus className="h-4 w-4 mr-1" />
              Add Exercise
            </Button>
          </div>

          {workoutExercises.map((exercise, exerciseIndex) => (
            <Card key={exerciseIndex} className="gym-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Select
                    value={exercise.exerciseId}
                    onValueChange={(value) => updateExercise(exerciseIndex, 'exerciseId', value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select exercise" />
                    </SelectTrigger>
                    <SelectContent>
                      {exercises.map((ex) => (
                        <SelectItem key={ex.id} value={ex.id}>
                          {ex.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExercise(exerciseIndex)}
                    className="ml-2"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>

              {exercise.exerciseId && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground">
                      <span>Set</span>
                      <span>Reps</span>
                      <span>Weight (kg)</span>
                      <span></span>
                    </div>

                    {Array.from({ length: exercise.sets }).map((_, setIndex) => (
                      <div key={setIndex} className="grid grid-cols-4 gap-2 items-center">
                        <span className="text-sm text-center font-medium">
                          {setIndex + 1}
                        </span>
                        <Input
                          type="number"
                          placeholder="0"
                          value={exercise.reps[setIndex] || ''}
                          onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                          className="text-center"
                        />
                        <Input
                          type="number"
                          placeholder="0"
                          value={exercise.weight[setIndex] || ''}
                          onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                          className="text-center"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSet(exerciseIndex, setIndex)}
                          disabled={exercise.sets === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addSet(exerciseIndex)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Set
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

          {workoutExercises.length === 0 && (
            <Card className="gym-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Weight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No exercises added yet.</p>
                <p className="text-sm">Add an exercise to get started!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Save Button */}
        {(workoutName.trim() || workoutExercises.length > 0) && (
          <Button
            onClick={saveWorkout}
            disabled={isLoading}
            className="w-full gym-button-primary h-12"
          >
            <Save className="h-5 w-5 mr-2" />
            {isLoading ? 'Saving...' : 'Save Workout'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Workout;