DesignAnalyzer.ColorAnalyzer = (() => {
  const { parseRGBA, rgbToHsl, rgbaToHex, hslDistance, parseBoxShadowColors } = DesignAnalyzer.Utils;

  const COLOR_PROPS = ['color', 'backgroundColor', 'borderColor', 'outlineColor'];
  const CLUSTER_THRESHOLD = 0.15;

  function extract(elements) {
    const colorEntries = [];
    const gradientSet = new Map();

    for (const el of elements) {
      const style = window.getComputedStyle(el);

      for (const prop of COLOR_PROPS) {
        const rgba = parseRGBA(style[prop]);
        if (rgba) {
          const hsl = rgbToHsl(rgba.r, rgba.g, rgba.b);
          const hex = rgbaToHex(rgba.r, rgba.g, rgba.b);
          colorEntries.push({ hex, hsl, prop, count: 1 });
        }
      }

      const shadowColors = parseBoxShadowColors(style.boxShadow);
      for (const sc of shadowColors) {
        const rgba = parseRGBA(sc);
        if (rgba) {
          const hsl = rgbToHsl(rgba.r, rgba.g, rgba.b);
          const hex = rgbaToHex(rgba.r, rgba.g, rgba.b);
          colorEntries.push({ hex, hsl, prop: 'boxShadow', count: 1 });
        }
      }

      const bgImage = style.backgroundImage;
      if (bgImage && bgImage !== 'none') {
        const gradients = extractGradients(bgImage);
        for (const g of gradients) {
          const key = g.raw;
          if (gradientSet.has(key)) {
            gradientSet.get(key).count++;
          } else {
            gradientSet.set(key, { ...g, count: 1 });
          }
        }
      }
    }

    const deduped = deduplicateColors(colorEntries);
    const clusters = clusterColors(deduped);
    const groups = classifyClusters(clusters);
    const gradients = [...gradientSet.values()].sort((a, b) => b.count - a.count).slice(0, 10);

    return { groups, gradients, totalExtracted: colorEntries.length };
  }

  function extractGradients(bgImage) {
    const results = [];
    const regex = /(linear|radial|conic)-gradient\(([^)]+(?:\([^)]*\)[^)]*)*)\)/g;
    let match;
    while ((match = regex.exec(bgImage)) !== null) {
      const type = match[1];
      const raw = match[0];
      const stops = [];
      const colorRegex = /rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}|[a-z]+(?=\s|,|\))/g;
      let cm;
      while ((cm = colorRegex.exec(match[2])) !== null) {
        const val = cm[0];
        if (/^(to|from|at|in|circle|ellipse|closest|farthest)$/i.test(val)) continue;
        stops.push(val);
      }
      results.push({ type: type + '-gradient', raw, stops });
    }
    return results;
  }

  function deduplicateColors(entries) {
    const map = new Map();
    for (const e of entries) {
      const existing = map.get(e.hex);
      if (existing) {
        existing.count++;
        existing.props.add(e.prop);
      } else {
        map.set(e.hex, { hex: e.hex, hsl: e.hsl, count: 1, props: new Set([e.prop]) });
      }
    }
    return [...map.values()];
  }

  function clusterColors(colors) {
    if (colors.length === 0) return [];

    const sorted = colors.sort((a, b) => b.count - a.count);
    const clusters = [];
    const assigned = new Set();

    for (const color of sorted) {
      if (assigned.has(color.hex)) continue;

      const cluster = { representative: color, members: [color] };

      for (const other of sorted) {
        if (assigned.has(other.hex) || other.hex === color.hex) continue;
        if (hslDistance(color.hsl, other.hsl) < CLUSTER_THRESHOLD) {
          cluster.members.push(other);
          assigned.add(other.hex);
        }
      }

      cluster.totalCount = cluster.members.reduce((sum, m) => sum + m.count, 0);
      assigned.add(color.hex);
      clusters.push(cluster);
    }

    return clusters.sort((a, b) => b.totalCount - a.totalCount);
  }

  function classifyClusters(clusters) {
    const groups = {
      primary: { colors: [], description: '主色' },
      secondary: { colors: [], description: '辅助色' },
      accent: { colors: [], description: '强调色' },
      neutral: { colors: [], description: '中性色' },
      background: { colors: [], description: '背景色' }
    };

    const neutralClusters = [];
    const chromaticClusters = [];

    for (const cluster of clusters) {
      const { hsl } = cluster.representative;
      if (hsl.s <= 10) {
        neutralClusters.push(cluster);
      } else {
        chromaticClusters.push(cluster);
      }
    }

    for (const cluster of neutralClusters) {
      const { hsl } = cluster.representative;
      const target = hsl.l >= 85 ? 'background' : 'neutral';
      groups[target].colors.push(formatCluster(cluster));
    }

    if (chromaticClusters.length === 0) {
      return groups;
    }

    if (chromaticClusters.length >= 1) {
      groups.primary.colors.push(formatCluster(chromaticClusters[0]));
    }
    if (chromaticClusters.length >= 2) {
      groups.secondary.colors.push(formatCluster(chromaticClusters[1]));
    }
    for (let i = 2; i < chromaticClusters.length && i < 5; i++) {
      groups.accent.colors.push(formatCluster(chromaticClusters[i]));
    }

    return groups;
  }

  function formatCluster(cluster) {
    return {
      hex: cluster.representative.hex,
      hsl: cluster.representative.hsl,
      count: cluster.totalCount,
      props: [...new Set(cluster.members.flatMap(m => [...m.props]))],
      variants: cluster.members.slice(0, 5).map(m => m.hex)
    };
  }

  return { extract };
})();
