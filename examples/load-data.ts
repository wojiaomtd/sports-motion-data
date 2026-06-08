/**
 * Example: Loading and querying sports motion data in TypeScript
 *
 * Run: npx tsx examples/load-data.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface Sport {
  sportId: string;
  name: string;
  category: string;
  movementPattern: string;
  applicableGrades: string[];
  equipment: string[];
  venue: string;
  skillUnits: any[];
  teachingProgression: any[];
  assessmentRules?: any[];
}

function loadSport(sportId: string): Sport {
  const filePath = join(__dirname, '..', 'data', `${sportId}.json`);
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

// Load 50m sprint data
const sprint = loadSport('50m-sprint');

console.log(`🏃 Sport: ${sprint.name}`);
console.log(`   Category: ${sprint.category}`);
console.log(`   Movement Pattern: ${sprint.movementPattern}`);
console.log(`   Applicable Grades: ${sprint.applicableGrades.join(', ')}`);
console.log(`   Skill Units: ${sprint.skillUnits.length}`);
console.log(`   Equipment: ${sprint.equipment.join(', ')}`);

// Query all critical errors across all skill units
const criticalErrors = sprint.skillUnits.flatMap((unit: any) =>
  unit.commonErrors
    .filter((e: any) => e.severity === 'critical')
    .map((e: any) => ({
      phase: unit.name,
      error: e.name,
      visualCue: e.visualCue,
    })),
);

console.log(`\n🚨 Critical Errors (${criticalErrors.length}):`);
for (const err of criticalErrors) {
  console.log(`   [${err.phase}] ${err.error}`);
  console.log(`   → ${err.visualCue}`);
}

// Get teaching progression
console.log(`\n📚 Teaching Progression (${sprint.teachingProgression.length} phases):`);
for (const phase of sprint.teachingProgression) {
  console.log(`   Phase ${phase.order}: ${phase.name}`);
  console.log(`   → ${phase.goal}`);
}

// Query joint angle specifications for the acceleration phase
console.log(`\n📐 Joint Angle Specs (Acceleration Phase):`);
const accel = sprint.skillUnits.find((u: any) => u.name === '加速跑');
if (accel) {
  for (const [joint, spec] of Object.entries(accel.keyJoints) as any) {
    console.log(`   ${joint}: ${spec.angleRange[0]}°–${spec.angleRange[1]}°`);
    console.log(`   → ${spec.angleDescription}`);
  }
}

// Assessment rules
if (sprint.assessmentRules) {
  console.log(`\n📋 Assessment Rules (${sprint.assessmentRules.length}):`);
  for (const rule of sprint.assessmentRules) {
    console.log(`   Rule: ${rule.ruleId}`);
    console.log(`   → ${rule.fullScoreStandard.description}`);
    console.log(`   → Deduction Points: ${rule.deductionPoints.length}`);
    console.log(`   → Correction Drills: ${rule.correctionStrategy.drills.length}`);
  }
}

// Summary across all sports
console.log(`\n${'='.repeat(60)}`);
console.log('📊 Full Dataset Summary');
console.log('='.repeat(60));

const allSports = ['50m-sprint', 'standing-long-jump', '1min-rope-skipping', 'medicine-ball-throw', 'pull-up'];
let totalUnits = 0;
let totalErrors = 0;
let totalDrills = 0;
let totalRules = 0;

for (const sportId of allSports) {
  const sport = loadSport(sportId);
  totalUnits += sport.skillUnits.length;
  totalErrors += sport.skillUnits.reduce((sum: number, u: any) => sum + u.commonErrors.length, 0);
  totalDrills += sport.teachingProgression.reduce((sum: number, p: any) => sum + p.drills.length, 0);
  totalRules += sport.assessmentRules?.length || 0;
  console.log(`   ${sport.name}: ${sport.skillUnits.length} units, ${sport.skillUnits.reduce((s: number, u: any) => s + u.commonErrors.length, 0)} errors, ${sport.teachingProgression.reduce((s: number, p: any) => s + p.drills.length, 0)} drills`);
}

console.log(`\n   Total: ${totalUnits} skill units, ${totalErrors} documented errors, ${totalDrills} practice drills, ${totalRules} assessment rules`);
console.log(`   Sports: ${allSports.length}`);
console.log(`   Movement Patterns: linear-locomotion, vertical-jump, cyclic-coordination, overhead-throw, pull-strength`);
