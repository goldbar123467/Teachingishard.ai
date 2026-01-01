# Classroom Simulator - AI Teacher Dashboard Game

## Project Vision

A **turn-based dashboard-driven game** where you play as a 5th-grade teacher managing a classroom of **15 AI students** through an entire school year. Each turn represents a day/week of teaching, and your decisions shape student outcomes, classroom dynamics, and learning progression.

## Core Gameplay Loop

1. **Morning Phase**: Review student status, check homework, assess mood/energy
2. **Teaching Phase**: Choose lesson plans, teaching methods, activities
3. **Interaction Phase**: Handle individual student needs, behavioral issues, special moments
4. **End-of-Day Phase**: Assign homework, review progress, prepare for next day

## Tech Stack

- **Frontend**: Next.js 14+ with App Router
- **UI Components**: shadcn/ui + Tailwind CSS
- **State Management**: React Context + useReducer for game state
- **AI System**: Hybrid approach
  - **XGBoost**: Student behavior prediction, academic performance modeling
  - **RAG System**: Shared knowledge base for student personalities + individual memory
- **Database**: SQLite/PostgreSQL for game saves, student profiles, year progression

## AI Student System

### Shared RAG Knowledge Base
- Common 5th-grade knowledge expectations
- Behavioral patterns and social dynamics
- Classroom event templates
- Learning progression curves

### Individual Student Profiles
- Unique personality traits (shy, outgoing, curious, distracted, etc.)
- Learning styles (visual, auditory, kinesthetic)
- Home life factors affecting school performance
- Friendship networks and social dynamics
- Individual memory of player interactions

### XGBoost Models
- **Academic Performance**: Predict test scores based on teaching methods, engagement, homework completion
- **Behavioral Modeling**: Likelihood of disruption, participation, attention span
- **Social Dynamics**: Friendship formation, conflict probability, group work effectiveness

## Game Systems

### Dynamic Events
- Pop quizzes, fire drills, sick days
- Parent-teacher conferences
- Field trip planning
- Standardized testing weeks
- Holiday celebrations

### Progression Metrics
- Class average performance
- Individual student growth
- Teacher reputation
- Parent satisfaction
- End-of-year outcomes (honor roll, held back, special achievements)

### Difficulty Scaling
- Some students have IEPs or learning differences
- Budget constraints for supplies/activities
- Time management challenges
- Work-life balance (teacher burnout meter)

## Agent Team

| Agent | Role | Responsibilities |
|-------|------|------------------|
| CobaltDeer | Planner | Architecture, feature breakdown, task planning |
| DarkRidge | Builder | Next.js/React components, shadcn integration |
| FuchsiaGlen | Styler | Tailwind styling, responsive design, animations |
| SilentCompass | Tester | Build verification, testing, error catching |

## Project Structure (Planned)

```
classroom-sim/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Main dashboard
│   │   ├── classroom/          # Classroom view
│   │   ├── students/           # Student profiles
│   │   └── planning/           # Lesson planning
│   ├── components/
│   │   ├── ui/                 # shadcn components
│   │   ├── dashboard/          # Game dashboard widgets
│   │   ├── students/           # Student cards, profiles
│   │   └── teaching/           # Lesson plan builders
│   ├── lib/
│   │   ├── game/               # Game logic, state machine
│   │   ├── ai/                 # XGBoost integration, RAG system
│   │   └── students/           # Student generation, behavior
│   └── data/
│       ├── students/           # Student personality templates
│       └── events/             # Event templates
├── models/                     # XGBoost trained models
└── rag/                        # RAG knowledge base
```

## Design Principles

1. **Systems-Driven Gameplay**: Emergent behavior from interconnected systems
2. **Meaningful Choices**: Every decision has cascading consequences
3. **Procedural Variety**: No two playthroughs are identical
4. **Emotional Investment**: Players care about their students' outcomes
5. **Educational Realism**: Grounded in real teaching challenges

## MVP Features (Phase 1)

- [ ] Dashboard with student grid overview
- [ ] Individual student profile cards
- [ ] Basic turn system (day progression)
- [ ] Simple teaching action selection
- [ ] Student mood/performance indicators
- [ ] Save/load game state

## Future Features

- Multiplayer: Compare classrooms with friends
- Mod support: Custom student personalities, events
- Historical mode: Teach in different eras
- Challenge modes: Extreme scenarios
