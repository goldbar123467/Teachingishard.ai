'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Student } from '@/lib/game/types';
import { Calendar, MessageSquare, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface ConferenceTopic {
  id: string;
  title: string;
  category: 'academic' | 'behavioral' | 'social' | 'praise';
  description: string;
  impact: number; // -10 to +10 parent satisfaction change
}

interface ParentConcern {
  id: string;
  concern: string;
  severity: 'low' | 'medium' | 'high';
  response?: string;
}

interface Conference {
  studentId: string;
  date: string;
  topics: ConferenceTopic[];
  parentConcerns: ParentConcern[];
  outcome: 'positive' | 'neutral' | 'negative' | null;
  satisfactionChange: number;
}

interface ParentConferenceProps {
  students: Student[];
  parentSatisfaction: number;
  onConferenceComplete?: (conference: Conference) => void;
}

const CONFERENCE_TOPICS: ConferenceTopic[] = [
  {
    id: 'academic-progress',
    title: 'Academic Progress',
    category: 'academic',
    description: 'Discuss recent test scores and overall academic performance',
    impact: 5,
  },
  {
    id: 'academic-struggles',
    title: 'Areas for Improvement',
    category: 'academic',
    description: 'Address subjects where student needs extra support',
    impact: -3,
  },
  {
    id: 'behavior-positive',
    title: 'Positive Behavior',
    category: 'praise',
    description: 'Highlight good behavior and citizenship',
    impact: 8,
  },
  {
    id: 'behavior-issues',
    title: 'Behavioral Concerns',
    category: 'behavioral',
    description: 'Discuss behavior incidents and redirect strategies',
    impact: -5,
  },
  {
    id: 'social-skills',
    title: 'Social Development',
    category: 'social',
    description: 'Talk about friendships and peer interactions',
    impact: 3,
  },
  {
    id: 'homework',
    title: 'Homework Completion',
    category: 'academic',
    description: 'Review homework habits and completion rates',
    impact: 2,
  },
  {
    id: 'special-talents',
    title: 'Special Talents',
    category: 'praise',
    description: 'Celebrate unique strengths and abilities',
    impact: 7,
  },
];

function generateParentConcerns(student: Student): ParentConcern[] {
  const concerns: ParentConcern[] = [];

  if (student.academicLevel < 50) {
    concerns.push({
      id: 'low-grades',
      concern: `Is ${student.firstName} struggling with the material? What can we do at home?`,
      severity: 'high',
    });
  }

  if (student.behaviorIncidents > 2) {
    concerns.push({
      id: 'behavior',
      concern: `We heard ${student.firstName} has had some behavior issues. Can you explain?`,
      severity: student.behaviorIncidents > 5 ? 'high' : 'medium',
    });
  }

  if (student.friendIds.length === 0) {
    concerns.push({
      id: 'friends',
      concern: `${student.firstName} doesn't talk much about friends. Is everything okay socially?`,
      severity: 'medium',
    });
  }

  if (!student.homeworkCompleted && student.academicLevel > 60) {
    concerns.push({
      id: 'homework',
      concern: `${student.firstName} is bright but hasn't been doing homework. Why?`,
      severity: 'medium',
    });
  }

  if (student.mood === 'upset' || student.mood === 'frustrated') {
    concerns.push({
      id: 'mood',
      concern: `${student.firstName} seems unhappy lately. Is something bothering them at school?`,
      severity: 'high',
    });
  }

  return concerns;
}

function ParentConferenceDialog({
  student,
  onComplete,
}: {
  student: Student;
  onComplete: (conference: Conference) => void;
}) {
  const [selectedTopics, setSelectedTopics] = useState<ConferenceTopic[]>([]);
  const [concerns] = useState<ParentConcern[]>(() => generateParentConcerns(student));
  const [answeredConcerns, setAnsweredConcerns] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);

  const handleTopicToggle = (topic: ConferenceTopic) => {
    setSelectedTopics((prev) => {
      const exists = prev.find((t) => t.id === topic.id);
      if (exists) {
        return prev.filter((t) => t.id !== topic.id);
      }
      return [...prev, topic];
    });
  };

  const handleAnswerConcern = (concernId: string) => {
    setAnsweredConcerns((prev) => new Set([...prev, concernId]));
  };

  const handleComplete = () => {
    const totalImpact = selectedTopics.reduce((sum, t) => sum + t.impact, 0);
    const concernsAnswered = answeredConcerns.size;
    const concernBonus = concernsAnswered * 2;
    const finalImpact = totalImpact + concernBonus;

    const outcome: Conference['outcome'] =
      finalImpact > 5 ? 'positive' : finalImpact < -3 ? 'negative' : 'neutral';

    const conference: Conference = {
      studentId: student.id,
      date: new Date().toISOString(),
      topics: selectedTopics,
      parentConcerns: concerns,
      outcome,
      satisfactionChange: finalImpact,
    };

    onComplete(conference);
    setOpen(false);
    setSelectedTopics([]);
    setAnsweredConcerns(new Set());
  };

  const projectedImpact = selectedTopics.reduce((sum, t) => sum + t.impact, 0) + answeredConcerns.size * 2;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Calendar className="w-4 h-4 mr-1.5" />
          Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            Parent Conference: {student.firstName} {student.lastName}
          </DialogTitle>
          <DialogDescription>
            Select topics to discuss and address parent concerns. Each choice impacts parent satisfaction.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          <div className="space-y-6">
            {/* Student snapshot */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Academic Level:</span>
                  <span className="ml-2 font-semibold">{student.academicLevel}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Behavior Incidents:</span>
                  <span className="ml-2 font-semibold">{student.behaviorIncidents}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Mood:</span>
                  <span className="ml-2 font-semibold capitalize">{student.mood}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Friends:</span>
                  <span className="ml-2 font-semibold">{student.friendIds.length}</span>
                </div>
              </div>
            </div>

            {/* Parent concerns */}
            {concerns.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Parent Concerns
                </h4>
                <div className="space-y-2">
                  {concerns.map((concern) => (
                    <Card
                      key={concern.id}
                      className={answeredConcerns.has(concern.id) ? 'opacity-60' : ''}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <Badge
                              variant={
                                concern.severity === 'high'
                                  ? 'destructive'
                                  : concern.severity === 'medium'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className="mb-2"
                            >
                              {concern.severity}
                            </Badge>
                            <p className="text-sm">{concern.concern}</p>
                          </div>
                          <Button
                            size="sm"
                            variant={answeredConcerns.has(concern.id) ? 'secondary' : 'default'}
                            onClick={() => handleAnswerConcern(concern.id)}
                            disabled={answeredConcerns.has(concern.id)}
                          >
                            {answeredConcerns.has(concern.id) ? 'Answered' : 'Address'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Discussion topics */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Discussion Topics
              </h4>
              <div className="grid gap-2">
                {CONFERENCE_TOPICS.map((topic) => {
                  const isSelected = selectedTopics.find((t) => t.id === topic.id);
                  return (
                    <Card
                      key={topic.id}
                      className={`cursor-pointer transition-all ${
                        isSelected ? 'ring-2 ring-primary' : 'hover:border-primary/50'
                      }`}
                      onClick={() => handleTopicToggle(topic)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-sm">{topic.title}</h5>
                              <Badge variant="outline" className="text-xs">
                                {topic.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{topic.description}</p>
                          </div>
                          <div className="flex items-center gap-1 text-sm font-semibold">
                            {topic.impact > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                            <span
                              className={topic.impact > 0 ? 'text-green-600' : 'text-red-600'}
                            >
                              {topic.impact > 0 ? '+' : ''}
                              {topic.impact}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Projected outcome */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Projected Impact:</span>
                <div className="flex items-center gap-2">
                  {projectedImpact > 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : projectedImpact < 0 ? (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  ) : null}
                  <span
                    className={`text-lg font-bold ${
                      projectedImpact > 5
                        ? 'text-green-600'
                        : projectedImpact < -3
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {projectedImpact > 0 ? '+' : ''}
                    {projectedImpact} satisfaction
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleComplete} disabled={selectedTopics.length === 0}>
            Complete Conference
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ParentConference({
  students,
  parentSatisfaction,
  onConferenceComplete,
}: ParentConferenceProps) {
  const [completedConferences, setCompletedConferences] = useState<Conference[]>([]);

  const handleComplete = (conference: Conference) => {
    setCompletedConferences((prev) => [conference, ...prev]);
    if (onConferenceComplete) {
      onConferenceComplete(conference);
    }
  };

  // Students who need conferences (low grades, behavior issues, etc.)
  const priorityStudents = students
    .filter(
      (s) =>
        s.academicLevel < 50 ||
        s.behaviorIncidents > 3 ||
        s.mood === 'upset' ||
        s.friendIds.length === 0
    )
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Parent Conferences</span>
          <Badge variant={parentSatisfaction > 70 ? 'default' : 'destructive'}>
            Satisfaction: {parentSatisfaction}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Schedule conferences to address concerns and build parent trust. Focus on students needing
            extra attention.
          </div>

          {/* Priority students */}
          {priorityStudents.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Priority Students:</h4>
              <div className="space-y-2">
                {priorityStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {student.academicLevel < 50 && 'Low grades • '}
                        {student.behaviorIncidents > 3 && 'Behavior issues • '}
                        {student.mood === 'upset' && 'Unhappy • '}
                        {student.friendIds.length === 0 && 'No friends'}
                      </div>
                    </div>
                    <ParentConferenceDialog student={student} onComplete={handleComplete} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All students */}
          <div>
            <h4 className="text-sm font-semibold mb-2">All Students:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
                >
                  <span className="truncate">
                    {student.firstName} {student.lastName[0]}.
                  </span>
                  <ParentConferenceDialog student={student} onComplete={handleComplete} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent conferences */}
          {completedConferences.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-2">Recent Conferences:</h4>
              <div className="space-y-2">
                {completedConferences.slice(0, 3).map((conf, idx) => {
                  const student = students.find((s) => s.id === conf.studentId);
                  return (
                    <div key={idx} className="text-xs p-2 bg-muted/30 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {student?.firstName} {student?.lastName}
                        </span>
                        <Badge
                          variant={
                            conf.outcome === 'positive'
                              ? 'default'
                              : conf.outcome === 'negative'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {conf.outcome}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground mt-1">
                        Topics: {conf.topics.map((t) => t.title).join(', ')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
