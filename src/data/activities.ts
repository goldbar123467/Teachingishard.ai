import type { LessonActivity, LessonPhase, GroupingType } from '@/lib/game/lessonPlan';
import type { Lesson } from '@/lib/game/types';

// Helper to create activity
function createActivity(
  id: string,
  name: string,
  description: string,
  duration: number,
  phase: LessonPhase,
  grouping: GroupingType,
  materials: string[],
  order: number
): LessonActivity {
  return {
    id,
    name,
    description,
    duration,
    phase,
    grouping,
    materials,
    order,
  };
}

// ============ MATH ACTIVITIES ============

export const MATH_ACTIVITIES: LessonActivity[] = [
  createActivity(
    'math-number-talk',
    'Number Talk',
    'Whole class discussion about number patterns and strategies',
    10,
    'intro',
    'whole-class',
    ['whiteboard', 'markers'],
    0
  ),
  createActivity(
    'math-guided-practice',
    'Guided Practice',
    'Teacher-led practice with gradual release of responsibility',
    20,
    'main',
    'whole-class',
    ['workbooks', 'pencils', 'manipulatives'],
    1
  ),
  createActivity(
    'math-stations',
    'Math Stations',
    'Small group rotations through different skill stations',
    25,
    'main',
    'small-group',
    ['station materials', 'task cards', 'timers'],
    2
  ),
  createActivity(
    'math-problem-solving',
    'Problem Solving',
    'Students work in pairs to solve complex multi-step problems',
    20,
    'main',
    'pairs',
    ['problem sheets', 'graph paper', 'calculators'],
    3
  ),
  createActivity(
    'math-games',
    'Math Games',
    'Engaging games that reinforce skills through play',
    15,
    'main',
    'small-group',
    ['game boards', 'dice', 'cards', 'counters'],
    4
  ),
  createActivity(
    'math-exit-ticket',
    'Exit Ticket',
    'Quick formative assessment to check understanding',
    5,
    'closing',
    'individual',
    ['exit slips', 'pencils'],
    5
  ),
];

// ============ READING ACTIVITIES ============

export const READING_ACTIVITIES: LessonActivity[] = [
  createActivity(
    'reading-read-aloud',
    'Read Aloud',
    'Teacher reads and models fluent reading and comprehension strategies',
    15,
    'intro',
    'whole-class',
    ['picture book', 'anchor chart'],
    0
  ),
  createActivity(
    'reading-guided-reading',
    'Guided Reading',
    'Small group instruction with leveled texts',
    20,
    'main',
    'small-group',
    ['leveled books', 'sticky notes', 'reading journals'],
    1
  ),
  createActivity(
    'reading-independent-reading',
    'Independent Reading',
    'Students read self-selected books at their level',
    20,
    'main',
    'individual',
    ['classroom library', 'reading logs'],
    2
  ),
  createActivity(
    'reading-literature-circles',
    'Literature Circles',
    'Small groups discuss a shared text with assigned roles',
    25,
    'main',
    'small-group',
    ['novels', 'role cards', 'discussion guides'],
    3
  ),
  createActivity(
    'reading-vocabulary-building',
    'Vocabulary Building',
    'Explicit instruction and practice with new words',
    15,
    'intro',
    'whole-class',
    ['word cards', 'dictionaries', 'context clues chart'],
    4
  ),
  createActivity(
    'reading-share-out',
    'Share Out',
    'Students share insights and connections from reading',
    10,
    'closing',
    'whole-class',
    [],
    5
  ),
];

// ============ SCIENCE ACTIVITIES ============

export const SCIENCE_ACTIVITIES: LessonActivity[] = [
  createActivity(
    'science-experiment',
    'Science Experiment',
    'Hands-on investigation following the scientific method',
    30,
    'main',
    'small-group',
    ['lab materials', 'safety goggles', 'worksheets'],
    0
  ),
  createActivity(
    'science-lab-work',
    'Lab Work',
    'Structured lab activity with data collection and analysis',
    25,
    'main',
    'pairs',
    ['lab equipment', 'data sheets', 'safety equipment'],
    1
  ),
  createActivity(
    'science-research',
    'Research Project',
    'Students investigate a topic using multiple sources',
    20,
    'main',
    'individual',
    ['computers', 'books', 'research organizers'],
    2
  ),
  createActivity(
    'science-observation',
    'Observation Activity',
    'Careful observation and recording of scientific phenomena',
    15,
    'intro',
    'whole-class',
    ['specimens', 'magnifying glasses', 'notebooks'],
    3
  ),
  createActivity(
    'science-discussion',
    'Science Discussion',
    'Structured dialogue about concepts and findings',
    15,
    'main',
    'whole-class',
    ['anchor charts', 'science journals'],
    4
  ),
  createActivity(
    'science-conclusion',
    'Draw Conclusions',
    'Students synthesize learning and make connections',
    10,
    'closing',
    'whole-class',
    ['data from activity', 'charts'],
    5
  ),
];

// ============ SOCIAL STUDIES ACTIVITIES ============

export const SOCIAL_STUDIES_ACTIVITIES: LessonActivity[] = [
  createActivity(
    'social-map-skills',
    'Map Skills',
    'Practice with maps, globes, and geographic tools',
    20,
    'main',
    'pairs',
    ['maps', 'atlases', 'map skills worksheets'],
    0
  ),
  createActivity(
    'social-timeline',
    'Timeline Activity',
    'Creating and analyzing historical timelines',
    15,
    'main',
    'small-group',
    ['timeline materials', 'historical event cards'],
    1
  ),
  createActivity(
    'social-research',
    'Research Project',
    'Investigation of historical topics or current events',
    25,
    'main',
    'individual',
    ['computers', 'books', 'graphic organizers'],
    2
  ),
  createActivity(
    'social-debate',
    'Structured Debate',
    'Students argue different perspectives on an issue',
    20,
    'main',
    'whole-class',
    ['debate guidelines', 'evidence cards'],
    3
  ),
  createActivity(
    'social-group-discussion',
    'Group Discussion',
    'Collaborative exploration of concepts and connections',
    15,
    'main',
    'small-group',
    ['discussion prompts', 'response journals'],
    4
  ),
  createActivity(
    'social-reflection',
    'Reflection',
    'Students connect learning to their lives and the world',
    10,
    'closing',
    'individual',
    ['reflection prompts', 'journals'],
    5
  ),
];

// ============ ART ACTIVITIES ============

export const ART_ACTIVITIES: LessonActivity[] = [
  createActivity(
    'art-drawing',
    'Drawing Lesson',
    'Instruction and practice with drawing techniques',
    20,
    'main',
    'individual',
    ['paper', 'pencils', 'erasers', 'example images'],
    0
  ),
  createActivity(
    'art-painting',
    'Painting Project',
    'Exploring color, composition, and painting methods',
    30,
    'main',
    'individual',
    ['paint', 'brushes', 'paper', 'water cups', 'smocks'],
    1
  ),
  createActivity(
    'art-sculpture',
    'Sculpture Work',
    '3D art creation with various materials',
    25,
    'main',
    'individual',
    ['clay', 'sculpting tools', 'work boards'],
    2
  ),
  createActivity(
    'art-appreciation',
    'Art Appreciation',
    'Viewing and discussing famous artworks',
    15,
    'intro',
    'whole-class',
    ['art prints', 'projector', 'discussion questions'],
    3
  ),
  createActivity(
    'art-gallery-walk',
    'Gallery Walk',
    'Students share and view each others work',
    10,
    'closing',
    'whole-class',
    ['finished artworks'],
    4
  ),
];

// ============ PE ACTIVITIES ============

export const PE_ACTIVITIES: LessonActivity[] = [
  createActivity(
    'pe-warm-up',
    'Warm Up',
    'Physical warm-up exercises and stretching',
    10,
    'intro',
    'whole-class',
    ['cones', 'music player'],
    0
  ),
  createActivity(
    'pe-team-game',
    'Team Game',
    'Cooperative or competitive team sports',
    25,
    'main',
    'small-group',
    ['balls', 'equipment', 'jerseys/pinnies'],
    1
  ),
  createActivity(
    'pe-skill-practice',
    'Skill Practice',
    'Focused practice on specific physical skills',
    20,
    'main',
    'pairs',
    ['equipment for skill', 'instruction cards'],
    2
  ),
  createActivity(
    'pe-cool-down',
    'Cool Down',
    'Gentle movement and stretching to end class',
    5,
    'closing',
    'whole-class',
    ['mats'],
    3
  ),
  createActivity(
    'pe-fitness-challenge',
    'Fitness Challenge',
    'Personal fitness goals and progress tracking',
    15,
    'main',
    'individual',
    ['fitness equipment', 'tracking sheets'],
    4
  ),
];

// ============ ACTIVITY LOOKUP ============

export const ACTIVITIES_BY_SUBJECT: Record<Lesson['subject'], LessonActivity[]> = {
  math: MATH_ACTIVITIES,
  reading: READING_ACTIVITIES,
  science: SCIENCE_ACTIVITIES,
  'social-studies': SOCIAL_STUDIES_ACTIVITIES,
  art: ART_ACTIVITIES,
  pe: PE_ACTIVITIES,
};

export function getActivitiesForSubject(subject: Lesson['subject']): LessonActivity[] {
  return ACTIVITIES_BY_SUBJECT[subject] || [];
}

export function getActivityById(id: string): LessonActivity | undefined {
  for (const activities of Object.values(ACTIVITIES_BY_SUBJECT)) {
    const activity = activities.find(a => a.id === id);
    if (activity) return activity;
  }
  return undefined;
}
