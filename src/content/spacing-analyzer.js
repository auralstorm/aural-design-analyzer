DesignAnalyzer.SpacingAnalyzer = (() => {
  const { parsePxValue, frequencyMap, topN } = DesignAnalyzer.Utils;

  const SPACING_PROPS = [
    'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'
  ];

  function extract(elements) {
    const values = [];

    for (const el of elements) {
      const style = window.getComputedStyle(el);
      for (const prop of SPACING_PROPS) {
        const px = parsePxValue(style[prop]);
        if (px > 0 && px < 200) {
          values.push(Math.round(px));
        }
      }
    }

    const freq = frequencyMap(values);
    const scale = deriveScale(freq);
    const baseUnit = detectBaseUnit(scale);

    return { scale, baseUnit, totalSamples: values.length };
  }

  function deriveScale(freq) {
    return topN(freq, 15)
      .map(({ value, count }) => ({ value, count, label: labelForValue(value) }))
      .sort((a, b) => a.value - b.value);
  }

  function detectBaseUnit(scale) {
    if (scale.length === 0) return 4;

    const candidates = [2, 4, 5, 8, 10];
    let bestUnit = 4;
    let bestScore = 0;

    for (const unit of candidates) {
      let score = 0;
      for (const { value, count } of scale) {
        if (value % unit === 0) score += count;
      }
      if (score > bestScore) {
        bestScore = score;
        bestUnit = unit;
      }
    }

    return bestUnit;
  }

  function labelForValue(px) {
    const labels = {
      2: '2xs', 4: 'xs', 8: 'sm', 12: 'md', 16: 'base',
      20: 'lg', 24: 'xl', 32: '2xl', 40: '3xl', 48: '4xl',
      56: '5xl', 64: '6xl', 80: '7xl', 96: '8xl'
    };
    return labels[px] || `${px}px`;
  }

  return { extract };
})();
