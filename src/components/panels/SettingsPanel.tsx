'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useGame } from '@/hooks/useGame';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, RotateCcw } from 'lucide-react';

export function SettingsPanel() {
  const { state, newGame, toggleAutoSave } = useGame();

  const handleResetGame = () => {
    if (window.confirm('Are you sure you want to start a new game? This will reset all progress.')) {
      newGame();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage game preferences and options
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Game Settings</CardTitle>
            <CardDescription>
              Configure how the game saves and behaves
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-save">Auto-Save</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save game progress every minute
                </p>
              </div>
              <Switch
                id="auto-save"
                checked={state.autoSaveEnabled}
                onCheckedChange={toggleAutoSave}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Difficulty Level</Label>
                <p className="text-sm text-muted-foreground">
                  Coming soon: Adjust game challenge
                </p>
              </div>
              <Badge variant="outline">Normal</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sound Effects</Label>
                <p className="text-sm text-muted-foreground">
                  Coming soon: Toggle game sounds
                </p>
              </div>
              <Switch disabled />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Animations</Label>
                <p className="text-sm text-muted-foreground">
                  Coming soon: Control UI animations
                </p>
              </div>
              <Switch disabled defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Game Information</CardTitle>
            <CardDescription>
              Current game status and statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Current Week</Label>
                <p className="text-2xl font-bold">Week {state.turn.week}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Current Day</Label>
                <p className="text-2xl font-bold capitalize">{state.turn.dayOfWeek}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Total Students</Label>
                <p className="text-2xl font-bold">{state.students.length}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">School Year</Label>
                <p className="text-2xl font-bold">{state.schoolYear.startDate.getFullYear()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that affect your game
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                These actions cannot be undone. Make sure to save your game before proceeding.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <div className="space-y-0.5">
                <Label>Reset Game</Label>
                <p className="text-sm text-muted-foreground">
                  Start a new game with a fresh classroom
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleResetGame}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>
              Information about Classroom Simulator
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm font-medium">1.0.0-alpha</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Game Mode</span>
              <span className="text-sm font-medium">5th Grade Teacher</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Build</span>
              <span className="text-sm font-medium">MVP Phase 1-6</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
