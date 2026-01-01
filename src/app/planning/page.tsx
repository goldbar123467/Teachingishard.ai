'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BookOpen,
  Plus,
  Clock,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ObjectivesEditor, type Objective } from '@/components/planning/ObjectivesEditor';
import { MaterialsList, type Material } from '@/components/planning/MaterialsList';
import { DurationValidator } from '@/components/planning/DurationValidator';
import { LessonPlanCard, type LessonPlan } from '@/components/planning/LessonPlanCard';
import { TemplateGallery, type Template } from '@/components/planning/TemplateGallery';
import { LessonPlansSidebar } from '@/components/planning/LessonPlansSidebar';
import { SchedulePanel } from '@/components/planning/SchedulePanel';

// Mock data for demo
const MOCK_LESSON_PLANS: LessonPlan[] = [
  {
    id: '1',
    name: 'Fractions Fundamentals',
    subject: 'math',
    duration: 45,
    activities: 3,
    teachingMethod: 'Direct Instruction + Practice',
    description: 'Introduction to fractions using visual models and manipulatives',
  },
  {
    id: '2',
    name: 'Book Club Discussion',
    subject: 'reading',
    duration: 50,
    activities: 4,
    teachingMethod: 'Cooperative Learning',
    description: 'Small group discussions about assigned chapter readings',
  },
  {
    id: '3',
    name: 'Ecosystem Exploration',
    subject: 'science',
    duration: 55,
    activities: 5,
    teachingMethod: 'Hands-On Inquiry',
    description: 'Interactive exploration of local ecosystem using outdoor observations',
  },
  {
    id: '4',
    name: 'Poetry Analysis Workshop',
    subject: 'reading',
    duration: 40,
    activities: 3,
    teachingMethod: 'Socratic Seminar',
    description: 'Deep dive into poetic devices and literary analysis techniques',
  },
  {
    id: '5',
    name: 'Division Practice Problems',
    subject: 'math',
    duration: 35,
    activities: 2,
    teachingMethod: 'Stations Rotation',
    description: 'Multi-digit division with real-world applications',
  },
];

const MOCK_TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'Basic Lecture + Practice',
    subject: 'math',
    description: 'Traditional lecture-based lesson with guided practice problems',
    duration: 45,
    activities: 2,
    difficulty: 1,
  },
  {
    id: 't2',
    name: 'Literature Circle',
    subject: 'reading',
    description: 'Student-led discussion groups with assigned reading roles',
    duration: 50,
    activities: 4,
    difficulty: 2,
  },
  {
    id: 't3',
    name: 'Science Lab Experiment',
    subject: 'science',
    description: 'Hands-on lab with hypothesis, procedure, and data recording',
    duration: 60,
    activities: 6,
    difficulty: 3,
  },
  {
    id: 't4',
    name: 'Art Project Creation',
    subject: 'art',
    description: 'Open-ended creative project with student choice elements',
    duration: 55,
    activities: 3,
    difficulty: 2,
  },
  {
    id: 't5',
    name: 'Map Skills Workshop',
    subject: 'social-studies',
    description: 'Interactive map-based learning with case studies',
    duration: 45,
    activities: 4,
    difficulty: 1,
  },
  {
    id: 't6',
    name: 'PE Game Tournament',
    subject: 'pe',
    description: 'Structured game activity with skill development focus',
    duration: 45,
    activities: 2,
    difficulty: 1,
  },
];

interface CreateFormState {
  name: string;
  subject: LessonPlan['subject'];
  teachingMethod: string;
  duration: number;
  objectives: Objective[];
  materials: Material[];
}

interface ScheduledLesson {
  id: string;
  lessonPlanId: string;
  lessonName: string;
  subject: string;
  duration: number;
  dayOfWeek: number;
  timeSlot: string;
}

const INITIAL_FORM_STATE: CreateFormState = {
  name: '',
  subject: 'math',
  teachingMethod: '',
  duration: 45,
  objectives: [],
  materials: [],
};

const TEACHING_METHODS = [
  'Direct Instruction',
  'Cooperative Learning',
  'Hands-On Inquiry',
  'Project-Based Learning',
  'Flipped Classroom',
  'Socratic Seminar',
  'Stations Rotation',
];

export default function PlanningPage() {
  const [formState, setFormState] = useState<CreateFormState>(INITIAL_FORM_STATE);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>(MOCK_LESSON_PLANS);
  const [scheduledLessons, setScheduledLessons] = useState<ScheduledLesson[]>([]);
  const [activeTab, setActiveTab] = useState('schedule');
  const [filterSubject, setFilterSubject] = useState('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCreateLesson = () => {
    if (!formState.name.trim()) {
      alert('Please enter a lesson name');
      return;
    }
    if (!formState.teachingMethod) {
      alert('Please select a teaching method');
      return;
    }

    const newPlan: LessonPlan = {
      id: `plan-${Date.now()}`,
      name: formState.name,
      subject: formState.subject,
      teachingMethod: formState.teachingMethod,
      duration: formState.duration,
      activities: formState.objectives.length,
      description: `${formState.objectives.length} learning objectives · ${formState.materials.length} materials`,
    };

    setLessonPlans([...lessonPlans, newPlan]);
    setFormState(INITIAL_FORM_STATE);
    setToastMessage(`Created "${newPlan.name}" successfully!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeletePlan = (id: string) => {
    const plan = lessonPlans.find(p => p.id === id);
    // Remove scheduled instances
    setScheduledLessons(scheduledLessons.filter(l => l.lessonPlanId !== id));
    setLessonPlans(lessonPlans.filter(plan => plan.id !== id));
    setToastMessage(`Deleted "${plan?.name}" and its scheduled instances`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUseTemplate = (template: Template) => {
    setFormState({
      ...INITIAL_FORM_STATE,
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      subject: template.subject,
      teachingMethod: TEACHING_METHODS[0],
      duration: template.duration,
    });
    setActiveTab('create');
  };

  const handleLessonAssigned = (
    lessonName: string,
    dayOfWeek: number,
    timeSlot: string,
    duration: number
  ) => {
    const lessonPlan = lessonPlans.find(p => p.name === lessonName);
    if (!lessonPlan) return;

    const newSchedule: ScheduledLesson = {
      id: `scheduled-${Date.now()}`,
      lessonPlanId: lessonPlan.id,
      lessonName,
      subject: lessonPlan.subject,
      duration,
      dayOfWeek,
      timeSlot,
    };

    setScheduledLessons([...scheduledLessons, newSchedule]);
    setToastMessage(`Scheduled "${lessonName}" on ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][dayOfWeek]} at ${timeSlot}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLessonUnassigned = (dayOfWeek: number, timeSlot: string) => {
    const lesson = scheduledLessons.find(
      l => l.dayOfWeek === dayOfWeek && l.timeSlot === timeSlot
    );
    if (lesson) {
      setScheduledLessons(
        scheduledLessons.filter(
          l => !(l.dayOfWeek === dayOfWeek && l.timeSlot === timeSlot)
        )
      );
      setToastMessage(`Removed "${lesson.lessonName}" from schedule`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const scheduledPlanIds = new Set(scheduledLessons.map(l => l.lessonPlanId));
  const stats = {
    totalPlans: lessonPlans.length,
    scheduledPlans: scheduledPlanIds.size,
    totalMinutes: scheduledLessons.reduce((sum, l) => sum + l.duration, 0),
    daysCovered: new Set(scheduledLessons.map(l => l.dayOfWeek)).size,
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="w-8 h-8" />
            Lesson Planning & Scheduling
          </h1>
          <p className="text-muted-foreground">
            Create lesson plans and assign them to your weekly schedule
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-primary">{stats.totalPlans}</div>
                <div className="text-sm text-muted-foreground">Lesson Plans</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.scheduledPlans}
                </div>
                <div className="text-sm text-muted-foreground">Scheduled</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.totalMinutes}
                </div>
                <div className="text-sm text-muted-foreground">Minutes Planned</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.daysCovered}
                </div>
                <div className="text-sm text-muted-foreground">Days Covered</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom z-50">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-fit lg:grid-cols-3">
            <TabsTrigger value="schedule" className="gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">My Plans</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create New</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Schedule - Unified Layout */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
              {/* Left Sidebar - Lesson Plans */}
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">My Lessons</CardTitle>
                    <CardDescription className="text-xs">
                      Drag to schedule
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 flex-1">
                    <div className="px-6 pb-6">
                      <LessonPlansSidebar
                        lessonPlans={lessonPlans}
                        scheduledPlanIds={Array.from(scheduledPlanIds)}
                        onCreateNew={() => setActiveTab('create')}
                        selectedFilter={filterSubject}
                        onFilterChange={setFilterSubject}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel - Schedule */}
              <div className="lg:col-span-3">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Weekly Schedule</CardTitle>
                    <CardDescription className="text-xs">
                      Drag lessons here to assign them
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 flex-1">
                    <div className="px-6 pb-6">
                      <SchedulePanel
                        scheduledLessons={scheduledLessons}
                        onLessonAssigned={handleLessonAssigned}
                        onLessonUnassigned={handleLessonUnassigned}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: My Plans */}
          <TabsContent value="plans" className="space-y-6">
            {lessonPlans.length === 0 ? (
              <Card className="border-dashed bg-muted/30">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    No lesson plans created yet. Start by creating your first lesson plan.
                  </p>
                  <Button onClick={() => setActiveTab('create')} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create First Lesson
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-sm text-muted-foreground">
                    {lessonPlans.length} lesson plan{lessonPlans.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lessonPlans.map(plan => (
                    <LessonPlanCard
                      key={plan.id}
                      plan={plan}
                      onDelete={handleDeletePlan}
                      onEdit={() => {
                        alert('Edit functionality coming soon');
                      }}
                      onSchedule={() => {
                        setActiveTab('schedule');
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Tab 3: Create New */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Section */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Start by entering the lesson name and subject
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Lesson Name</label>
                      <Input
                        placeholder="e.g., 'Introduction to Photosynthesis'"
                        value={formState.name}
                        onChange={e =>
                          setFormState({ ...formState, name: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Subject</label>
                        <Select
                          value={formState.subject}
                          onValueChange={value =>
                            setFormState({
                              ...formState,
                              subject: value as LessonPlan['subject'],
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="math">Math</SelectItem>
                            <SelectItem value="reading">Reading & Writing</SelectItem>
                            <SelectItem value="science">Science</SelectItem>
                            <SelectItem value="social-studies">Social Studies</SelectItem>
                            <SelectItem value="art">Art</SelectItem>
                            <SelectItem value="pe">PE</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Duration (minutes)</label>
                        <Input
                          type="number"
                          min="5"
                          max="120"
                          value={formState.duration}
                          onChange={e =>
                            setFormState({
                              ...formState,
                              duration: parseInt(e.target.value) || 45,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Teaching Method</label>
                      <Select
                        value={formState.teachingMethod}
                        onValueChange={value =>
                          setFormState({ ...formState, teachingMethod: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a teaching method" />
                        </SelectTrigger>
                        <SelectContent>
                          {TEACHING_METHODS.map(method => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Objectives Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Objectives</CardTitle>
                    <CardDescription>
                      Define what students will be able to do after this lesson
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ObjectivesEditor
                      objectives={formState.objectives}
                      onObjectivesChange={objectives =>
                        setFormState({ ...formState, objectives })
                      }
                    />
                  </CardContent>
                </Card>

                {/* Materials Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Materials & Supplies</CardTitle>
                    <CardDescription>
                      List all materials needed for this lesson
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MaterialsList
                      materials={formState.materials}
                      onMaterialsChange={materials =>
                        setFormState({ ...formState, materials })
                      }
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar: Duration Validator */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Duration Check</CardTitle>
                    <CardDescription>
                      How does this fit in a standard 45-minute block?
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DurationValidator
                      actualDuration={formState.duration}
                      targetDuration={45}
                      lessonName={formState.name}
                    />
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={handleCreateLesson}
                    size="lg"
                    className="w-full gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Lesson Plan
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => setFormState(INITIAL_FORM_STATE)}
                  >
                    Reset Form
                  </Button>
                </div>

                {/* Tips */}
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Pro Tip:</strong> Use templates to save time getting started
                    on common lesson types.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Templates Section */}
        <Card>
          <CardHeader>
            <CardTitle>Lesson Plan Templates</CardTitle>
            <CardDescription>
              Start with one of our pre-built templates to save time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TemplateGallery
              templates={MOCK_TEMPLATES}
              onUseTemplate={handleUseTemplate}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
