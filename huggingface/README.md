---
license: mit
language:
  - zh
  - en
pretty_name: Sports Motion Teaching Data
size_categories:
  - n<1K
task_categories:
  - robotics
  - video-understanding
  - structure-prediction
tags:
  - embodied-ai
  - vla
  - motion-analysis
  - physical-education
  - sports-biomechanics
  - pose-estimation
  - skill-assessment
  - robot-learning
viewer: false
configs:
  - config_name: default
    data_files:
      - split: train
        path: "data/train-*.parquet"
---

# 🏃 Sports Motion Teaching Data Structure

**Bridging PE teaching expertise and embodied AI — structured motion skill data for VLA model training.**

A structured, machine-readable representation of human sports skills — designed specifically for training Vision-Language-Action (VLA) models in embodied AI systems. This dataset transforms decades of PE teaching knowledge into quantified, machine-readable motion skill data.

## Dataset Summary

Each sport is decomposed into **three layers**:
- **Sport** — What sport? In what context? (equipment, venue, grade levels)
- **SkillUnit** — What phases? What should the body do at each phase? (joint angles, force sequence, center of gravity trajectory)
- **AssessmentRule** — What does "good" look like? How to correct errors? (deduction points, correction strategies)

### Included Sports

| Sport | Category | Movement Pattern | Skill Units | Errors | Drills |
|-------|----------|------------------|:-----------:|:------:|:------:|
| 50m Sprint (50米跑) | track | linear-locomotion | 4 | 9 | 11 |
| Standing Long Jump (立定跳远) | jump | vertical-jump | 4 | 8 | 12 |
| 1-Minute Rope Skipping (跳绳) | coordination | cyclic-coordination | 3 | 7 | 10 |
| Medicine Ball Throw (掷实心球) | throw | overhead-throw | 5 | 7 | 11 |
| Pull-Up (引体向上) | strength | pull-strength | 4 | 9 | 13 |

**Coverage:** 5 fundamental movement patterns — run, jump, throw, coordinate, pull.

## Why This Dataset?

Embodied AI companies face a **20,000× data gap** compared to text LLMs. High-quality, expert-annotated human motion data is the scarcest resource in robotics. PE teachers possess decades of tacit knowledge about movement quality assessment, error pattern recognition, and correction strategies — but that knowledge is locked in human brains, not in training datasets.

This dataset unlocks that knowledge.

## Dataset Structure

### Layer 1: Sport
| Field | Type | Description |
|-------|------|-------------|
| `sportId` | string | Unique identifier (e.g., `50m-sprint`) |
| `name` | string | Sport name (Chinese) |
| `category` | enum | `track`, `jump`, `throw`, `coordination`, `strength` |
| `movementPattern` | enum | Fundamental movement pattern |
| `applicableGrades` | string[] | Target grade levels |
| `equipment` | string[] | Required equipment |
| `venue` | string | Venue requirements |
| `skillUnits` | SkillUnit[] | Execution phases in order |
| `teachingProgression` | TeachingPhase[] | Learning progression |
| `assessmentRules` | AssessmentRule[] | Scoring criteria |

### Layer 2: SkillUnit
| Field | Type | Description |
|-------|------|-------------|
| `unitId` | string | Unique ID |
| `name` | string | Phase name |
| `order` | number | Execution order (1-based) |
| `durationMs` | number | Typical duration (ms) |
| `description` | string | Ideal movement description |
| `keyJoints` | object | Joint angle specs with ranges |
| `forceSequence` | array | Force generation sequence |
| `centerOfGravity` | object | COG trajectory |
| `keyVisualFrames` | array | Key frames for video annotation |
| `commonErrors` | array | Error patterns with visual cues |

### Layer 3: AssessmentRule
| Field | Type | Description |
|-------|------|-------------|
| `ruleId` | string | Unique rule ID |
| `skillUnitId` | string | Associated skill unit |
| `fullScoreStandard` | object | Perfect score criteria |
| `deductionPoints` | array | Point deductions with triggers |
| `correctionStrategy` | object | Teaching correction methods |

## Use Cases

- **VLA Model Training**: Feed structured motion data into robot learning pipelines
- **AI Sports Scoring**: Build automated movement quality assessment systems
- **Robot Self-Correction**: Train robots to detect and fix their own movement errors
- **Physical Education Tech**: Power AI teaching assistants for PE
- **Motion Research**: Standardized dataset for biomechanics and motor learning studies

## Quick Start

### Python

```python
from datasets import load_dataset

dataset = load_dataset("YOUR_USERNAME/sports-motion-data")
sprint = dataset["train"][0]  # First row: 50m sprint
print(sprint["name"])         # "50米跑"
print(len(sprint["skillUnits"]))  # 4

# Access nested data
for unit in sprint["skillUnits"]:
    print(f"{unit['name']}: {len(unit['commonErrors'])} common errors")
```

### TypeScript / JavaScript

```ts
const sprint = await fetch(
  'https://huggingface.co/datasets/YOUR_USERNAME/sports-motion-data/resolve/main/data/50m-sprint.json'
).then(r => r.json());
console.log(sprint.skillUnits[0].name); // "起跑"
```

## Data Validation

This dataset is validated against JSON Schema Draft 2020-12. See the [GitHub repo](https://github.com/YOUR_USERNAME/sports-motion-data) for validation tools.

## Limitations & Future Work

- **Scale**: Currently 5 sports; many more needed (basketball, swimming, gymnastics, martial arts, etc.)
- **Language**: Skill names and descriptions are in Chinese; English translations planned
- **Video**: No accompanying video data yet — keyframe annotations are text-based
- **Validation**: Data comes from expert PE teacher domain knowledge, not from large-scale motion capture

## Contributing

We welcome contributions in these areas:
- **More sports**: Basketball, football, gymnastics, swimming, martial arts...
- **Translations**: English names/descriptions for existing content
- **Video datasets**: Keyframe-annotated video paired with this data structure
- **Framework integration**: Loaders for PyTorch, TensorFlow, JAX

## Citation

```bibtex
@misc{sports-motion-data-2026,
  author = {PE Teacher Community},
  title = {Sports Motion Teaching Data Structure},
  year = {2026},
  publisher = {Hugging Face},
  howpublished = {\url{https://huggingface.co/datasets/YOUR_USERNAME/sports-motion-data}},
}
```

## License

MIT — see [LICENSE](https://github.com/YOUR_USERNAME/sports-motion-data/blob/main/LICENSE) for details.
