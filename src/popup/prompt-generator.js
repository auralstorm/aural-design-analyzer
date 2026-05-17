const PromptGenerator = (() => {
  const i18n = {
    zh: {
      title: '网站设计规范 Prompt',
      source: '来源页面',
      time: '分析时间',
      overview: '设计风格概述',
      colors: '颜色规范',
      typography: '排版规范',
      spacing: '间距规范',
      effects: '视觉效果',
      structure: '页面结构',
      components: '组件规范',
      layout: '布局指南',
      accessibility: '可访问性',
      cssVariables: '设计令牌 (CSS 变量)',
      tips: '使用建议',
      tip1: '以上设计规范提取自真实网页，可作为设计参考或复刻基础',
      tip2: '颜色值为计算后的最终值，原始设计可能使用了 CSS 变量或相对单位',
      tip3: '间距和字号为像素值，原始设计可能使用 rem/em 等相对单位',
      tip4: '建议结合实际需求调整，而非逐像素复制',
      primary: '主色 (Primary)',
      secondary: '辅助色 (Secondary)',
      accent: '强调色 (Accent)',
      neutral: '中性色 (Neutral)',
      background: '背景色 (Background)',
      gradients: '渐变 (Gradients)',
      fontFamilies: '字体族',
      fontHierarchy: '字体层级',
      baseUnit: '基础间距单元',
      borderRadius: '圆角',
      boxShadow: '阴影',
      transitions: '动效/过渡',
      animations: '动画',
      layoutModes: '布局模式分布',
      gridDetails: 'Grid 布局详情',
      breakpoints: '响应式断点',
      noBreakpoints: '未检测到 @media 断点，页面可能采用固定宽度布局或容器查询。',
      repeatPatterns: '重复模式',
      imgAlt: '图片 Alt 覆盖率',
      formLabels: '表单 Label 关联率',
      ariaRoles: 'ARIA 角色',
      contrastAA: 'WCAG AA 对比度通过率',
      contrastAAA: 'WCAG AAA 对比度通过率',
      contrastIssues: '对比度不足元素',
      landmarks: 'Landmark 区域',
      colorScheme: '色彩模式',
      darkSupported: '支持深色模式',
      lightOnly: '仅浅色模式',
      bothModes: '支持浅色/深色双模式',
      structureNote: '（前缀 ~ 表示通过 class/ARIA 推断的语义角色）',
      usage: '用途',
      times: '次',
      usageDuration: '常用时长',
      easingFn: '缓动函数',
      propLabels: { color: '文本颜色', backgroundColor: '背景', borderColor: '边框', outlineColor: '轮廓', boxShadow: '阴影' }
    },
    en: {
      title: 'Website Design Specification Prompt',
      source: 'Source Page',
      time: 'Analyzed At',
      overview: 'Design Overview',
      colors: 'Color Specification',
      typography: 'Typography Specification',
      spacing: 'Spacing Specification',
      effects: 'Visual Effects',
      structure: 'Page Structure',
      components: 'Component Specification',
      layout: 'Layout Guide',
      accessibility: 'Accessibility',
      cssVariables: 'Design Tokens (CSS Variables)',
      tips: 'Usage Tips',
      tip1: 'This design spec is extracted from a real webpage and can serve as a design reference or replication base',
      tip2: 'Color values are computed final values; the original design may use CSS variables or relative units',
      tip3: 'Spacing and font sizes are in pixels; the original design may use rem/em relative units',
      tip4: 'Adjust according to actual needs rather than copying pixel by pixel',
      primary: 'Primary',
      secondary: 'Secondary',
      accent: 'Accent',
      neutral: 'Neutral',
      background: 'Background',
      gradients: 'Gradients',
      fontFamilies: 'Font Families',
      fontHierarchy: 'Font Hierarchy',
      baseUnit: 'Base spacing unit',
      borderRadius: 'Border Radius',
      boxShadow: 'Box Shadow',
      transitions: 'Transitions',
      animations: 'Animations',
      layoutModes: 'Layout Mode Distribution',
      gridDetails: 'Grid Layout Details',
      breakpoints: 'Responsive Breakpoints',
      noBreakpoints: 'No @media breakpoints detected. The page may use fixed-width layout or container queries.',
      repeatPatterns: 'Repeating Patterns',
      imgAlt: 'Image Alt Coverage',
      formLabels: 'Form Label Coverage',
      ariaRoles: 'ARIA Roles',
      contrastAA: 'WCAG AA Contrast Pass Rate',
      contrastAAA: 'WCAG AAA Contrast Pass Rate',
      contrastIssues: 'Low Contrast Elements',
      landmarks: 'Landmark Regions',
      colorScheme: 'Color Scheme',
      darkSupported: 'Dark mode supported',
      lightOnly: 'Light mode only',
      bothModes: 'Supports light/dark modes',
      structureNote: '(Prefix ~ indicates semantics inferred from class/ARIA)',
      usage: 'Usage',
      times: 'occurrences',
      usageDuration: 'Common durations',
      easingFn: 'Easing functions',
      propLabels: { color: 'text color', backgroundColor: 'background', borderColor: 'border', outlineColor: 'outline', boxShadow: 'shadow' }
    }
  };

  function t(lang, key) {
    return i18n[lang]?.[key] || i18n.zh[key] || key;
  }

  function generate(data, selectedSections, lang) {
    lang = lang || 'zh';
    const L = (key) => t(lang, key);
    const sections = [];
    let sectionNum = 1;

    if (selectedSections.has('overview')) {
      const overview = generateOverview(data, lang, sectionNum);
      if (overview) { sections.push(overview); sectionNum++; }
    }

    if (selectedSections.has('colors')) {
      const colors = generateColors(data.colors, lang, sectionNum);
      if (colors) { sections.push(colors); sectionNum++; }
    }

    if (selectedSections.has('typography')) {
      const typo = generateTypography(data.typography, lang, sectionNum);
      if (typo) { sections.push(typo); sectionNum++; }
    }

    if (selectedSections.has('spacing')) {
      const spacing = generateSpacing(data.spacing, lang, sectionNum);
      if (spacing) { sections.push(spacing); sectionNum++; }
    }

    if (selectedSections.has('effects')) {
      const effects = generateEffects(data.effects, lang, sectionNum);
      if (effects) { sections.push(effects); sectionNum++; }
    }

    if (selectedSections.has('structure')) {
      const structure = generateStructure(data.structure, lang, sectionNum);
      if (structure) { sections.push(structure); sectionNum++; }
    }

    if (selectedSections.has('components')) {
      const comps = generateComponents(data.components, lang, sectionNum);
      if (comps) { sections.push(comps); sectionNum++; }
    }

    if (selectedSections.has('layout')) {
      const layout = generateLayout(data.structure, data.responsive, lang, sectionNum);
      if (layout) { sections.push(layout); sectionNum++; }
    }

    if (selectedSections.has('accessibility')) {
      const a11y = generateAccessibility(data.accessibility, lang, sectionNum);
      if (a11y) { sections.push(a11y); sectionNum++; }
    }

    if (selectedSections.has('cssVariables')) {
      const vars = generateCSSVariables(data.cssVariables, lang, sectionNum);
      if (vars) { sections.push(vars); sectionNum++; }
    }

    let prompt = `# ${L('title')}\n\n`;
    prompt += `> ${L('source')}: ${data.url}\n`;
    prompt += `> ${L('time')}: ${new Date(data.timestamp).toLocaleString(lang === 'en' ? 'en-US' : 'zh-CN')}\n\n`;
    prompt += sections.join('\n\n---\n\n');
    prompt += `\n\n---\n\n## ${L('tips')}\n\n`;
    prompt += `- ${L('tip1')}\n`;
    prompt += `- ${L('tip2')}\n`;
    prompt += `- ${L('tip3')}\n`;
    prompt += `- ${L('tip4')}\n`;

    return prompt;
  }

  function generateOverview(data, lang, num) {
    const L = (key) => t(lang, key);
    const parts = [];
    parts.push(`## ${num}. ${L('overview')}\n`);

    const colorCount = Object.values(data.colors?.groups || {}).reduce((sum, g) => sum + g.colors.length, 0);
    const primaryColor = data.colors?.groups?.primary?.colors?.[0]?.hex;
    const fontMain = data.typography?.families?.[0]?.name;
    const layoutMode = getMainLayoutMode(data.structure?.layouts);
    const colorScheme = data.responsive?.colorScheme;

    if (lang === 'en') {
      let desc = 'This website uses ';
      if (primaryColor) desc += `a ${primaryColor}-based `;
      if (fontMain) desc += `${fontMain} `;
      desc += 'design language. ';
      if (colorCount <= 3) desc += 'Minimal color palette with a clean aesthetic.';
      else if (colorCount <= 6) desc += 'Moderate color usage with clear hierarchy.';
      else desc += 'Rich color palette with strong visual expression.';
      if (layoutMode) desc += ` Primarily uses ${layoutMode} layout.`;
      parts.push(desc);
    } else {
      let desc = '该网站采用';
      if (primaryColor) desc += `以 ${primaryColor} 为主色调的`;
      if (fontMain) desc += `${fontMain} 字体风格的`;
      desc += '设计语言。';
      if (colorCount <= 3) desc += '整体色彩克制，趋向极简风格。';
      else if (colorCount <= 6) desc += '色彩运用适度，层次分明。';
      else desc += '色彩丰富，视觉表现力强。';
      if (layoutMode) desc += `页面以 ${layoutMode} 布局为主。`;
      parts.push(desc);
    }

    if (colorScheme) {
      if (colorScheme.hasDark && colorScheme.hasLight) {
        parts.push(`\n${L('colorScheme')}: ${L('bothModes')}`);
      } else if (colorScheme.hasDark) {
        parts.push(`\n${L('colorScheme')}: ${L('darkSupported')}`);
      }
    }

    return parts.join('\n');
  }

  function generateColors(colors, lang, num) {
    if (!colors || !Object.keys(colors.groups).length) return null;
    const L = (key) => t(lang, key);
    const propL = (prop) => (i18n[lang]?.propLabels?.[prop]) || prop;

    const parts = [`## ${num}. ${L('colors')}\n`];
    const groupNames = {
      primary: L('primary'),
      secondary: L('secondary'),
      accent: L('accent'),
      neutral: L('neutral'),
      background: L('background')
    };

    for (const [groupId, group] of Object.entries(colors.groups)) {
      if (!group.colors.length) continue;
      parts.push(`### ${groupNames[groupId] || groupId}\n`);

      for (const c of group.colors) {
        const usage = c.props.map(propL).join(lang === 'en' ? ', ' : '、');
        parts.push(`- ${c.hex} (hsl(${c.hsl.h}, ${c.hsl.s}%, ${c.hsl.l}%)) — ${L('usage')}: ${usage}，${c.count} ${L('times')}`);
        if (c.variants.length > 1) {
          parts.push(`  variants: ${c.variants.slice(1).join(', ')}`);
        }
      }
      parts.push('');
    }

    if (colors.gradients?.length) {
      parts.push(`### ${L('gradients')}\n`);
      for (const g of colors.gradients) {
        parts.push(`- \`${g.raw}\` (${g.type}, ${g.count} ${L('times')})`);
      }
      parts.push('');
    }

    return parts.join('\n');
  }

  function generateTypography(typo, lang, num) {
    if (!typo?.hierarchy?.length) return null;
    const L = (key) => t(lang, key);

    const parts = [`## ${num}. ${L('typography')}\n`];

    if (typo.families?.length) {
      parts.push(`### ${L('fontFamilies')}\n`);
      for (const f of typo.families.slice(0, 5)) {
        parts.push(`- **${f.name}** (${f.category}) — ${f.count} ${L('times')}`);
      }
      parts.push('');
    }

    parts.push(`### ${L('fontHierarchy')}\n`);
    if (lang === 'en') {
      parts.push('| Level | Font | Size | Weight | Line Height | Letter Spacing |');
    } else {
      parts.push('| 层级 | 字体 | 字号 | 字重 | 行高 | 字间距 |');
    }
    parts.push('|------|------|------|------|------|--------|');

    for (let i = 0; i < typo.hierarchy.length; i++) {
      const h = typo.hierarchy[i];
      parts.push(`| Level ${i + 1} | ${h.fontFamily} | ${h.fontSize} | ${h.fontWeight} | ${h.lineHeight} | ${h.letterSpacing} |`);
    }

    return parts.join('\n');
  }

  function generateSpacing(spacing, lang, num) {
    if (!spacing?.scale?.length) return null;
    const L = (key) => t(lang, key);

    const parts = [`## ${num}. ${L('spacing')}\n`];
    parts.push(`${L('baseUnit')}: **${spacing.baseUnit}px**\n`);
    if (lang === 'en') {
      parts.push('| Value | Label | Frequency |');
    } else {
      parts.push('| 值 | 标签 | 使用频率 |');
    }
    parts.push('|-----|------|----------|');

    for (const s of spacing.scale) {
      parts.push(`| ${s.value}px | ${s.label} | ${s.count} ${L('times')} |`);
    }

    return parts.join('\n');
  }

  function generateEffects(effects, lang, num) {
    if (!effects) return null;
    const L = (key) => t(lang, key);
    const parts = [`## ${num}. ${L('effects')}\n`];
    let hasContent = false;

    if (effects.borderRadius?.levels?.length) {
      hasContent = true;
      parts.push(`### ${L('borderRadius')}\n`);
      for (const r of effects.borderRadius.levels) {
        parts.push(`- **${r.label}**: ${r.value} (${r.count} ${L('times')})`);
      }
      parts.push('');
    }

    if (effects.boxShadow?.levels?.length) {
      hasContent = true;
      parts.push(`### ${L('boxShadow')}\n`);
      for (const s of effects.boxShadow.levels) {
        parts.push(`- **${s.label}**: \`${s.value}\` (${s.count} ${L('times')})`);
      }
      parts.push('');
    }

    if (effects.transitions) {
      hasContent = true;
      parts.push(`### ${L('transitions')}\n`);
      if (effects.transitions.durations?.length) {
        parts.push(`${L('usageDuration')}: ` + effects.transitions.durations.map(d => d.value).join(', '));
      }
      if (effects.transitions.timingFunctions?.length) {
        parts.push(`${L('easingFn')}: ` + effects.transitions.timingFunctions.map(t => t.value).join(', '));
      }
      parts.push('');
    }

    if (effects.animations?.used?.length) {
      hasContent = true;
      parts.push(`### ${L('animations')}\n`);
      for (const a of effects.animations.used) {
        let line = `- **${a.name}**: ${a.duration}`;
        if (a.timing) line += ` (${a.timing})`;
        if (a.iteration && a.iteration !== '1') line += ` x${a.iteration}`;
        if (a.keyframes) line += ` [${a.keyframes.join(' → ')}]`;
        parts.push(line);
      }
      parts.push('');
    }

    return hasContent ? parts.join('\n') : null;
  }

  function generateStructure(structure, lang, num) {
    if (!structure?.tree?.length) return null;
    const L = (key) => t(lang, key);

    const parts = [`## ${num}. ${L('structure')}\n`];
    parts.push('```');

    function renderNode(node, indent) {
      const marker = node.inferred ? '~' : '';
      const roleInfo = node.role !== node.tag ? ` [${node.role}]` : '';
      parts.push(`${indent}${marker}<${node.tag}>${roleInfo}`);
      if (node.children) {
        for (const child of node.children) {
          renderNode(child, indent + '  ');
        }
      }
    }

    for (const node of structure.tree) {
      renderNode(node, '');
    }

    parts.push('```');
    parts.push(`\n${L('structureNote')}`);

    return parts.join('\n');
  }

  function generateComponents(comps, lang, num) {
    if (!comps?.components || !Object.keys(comps.components).length) return null;
    const L = (key) => t(lang, key);

    const parts = [`## ${num}. ${L('components')}\n`];
    const typeNames = lang === 'en'
      ? { navbar: 'Navbar', button: 'Button', card: 'Card', form: 'Form', list: 'List', modal: 'Modal', hero: 'Hero', input: 'Input' }
      : { navbar: '导航栏', button: '按钮', card: '卡片', form: '表单', list: '列表', modal: '模态框', hero: 'Hero 区域', input: '输入框' };

    for (const [type, info] of Object.entries(comps.components)) {
      parts.push(`### ${typeNames[type] || type} (x${info.count})\n`);
      if (info.styles) {
        const s = info.styles;
        const details = [];
        if (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') details.push(`bg: ${s.backgroundColor}`);
        if (s.borderRadius && s.borderRadius !== '0px') details.push(`radius: ${s.borderRadius}`);
        if (s.fontSize) details.push(`font-size: ${s.fontSize}`);
        if (s.padding && s.padding !== '0px') details.push(`padding: ${s.padding}`);
        if (details.length) parts.push(details.join(' | '));
      }
      parts.push('');
    }

    if (comps.repeating?.length) {
      parts.push(`### ${L('repeatPatterns')}\n`);
      for (const r of comps.repeating) {
        if (lang === 'en') {
          parts.push(`- \`<${r.parentTag}>\` contains ${r.count} structurally identical \`<${r.sampleTag}>\` children`);
        } else {
          parts.push(`- \`<${r.parentTag}>\` 内包含 ${r.count} 个结构相同的 \`<${r.sampleTag}>\` 子元素`);
        }
      }
    }

    return parts.join('\n');
  }

  function generateLayout(structure, responsive, lang, num) {
    const L = (key) => t(lang, key);
    const parts = [`## ${num}. ${L('layout')}\n`];
    let hasContent = false;

    if (structure?.layouts?.stats) {
      hasContent = true;
      parts.push(`### ${L('layoutModes')}\n`);
      const modes = { flex: 'Flexbox', grid: 'CSS Grid', block: 'Block', inline: 'Inline' };
      for (const [mode, info] of Object.entries(structure.layouts.stats)) {
        const label = modes[mode] || mode;
        parts.push(`- **${label}**: ${info.percent}% (${info.count} elements)`);
      }
      parts.push('');
    }

    if (structure?.layouts?.gridDetails?.length) {
      hasContent = true;
      parts.push(`### ${L('gridDetails')}\n`);
      for (const g of structure.layouts.gridDetails) {
        parts.push(`- columns: \`${g.columns}\` | rows: \`${g.rows}\` | gap: \`${g.gap}\``);
      }
      parts.push('');
    }

    if (responsive?.breakpoints?.length) {
      hasContent = true;
      parts.push(`### ${L('breakpoints')}\n`);
      if (lang === 'en') {
        parts.push('| Breakpoint | Device |');
      } else {
        parts.push('| 断点 | 设备类型 |');
      }
      parts.push('|------|----------|');
      for (const bp of responsive.breakpoints) {
        parts.push(`| ${bp.value} | ${bp.device} |`);
      }
    } else if (hasContent) {
      parts.push(`### ${L('breakpoints')}\n`);
      parts.push(L('noBreakpoints'));
    }

    return hasContent ? parts.join('\n') : null;
  }

  function generateAccessibility(a11y, lang, num) {
    if (!a11y) return null;
    const L = (key) => t(lang, key);

    const parts = [`## ${num}. ${L('accessibility')}\n`];

    parts.push(`| ${lang === 'en' ? 'Metric' : '指标'} | ${lang === 'en' ? 'Value' : '值'} |`);
    parts.push('|------|------|');
    parts.push(`| ${L('imgAlt')} | ${a11y.imgAlt.coverage}% (${a11y.imgAlt.withAlt}/${a11y.imgAlt.total}) |`);
    parts.push(`| ${L('formLabels')} | ${a11y.formLabels.coverage}% (${a11y.formLabels.labeled}/${a11y.formLabels.total}) |`);
    parts.push(`| ${L('ariaRoles')} | ${a11y.ariaRoles.total} |`);

    if (a11y.contrast) {
      parts.push(`| ${L('contrastAA')} | ${a11y.contrast.aaRate}% (${a11y.contrast.passAA}/${a11y.contrast.total}) |`);
      parts.push(`| ${L('contrastAAA')} | ${a11y.contrast.aaaRate}% (${a11y.contrast.passAAA}/${a11y.contrast.total}) |`);
    }

    if (a11y.ariaRoles.roles?.length) {
      parts.push('');
      parts.push(`### ${L('ariaRoles')}\n`);
      for (const r of a11y.ariaRoles.roles.slice(0, 10)) {
        parts.push(`- \`${r.role}\` (${r.count})`);
      }
    }

    if (a11y.landmarks?.length) {
      parts.push('');
      parts.push(`### ${L('landmarks')}\n`);
      for (const lm of a11y.landmarks) {
        const implicitMark = lm.implicit ? (lang === 'en' ? ' (implicit)' : ' (隐式)') : '';
        parts.push(`- ${lm.role}${implicitMark} (${lm.count})`);
      }
    }

    if (a11y.contrast?.issues?.length) {
      parts.push('');
      parts.push(`### ${L('contrastIssues')}\n`);
      for (const issue of a11y.contrast.issues) {
        parts.push(`- \`<${issue.tag}>\` — ratio: ${issue.ratio}:1 (fg: ${issue.fg}, bg: ${issue.bg})`);
      }
    }

    return parts.join('\n');
  }

  function generateCSSVariables(vars, lang, num) {
    if (!vars || vars.total === 0) return null;
    const L = (key) => t(lang, key);

    const parts = [`## ${num}. ${L('cssVariables')}\n`];
    parts.push(`${lang === 'en' ? 'Total' : '总计'}: ${vars.total} ${lang === 'en' ? 'variables' : '个变量'}\n`);

    for (const [catId, cat] of Object.entries(vars.categories)) {
      if (!cat.items.length) continue;
      parts.push(`### ${cat.label} (${cat.items.length})\n`);
      parts.push(`| ${lang === 'en' ? 'Variable' : '变量名'} | ${lang === 'en' ? 'Value' : '值'} |`);
      parts.push('|------|------|');
      for (const v of cat.items) {
        parts.push(`| \`${v.name}\` | \`${v.computedValue || v.value}\` |`);
      }
      parts.push('');
    }

    return parts.join('\n');
  }

  function getMainLayoutMode(layouts) {
    if (!layouts?.stats) return null;
    const entries = Object.entries(layouts.stats).filter(([k]) => k !== 'block' && k !== 'inline');
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1].count - a[1].count);
    const modes = { flex: 'Flexbox', grid: 'CSS Grid' };
    return modes[entries[0][0]] || entries[0][0];
  }

  function exportAsJSON(data) {
    const tokens = {};

    if (data.colors?.groups) {
      tokens.colors = {};
      for (const [groupId, group] of Object.entries(data.colors.groups)) {
        if (group.colors.length) {
          tokens.colors[groupId] = group.colors.map(c => ({
            hex: c.hex,
            hsl: `hsl(${c.hsl.h}, ${c.hsl.s}%, ${c.hsl.l}%)`
          }));
        }
      }
      if (data.colors.gradients?.length) {
        tokens.colors.gradients = data.colors.gradients.map(g => ({
          type: g.type,
          value: g.raw,
          stops: g.stops
        }));
      }
    }

    if (data.typography?.hierarchy) {
      tokens.typography = {
        families: data.typography.families?.map(f => f.name) || [],
        hierarchy: data.typography.hierarchy.map((h, i) => ({
          level: i + 1,
          fontFamily: h.fontFamily,
          fontSize: h.fontSize,
          fontWeight: h.fontWeight,
          lineHeight: h.lineHeight
        }))
      };
    }

    if (data.spacing?.scale) {
      tokens.spacing = {
        baseUnit: data.spacing.baseUnit,
        scale: data.spacing.scale.map(s => ({ value: s.value, label: s.label }))
      };
    }

    if (data.effects) {
      tokens.effects = {};
      if (data.effects.borderRadius?.levels) {
        tokens.effects.borderRadius = data.effects.borderRadius.levels.map(r => ({
          label: r.label, value: r.value
        }));
      }
      if (data.effects.boxShadow?.levels) {
        tokens.effects.boxShadow = data.effects.boxShadow.levels.map(s => ({
          label: s.label, value: s.value
        }));
      }
    }

    if (data.cssVariables?.categories) {
      tokens.cssVariables = {};
      for (const [catId, cat] of Object.entries(data.cssVariables.categories)) {
        if (cat.items.length) {
          tokens.cssVariables[catId] = cat.items.map(v => ({
            name: v.name,
            value: v.computedValue || v.value
          }));
        }
      }
    }

    if (data.responsive?.breakpoints) {
      tokens.breakpoints = data.responsive.breakpoints.map(bp => ({
        value: bp.value,
        device: bp.device
      }));
    }

    return tokens;
  }

  function exportAsCSS(data) {
    const lines = ['/* Design Tokens — Auto-generated by Aural Design Analyzer */\n', ':root {'];

    if (data.colors?.groups) {
      lines.push('  /* Colors */');
      for (const [groupId, group] of Object.entries(data.colors.groups)) {
        for (let i = 0; i < group.colors.length; i++) {
          const c = group.colors[i];
          const suffix = group.colors.length > 1 ? `-${i + 1}` : '';
          lines.push(`  --color-${groupId}${suffix}: ${c.hex};`);
        }
      }
      lines.push('');
    }

    if (data.typography?.families?.length) {
      lines.push('  /* Typography */');
      lines.push(`  --font-primary: ${data.typography.families[0].name};`);
      if (data.typography.families.length > 1) {
        lines.push(`  --font-secondary: ${data.typography.families[1].name};`);
      }
      lines.push('');
    }

    if (data.spacing?.scale) {
      lines.push('  /* Spacing */');
      lines.push(`  --spacing-base: ${data.spacing.baseUnit}px;`);
      for (const s of data.spacing.scale) {
        lines.push(`  --spacing-${s.label}: ${s.value}px;`);
      }
      lines.push('');
    }

    if (data.effects?.borderRadius?.levels) {
      lines.push('  /* Border Radius */');
      for (const r of data.effects.borderRadius.levels) {
        lines.push(`  --radius-${r.label}: ${r.value};`);
      }
      lines.push('');
    }

    if (data.effects?.boxShadow?.levels) {
      lines.push('  /* Shadows */');
      for (const s of data.effects.boxShadow.levels) {
        lines.push(`  --shadow-${s.label}: ${s.value};`);
      }
      lines.push('');
    }

    if (data.cssVariables?.categories) {
      const allVars = Object.values(data.cssVariables.categories).flatMap(c => c.items);
      if (allVars.length) {
        lines.push('  /* Original CSS Variables */');
        for (const v of allVars) {
          lines.push(`  ${v.name}: ${v.computedValue || v.value};`);
        }
      }
    }

    lines.push('}');
    return lines.join('\n');
  }

  return { generate, exportAsJSON, exportAsCSS };
})();
