'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Save, X, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ActivitySequencer } from './ActivitySequencer';
import type {
  LessonPlan,
  LearningObjective,
  LessonMaterial,
  LessonActivity,
  LessonPhase,
} from '@/lib/game/lessonPlan';
import type { Lesson } from '@/lib/game/types';
import {
  SUBJECT_LABELS,
  SUBJECT_ICONS,
  SUBJECT_COLORS,
  METHOD_LABELS,
  calculateTotalDuration,
  validateLessonFit,
} from '@/lib/game/lessonPlan';
import { cn } from '@/lib/utils';

interface LessonPlanBuilderProps {
  lessonPlan: LessonPlan;
  blockDuration?: number;
  onSave: (lessonPlan: LessonPlan) => void;
  onCancel: () => void;
}

export function LessonPlanBuilder({
  lessonPlan: initialPlan,
  blockDuration,
  onSave,
  onCancel,
}: LessonPlanBuilderProps) {
  const [plan, setPlan] = useState<LessonPlan>(initialPlan);
  const [objectiveInput, setObjectiveInput] = useState('');
  const [materialInput, setMaterialInput] = useState('');

  const totalDuration = calculateTotalDuration(plan);
  const validation = blockDuration ? validateLessonFit(plan, blockDuration) : null;

  const subjects: Lesson['subject'][] = [
    'math',
    'reading',
    'science',
    'social-studies',
    'art',
    'pe',
  ];

  const methods = Object.keys(METHOD_LABELS) as Array<keyof typeof METHOD_LABELS>;

  const handleUpdatePlan = (updates: Partial<LessonPlan>) => {
    setPlan(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleAddObjective = () => {
    if (!objectiveInput.trim()) return;

    const newObjective: LearningObjective = {
      id: crypto.randomUUID(),
      description: objectiveInput.trim(),
      completed: false,
    };

    handleUpdatePlan({
      objectives: [...plan.objectives, newObjective],
    });
    setObjectiveInput('');
  };

  const handleDeleteObjective = (id: string) => {
    handleUpdatePlan({
      objectives: plan.objectives.filter(obj => obj.id !== id),
    });
  };

  const handleAddMaterial = () => {
    if (!materialInput.trim()) return;

    const newMaterial: LessonMaterial = {
      id: crypto.randomUUID(),
      name: materialInput.trim(),
      required: true,
    };

    handleUpdatePlan({
      materials: [...plan.materials, newMaterial],
    });
    setMaterialInput('');
  };

  const handleDeleteMaterial = (id: string) => {
    handleUpdatePlan({
      materials: plan.materials.filter(mat => mat.id !== id),
    });
  };

  const handleReorderActivities = (activities: LessonActivity[]) => {
    handleUpdatePlan({ activities });
  };

  const handleSave = () => {
    onSave(plan);
  };

  return (
    <div className="lesson-plan-builder space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {plan.id ? 'Edit Lesson Plan' : 'Create Lesson Plan'}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Save Plan
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Lesson Name</Label>
              <Input
                id="plan-name"
                value={plan.name}
                onChange={e => handleUpdatePlan({ name: e.target.value })}
                placeholder="e.g., Introduction to Fractions"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-subject">Subject</Label>
              <Select
                value={plan.subject}
                onValueChange={value =>
                  handleUpdatePlan({ subject: value as Lesson['subject'] })
                }
              >
                <SelectTrigger id="plan-subject">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {SUBJECT_ICONS[subject]} {SUBJECT_LABELS[subject]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-duration">Target Duration (minutes)</Label>
              <Input
                id="plan-duration"
                type="number"
                min="15"
                max="180"
                step="5"
                value={plan.duration}
                onChange={e =>
                  handleUpdatePlan({ duration: parseInt(e.target.value) || 45 })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-method">Teaching Method</Label>
              <Select
                value={plan.teachingMethod}
                onValueChange={value =>
                  handleUpdatePlan({ teachingMethod: value as typeof plan.teachingMethod })
                }
              >
                <SelectTrigger id="plan-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {methods.map(method => (
                    <SelectItem key={method} value={method}>
                      {METHOD_LABELS[method]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration Validator */}
          {blockDuration && (
            <div className="duration-validator">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  Planned Duration: <span className="tabular-nums font-medium">{totalDuration}</span> min
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  Block Duration: <span className="tabular-nums font-medium">{blockDuration}</span> min
                </span>
              </div>

              {validation && !validation.isValid && (
                <div className="flex items-start gap-2 mt-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="space-y-1 text-sm">
                    {validation.errors.map((error, i) => (
                      <div key={i}>{error}</div>
                    ))}
                  </div>
                </div>
              )}

              {validation && validation.isValid && validation.warnings.length > 0 && (
                <div className="flex items-start gap-2 mt-2 p-3 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="space-y-1 text-sm">
                    {validation.warnings.map((warning, i) => (
                      <div key={i}>{warning}</div>
                    ))}
                  </div>
                </div>
              )}

              {validation && validation.isValid && validation.warnings.length === 0 && (
                <div className="flex items-center gap-2 mt-2 p-3 rounded-lg bg-green-500/10 text-green-700 dark:text-green-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span className="text-sm">Lesson plan fits perfectly!</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Learning Objectives</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={objectiveInput}
              onChange={e => setObjectiveInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddObjective()}
              placeholder="Students will be able to..."
            />
            <Button onClick={handleAddObjective}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {plan.objectives.length > 0 && (
            <div className="space-y-2">
              {plan.objectives.map((obj, index) => (
                <div
                  key={obj.id}
                  className="flex items-start gap-2 p-3 rounded-lg border bg-card"
                >
                  <span className="text-sm font-medium text-muted-foreground shrink-0">
                    {index + 1}.
                  </span>
                  <span className="text-sm flex-1">{obj.description}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteObjective(obj.id)}
                    className="h-8 w-8 p-0 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Materials */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Materials Needed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={materialInput}
              onChange={e => setMaterialInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddMaterial()}
              placeholder="e.g., Whiteboard markers, worksheets..."
            />
            <Button onClick={handleAddMaterial}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {plan.materials.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {plan.materials.map(mat => (
                <Badge
                  key={mat.id}
                  variant="outline"
                  className="px-3 py-1 gap-2"
                >
                  {mat.name}
                  {mat.quantity && ` (${mat.quantity})`}
                  <button
                    onClick={() => handleDeleteMaterial(mat.id)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lesson Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivitySequencer
            activities={plan.activities}
            subject={plan.subject}
            onReorder={handleReorderActivities}
            onAddActivity={phase => {
              // TODO: Open activity picker modal
              console.log('Add activity to phase:', phase);
            }}
            onEditActivity={activity => {
              // TODO: Open activity editor modal
              console.log('Edit activity:', activity);
            }}
            onDeleteActivity={activityId => {
              handleUpdatePlan({
                activities: plan.activities.filter(a => a.id !== activityId),
              });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
