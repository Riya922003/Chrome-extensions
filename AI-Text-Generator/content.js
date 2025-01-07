chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showSummary') {
      showSummaryOverlay(request.summary);
    }
  });
  
  function showSummaryOverlay(summary) {
    // Remove existing overlay if any
    const existingOverlay = document.getElementById('ai-summary-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
  
    // Create and style overlay
    const overlay = document.createElement('div');
    overlay.id = 'ai-summary-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      padding: 16px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;
  
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      border: none;
      background: none;
      font-size: 20px;
      cursor: pointer;
      color: #666;
    `;
    closeBtn.onclick = () => overlay.remove();
  
    // Add summary content
    const content = document.createElement('div');
    content.style.marginTop = '10px';
    content.textContent = summary;
  
    overlay.appendChild(closeBtn);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
  }