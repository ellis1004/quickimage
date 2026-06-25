document.addEventListener('DOMContentLoaded', () => {
  const tabGenBtn = document.getElementById('tab-gen-btn');
  const tabReadBtn = document.getElementById('tab-read-btn');
  const tabGenContent = document.getElementById('tab-gen-content');
  const tabReadContent = document.getElementById('tab-read-content');
  
  const qrText = document.getElementById('qr-text');
  const qrFg = document.getElementById('qr-fg');
  const qrcodeDiv = document.getElementById('qrcode');
  const btnDownload = document.getElementById('btn-download');
  
  const qrDropzone = document.getElementById('qr-dropzone');
  const qrFile = document.getElementById('qr-file');
  const qrResultBox = document.getElementById('qr-result-box');
  const qrResultText = document.getElementById('qr-result-text');
  const btnCopyResult = document.getElementById('btn-copy-result');
  const qrCanvas = document.getElementById('qr-canvas');

  // Tabs switching
  tabGenBtn.addEventListener('click', () => {
    tabGenBtn.classList.add('active');
    tabReadBtn.classList.remove('active');
    tabGenContent.classList.add('active');
    tabReadContent.classList.remove('active');
  });

  tabReadBtn.addEventListener('click', () => {
    tabReadBtn.classList.add('active');
    tabGenBtn.classList.remove('active');
    tabReadContent.classList.add('active');
    tabGenContent.classList.remove('active');
  });

  // 1. Generate QR Code
  let qrcodeInstance = null;
  function renderQRCode() {
    const text = qrText.value.trim() || 'https://www.quicktoolslive.com';
    const fgColor = qrFg.value;
    
    qrcodeDiv.innerHTML = '';
    qrcodeInstance = new QRCode(qrcodeDiv, {
      text: text,
      width: 160,
      height: 160,
      colorDark: fgColor,
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  qrText.addEventListener('input', renderQRCode);
  qrFg.addEventListener('input', renderQRCode);

  // Download logic
  btnDownload.addEventListener('click', () => {
    const img = qrcodeDiv.querySelector('img');
    if (!img) return;
    const link = document.createElement('a');
    link.href = img.src;
    link.download = 'qrcode.png';
    link.click();
  });

  // 2. Decode QR Code
  qrDropzone.addEventListener('click', () => qrFile.click());
  qrDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    qrDropzone.classList.add('dragover');
  });
  qrDropzone.addEventListener('dragleave', () => qrDropzone.classList.remove('dragover'));
  qrDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    qrDropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      decodeFile(e.dataTransfer.files[0]);
    }
  });

  qrFile.addEventListener('change', () => {
    if (qrFile.files.length > 0) {
      decodeFile(qrFile.files[0]);
    }
  });

  function decodeFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('請上傳有效的圖片檔案！');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const ctx = qrCanvas.getContext('2d');
        qrCanvas.width = img.width;
        qrCanvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);
        
        if (code) {
          qrResultText.value = code.data;
          qrResultBox.style.display = 'block';
        } else {
          qrResultText.value = '❌ 無法在圖片中解析出有效的 QR Code，請試試其他圖片。';
          qrResultBox.style.display = 'block';
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  btnCopyResult.addEventListener('click', () => {
    if (!qrResultText.value || qrResultText.value.startsWith('❌')) return;
    navigator.clipboard.writeText(qrResultText.value).then(() => {
      const originalText = btnCopyResult.textContent;
      btnCopyResult.textContent = '✅ 已複製！';
      setTimeout(() => btnCopyResult.textContent = originalText, 1500);
    });
  });

  // Generate on load
  renderQRCode();
});
