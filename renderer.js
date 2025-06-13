// renderer.js
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const urlInput = document.getElementById('urlInput');
  const addButton = document.getElementById('addButton');
  const urlList = document.getElementById('urlList');
  const sendButton = document.getElementById('sendButton');
  const clearButton = document.getElementById('clearButton');
  const resultsDiv = document.getElementById('results');
  const statusElement = document.getElementById('status');
  
  // Store URLs
  let urls = [];
  
  // Add URL to list
  function addUrl() {
    const url = urlInput.value.trim();
    
    if (url && isValidYoutubeUrl(url)) {
      if (!urls.includes(url)) {
        urls.push(url);
        renderUrlList();
        urlInput.value = '';
      } else {
        showStatus('This URL is already in the list', 'error');
      }
    } else {
      showStatus('Please enter a valid YouTube URL', 'error');
    }
    
    urlInput.focus();
  }
  
  // Validate YouTube URL
  function isValidYoutubeUrl(url) {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return pattern.test(url);
  }
  
  // Render URL list
  function renderUrlList() {
    urlList.innerHTML = '';
    
    if (urls.length === 0) {
      urlList.innerHTML = '<li class="empty-list">No URLs added yet</li>';
      sendButton.disabled = true;
    } else {
      sendButton.disabled = false;
      urls.forEach((url, index) => {
        const li = document.createElement('li');
        
        const urlText = document.createElement('span');
        urlText.textContent = url;
        li.appendChild(urlText);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Remove';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => removeUrl(index));
        
        li.appendChild(deleteBtn);
        urlList.appendChild(li);
      });
    }
  }
  
  // Remove URL from list
  function removeUrl(index) {
    urls.splice(index, 1);
    renderUrlList();
  }
  
  // Clear list
  function clearList() {
    urls = [];
    renderUrlList();
    resultsDiv.innerHTML = '';
  }
  
  // Display status message
  function showStatus(message, type = 'info') {
    statusElement.textContent = message;
    statusElement.className = `status-${type}`;
    
    setTimeout(() => {
      statusElement.textContent = '';
      statusElement.className = '';
    }, 3000);
  }
  
  // Send URLs for processing
  async function sendUrls() {
    if (urls.length === 0) {
      showStatus('No URLs to download', 'error');
      return;
    }
    
    try {
      // Disable buttons during processing
      sendButton.disabled = true;
      addButton.disabled = true;
      clearButton.disabled = true;
      
      showStatus('Processing downloads...', 'info');
      
      // Send URLs to the main process
      const results = await window.api.downloadUrls(urls);
      
      // Display results
      displayResults(results);
      
      showStatus('Download process completed!', 'success');
    } catch (error) {
      showStatus(`Error: ${error.message}`, 'error');
      console.error('Download error:', error);
    } finally {
      // Re-enable buttons
      sendButton.disabled = false;
      addButton.disabled = false;
      clearButton.disabled = false;
    }
  }
  
  // Display download results
  function displayResults(results) {
    resultsDiv.innerHTML = '';
    
    results.forEach(result => {
      const resultItem = document.createElement('div');
      resultItem.classList.add('result-item');
      
      if (result.success) {
        resultItem.classList.add('result-success');
        resultItem.innerHTML = `<strong>Success:</strong> ${result.message}`;
      } else {
        resultItem.classList.add('result-error');
        resultItem.innerHTML = `<strong>Error:</strong> Failed to download ${result.url} - ${result.message}`;
      }
      
      resultsDiv.appendChild(resultItem);
    });
  }
  
  // Event listeners
  addButton.addEventListener('click', addUrl);
  
  urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addUrl();
  });
  
  sendButton.addEventListener('click', sendUrls);
  clearButton.addEventListener('click', clearList);
  
  // Initialize UI
  renderUrlList();
});
