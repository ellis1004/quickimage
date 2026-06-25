document.addEventListener('DOMContentLoaded', () => {
  const pLength = document.getElementById('password-length');
  const lengthVal = document.getElementById('length-val');
  const optUpper = document.getElementById('opt-upper');
  const optLower = document.getElementById('opt-lower');
  const optNums = document.getElementById('opt-nums');
  const optSymbols = document.getElementById('opt-symbols');
  const optExclude = document.getElementById('opt-exclude');
  const pDisplay = document.getElementById('password-display');
  const btnGenerate = document.getElementById('btn-generate');
  const btnCopy = document.getElementById('btn-copy');
  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');

  pLength.addEventListener('input', () => {
    lengthVal.textContent = pLength.value;
  });

  function getStrength(pwd, len, u, l, n, s) {
    if (!pwd) return { text: '-', class: '' };
    let score = 0;
    if (len >= 10) score += 1;
    if (len >= 14) score += 1;
    if (len >= 18) score += 1;
    if (u) score += 1;
    if (l) score += 1;
    if (n) score += 1;
    if (s) score += 1;

    if (score <= 3) return { text: '弱 (Weak) 🔴', class: 'strength-weak' };
    if (score <= 5) return { text: '中等 (Fair) 🟡', class: 'strength-fair' };
    if (score <= 6) return { text: '良好 (Good) 🔵', class: 'strength-good' };
    return { text: '極強 (Strong) 🟢', class: 'strength-strong' };
  }

  function generatePassword() {
    const len = parseInt(pLength.value);
    const u = optUpper.checked;
    const l = optLower.checked;
    const n = optNums.checked;
    const s = optSymbols.checked;
    const exc = optExclude.checked;

    let upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lowerChars = 'abcdefghijklmnopqrstuvwxyz';
    let numChars = '0123456789';
    let symbolChars = '!@#$%^&*()_+-=[]{}|;:,./<>?';

    if (exc) {
      upperChars = upperChars.replace(/[OI]/g, '');
      lowerChars = lowerChars.replace(/[ol]/g, '');
      numChars = numChars.replace(/[01]/g, '');
    }

    let charPool = '';
    let guaranteed = [];

    if (u) {
      charPool += upperChars;
      guaranteed.push(upperChars[Math.floor(Math.random() * upperChars.length)]);
    }
    if (l) {
      charPool += lowerChars;
      guaranteed.push(lowerChars[Math.floor(Math.random() * lowerChars.length)]);
    }
    if (n) {
      charPool += numChars;
      guaranteed.push(numChars[Math.floor(Math.random() * numChars.length)]);
    }
    if (s) {
      charPool += symbolChars;
      guaranteed.push(symbolChars[Math.floor(Math.random() * symbolChars.length)]);
    }

    if (charPool === '') {
      pDisplay.textContent = '請至少選擇一種字元類型！';
      strengthBar.className = 'strength-bar';
      strengthBar.style.width = '0%';
      strengthText.textContent = '-';
      return;
    }

    let result = [];
    // Put guaranteed characters first
    for (let i = 0; i < guaranteed.length && i < len; i++) {
      result.push(guaranteed[i]);
    }

    // Fill the rest randomly
    const restLen = len - result.length;
    for (let i = 0; i < restLen; i++) {
      result.push(charPool[Math.floor(Math.random() * charPool.length)]);
    }

    // Shuffle the result array
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    const pwd = result.join('');
    pDisplay.textContent = pwd;

    // Strength
    const strength = getStrength(pwd, len, u, l, n, s);
    strengthBar.className = `strength-bar ${strength.class}`;
    strengthText.textContent = strength.text;
  }

  btnGenerate.addEventListener('click', generatePassword);

  btnCopy.addEventListener('click', () => {
    const pwd = pDisplay.textContent;
    if (pwd === '請點擊生成按鈕' || pwd === '請至少選擇一種字元類型！') return;
    navigator.clipboard.writeText(pwd).then(() => {
      const originalSvg = btnCopy.innerHTML;
      btnCopy.innerHTML = '<span style="color:var(--success); font-size:0.8rem; font-weight:700;">OK</span>';
      setTimeout(() => btnCopy.innerHTML = originalSvg, 1500);
    });
  });

  // Initial password on load
  generatePassword();
});
