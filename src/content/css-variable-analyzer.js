DesignAnalyzer.CSSVariableAnalyzer = (() => {
  function extract() {
    const variables = new Map();

    for (const sheet of document.styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;
        collectVariables(rules, variables);
      } catch { /* CORS */ }
    }

    const rootStyle = window.getComputedStyle(document.documentElement);
    for (const [name] of variables) {
      const computed = rootStyle.getPropertyValue(name).trim();
      if (computed) {
        variables.get(name).computedValue = computed;
      }
    }

    const categorized = categorize([...variables.values()]);
    return {
      total: variables.size,
      categories: categorized
    };
  }

  function collectVariables(rules, variables) {
    for (const rule of rules) {
      if (rule.style) {
        for (let i = 0; i < rule.style.length; i++) {
          const prop = rule.style[i];
          if (prop.startsWith('--')) {
            const value = rule.style.getPropertyValue(prop).trim();
            if (!variables.has(prop)) {
              variables.set(prop, { name: prop, value, computedValue: null });
            }
          }
        }
      }
      if (rule.cssRules) {
        collectVariables(rule.cssRules, variables);
      }
    }
  }

  function categorize(vars) {
    const categories = {
      color: { label: '颜色', items: [] },
      spacing: { label: '间距', items: [] },
      font: { label: '字体', items: [] },
      radius: { label: '圆角', items: [] },
      shadow: { label: '阴影', items: [] },
      size: { label: '尺寸', items: [] },
      other: { label: '其他', items: [] }
    };

    for (const v of vars) {
      const cat = inferCategory(v.name, v.value);
      categories[cat].items.push(v);
    }

    for (const cat of Object.values(categories)) {
      cat.items.sort((a, b) => a.name.localeCompare(b.name));
    }

    return categories;
  }

  function inferCategory(name, value) {
    const n = name.toLowerCase();
    if (/color|bg|foreground|text-|border-color|accent|primary|secondary|neutral|surface|muted/i.test(n)) return 'color';
    if (/spacing|gap|margin|padding|space/i.test(n)) return 'spacing';
    if (/font|text|letter|line-height|heading/i.test(n)) return 'font';
    if (/radius|rounded|corner/i.test(n)) return 'radius';
    if (/shadow|elevation/i.test(n)) return 'shadow';
    if (/size|width|height|max|min/i.test(n)) return 'size';

    if (value) {
      if (/^#|^rgb|^hsl|^oklch|^color\(/i.test(value)) return 'color';
      if (/^\d+(\.\d+)?(px|rem|em)$/.test(value)) return 'spacing';
    }

    return 'other';
  }

  return { extract };
})();
