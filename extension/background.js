// Clicking the toolbar icon toggles the panel in the active tab.
// (The floating launcher button injected on the page does the same.)
chrome.action.onClicked.addListener((tab) => {
  if (tab.id != null) {
    chrome.tabs
      .sendMessage(tab.id, { type: "chess-outplay-toggle" })
      .catch(() => {
        /* no content script on this page (e.g. chrome:// or store pages) */
      });
  }
});
