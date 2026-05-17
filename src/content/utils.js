window.DesignAnalyzer = window.DesignAnalyzer || {};

DesignAnalyzer.Utils = (() => {
  const MAX_ELEMENTS = 1000;

  function getVisibleElements() {
    const all = document.body.querySelectorAll('*');
    const visible = [];

    for (const el of all) {
      if (visible.length >= MAX_ELEMENTS) break;
      if (!isVisible(el)) continue;
      visible.push(el);
    }

    return visible;
  }

  function isVisible(el) {
    if (el.offsetWidth === 0 && el.offsetHeight === 0) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    return true;
  }

  function parseRGBA(str) {
    if (!str || str === 'transparent' || str === 'rgba(0, 0, 0, 0)') return null;

    let m = str.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
    if (m) {
      const a = m[4] != null ? parseFloat(m[4]) : 1;
      if (a === 0) return null;
      return { r: +m[1], g: +m[2], b: +m[3], a };
    }

    return null;
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r, g, b;

    if (h < 60)       { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else              { r = c; g = 0; b = x; }

    const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
    return '#' + toHex(r) + toHex(g) + toHex(b);
  }

  function rgbaToHex(r, g, b) {
    const toHex = (v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0');
    return '#' + toHex(r) + toHex(g) + toHex(b);
  }

  function hslDistance(a, b) {
    const dh = Math.min(Math.abs(a.h - b.h), 360 - Math.abs(a.h - b.h)) / 180;
    const ds = Math.abs(a.s - b.s) / 100;
    const dl = Math.abs(a.l - b.l) / 100;
    return Math.sqrt(dh * dh + ds * ds + dl * dl);
  }

  function parsePxValue(str) {
    if (!str) return 0;
    const m = str.match(/([\d.]+)px/);
    return m ? parseFloat(m[1]) : 0;
  }

  function parseBoxShadowColors(value) {
    if (!value || value === 'none') return [];
    const colors = [];
    const rgbRegex = /rgba?\([^)]+\)/g;
    let match;
    while ((match = rgbRegex.exec(value)) !== null) {
      colors.push(match[0]);
    }
    return colors;
  }

  function frequencyMap(arr) {
    const map = new Map();
    for (const item of arr) {
      map.set(item, (map.get(item) || 0) + 1);
    }
    return map;
  }

  function topN(freqMap, n) {
    return [...freqMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([value, count]) => ({ value, count }));
  }

  function relativeLuminance(r, g, b) {
    const srgb = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  }

  function contrastRatio(l1, l2) {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  return {
    MAX_ELEMENTS,
    getVisibleElements,
    isVisible,
    parseRGBA,
    rgbToHsl,
    hslToHex,
    rgbaToHex,
    hslDistance,
    parsePxValue,
    parseBoxShadowColors,
    frequencyMap,
    topN,
    relativeLuminance,
    contrastRatio
  };
})();
