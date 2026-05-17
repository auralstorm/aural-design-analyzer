DesignAnalyzer.TypographyAnalyzer = (() => {
  const TEXT_TAGS = new Set([
    'P', 'SPAN', 'A', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
    'LI', 'TD', 'TH', 'LABEL', 'BUTTON', 'BLOCKQUOTE', 'FIGCAPTION',
    'STRONG', 'EM', 'B', 'I', 'SMALL', 'CODE', 'PRE'
  ]);

  const SERIF_KEYWORDS = ['georgia', 'times', 'serif', 'garamond', 'palatino', 'cambria'];
  const MONO_KEYWORDS = ['mono', 'courier', 'consolas', 'menlo', 'cascadia', 'fira code'];

  function extract(elements) {
    const entries = [];

    for (const el of elements) {
      if (!hasTextContent(el)) continue;
      const style = window.getComputedStyle(el);
      entries.push({
        tag: el.tagName,
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        textTransform: style.textTransform
      });
    }

    const hierarchy = buildHierarchy(entries);
    const families = buildFamilyStats(entries);

    return { hierarchy, families };
  }

  function hasTextContent(el) {
    if (TEXT_TAGS.has(el.tagName)) return true;
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) return true;
    }
    return false;
  }

  function buildHierarchy(entries) {
    const sizeMap = new Map();

    for (const e of entries) {
      const size = parseFloat(e.fontSize);
      const key = `${size}|${e.fontWeight}|${e.fontFamily}`;

      if (sizeMap.has(key)) {
        sizeMap.get(key).count++;
      } else {
        sizeMap.set(key, {
          fontSize: e.fontSize,
          fontSizeNum: size,
          fontWeight: e.fontWeight,
          fontFamily: cleanFontFamily(e.fontFamily),
          lineHeight: e.lineHeight,
          letterSpacing: e.letterSpacing,
          textTransform: e.textTransform,
          count: 1
        });
      }
    }

    return [...sizeMap.values()]
      .sort((a, b) => b.fontSizeNum - a.fontSizeNum)
      .slice(0, 10);
  }

  function buildFamilyStats(entries) {
    const familyMap = new Map();

    for (const e of entries) {
      const name = cleanFontFamily(e.fontFamily);
      familyMap.set(name, (familyMap.get(name) || 0) + 1);
    }

    return [...familyMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        category: classifyFont(name)
      }));
  }

  function cleanFontFamily(raw) {
    return raw.split(',')[0].trim().replace(/['"]/g, '');
  }

  function classifyFont(name) {
    const lower = name.toLowerCase();
    if (MONO_KEYWORDS.some(k => lower.includes(k))) return 'monospace';
    if (SERIF_KEYWORDS.some(k => lower.includes(k))) return 'serif';
    return 'sans-serif';
  }

  return { extract };
})();
