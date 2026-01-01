/**
 * Special Random Events
 * Fire drills, substitute teacher, class pet, holiday celebrations, etc.
 */

import type { Student } from '@/lib/game/types';

export interface SpecialEvent {
  id: string;
  type: 'drill' | 'substitute' | 'pet' | 'holiday' | 'visitor' | 'weather' | 'technology' | 'surprise';
  title: string;
  description: string;
  icon: string;
  probability: number; // 0-1
  effects: {
    target: 'class' | 'teacher' | 'all';
    mood?: number;
    engagement?: number;
    energy?: number;
    learning?: number;
  }[];
  choices?: SpecialEventChoice[];
  autoResolve?: boolean; // Some events just happen
  duration?: 'instant' | 'phase' | 'day'; // How long the event lasts
}

export interface SpecialEventChoice {
  id: string;
  label: string;
  description?: string;
  effects: {
    target: 'class' | 'teacher' | 'all' | 'student';
    studentId?: string;
    mood?: number;
    engagement?: number;
    energy?: number;
    stress?: number;
    learning?: number;
  }[];
}

// Fire Drill Events
export const FIRE_DRILL_EVENTS: SpecialEvent[] = [
  {
    id: 'fire-drill-scheduled',
    type: 'drill',
    title: 'Fire Drill',
    description: 'The fire alarm goes off for a scheduled drill. Time to practice emergency procedures!',
    icon: '🚨',
    probability: 0.05,
    autoResolve: false,
    duration: 'phase',
    effects: [
      { target: 'class', energy: -10, engagement: -15 }
    ],
    choices: [
      {
        id: 'calm',
        label: 'Stay calm and lead students out efficiently',
        effects: [
          { target: 'class', mood: 0, engagement: 5 },
          { target: 'teacher', energy: -8 }
        ]
      },
      {
        id: 'teachable',
        label: 'Use it as a teachable moment about safety',
        effects: [
          { target: 'class', engagement: 10 },
          { target: 'teacher', energy: -12 }
        ]
      },
      {
        id: 'rushed',
        label: 'Rush through it quickly',
        effects: [
          { target: 'class', mood: -1, energy: -5 },
          { target: 'teacher', energy: -5 }
        ]
      }
    ]
  },
  {
    id: 'lockdown-drill',
    type: 'drill',
    title: 'Lockdown Drill',
    description: 'A lockdown drill is announced. The class needs to practice safety procedures.',
    icon: '🔒',
    probability: 0.03,
    autoResolve: false,
    duration: 'phase',
    effects: [
      { target: 'class', mood: -1, energy: -5 }
    ],
    choices: [
      {
        id: 'reassuring',
        label: 'Keep students calm with reassuring presence',
        effects: [
          { target: 'class', mood: 1, stress: -10 },
          { target: 'teacher', energy: -10 }
        ]
      },
      {
        id: 'serious',
        label: 'Treat it very seriously and review procedures',
        effects: [
          { target: 'class', engagement: 8, mood: -1 },
          { target: 'teacher', energy: -8 }
        ]
      },
      {
        id: 'quiet-activity',
        label: 'Organize quiet activity during drill',
        effects: [
          { target: 'class', mood: 1, engagement: 5 },
          { target: 'teacher', energy: -12 }
        ]
      }
    ]
  }
];

// Substitute Teacher Events
export const SUBSTITUTE_EVENTS: SpecialEvent[] = [
  {
    id: 'sub-day',
    type: 'substitute',
    title: 'Substitute Teacher Day',
    description: 'You need to call in sick. A substitute teacher will handle your class today.',
    icon: '🤒',
    probability: 0.04,
    autoResolve: false,
    duration: 'day',
    effects: [
      { target: 'teacher', energy: 50 }, // Rest day!
      { target: 'class', engagement: -20, mood: -1 }
    ],
    choices: [
      {
        id: 'detailed-plans',
        label: 'Leave extremely detailed lesson plans',
        effects: [
          { target: 'class', engagement: 10, learning: 3 },
          { target: 'teacher', energy: -15 }
        ]
      },
      {
        id: 'basic-plans',
        label: 'Leave basic plans and trust the sub',
        effects: [
          { target: 'class', engagement: 0 },
          { target: 'teacher', energy: -5 }
        ]
      },
      {
        id: 'movie-day',
        label: 'Plan an educational movie day',
        effects: [
          { target: 'class', mood: 2, learning: -2 },
          { target: 'teacher', energy: -3 }
        ]
      }
    ]
  },
  {
    id: 'sub-chaos',
    type: 'substitute',
    title: 'Substitute Teacher Chaos',
    description: 'You return to find the substitute had a rough time. Several students misbehaved.',
    icon: '😰',
    probability: 0.02,
    autoResolve: false,
    duration: 'instant',
    effects: [
      { target: 'class', engagement: -10 }
    ],
    choices: [
      {
        id: 'address-class',
        label: 'Address the whole class about behavior',
        effects: [
          { target: 'class', mood: -1, engagement: 10 },
          { target: 'teacher', energy: -10 }
        ]
      },
      {
        id: 'individual-talks',
        label: 'Have individual conversations with culprits',
        effects: [
          { target: 'class', engagement: 5 },
          { target: 'teacher', energy: -20 }
        ]
      },
      {
        id: 'move-on',
        label: 'Move on and refocus on learning',
        effects: [
          { target: 'class', mood: 1 },
          { target: 'teacher', energy: -3 }
        ]
      }
    ]
  }
];

// Class Pet Events
export const CLASS_PET_EVENTS: SpecialEvent[] = [
  {
    id: 'pet-arrival',
    type: 'pet',
    title: 'Class Pet Arrives!',
    description: 'A class pet (hamster/fish/guinea pig) joins your classroom!',
    icon: '🐹',
    probability: 0.02,
    autoResolve: false,
    duration: 'instant',
    effects: [
      { target: 'class', mood: 3, engagement: 15 }
    ],
    choices: [
      {
        id: 'responsibility-chart',
        label: 'Create rotating responsibility chart',
        effects: [
          { target: 'class', engagement: 20, mood: 2 },
          { target: 'teacher', energy: -15 }
        ]
      },
      {
        id: 'reward-system',
        label: 'Make pet care a reward for good behavior',
        effects: [
          { target: 'class', engagement: 15, mood: 1 },
          { target: 'teacher', energy: -10 }
        ]
      },
      {
        id: 'science-lesson',
        label: 'Integrate into science curriculum',
        effects: [
          { target: 'class', engagement: 18, learning: 5 },
          { target: 'teacher', energy: -20 }
        ]
      }
    ]
  },
  {
    id: 'pet-escape',
    type: 'pet',
    title: 'Class Pet Escape!',
    description: 'Oh no! The class pet has escaped from its cage. Students are excited/worried.',
    icon: '🏃',
    probability: 0.03,
    autoResolve: false,
    duration: 'phase',
    effects: [
      { target: 'class', engagement: -20, mood: -1, energy: -10 }
    ],
    choices: [
      {
        id: 'organize-search',
        label: 'Organize a calm, systematic search',
        effects: [
          { target: 'class', engagement: 10, mood: 1 },
          { target: 'teacher', energy: -15 }
        ]
      },
      {
        id: 'wait-it-out',
        label: 'Set a humane trap and continue class',
        effects: [
          { target: 'class', engagement: -5 },
          { target: 'teacher', energy: -8 }
        ]
      },
      {
        id: 'detective-game',
        label: 'Turn it into a detective/problem-solving game',
        effects: [
          { target: 'class', engagement: 15, mood: 2, learning: 3 },
          { target: 'teacher', energy: -20 }
        ]
      }
    ]
  },
  {
    id: 'pet-sick',
    type: 'pet',
    title: 'Class Pet Is Sick',
    description: 'Students notice the class pet seems unwell. This could be a difficult moment.',
    icon: '😷',
    probability: 0.02,
    autoResolve: false,
    duration: 'instant',
    effects: [
      { target: 'class', mood: -2, engagement: -10 }
    ],
    choices: [
      {
        id: 'vet-lesson',
        label: 'Use it to teach about veterinary care and responsibility',
        effects: [
          { target: 'class', mood: 1, learning: 4, engagement: 8 },
          { target: 'teacher', energy: -12 }
        ]
      },
      {
        id: 'comfort',
        label: 'Help students process their feelings',
        effects: [
          { target: 'class', mood: 1, stress: -10 },
          { target: 'teacher', energy: -15 }
        ]
      },
      {
        id: 'quick-fix',
        label: 'Handle it quickly and move on',
        effects: [
          { target: 'class', mood: -1 },
          { target: 'teacher', energy: -5 }
        ]
      }
    ]
  }
];

// Holiday Celebration Events
export const HOLIDAY_EVENTS: SpecialEvent[] = [
  {
    id: 'halloween-party',
    type: 'holiday',
    title: 'Halloween Celebration',
    description: 'Students are excited about Halloween! Many wore costumes to school.',
    icon: '🎃',
    probability: 0.02, // Only around Halloween
    autoResolve: false,
    duration: 'phase',
    effects: [
      { target: 'class', mood: 3, engagement: -10, energy: 20 }
    ],
    choices: [
      {
        id: 'party',
        label: 'Host a structured Halloween party with learning games',
        effects: [
          { target: 'class', mood: 3, engagement: 15, learning: 2 },
          { target: 'teacher', energy: -25 }
        ]
      },
      {
        id: 'balance',
        label: 'Allow costumes but maintain regular schedule',
        effects: [
          { target: 'class', mood: 1, engagement: 5 },
          { target: 'teacher', energy: -10 }
        ]
      },
      {
        id: 'educational',
        label: 'Focus on history/cultural aspects of Halloween',
        effects: [
          { target: 'class', engagement: 8, learning: 5, mood: 0 },
          { target: 'teacher', energy: -15 }
        ]
      }
    ]
  },
  {
    id: 'winter-celebration',
    type: 'holiday',
    title: 'Winter Holiday Celebration',
    description: 'The class wants to celebrate the winter holidays together!',
    icon: '❄️',
    probability: 0.02,
    autoResolve: false,
    duration: 'phase',
    effects: [
      { target: 'class', mood: 2, engagement: -5 }
    ],
    choices: [
      {
        id: 'inclusive',
        label: 'Plan inclusive winter celebration for all traditions',
        effects: [
          { target: 'class', mood: 3, engagement: 12, learning: 4 },
          { target: 'teacher', energy: -20 }
        ]
      },
      {
        id: 'simple',
        label: 'Keep it simple with hot cocoa and reading',
        effects: [
          { target: 'class', mood: 2, engagement: 8 },
          { target: 'teacher', energy: -10 }
        ]
      },
      {
        id: 'service',
        label: 'Focus on service/giving back activities',
        effects: [
          { target: 'class', mood: 2, engagement: 15, learning: 6 },
          { target: 'teacher', energy: -18 }
        ]
      }
    ]
  },
  {
    id: 'valentines-day',
    type: 'holiday',
    title: 'Valentine\'s Day',
    description: 'Students want to exchange valentines. Some students might feel left out.',
    icon: '💌',
    probability: 0.02,
    autoResolve: false,
    duration: 'phase',
    effects: [
      { target: 'class', mood: 1, engagement: -5 }
    ],
    choices: [
      {
        id: 'everyone',
        label: 'Ensure everyone gives valentines to everyone',
        effects: [
          { target: 'class', mood: 2, engagement: 10 },
          { target: 'teacher', energy: -15 }
        ]
      },
      {
        id: 'craft',
        label: 'Focus on friendship craft activity',
        effects: [
          { target: 'class', mood: 2, engagement: 12, learning: 2 },
          { target: 'teacher', energy: -20 }
        ]
      },
      {
        id: 'skip',
        label: 'Skip valentines exchange this year',
        effects: [
          { target: 'class', mood: -2, engagement: 0 },
          { target: 'teacher', energy: 0 }
        ]
      }
    ]
  }
];

// Weather/Unexpected Events
export const WEATHER_EVENTS: SpecialEvent[] = [
  {
    id: 'snow-day',
    type: 'weather',
    title: 'Snow Day!',
    description: 'Heavy snow has closed the school! Everyone gets an unexpected day off.',
    icon: '⛄',
    probability: 0.01,
    autoResolve: true,
    duration: 'day',
    effects: [
      { target: 'class', mood: 3, energy: 50 },
      { target: 'teacher', energy: 30 }
    ]
  },
  {
    id: 'power-outage',
    type: 'weather',
    title: 'Power Outage',
    description: 'The power has gone out! No lights, no SmartBoard, no computers.',
    icon: '💡',
    probability: 0.02,
    autoResolve: false,
    duration: 'phase',
    effects: [
      { target: 'class', engagement: -15, mood: -1 }
    ],
    choices: [
      {
        id: 'improvise',
        label: 'Improvise with flashlights and oral storytelling',
        effects: [
          { target: 'class', mood: 2, engagement: 15, learning: 3 },
          { target: 'teacher', energy: -15 }
        ]
      },
      {
        id: 'outdoor',
        label: 'Move class outside if weather permits',
        effects: [
          { target: 'class', mood: 3, engagement: 18, energy: -10 },
          { target: 'teacher', energy: -20 }
        ]
      },
      {
        id: 'wait',
        label: 'Wait for power to return',
        effects: [
          { target: 'class', mood: -1, engagement: -10 },
          { target: 'teacher', energy: -5 }
        ]
      }
    ]
  }
];

// Technology Events
export const TECHNOLOGY_EVENTS: SpecialEvent[] = [
  {
    id: 'tech-failure',
    type: 'technology',
    title: 'Technology Disaster',
    description: 'The SmartBoard/projector has stopped working right before your digital lesson!',
    icon: '💻',
    probability: 0.05,
    autoResolve: false,
    duration: 'phase',
    effects: [
      { target: 'teacher', energy: -10, stress: 15 }
    ],
    choices: [
      {
        id: 'pivot',
        label: 'Quickly pivot to traditional whiteboard lesson',
        effects: [
          { target: 'class', engagement: 5 },
          { target: 'teacher', energy: -15 }
        ]
      },
      {
        id: 'hands-on',
        label: 'Switch to hands-on activity instead',
        effects: [
          { target: 'class', engagement: 15, mood: 1, learning: 4 },
          { target: 'teacher', energy: -20 }
        ]
      },
      {
        id: 'frustrated',
        label: 'Try to fix it (risk losing time)',
        effects: [
          { target: 'class', engagement: -10, mood: -1 },
          { target: 'teacher', energy: -25, stress: 10 }
        ]
      }
    ]
  },
  {
    id: 'virtual-guest',
    type: 'technology',
    title: 'Virtual Guest Speaker',
    description: 'An expert has agreed to video call into your class to share their knowledge!',
    icon: '📹',
    probability: 0.03,
    autoResolve: false,
    duration: 'phase',
    effects: [
      { target: 'class', engagement: 15, mood: 1 }
    ],
    choices: [
      {
        id: 'prepare',
        label: 'Have students prepare questions in advance',
        effects: [
          { target: 'class', engagement: 20, learning: 8 },
          { target: 'teacher', energy: -15 }
        ]
      },
      {
        id: 'casual',
        label: 'Keep it casual and conversational',
        effects: [
          { target: 'class', engagement: 15, learning: 5, mood: 1 },
          { target: 'teacher', energy: -8 }
        ]
      }
    ]
  }
];

// Surprise Events
export const SURPRISE_EVENTS: SpecialEvent[] = [
  {
    id: 'mystery-reader',
    type: 'surprise',
    title: 'Mystery Reader Visits',
    description: 'A parent/community member has volunteered to be a mystery reader!',
    icon: '📚',
    probability: 0.03,
    autoResolve: false,
    duration: 'phase',
    effects: [
      { target: 'class', mood: 2, engagement: 10 }
    ],
    choices: [
      {
        id: 'integrate',
        label: 'Integrate into your reading curriculum',
        effects: [
          { target: 'class', engagement: 15, learning: 4, mood: 2 },
          { target: 'teacher', energy: -5 }
        ]
      },
      {
        id: 'enjoy',
        label: 'Just enjoy the special moment',
        effects: [
          { target: 'class', mood: 2, engagement: 10 },
          { target: 'teacher', energy: 5 } // Nice break!
        ]
      }
    ]
  },
  {
    id: 'principal-visit',
    type: 'visitor',
    title: 'Principal Observation',
    description: 'The principal has decided to observe your class today!',
    icon: '👔',
    probability: 0.04,
    autoResolve: false,
    duration: 'phase',
    effects: [
      { target: 'teacher', stress: 20, energy: -10 }
    ],
    choices: [
      {
        id: 'showcase',
        label: 'Showcase your best lesson plans',
        effects: [
          { target: 'class', engagement: 15 },
          { target: 'teacher', energy: -20, stress: 5 }
        ]
      },
      {
        id: 'normal',
        label: 'Proceed with normal lesson',
        effects: [
          { target: 'teacher', energy: -10, stress: -5 }
        ]
      }
    ]
  }
];

// All special events
export const ALL_SPECIAL_EVENTS: SpecialEvent[] = [
  ...FIRE_DRILL_EVENTS,
  ...SUBSTITUTE_EVENTS,
  ...CLASS_PET_EVENTS,
  ...HOLIDAY_EVENTS,
  ...WEATHER_EVENTS,
  ...TECHNOLOGY_EVENTS,
  ...SURPRISE_EVENTS,
];

/**
 * Check for special events
 */
export function checkForSpecialEvents(
  currentDay: number,
  difficulty: 'easy' | 'normal' | 'hard',
  seasonalContext?: string
): SpecialEvent[] {
  const events: SpecialEvent[] = [];

  // Difficulty affects event frequency
  const frequencyMultiplier = {
    easy: 0.5,
    normal: 1.0,
    hard: 1.5
  }[difficulty];

  // Check each event type
  for (const event of ALL_SPECIAL_EVENTS) {
    const adjustedProbability = event.probability * frequencyMultiplier;

    // Seasonal events only trigger in appropriate seasons
    if (event.id.includes('halloween') && seasonalContext !== 'fall') continue;
    if (event.id.includes('winter') && seasonalContext !== 'winter') continue;
    if (event.id.includes('valentine') && seasonalContext !== 'winter') continue;

    if (Math.random() < adjustedProbability) {
      events.push(event);
      break; // Only one special event at a time
    }
  }

  return events;
}
