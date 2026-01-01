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

## Token Efficiency Guidelines

**Model Selection by Role:**
| Agent | Recommended Model | Rationale |
|-------|------------------|-----------|
| CobaltDeer | `sonnet` | Planning needs good reasoning, not max intelligence |
| DarkRidge | `sonnet` | Building code is well-suited to sonnet |
| FuchsiaGlen | `haiku` | CSS/Tailwind styling is straightforward |
| SilentCompass | `haiku` | Running builds/tests doesn't need opus |

**Token-Saving Practices:**
1. **Use Explore subagent** - For codebase questions, use `Task` with `subagent_type=Explore` instead of multiple Glob/Grep/Read calls
2. **Concise agent-mail** - Keep messages under 500 words; use bullet points, not essays
3. **Read specific lines** - Use `limit` and `offset` params when reading large files
4. **Don't re-read files** - If you just read a file, reference your memory of it
5. **Batch searches** - Make parallel tool calls instead of sequential ones
6. **Skip node_modules** - Never explore or read from node_modules/
7. **Trust task assignments** - Don't re-explore what other agents reported

**Anti-Patterns to Avoid:**
- Reading entire files when you only need types/signatures
- Sending long code blocks in agent-mail (reference file paths instead)
- Using opus for simple styling or test running tasks
- Exploring the full codebase when your task is specific

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
