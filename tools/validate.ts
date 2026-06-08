/**
 * Sports Motion Data Validator
 *
 * Validates that all JSON data files conform to the expected structure.
 * Run: npx tsx tools/validate.ts
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface ValidationError {
  file: string;
  path: string;
  message: string;
}

const errors: ValidationError[] = [];

const VALID_CATEGORIES = ['track', 'jump', 'throw', 'coordination', 'strength'];
const VALID_MOVEMENT_PATTERNS = ['linear-locomotion', 'vertical-jump', 'overhead-throw', 'cyclic-coordination', 'pull-strength'];
const VALID_TIMINGS = ['early', 'mid', 'late'];
const VALID_FRAME_TIMINGS = ['start', 'mid', 'end'];
const VALID_SEVERITIES = ['critical', 'major', 'minor'];

function validateSport(data: any, file: string): void {
  const required = ['sportId', 'name', 'category', 'movementPattern', 'applicableGrades', 'skillUnits', 'teachingProgression'];
  for (const field of required) {
    if (!(field in data)) {
      errors.push({ file, path: `$.${field}`, message: `Missing required field: ${field}` });
    }
  }

  if (data.category && !VALID_CATEGORIES.includes(data.category)) {
    errors.push({ file, path: '$.category', message: `Invalid category: "${data.category}". Must be one of: ${VALID_CATEGORIES.join(', ')}` });
  }

  if (data.movementPattern && !VALID_MOVEMENT_PATTERNS.includes(data.movementPattern)) {
    errors.push({ file, path: '$.movementPattern', message: `Invalid movementPattern: "${data.movementPattern}"` });
  }

  if (Array.isArray(data.skillUnits)) {
    if (data.skillUnits.length === 0) {
      errors.push({ file, path: '$.skillUnits', message: 'skillUnits array is empty' });
    }
    data.skillUnits.forEach((unit: any, i: number) => {
      validateSkillUnit(unit, file, `$.skillUnits[${i}]`);
    });
  }

  if (Array.isArray(data.teachingProgression)) {
    data.teachingProgression.forEach((phase: any, i: number) => {
      const req = ['order', 'name', 'goal', 'drills', 'focusUnits'];
      for (const f of req) {
        if (!(f in phase)) {
          errors.push({ file, path: `$.teachingProgression[${i}].${f}`, message: `Missing required field: ${f}` });
        }
      }
    });
  }

  if (data.assessmentRules && Array.isArray(data.assessmentRules)) {
    data.assessmentRules.forEach((rule: any, i: number) => {
      validateAssessmentRule(rule, file, `$.assessmentRules[${i}]`);
    });
  }
}

function validateSkillUnit(unit: any, file: string, path: string): void {
  const required = ['unitId', 'name', 'order', 'durationMs', 'description', 'keyJoints', 'forceSequence', 'centerOfGravity', 'keyVisualFrames', 'commonErrors'];
  for (const field of required) {
    if (!(field in unit)) {
      errors.push({ file, path: `${path}.${field}`, message: `Missing required field: ${field}` });
    }
  }

  if (typeof unit.order !== 'number' || unit.order < 1) {
    errors.push({ file, path: `${path}.order`, message: `order must be a positive integer, got: ${unit.order}` });
  }

  if (typeof unit.durationMs !== 'number' || unit.durationMs < 0) {
    errors.push({ file, path: `${path}.durationMs`, message: `durationMs must be a non-negative integer, got: ${unit.durationMs}` });
  }

  // Validate keyJoints
  if (unit.keyJoints && typeof unit.keyJoints === 'object') {
    for (const [jointName, spec] of Object.entries(unit.keyJoints) as any) {
      if (!Array.isArray(spec.angleRange) || spec.angleRange.length !== 2) {
        errors.push({ file, path: `${path}.keyJoints.${jointName}.angleRange`, message: 'angleRange must be [min, max]' });
      }
      // measurementMethod is descriptive — accept any string
    }
  }

  // Validate forceSequence
  if (Array.isArray(unit.forceSequence)) {
    unit.forceSequence.forEach((step: any, j: number) => {
      if (step.timing && !VALID_TIMINGS.includes(step.timing)) {
        errors.push({ file, path: `${path}.forceSequence[${j}].timing`, message: `Invalid timing: "${step.timing}"` });
      }
    });
  }

  // Validate centerOfGravity — heightChange is descriptive, accept any string
  if (unit.centerOfGravity) {
    if (!unit.centerOfGravity.trajectory || !unit.centerOfGravity.horizontalShift) {
      errors.push({ file, path: `${path}.centerOfGravity`, message: 'Missing trajectory or horizontalShift' });
    }
  }

  // Validate keyVisualFrames
  if (Array.isArray(unit.keyVisualFrames)) {
    unit.keyVisualFrames.forEach((frame: any, j: number) => {
      if (!VALID_FRAME_TIMINGS.includes(frame.timing)) {
        errors.push({ file, path: `${path}.keyVisualFrames[${j}].timing`, message: `Invalid timing: "${frame.timing}"` });
      }
    });
  }

  // Validate commonErrors
  if (Array.isArray(unit.commonErrors)) {
    unit.commonErrors.forEach((err: any, j: number) => {
      if (!VALID_SEVERITIES.includes(err.severity)) {
        errors.push({ file, path: `${path}.commonErrors[${j}].severity`, message: `Invalid severity: "${err.severity}"` });
      }
      if (!err.errorId) {
        errors.push({ file, path: `${path}.commonErrors[${j}].errorId`, message: 'Missing errorId' });
      }
    });
  }
}

function validateAssessmentRule(rule: any, file: string, path: string): void {
  const required = ['ruleId', 'skillUnitId', 'fullScoreStandard', 'deductionPoints', 'correctionStrategy'];
  for (const field of required) {
    if (!(field in rule)) {
      errors.push({ file, path: `${path}.${field}`, message: `Missing required field: ${field}` });
    }
  }

  if (Array.isArray(rule.deductionPoints)) {
    rule.deductionPoints.forEach((dp: any, j: number) => {
      if (typeof dp.deductionValue !== 'number' || dp.deductionValue < 0) {
        errors.push({ file, path: `${path}.deductionPoints[${j}].deductionValue`, message: 'deductionValue must be a non-negative number' });
      }
    });
  }

  if (rule.correctionStrategy && Array.isArray(rule.correctionStrategy.drills)) {
    if (rule.correctionStrategy.drills.length === 0) {
      errors.push({ file, path: `${path}.correctionStrategy.drills`, message: 'drills array is empty' });
    }
  }
}

// Run validation
const dataDir = join(__dirname, '..', 'data');
const files = readdirSync(dataDir).filter(f => f.endsWith('.json'));

console.log(`Validating ${files.length} data files...\n`);

for (const file of files) {
  const filePath = join(dataDir, file);
  try {
    const raw = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    validateSport(data, file);
    console.log(`  ✅ ${file}`);
  } catch (e: any) {
    if (e instanceof SyntaxError) {
      errors.push({ file, path: '$', message: `Invalid JSON: ${e.message}` });
      console.log(`  ❌ ${file} — INVALID JSON`);
    } else {
      throw e;
    }
  }
}

console.log(`\n${'-'.repeat(60)}`);

if (errors.length === 0) {
  console.log('✅ All data files are valid!\n');
  process.exit(0);
} else {
  console.log(`❌ ${errors.length} validation error(s):\n`);
  for (const err of errors) {
    console.log(`  ${err.file} @ ${err.path}: ${err.message}`);
  }
  console.log();
  process.exit(1);
}
