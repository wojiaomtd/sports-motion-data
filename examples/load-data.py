"""
Example: Loading and querying sports motion data in Python

Run: python examples/load-data.py
"""

import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"


def load_sport(sport_id: str) -> dict:
    file_path = DATA_DIR / f"{sport_id}.json"
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


# Load 50m sprint data
sprint = load_sport("50m-sprint")

print(f"🏃 Sport: {sprint['name']}")
print(f"   Category: {sprint['category']}")
print(f"   Movement Pattern: {sprint['movementPattern']}")
print(f"   Skill Units: {len(sprint['skillUnits'])}")

# Query all critical errors across all skill units
print("\n🚨 Critical Errors:")
for unit in sprint["skillUnits"]:
    for error in unit["commonErrors"]:
        if error["severity"] == "critical":
            print(f"   [{unit['name']}] {error['name']}")
            print(f"   → {error['visualCue']}")

# Get teaching progression
print(f"\n📚 Teaching Progression:")
for phase in sprint["teachingProgression"]:
    print(f"   Phase {phase['order']}: {phase['name']} — {phase['goal']}")

# Assessment rules
if sprint.get("assessmentRules"):
    print(f"\n📋 Assessment Rules:")
    for rule in sprint["assessmentRules"]:
        print(f"   Rule: {rule['ruleId']}")
        print(f"   → {rule['fullScoreStandard']['description']}")
        print(f"   → Correction verbal cue: {rule['correctionStrategy']['verbalCue']}")

# Print summary stats across all sports
print(f"\n{'='*60}")
print("📊 Full Dataset Summary")
print("="*60)

all_sports = ["50m-sprint", "standing-long-jump", "1min-rope-skipping", "medicine-ball-throw", "pull-up"]
total_units = 0
total_errors = 0
total_drills = 0
total_rules = 0

for sport_id in all_sports:
    sport = load_sport(sport_id)
    units = len(sport["skillUnits"])
    errors = sum(len(u["commonErrors"]) for u in sport["skillUnits"])
    drills = sum(len(p["drills"]) for p in sport["teachingProgression"])
    rules = len(sport.get("assessmentRules", []))
    total_units += units
    total_errors += errors
    total_drills += drills
    total_rules += rules
    print(f"   {sport['name']}: {units} units, {errors} errors, {drills} drills, {rules} rules")

print(f"\n   Total: {total_units} skill units, {total_errors} documented errors, {total_drills} practice drills, {total_rules} assessment rules")
print(f"   Sports: {len(all_sports)}")
print(f"   Movement Patterns: linear-locomotion, vertical-jump, cyclic-coordination, overhead-throw, pull-strength")
