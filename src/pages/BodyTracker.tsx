import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Ruler, TrendingUp, Plus } from 'lucide-react';
import { bodyMeasurementSchema } from '@/lib/validations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BodyMeasurement {
  id: string;
  weight: number | null;
  height: number | null;
  body_fat_percentage: number | null;
  muscle_mass: number | null;
  measured_at: string;
  notes: string | null;
}

export default function BodyTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    body_fat_percentage: '',
    muscle_mass: '',
    chest: '',
    waist: '',
    hips: '',
    biceps: '',
    thighs: '',
    notes: '',
  });

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const fetchMeasurements = async () => {
    try {
      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user?.id)
        .order('measured_at', { ascending: true });

      if (error) throw error;
      setMeasurements(data || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const measurementData = {
      weight: formData.weight ? parseFloat(formData.weight) : null,
      height: formData.height ? parseFloat(formData.height) : null,
      body_fat_percentage: formData.body_fat_percentage ? parseFloat(formData.body_fat_percentage) : null,
      muscle_mass: formData.muscle_mass ? parseFloat(formData.muscle_mass) : null,
      chest: formData.chest ? parseFloat(formData.chest) : null,
      waist: formData.waist ? parseFloat(formData.waist) : null,
      hips: formData.hips ? parseFloat(formData.hips) : null,
      biceps: formData.biceps ? parseFloat(formData.biceps) : null,
      thighs: formData.thighs ? parseFloat(formData.thighs) : null,
      notes: formData.notes || null,
    };

    try {
      bodyMeasurementSchema.parse(measurementData);

      const { error } = await supabase
        .from('body_measurements')
        .insert({
          ...measurementData,
          user_id: user?.id,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Measurement recorded successfully',
      });

      setFormData({
        weight: '',
        height: '',
        body_fat_percentage: '',
        muscle_mass: '',
        chest: '',
        waist: '',
        hips: '',
        biceps: '',
        thighs: '',
        notes: '',
      });
      setShowForm(false);
      fetchMeasurements();
    } catch (error: any) {
      toast({
        title: 'Validation Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const chartData = measurements.map(m => ({
    date: new Date(m.measured_at).toLocaleDateString(),
    weight: m.weight,
    bodyFat: m.body_fat_percentage,
    muscleMass: m.muscle_mass,
  }));

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
        <h1 className="text-3xl font-bold glow-text">Body Tracker</h1>
        <Ruler className="h-8 w-8 text-primary" />
      </div>

      <Button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 gym-button-primary"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Measurement
      </Button>

      {showForm && (
        <Card className="p-6 mb-6 gym-card animate-slide-down">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="70.5"
                />
              </div>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="175"
                />
              </div>
              <div>
                <Label htmlFor="body_fat">Body Fat %</Label>
                <Input
                  id="body_fat"
                  type="number"
                  step="0.1"
                  value={formData.body_fat_percentage}
                  onChange={(e) => setFormData({ ...formData, body_fat_percentage: e.target.value })}
                  placeholder="15.5"
                />
              </div>
              <div>
                <Label htmlFor="muscle_mass">Muscle Mass (kg)</Label>
                <Input
                  id="muscle_mass"
                  type="number"
                  step="0.1"
                  value={formData.muscle_mass}
                  onChange={(e) => setFormData({ ...formData, muscle_mass: e.target.value })}
                  placeholder="35"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="chest">Chest (cm)</Label>
                <Input
                  id="chest"
                  type="number"
                  step="0.1"
                  value={formData.chest}
                  onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="waist">Waist (cm)</Label>
                <Input
                  id="waist"
                  type="number"
                  step="0.1"
                  value={formData.waist}
                  onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="hips">Hips (cm)</Label>
                <Input
                  id="hips"
                  type="number"
                  step="0.1"
                  value={formData.hips}
                  onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="biceps">Biceps (cm)</Label>
                <Input
                  id="biceps"
                  type="number"
                  step="0.1"
                  value={formData.biceps}
                  onChange={(e) => setFormData({ ...formData, biceps: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="thighs">Thighs (cm)</Label>
                <Input
                  id="thighs"
                  type="number"
                  step="0.1"
                  value={formData.thighs}
                  onChange={(e) => setFormData({ ...formData, thighs: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="gym-button-primary">
                Save Measurement
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {measurements.length > 0 && (
        <Card className="p-6 mb-6 gym-card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Progress Chart
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" name="Weight (kg)" />
              <Line type="monotone" dataKey="bodyFat" stroke="hsl(var(--accent))" name="Body Fat %" />
              <Line type="monotone" dataKey="muscleMass" stroke="hsl(var(--secondary))" name="Muscle Mass (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {measurements.slice().reverse().map((measurement) => (
          <Card key={measurement.id} className="p-4 gym-card hover-lift">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold">
                {new Date(measurement.measured_at).toLocaleDateString()}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {measurement.weight && (
                <div>
                  <span className="text-muted-foreground">Weight:</span>{' '}
                  <span className="font-medium">{measurement.weight} kg</span>
                </div>
              )}
              {measurement.body_fat_percentage && (
                <div>
                  <span className="text-muted-foreground">Body Fat:</span>{' '}
                  <span className="font-medium">{measurement.body_fat_percentage}%</span>
                </div>
              )}
              {measurement.muscle_mass && (
                <div>
                  <span className="text-muted-foreground">Muscle:</span>{' '}
                  <span className="font-medium">{measurement.muscle_mass} kg</span>
                </div>
              )}
            </div>
            {measurement.notes && (
              <p className="text-sm text-muted-foreground mt-2">{measurement.notes}</p>
            )}
          </Card>
        ))}
      </div>

      {measurements.length === 0 && (
        <Card className="p-8 text-center glass-card">
          <p className="text-muted-foreground">No measurements recorded yet</p>
        </Card>
      )}
    </div>
  );
}
