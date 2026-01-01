'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudentGrid } from '@/components/students/StudentGrid';
import { StudentDetailModal } from '@/components/students/StudentDetailModal';
import { useGame } from '@/hooks/useGame';
import type { Student } from '@/lib/game/types';

export function StudentsPanel() {
  const { state } = useGame();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Students</h2>
        <p className="text-muted-foreground">
          View and manage your classroom of 15 students
        </p>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="compact">Compact View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <StudentGrid
            students={state.students}
            onStudentClick={handleStudentClick}
          />
        </TabsContent>

        <TabsContent value="compact" className="space-y-4">
          <StudentGrid
            students={state.students}
            onStudentClick={handleStudentClick}
            compact
          />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {state.students.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => handleStudentClick(student)}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-semibold text-primary">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div>
                        <div className="font-medium">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {student.primaryTrait} • {student.learningStyle}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Grade: </span>
                        <span className="font-medium">{student.academicScore}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Energy: </span>
                        <span className="font-medium">{student.energy}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <StudentDetailModal
        student={selectedStudent}
        allStudents={state.students}
        open={showStudentModal}
        onOpenChange={setShowStudentModal}
      />
    </div>
  );
}
