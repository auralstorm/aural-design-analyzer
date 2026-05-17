## 1. 项目初始化与扩展骨架

- [x] 1.1 创建 Chrome 扩展项目目录结构（src/、popup/、content/、background/、assets/）
- [x] 1.2 编写 manifest.json（Manifest V3），声明 permissions（activeTab、scripting、storage）、content_scripts、service_worker、popup
- [x] 1.3 搭建 Popup 页面骨架（popup.html + popup.css + popup.js），包含基本 UI 框架
- [x] 1.4 创建 Content Script 入口文件（content.js），验证注入和消息通信链路
- [x] 1.5 创建 Background Service Worker（background.js），实现消息路由和 chrome.storage 读写

## 2. 设计 Token 提取 — 颜色体系

- [x] 2.1 实现 DOM 遍历器：遍历页面所有可见元素，过滤不可见/零尺寸元素
- [x] 2.2 实现颜色属性提取：从 getComputedStyle 中读取 color、background-color、border-color、box-shadow 颜色值、outline-color
- [x] 2.3 实现颜色格式统一转换：将 rgb/rgba/hex/hsl 等格式统一转为 HSL 对象
- [x] 2.4 实现颜色聚类算法：基于 HSL 距离的 K-means 变体，将颜色分组
- [x] 2.5 实现颜色分类器：将聚类结果标注为主色/辅助色/强调色/中性色/背景色，计算各色值出现频率
- [x] 2.6 处理边界情况：透明色跳过、纯黑白页面降级、极少颜色页面处理

## 3. 设计 Token 提取 — 排版系统

- [x] 3.1 提取所有文本元素的排版属性：font-family、font-size、font-weight、line-height、letter-spacing、text-transform
- [x] 3.2 实现字体层级归类：按 font-size 从大到小排列，关联对应的 font-weight 和 line-height
- [x] 3.3 实现字体族统计：列出所有使用的 font-family 及使用频率，标注字体类别（衬线/无衬线/等宽）

## 4. 设计 Token 提取 — 间距与视觉效果

- [x] 4.1 提取所有元素的 margin 和 padding 值，统计频率分布
- [x] 4.2 实现间距比例识别算法：从频率数据中推断基础间距单元和倍数关系
- [x] 4.3 提取 border-radius 值并归纳圆角级别
- [x] 4.4 提取 box-shadow 值并归纳阴影层级
- [x] 4.5 提取 transition 和 animation 属性，归纳动效规范

## 5. 结构分析 — DOM 与布局

- [x] 5.1 实现语义化结构分析：识别 header/nav/main/section/article/aside/footer 等语义标签，生成结构树
- [x] 5.2 实现非语义化标签推断：根据 class 名称、ARIA 角色、视觉位置推断 div 的语义角色
- [x] 5.3 实现布局模式识别：检测 display: grid/flex/block/inline 等，提取 Grid 和 Flex 的关键属性
- [x] 5.4 实现布局模式统计：计算各布局模式使用比例

## 6. 结构分析 — 组件与响应式

- [x] 6.1 实现组件模式识别：基于 DOM 结构和样式特征识别导航栏、卡片、按钮、表单、列表等常见组件
- [x] 6.2 实现重复模式检测：比较 DOM 子树结构相似性，标记可复用组件
- [x] 6.3 实现响应式断点提取：解析可访问的 CSS 样式表中的 @media 查询，提取 min-width/max-width 断点
- [x] 6.4 实现可访问性标记分析：统计 ARIA 属性、alt 文本覆盖率、label 关联率

## 7. Prompt 生成引擎

- [x] 7.1 定义 Prompt 模板结构：8 个分节的标题和格式规范
- [x] 7.2 实现设计风格概述生成：根据颜色、排版、布局等数据自动生成一段总结性描述
- [x] 7.3 实现各分节数据填充：颜色规范（色值+用途）、排版规范（层级表）、间距规范（比例表）、视觉效果（圆角/阴影/动效）、页面结构（结构树）、组件规范（组件列表）、布局指南（模式+断点）
- [x] 7.4 实现分节缺失降级：数据不可用时自动省略对应分节
- [x] 7.5 实现 Prompt 文本格式化：确保输出为规范的 Markdown 格式

## 8. Popup 界面实现

- [x] 8.1 实现未分析状态引导界面：「分析当前页面」按钮 + 说明文字
- [x] 8.2 实现分析中加载状态：进度指示器 + 当前分析步骤提示
- [x] 8.3 实现颜色色板预览区：分类展示色块 + HEX 值
- [x] 8.4 实现排版预览区：使用实际字体和字号渲染示例文本
- [x] 8.5 实现分节勾选控件：允许用户选择/取消 Prompt 中包含的分节
- [x] 8.6 实现「复制 Prompt」按钮：复制到剪贴板 + 「已复制」反馈 + 2 秒恢复
- [x] 8.7 实现「重新分析」按钮：重新触发 Content Script 分析

## 9. 数据流与状态管理

- [x] 9.1 实现 Content Script → Service Worker 消息协议：定义分析结果的数据结构和消息类型
- [x] 9.2 实现 Service Worker 结果缓存：使用 chrome.storage.local 持久化分析结果
- [x] 9.3 实现 Popup → Service Worker 数据读取：Popup 打开时从缓存读取最新分析结果
- [x] 9.4 实现性能优化：requestIdleCallback 分批处理 DOM 遍历，元素数量上限 1000

## 10. 测试与打包

- [ ] 10.1 手动测试：在不同类型的网站（SPA、静态站、电商、博客）上验证分析结果准确性
- [ ] 10.2 边界测试：空白页面、超大页面、iframe 嵌套页面、纯图片页面
- [ ] 10.3 性能测试：在大型页面（>1000 个元素）上验证分析耗时在可接受范围内
- [ ] 10.4 打包扩展为 .zip，准备 Chrome Web Store 发布所需素材（图标、描述、截图）
