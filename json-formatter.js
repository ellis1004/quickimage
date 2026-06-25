document.addEventListener('DOMContentLoaded', () => {
  const jsonInput = document.getElementById('json-input');
  const jsonOutput = document.getElementById('json-output');
  const errorBox = document.getElementById('error-box');
  const btnFormat2 = document.getElementById('btn-format-2');
  const btnFormat4 = document.getElementById('btn-format-4');
  const btnMinify = document.getElementById('btn-minify');
  const btnClear = document.getElementById('btn-clear');
  const btnCopy = document.getElementById('btn-copy');

  function processJSON(indent) {
    const rawVal = jsonInput.value.trim();
    if (!rawVal) {
      jsonOutput.value = '';
      errorBox.style.display = 'none';
      return;
    }

    try {
      const parsed = JSON.parse(rawVal);
      let result = '';
      if (indent === 'minify') {
        result = JSON.stringify(parsed);
      } else {
        result = JSON.stringify(parsed, null, indent);
      }
      jsonOutput.value = result;
      errorBox.style.display = 'none';
    } catch (e) {
      jsonOutput.value = '';
      errorBox.textContent = `❌ JSON 格式解析失敗：${e.message}`;
      errorBox.style.display = 'block';
    }
  }

  btnFormat2.addEventListener('click', () => processJSON(2));
  btnFormat4.addEventListener('click', () => processJSON(4));
  btnMinify.addEventListener('click', () => processJSON('minify'));
  
  btnClear.addEventListener('click', () => {
    jsonInput.value = '';
    jsonOutput.value = '';
    errorBox.style.display = 'none';
  });

  btnCopy.addEventListener('click', () => {
    if (!jsonOutput.value) return;
    navigator.clipboard.writeText(jsonOutput.value).then(() => {
      const originalText = btnCopy.textContent;
      btnCopy.textContent = '✅ 已複製！';
      setTimeout(() => btnCopy.textContent = originalText, 1500);
    });
  });
});
