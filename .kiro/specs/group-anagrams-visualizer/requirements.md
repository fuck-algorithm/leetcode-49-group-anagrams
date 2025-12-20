# 需求文档

## 简介

本项目是一个用于教学目的的算法演示网站，专门展示LeetCode第49题"字母异位词分组"算法的执行过程。网站使用TypeScript + React + D3.js技术栈构建，支持分步骤演示算法执行过程，包含代码高亮、变量追踪、可视化画布等功能，帮助用户深入理解算法原理。项目部署在GitHub Pages上，是一个单屏幕应用。

## 术语表

- **字母异位词（Anagram）**: 由相同字母重新排列组成的不同单词
- **算法步骤（Algorithm Step）**: 算法执行过程中的一个离散状态
- **画布（Canvas）**: 用于绘制数据结构可视化的D3.js渲染区域
- **控制面板（Control Panel）**: 包含播放控制按钮的UI组件
- **代码面板（Code Panel）**: 显示算法源代码并支持debug效果的组件
- **进度条（Progress Bar）**: 显示当前算法执行进度的可拖拽组件
- **IndexedDB**: 浏览器内置的客户端数据库，用于持久化存储用户偏好
- **HashMap**: 哈希映射数据结构，用于存储键值对

## 需求

### 需求1：页面标题与导航

**用户故事：** 作为用户，我希望页面有清晰的标题和导航，以便我能快速了解这是什么算法并访问相关资源。

#### 验收标准

1. WHEN 用户访问页面 THEN 系统 SHALL 在页面顶部显示标题"49. 字母异位词分组"，格式与LeetCode题目标题保持一致
2. WHEN 用户点击标题 THEN 系统 SHALL 在新标签页中打开LeetCode对应题目页面
3. WHEN 页面加载完成 THEN 系统 SHALL 确保所有内容在单屏幕内展示，无需滚动

### 需求2：GitHub徽标与Star数

**用户故事：** 作为用户，我希望能看到项目的GitHub信息并方便地访问仓库，以便我能查看源码或给项目Star支持。

#### 验收标准

1. WHEN 页面加载 THEN 系统 SHALL 在页面左上角显示GitHub徽标图标
2. WHEN 用户点击GitHub徽标 THEN 系统 SHALL 在新标签页中打开项目的GitHub仓库页面
3. WHEN 页面加载 THEN 系统 SHALL 在GitHub徽标旁边显示仓库的Star数
4. WHEN 系统获取Star数 THEN 系统 SHALL 使用GitHub API获取最新数据，并在一小时内不重复请求
5. WHEN 系统获取Star数 THEN 系统 SHALL 使用IndexedDB缓存Star数据
6. IF GitHub API请求失败 THEN 系统 SHALL 读取IndexedDB中缓存的上次Star数
7. IF 缓存不存在且API请求失败 THEN 系统 SHALL 显示默认值0
8. WHEN 用户将鼠标悬停在GitHub徽标上 THEN 系统 SHALL 显示提示"点击去GitHub仓库Star支持一下"

### 需求3：代码展示与Debug效果

**用户故事：** 作为用户，我希望看到算法代码并能像调试器一样看到当前执行的行和变量值，以便理解算法执行过程。

#### 验收标准

1. WHEN 页面加载 THEN 系统 SHALL 在代码面板中显示带有行号的算法代码
2. WHEN 页面加载 THEN 系统 SHALL 支持Java、Python、Golang、JavaScript四种语言的代码展示
3. WHEN 用户切换代码语言 THEN 系统 SHALL 使用IndexedDB记住用户的语言选择
4. WHEN 用户再次访问页面 THEN 系统 SHALL 自动切换到用户上次选择的语言
5. WHEN 代码显示 THEN 系统 SHALL 对每种语言应用语法高亮，区分关键字、字符串、注释等
6. WHEN 算法执行到某一步 THEN 系统 SHALL 高亮显示当前执行的代码行
7. WHEN 变量值发生变化 THEN 系统 SHALL 在对应代码行的右侧显示变量的当前内存值
8. WHEN 代码显示 THEN 系统 SHALL 确保代码正确对齐，无缩进问题
9. WHEN 代码显示 THEN 系统 SHALL 确保代码框宽度和高度适中，尽量避免出现滚动条

### 需求4：算法可视化画布

**用户故事：** 作为用户，我希望在画布上看到数据结构的可视化展示，以便直观理解算法的数据处理过程。

#### 验收标准

1. WHEN 页面加载 THEN 系统 SHALL 将页面绝大部分空间分配给画布区域
2. WHEN 算法执行 THEN 系统 SHALL 在画布上绘制输入字符串数组的可视化表示
3. WHEN 算法执行 THEN 系统 SHALL 在画布上绘制HashMap数据结构，清晰展示key和value
4. WHEN 用户拖动画布 THEN 系统 SHALL 允许平移画布视图
5. WHEN 用户使用鼠标滚轮 THEN 系统 SHALL 允许缩放画布
6. WHEN 数据结构较大 THEN 系统 SHALL 自适应调整视图以展示完整内容
7. WHEN 算法状态变化 THEN 系统 SHALL 在画布上显示相关的文字说明标签
8. WHEN 数据发生变更 THEN 系统 SHALL 使用箭头指示数据流向，并在箭头旁显示说明文字
9. WHEN 字符串被分组 THEN 系统 SHALL 用动画展示字符串移动到对应分组的过程
10. WHEN 绘制元素 THEN 系统 SHALL 确保元素分散在画布上，避免重叠

### 需求5：播放控制面板

**用户故事：** 作为用户，我希望能控制算法演示的播放，以便按自己的节奏学习。

#### 验收标准

1. WHEN 用户点击"上一步"按钮或按左方向键 THEN 系统 SHALL 回退到上一个算法步骤
2. WHEN 用户点击"下一步"按钮或按右方向键 THEN 系统 SHALL 前进到下一个算法步骤
3. WHEN 用户点击"播放"按钮或按空格键 THEN 系统 SHALL 自动播放算法步骤
4. WHEN 用户点击"暂停"按钮或按空格键 THEN 系统 SHALL 暂停自动播放
5. WHEN 用户点击"重置"按钮或按R键 THEN 系统 SHALL 将算法重置到初始状态
6. WHEN 控制按钮显示 THEN 系统 SHALL 在按钮上显示对应的快捷键提示文案（←、→、空格、R）
7. WHEN 页面加载 THEN 系统 SHALL 提供播放速度调节功能，默认速度为1x
8. WHEN 用户调整播放速度 THEN 系统 SHALL 使用IndexedDB记住用户的速度选择
9. WHEN 用户再次访问页面 THEN 系统 SHALL 恢复用户上次选择的播放速度
10. WHEN 播放速度调节 THEN 系统 SHALL 使用自定义组件而非原生组件

### 需求6：进度条

**用户故事：** 作为用户，我希望看到算法执行的进度，并能快速跳转到任意步骤。

#### 验收标准

1. WHEN 页面显示 THEN 系统 SHALL 在控制面板底部显示宽度为100%的进度条
2. WHEN 算法执行 THEN 系统 SHALL 将已播放部分显示为绿色，未播放部分显示为灰色
3. WHEN 用户拖动进度条 THEN 系统 SHALL 跳转到对应的算法步骤
4. WHEN 进度条显示 THEN 系统 SHALL 支持类似视频播放器的拖拽交互

### 需求7：用户数据输入

**用户故事：** 作为用户，我希望能输入自定义数据来测试算法，以便验证我对算法的理解。

#### 验收标准

1. WHEN 页面显示 THEN 系统 SHALL 在标题下方显示紧凑的数据输入区域
2. WHEN 用户输入自定义数据 THEN 系统 SHALL 接受用户输入的字符串数组
3. WHEN 页面显示 THEN 系统 SHALL 平铺展示多个内置数据样例供用户点击选择
4. WHEN 用户点击"随机生成" THEN 系统 SHALL 生成符合题目约束的随机字符串数组
5. WHEN 用户提交数据 THEN 系统 SHALL 验证输入数据的合法性
6. WHEN 验证数据 THEN 系统 SHALL 检查字符串仅包含小写字母
7. WHEN 验证数据 THEN 系统 SHALL 检查数组长度在[1, 10000]范围内
8. WHEN 验证数据 THEN 系统 SHALL 检查每个字符串长度在[0, 100]范围内
9. IF 用户输入的数据不合法 THEN 系统 SHALL 显示错误提示并阻止算法执行

### 需求8：微信交流群悬浮球

**用户故事：** 作为用户，我希望能方便地加入算法交流群，以便与其他学习者交流。

#### 验收标准

1. WHEN 页面显示 THEN 系统 SHALL 在右下角显示带有"交流群"字样的悬浮球图标
2. WHEN 用户将鼠标悬停在悬浮球上 THEN 系统 SHALL 显示微信二维码图片
3. WHEN 二维码显示 THEN 系统 SHALL 保持图片原有比例，不产生变形
4. WHEN 二维码显示 THEN 系统 SHALL 提示用户"微信扫码发送'leetcode'加入算法交流群"

### 需求9：自动部署

**用户故事：** 作为开发者，我希望代码提交后能自动部署到GitHub Pages，以便用户能访问最新版本。

#### 验收标准

1. WHEN 代码推送到主分支 THEN 系统 SHALL 触发GitHub Actions工作流
2. WHEN 工作流执行 THEN 系统 SHALL 构建项目并部署到GitHub Pages
3. WHEN 部署完成 THEN 系统 SHALL 使网站可通过GitHub Pages URL访问

### 需求10：算法步骤生成

**用户故事：** 作为用户，我希望算法的每一步都被清晰记录，以便我能逐步理解算法执行过程。

#### 验收标准

1. WHEN 算法开始执行 THEN 系统 SHALL 生成包含所有执行步骤的步骤序列
2. WHEN 步骤生成 THEN 系统 SHALL 记录每一步对应的代码行号（支持多语言行号映射）
3. WHEN 步骤生成 THEN 系统 SHALL 记录每一步的变量状态
4. WHEN 步骤生成 THEN 系统 SHALL 记录每一步的数据结构状态
5. WHEN 步骤生成 THEN 系统 SHALL 为每一步生成描述性文字说明
6. WHEN 步骤划分 THEN 系统 SHALL 尽可能详细地划分步骤，不省略关键步骤

### 需求11：页面配色

**用户故事：** 作为用户，我希望页面配色协调美观，以便获得良好的视觉体验。

#### 验收标准

1. WHEN 页面显示 THEN 系统 SHALL 使用协调统一的配色方案
2. WHEN 页面显示 THEN 系统 SHALL 严禁使用任何紫色
