'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import type { Student } from '@/lib/game/types';
import type { Assignment, StudentGrade, GradingCriteria } from '@/lib/game/grading';
import { calculateLetterGrade, gradeWithRubric } from '@/lib/game/grading';

interface AssignmentGraderProps {
  assignment: Assignment;
  student: Student;
  existingGrade?: StudentGrade;
  onSaveGrade: (grade: StudentGrade) => void;
  onCancel: () => void;
}

export function AssignmentGrader({
  assignment,
  student,
  existingGrade,
  onSaveGrade,
  onCancel,
}: AssignmentGraderProps) {
  const [rubricScores, setRubricScores] = useState<Record<string, number>>(
    existingGrade?.rubricScores || {}
  );
  const [manualPoints, setManualPoints] = useState<number>(
    existingGrade?.pointsEarned || 0
  );
  const [feedback, setFeedback] = useState<string>(existingGrade?.feedback || '');
  const [isLate, setIsLate] = useState<boolean>(existingGrade?.lateSubmission || false);
  const [isExcused, setIsExcused] = useState<boolean>(existingGrade?.excused || false);
  const [useRubric, setUseRubric] = useState<boolean>(!!assignment.rubric);

  const handleRubricScoreChange = (criteriaId: string, points: number) => {
    setRubricScores(prev => ({
      ...prev,
      [criteriaId]: points,
    }));
  };

  const calculateCurrentGrade = () => {
    if (useRubric && assignment.rubric) {
      try {
        return gradeWithRubric(assignment, rubricScores);
      } catch (err) {
        // Fall back to manual if rubric incomplete
        return {
          pointsEarned: manualPoints,
          maxPoints: assignment.maxPoints,
          percentage: (manualPoints / assignment.maxPoints) * 100,
          letterGrade: calculateLetterGrade((manualPoints / assignment.maxPoints) * 100),
        };
      }
    } else {
      const percentage = (manualPoints / assignment.maxPoints) * 100;
      return {
        pointsEarned: manualPoints,
        maxPoints: assignment.maxPoints,
        percentage,
        letterGrade: calculateLetterGrade(percentage),
      };
    }
  };

  const currentGrade = calculateCurrentGrade();

  const handleSave = () => {
    const grade: StudentGrade = {
      id: existingGrade?.id || crypto.randomUUID(),
      studentId: student.id,
      assignmentId: assignment.id,
      pointsEarned: currentGrade.pointsEarned,
      maxPoints: currentGrade.maxPoints,
      percentageScore: currentGrade.percentage,
      letterGrade: currentGrade.letterGrade,
      rubricScores: useRubric ? rubricScores : undefined,
      feedback,
      gradedDate: new Date().toISOString(),
      submitted: true,
      lateSubmission: isLate,
      excused: isExcused,
    };

    onSaveGrade(grade);
  };

  const getLetterGradeColor = (grade: string): string => {
    if (grade.startsWith('A')) return 'bg-green-500';
    if (grade.startsWith('B')) return 'bg-blue-500';
    if (grade.startsWith('C')) return 'bg-yellow-500';
    if (grade.startsWith('D')) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>
          Grade Assignment: {assignment.name}
        </CardTitle>
        <CardDescription>
          Student: {student.firstName} {student.lastName} •{' '}
          {assignment.type} • Max Points: {assignment.maxPoints}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Grade Display */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <div className="text-sm text-muted-foreground">Current Grade</div>
            <div className="flex items-center gap-3 mt-1">
              <Badge className={`${getLetterGradeColor(currentGrade.letterGrade)} text-lg px-3 py-1`}>
                {currentGrade.letterGrade}
              </Badge>
              <span className="text-2xl font-bold">
                {currentGrade.percentage.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">
                ({currentGrade.pointsEarned}/{currentGrade.maxPoints} points)
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isLate ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => setIsLate(!isLate)}
            >
              {isLate ? 'Late ⚠️' : 'On Time ✓'}
            </Button>
            <Button
              variant={isExcused ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setIsExcused(!isExcused)}
            >
              {isExcused ? 'Excused' : 'Not Excused'}
            </Button>
          </div>
        </div>

        {/* Student Info */}
        <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg text-sm">
          <div>
            <span className="text-muted-foreground">Academic Level:</span>{' '}
            <span className="font-medium">{student.academicLevel}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Mood:</span>{' '}
            <Badge variant="outline" className="capitalize">{student.mood}</Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Homework Quality:</span>{' '}
            <span className="font-medium">{student.homeworkQuality}</span>
          </div>
        </div>

        {/* Grading Method Toggle */}
        {assignment.rubric && (
          <div className="flex items-center gap-2">
            <Button
              variant={useRubric ? 'default' : 'outline'}
              onClick={() => setUseRubric(true)}
              size="sm"
            >
              Use Rubric
            </Button>
            <Button
              variant={!useRubric ? 'default' : 'outline'}
              onClick={() => setUseRubric(false)}
              size="sm"
            >
              Manual Points
            </Button>
          </div>
        )}

        {/* Rubric Grading */}
        {useRubric && assignment.rubric && (
          <div className="space-y-4">
            <h3 className="font-semibold">Rubric Criteria</h3>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-6">
                {assignment.rubric.map((criteria: GradingCriteria) => {
                  const currentScore = rubricScores[criteria.id] || 0;
                  const percentage = (currentScore / criteria.maxPoints) * 100;

                  return (
                    <div key={criteria.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">{criteria.name}</Label>
                          <p className="text-sm text-muted-foreground">{criteria.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {currentScore}/{criteria.maxPoints}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Weight: {criteria.weight}%
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Slider
                          value={[currentScore]}
                          onValueChange={([value]) => handleRubricScoreChange(criteria.id, value)}
                          max={criteria.maxPoints}
                          step={1}
                          className="w-full"
                        />
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Manual Grading */}
        {!useRubric && (
          <div className="space-y-2">
            <Label htmlFor="manual-points">Points Earned</Label>
            <div className="flex items-center gap-2">
              <Input
                id="manual-points"
                type="number"
                min={0}
                max={assignment.maxPoints}
                value={manualPoints}
                onChange={(e) => setManualPoints(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-muted-foreground">/ {assignment.maxPoints}</span>
              <Slider
                value={[manualPoints]}
                onValueChange={([value]) => setManualPoints(value)}
                max={assignment.maxPoints}
                step={0.5}
                className="flex-1"
              />
            </div>
          </div>
        )}

        {/* Feedback */}
        <div className="space-y-2">
          <Label htmlFor="feedback">Feedback</Label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide constructive feedback to the student..."
            rows={4}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFeedback('Excellent work! Shows strong understanding.')}
            >
              + Excellent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFeedback('Good work! Solid understanding demonstrated.')}
            >
              + Good
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFeedback('Needs improvement. Please see me for extra help.')}
            >
              + Needs Work
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFeedback('Great effort! Keep practicing these concepts.')}
            >
              + Encouraging
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isExcused}>
          {existingGrade ? 'Update Grade' : 'Save Grade'}
        </Button>
      </CardFooter>
    </Card>
  );
}
