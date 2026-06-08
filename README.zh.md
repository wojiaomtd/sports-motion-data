# 运动技能教学数据结构

> **连接体育教学专业知识与具身智能 — 面向 VLA 模型训练的结构化运动技能数据。**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Data Format: JSON Schema](https://img.shields.io/badge/Data%20Format-JSON%20Schema%202020--12-green.svg)](schema/)

## 这是什么？

一套将体育教学经验转化为具身智能模型可用的结构化训练数据。核心思路：**把体育老师脑子里的"这个动作对不对"变成机器可读的量化数据**。

每个运动项目被分解为 **三层结构**：
- **Sport（运动项目层）** — 这是什么运动？在什么场景下做？
- **SkillUnit（技能单元层）** — 动作分几个阶段？每个阶段身体应该什么样？
- **AssessmentRule（评价规则层）** — 什么叫做好？做错了怎么纠正？

## 为什么需要？

具身智能公司面临与文本大模型相差 **2 万倍的数据剪刀差**。高质量、带专家标注的人类运动数据是机器人领域最稀缺的资源。体育教师拥有数十年的动作质量判断、错误模式识别和纠偏策略知识——但这些知识锁在人脑中，不在训练数据集里。

这个项目解锁这些知识。

## 快速开始

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

## 三层数据结构

### 第一层：Sport（运动项目）
| 字段 | 类型 | 说明 |
|------|------|------|
| `sportId` | string | 唯一标识，如 `"50m-sprint"` |
| `name` | string | 项目中文名称 |
| `category` | enum | 运动类别：`track` / `jump` / `throw` / `coordination` / `strength` |
| `movementPattern` | enum | 基础动作模式 |
| `applicableGrades` | string[] | 适用年级，如 `["grade-7", "grade-8", "grade-9"]` |
| `equipment` | string[] | 所需器材 |
| `venue` | string | 场地要求 |
| `skillUnits` | SkillUnit[] | 按执行顺序排列的技能单元 |
| `teachingProgression` | TeachingPhase[] | 教学梯度（可与执行顺序不同） |
| `assessmentRules` | AssessmentRule[] | 评价规则（可选） |

### 第二层：SkillUnit（技能单元）
| 字段 | 类型 | 说明 |
|------|------|------|
| `unitId` | string | 唯一标识 |
| `name` | string | 阶段中文名称 |
| `order` | number | 执行顺序（1-based） |
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
| `skillUnitId` | string | 关联的技能单元 ID |
| `fullScoreStandard` | object | 满分标准（含量化阈值） |
| `deductionPoints` | array | 扣分项（含量化触发条件） |
| `correctionStrategy` | object | 纠偏策略（练习+口令+手法） |

## 第一批数据（5 个项目）

| 项目 | 类别 | 动作模式 | 技能单元 | 错误模式 | 练习方法 |
|------|------|----------|:---:|:---:|:---:|
| 50米跑 | 径赛 | 线性位移 | 4 | 9 | 11 |
| 立定跳远 | 跳跃 | 垂直跳跃 | 4 | 8 | 12 |
| 1分钟跳绳 | 协调 | 周期性协调 | 3 | 7 | 10 |
| 掷实心球 | 投掷 | 过顶投掷 | 5 | 7 | 11 |
| 引体向上 | 力量 | 拉力模式 | 4 | 9 | 13 |

覆盖了 **跑、跳、投、协调、力量** 五大基础动作模式。

## 应用场景

- **VLA 模型训练**：为机器人学习管线提供结构化动作数据
- **AI 体育评分**：构建自动化动作规范性评估系统
- **机器人自我纠错**：训练机器人检测并修正自身动作错误
- **体育教育科技**：驱动 AI 体育教学助手
- **运动科学研究**：为生物力学和动作学习研究提供标准化数据集

## 项目结构

```
├── schema/                  # JSON Schema + TypeScript 类型定义
│   ├── sport.schema.json
│   ├── skill-unit.schema.json
│   ├── assessment-rule.schema.json
│   └── index.d.ts
├── data/                    # 各运动项目 JSON 数据文件
│   ├── 50m-sprint.json
│   ├── standing-long-jump.json
│   ├── 1min-rope-skipping.json
│   ├── medicine-ball-throw.json
│   └── pull-up.json
├── examples/                # 使用示例
│   ├── load-data.ts
│   └── load-data.py
├── tools/                   # 验证工具
│   └── validate.ts
└── docs/                    # 详细文档
```

## 数据验证

```bash
npx tsx tools/validate.ts
```

## 贡献

欢迎贡献！以下方向尤其需要帮助：
- **更多运动项目**：篮球、足球、体操、武术、游泳……
- **英文翻译**：为现有中文内容添加英文名称和描述
- **视频数据集**：与本数据结构配套的关键帧标注视频
- **框架集成**：PyTorch、TensorFlow、JAX 的数据加载器

## 商业合作

商业授权、定制数据集或咨询服务，请联系作者：lixu.198808@163.com

## 许可证

MIT — 详见 [LICENSE](LICENSE)
