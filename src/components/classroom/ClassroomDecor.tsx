'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Student } from '@/lib/game/types';

export type ClassroomTheme =
  | 'modern'
  | 'nature'
  | 'space'
  | 'ocean'
  | 'rainbow'
  | 'minimalist';

export type BulletinBoardType =
  | 'student-work'
  | 'word-wall'
  | 'calendar'
  | 'behavior-chart'
  | 'achievement-wall';

export interface ClassroomDecoration {
  theme: ClassroomTheme;
  bulletinBoards: BulletinBoardType[];
  achievements: Achievement[];
  posters: string[];
}

export interface Achievement {
  id: string;
  studentId: string;
  title: string;
  description: string;
  icon: string;
  date: string;
}

interface ClassroomDecorProps {
  students: Student[];
  currentDecor?: ClassroomDecoration;
  budget: number;
  onDecorChange?: (decor: ClassroomDecoration) => void;
}

const THEMES: Record<
  ClassroomTheme,
  { name: string; description: string; colors: string[]; cost: number; emoji: string }
> = {
  modern: {
    name: 'Modern Minimalist',
    description: 'Clean lines, neutral tones, focus-friendly',
    colors: ['#FFFFFF', '#F5F5F5', '#333333'],
    cost: 0,
    emoji: '🏢',
  },
  nature: {
    name: 'Nature Explorer',
    description: 'Green plants, wood tones, calming atmosphere',
    colors: ['#8BC34A', '#4CAF50', '#795548'],
    cost: 50,
    emoji: '🌿',
  },
  space: {
    name: 'Space Adventure',
    description: 'Stars, planets, cosmic inspiration',
    colors: ['#1A237E', '#283593', '#FFC107'],
    cost: 75,
    emoji: '🚀',
  },
  ocean: {
    name: 'Ocean Depths',
    description: 'Blue hues, marine life, peaceful vibes',
    colors: ['#006064', '#0097A7', '#4DD0E1'],
    cost: 60,
    emoji: '🌊',
  },
  rainbow: {
    name: 'Rainbow Bright',
    description: 'Colorful, energetic, creative energy',
    colors: ['#FF5722', '#FFC107', '#4CAF50', '#2196F3', '#9C27B0'],
    cost: 80,
    emoji: '🌈',
  },
  minimalist: {
    name: 'Zen Minimalist',
    description: 'Simplicity, order, maximum focus',
    colors: ['#FAFAFA', '#EEEEEE', '#BDBDBD'],
    cost: 0,
    emoji: '☯️',
  },
};

const BULLETIN_BOARDS: Record<
  BulletinBoardType,
  { name: string; description: string; benefit: string; cost: number }
> = {
  'student-work': {
    name: 'Student Work Display',
    description: 'Showcase excellent student projects',
    benefit: '+5 engagement for featured students',
    cost: 20,
  },
  'word-wall': {
    name: 'Word Wall',
    description: 'Vocabulary building and reference',
    benefit: '+3 academic level for reading learners',
    cost: 15,
  },
  calendar: {
    name: 'Class Calendar',
    description: 'Track events and important dates',
    benefit: '+5% parent satisfaction',
    cost: 10,
  },
  'behavior-chart': {
    name: 'Behavior Chart',
    description: 'Track and reward positive behavior',
    benefit: '-2 behavior incidents per week',
    cost: 25,
  },
  'achievement-wall': {
    name: 'Achievement Wall',
    description: 'Celebrate student accomplishments',
    benefit: '+10 mood for recognized students',
    cost: 30,
  },
};

const SAMPLE_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    studentId: 'student-1',
    title: 'Math Wizard',
    description: 'Perfect score on multiplication test',
    icon: '🧮',
    date: '2024-01-15',
  },
  {
    id: 'ach-2',
    studentId: 'student-2',
    title: 'Reading Champion',
    description: 'Read 20 books this month',
    icon: '📚',
    date: '2024-01-16',
  },
  {
    id: 'ach-3',
    studentId: 'student-3',
    title: 'Kindness Award',
    description: 'Helped classmates all week',
    icon: '❤️',
    date: '2024-01-17',
  },
];

export function ClassroomDecor({
  students,
  currentDecor,
  budget,
  onDecorChange,
}: ClassroomDecorProps) {
  const [theme, setTheme] = useState<ClassroomTheme>(currentDecor?.theme || 'modern');
  const [bulletinBoards, setBulletinBoards] = useState<BulletinBoardType[]>(
    currentDecor?.bulletinBoards || []
  );
  const [achievements, setAchievements] = useState<Achievement[]>(
    currentDecor?.achievements || SAMPLE_ACHIEVEMENTS
  );

  const totalCost = THEMES[theme].cost + bulletinBoards.reduce((sum, board) => sum + BULLETIN_BOARDS[board].cost, 0);
  const canAfford = totalCost <= budget;

  const handleThemeChange = (newTheme: string) => {
    if (newTheme && newTheme in THEMES) {
      setTheme(newTheme as ClassroomTheme);
    }
  };

  const handleBulletinToggle = (boardType: BulletinBoardType) => {
    setBulletinBoards((prev) => {
      if (prev.includes(boardType)) {
        return prev.filter((b) => b !== boardType);
      }
      return [...prev, boardType];
    });
  };

  const handleApplyChanges = () => {
    if (canAfford && onDecorChange) {
      onDecorChange({
        theme,
        bulletinBoards,
        achievements,
        posters: [],
      });
    }
  };

  const handleAddAchievement = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const newAchievement: Achievement = {
      id: `ach-${Date.now()}`,
      studentId,
      title: 'Star Student',
      description: 'Excellent work this week!',
      icon: '⭐',
      date: new Date().toISOString().split('T')[0],
    };

    setAchievements((prev) => [newAchievement, ...prev]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Classroom Decoration</span>
          <Badge variant={canAfford ? 'default' : 'destructive'}>
            Budget: ${budget} / Cost: ${totalCost}
          </Badge>
        </CardTitle>
        <CardDescription>
          Customize your classroom to boost student engagement and create an inspiring learning environment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="theme">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="boards">Bulletin Boards</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Theme Selection */}
          <TabsContent value="theme" className="space-y-4">
            <div className="grid gap-3">
              {Object.entries(THEMES).map(([key, themeData]) => {
                const isSelected = theme === key;
                return (
                  <Card
                    key={key}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-primary' : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleThemeChange(key)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{themeData.emoji}</span>
                            <h4 className="font-semibold">{themeData.name}</h4>
                            <Badge variant="outline">${themeData.cost}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {themeData.description}
                          </p>
                          <div className="flex gap-1">
                            {themeData.colors.map((color, idx) => (
                              <div
                                key={idx}
                                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                        {isSelected && (
                          <Badge className="bg-primary">Selected</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Bulletin Boards */}
          <TabsContent value="boards" className="space-y-4">
            <div className="grid gap-3">
              {Object.entries(BULLETIN_BOARDS).map(([key, board]) => {
                const isSelected = bulletinBoards.includes(key as BulletinBoardType);
                return (
                  <Card
                    key={key}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-primary' : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleBulletinToggle(key as BulletinBoardType)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{board.name}</h4>
                            <Badge variant="outline">${board.cost}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {board.description}
                          </p>
                          <p className="text-xs font-medium text-green-600 dark:text-green-400">
                            {board.benefit}
                          </p>
                        </div>
                        {isSelected && (
                          <Badge className="bg-primary">Added</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Achievement Wall */}
          <TabsContent value="achievements" className="space-y-4">
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Recognize student accomplishments to boost morale and motivation.
              </div>

              {/* Add achievement controls */}
              <div className="border-b pb-3">
                <h4 className="text-sm font-semibold mb-2">Award Achievement:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {students.slice(0, 6).map((student) => (
                    <Button
                      key={student.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddAchievement(student.id)}
                      className="justify-start"
                    >
                      <span className="truncate">
                        {student.firstName} {student.lastName[0]}.
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Current achievements */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Current Achievements:</h4>
                <div className="grid gap-2">
                  {achievements.slice(0, 8).map((achievement) => {
                    const student = students.find((s) => s.id === achievement.studentId);
                    return (
                      <Card key={achievement.id} className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{achievement.icon}</div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-sm">{achievement.title}</h5>
                              <p className="text-xs text-muted-foreground">
                                {student?.firstName} {student?.lastName} • {achievement.description}
                              </p>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {new Date(achievement.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Apply button */}
        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <div className="text-sm">
            <div className="font-medium">Total Cost: ${totalCost}</div>
            <div className="text-muted-foreground">Remaining: ${budget - totalCost}</div>
          </div>
          <Button onClick={handleApplyChanges} disabled={!canAfford}>
            {canAfford ? 'Apply Changes' : 'Insufficient Budget'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
