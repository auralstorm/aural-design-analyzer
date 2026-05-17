DesignAnalyzer.StructureAnalyzer = (() => {
  const SEMANTIC_TAGS = new Set([
    'HEADER', 'NAV', 'MAIN', 'SECTION', 'ARTICLE', 'ASIDE', 'FOOTER',
    'FIGURE', 'FIGCAPTION', 'DETAILS', 'SUMMARY', 'DIALOG', 'FORM'
  ]);

  const ROLE_HINTS = {
    header: ['header', 'top-bar', 'topbar', 'site-header'],
    nav: ['nav', 'menu', 'navigation', 'sidebar', 'side-bar'],
    main: ['main', 'content', 'page-content', 'app-content'],
    section: ['section', 'block', 'segment'],
    article: ['article', 'post', 'entry', 'card-body'],
    aside: ['aside', 'sidebar', 'widget', 'complementary'],
    footer: ['footer', 'bottom-bar', 'site-footer']
  };

  const ARIA_ROLE_MAP = {
    banner: 'header', navigation: 'nav', main: 'main',
    complementary: 'aside', contentinfo: 'footer',
    region: 'section', article: 'article'
  };

  function extract() {
    const tree = buildTree(document.body, 0, 3);
    const layouts = analyzeLayouts(document.body);
    return { tree, layouts };
  }

  function buildTree(root, depth, maxDepth) {
    if (depth > maxDepth) return [];
    const nodes = [];

    for (const child of root.children) {
      const tag = child.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'LINK' || tag === 'META') continue;

      const style = window.getComputedStyle(child);
      if (style.display === 'none') continue;

      let semanticTag = null;
      let inferred = false;
      let role = null;

      if (SEMANTIC_TAGS.has(tag)) {
        semanticTag = tag.toLowerCase();
      } else if (child.getAttribute('role')) {
        const ariaRole = child.getAttribute('role');
        if (ARIA_ROLE_MAP[ariaRole]) {
          semanticTag = ARIA_ROLE_MAP[ariaRole];
          role = ariaRole;
          inferred = true;
        }
      } else if (tag === 'DIV' || tag === 'SECTION') {
        const guessed = guessRole(child);
        if (guessed) {
          semanticTag = guessed;
          inferred = true;
        }
      }

      if (semanticTag) {
        const node = {
          tag: semanticTag,
          inferred,
          role: role || semanticTag,
          children: buildTree(child, depth + 1, maxDepth)
        };
        nodes.push(node);
      } else {
        const deeper = buildTree(child, depth, maxDepth);
        nodes.push(...deeper);
      }
    }

    return nodes;
  }

  function guessRole(el) {
    const classes = (el.className || '').toString().toLowerCase();
    const id = (el.id || '').toLowerCase();
    const combined = classes + ' ' + id;

    for (const [role, hints] of Object.entries(ROLE_HINTS)) {
      for (const hint of hints) {
        if (combined.includes(hint)) return role;
      }
    }

    return null;
  }

  function analyzeLayouts(root) {
    const elements = root.querySelectorAll('*');
    const counts = { flex: 0, grid: 0, block: 0, inline: 0, other: 0 };
    let total = 0;

    for (const el of elements) {
      const style = window.getComputedStyle(el);
      const display = style.display;

      if (display === 'none') continue;
      total++;

      if (display === 'flex' || display === 'inline-flex') {
        counts.flex++;
      } else if (display === 'grid' || display === 'inline-grid') {
        counts.grid++;
      } else if (display === 'block') {
        counts.block++;
      } else if (display === 'inline' || display === 'inline-block') {
        counts.inline++;
      } else {
        counts.other++;
      }
    }

    const stats = {};
    if (total > 0) {
      for (const [mode, count] of Object.entries(counts)) {
        if (count > 0) {
          stats[mode] = {
            count,
            percent: Math.round((count / total) * 100)
          };
        }
      }
    }

    const gridDetails = extractGridDetails(root);
    const flexDetails = extractFlexDetails(root);

    return { stats, total, gridDetails, flexDetails };
  }

  function extractGridDetails(root) {
    const grids = root.querySelectorAll('*');
    const details = [];

    for (const el of grids) {
      const style = window.getComputedStyle(el);
      if (style.display !== 'grid' && style.display !== 'inline-grid') continue;

      details.push({
        columns: style.gridTemplateColumns,
        rows: style.gridTemplateRows,
        gap: style.gap
      });

      if (details.length >= 5) break;
    }

    return details;
  }

  function extractFlexDetails(root) {
    const flexEls = root.querySelectorAll('*');
    const directions = { row: 0, column: 0 };
    const justifyMap = new Map();
    const alignMap = new Map();

    for (const el of flexEls) {
      const style = window.getComputedStyle(el);
      if (style.display !== 'flex' && style.display !== 'inline-flex') continue;

      const dir = style.flexDirection.startsWith('column') ? 'column' : 'row';
      directions[dir]++;

      justifyMap.set(style.justifyContent, (justifyMap.get(style.justifyContent) || 0) + 1);
      alignMap.set(style.alignItems, (alignMap.get(style.alignItems) || 0) + 1);
    }

    return {
      directions,
      justify: DesignAnalyzer.Utils.topN(justifyMap, 3),
      align: DesignAnalyzer.Utils.topN(alignMap, 3)
    };
  }

  return { extract };
})();
