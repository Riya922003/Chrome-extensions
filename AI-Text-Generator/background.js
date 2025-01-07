// const GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'summarizeText',
    title: 'Summarize with AI',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'summarizeText') {
    const summary = await generateSummary(info.selectionText, 'medium');
    // Send the summary back to the content script
    chrome.tabs.sendMessage(tab.id, { 
      action: 'showSummary', 
      summary 
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarize') {
    generateSummary(request.text, request.length)
      .then(summary => sendResponse({ summary }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Required for async response
  }
});

async function generateSummary(text, length) {
  const lengthPrompts = {
    short: 'Provide a very concise summary in 1-2 sentences.',
    medium: 'Provide a balanced summary in 3-4 sentences.',
    long: 'Provide a detailed summary in 5-6 sentences.'
  };

  const prompt = `${lengthPrompts[length]} Text to summarize: ${text}`;

  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to generate summary');
  }
}