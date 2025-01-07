document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('input');
  const summarizeBtn = document.getElementById('summarize');
  const copyBtn = document.getElementById('copy');
  const summaryDiv = document.getElementById('summary');
  const lengthSelect = document.getElementById('length');
  const historyList = document.getElementById('history-list');
  const clearHistoryBtn = document.getElementById('clear-history');

  // Load recent summaries
  loadHistory();

  // Add clear history functionality
  clearHistoryBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all recent summaries?')) {
      await chrome.storage.local.set({ history: [] });
      loadHistory();
    }
  });

  summarizeBtn.addEventListener('click', async () => {
    const text = input.value.trim();
    if (!text) {
      summaryDiv.textContent = 'Please enter some text to summarize.';
      return;
    }

    try {
      summarizeBtn.disabled = true;
      summarizeBtn.textContent = 'Summarizing...';
      
      const response = await summarizeText(text, lengthSelect.value);
      summaryDiv.textContent = response.summary;
      
      // Save to history
      saveToHistory(text, response.summary);
      loadHistory();
    } catch (error) {
      summaryDiv.textContent = 'Error generating summary. Please try again.';
      console.error('Summarization error:', error);
    } finally {
      summarizeBtn.disabled = false;
      summarizeBtn.textContent = 'Summarize';
    }
  });

  copyBtn.addEventListener('click', () => {
    const summary = summaryDiv.textContent;
    if (summary) {
      navigator.clipboard.writeText(summary);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy Summary';
      }, 1500);
    }
  });

  async function summarizeText(text, length) {
    const response = await chrome.runtime.sendMessage({
      action: 'summarize',
      text,
      length
    });
    return response;
  }

  async function loadHistory() {
    const { history = [] } = await chrome.storage.local.get('history');
    historyList.innerHTML = '';
    
    if (history.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-history';
      emptyMessage.textContent = 'No recent summaries';
      historyList.appendChild(emptyMessage);
      return;
    }
    
    history.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.textContent = item.summary;
      historyList.appendChild(div);
    });
  }

  async function saveToHistory(originalText, summary) {
    const { history = [] } = await chrome.storage.local.get('history');
    const newHistory = [
      { originalText, summary, timestamp: Date.now() },
      ...history
    ].slice(0, 5);
    
    await chrome.storage.local.set({ history: newHistory });
  }
});