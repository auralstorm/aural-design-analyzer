## ADDED Requirements

### Requirement: 提取页面颜色体系
系统 SHALL 遍历页面所有可见元素，通过 `getComputedStyle` 提取所有颜色相关属性（`color`、`background-color`、`border-color`、`box-shadow` 中的颜色值、`outline-color`），并将结果统一转换为 HSL 格式进行聚类分析。

#### Scenario: 从普通网页提取颜色
- **WHEN** 用户在一个包含多种颜色的网页上触发分析
- **THEN** 系统提取所有可见元素的颜色属性值，去重后按 HSL 距离聚类，输出分类结果包含：主色（Primary）、辅助色（Secondary）、强调色（Accent）、中性色（Neutral）、背景色（Background），每个分类包含色值和出现频率

#### Scenario: 处理透明和继承颜色
- **WHEN** 元素的颜色值为 `transparent` 或 `rgba(0,0,0,0)`
- **THEN** 系统 SHALL 跳过该颜色值，不纳入聚类分析

### Requirement: 提取排版系统
系统 SHALL 提取页面中所有文本元素的排版属性，包括 `font-family`、`font-size`、`font-weight`、`line-height`、`letter-spacing`、`text-transform`，并按层级归类。

#### Scenario: 识别字体层级
- **WHEN** 页面包含标题（h1-h6）、正文、辅助文本等不同层级的文本
- **THEN** 系统输出排版层级表，包含每个层级的字体族、字号、字重、行高、字间距，层级按字号从大到小排列

#### Scenario: 识别使用的字体族
- **WHEN** 页面使用了多种字体
- **THEN** 系统列出所有使用的字体族名称及其使用频率，标注哪些是衬线体、无衬线体、等宽体

### Requirement: 提取间距规范
系统 SHALL 提取页面元素的 `margin`、`padding` 值，通过频率分析识别出间距比例体系。

#### Scenario: 识别间距比例
- **WHEN** 用户触发分析
- **THEN** 系统收集所有 margin 和 padding 值，按频率排序后识别出基础间距单元和倍数关系（如 4px 基础单元 → 4/8/12/16/24/32/48），输出间距比例表

### Requirement: 提取视觉效果 Token
系统 SHALL 提取页面中使用的 `border-radius`、`box-shadow`、`opacity`、`transition`、`transform` 等视觉效果属性。

#### Scenario: 提取圆角规范
- **WHEN** 页面元素使用了 border-radius
- **THEN** 系统归纳出圆角规范，列出使用的圆角值及频率，标注常用级别（如 small=4px, medium=8px, large=16px, full=9999px）

#### Scenario: 提取阴影规范
- **WHEN** 页面元素使用了 box-shadow
- **THEN** 系统归纳出阴影层级，按阴影大小从小到大排列，标注每个层级的完整 box-shadow 值及使用频率

#### Scenario: 提取动画/过渡
- **WHEN** 页面元素定义了 transition 或 animation 属性
- **THEN** 系统提取所有 transition 的 duration、timing-function、delay 及 animation-name，归纳出动效规范

### Requirement: 设计 Token 聚类算法
系统 SHALL 使用基于 HSL 色彩空间距离的聚类算法，将提取到的颜色值分组归类。聚类阈值可配置。

#### Scenario: 颜色聚类合并相近颜色
- **WHEN** 提取到多个视觉上相近的颜色值（HSL 距离小于阈值）
- **THEN** 系统将它们合并为同一组，取频率最高的颜色值作为该组代表色

#### Scenario: 处理极端情况
- **WHEN** 页面仅使用黑白两色
- **THEN** 系统 SHALL 正确输出仅包含中性色分类的结果，不强制生成主色/辅助色分类
