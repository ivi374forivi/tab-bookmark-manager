const API_URL = 'http://localhost:3000/api';

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    captureTab(tab);
  }
});

// Listen for tab creation
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url) {
    captureTab(tab);
  }
});

// Listen for bookmark creation
chrome.bookmarks.onCreated.addListener((id, bookmark) => {
  if (bookmark.url) {
    captureBookmark(bookmark);
  }
});

// Function to capture tab information
async function captureTab(tab) {
  try {
    // Get page content
    const [{ result: content }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body.innerText
    });

    const tabData = {
      url: tab.url,
      title: tab.title,
      favicon: tab.favIconUrl,
      content: content ? content.substring(0, 5000) : '' // Limit content size
    };

    // Send to backend API
    const response = await fetch(`${API_URL}/tabs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tabData)
    });

    if (response.ok) {
      console.log('Tab captured successfully:', tab.url);
    }
  } catch (error) {
    console.error('Error capturing tab:', error);
  }
}

// Function to capture bookmark information
async function captureBookmark(bookmark) {
  try {
    const bookmarkData = {
      url: bookmark.url,
      title: bookmark.title,
      favicon: `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}`,
      folder: bookmark.parentId || 'default',
      content: '' // Content will be fetched by backend
    };

    // Send to backend API
    const response = await fetch(`${API_URL}/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookmarkData)
    });

    if (response.ok) {
      console.log('Bookmark captured successfully:', bookmark.url);
    }
  } catch (error) {
    console.error('Error capturing bookmark:', error);
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureCurrentTab') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        captureTab(tabs[0]);
        sendResponse({ success: true });
      }
    });
    return true;
  }
  
  if (request.action === 'syncAllTabs') {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url && !tab.url.startsWith('chrome://')) {
          captureTab(tab);
        }
      });
      sendResponse({ success: true, count: tabs.length });
    });
    return true;
  }
  
  if (request.action === 'syncAllBookmarks') {
    chrome.bookmarks.getTree((bookmarkTree) => {
      const bookmarks = [];
      
      function traverse(nodes) {
        nodes.forEach(node => {
          if (node.url) {
            bookmarks.push(node);
            captureBookmark(node);
          }
          if (node.children) {
            traverse(node.children);
          }
        });
      }
      
      traverse(bookmarkTree);
      sendResponse({ success: true, count: bookmarks.length });
    });
    return true;
  }
});

console.log('Tab & Bookmark Manager extension loaded');
