<div align="center">
  <img src="src/icons/icon128.png" alt="Aural Design Analyzer" width="128" />
  <h1>Aural Design Analyzer</h1>
  <p>
    一键分析网站设计语言，生成结构化 AI Prompt<br/>
    <em>One-click website design language analysis, generates structured AI prompts</em>
  </p>
</div>

---

## 功能特性 / Features

### 分析维度 / Analysis Dimensions

| 维度 | Dimension | 说明 |
|------|-----------|------|
| 颜色体系 | Colors | 主色/辅助色/强调色/中性色分类，渐变检测 |
| 排版系统 | Typography | 字体族、字号层级、字重、行高 |
| 间距规范 | Spacing | 间距值频率统计，基础单元推导 |
| 视觉效果 | Effects | 圆角、阴影、过渡动画、@keyframes |
| 页面结构 | Structure | 语义化标签树、ARIA 角色、布局模式 |
| 组件规范 | Components | 导航栏/按钮/卡片/表单等 8 种组件检测 |
| 布局指南 | Layout | Flex/Grid 分布、响应式断点 |
| 可访问性 | Accessibility | 对比度 (WCAG AA/AAA)、Alt 覆盖率、Label 关联率 |
| 设计令牌 | CSS Variables | 提取 `--*` 自定义属性，按类别分类 |
| 色彩模式 | Color Scheme | 深色/浅色模式支持检测 |

### 导出格式 / Export Formats

- **Prompt** — 复制到剪贴板，直接粘贴给 AI 使用
- **Markdown (.md)** — 下载为 Markdown 文件归档
- **JSON** — 机器可读的设计令牌
- **CSS Variables** — 直接可用的 CSS 自定义属性文件

### 其他特性 / Other Features

- 中英双语 Prompt 输出
- Prompt 预览面板
- 分节选择（自由勾选需要的分析维度）
- 勾选偏好自动持久化
- 结果缓存与过期检测

## 截图 / Screenshots

> 安装扩展后点击工具栏图标即可使用。

<!-- 
在此添加截图：
![popup 界面](screenshots/popup.png)
-->

## 安装 / Installation

### 本地加载 / Load Unpacked

1. 下载或克隆本仓库

   ```bash
   git clone https://github.com/your-username/aural-resonance.git
   ```

2. 打开 Chrome，访问 `chrome://extensions/`

3. 开启右上角 **开发者模式** (Developer mode)

4. 点击 **加载已解压的扩展程序** (Load unpacked)

5. 选择项目中的 `src` 目录

## 使用方法 / Usage

1. 打开任意网页
2. 点击浏览器工具栏中的 **Aural Design Analyzer** 图标
3. 在弹出窗口中点击 **分析当前页面**
4. 等待分析完成（实时进度条显示）
5. 查看分析结果预览（颜色、排版、间距、结构等）
6. 勾选需要的分节，点击 **复制 Prompt** 或使用其他导出方式

## 项目结构 / Project Structure

```
src/
├── manifest.json                  # Chrome Extension Manifest V3 配置
├── background.js                  # Service Worker，消息路由与结果缓存
├── icons/
│   ├── icon.png                   # 源图标
│   ├── icon16.png                 # 工具栏图标 16x16
│   ├── icon48.png                 # 扩展列表图标 48x48
│   └── icon128.png                # 商店/详情图标 128x128
├── content/                       # 内容脚本（注入目标页面执行分析）
│   ├── utils.js                   # 公共工具函数（颜色解析、HSL 转换、对比度计算）
│   ├── color-analyzer.js          # 颜色提取与聚类（含渐变检测）
│   ├── typography-analyzer.js     # 排版分析（字体族、层级）
│   ├── spacing-analyzer.js        # 间距分析（频率统计、基础单元推导）
│   ├── visual-effects-analyzer.js # 视觉效果（圆角、阴影、动画、@keyframes）
│   ├── structure-analyzer.js      # 页面结构（语义树、布局模式）
│   ├── component-analyzer.js      # 组件检测（8 种常见 UI 组件）
│   ├── responsive-analyzer.js     # 响应式断点 + 深色/浅色模式检测
│   ├── accessibility-analyzer.js  # 可访问性（对比度、Alt、Label、Landmark）
│   ├── css-variable-analyzer.js   # CSS 自定义属性提取与分类
│   └── main.js                    # 分析编排器，逐步执行并报告进度
└── popup/                         # 弹出窗口 UI
    ├── popup.html                 # 界面结构
    ├── popup.css                  # 样式（柔和渐变主题）
    ├── popup.js                   # 交互逻辑、渲染、导出
    └── prompt-generator.js        # Prompt/JSON/CSS 生成器（中英双语）
```

## 技术栈 / Tech Stack

- **Chrome Extension Manifest V3**
- **原生 JavaScript** — 无框架依赖，零构建步骤
- **CSS3** — 自定义属性、渐变、Grid/Flex 布局
- **Chrome APIs** — `chrome.scripting`、`chrome.storage`、`chrome.tabs`

## 工作原理 / How It Works

1. 点击扩展图标时，通过 `chrome.scripting.executeScript` 将分析脚本注入当前页面
2. 内容脚本遍历页面可见元素（上限 1000），通过 `getComputedStyle` 提取样式信息
3. 各分析器独立运行，通过 `chrome.runtime.sendMessage` 实时报告进度
4. 分析完成后结果缓存到 `chrome.storage.local`，Popup 渲染可视化预览
5. 用户选择需要的分节后，生成结构化 Prompt 并复制/导出

## 贡献 / Contributing

欢迎提交 Issue 和 Pull Request。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/your-feature`)
3. 提交更改 (`git commit -m 'Add your feature'`)
4. 推送到分支 (`git push origin feature/your-feature`)
5. 创建 Pull Request

## 许可证 / License

[MIT](LICENSE)
