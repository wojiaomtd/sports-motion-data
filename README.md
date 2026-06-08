# Sports Motion Teaching Data Structure

> **Bridging PE teaching expertise and embodied AI — structured motion skill data for VLA model training.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Data Format: JSON Schema](https://img.shields.io/badge/Data%20Format-JSON%20Schema%202020--12-green.svg)](schema/)

## What is this?

A structured, machine-readable representation of human sports skills — designed specifically for training Vision-Language-Action (VLA) models in embodied AI systems.

Each sport is decomposed into **three layers**:
- **Sport** — What sport? In what context?
- **SkillUnit** — What phases? What should the body do at each phase?
- **AssessmentRule** — What does "good" look like? How to correct errors?

## Why?

Embodied AI companies face a **20,000× data gap** compared to text LLMs. High-quality human motion data with expert annotation is the scarcest resource in robotics. PE teachers possess decades of tacit knowledge about movement quality, error patterns, and correction strategies — but that knowledge is locked in human brains, not in training datasets.

This project unlocks that knowledge.

## Quick Start

### TypeScript
```ts
import { readFileSync } from 'fs';
const sprint = JSON.parse(readFileSync('data/50m-sprint.json', 'utf-8'));
console.log(sprint.skillUnits[0].name); // "起跑"
```

### Python
```python
import json
with open('data/50m-sprint.json', 'r', encoding='utf-8') as f:
    sprint = json.load(f)
print(sprint['skillUnits'][0]['name'])  # "起跑"
```

## Data Structure

### Layer 1: Sport
| Field | Type | Description |
|-------|------|-------------|
| `sportId` | string | Unique identifier (e.g., `"50m-sprint"`) |
| `name` | string | Sport name (Chinese) |
| `category` | enum | `track`, `jump`, `throw`, `coordination`, `strength` |
| `movementPattern` | enum | Fundamental movement pattern |
| `applicableGrades` | string[] | Target grade levels (`grade-7` through `grade-9`) |
| `equipment` | string[] | Required equipment |
| `venue` | string | Venue requirements |
| `skillUnits` | SkillUnit[] | Execution phases in order |
| `teachingProgression` | TeachingPhase[] | Learning progression (may differ from execution order) |
| `assessmentRules` | AssessmentRule[] | Scoring criteria (optional) |

### Layer 2: SkillUnit
| Field | Type | Description |
|-------|------|-------------|
| `unitId` | string | Unique ID |
| `name` | string | Phase name |
| `order` | number | Execution order (1-based) |
| `durationMs` | number | Typical duration in milliseconds |
| `description` | string | Ideal movement description |
| `keyJoints` | object | Joint angle specifications with ranges |
| `forceSequence` | array | Force generation sequence with timing |
| `centerOfGravity` | object | Center of gravity trajectory |
| `keyVisualFrames` | array | Key frames for video annotation |
| `commonErrors` | array | Common error patterns with visual cues |

### Layer 3: AssessmentRule
| Field | Type | Description |
|-------|------|-------------|
| `ruleId` | string | Unique rule ID |
| `skillUnitId` | string | Associated skill unit |
| `fullScoreStandard` | object | Perfect score criteria (quantified) |
| `deductionPoints` | array | Point deductions with trigger conditions |
| `correctionStrategy` | object | Teaching correction methods |

## Included Sports (Batch 1)

| Sport | Category | Pattern | Skill Units | Errors | Drills |
|-------|----------|---------|:-----------:|:------:|:------:|
| 50m Sprint | track | linear-locomotion | 4 | 9 | 11 |
| Standing Long Jump | jump | vertical-jump | 4 | 8 | 12 |
| 1-Minute Rope Skipping | coordination | cyclic-coordination | 3 | 7 | 10 |
| Medicine Ball Throw | throw | overhead-throw | 5 | 7 | 11 |
| Pull-Up | strength | pull-strength | 4 | 9 | 13 |

## Use Cases

- **VLA Model Training**: Feed structured motion data into robot learning pipelines
- **AI Sports Scoring**: Build automated movement quality assessment systems
- **Robot Self-Correction**: Train robots to detect and fix their own movement errors
- **Physical Education Tech**: Power AI teaching assistants for PE
- **Motion Research**: Standardized dataset for biomechanics and motor learning research

## Project Structure

```
├── schema/                  # JSON Schema + TypeScript type definitions
│   ├── sport.schema.json
│   ├── skill-unit.schema.json
│   ├── assessment-rule.schema.json
│   └── index.d.ts
├── data/                    # Individual sport JSON files
│   ├── 50m-sprint.json
│   ├── standing-long-jump.json
│   ├── 1min-rope-skipping.json
│   ├── medicine-ball-throw.json
│   └── pull-up.json
├── examples/                # Usage examples
│   ├── load-data.ts
│   └── load-data.py
├── tools/                   # Validation & utilities
│   └── validate.ts
└── docs/                    # Detailed documentation
```

## Validation

```bash
npx tsx tools/validate.ts
```

## Contributing

Contributions welcome! Areas we need help with:
- **More sports**: Basketball, football, gymnastics, swimming, martial arts...
- **Translations**: English names/descriptions for existing Chinese content
- **Video datasets**: Keyframe-annotated video paired with this data structure
- **Framework integration**: Loaders for PyTorch, TensorFlow, JAX
- **More languages**: Japanese, Korean, Spanish documentation

## Commercial Use

For commercial licensing, custom datasets, or consulting services, please contact the author at lixu.198808@163.com.

## License

MIT — see [LICENSE](LICENSE) for details.
