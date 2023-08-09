let currentUrl = "";

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const newUrl = tab.url;
  const isNewUrlAProfile = changeInfo?.title?.includes("(@");

  if (newUrl !== currentUrl && isNewUrlAProfile) {
    currentUrl = newUrl;
    chrome.tabs.sendMessage(tabId, "urlChanged");
  }
});
