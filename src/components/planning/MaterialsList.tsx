'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Material {
  id: string;
  name: string;
  quantity: number;
  type: 'consumable' | 'reusable' | 'tech' | 'handout';
  checked: boolean;
}

interface MaterialsListProps {
  materials: Material[];
  onMaterialsChange: (materials: Material[]) => void;
}

const MATERIAL_TYPES: Record<Material['type'], { label: string; color: string }> =
  {
    consumable: {
      label: 'Consumable',
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    },
    reusable: {
      label: 'Reusable',
      color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    },
    tech: {
      label: 'Technology',
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    },
    handout: {
      label: 'Handout',
      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    },
  };

export function MaterialsList({
  materials,
  onMaterialsChange,
}: MaterialsListProps) {
  const handleAddMaterial = () => {
    const newMaterial: Material = {
      id: `mat-${Date.now()}`,
      name: '',
      quantity: 1,
      type: 'consumable',
      checked: false,
    };
    onMaterialsChange([...materials, newMaterial]);
  };

  const handleUpdateMaterial = (id: string, updates: Partial<Material>) => {
    onMaterialsChange(
      materials.map(mat => (mat.id === id ? { ...mat, ...updates } : mat))
    );
  };

  const handleDeleteMaterial = (id: string) => {
    onMaterialsChange(materials.filter(mat => mat.id !== id));
  };

  const checkedCount = materials.filter(m => m.checked).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      {materials.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <span className="text-sm font-medium">
            Materials prepared: <span className="text-primary">{checkedCount}</span> of{' '}
            <span className="text-primary">{materials.length}</span>
          </span>
          <div className="w-24 h-2 rounded-full bg-muted border border-muted-foreground/20 overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{
                width: `${materials.length > 0 ? (checkedCount / materials.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Materials List */}
      <div className="space-y-2">
        {materials.length === 0 ? (
          <Card className="border-dashed bg-muted/30">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                No materials added yet. Click "Add Material" to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {materials.map(material => (
              <div
                key={material.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-all',
                  material.checked
                    ? 'bg-muted/30 border-muted-foreground/20'
                    : 'bg-card border-border hover:bg-muted/50'
                )}
              >
                <Checkbox
                  checked={material.checked}
                  onCheckedChange={checked =>
                    handleUpdateMaterial(material.id, { checked: !!checked })
                  }
                  className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <Input
                    placeholder="Material name (e.g., 'Colored pencils', 'Textbooks')"
                    value={material.name}
                    onChange={e =>
                      handleUpdateMaterial(material.id, { name: e.target.value })
                    }
                    className="text-sm"
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <label htmlFor={`qty-${material.id}`} className="text-xs text-muted-foreground whitespace-nowrap">
                        Qty:
                      </label>
                      <Input
                        id={`qty-${material.id}`}
                        type="number"
                        min="1"
                        value={material.quantity}
                        onChange={e =>
                          handleUpdateMaterial(material.id, {
                            quantity: parseInt(e.target.value) || 1,
                          })
                        }
                        className="h-8 text-xs w-20"
                      />
                    </div>
                    <Select
                      value={material.type}
                      onValueChange={value =>
                        handleUpdateMaterial(material.id, {
                          type: value as Material['type'],
                        })
                      }
                    >
                      <SelectTrigger className="text-xs h-8 flex-1 sm:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consumable">Consumable</SelectItem>
                        <SelectItem value="reusable">Reusable</SelectItem>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="handout">Handout</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'flex-shrink-0 text-xs font-medium',
                    MATERIAL_TYPES[material.type].color
                  )}
                >
                  {MATERIAL_TYPES[material.type].label}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteMaterial(material.id)}
                  className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sr-only">Delete material</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        onClick={handleAddMaterial}
        variant="outline"
        size="sm"
        className="w-full gap-2 md:w-auto"
      >
        <Plus className="w-4 h-4" />
        Add Material
      </Button>
    </div>
  );
}
