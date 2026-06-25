document.addEventListener('DOMContentLoaded', () => {
  const tabGlassBtn = document.getElementById('tab-glass-btn');
  const tabShadowBtn = document.getElementById('tab-shadow-btn');
  const glassControls = document.getElementById('glass-controls');
  const shadowControls = document.getElementById('shadow-controls');
  
  const glassOpacity = document.getElementById('glass-opacity');
  const glassBlur = document.getElementById('glass-blur');
  const glassBorder = document.getElementById('glass-border');
  
  const shadowX = document.getElementById('shadow-x');
  const shadowY = document.getElementById('shadow-y');
  const shadowBlur = document.getElementById('shadow-blur');
  const shadowOpacity = document.getElementById('shadow-opacity');
  
  const previewBlock = document.getElementById('preview-block');
  const cssOutput = document.getElementById('css-output');
  const btnCopy = document.getElementById('btn-copy');

  let currentTab = 'glass'; // 'glass' or 'shadow'

  function updateValues() {
    document.getElementById('glass-opacity-val').textContent = glassOpacity.value;
    document.getElementById('glass-blur-val').textContent = `${glassBlur.value}px`;
    document.getElementById('glass-border-val').textContent = glassBorder.value;

    document.getElementById('shadow-x-val').textContent = `${shadowX.value}px`;
    document.getElementById('shadow-y-val').textContent = `${shadowY.value}px`;
    document.getElementById('shadow-blur-val').textContent = `${shadowBlur.value}px`;
    document.getElementById('shadow-opacity-val').textContent = shadowOpacity.value;
  }

  function applyStyles() {
    updateValues();
    if (currentTab === 'glass') {
      const op = glassOpacity.value;
      const blur = glassBlur.value;
      const borderOp = glassBorder.value;

      previewBlock.style.background = `rgba(255, 255, 255, ${op})`;
      previewBlock.style.backdropFilter = `blur(${blur}px)`;
      previewBlock.style.webkitBackdropFilter = `blur(${blur}px)`;
      previewBlock.style.border = `1px solid rgba(255, 255, 255, ${borderOp})`;
      previewBlock.style.boxShadow = 'none';

      cssOutput.value = `background: rgba(255, 255, 255, ${op});\nbackdrop-filter: blur(${blur}px);\n-webkit-backdrop-filter: blur(${blur}px);\nborder: 1px solid rgba(255, 255, 255, ${borderOp});\nborder-radius: 12px;`;
    } else {
      const x = shadowX.value;
      const y = shadowY.value;
      const blur = shadowBlur.value;
      const op = shadowOpacity.value;

      previewBlock.style.background = '#6366f1';
      previewBlock.style.backdropFilter = 'none';
      previewBlock.style.webkitBackdropFilter = 'none';
      previewBlock.style.border = 'none';
      previewBlock.style.boxShadow = `${x}px ${y}px ${blur}px rgba(0, 0, 0, ${op})`;

      cssOutput.value = `background-color: #6366f1;\nbox-shadow: ${x}px ${y}px ${blur}px rgba(0, 0, 0, ${op});\nborder-radius: 12px;`;
    }
  }

  tabGlassBtn.addEventListener('click', () => {
    currentTab = 'glass';
    tabGlassBtn.classList.add('active');
    tabShadowBtn.classList.remove('active');
    glassControls.style.display = 'block';
    shadowControls.style.display = 'none';
    applyStyles();
  });

  tabShadowBtn.addEventListener('click', () => {
    currentTab = 'shadow';
    tabShadowBtn.classList.add('active');
    tabGlassBtn.classList.remove('active');
    shadowControls.style.display = 'block';
    glassControls.style.display = 'none';
    applyStyles();
  });

  // Attach events
  [glassOpacity, glassBlur, glassBorder, shadowX, shadowY, shadowBlur, shadowOpacity].forEach(input => {
    input.addEventListener('input', applyStyles);
  });

  btnCopy.addEventListener('click', () => {
    if (!cssOutput.value) return;
    navigator.clipboard.writeText(cssOutput.value).then(() => {
      const originalText = btnCopy.textContent;
      btnCopy.textContent = '✅ 已複製 CSS！';
      setTimeout(() => btnCopy.textContent = originalText, 1500);
    });
  });

  // Initial trigger
  applyStyles();
});
