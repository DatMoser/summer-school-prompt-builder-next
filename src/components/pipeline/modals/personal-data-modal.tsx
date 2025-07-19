import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PersonalHealthData } from '@/lib/pipeline-types';
import { Activity, Heart, User, ChevronDown, ChevronUp, Calendar, Target, Stethoscope } from 'lucide-react';

interface PersonalDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataUpdate: (data: PersonalHealthData) => void;
}

// Default health data template
const getDefaultHealthData = (): PersonalHealthData => ({
  age: 30,
  biologicalSex: 'Other',
  heightCm: undefined,
  weightKg: undefined,
  fitnessGoals: 'General Health & Wellness',
  averageDailySteps: 8000,
  averageHeartRate: undefined,
  sleepHoursPerNight: undefined,
  activeEnergyBurned: undefined,
  exerciseMinutesPerWeek: undefined,
  restingHeartRate: undefined,
  vo2Max: undefined,
  walkingHeartRateAverage: undefined,
  heartRateVariability: undefined,
  bloodPressureSystolic: undefined,
  bloodPressureDiastolic: undefined,
  bodyMassIndex: undefined,
  bloodGlucose: undefined,
  waterIntakeLiters: undefined,
  workoutTypes: [],
  mostActiveTimeOfDay: '',
  weeklyActivityConsistency: '',
  sourceDescription: 'Manual Entry',
  lastSyncDate: new Date().toISOString()
});

export default function PersonalDataModal({ open, onOpenChange, onDataUpdate }: PersonalDataModalProps) {
  const [healthData, setHealthData] = useState<PersonalHealthData>(getDefaultHealthData());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [workoutTypesText, setWorkoutTypesText] = useState('');

  // Convert workout types array to text for editing
  useEffect(() => {
    setWorkoutTypesText(healthData.workoutTypes?.join(', ') || '');
  }, [healthData.workoutTypes]);

  // Update workout types when text changes
  const handleWorkoutTypesChange = (text: string) => {
    setWorkoutTypesText(text);
    const types = text.split(',').map(t => t.trim()).filter(t => t.length > 0);
    setHealthData(prev => ({ ...prev, workoutTypes: types }));
  };

  // Handle field changes
  const handleFieldChange = (field: keyof PersonalHealthData, value: string | number | string[] | undefined) => {
    setHealthData(prev => ({ ...prev, [field]: value, lastSyncDate: new Date().toISOString() }));
  };

  const handleConfirm = () => {
    onDataUpdate(healthData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
    setHealthData(getDefaultHealthData());
    setWorkoutTypesText('');
  };

  const isFormValid = () => {
    return healthData.age > 0 && healthData.biologicalSex && healthData.fitnessGoals && healthData.averageDailySteps > 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-2xl w-[90vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Stethoscope className="text-blue-400" size={20} />
            Personal Health Profile
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure your health metrics for personalized content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Demographics & Core Metrics */}
          <div className="space-y-4">
            <h3 className="text-blue-300 font-medium">Basic Profile & Activity</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age" className="text-sm font-medium text-gray-300 mb-2 block">
                  Age
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                  <Input
                    id="age"
                    type="number"
                    min="13"
                    max="120"
                    value={healthData.age}
                    onChange={(e) => handleFieldChange('age', parseInt(e.target.value) || 30)}
                    className="bg-gray-700 border-gray-600 text-gray-200 pl-10"
                    placeholder="e.g., 30"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="biologicalSex" className="text-sm font-medium text-gray-300 mb-2 block">
                  Biological Sex
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                  <select
                    id="biologicalSex"
                    value={healthData.biologicalSex}
                    onChange={(e) => handleFieldChange('biologicalSex', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-gray-200 pl-10 py-2 px-3 rounded-md"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="steps" className="text-sm font-medium text-gray-300 mb-2 block">
                  Average Daily Steps
                </Label>
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                  <Input
                    id="steps"
                    type="number"
                    min="1000"
                    max="50000"
                    value={healthData.averageDailySteps}
                    onChange={(e) => handleFieldChange('averageDailySteps', parseInt(e.target.value) || 8000)}
                    className="bg-gray-700 border-gray-600 text-gray-200 pl-10"
                    placeholder="e.g., 8000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fitnessGoals" className="text-sm font-medium text-gray-300 mb-2 block">
                  Fitness Goals
                </Label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                  <Input
                    id="fitnessGoals"
                    value={healthData.fitnessGoals}
                    onChange={(e) => handleFieldChange('fitnessGoals', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-200 pl-10"
                    placeholder="e.g., Weight Loss, Muscle Gain, Endurance"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height" className="text-sm font-medium text-gray-300 mb-2 block">
                  Height (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  min="100"
                  max="250"
                  value={healthData.heightCm?.toString() || ''}
                  onChange={(e) => handleFieldChange('heightCm', parseInt(e.target.value) || undefined)}
                  className="bg-gray-700 border-gray-600 text-gray-200"
                  placeholder="e.g., 175"
                />
              </div>

              <div>
                <Label htmlFor="weight" className="text-sm font-medium text-gray-300 mb-2 block">
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  min="30"
                  max="300"
                  value={healthData.weightKg?.toString() || ''}
                  onChange={(e) => handleFieldChange('weightKg', parseInt(e.target.value) || undefined)}
                  className="bg-gray-700 border-gray-600 text-gray-200"
                  placeholder="e.g., 70"
                />
              </div>
            </div>
          </div>

          {/* Advanced Health Metrics - Collapsible */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-blue-300 font-medium hover:text-blue-200 transition-colors hover:cursor-pointer"
            >
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              Advanced Health Metrics (Optional)
            </button>

            {showAdvanced && (
              <div className="space-y-4 border-l-2 border-blue-400/20 pl-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="restingHR" className="text-sm font-medium text-gray-300 mb-2 block">
                      Resting Heart Rate (BPM)
                    </Label>
                    <div className="relative">
                      <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                      <Input
                        id="restingHR"
                        type="number"
                        min="40"
                        max="120"
                        value={healthData.restingHeartRate || ''}
                        onChange={(e) => handleFieldChange('restingHeartRate', parseInt(e.target.value) || undefined)}
                        className="bg-gray-700 border-gray-600 text-gray-200 pl-10"
                        placeholder="e.g., 65"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="sleep" className="text-sm font-medium text-gray-300 mb-2 block">
                      Average Sleep (hours/night)
                    </Label>
                    <Input
                      id="sleep"
                      type="number"
                      min="4"
                      max="12"
                      step="0.5"
                      value={healthData.sleepHoursPerNight || ''}
                      onChange={(e) => handleFieldChange('sleepHoursPerNight', parseFloat(e.target.value) || undefined)}
                      className="bg-gray-700 border-gray-600 text-gray-200"
                      placeholder="e.g., 7.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="vo2max" className="text-sm font-medium text-gray-300 mb-2 block">
                      VO2 Max (ml/kg/min)
                    </Label>
                    <Input
                      id="vo2max"
                      type="number"
                      min="20"
                      max="80"
                      value={healthData.vo2Max || ''}
                      onChange={(e) => handleFieldChange('vo2Max', parseInt(e.target.value) || undefined)}
                      className="bg-gray-700 border-gray-600 text-gray-200"
                      placeholder="e.g., 45"
                    />
                  </div>

                  <div>
                    <Label htmlFor="activeCalories" className="text-sm font-medium text-gray-300 mb-2 block">
                      Active Calories/Day
                    </Label>
                    <Input
                      id="activeCalories"
                      type="number"
                      min="100"
                      max="2000"
                      value={healthData.activeEnergyBurned || ''}
                      onChange={(e) => handleFieldChange('activeEnergyBurned', parseInt(e.target.value) || undefined)}
                      className="bg-gray-700 border-gray-600 text-gray-200"
                      placeholder="e.g., 400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="exerciseMinutes" className="text-sm font-medium text-gray-300 mb-2 block">
                      Exercise Minutes/Week
                    </Label>
                    <Input
                      id="exerciseMinutes"
                      type="number"
                      min="0"
                      max="1000"
                      value={healthData.exerciseMinutesPerWeek || ''}
                      onChange={(e) => handleFieldChange('exerciseMinutesPerWeek', parseInt(e.target.value) || undefined)}
                      className="bg-gray-700 border-gray-600 text-gray-200"
                      placeholder="e.g., 150"
                    />
                  </div>

                  <div>
                    <Label htmlFor="waterIntake" className="text-sm font-medium text-gray-300 mb-2 block">
                      Water Intake (L/day)
                    </Label>
                    <Input
                      id="waterIntake"
                      type="number"
                      min="0.5"
                      max="5"
                      step="0.1"
                      value={healthData.waterIntakeLiters || ''}
                      onChange={(e) => handleFieldChange('waterIntakeLiters', parseFloat(e.target.value) || undefined)}
                      className="bg-gray-700 border-gray-600 text-gray-200"
                      placeholder="e.g., 2.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="workoutTypes" className="text-sm font-medium text-gray-300 mb-2 block">
                    Workout Types
                  </Label>
                  <Textarea
                    id="workoutTypes"
                    value={workoutTypesText}
                    onChange={(e) => handleWorkoutTypesChange(e.target.value)}
                    placeholder="e.g., Running, Cycling, Swimming, Strength Training (separate with commas)"
                    className="bg-gray-700 border-gray-600 text-gray-200 min-h-[60px]"
                    rows={2}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Types of workouts you regularly do
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isFormValid()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Confirm Health Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}