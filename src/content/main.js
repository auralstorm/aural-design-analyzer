(() => {
  if (window.__designAnalyzerLoaded) return;
  window.__designAnalyzerLoaded = true;

  const { getVisibleElements } = DesignAnalyzer.Utils;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ANALYZE') {
      runAnalysis();
      sendResponse({ ok: true });
    }
    return false;
  });

  function yield() {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  async function runAnalysis() {
    try {
      await sendProgress('正在收集页面元素...', 5);
      await yield();
      const elements = getVisibleElements();

      await sendProgress('正在分析颜色体系...', 15);
      await yield();
      const colors = DesignAnalyzer.ColorAnalyzer.extract(elements);

      await sendProgress('正在分析排版系统...', 30);
      await yield();
      const typography = DesignAnalyzer.TypographyAnalyzer.extract(elements);

      await sendProgress('正在分析间距规范...', 45);
      await yield();
      const spacing = DesignAnalyzer.SpacingAnalyzer.extract(elements);

      await sendProgress('正在分析视觉效果...', 55);
      await yield();
      const effects = DesignAnalyzer.VisualEffectsAnalyzer.extract(elements);

      await sendProgress('正在分析页面结构...', 65);
      await yield();
      const structure = DesignAnalyzer.StructureAnalyzer.extract();

      await sendProgress('正在识别组件模式...', 75);
      await yield();
      const components = DesignAnalyzer.ComponentAnalyzer.extract(elements);

      await sendProgress('正在分析响应式配置...', 85);
      await yield();
      const responsive = DesignAnalyzer.ResponsiveAnalyzer.extract();

      await sendProgress('正在分析可访问性...', 92);
      await yield();
      const accessibility = DesignAnalyzer.AccessibilityAnalyzer.extract();

      await sendProgress('正在提取 CSS 变量...', 95);
      await yield();
      const cssVariables = DesignAnalyzer.CSSVariableAnalyzer.extract();

      await sendProgress('正在生成结果...', 98);
      await yield();

      const data = {
        url: window.location.href,
        title: document.title,
        timestamp: Date.now(),
        colors,
        typography,
        spacing,
        effects,
        structure,
        components,
        responsive,
        accessibility,
        cssVariables
      };

      chrome.runtime.sendMessage({
        type: 'ANALYSIS_COMPLETE',
        data
      });

    } catch (err) {
      chrome.runtime.sendMessage({
        type: 'ANALYSIS_ERROR',
        data: { message: err.message || '分析过程中发生未知错误' }
      });
    }
  }

  function sendProgress(step, percent) {
    return new Promise(resolve => {
      chrome.runtime.sendMessage({
        type: 'ANALYSIS_PROGRESS',
        data: { step, percent }
      }, () => resolve());
    });
  }
})();
