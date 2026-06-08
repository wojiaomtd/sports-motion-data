// Sports Motion Teaching Data Structure — TypeScript Type Definitions
// Version: 1.0.0

// ============================================================
// Layer 1: Sport (运动项目)
// ============================================================

/** 运动类别 */
export type SportCategory = 'track' | 'jump' | 'throw' | 'coordination' | 'strength';

/** 基础动作模式 */
export type MovementPattern =
  | 'linear-locomotion'
  | 'vertical-jump'
  | 'overhead-throw'
  | 'cyclic-coordination'
  | 'pull-strength';

/** 年级标识 */
export type GradeLevel = `grade-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;

export interface Sport {
  /** 唯一标识, 如 '50m-sprint' */
  sportId: string;
  /** 项目名称 (中文) */
  name: string;
  /** 运动类别 */
  category: SportCategory;
  /** 基础动作模式 */
  movementPattern: MovementPattern;
  /** 适用年级 */
  applicableGrades: GradeLevel[];
  /** 所需器材 */
  equipment: string[];
  /** 场地要求 */
  venue: string;
  /** 按执行顺序排列的技能单元 */
  skillUnits: SkillUnit[];
  /** 教学梯度: 从易到难的技能学习顺序 (可与执行顺序不同) */
  teachingProgression: TeachingPhase[];
  /** 评价规则 */
  assessmentRules?: AssessmentRule[];
}

// ============================================================
// Layer 2: SkillUnit (技能单元)
// ============================================================

/** 测量方式 */
export type MeasurementMethod = 'goniometer' | 'motion-capture' | 'pose-estimation';

/** 时机 */
export type Timing = 'early' | 'mid' | 'late';

/** 重心高度变化 */
export type HeightChange = 'rise' | 'fall' | 'stable';

/** 错误严重程度 */
export type ErrorSeverity = 'critical' | 'major' | 'minor';

export interface JointAngle {
  /** 角度范围 [min, max], 单位: 度 */
  angleRange: [number, number];
  /** 角度含义说明 */
  angleDescription: string;
  /** 测量方式 */
  measurementMethod: MeasurementMethod;
}

export interface ForceStep {
  /** 发力部位 */
  bodyPart: string;
  /** 发力方向 */
  direction: string;
  /** 相对该阶段的时机 */
  timing: Timing;
  /** 发力描述 */
  description: string;
}

export interface CenterOfGravity {
  /** 重心轨迹描述 */
  trajectory: string;
  /** 重心高度变化 */
  heightChange: HeightChange;
  /** 重心水平位移描述 */
  horizontalShift: string;
}

export interface KeyVisualFrame {
  /** 关键帧名称 */
  frameName: string;
  /** 该帧的动作特征 (用于视频关键帧提取) */
  description: string;
  /** 在该阶段中出现的时间点 */
  timing: 'start' | 'mid' | 'end';
}

export interface CommonError {
  /** 错误唯一标识, 如 'start-upright-too-early' */
  errorId: string;
  /** 错误名称 */
  name: string;
  /** 视觉特征 (摄像头能看到什么) */
  visualCue: string;
  /** 根本原因 */
  rootCause: string;
  /** 严重程度 */
  severity: ErrorSeverity;
}

export interface SkillUnit {
  /** 唯一标识, 如 '50m-sprint-start' */
  unitId: string;
  /** 阶段名称 */
  name: string;
  /** 执行顺序 (1-based) */
  order: number;
  /** 典型持续时间 (毫秒) */
  durationMs: number;
  /** 理想动作描述 */
  description: string;
  /** 关键关节角度 */
  keyJoints: Record<string, JointAngle>;
  /** 发力序列 */
  forceSequence: ForceStep[];
  /** 重心 */
  centerOfGravity: CenterOfGravity;
  /** 关键视觉帧 */
  keyVisualFrames: KeyVisualFrame[];
  /** 常见错误 */
  commonErrors: CommonError[];
}

// ============================================================
// Layer 3: AssessmentRule (评价规则)
// ============================================================

export interface QuantifiedThreshold {
  /** 单位 */
  unit: string;
  /** 合格范围 [下限, 上限] */
  passRange: [number, number];
  /** 测量方式 */
  measurementMethod: string;
}

export interface FullScoreStandard {
  /** 满分标准描述 */
  description: string;
  /** 量化阈值 */
  quantifiedThresholds: Record<string, QuantifiedThreshold>;
}

export interface DeductionPoint {
  /** 扣分项标识 */
  pointId: string;
  /** 扣分项描述 */
  description: string;
  /** 扣分值 */
  deductionValue: number;
  /** 触发条件的量化描述, 如 "膝关节角度 < 30°" */
  triggerCondition: string;
  /** 摄像头可检测的视觉标志 */
  visualIndicator: string;
}

export interface CorrectionStrategy {
  /** 纠偏策略描述 */
  description: string;
  /** 针对性练习 */
  drills: string[];
  /** 教学口令 / 提示语 */
  verbalCue: string;
  /** 手动辅助方法 */
  physicalGuidance: string;
}

export interface AssessmentRule {
  /** 规则唯一标识 */
  ruleId: string;
  /** 关联的技能单元 ID */
  skillUnitId: string;
  /** 满分标准 */
  fullScoreStandard: FullScoreStandard;
  /** 扣分项 */
  deductionPoints: DeductionPoint[];
  /** 纠偏策略 */
  correctionStrategy: CorrectionStrategy;
}

// ============================================================
// Teaching Progression (教学梯度)
// ============================================================

export interface TeachingPhase {
  /** 阶段序号 */
  order: number;
  /** 阶段名称: 分解模仿 | 完整动作 | 纠偏优化 | 强化自动化 */
  name: string;
  /** 该阶段的教学目标 */
  goal: string;
  /** 该阶段的练习方法 */
  drills: string[];
  /** 对应的 SkillUnit ID 列表 (按教学顺序) */
  focusUnits: string[];
}
