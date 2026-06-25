document.addEventListener('DOMContentLoaded', () => {
  const tabTextBtn = document.getElementById('tab-text-btn');
  const tabImageBtn = document.getElementById('tab-image-btn');
  const tabTextContent = document.getElementById('tab-text-content');
  const tabImageContent = document.getElementById('tab-image-content');

  // Text Elements
  const textInput = document.getElementById('text-input');
  const base64Output = document.getElementById('base64-output');
  const btnEncode = document.getElementById('btn-encode');
  const btnDecode = document.getElementById('btn-decode');
  const btnTextClear = document.getElementById('btn-text-clear');
  const btnTextCopy = document.getElementById('btn-text-copy');

  // Image Elements
  const imgDropzone = document.getElementById('img-dropzone');
  const imgFile = document.getElementById('img-file');
  const imgResultBox = document.getElementById('img-result-box');
  const imgPreview = document.getElementById('img-preview');
  const imgBase64Output = document.getElementById('img-base64-output');
  const btnImgCopy = document.getElementById('btn-img-copy');

  // Tabs switching
  tabTextBtn.addEventListener('click', () => {
    tabTextBtn.classList.add('active');
    tabImageBtn.classList.remove('active');
    tabTextContent.classList.add('active');
    tabImageContent.classList.remove('active');
  });

  tabImageBtn.addEventListener('click', () => {
    tabImageBtn.classList.add('active');
    tabTextBtn.classList.remove('active');
    tabImageContent.classList.add('active');
    tabTextContent.classList.remove('active');
  });

  // 1. Text UTF-8 safe Base64 encoder/decoder
  function utf8_to_b64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  function b64_to_utf8(str) {
    return decodeURIComponent(escape(atob(str)));
  }

  btnEncode.addEventListener('click', () => {
    const text = textInput.value;
    if (!text) return;
    try {
      base64Output.value = utf8_to_b64(text);
    } catch(e) {
      base64Output.value = `❌ 編碼錯誤：${e.message}`;
    }
  });

  btnDecode.addEventListener('click', () => {
    const b64 = base64Output.value.trim() || textInput.value.trim();
    if (!b64) return;
    try {
      base64Output.value = b64_to_utf8(b64);
    } catch(e) {
      base64Output.value = `❌ 解碼錯誤：輸入的不是有效的 Base64 字串。\n(${e.message})`;
    }
  });

  btnTextClear.addEventListener('click', () => {
    textInput.value = '';
    base64Output.value = '';
  });

  btnTextCopy.addEventListener('click', () => {
    if (!base64Output.value || base64Output.value.startsWith('❌')) return;
    navigator.clipboard.writeText(base64Output.value).then(() => {
      const originalText = btnTextCopy.textContent;
      btnTextCopy.textContent = '✅ 已複製！';
      setTimeout(() => btnTextCopy.textContent = originalText, 1500);
    });
  });

  // 2. Image to Base64
  imgDropzone.addEventListener('click', () => imgFile.click());
  imgDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    imgDropzone.classList.add('dragover');
  });
  imgDropzone.addEventListener('dragleave', () => imgDropzone.classList.remove('dragover'));
  imgDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    imgDropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      processImage(e.dataTransfer.files[0]);
    }
  });

  imgFile.addEventListener('change', () => {
    if (imgFile.files.length > 0) {
      processImage(imgFile.files[0]);
    }
  });

  function processImage(file) {
    if (!file.type.startsWith('image/')) {
      alert('請上傳合法的圖片檔案！');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      imgPreview.src = event.target.result;
      imgBase64Output.value = event.target.result;
      imgResultBox.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }

  btnImgCopy.addEventListener('click', () => {
    if (!imgBase64Output.value) return;
    navigator.clipboard.writeText(imgBase64Output.value).then(() => {
      const originalText = btnImgCopy.textContent;
      btnImgCopy.textContent = '✅ 已複製！';
      setTimeout(() => btnImgCopy.textContent = originalText, 1500);
    });
  });
});
