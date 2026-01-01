'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Student } from '@/lib/game/types';
import type { Gradebook as GradebookType, Assignment, StudentGrade, AssignmentType, LetterGrade } from '@/lib/game/grading';
import {
  calculateOverallGrade,
  getStudentGrades,
  getAssignmentGrades,
  calculateAssignmentAverage,
  getGradeDistribution,
} from '@/lib/game/grading';

interface GradebookProps {
  gradebook: GradebookType;
  students: Student[];
  onGradeClick?: (studentId: string, assignmentId: string) => void;
  onAssignmentClick?: (assignmentId: string) => void;
}

const getLetterGradeColor = (grade: LetterGrade): string => {
  if (grade.startsWith('A')) return 'bg-green-500';
  if (grade.startsWith('B')) return 'bg-blue-500';
  if (grade.startsWith('C')) return 'bg-yellow-500';
  if (grade.startsWith('D')) return 'bg-orange-500';
  return 'bg-red-500';
};

export function Gradebook({ gradebook, students, onGradeClick, onAssignmentClick }: GradebookProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'student' | 'assignment'>('student');

  // Filter assignments by type
  const assignmentsByType = useMemo(() => {
    const grouped = new Map<AssignmentType, Assignment[]>();
    for (const assignment of gradebook.assignments) {
      if (!grouped.has(assignment.type)) {
        grouped.set(assignment.type, []);
      }
      grouped.get(assignment.type)!.push(assignment);
    }
    return grouped;
  }, [gradebook.assignments]);

  // Calculate student overall grades
  const studentOverallGrades = useMemo(() => {
    return students.map(student => ({
      student,
      grade: calculateOverallGrade(student.id, gradebook),
    }));
  }, [students, gradebook]);

  // Filter students
  const filteredStudents = useMemo(() => {
    if (selectedStudent === 'all') return studentOverallGrades;
    return studentOverallGrades.filter(s => s.student.id === selectedStudent);
  }, [studentOverallGrades, selectedStudent]);

  // Student view table
  const renderStudentView = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select student" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            {students.map(s => (
              <SelectItem key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Overall Grade</TableHead>
              <TableHead>Percentage</TableHead>
              {gradebook.assignments.slice(0, 5).map(assignment => (
                <TableHead key={assignment.id} className="text-center">
                  {assignment.name}
                </TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map(({ student, grade }) => {
              const studentGrades = getStudentGrades(gradebook, student.id);
              return (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.firstName} {student.lastName}
                  </TableCell>
                  <TableCell>
                    <Badge className={getLetterGradeColor(grade.letterGrade)}>
                      {grade.letterGrade}
                    </Badge>
                  </TableCell>
                  <TableCell>{grade.percentage.toFixed(1)}%</TableCell>
                  {gradebook.assignments.slice(0, 5).map(assignment => {
                    const studentGrade = studentGrades.find(g => g.assignmentId === assignment.id);
                    return (
                      <TableCell key={assignment.id} className="text-center">
                        {studentGrade ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onGradeClick?.(student.id, assignment.id)}
                            className="h-8 px-2"
                          >
                            <Badge
                              variant="outline"
                              className={studentGrade.submitted ? '' : 'opacity-50'}
                            >
                              {studentGrade.submitted ? studentGrade.letterGrade : 'Not Submitted'}
                            </Badge>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStudent(student.id)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  // Assignment view
  const renderAssignmentView = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select assignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignments</SelectItem>
            {gradebook.assignments.map(a => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {(selectedAssignment === 'all'
          ? gradebook.assignments
          : gradebook.assignments.filter(a => a.id === selectedAssignment)
        ).map(assignment => {
          const average = calculateAssignmentAverage(gradebook, assignment.id);
          const distribution = getGradeDistribution(gradebook, assignment.id);
          const grades = getAssignmentGrades(gradebook, assignment.id);
          const submitted = grades.filter(g => g.submitted).length;
          const total = students.length;

          return (
            <Card key={assignment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{assignment.name}</CardTitle>
                    <CardDescription>
                      {assignment.type} • {assignment.subject} • Due:{' '}
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{average.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">
                      {submitted}/{total} submitted
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Grade Distribution */}
                  <div>
                    <h4 className="font-medium mb-2">Grade Distribution</h4>
                    <div className="flex gap-1">
                      {(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'] as LetterGrade[]).map(
                        letterGrade => {
                          const count = distribution[letterGrade];
                          const percentage = total > 0 ? (count / total) * 100 : 0;
                          return (
                            <div
                              key={letterGrade}
                              className="flex-1 text-center"
                              title={`${letterGrade}: ${count} students (${percentage.toFixed(1)}%)`}
                            >
                              <div
                                className={`${getLetterGradeColor(letterGrade)} text-white text-xs py-1 rounded-t`}
                              >
                                {count}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {letterGrade}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Student Grades */}
                  <div>
                    <h4 className="font-medium mb-2">Student Grades</h4>
                    <div className="space-y-2">
                      {students.slice(0, 5).map(student => {
                        const grade = grades.find(g => g.studentId === student.id);
                        return (
                          <div key={student.id} className="flex items-center justify-between">
                            <span className="text-sm">
                              {student.firstName} {student.lastName}
                            </span>
                            {grade ? (
                              <div className="flex items-center gap-2">
                                <Badge className={getLetterGradeColor(grade.letterGrade)}>
                                  {grade.letterGrade}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {grade.pointsEarned}/{grade.maxPoints}
                                </span>
                              </div>
                            ) : (
                              <Badge variant="outline">Not Graded</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onAssignmentClick?.(assignment.id)}
                  >
                    View Full Assignment Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gradebook</CardTitle>
        <CardDescription>View and manage student grades and assignments</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'student' | 'assignment')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">By Student</TabsTrigger>
            <TabsTrigger value="assignment">By Assignment</TabsTrigger>
          </TabsList>
          <TabsContent value="student" className="mt-4">
            {renderStudentView()}
          </TabsContent>
          <TabsContent value="assignment" className="mt-4">
            {renderAssignmentView()}
          </TabsContent>
        </Tabs>

        {/* Category Weights Display */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium mb-3">Grading Weights</h4>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {Object.entries(gradebook.weights).map(([type, weight]) => (
              <div key={type} className="text-center">
                <div className="text-2xl font-bold text-primary">{weight}%</div>
                <div className="text-xs text-muted-foreground capitalize">
                  {type.replace('-', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
