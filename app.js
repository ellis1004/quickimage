// DOM Elements
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const formatSelect = document.getElementById('format-select');
const qualityRange = document.getElementById('quality-range');
const qualityValue = document.getElementById('quality-value');
const qualityGroup = document.getElementById('quality-group');
const resultsPanel = document.getElementById('results-panel');
const fileList = document.getElementById('file-list');
const clearAllBtn = document.getElementById('clear-all-btn');
const downloadAllBtn = document.getElementById('download-all-btn');

// State Variables
let filesQueue = []; // Array of { id, file, originalSize, name, previewUrl, originalType }
let processedFiles = []; // Array of { id, blob, url, name, size }
let fileIdCounter = 0;
let processDebounceTimeout = null;

// Initialize Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  initDragAndDrop();
  initControls();
});

// Drag & Drop Handlers
function initDragAndDrop() {
  // Click dropzone to trigger file input
  dropzone.addEventListener('click', () => fileInput.click());
  
  fileInput.addEventListener('change', handleFileSelect);

  // Drag effects
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    }, false);
  });

  // Drop files
  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      addFilesToQueue(files);
    }
  }, false);
}

// Control Input Handlers
function initControls() {
  // Quality range slider value update
  qualityRange.addEventListener('input', () => {
    if (formatSelect.value !== 'image/png') {
      qualityValue.textContent = `${qualityRange.value}%`;
    }
    // Debounce re-processing
    debounceProcess();
  });

  // Format selector change
  formatSelect.addEventListener('change', () => {
    const format = formatSelect.value;
    if (format === 'image/png') {
      qualityGroup.style.opacity = '0.5';
      qualityGroup.style.pointerEvents = 'none';
      qualityValue.textContent = '無損壓縮';
    } else {
      qualityGroup.style.opacity = '1';
      qualityGroup.style.pointerEvents = 'auto';
      qualityValue.textContent = `${qualityRange.value}%`;
    }
    processAllFiles();
  });

  // Buttons
  clearAllBtn.addEventListener('click', clearAll);
  downloadAllBtn.addEventListener('click', downloadAllAsZip);
}

// Add files to the processing queue
function addFilesToQueue(files) {
  const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
  
  if (imageFiles.length === 0) {
    alert('請上傳有效的圖片檔案！');
    return;
  }

  imageFiles.forEach(file => {
    const id = `img-${fileIdCounter++}`;
    const previewUrl = URL.createObjectURL(file);
    
    filesQueue.push({
      id,
      file,
      originalSize: file.size,
      name: file.name,
      previewUrl,
      originalType: file.type
    });
  });

  resultsPanel.style.display = 'block';
  renderQueueItems();
  processAllFiles();
}

function handleFileSelect(e) {
  addFilesToQueue(e.target.files);
  // Reset value so same file can be uploaded again
  fileInput.value = '';
}

// Render list of files
function renderQueueItems() {
  fileList.innerHTML = '';
  filesQueue.forEach(item => {
    // Check if we have processed data for this item
    const processed = processedFiles.find(p => p.id === item.id);
    
    const card = document.createElement('div');
    card.className = 'file-card';
    card.setAttribute('data-id', item.id);

    // Create Card Content
    let metaHTML = `<span class="badge badge-original">原圖: ${formatSize(item.originalSize)}</span>`;
    let actionsHTML = `<span style="font-size:0.85rem; color:var(--text-muted);">處理中...</span>`;

    if (processed) {
      const saving = ((item.originalSize - processed.size) / item.originalSize * 100).toFixed(0);
      const isSaved = saving > 0;
      const savingClass = isSaved ? 'badge-success' : 'badge-original';
      const savingText = isSaved ? `節省 ${saving}%` : `無顯著變化`;
      
      metaHTML += `
        <span class="badge badge-saving">${getFormatExtension(processed.blob.type).toUpperCase()}</span>
        <span class="badge badge-success">${formatSize(processed.size)}</span>
        <span class="badge ${savingClass}">${savingText}</span>
      `;

      actionsHTML = `
        <a href="${processed.url}" download="${processed.name}" class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; border-radius: var(--radius-sm);">下載</a>
        <button class="btn-icon delete-btn" onclick="removeFile('${item.id}')" title="移除">
          <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </button>
      `;
    } else {
      actionsHTML = `
        <span style="font-size:0.85rem; color:var(--text-muted);">處理中...</span>
        <button class="btn-icon delete-btn" onclick="removeFile('${item.id}')" title="移除">
          <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </button>
      `;
    }

    card.innerHTML = `
      <div class="file-preview">
        <img src="${item.previewUrl}" alt="${item.name}">
      </div>
      <div class="file-info">
        <div class="file-name" title="${item.name}">${item.name}</div>
        <div class="file-meta">
          ${metaHTML}
        </div>
      </div>
      <div class="file-actions">
        ${actionsHTML}
      </div>
    `;

    fileList.appendChild(card);
  });
}

// Debounce helper for slider adjustments
function debounceProcess() {
  if (processDebounceTimeout) {
    clearTimeout(processDebounceTimeout);
  }
  processDebounceTimeout = setTimeout(() => {
    processAllFiles();
  }, 200);
}

// Process all files in queue
async function processAllFiles() {
  if (filesQueue.length === 0) return;

  const targetFormat = formatSelect.value;
  const quality = parseFloat(qualityRange.value) / 100;

  // Revoke old object URLs to avoid memory leaks
  processedFiles.forEach(file => URL.revokeObjectURL(file.url));
  processedFiles = [];

  // Re-render to show loading status
  renderQueueItems();

  for (const item of filesQueue) {
    try {
      const compressedBlob = await compressImage(item, targetFormat, quality);
      const url = URL.createObjectURL(compressedBlob);
      const extension = getFormatExtension(targetFormat);
      
      // Construct output filename
      const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
      const outputName = `${baseName}_compressed.${extension}`;

      processedFiles.push({
        id: item.id,
        blob: compressedBlob,
        url,
        name: outputName,
        size: compressedBlob.size
      });
    } catch (error) {
      console.error(`Error processing file ${item.name}:`, error);
    }
  }

  // Final render with completed results
  renderQueueItems();
}

// Core Image Compression Logic using Canvas API
function compressImage(fileObj, format, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // Apply white background for JPEGs (which don't support transparency)
        if (format === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas export failed'));
          }
        }, format, format === 'image/png' ? undefined : quality);
      };
      img.onerror = () => reject(new Error('Image failed to load'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('File reader error'));
    reader.readAsDataURL(fileObj.file);
  });
}

// Helper to remove a single file
window.removeFile = function(id) {
  // Revoke URLs to free memory
  const fileIndex = filesQueue.findIndex(f => f.id === id);
  if (fileIndex > -1) {
    URL.revokeObjectURL(filesQueue[fileIndex].previewUrl);
    filesQueue.splice(fileIndex, 1);
  }

  const processedIndex = processedFiles.findIndex(p => p.id === id);
  if (processedIndex > -1) {
    URL.revokeObjectURL(processedFiles[processedIndex].url);
    processedFiles.splice(processedIndex, 1);
  }

  if (filesQueue.length === 0) {
    resultsPanel.style.display = 'none';
  } else {
    renderQueueItems();
  }
};

// Clear all items
function clearAll() {
  filesQueue.forEach(f => URL.revokeObjectURL(f.previewUrl));
  processedFiles.forEach(p => URL.revokeObjectURL(p.url));
  
  filesQueue = [];
  processedFiles = [];
  resultsPanel.style.display = 'none';
  fileList.innerHTML = '';
}

// Download all processed files as a single ZIP
async function downloadAllAsZip() {
  if (processedFiles.length === 0) return;

  downloadAllBtn.disabled = true;
  downloadAllBtn.textContent = '正在打包...';

  const zip = new JSZip();

  processedFiles.forEach(file => {
    zip.file(file.name, file.blob);
  });

  try {
    const zipContent = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(zipContent);
    
    const link = document.createElement('a');
    link.href = zipUrl;
    link.download = `QuickImage_compressed_${Date.now()}.zip`;
    link.click();
    
    // Cleanup
    setTimeout(() => URL.revokeObjectURL(zipUrl), 1000);
  } catch (error) {
    console.error('Failed to generate zip:', error);
    alert('打包下載失敗，請嘗試個別下載圖片。');
  } finally {
    downloadAllBtn.disabled = false;
    downloadAllBtn.textContent = '下載全部 (.zip)';
  }
}

// Helper: Format Bytes to human readable string
function formatSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper: Get extension name from mime type
function getFormatExtension(mimeType) {
  switch (mimeType) {
    case 'image/webp': return 'webp';
    case 'image/jpeg': return 'jpg';
    case 'image/png': return 'png';
    default: return 'bin';
  }
}
