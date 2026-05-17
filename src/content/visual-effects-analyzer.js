DesignAnalyzer.VisualEffectsAnalyzer = (() => {
  const { parsePxValue, frequencyMap, topN } = DesignAnalyzer.Utils;

  function extract(elements) {
    const radii = [];
    const shadows = [];
    const transitions = [];
    const animations = [];

    for (const el of elements) {
      const style = window.getComputedStyle(el);

      const r = parsePxValue(style.borderRadius);
      if (r > 0) radii.push(Math.round(r));

      if (style.boxShadow && style.boxShadow !== 'none') {
        shadows.push(style.boxShadow);
      }

      if (style.transition && style.transition !== 'all 0s ease 0s' && style.transition !== 'none') {
        transitions.push(style.transition);
      }

      if (style.animationName && style.animationName !== 'none') {
        animations.push({
          name: style.animationName,
          duration: style.animationDuration,
          timing: style.animationTimingFunction,
          iteration: style.animationIterationCount
        });
      }
    }

    const keyframes = extractKeyframes();

    return {
      borderRadius: analyzeBorderRadius(radii),
      boxShadow: analyzeBoxShadow(shadows),
      transitions: analyzeTransitions(transitions),
      animations: analyzeAnimations(animations, keyframes)
    };
  }

  function analyzeBorderRadius(values) {
    if (values.length === 0) return null;

    const freq = frequencyMap(values);
    const levels = topN(freq, 8).map(({ value, count }) => ({
      value: value + 'px',
      count,
      label: radiusLabel(value)
    }));

    return { levels };
  }

  function radiusLabel(px) {
    if (px <= 2) return 'none';
    if (px <= 4) return 'sm';
    if (px <= 8) return 'md';
    if (px <= 12) return 'lg';
    if (px <= 16) return 'xl';
    if (px <= 24) return '2xl';
    if (px >= 9999) return 'full';
    return '3xl';
  }

  function analyzeBoxShadow(values) {
    if (values.length === 0) return null;

    const freq = frequencyMap(values);
    const levels = topN(freq, 5).map(({ value, count }, i) => ({
      value,
      count,
      label: shadowLabel(i)
    }));

    return { levels };
  }

  function shadowLabel(index) {
    const labels = ['sm', 'md', 'lg', 'xl', '2xl'];
    return labels[index] || `level-${index}`;
  }

  function analyzeTransitions(values) {
    if (values.length === 0) return null;

    const durations = [];
    const timingFns = [];

    for (const t of values) {
      const dMatch = t.match(/([\d.]+)s/);
      if (dMatch) durations.push(parseFloat(dMatch[1]));

      const tfMatch = t.match(/(ease|ease-in|ease-out|ease-in-out|linear|cubic-bezier\([^)]+\))/);
      if (tfMatch) timingFns.push(tfMatch[1]);
    }

    const durationFreq = frequencyMap(durations.map(d => d + 's'));
    const timingFreq = frequencyMap(timingFns);

    return {
      durations: topN(durationFreq, 5),
      timingFunctions: topN(timingFreq, 5)
    };
  }

  function extractKeyframes() {
    const keyframes = [];
    for (const sheet of document.styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;
        for (const rule of rules) {
          if (rule.type === CSSRule.KEYFRAMES_RULE) {
            const steps = [];
            for (const kf of rule.cssRules) {
              steps.push(kf.keyText);
            }
            keyframes.push({ name: rule.name, steps });
          }
        }
      } catch { /* CORS */ }
    }
    return keyframes;
  }

  function analyzeAnimations(animations, keyframes) {
    if (animations.length === 0 && keyframes.length === 0) return null;

    const nameFreq = frequencyMap(animations.map(a => a.name));
    const used = topN(nameFreq, 10).map(({ value, count }) => {
      const kf = keyframes.find(k => k.name === value);
      const sample = animations.find(a => a.name === value);
      return {
        name: value,
        count,
        duration: sample?.duration,
        timing: sample?.timing,
        iteration: sample?.iteration,
        keyframes: kf?.steps || null
      };
    });

    return { used, totalKeyframes: keyframes.length };
  }

  return { extract };
})();
