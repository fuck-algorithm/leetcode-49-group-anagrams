# 设计文档

## 概述

本项目是一个基于TypeScript + React + D3.js的算法演示网站，用于可视化展示LeetCode第49题"字母异位词分组"算法的执行过程。网站采用单页面应用架构，支持分步骤演示、多语言代码调试效果、交互式画布等功能。所有用户偏好（语言选择、播放速度）通过IndexedDB持久化存储。

## 架构

### 技术栈

- **前端框架**: React 18 + TypeScript
- **可视化库**: D3.js
- **构建工具**: Vite
- **样式方案**: CSS
- **持久化存储**: IndexedDB
- **部署平台**: GitHub Pages
- **CI/CD**: GitHub Actions

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        App Container                         │
├─────────────────────────────────────────────────────────────┤
│  Header (标题 + GitHub徽标 + Star数)                         │
├─────────────────────────────────────────────────────────────┤
│  InputPanel (数据输入 + 样例选择 + 随机生成)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │    CodePanel        │  │       Canvas                │  │
│  │    (多语言代码)      │  │       (D3.js可视化)         │  │
│  │    (语法高亮)        │  │       (HashMap展示)         │  │
│  │    (变量追踪)        │  │       (动画效果)            │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ControlPanel (播放控制 + 速度调节 + 进度条)                  │
├─────────────────────────────────────────────────────────────┤
│  WeChatFloat (微信悬浮球)                                    │
└─────────────────────────────────────────────────────────────┘
```

## 组件与接口

### 核心组件

#### 1. App
- 根组件，管理全局状态
- 协调各子组件之间的通信
- 管理算法步骤和播放状态

#### 2. Header
- 显示页面标题"49. 字母异位词分组"
- 标题链接到LeetCode题目页面（新标签页打开）
- 显示GitHub徽标和Star数
- GitHub徽标链接到仓库（新标签页打开）
- 悬停提示"点击去GitHub仓库Star支持一下"

#### 3. InputPanel
- 用户数据输入框
- 内置样例按钮（平铺展示）
- 随机生成按钮
- 运行按钮
- 数据验证与错误提示

#### 4. CodePanel
- 支持Java、Python、Golang、JavaScript四种语言
- 语言切换选项卡
- 语言选择通过IndexedDB持久化
- 行号显示
- 当前行高亮
- 变量值内联显示（在代码行右侧）
- 语法高亮（使用prism-react-renderer）

#### 5. Canvas
- D3.js渲染的SVG画布
- 绘制输入字符串数组
- 绘制HashMap数据结构（清晰展示key和value）
- 支持拖拽平移
- 支持滚轮缩放
- 自适应视图调整
- 文字说明标签
- 箭头指示数据流向
- 分组动画效果
- 元素分散布局，避免重叠

#### 6. ControlPanel
- 上一步按钮（显示←快捷键）
- 下一步按钮（显示→快捷键）
- 播放/暂停按钮（显示空格快捷键）
- 重置按钮（显示R快捷键）
- 播放速度调节（自定义组件，非原生）
- 速度选择通过IndexedDB持久化
- 可拖拽进度条（绿色已播放，灰色未播放）

#### 7. WeChatFloat
- 右下角悬浮球（显示"交流群"字样）
- 悬停显示微信二维码
- 保持图片原有比例
- 提示文案

### 核心接口

```typescript
// 支持的编程语言
type ProgrammingLanguage = 'java' | 'python' | 'golang' | 'javascript';

// 多语言代码行号映射
interface LineNumberMapping {
  java: number;
  python: number;
  golang: number;
  javascript: number;
}

// 算法步骤
interface AlgorithmStep {
  stepIndex: number;
  lineNumbers: LineNumberMapping;
  description: string;
  variables: Record<string, any>;
  inputArray: string[];
  groups: Map<string, string[]>;
  currentString?: string;
  currentKey?: string;
  highlightedElements: string[];
  dataFlow?: {
    from: string;
    to: string;
    label: string;
  };
}

// 播放状态
interface PlaybackState {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  playbackSpeed: number;
}

// 输入数据
interface InputData {
  strings: string[];
  isValid: boolean;
  errorMessage?: string;
}

// 画布变换
interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

// 用户偏好（IndexedDB存储）
interface UserPreferences {
  selectedLanguage: ProgrammingLanguage;
  playbackSpeed: number;
}

// GitHub Star缓存
interface StarCache {
  count: number;
  timestamp: number;
}
```

## 数据模型

### 算法步骤生成

算法使用排序方法对字母异位词进行分组。步骤生成器会详细记录每个操作：

1. **初始化步骤**: 创建HashMap
2. **遍历步骤**: 对每个字符串
   - 获取当前字符串
   - 对字符串字符排序得到key
   - 检查HashMap中是否存在该key
   - 将字符串添加到对应分组
   - 更新HashMap状态
3. **完成步骤**: 返回所有分组

### 变量追踪

追踪的变量包括：
- `strs`: 输入字符串数组
- `map`: HashMap<String, List<String>>
- `str`: 当前处理的字符串
- `key`: 排序后的字符串（作为分组键）
- `i`: 循环索引

### 多语言代码行号映射

每个步骤记录四种语言对应的代码行号，确保切换语言时高亮行正确同步。

### IndexedDB存储结构

```
Database: algorithm-visualizer
├── Store: preferences
│   ├── selectedLanguage: ProgrammingLanguage
│   └── playbackSpeed: number
└── Store: github-cache
    ├── starCount: number
    └── timestamp: number
```

## 正确性属性

*属性是一个在系统所有有效执行中都应该保持为真的特征或行为——本质上是关于系统应该做什么的形式化陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性1: 步骤导航一致性
*对于任意*当前步骤索引n，如果0 < n < totalSteps，执行"上一步"操作后步骤索引应为n-1；如果0 <= n < totalSteps-1，执行"下一步"操作后步骤索引应为n+1
**验证: 需求 5.1, 5.2**

### 属性2: 重置状态一致性
*对于任意*当前播放状态，执行"重置"操作后，步骤索引应为0，播放状态应为暂停
**验证: 需求 5.5**

### 属性3: 进度条同步
*对于任意*进度条位置p（0 <= p <= 1），拖动到该位置后，当前步骤索引应为floor(p * (totalSteps - 1))
**验证: 需求 6.3**

### 属性4: 代码行高亮同步
*对于任意*算法步骤和当前选择的语言，代码面板高亮的行号应与该步骤记录的对应语言lineNumber一致
**验证: 需求 3.6**

### 属性5: 变量显示同步
*对于任意*算法步骤，代码面板显示的变量值应与该步骤记录的variables一致
**验证: 需求 3.7**

### 属性6: 随机数据合法性
*对于任意*随机生成的数据，所有字符串应仅包含小写字母a-z，数组长度应在[1, 10]范围内（演示用），每个字符串长度应在[1, 10]范围内
**验证: 需求 7.4**

### 属性7: 输入验证正确性
*对于任意*输入数据，如果包含非小写字母字符、数组长度超出[1, 10000]范围、或字符串长度超出[0, 100]范围，验证函数应返回false并提供错误信息
**验证: 需求 7.5, 7.6, 7.7, 7.8, 7.9**

### 属性8: 步骤完整性
*对于任意*有效输入数据，生成的步骤序列应包含完整的算法执行过程，每个步骤应包含lineNumbers（多语言映射）、description（非空）、variables和当前数据状态
**验证: 需求 10.1, 10.2, 10.3, 10.4, 10.5**

### 属性9: 画布状态同步
*对于任意*算法步骤，画布上显示的分组状态应与该步骤记录的groups一致
**验证: 需求 4.7**

### 属性10: 语言选择持久化
*对于任意*语言选择操作，存储到IndexedDB后再读取，应得到相同的语言值
**验证: 需求 3.3, 3.4**

### 属性11: 播放速度持久化
*对于任意*播放速度设置，存储到IndexedDB后再读取，应得到相同的速度值
**验证: 需求 5.8, 5.9**

### 属性12: Star缓存有效期
*对于任意*缓存时间戳，如果当前时间距离缓存时间不足一小时，系统不应发起新的GitHub API请求
**验证: 需求 2.4**

## 错误处理

### 输入验证错误
- 空输入: 显示"请输入字符串数组"
- 非法字符: 显示"字符串只能包含小写字母"
- 数组长度超限: 显示"数组长度必须在1到10000之间"
- 字符串长度超限: 显示"每个字符串长度必须在0到100之间"

### GitHub API错误
- 请求失败: 读取IndexedDB缓存
- 缓存不存在: 显示默认值0

### 运行时错误
- 步骤越界: 自动限制在有效范围内
- 画布渲染失败: 显示错误提示并提供重试选项

## 测试策略

### 单元测试

使用Vitest进行单元测试：
- 算法步骤生成器测试
- 输入验证函数测试
- 播放控制逻辑测试
- IndexedDB存储/读取测试

### 属性测试

使用fast-check进行属性测试：
- 每个属性测试运行至少100次迭代
- 测试注释格式: `**Feature: group-anagrams-visualizer, Property {number}: {property_text}**`

属性测试覆盖：
- 步骤导航一致性
- 重置状态一致性
- 进度条同步
- 代码行高亮同步
- 变量显示同步
- 随机数据合法性
- 输入验证正确性
- 步骤完整性
- 画布状态同步
- 语言选择持久化
- 播放速度持久化
- Star缓存有效期

### 端到端测试

使用Playwright进行E2E测试：
- 页面加载测试
- 用户交互测试
- 键盘快捷键测试
- 多语言切换测试
- 进度条拖拽测试
