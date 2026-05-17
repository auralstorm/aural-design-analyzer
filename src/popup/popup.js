const SECTIONS = [
  { id: 'overview', label: '设计风格概述', labelEn: 'Design Overview', default: true },
  { id: 'colors', label: '颜色规范', labelEn: 'Colors', default: true },
  { id: 'typography', label: '排版规范', labelEn: 'Typography', default: true },
  { id: 'spacing', label: '间距规范', labelEn: 'Spacing', default: true },
  { id: 'effects', label: '视觉效果', labelEn: 'Visual Effects', default: true },
  { id: 'structure', label: '页面结构', labelEn: 'Structure', default: true },
  { id: 'components', label: '组件规范', labelEn: 'Components', default: true },
  { id: 'layout', label: '布局指南', labelEn: 'Layout', default: true },
  { id: 'accessibility', label: '可访问性', labelEn: 'Accessibility', default: true },
  { id: 'cssVariables', label: '设计令牌', labelEn: 'Design Tokens', default: true }
];

const UI = {
  zh: {
    idleText: '点击下方按钮分析当前页面的设计语言',
    staleWarning: '缓存结果来自不同页面，建议重新分析',
    btnAnalyze: '分析当前页面',
    btnCopy: '复制 Prompt',
    btnCopyEmpty: '请至少选择一个分节',
    btnCopyNoData: '请先完成分析',
    btnCopied: '已复制',
    btnPreview: '预览',
    btnCollapse: '收起',
    btnReanalyze: '重新分析',
    btnRetry: '重试',
    btnDownloadMd: '下载 .md',
    btnExportJSON: '导出 JSON',
    btnExportCSS: '导出 CSS',
    selectAll: '全选',
    deselectAll: '取消全选',
    promptSelect: 'Prompt 内容选择',
    preparing: '准备开始分析...',
    errorDefault: '分析出错',
    errorPage: '无法分析此页面: ',
    errorCopy: '复制失败，请手动复制',
    sectionColors: '颜色体系',
    sectionTypography: '排版系统',
    sectionSpacing: '间距规范',
    sectionEffects: '视觉效果',
    sectionStructure: '页面结构',
    sectionComponents: '组件规范',
    sectionAccessibility: '可访问性',
    sectionCSSVariables: '设计令牌 (CSS 变量)',
    colorPrimary: '主色', colorSecondary: '辅助色', colorAccent: '强调色',
    colorNeutral: '中性色', colorBackground: '背景色', colorGradient: '渐变',
    effectRadius: '圆角', effectShadow: '阴影', effectAnimation: '动画',
    compNavbar: '导航栏', compButton: '按钮', compCard: '卡片', compForm: '表单',
    compList: '列表', compModal: '模态框', compHero: 'Hero', compInput: '输入框',
    a11yImgAlt: '图片 Alt 覆盖率', a11yFormLabel: '表单 Label 关联率',
    a11yAriaRoles: 'ARIA 角色数', a11yContrastAA: 'AA 对比度通过率',
    a11yContrastAAA: 'AAA 对比度通过率'
  },
  en: {
    idleText: 'Click below to analyze the design language of this page',
    staleWarning: 'Cached result is from a different page, re-analysis recommended',
    btnAnalyze: 'Analyze Page',
    btnCopy: 'Copy Prompt',
    btnCopyEmpty: 'Select at least one section',
    btnCopyNoData: 'Analyze first',
    btnCopied: 'Copied',
    btnPreview: 'Preview',
    btnCollapse: 'Collapse',
    btnReanalyze: 'Re-analyze',
    btnRetry: 'Retry',
    btnDownloadMd: 'Download .md',
    btnExportJSON: 'Export JSON',
    btnExportCSS: 'Export CSS',
    selectAll: 'All',
    deselectAll: 'None',
    promptSelect: 'Prompt Sections',
    preparing: 'Preparing analysis...',
    errorDefault: 'Analysis error',
    errorPage: 'Cannot analyze this page: ',
    errorCopy: 'Copy failed, please copy manually',
    sectionColors: 'Colors',
    sectionTypography: 'Typography',
    sectionSpacing: 'Spacing',
    sectionEffects: 'Visual Effects',
    sectionStructure: 'Page Structure',
    sectionComponents: 'Components',
    sectionAccessibility: 'Accessibility',
    sectionCSSVariables: 'Design Tokens (CSS Variables)',
    colorPrimary: 'Primary', colorSecondary: 'Secondary', colorAccent: 'Accent',
    colorNeutral: 'Neutral', colorBackground: 'Background', colorGradient: 'Gradients',
    effectRadius: 'Radius', effectShadow: 'Shadow', effectAnimation: 'Animation',
    compNavbar: 'Navbar', compButton: 'Button', compCard: 'Card', compForm: 'Form',
    compList: 'List', compModal: 'Modal', compHero: 'Hero', compInput: 'Input',
    a11yImgAlt: 'Image Alt Coverage', a11yFormLabel: 'Form Label Coverage',
    a11yAriaRoles: 'ARIA Roles', a11yContrastAA: 'AA Contrast Pass Rate',
    a11yContrastAAA: 'AAA Contrast Pass Rate'
  }
};

function L(key) {
  return UI[currentLang]?.[key] || UI.zh[key] || key;
}

let analysisData = null;
let selectedSections = new Set(SECTIONS.map(s => s.id));
let currentLang = 'zh';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const stored = await chrome.storage.local.get(['selectedSections', 'promptLang']);
  if (stored.selectedSections) {
    selectedSections = new Set(stored.selectedSections);
  }
  if (stored.promptLang) {
    currentLang = stored.promptLang;
    $('#langSwitch').value = currentLang;
  }

  updateUILanguage();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  $('#pageUrl').textContent = tab.url;

  let response = null;
  try {
    response = await chrome.runtime.sendMessage({
      type: 'GET_RESULTS',
      tabId: tab.id
    });
  } catch {
    // Background service worker not ready yet
  }

  if (response?.data) {
    if (response.data.url && response.data.url !== tab.url) {
      showIdle();
      $('#staleWarning').classList.remove('hidden');
    } else {
      analysisData = response.data;
      showResults();
    }
  } else {
    showIdle();
  }

  $('#btnAnalyze').addEventListener('click', () => startAnalysis(tab.id));
  $('#btnReanalyze').addEventListener('click', () => startAnalysis(tab.id));
  $('#btnRetry').addEventListener('click', () => startAnalysis(tab.id));
  $('#btnCopy').addEventListener('click', copyPrompt);
  $('#btnPreview').addEventListener('click', togglePreview);
  $('#btnDownloadMd').addEventListener('click', downloadMd);
  $('#btnExportJSON').addEventListener('click', exportJSON);
  $('#btnExportCSS').addEventListener('click', exportCSS);

  $('#btnSelectAll').addEventListener('click', (e) => {
    e.preventDefault();
    selectedSections = new Set(SECTIONS.map(s => s.id));
    renderChecklist();
    updateCopyButton();
    persistSections();
  });

  $('#btnDeselectAll').addEventListener('click', (e) => {
    e.preventDefault();
    selectedSections.clear();
    renderChecklist();
    updateCopyButton();
    persistSections();
  });

  $('#langSwitch').addEventListener('change', (e) => {
    currentLang = e.target.value;
    chrome.storage.local.set({ promptLang: currentLang });
    updateUILanguage();
    if (analysisData) {
      showResults();
    }
    hidePreview();
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'ANALYSIS_PROGRESS' && msg.tabId === tab.id) {
      updateProgress(msg.data);
    }
    if (msg.type === 'ANALYSIS_COMPLETE' && msg.tabId === tab.id) {
      analysisData = msg.data;
      showResults();
    }
    if (msg.type === 'ANALYSIS_ERROR' && msg.tabId === tab.id) {
      showError(msg.data.message);
    }
  });
}

function updateUILanguage() {
  $('#idleText').textContent = L('idleText');
  $('#staleWarning').textContent = L('staleWarning');
  $('#btnAnalyze').textContent = L('btnAnalyze');
  $('#btnReanalyze').textContent = L('btnReanalyze');
  $('#btnRetry').textContent = L('btnRetry');
  $('#btnDownloadMd').textContent = L('btnDownloadMd');
  $('#btnExportJSON').textContent = L('btnExportJSON');
  $('#btnExportCSS').textContent = L('btnExportCSS');
  $('#btnSelectAll').textContent = L('selectAll');
  $('#btnDeselectAll').textContent = L('deselectAll');

  const promptTitle = document.querySelector('.section--config .section__title');
  if (promptTitle) promptTitle.textContent = L('promptSelect');

  updateCopyButton();

  const previewPanel = $('#promptPreview');
  if (previewPanel && !previewPanel.classList.contains('hidden')) {
    $('#btnPreview').textContent = L('btnCollapse');
  } else {
    $('#btnPreview').textContent = L('btnPreview');
  }
}

function showIdle() {
  $('#stateIdle').classList.remove('hidden');
  $('#stateLoading').classList.add('hidden');
  $('#stateResults').classList.add('hidden');
  $('#stateError').classList.add('hidden');
}

function showLoading() {
  $('#stateIdle').classList.add('hidden');
  $('#stateLoading').classList.remove('hidden');
  $('#stateResults').classList.add('hidden');
  $('#stateError').classList.add('hidden');
  $('#progressBar').style.width = '0%';
  $('#progressText').textContent = L('preparing');
  $('#progressPercent').textContent = '0%';
}

function showResults() {
  $('#stateIdle').classList.add('hidden');
  $('#stateLoading').classList.add('hidden');
  $('#stateResults').classList.remove('hidden');
  $('#stateError').classList.add('hidden');

  renderColorPalette();
  renderTypography();
  renderSpacing();
  renderEffects();
  renderStructure();
  renderComponents();
  renderAccessibility();
  renderCSSVariables();
  renderChecklist();
  updateSectionTitles();
  updateCopyButton();
}

function updateSectionTitles() {
  const titleMap = {
    sectionColors: 'sectionColors',
    sectionTypography: 'sectionTypography',
    sectionSpacing: 'sectionSpacing',
    sectionEffects: 'sectionEffects',
    sectionStructure: 'sectionStructure',
    sectionComponents: 'sectionComponents',
    sectionAccessibility: 'sectionAccessibility',
    sectionCSSVariables: 'sectionCSSVariables'
  };
  for (const [id, key] of Object.entries(titleMap)) {
    const el = document.querySelector(`#${id} .section__title`);
    if (el) el.textContent = L(key);
  }
}

function showError(message) {
  $('#stateIdle').classList.add('hidden');
  $('#stateLoading').classList.add('hidden');
  $('#stateResults').classList.add('hidden');
  $('#stateError').classList.remove('hidden');
  $('#errorText').textContent = message || L('errorDefault');
}

async function startAnalysis(tabId) {
  showLoading();
  $('#staleWarning').classList.add('hidden');
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [
        'content/utils.js',
        'content/color-analyzer.js',
        'content/typography-analyzer.js',
        'content/spacing-analyzer.js',
        'content/visual-effects-analyzer.js',
        'content/structure-analyzer.js',
        'content/component-analyzer.js',
        'content/responsive-analyzer.js',
        'content/accessibility-analyzer.js',
        'content/css-variable-analyzer.js',
        'content/main.js'
      ]
    });
    await chrome.tabs.sendMessage(tabId, { type: 'ANALYZE' });
  } catch (err) {
    showError(L('errorPage') + err.message);
  }
}

function updateProgress(data) {
  if (data.percent != null) {
    $('#progressBar').style.width = data.percent + '%';
    $('#progressPercent').textContent = Math.round(data.percent) + '%';
  }
  if (data.step) {
    $('#progressText').textContent = data.step;
  }
}

function renderColorPalette() {
  const palette = $('#colorPalette');
  const colors = analysisData?.colors;
  if (!colors || !Object.keys(colors.groups).length) {
    $('#sectionColors').classList.add('hidden');
    return;
  }
  $('#sectionColors').classList.remove('hidden');
  palette.innerHTML = '';

  const groupLabels = {
    primary: L('colorPrimary'), secondary: L('colorSecondary'), accent: L('colorAccent'),
    neutral: L('colorNeutral'), background: L('colorBackground')
  };

  for (const [groupId, group] of Object.entries(colors.groups)) {
    if (!group.colors.length) continue;
    const groupEl = document.createElement('div');
    groupEl.className = 'color-group';

    const label = document.createElement('div');
    label.className = 'color-group__label';
    label.textContent = groupLabels[groupId] || groupId;
    groupEl.appendChild(label);

    const swatches = document.createElement('div');
    swatches.className = 'color-group__swatches';

    for (const c of group.colors.slice(0, 6)) {
      const swatch = document.createElement('div');
      swatch.className = 'color-swatch';

      const block = document.createElement('div');
      block.className = 'color-swatch__block';
      block.style.background = c.hex;

      const value = document.createElement('span');
      value.className = 'color-swatch__value';
      value.textContent = c.hex;

      swatch.appendChild(block);
      swatch.appendChild(value);
      swatches.appendChild(swatch);
    }

    groupEl.appendChild(swatches);
    palette.appendChild(groupEl);
  }

  if (colors.gradients?.length) {
    const gradGroup = document.createElement('div');
    gradGroup.className = 'color-group';

    const label = document.createElement('div');
    label.className = 'color-group__label';
    label.textContent = L('colorGradient');
    gradGroup.appendChild(label);

    const swatches = document.createElement('div');
    swatches.className = 'color-group__swatches';

    for (const g of colors.gradients.slice(0, 4)) {
      const swatch = document.createElement('div');
      swatch.className = 'gradient-swatch';

      const block = document.createElement('div');
      block.className = 'gradient-swatch__block';
      block.style.background = g.raw;

      const labelEl = document.createElement('span');
      labelEl.className = 'gradient-swatch__label';
      labelEl.textContent = g.type + ' (' + g.stops.length + ')';

      swatch.appendChild(block);
      swatch.appendChild(labelEl);
      swatches.appendChild(swatch);
    }

    gradGroup.appendChild(swatches);
    palette.appendChild(gradGroup);
  }
}

function renderTypography() {
  const container = $('#typographyPreview');
  const typo = analysisData?.typography;
  if (!typo?.hierarchy?.length) {
    $('#sectionTypography').classList.add('hidden');
    return;
  }
  $('#sectionTypography').classList.remove('hidden');
  container.innerHTML = '';

  for (const level of typo.hierarchy.slice(0, 6)) {
    const sample = document.createElement('div');
    sample.className = 'type-sample';

    const text = document.createElement('span');
    text.className = 'type-sample__text';
    text.style.fontFamily = level.fontFamily;
    text.style.fontSize = Math.min(parseFloat(level.fontSize), 24) + 'px';
    text.style.fontWeight = level.fontWeight;
    text.textContent = 'Aural Design Analyzer';

    const meta = document.createElement('span');
    meta.className = 'type-sample__meta';
    meta.textContent = `${level.fontSize} / ${level.fontWeight}`;

    sample.appendChild(text);
    sample.appendChild(meta);
    container.appendChild(sample);
  }
}

function renderSpacing() {
  const container = $('#spacingPreview');
  const spacing = analysisData?.spacing;
  if (!spacing?.scale?.length) {
    $('#sectionSpacing').classList.add('hidden');
    return;
  }
  $('#sectionSpacing').classList.remove('hidden');
  container.innerHTML = '';

  const maxVal = Math.max(...spacing.scale.map(s => s.value));

  for (const token of spacing.scale.slice(0, 8)) {
    const el = document.createElement('div');
    el.className = 'spacing-token';

    const bar = document.createElement('div');
    bar.className = 'spacing-token__bar';
    bar.style.width = Math.max(4, (token.value / maxVal) * 40) + 'px';

    const label = document.createElement('span');
    label.textContent = token.value + 'px';

    el.appendChild(bar);
    el.appendChild(label);
    container.appendChild(el);
  }
}

function renderEffects() {
  const container = $('#effectsPreview');
  const effects = analysisData?.effects;
  if (!effects) {
    $('#sectionEffects').classList.add('hidden');
    return;
  }

  const hasRadius = effects.borderRadius?.levels?.length;
  const hasShadow = effects.boxShadow?.levels?.length;
  const hasTransitions = effects.transitions;
  const hasAnimations = effects.animations?.used?.length;

  if (!hasRadius && !hasShadow && !hasTransitions && !hasAnimations) {
    $('#sectionEffects').classList.add('hidden');
    return;
  }

  $('#sectionEffects').classList.remove('hidden');
  container.innerHTML = '';

  if (hasRadius) {
    const group = createEffectsGroup(L('effectRadius'));
    for (const r of effects.borderRadius.levels.slice(0, 4)) {
      const chip = document.createElement('div');
      chip.className = 'effect-chip';

      const demo = document.createElement('div');
      demo.className = 'effect-chip__demo';
      demo.style.borderRadius = r.value;

      const text = document.createElement('span');
      text.className = 'effect-chip__text';
      text.textContent = `${r.value} (${r.label})`;

      chip.appendChild(demo);
      chip.appendChild(text);
      group.items.appendChild(chip);
    }
    container.appendChild(group.el);
  }

  if (hasShadow) {
    const group = createEffectsGroup(L('effectShadow'));
    for (const s of effects.boxShadow.levels.slice(0, 3)) {
      const chip = document.createElement('div');
      chip.className = 'effect-chip';

      const demo = document.createElement('div');
      demo.className = 'effect-chip__demo';
      demo.style.boxShadow = s.value;
      demo.style.borderRadius = '4px';
      demo.style.background = '#fff';

      const text = document.createElement('span');
      text.className = 'effect-chip__text';
      text.textContent = s.label;

      chip.appendChild(demo);
      chip.appendChild(text);
      group.items.appendChild(chip);
    }
    container.appendChild(group.el);
  }

  if (hasAnimations) {
    const group = createEffectsGroup(L('effectAnimation'));
    for (const a of effects.animations.used.slice(0, 4)) {
      const chip = document.createElement('div');
      chip.className = 'effect-chip';

      const text = document.createElement('span');
      text.className = 'effect-chip__text';
      text.textContent = `${a.name} (${a.duration})`;

      chip.appendChild(text);
      group.items.appendChild(chip);
    }
    container.appendChild(group.el);
  }
}

function createEffectsGroup(label) {
  const el = document.createElement('div');
  el.className = 'effects-group';

  const labelEl = document.createElement('div');
  labelEl.className = 'effects-group__label';
  labelEl.textContent = label;
  el.appendChild(labelEl);

  const items = document.createElement('div');
  items.className = 'effects-group__items';
  el.appendChild(items);

  return { el, items };
}

function renderStructure() {
  const container = $('#structurePreview');
  const structure = analysisData?.structure;
  if (!structure?.tree?.length) {
    $('#sectionStructure').classList.add('hidden');
    return;
  }
  $('#sectionStructure').classList.remove('hidden');
  container.innerHTML = '';

  function renderNode(node, depth) {
    const el = document.createElement('div');
    el.className = 'structure-node';
    el.style.paddingLeft = (depth * 12) + 'px';

    const tag = document.createElement('span');
    tag.className = node.inferred ? 'structure-node__inferred' : 'structure-node__tag';
    tag.textContent = (node.inferred ? '~' : '') + '<' + node.tag + '>';
    if (node.role) tag.textContent += ` [${node.role}]`;

    el.appendChild(tag);
    container.appendChild(el);

    if (node.children) {
      for (const child of node.children) {
        renderNode(child, depth + 1);
      }
    }
  }

  for (const node of structure.tree) {
    renderNode(node, 0);
  }
}

function renderComponents() {
  const container = $('#componentsPreview');
  const comps = analysisData?.components;
  if (!comps?.components || !Object.keys(comps.components).length) {
    $('#sectionComponents').classList.add('hidden');
    return;
  }
  $('#sectionComponents').classList.remove('hidden');
  container.innerHTML = '';

  const typeNames = {
    navbar: L('compNavbar'), button: L('compButton'), card: L('compCard'), form: L('compForm'),
    list: L('compList'), modal: L('compModal'), hero: L('compHero'), input: L('compInput')
  };

  for (const [type, info] of Object.entries(comps.components)) {
    const badge = document.createElement('div');
    badge.className = 'component-badge';

    const name = document.createElement('span');
    name.textContent = typeNames[type] || type;

    const count = document.createElement('span');
    count.className = 'component-badge__count';
    count.textContent = 'x' + info.count;

    badge.appendChild(name);
    badge.appendChild(count);
    container.appendChild(badge);
  }
}

function renderAccessibility() {
  const container = $('#accessibilityPreview');
  const a11y = analysisData?.accessibility;
  if (!a11y) {
    $('#sectionAccessibility').classList.add('hidden');
    return;
  }
  $('#sectionAccessibility').classList.remove('hidden');
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'a11y-preview';

  addA11yStat(wrapper, L('a11yImgAlt'), a11y.imgAlt.coverage + '%', a11y.imgAlt.coverage);
  addA11yStat(wrapper, L('a11yFormLabel'), a11y.formLabels.coverage + '%', a11y.formLabels.coverage);
  addA11yStat(wrapper, L('a11yAriaRoles'), String(a11y.ariaRoles.total), null);

  if (a11y.contrast) {
    addA11yStat(wrapper, L('a11yContrastAA'), a11y.contrast.aaRate + '%', a11y.contrast.aaRate);
    addA11yStat(wrapper, L('a11yContrastAAA'), a11y.contrast.aaaRate + '%', a11y.contrast.aaaRate);
  }

  if (a11y.landmarks?.length) {
    const landmarkWrap = document.createElement('div');
    landmarkWrap.className = 'a11y-landmarks';
    for (const lm of a11y.landmarks) {
      const tag = document.createElement('span');
      tag.className = 'a11y-landmark';
      tag.textContent = lm.role + (lm.implicit ? '*' : '');
      landmarkWrap.appendChild(tag);
    }
    wrapper.appendChild(landmarkWrap);
  }

  container.appendChild(wrapper);
}

function addA11yStat(container, label, value, percent) {
  const row = document.createElement('div');
  row.className = 'a11y-stat';

  const labelEl = document.createElement('span');
  labelEl.textContent = label;

  const valueEl = document.createElement('span');
  valueEl.className = 'a11y-stat__value';
  valueEl.textContent = value;

  if (percent !== null) {
    if (percent >= 90) valueEl.classList.add('a11y-stat__value--good');
    else if (percent >= 60) valueEl.classList.add('a11y-stat__value--warn');
    else valueEl.classList.add('a11y-stat__value--bad');
  }

  row.appendChild(labelEl);
  row.appendChild(valueEl);
  container.appendChild(row);
}

function renderCSSVariables() {
  const container = $('#cssVariablesPreview');
  const vars = analysisData?.cssVariables;
  if (!vars || vars.total === 0) {
    $('#sectionCSSVariables').classList.add('hidden');
    return;
  }
  $('#sectionCSSVariables').classList.remove('hidden');
  container.innerHTML = '';

  for (const [catId, cat] of Object.entries(vars.categories)) {
    if (!cat.items.length) continue;

    const label = document.createElement('div');
    label.className = 'css-var-group__label';
    label.textContent = cat.label + ' (' + cat.items.length + ')';
    container.appendChild(label);

    for (const v of cat.items.slice(0, 5)) {
      const item = document.createElement('div');
      item.className = 'css-var-item';

      const name = document.createElement('span');
      name.className = 'css-var-item__name';
      name.textContent = v.name;

      const val = document.createElement('span');
      val.className = 'css-var-item__value';
      val.textContent = v.computedValue || v.value;

      item.appendChild(name);
      item.appendChild(val);
      container.appendChild(item);
    }
  }
}

function renderChecklist() {
  const container = $('#sectionChecklist');
  container.innerHTML = '';

  for (const section of SECTIONS) {
    const label = document.createElement('label');
    label.className = 'checklist__item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = selectedSections.has(section.id);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selectedSections.add(section.id);
      } else {
        selectedSections.delete(section.id);
      }
      updateCopyButton();
      persistSections();
    });

    const text = document.createTextNode(
      currentLang === 'en' ? section.labelEn : section.label
    );
    label.appendChild(checkbox);
    label.appendChild(text);
    container.appendChild(label);
  }
}

function persistSections() {
  chrome.storage.local.set({ selectedSections: [...selectedSections] });
}

function updateCopyButton() {
  const btn = $('#btnCopy');
  if (selectedSections.size === 0) {
    btn.disabled = true;
    btn.textContent = L('btnCopyEmpty');
  } else if (!analysisData) {
    btn.disabled = true;
    btn.textContent = L('btnCopyNoData');
  } else {
    btn.disabled = false;
    btn.textContent = L('btnCopy');
  }
}

async function copyPrompt() {
  if (!analysisData || selectedSections.size === 0) return;

  const prompt = PromptGenerator.generate(analysisData, selectedSections, currentLang);

  try {
    await navigator.clipboard.writeText(prompt);
    const btn = $('#btnCopy');
    btn.textContent = L('btnCopied');
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = L('btnCopy');
      btn.disabled = false;
    }, 2000);
  } catch {
    showError(L('errorCopy'));
  }
}

function togglePreview() {
  const panel = $('#promptPreview');
  if (panel.classList.contains('hidden')) {
    if (!analysisData) return;
    const prompt = PromptGenerator.generate(analysisData, selectedSections, currentLang);
    $('#promptPreviewContent').textContent = prompt;
    panel.classList.remove('hidden');
    $('#btnPreview').textContent = L('btnCollapse');
  } else {
    hidePreview();
  }
}

function hidePreview() {
  $('#promptPreview').classList.add('hidden');
  $('#btnPreview').textContent = L('btnPreview');
}

function downloadMd() {
  if (!analysisData) return;
  const prompt = PromptGenerator.generate(analysisData, selectedSections, currentLang);
  const blob = new Blob([prompt], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'design-spec-' + new Date().toISOString().slice(0, 10) + '.md';
  a.click();
  URL.revokeObjectURL(url);
}

function exportJSON() {
  if (!analysisData) return;
  const tokens = PromptGenerator.exportAsJSON(analysisData);
  const blob = new Blob([JSON.stringify(tokens, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'design-tokens-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

function exportCSS() {
  if (!analysisData) return;
  const css = PromptGenerator.exportAsCSS(analysisData);
  const blob = new Blob([css], { type: 'text/css;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'design-tokens-' + new Date().toISOString().slice(0, 10) + '.css';
  a.click();
  URL.revokeObjectURL(url);
}
