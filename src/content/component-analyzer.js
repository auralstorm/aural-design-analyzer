DesignAnalyzer.ComponentAnalyzer = (() => {
  const COMPONENT_PATTERNS = [
    {
      type: 'navbar',
      selectors: ['nav', '[role="navigation"]', '.navbar', '.nav-bar', '.navigation'],
      validate: (el) => {
        const links = el.querySelectorAll('a');
        return links.length >= 2;
      }
    },
    {
      type: 'button',
      selectors: ['button', '[role="button"]', 'a.btn', 'a.button', '.btn', 'input[type="submit"]'],
      validate: () => true
    },
    {
      type: 'card',
      selectors: ['.card', '[class*="card"]', '.tile', '.panel'],
      validate: (el) => {
        const style = window.getComputedStyle(el);
        return style.borderRadius !== '0px' || style.boxShadow !== 'none' ||
               style.border !== '0px none rgb(0, 0, 0)';
      }
    },
    {
      type: 'form',
      selectors: ['form', '.form', '[role="form"]'],
      validate: (el) => {
        const inputs = el.querySelectorAll('input, textarea, select');
        return inputs.length >= 1;
      }
    },
    {
      type: 'list',
      selectors: ['ul', 'ol', '[role="list"]', '.list-group'],
      validate: (el) => {
        const items = el.querySelectorAll('li, [role="listitem"]');
        return items.length >= 2;
      }
    },
    {
      type: 'modal',
      selectors: ['dialog', '[role="dialog"]', '.modal', '[class*="modal"]', '[class*="overlay"]'],
      validate: () => true
    },
    {
      type: 'hero',
      selectors: ['.hero', '[class*="hero"]', '[class*="banner"]', '.jumbotron'],
      validate: () => true
    },
    {
      type: 'input',
      selectors: ['input[type="text"]', 'input[type="email"]', 'input[type="password"]', 'textarea', 'select'],
      validate: () => true
    }
  ];

  function extract(elements) {
    const found = {};

    for (const pattern of COMPONENT_PATTERNS) {
      const matches = [];

      for (const selector of pattern.selectors) {
        try {
          const els = document.querySelectorAll(selector);
          for (const el of els) {
            if (pattern.validate(el)) {
              matches.push(el);
            }
          }
        } catch { /* invalid selector */ }
      }

      const unique = dedup(matches);
      if (unique.length > 0) {
        found[pattern.type] = {
          count: unique.length,
          styles: extractComponentStyles(unique[0])
        };
      }
    }

    const repeating = detectRepeatingPatterns(elements);

    return { components: found, repeating };
  }

  function dedup(elements) {
    const seen = new Set();
    return elements.filter(el => {
      if (seen.has(el)) return false;
      seen.add(el);
      return true;
    });
  }

  function extractComponentStyles(el) {
    const style = window.getComputedStyle(el);
    return {
      width: style.width,
      height: style.height,
      padding: style.padding,
      backgroundColor: style.backgroundColor,
      borderRadius: style.borderRadius,
      fontSize: style.fontSize,
      color: style.color
    };
  }

  function detectRepeatingPatterns(elements) {
    const signatureMap = new Map();

    for (const el of elements) {
      if (el.children.length < 2 || el.children.length > 30) continue;

      const childSigs = [];
      for (const child of el.children) {
        childSigs.push(getSignature(child));
      }

      const uniqueSigs = new Set(childSigs);
      if (uniqueSigs.size === 1 && childSigs.length >= 3) {
        const sig = childSigs[0];
        if (!signatureMap.has(sig)) {
          signatureMap.set(sig, {
            signature: sig,
            count: childSigs.length,
            sampleTag: el.children[0].tagName.toLowerCase(),
            parentTag: el.tagName.toLowerCase()
          });
        }
      }
    }

    return [...signatureMap.values()].slice(0, 10);
  }

  function getSignature(el) {
    const tag = el.tagName;
    const childTags = [...el.children].map(c => c.tagName).sort().join(',');
    return `${tag}[${childTags}]`;
  }

  return { extract };
})();
