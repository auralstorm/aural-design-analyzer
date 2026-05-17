## Context

这是一个全新的 Chrome 浏览器扩展项目（Manifest V3），无现有代码基础。扩展需要在用户浏览任意网页时，通过 Content Script 注入分析逻辑，提取设计 Token 和页面结构信息，最终在 Popup 中呈现结果并生成可复制的 Prompt。

技术约束：
- Chrome Manifest V3 要求使用 Service Worker 替代 Background Page
- Content Script 运行在隔离的执行环境中，通过 `chrome.runtime` 消息与 Service Worker / Popup 通信
- 所有分析在客户端完成，无需后端服务
- 需要访问页面的 DOM 和 CSSOM（`window.getComputedStyle`）

## Goals / Non-Goals

**Goals:**
- 一键提取目标页面的完整设计语言（颜色、字体、间距、阴影、圆角、动画等）
- 识别并归类设计体系中的层级关系（主色/辅色/中性色、标题/正文/辅助字体层级、间距比例）
- 分析页面 DOM 结构、布局模式、组件层级
- 生成结构化、可直接粘贴到 AI 对话中的 Prompt
- Popup 界面简洁易用，支持分析结果预览和一键复制

**Non-Goals:**
- 不做跨页面/全站爬取分析（仅当前活动标签页）
- 不做实时设计对比或版本追踪
- 不内置 AI 模型调用（仅生成 Prompt 文本，用户自行粘贴到 AI 工具）
- 不做 CSS 代码生成（输出是描述性 Prompt，非代码）
- 不处理 Canvas / WebGL 渲染的内容

## Decisions

### 1. 扩展架构：Manifest V3 + Content Script + Popup

**选择**: Content Script 注入 + Service Worker 中转 + Popup 展示

**理由**: Content Script 是唯一能直接访问页面 DOM 和 CSSOM 的方式。Service Worker 负责消息路由和状态缓存，Popup 作为用户交互入口。这是 Manifest V3 下的标准架构模式。

**替代方案**:
- DevTools Panel：功能更强但使用门槛更高，目标用户（设计师/前端开发者）更习惯 Popup 交互
- Side Panel API：Chrome 114+ 才支持，兼容性不如 Popup

### 2. 设计 Token 提取策略：计算样式遍历 + 聚类归纳

**选择**: 遍历页面可见元素的 `getComputedStyle`，收集所有样式值后通过频率统计和聚类算法归纳出设计体系

**理由**: 直接读取计算样式是最可靠的方式，不依赖 CSS 源码是否可访问。聚类归纳能从数百个样式值中提炼出设计系统的核心 Token。

**替代方案**:
- 解析 CSS 样式表：受 CORS 限制，跨域样式表无法读取；且内联样式和动态样式无法覆盖
- 使用已有的设计 Token 提取库：目前没有成熟的浏览器端库能满足完整需求

### 3. 颜色空间处理：统一转换为 HSL 进行聚类

**选择**: 将所有提取到的颜色值统一转换为 HSL 色彩空间，基于 HSL 距离进行聚类

**理由**: HSL 空间更符合人类对颜色的感知方式，聚类结果更接近设计师的色彩分类习惯。便于区分主色调、辅助色、中性色。

**替代方案**:
- RGB 空间聚类：数学简单但不符合视觉感知
- OKLCH：感知均匀性更好，但实现复杂度较高，后续可升级

### 4. 数据流：Content Script → Service Worker → Popup

**选择**: Content Script 完成分析后将结果发送给 Service Worker 缓存，Popup 打开时从 Service Worker 读取

**理由**: Popup 关闭后 DOM 会被销毁，状态无法保持。Service Worker 作为中间层缓存分析结果，保证 Popup 重新打开时数据不丢失。

### 5. Prompt 生成：模板化 + 分节结构

**选择**: 预定义 Prompt 模板，按「设计系统概述 → 颜色规范 → 排版规范 → 间距规范 → 组件结构 → 布局指南」分节填充

**理由**: 结构化的 Prompt 更容易被 AI 模型理解和遵循。分节设计也方便用户按需裁剪。

## Risks / Trade-offs

- **性能风险**: 遍历大量 DOM 元素的计算样式可能导致页面卡顿 → 使用 `requestIdleCallback` 分批处理，设置元素数量上限（默认 1000 个可见元素）
- **样式准确性**: `getComputedStyle` 返回的是最终计算值，可能丢失设计意图（如 `rem` 被转为 `px`）→ 在 Prompt 中补充说明原始设计可能使用相对单位
- **动态内容**: SPA 路由切换或懒加载内容可能导致分析不完整 → 提供"重新分析"按钮，分析时机为用户主动触发
- **聚类质量**: 简单的频率统计可能无法准确还原设计体系 → 采用 K-means 变体，支持用户在 Popup 中微调聚类数量
- **Manifest V3 限制**: Service Worker 会被浏览器回收 → 关键数据使用 `chrome.storage.local` 持久化
