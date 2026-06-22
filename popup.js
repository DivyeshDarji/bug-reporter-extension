chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "TAKE_SCREENSHOT") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      sendResponse({ image: dataUrl });
    });

    return true; // important for async response
  }
});