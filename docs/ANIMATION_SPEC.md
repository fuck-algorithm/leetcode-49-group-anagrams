# 字母异位词分组动画规格（2026-11-03）

## 可观察结构与坐标

- 输入泳道：每个字符串以固定输入索引构成节点；小屏使用较密集的固定 pitch。
- 字符签名泳道：拆分字符、显示排序结果与签名；固定在输入泳道下方。
- Map 泳道：Map key 代表排序签名，value 卡片代表原始单词；按 key 的插入顺序形成稳定行。
- 节点身份规则：`input-{index}-*`、`letter-{index}-*`、`group-{signature}-key-*`、`group-{signature}-value-{index}-*`。动画不生成随机布局。

## 操作/状态映射

| 事件 | operation | 视觉变化 |
|---|---|---|
| 空 Map | init | 三条泳道与空 Map 注释出现 |
| 读取字符串 | read | 输入索引节点显示当前态 |
| 拆分/排序字母 | move | 字符节点建立，签名 pill 更新 |
| 数据向下流动 | read / insert | 输入泳道 → 签名泳道 → Map 泳道使用真实 SVG path 与箭头尖串成处理方向；旁标“读取单词 ↓”和“用 key 查 Map ↓”；宽度 950px 以上的画布显示双段流向，窄屏也保留从左侧绘图区边缘指向下游泳道的箭头和说明 |
| 查找 key | compare | Map lookup 判定文字说明命中/未命中 |
| 新建 key 或追加原词 | insert | 对应签名行与原词列表增量出现 |
| 返回分组 | done | 最终 Map 分组留在画布 |

## keyed 渲染与运动

- SVG `canvas-layer` 生命周期跨步骤复用；每个图元按 `data-mark-id` 精确查找和更新，不按步骤清空 SVG。
- 更新相同 ID 时复用同一个 SVG Element；未出现的新 ID enter；退出 ID 采用 `MOTION.exit` 淡出后删除。
- 1x 更新时长 240ms、enter 180ms、exit 140ms；大跨度跳步和 `prefers-reduced-motion` 下 JS 动效为 0。
- 稳定节点位置由输入索引、Map 行号、字符串签名决定；屏幕 resize 只重新计算几何，不改变 ID。

## reduced motion 与布局

- 画布 renderer 接收 reduced-motion 查询结果，把 mark opacity transition duration 设为 0，仅同步位置/属性/解说/代码高亮。
- CSS reduced-motion 全局规则关闭界面 transition/animation；步骤/代码/画布状态更新仍完整。
- 1920×1080、1366×768 默认并列显示代码；低于 1100px 默认优先展示画布，代码按钮打开浮层，避免压缩 SVG 高度。

## 验证证据

- 单测验证稳定输入 ID、Map 签名 ID、原 DOM 引用跨帧复用、退出 mark 被移除。
- 浏览器视口：1920×1080 卡片 86vh/SVG 78vh；1366×768 卡片 80vh/SVG 69vh；1024×768 画布优先代码浮层；390×844 画布优先、单屏无页面溢出。
- E2E 执行覆盖 1x 快速逐步播放录像、2x 倍速、10 次进度跳转、4 次快速代码切换、reduced-motion、最终 41 步 Map 分组及代码联动。
- 证据文件：`docs/evidence/1x-complete-playback.webm`、`docs/evidence/initial.png`、`docs/evidence/step-2.png`、`docs/evidence/step-3.png`、`docs/evidence/final-groups.png`、`docs/evidence/reduced-motion.png`。
