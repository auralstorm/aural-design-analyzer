## Why

现有的网站设计分析工具大多只提供碎片化的信息（如单个颜色值或字体名称），无法系统性地提取一个网站完整的设计语言和结构化规范。开发者和设计师需要一个能一键分析目标网站、自动提炼出设计体系并生成可直接用于 AI 对话的 Prompt 的工具，从而快速复刻或借鉴优秀网站的设计风格。

## What Changes

- 新建 Chrome 浏览器扩展（Manifest V3），支持在任意网页上激活分析
- 通过 Content Script 注入页面，提取完整的设计语言（颜色体系、排版系统、间距规范、阴影/圆角/动效等视觉 Token）
- 分析页面 DOM 结构、语义化层级、布局模式（Grid/Flex/定位方式）、组件拆分
- 将提取的设计数据和结构信息整合，生成一份结构化的 Prompt 文档
- 提供 Popup 界面展示分析结果概览，支持一键复制生成的 Prompt

## Capabilities

### New Capabilities
- `design-extraction`: 从页面中提取设计 Token——颜色、字体、间距、阴影、圆角、边框、动画/过渡等视觉规范，识别设计体系中的主色/辅色/中性色、字体层级、间距比例
- `structure-analysis`: 分析页面 DOM 结构与语义化标签使用、布局模式（CSS Grid/Flexbox/绝对定位）、组件层级拆分、响应式断点、可访问性标记
- `prompt-generation`: 将设计提取和结构分析的结果整合为一份结构化 Prompt，包含设计系统描述、组件规范、布局指南，可直接用于 AI 工具复现或参考该网站设计

### Modified Capabilities

## Impact

- 新增完整的 Chrome 扩展项目结构（manifest.json、background service worker、content script、popup UI）
- 依赖：Chrome Extensions API（Manifest V3）、DOM API、CSSOM API
- 无后端依赖，所有分析在客户端本地完成
- 输出为纯文本 Prompt，无外部 API 调用
