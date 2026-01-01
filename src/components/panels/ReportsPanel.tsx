'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClassInsights } from '@/components/dashboard/ClassInsights';
import { useGame, useClassStats } from '@/hooks/useGame';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function ReportsPanel() {
  const { state } = useGame();
  const classStats = useClassStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Class Reports & Analytics</h2>
        <p className="text-muted-foreground">
          Track student progress, class performance, and teaching effectiveness
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Class Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{classStats.classAverage}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall academic performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round((classStats.presentCount / state.students.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {classStats.presentCount} of {state.students.length} present
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Class Energy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{classStats.avgEnergy}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average student energy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Happy Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{classStats.happyCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Students with positive mood
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClassInsights
              students={state.students}
              selectedLesson={state.turn.selectedLesson}
              selectedMethod={state.turn.selectedMethod}
              showPredictions={false}
            />

            <Card>
              <CardHeader>
                <CardTitle>Student Distribution</CardTitle>
                <CardDescription>
                  Breakdown of students by learning style and traits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Learning Styles</h4>
                  <div className="flex flex-wrap gap-2">
                    {['visual', 'auditory', 'kinesthetic'].map((style) => {
                      const count = state.students.filter(s => s.learningStyle === style).length;
                      return (
                        <Badge key={style} variant="outline" className="capitalize">
                          {style}: {count}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Primary Traits</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(state.students.map(s => s.primaryTrait))).map((trait) => {
                      const count = state.students.filter(s => s.primaryTrait === trait).length;
                      return (
                        <Badge key={trait} variant="secondary" className="capitalize">
                          {trait}: {count}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Performance</CardTitle>
              <CardDescription>Top and struggling students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                    Top Performers
                  </h4>
                  <div className="space-y-2">
                    {state.students
                      .sort((a, b) => b.academicLevel - a.academicLevel)
                      .slice(0, 5)
                      .map((student) => (
                        <div key={student.id} className="flex justify-between items-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/10">
                          <span className="text-sm font-medium">
                            {student.firstName} {student.lastName}
                          </span>
                          <Badge variant="outline" className="bg-emerald-100 dark:bg-emerald-900/30">
                            {student.academicLevel}%
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-amber-600">
                    <TrendingDown className="w-4 h-4" />
                    Needs Support
                  </h4>
                  <div className="space-y-2">
                    {state.students
                      .sort((a, b) => a.academicScore - b.academicScore)
                      .slice(0, 5)
                      .map((student) => (
                        <div key={student.id} className="flex justify-between items-center p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10">
                          <span className="text-sm font-medium">
                            {student.firstName} {student.lastName}
                          </span>
                          <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/30">
                            {student.academicScore}%
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Behavioral Insights</CardTitle>
              <CardDescription>Mood and engagement tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">Mood Distribution</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['excited', 'happy', 'neutral', 'bored', 'frustrated', 'upset'].map((mood) => {
                      const count = state.students.filter(s => s.mood === mood).length;
                      return (
                        <div key={mood} className="p-3 rounded-lg border text-center">
                          <div className="text-2xl mb-1">
                            {mood === 'excited' && '🤩'}
                            {mood === 'happy' && '😊'}
                            {mood === 'neutral' && '😐'}
                            {mood === 'bored' && '😴'}
                            {mood === 'frustrated' && '😤'}
                            {mood === 'upset' && '😢'}
                          </div>
                          <div className="text-xs capitalize text-muted-foreground">{mood}</div>
                          <div className="text-lg font-bold">{count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Homework Completion</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                          style={{
                            width: `${(state.students.filter(s => s.homeworkCompleted).length / state.students.length) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {state.students.filter(s => s.homeworkCompleted).length}/{state.students.length}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
