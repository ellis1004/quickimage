document.addEventListener('DOMContentLoaded', () => {
  const wordInput = document.getElementById('word-input');
  const statWords = document.getElementById('stat-words');
  const statCharsSpace = document.getElementById('stat-chars-space');
  const statCharsNoSpace = document.getElementById('stat-chars-nospace');
  const statParagraphs = document.getElementById('stat-paragraphs');
  const statReadtime = document.getElementById('stat-readtime');
  const btnClear = document.getElementById('btn-clear');
  const btnCopy = document.getElementById('btn-copy');

  function updateStats() {
    const text = wordInput.value;
    
    // Character counts
    const charsSpace = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    
    // Words count (Chinese chars + English/other words)
    const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
    const englishWords = text.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[a-zA-Z0-9_\'-]+/g) || [];
    const totalWords = chineseChars.length + englishWords.length;
    
    // Paragraph count (split by newlines and filter out empty lines)
    const paragraphs = text.split(/\n+/).filter(line => line.trim().length > 0).length;
    
    // Reading time (assume average reading speed of 300 words/min)
    const readTimeMinutes = Math.max(1, Math.ceil(totalWords / 300));
    
    // Update DOM
    statWords.textContent = totalWords;
    statCharsSpace.textContent = charsSpace;
    statCharsNoSpace.textContent = charsNoSpace;
    statParagraphs.textContent = paragraphs;
    statReadtime.textContent = totalWords > 0 ? `${readTimeMinutes}m` : '0m';
  }

  wordInput.addEventListener('input', updateStats);

  btnClear.addEventListener('click', () => {
    wordInput.value = '';
    updateStats();
  });

  btnCopy.addEventListener('click', () => {
    if (!wordInput.value) return;
    navigator.clipboard.writeText(wordInput.value).then(() => {
      const originalText = btnCopy.textContent;
      btnCopy.textContent = '✅ 已複製！';
      setTimeout(() => btnCopy.textContent = originalText, 1500);
    });
  });
});
