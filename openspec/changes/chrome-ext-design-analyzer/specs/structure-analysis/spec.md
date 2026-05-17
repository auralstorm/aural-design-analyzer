## ADDED Requirements

### Requirement: 分析 DOM 层级结构
系统 SHALL 分析页面的 DOM 树结构，识别语义化标签使用情况（header、nav、main、section、article、aside、footer），输出页面的语义化结构概览。

#### Scenario: 分析语义化完善的页面
- **WHEN** 页面使用了标准 HTML5 语义化标签
- **THEN** 系统输出页面结构树，标注每个语义区域的层级关系和包含的主要内容类型

#### Scenario: 分析语义化不佳的页面
- **WHEN** 页面主要使用 div 嵌套而非语义化标签
- **THEN** 系统根据元素的 class 名称、ARIA 角色属性和视觉位置推断其语义角色，并在输出中标注「推断」

### Requirement: 识别布局模式
系统 SHALL 识别页面使用的 CSS 布局模式，包括 CSS Grid、Flexbox、浮动布局、绝对/固定定位，统计各布局模式的使用比例。

#### Scenario: 识别 Grid 布局
- **WHEN** 页面容器使用了 `display: grid`
- **THEN** 系统提取 `grid-template-columns`、`grid-template-rows`、`gap` 等属性，输出网格布局的列数、行数、间距配置

#### Scenario: 识别 Flex 布局
- **WHEN** 页面容器使用了 `display: flex`
- **THEN** 系统提取 `flex-direction`、`justify-content`、`align-items`、`gap`、`flex-wrap` 等属性，输出弹性布局的方向、对齐方式、间距

#### Scenario: 输出布局模式统计
- **WHEN** 分析完成
- **THEN** 系统输出各布局模式的使用比例（如 Flexbox 60%、Grid 25%、其他 15%）

### Requirement: 组件层级拆分
系统 SHALL 基于 DOM 结构和视觉特征识别页面中的可复用组件，包括导航栏、卡片、按钮、表单、列表、模态框等常见 UI 模式。

#### Scenario: 识别常见 UI 组件
- **WHEN** 页面包含导航栏、卡片列表、按钮等常见组件
- **THEN** 系统输出识别到的组件列表，每个组件包含：组件类型、在页面中的数量、关键样式特征（尺寸、颜色、排版）

#### Scenario: 识别重复模式
- **WHEN** 页面中存在多个结构相似的 DOM 子树
- **THEN** 系统将其标记为「可复用组件」，输出组件的通用结构描述和变体差异

### Requirement: 响应式断点检测
系统 SHALL 通过分析页面加载的 CSS 中的 `@media` 查询，提取响应式断点配置。

#### Scenario: 提取媒体查询断点
- **WHEN** 页面样式表中包含 `@media` 查询
- **THEN** 系统提取所有 `min-width` 和 `max-width` 断点值，按从小到大排列，标注常见设备类别（mobile/tablet/desktop）

#### Scenario: 无媒体查询的页面
- **WHEN** 页面样式表中无 `@media` 查询
- **THEN** 系统标注该页面未检测到响应式断点，可能为固定宽度布局或使用了容器查询等其他方案

### Requirement: 可访问性标记分析
系统 SHALL 分析页面的可访问性标记情况，包括 ARIA 属性使用、图片 alt 文本、表单 label 关联、焦点管理。

#### Scenario: 评估可访问性标记覆盖率
- **WHEN** 用户触发分析
- **THEN** 系统输出可访问性概要：ARIA 角色使用数量、图片 alt 文本覆盖率、表单元素 label 关联率、存在的 landmark 区域列表
