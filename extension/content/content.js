// Content script for extracting page content
console.log('Tab & Bookmark Manager content script loaded');

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContent') {
    const content = {
      text: document.body.innerText,
      title: document.title,
      url: window.location.href
    };
    sendResponse(content);
  }
});
