DesignAnalyzer.ResponsiveAnalyzer = (() => {
  const DEVICE_LABELS = [
    { max: 480, label: 'mobile-sm' },
    { max: 640, label: 'mobile' },
    { max: 768, label: 'tablet-sm' },
    { max: 1024, label: 'tablet' },
    { max: 1280, label: 'desktop' },
    { max: 1536, label: 'desktop-lg' },
    { max: Infinity, label: 'desktop-xl' }
  ];

  function extract() {
    const breakpoints = extractBreakpoints();
    const colorScheme = detectColorScheme();
    return { breakpoints, colorScheme };
  }

  function extractBreakpoints() {
    const bpSet = new Set();

    for (const sheet of document.styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;
        collectMediaBreakpoints(rules, bpSet);
      } catch {
        // CORS-restricted stylesheet
      }
    }

    if (bpSet.size === 0) return null;

    return [...bpSet]
      .sort((a, b) => a - b)
      .map(value => ({
        value: value + 'px',
        device: labelForBreakpoint(value)
      }));
  }

  function collectMediaBreakpoints(rules, bpSet) {
    for (const rule of rules) {
      if (rule.type === CSSRule.MEDIA_RULE) {
        const text = rule.conditionText || rule.media?.mediaText || '';

        const minMatches = text.matchAll(/min-width\s*:\s*(\d+(?:\.\d+)?)\s*px/g);
        for (const m of minMatches) bpSet.add(parseFloat(m[1]));

        const maxMatches = text.matchAll(/max-width\s*:\s*(\d+(?:\.\d+)?)\s*px/g);
        for (const m of maxMatches) bpSet.add(parseFloat(m[1]));

        if (rule.cssRules) collectMediaBreakpoints(rule.cssRules, bpSet);
      }
    }
  }

  function labelForBreakpoint(px) {
    for (const { max, label } of DEVICE_LABELS) {
      if (px <= max) return label;
    }
    return 'unknown';
  }

  function detectColorScheme() {
    let hasDark = false;
    let hasLight = false;
    const darkOverrides = [];

    for (const sheet of document.styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;
        scanForColorScheme(rules, { hasDark: () => hasDark, hasLight: () => hasLight }, (mode, props) => {
          if (mode === 'dark') { hasDark = true; darkOverrides.push(...props); }
          if (mode === 'light') hasLight = true;
        });
      } catch { /* CORS */ }
    }

    const metaTheme = document.querySelector('meta[name="color-scheme"]');
    const metaValue = metaTheme?.getAttribute('content') || '';
    if (metaValue.includes('dark')) hasDark = true;
    if (metaValue.includes('light')) hasLight = true;

    const rootStyle = window.getComputedStyle(document.documentElement);
    const colorSchemeValue = rootStyle.colorScheme;
    if (colorSchemeValue && colorSchemeValue !== 'normal') {
      if (colorSchemeValue.includes('dark')) hasDark = true;
      if (colorSchemeValue.includes('light')) hasLight = true;
    }

    return { hasDark, hasLight, darkOverrides: [...new Set(darkOverrides)].slice(0, 10) };
  }

  function scanForColorScheme(rules, state, callback) {
    for (const rule of rules) {
      if (rule.type === CSSRule.MEDIA_RULE) {
        const text = rule.conditionText || rule.media?.mediaText || '';
        if (text.includes('prefers-color-scheme: dark') || text.includes('prefers-color-scheme:dark')) {
          const props = [];
          for (const inner of rule.cssRules) {
            if (inner.style) {
              for (let i = 0; i < inner.style.length; i++) {
                const prop = inner.style[i];
                if (prop.startsWith('--') || ['background', 'background-color', 'color'].includes(prop)) {
                  props.push(prop);
                }
              }
            }
          }
          callback('dark', props);
        }
        if (text.includes('prefers-color-scheme: light') || text.includes('prefers-color-scheme:light')) {
          callback('light', []);
        }
        if (rule.cssRules) scanForColorScheme(rule.cssRules, state, callback);
      }
    }
  }

  return { extract };
})();
