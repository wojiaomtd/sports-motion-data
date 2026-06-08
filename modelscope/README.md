---
license: mit
language:
  - zh
  - en
task_categories:
  - robotics
  - video-understanding
tags:
  - embodied-ai
  - vla
  - motion-analysis
  - physical-education
  - sports-biomechanics
  - pose-estimation
  - skill-assessment
  - robot-learning
---

# 🏃 运动技能教学数据结构

**连接体育教学专业知识与具身智能 — 面向 VLA 模型训练的结构化运动技能数据。**

一套将体育教学经验转化为具身智能模型可用的结构化训练数据。核心思路：**把体育老师脑子里的"这个动作对不对"变成机器可读的量化数据**。

## 数据集简介

每个运动项目被分解为 **三层结构**：
- **Sport（运动项目层）** — 这是什么运动？在什么场景下做？
- **SkillUnit（技能单元层）** — 动作分几个阶段？每个阶段身体应该什么样？
- **AssessmentRule（评价规则层）** — 什么叫做好？做错了怎么纠正？

### 包含的运动项目

| 项目 | 类别 | 动作模式 | 技能单元 | 错误模式 | 练习方法 |
|------|------|----------|:---:|:---:|:---:|
| 50米跑 | 径赛 | 线性位移 | 4 | 9 | 11 |
| 立定跳远 | 跳跃 | 垂直跳跃 | 4 | 8 | 12 |
| 1分钟跳绳 | 协调 | 周期性协调 | 3 | 7 | 10 |
| 掷实心球 | 投掷 | 过顶投掷 | 5 | 7 | 11 |
| 引体向上 | 力量 | 拉力模式 | 4 | 9 | 13 |

覆盖了 **跑、跳、投、协调、力量** 五大基础动作模式。

## 为什么需要？

具身智能公司面临与文本大模型相差 **2 万倍的数据剪刀差**。高质量、带专家标注的人类运动数据是机器人领域最稀缺的资源。体育教师拥有数十年的动作质量判断、错误模式识别和纠偏策略知识——但这些知识锁在人脑中，不在训练数据集里。

这个数据集解锁这些知识。

## 数据结构

### 第一层：Sport（运动项目）
| 字段 | 类型 | 说明 |
|------|------|------|
| `sportId` | string | 唯一标识，如 `"50m-sprint"` |
| `name` | string | 项目中文名称 |
| `category` | enum | `track` / `jump` / `throw` / `coordination` / `strength` |
| `movementPattern` | enum | 基础动作模式 |
| `applicableGrades` | string[] | 适用年级 |
| `equipment` | string[] | 所需器材 |
| `venue` | string | 场地要求 |
| `skillUnits` | SkillUnit[] | 按执行顺序排列的技能单元 |
| `teachingProgression` | TeachingPhase[] | 教学梯度 |
| `assessmentRules` | AssessmentRule[] | 评价规则 |

### 第二层：SkillUnit（技能单元）
| 字段 | 类型 | 说明 |
|------|------|------|
| `unitId` | string | 唯一标识 |
| `name` | string | 阶段中文名称 |
| `order` | number | 执行顺序 |
| `durationMs` | number | 典型持续时间（毫秒） |
| `description` | string | 理想动作描述 |
| `keyJoints` | object | 关键关节角度（含量化范围） |
| `forceSequence` | array | 发力序列（含时机标注） |
| `centerOfGravity` | object | 重心轨迹描述 |
| `keyVisualFrames` | array | 关键视觉帧（用于视频标注） |
| `commonErrors` | array | 常见错误模式（含视觉特征） |

### 第三层：AssessmentRule（评价规则）
| 字段 | 类型 | 说明 |
|------|------|------|
| `ruleId` | string | 规则唯一标识 |
| `skillUnitId` | string | 关联的技能单元 |
| `fullScoreStandard` | object | 满分标准（含量化阈值） |
| `deductionPoints` | array | 扣分项（含量化触发条件） |
| `correctionStrategy` | object | 纠偏策略（练习+口令+手法） |

## 快速开始

### Python
```python
from modelscope.msdatasets import MsDataset

dataset = MsDataset.load('lixu198808/sports-motion-data')
print(dataset['train'][0]['name'])  # "50米跑"
```

### TypeScript / JavaScript
```ts
const sprint = await fetch(
  'https://www.modelscope.cn/datasets/lixu198808/sports-motion-data/resolve/main/data/50m-sprint.json'
).then(r => r.json());
console.log(sprint.skillUnits[0].name); // "起跑"
```

## 应用场景

- **VLA 模型训练**：为机器人学习管线提供结构化动作数据
- **AI 体育评分**：构建自动化动作规范性评估系统
- **机器人自我纠错**：训练机器人检测并修正自身动作错误
- **体育教育科技**：驱动 AI 体育教学助手
- **运动科学研究**：为生物力学和动作学习研究提供标准化数据集

## 数据规模

```
20 个技能单元 · 42 个错误模式 · 44 个练习方法 · 5 个评分规则
覆盖 跑 · 跳 · 投 · 协调 · 力量 五大动作模式
```

## 引用

```bibtex
@misc{sports-motion-data-2026,
  author = {PE Teacher Community},
  title = {Sports Motion Teaching Data Structure},
  year = {2026},
  publisher = {ModelScope},
  howpublished = {\url{https://www.modelscope.cn/datasets/lixu198808/sports-motion-data}},
}
```

## 许可证

MIT — 详见 [LICENSE](https://github.com/lixu198808/sports-motion-data/blob/main/LICENSE)
