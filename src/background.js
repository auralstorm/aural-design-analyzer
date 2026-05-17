const MESSAGE_TYPES = {
  ANALYZE: 'ANALYZE',
  GET_RESULTS: 'GET_RESULTS',
  ANALYSIS_PROGRESS: 'ANALYSIS_PROGRESS',
  ANALYSIS_COMPLETE: 'ANALYSIS_COMPLETE',
  ANALYSIS_ERROR: 'ANALYSIS_ERROR'
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case MESSAGE_TYPES.ANALYZE:
      handleAnalyze(sender.tab?.id);
      sendResponse({ ok: true });
      return false;

    case MESSAGE_TYPES.ANALYSIS_COMPLETE:
      handleAnalysisComplete(message.data, sender.tab?.id);
      sendResponse({ ok: true });
      return false;

    case MESSAGE_TYPES.ANALYSIS_PROGRESS:
      handleProgress(message.data, sender.tab?.id);
      sendResponse({ ok: true });
      return false;

    case MESSAGE_TYPES.ANALYSIS_ERROR:
      handleError(message.data, sender.tab?.id);
      sendResponse({ ok: true });
      return false;

    case MESSAGE_TYPES.GET_RESULTS:
      handleGetResults(message.tabId).then(sendResponse);
      return true;
  }
});

function handleAnalyze(tabId) {
  if (!tabId) return;
  chrome.tabs.sendMessage(tabId, { type: MESSAGE_TYPES.ANALYZE });
}

async function handleAnalysisComplete(data, tabId) {
  if (!tabId) return;
  await chrome.storage.local.set({
    [`results_${tabId}`]: {
      data,
      timestamp: Date.now(),
      url: data.url
    }
  });
  chrome.runtime.sendMessage({
    type: MESSAGE_TYPES.ANALYSIS_COMPLETE,
    tabId,
    data
  }).catch(() => {});
}

function handleProgress(data, tabId) {
  chrome.runtime.sendMessage({
    type: MESSAGE_TYPES.ANALYSIS_PROGRESS,
    tabId,
    data
  }).catch(() => {});
}

function handleError(data, tabId) {
  chrome.runtime.sendMessage({
    type: MESSAGE_TYPES.ANALYSIS_ERROR,
    tabId,
    data
  }).catch(() => {});
}

async function handleGetResults(tabId) {
  const key = `results_${tabId}`;
  const stored = await chrome.storage.local.get(key);
  return stored[key] || null;
}

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    handleAnalyze(tab.id);
  }
});
