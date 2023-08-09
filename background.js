let currentUrl = "";

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!currentUrl || changeInfo?.url !== currentUrl) {
    currentUrl = changeInfo.url ?? tab.url;
    chrome.tabs.sendMessage(tabId, "urlChanged");
  }
});
