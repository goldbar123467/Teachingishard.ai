'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Objective {
  id: string;
  text: string;
  standard?: string;
}

interface ObjectivesEditorProps {
  objectives: Objective[];
  onObjectivesChange: (objectives: Objective[]) => void;
}

const STANDARDS = [
  'CCSS.MATH.5.NBT.A.1',
  'CCSS.MATH.5.NBT.A.2',
  'CCSS.MATH.5.NBT.A.3',
  'CCSS.ELA-LITERACY.RL.5.1',
  'CCSS.ELA-LITERACY.RL.5.2',
  'NGSS.5-LS1-1',
  'NGSS.5-LS2-1',
  'NGSS.5-ESS1-1',
];

export function ObjectivesEditor({
  objectives,
  onObjectivesChange,
}: ObjectivesEditorProps) {
  const handleAddObjective = () => {
    const newObjective: Objective = {
      id: `obj-${Date.now()}`,
      text: '',
      standard: undefined,
    };
    onObjectivesChange([...objectives, newObjective]);
  };

  const handleUpdateObjective = (id: string, updates: Partial<Objective>) => {
    onObjectivesChange(
      objectives.map(obj => (obj.id === id ? { ...obj, ...updates } : obj))
    );
  };

  const handleDeleteObjective = (id: string) => {
    onObjectivesChange(objectives.filter(obj => obj.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {objectives.length === 0 ? (
          <Card className="border-dashed bg-muted/30">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                No objectives yet. Click "Add Objective" to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ol className="space-y-3">
            {objectives.map((objective, index) => (
              <li
                key={objective.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary mt-0.5">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <Input
                    placeholder="Learning objective (e.g., 'Students will be able to...')"
                    value={objective.text}
                    onChange={e =>
                      handleUpdateObjective(objective.id, { text: e.target.value })
                    }
                    className="text-sm"
                  />
                  <Select
                    value={objective.standard || ''}
                    onValueChange={value =>
                      handleUpdateObjective(objective.id, {
                        standard: value || undefined,
                      })
                    }
                  >
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue placeholder="Select standard (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {STANDARDS.map(standard => (
                        <SelectItem key={standard} value={standard}>
                          {standard}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteObjective(objective.id)}
                  className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sr-only">Delete objective</span>
                </Button>
              </li>
            ))}
          </ol>
        )}
      </div>

      <Button
        onClick={handleAddObjective}
        variant="outline"
        size="sm"
        className="w-full gap-2 md:w-auto"
      >
        <Plus className="w-4 h-4" />
        Add Objective
      </Button>
    </div>
  );
}
