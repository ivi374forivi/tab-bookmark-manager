const API_URL = 'http://localhost:3000/api';

// DOM elements
const captureTabBtn = document.getElementById('captureTab');
const syncTabsBtn = document.getElementById('syncTabs');
const syncBookmarksBtn = document.getElementById('syncBookmarks');
const closeSavedTabsBtn = document.getElementById('closeSavedTabs');
const findSavedBookmarksBtn = document.getElementById('findSavedBookmarks');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const getSuggestionsBtn = document.getElementById('getSuggestions');
const suggestionsContainer = document.getElementById('suggestionsContainer');
const statsContainer = document.getElementById('statsContainer');
const statusEl = document.getElementById('status');

// Event listeners
captureTabBtn.addEventListener('click', captureCurrentTab);
syncTabsBtn.addEventListener('click', syncAllTabs);
syncBookmarksBtn.addEventListener('click', syncAllBookmarks);
closeSavedTabsBtn.addEventListener('click', closeSavedTabs);
findSavedBookmarksBtn.addEventListener('click', findSavedBookmarks);
searchBtn.addEventListener('click', performSearch);
getSuggestionsBtn.addEventListener('click', fetchSuggestions);

// Initialize
loadStats();

function showStatus(message, type = 'info') {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  
  setTimeout(() => {
    statusEl.textContent = '';
    statusEl.className = 'status';
  }, 3000);
}

async function captureCurrentTab() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'captureCurrentTab' });
    if (response.success) {
      showStatus('Current tab captured successfully!', 'success');
      loadStats();
    }
  } catch (error) {
    showStatus('Failed to capture tab', 'error');
    console.error(error);
  }
}

async function closeSavedTabs() {
  try {
    showStatus('Closing saved tabs...', 'info');
    const response = await chrome.runtime.sendMessage({ action: 'closeSavedTabs' });
    if (response.success) {
      showStatus(`Closed ${response.count} tabs successfully!`, 'success');
    }
  } catch (error) {
    showStatus('Failed to close tabs', 'error');
    console.error(error);
  }
}

async function findSavedBookmarks() {
  try {
    showStatus('Finding saved bookmarks...', 'info');
    const response = await chrome.runtime.sendMessage({ action: 'findSavedBookmarks' });
    if (response.success) {
      showStatus(`Found ${response.count} saved bookmarks.`, 'success');
      displaySearchResults(response.bookmarks);
    }
  } catch (error) {
    showStatus('Failed to find saved bookmarks', 'error');
    console.error(error);
  }
}

async function syncAllTabs() {
  try {
    showStatus('Syncing all tabs...', 'info');
    const response = await chrome.runtime.sendMessage({ action: 'syncAllTabs' });
    if (response.success) {
      showStatus(`Synced ${response.count} tabs successfully!`, 'success');
      loadStats();
    }
  } catch (error) {
    showStatus('Failed to sync tabs', 'error');
    console.error(error);
  }
}

async function syncAllBookmarks() {
  try {
    showStatus('Syncing all bookmarks...', 'info');
    const response = await chrome.runtime.sendMessage({ action: 'syncAllBookmarks' });
    if (response.success) {
      showStatus(`Synced ${response.count} bookmarks successfully!`, 'success');
      loadStats();
    }
  } catch (error) {
    showStatus('Failed to sync bookmarks', 'error');
    console.error(error);
  }
}

async function performSearch() {
  const query = searchInput.value.trim();
  
  if (!query) {
    showStatus('Please enter a search query', 'error');
    return;
  }
  
  try {
    showStatus('Searching...', 'info');
    const response = await fetch(`${API_URL}/search/text?query=${encodeURIComponent(query)}`);
    const results = await response.json();
    
    if (results.length === 0) {
      showStatus('No results found', 'info');
    } else {
      showStatus(`Found ${results.length} results`, 'success');
      displaySearchResults(results);
    }
  } catch (error) {
    showStatus('Search failed', 'error');
    console.error(error);
  }
}

function displaySearchResults(results) {
  suggestionsContainer.innerHTML = '<h3>Search Results</h3>';
  
  results.forEach(result => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.innerHTML = `
      <h3>${result.title || result.url}</h3>
      <p>${result.summary || result.url}</p>
      <small>${result.type}</small>
    `;
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      chrome.tabs.create({ url: result.url });
    });
    suggestionsContainer.appendChild(item);
  });
}

async function fetchSuggestions() {
  try {
    showStatus('Fetching suggestions...', 'info');
    const response = await fetch(`${API_URL}/suggestions`);
    const suggestions = await response.json();
    
    if (suggestions.length === 0) {
      suggestionsContainer.innerHTML = '<p>No suggestions available</p>';
      showStatus('No suggestions found', 'info');
    } else {
      displaySuggestions(suggestions);
      showStatus(`Found ${suggestions.length} suggestions`, 'success');
    }
  } catch (error) {
    showStatus('Failed to fetch suggestions', 'error');
    console.error(error);
  }
}

function displaySuggestions(suggestions) {
  suggestionsContainer.innerHTML = '';
  
  suggestions.forEach(suggestion => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.innerHTML = `
      <h3>${suggestion.type.toUpperCase()}</h3>
      <p>${suggestion.reason}</p>
      <small>Confidence: ${(suggestion.confidence * 100).toFixed(0)}%</small>
    `;
    suggestionsContainer.appendChild(item);
  });
}

async function loadStats() {
  try {
    const [tabsResponse, bookmarksResponse] = await Promise.all([
      fetch(`${API_URL}/tabs`),
      fetch(`${API_URL}/bookmarks`)
    ]);
    
    const tabs = await tabsResponse.json();
    const bookmarks = await bookmarksResponse.json();
    
    statsContainer.innerHTML = `
      <div class="stat-item">
        <div class="stat-value">${tabs.length}</div>
        <div class="stat-label">Tabs</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${bookmarks.length}</div>
        <div class="stat-label">Bookmarks</div>
      </div>
    `;
  } catch (error) {
    statsContainer.innerHTML = '<p>Failed to load stats</p>';
    console.error(error);
  }
}
