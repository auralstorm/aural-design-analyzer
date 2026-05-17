DesignAnalyzer.AccessibilityAnalyzer = (() => {
  const { parseRGBA, relativeLuminance, contrastRatio } = DesignAnalyzer.Utils;

  function extract() {
    const ariaRoles = countAriaRoles();
    const imgAlt = checkImageAlt();
    const formLabels = checkFormLabels();
    const landmarks = getLandmarks();
    const contrast = checkContrast();

    return { ariaRoles, imgAlt, formLabels, landmarks, contrast };
  }

  function countAriaRoles() {
    const elements = document.querySelectorAll('[role]');
    const roleMap = new Map();

    for (const el of elements) {
      const role = el.getAttribute('role');
      roleMap.set(role, (roleMap.get(role) || 0) + 1);
    }

    return {
      total: elements.length,
      roles: [...roleMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([role, count]) => ({ role, count }))
    };
  }

  function checkImageAlt() {
    const images = document.querySelectorAll('img');
    let withAlt = 0;
    let withoutAlt = 0;
    let decorative = 0;

    for (const img of images) {
      const alt = img.getAttribute('alt');
      if (alt === null) {
        withoutAlt++;
      } else if (alt === '') {
        decorative++;
      } else {
        withAlt++;
      }
    }

    const total = images.length;
    return {
      total,
      withAlt,
      withoutAlt,
      decorative,
      coverage: total > 0 ? Math.round((withAlt + decorative) / total * 100) : 100
    };
  }

  function checkFormLabels() {
    const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select');
    let labeled = 0;
    let unlabeled = 0;

    for (const input of inputs) {
      if (hasLabel(input)) {
        labeled++;
      } else {
        unlabeled++;
      }
    }

    const total = inputs.length;
    return {
      total,
      labeled,
      unlabeled,
      coverage: total > 0 ? Math.round(labeled / total * 100) : 100
    };
  }

  function hasLabel(input) {
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) return true;
    }

    if (input.closest('label')) return true;
    if (input.getAttribute('aria-label') || input.getAttribute('aria-labelledby')) return true;
    if (input.getAttribute('placeholder')) return true;
    if (input.getAttribute('title')) return true;

    return false;
  }

  function getLandmarks() {
    const landmarkRoles = ['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'search', 'form', 'region'];
    const found = [];

    for (const role of landmarkRoles) {
      const elements = document.querySelectorAll(`[role="${role}"]`);
      if (elements.length > 0) {
        found.push({ role, count: elements.length });
      }
    }

    const semanticLandmarks = [
      { tag: 'header', role: 'banner' },
      { tag: 'nav', role: 'navigation' },
      { tag: 'main', role: 'main' },
      { tag: 'aside', role: 'complementary' },
      { tag: 'footer', role: 'contentinfo' }
    ];

    for (const { tag, role } of semanticLandmarks) {
      const elements = document.querySelectorAll(tag);
      if (elements.length > 0 && !found.some(f => f.role === role)) {
        found.push({ role, count: elements.length, implicit: true });
      }
    }

    return found;
  }

  function checkContrast() {
    const textEls = document.querySelectorAll('p, span, a, h1, h2, h3, h4, h5, h6, li, td, th, label, button');
    const issues = [];
    let total = 0;
    let passAA = 0;
    let passAAA = 0;

    for (const el of textEls) {
      if (total >= 200) break;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;

      const fgRGBA = parseRGBA(style.color);
      if (!fgRGBA) continue;

      const bgColor = getEffectiveBackground(el);
      if (!bgColor) continue;

      total++;
      const fgL = relativeLuminance(fgRGBA.r, fgRGBA.g, fgRGBA.b);
      const bgL = relativeLuminance(bgColor.r, bgColor.g, bgColor.b);
      const ratio = contrastRatio(fgL, bgL);

      const fontSize = parseFloat(style.fontSize);
      const fontWeight = parseInt(style.fontWeight) || 400;
      const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);

      const aaThreshold = isLargeText ? 3 : 4.5;
      const aaaThreshold = isLargeText ? 4.5 : 7;

      if (ratio >= aaThreshold) passAA++;
      if (ratio >= aaaThreshold) passAAA++;
      if (ratio < aaThreshold) {
        issues.push({
          tag: el.tagName.toLowerCase(),
          ratio: Math.round(ratio * 100) / 100,
          fg: style.color,
          bg: `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`
        });
      }
    }

    return {
      total,
      passAA,
      passAAA,
      aaRate: total > 0 ? Math.round(passAA / total * 100) : 100,
      aaaRate: total > 0 ? Math.round(passAAA / total * 100) : 100,
      issues: issues.slice(0, 5)
    };
  }

  function getEffectiveBackground(el) {
    let current = el;
    while (current && current !== document.documentElement) {
      const style = window.getComputedStyle(current);
      const bg = parseRGBA(style.backgroundColor);
      if (bg && bg.a >= 0.5) return bg;
      current = current.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  }

  return { extract };
})();
