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
  const outputFolderInput = document.getElementById('outputFolder');
  const folderSelectButton = document.getElementById('folderSelectButton');
  
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
        showStatus('Cette URL est déjà dans la liste', 'error');
      }
    } else {
      showStatus('Veuillez entrer une URL YouTube valide', 'error');
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
      urlList.innerHTML = '<li class="empty-list">Aucune URL ajoutée pour le moment</li>';
      sendButton.disabled = true;
    } else {
      sendButton.disabled = false;
      urls.forEach((url, index) => {
        const li = document.createElement('li');
        
        const urlText = document.createElement('span');
        urlText.textContent = url;
        li.appendChild(urlText);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Supprimer';
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
  
  // Select output folder
  async function selectOutputFolder() {
    try {
      const folder = await window.api.selectFolder();
      if (folder) {
        outputFolderInput.value = folder;
        showStatus('Dossier de sortie défini avec succès', 'success');
      }
    } catch (error) {
      showStatus('Erreur lors de la sélection du dossier', 'error');
      console.error('Folder selection error:', error);
    }
  }
  
  // Send URLs for processing
  async function sendUrls() {
    if (urls.length === 0) {
      showStatus('Aucune URL à télécharger', 'error');
      return;
    }
    
    const outputFolder = outputFolderInput.value.trim();
    if (!outputFolder) {
      showStatus('Veuillez sélectionner un dossier de sortie', 'error');
      return;
    }
    
    try {
      // Disable buttons during processing
      sendButton.disabled = true;
      addButton.disabled = true;
      clearButton.disabled = true;
      folderSelectButton.disabled = true;
      
      showStatus('Traitement des téléchargements...', 'info');
      
      // Send URLs to the main process with the output folder
      const results = await window.api.downloadUrls(urls, outputFolder);
      
      // Display results
      displayResults(results);
      
      showStatus('Le processus de téléchargement est terminé!', 'success');
    } catch (error) {
      showStatus(`Erreur: ${error.message}`, 'error');
      console.error('Download error:', error);
    } finally {
      // Re-enable buttons
      sendButton.disabled = false;
      addButton.disabled = false;
      clearButton.disabled = false;
      folderSelectButton.disabled = false;
    }
  }
  
  // Afficher les résultats des téléchargements
  function displayResults(results) {
    resultsDiv.innerHTML = '';
    
    results.forEach(result => {
      const resultItem = document.createElement('div');
      resultItem.classList.add('result-item');
      
      if (result.success) {
        resultItem.classList.add('result-success');
        resultItem.innerHTML = `<strong>Réussi:</strong> ${result.message}`;
      } else {
        resultItem.classList.add('result-error');
        resultItem.innerHTML = `<strong>Erreur:</strong> Échec du téléchargement ${result.url} - ${result.message}`;
      }
      
      resultsDiv.appendChild(resultItem);
    });
  }
  
  // Écouteurs d'événements
  addButton.addEventListener('click', addUrl);
  
  urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addUrl();
  });
  
  folderSelectButton.addEventListener('click', selectOutputFolder);
  sendButton.addEventListener('click', sendUrls);
  clearButton.addEventListener('click', clearList);
  
  // Initialize UI
  renderUrlList();
});
