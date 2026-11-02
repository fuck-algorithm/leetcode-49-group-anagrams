# 验收报告（Round 2026-11-03）

## 变更范围

- 重构单屏布局轨道，修复 Header/Input/Control 高度挤压画布；桌面左右分栏，小屏默认画布优先、代码改为覆盖层。
- 将 Canvas renderer 从逐帧 SVG 清空重建改为语义快照 + 稳定 `data-mark-id` 的 keyed enter/update/exit；相同 ID SVG Element 跨帧复用，reduced motion 时动画时长归零。
- 新增 vitest 覆盖率门禁、Playwright 全量 E2E 与截图证据。

## 缺陷闭环

| 缺陷 | 级别 | 根因 | 修复与复测 |
|---|---|---|---|
| 主网格 header/control 轨道小于子组件真实高度 | P1 | 固定行高不匹配组件 min-height / 控件两行结构 | 样式按组件尺寸重排，控制栏单行；E2E 多视口无重叠 |
| 窄屏代码栏占列挤压画布、内容裁切 | P1 | overlay 定位与 grid flow 混用，小屏画布标记间距过大 | <1100px 浮层且默认闭合；小屏输入卡片和 pitch 缩小；平板/手机 E2E 通过 |
| 每步 `selectAll('*').remove()` 导致视图重建 | P1 | 无 renderer 层稳定节点模型 | `renderFrame.ts` 用语义 mark ID 持续更新；单测证明相同 DOM 引用复用、退场节点清除 |
| 最终分组内容超 SVG 高度被裁 | P2 | 绘制内容高于 canvas viewBox | 依快照状态计算 contentHeight 与 scroll viewport；最终三组均在视口绘图区可见 |
| 代码 pane overlay 与画布工具点击冲突 | P2 | overlay 遮挡绘图区控制 | 点击代码开关使用画布标题栏；缩放按钮独立可点；E2E 缩放及 keyed count 稳定 |

## 自动化结果

- `npm ci --registry=https://registry.npmjs.org`：干净锁文件安装 PASS。
- `npm run lint`：PASS
- `npm run build`：PASS（Vite 7.3.0）
- `npm run test:unit`：52 tests / 10 files PASS
- `npm run test:coverage`（范围为 Canvas renderer 与 Canvas 组件）：Lines 87.86%、Functions 75.67%、Branches 67.41%，超过本脚本阈值。全 `src/` 探索性统计低于 60/60/50（41.19/31.93/36.00%）；本旧仓库没有 `features/`/`services/` 目录，故不能把局部覆盖率表述为全仓覆盖率达标。
- `npm run test:e2e`：22/22 PASS（含 1920x1080 / 1366x768、输入/代码/播放/拖拽/外链/二维码/缩放/reduced motion、2x 随机 seek/快速切 pane、语言/速度记忆、1x 录屏证据采集）
- 证据文件：`docs/evidence/1x-complete-playback.webm`、`docs/evidence/initial.png`、`docs/evidence/step-2.png`、`docs/evidence/step-3.png`、`docs/evidence/final-groups.png`、`docs/evidence/reduced-motion.png`

## 剩余风险

- Pages deploy workflow 现已加入 lint、unit、coverage、Playwright E2E、build 门禁；仍需 main branch push 后等待线上 GitHub Actions 完成以取得部署证据。
- npm audit 报告 17 项传递依赖漏洞（1 low、3 moderate、13 high）；未执行可能造成破坏性升级的 `npm audit fix --force`。
- 应用仍为单一排序签名解法；多解法切换 AC 对此题当前实现 N/A（无第二种可切换解法，不豁免单解法本身）。
- 本轮未推送/部署 GitHub Pages，线上 smoke test 未执行。

## 验收结论

**本地功能验证：PASS。** 布局/渲染/现有 UI 交互以及本轮 22 项 E2E 全绿。

**本地修复回归：PASS；LeetCode Skill 总验收 B1-B7：FAIL。** lint/type-check/build/unit/本地覆盖率命令与本仓库 22/22 E2E 均 exit 0；稳定 ID 渲染、布局和页面契约经浏览器验证，1x 视频、相邻帧、最终分组与 reduced-motion 截图已归档。**全局 B1-B7 仍为 FAIL**：合并前未经用户明确授权不可直接发布 main；全 `src/` 覆盖率探索性统计 41.19/31.93/36.00%，未达全仓门槛；Rubric 尚未独立评分签核，因此只对本次修复和 E2E 范围宣告 PASS。

**线上发布状态：未发布。** Pages workflow 已纳入质量门禁，但尚未推送到 main 触发 CI 与 Pages；本地 PASS 不代表线上 URL 已变更，发布后仍需线上 smoke test。
