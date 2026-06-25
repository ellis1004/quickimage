document.addEventListener('DOMContentLoaded', () => {
  const colorInput = document.getElementById('color-input');
  const colorHex = document.getElementById('color-hex');
  const colorRgb = document.getElementById('color-rgb');
  const colorHsl = document.getElementById('color-hsl');
  const colorPreview = document.getElementById('color-preview');
  const nativePicker = document.getElementById('native-color-picker');
  
  const paletteContainer = document.getElementById('palette-container');
  const btnGeneratePalette = document.getElementById('btn-generate-palette');

  function parseColor(str) {
    let ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = str;
    let computed = ctx.fillStyle; // Outputs hex '#rrggbb' or similar
    if (!computed || computed === '#000000' && str !== 'black' && str !== '#000000' && str !== '#000' && !str.startsWith('rgb(0,0,0)')) {
      return null;
    }
    return computed;
  }

  function hexToRgb(hex) {
    let bigint = parseInt(hex.slice(1), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return { r, g, b };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function updateColorUI(hex) {
    if (!hex) return;
    colorHex.value = hex.toUpperCase();
    const rgb = hexToRgb(hex);
    colorRgb.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    colorHsl.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    
    colorPreview.style.backgroundColor = hex;
    colorPreview.textContent = hex.toUpperCase();
    
    // Choose text color based on brightness
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    colorPreview.style.color = brightness > 125 ? '#000000' : '#ffffff';
    nativePicker.value = hex;
  }

  colorInput.addEventListener('input', () => {
    const val = colorInput.value.trim();
    const parsed = parseColor(val);
    if (parsed) {
      updateColorUI(parsed);
    }
  });

  nativePicker.addEventListener('input', () => {
    const hex = nativePicker.value;
    colorInput.value = hex;
    updateColorUI(hex);
  });

  // Copy trigger on inputs
  [colorHex, colorRgb, colorHsl].forEach(input => {
    input.addEventListener('click', () => {
      if (!input.value) return;
      navigator.clipboard.writeText(input.value).then(() => {
        const originalVal = input.value;
        input.value = '✅ 已複製！';
        setTimeout(() => input.value = originalVal, 1000);
      });
    });
  });

  // Palette Generation
  function generatePalette() {
    paletteContainer.innerHTML = '';
    const baseHue = Math.floor(Math.random() * 360);
    
    // Create analogous or monochromatic palette in HSL
    for (let i = 0; i < 5; i++) {
      const h = (baseHue + (i * 30)) % 360;
      const s = 65 + Math.floor(Math.random() * 20); // 65% - 85%
      const l = 40 + Math.floor(Math.random() * 25); // 40% - 65%
      
      const hslStr = `hsl(${h}, ${s}%, ${l}%)`;
      // Convert HSL to Hex using canvas
      const hex = parseColor(hslStr);
      
      const colDiv = document.createElement('div');
      colDiv.className = 'palette-color';
      colDiv.style.backgroundColor = hex;
      colDiv.textContent = hex.toUpperCase();
      
      // Text color
      const rgb = hexToRgb(hex);
      const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
      colDiv.style.color = brightness > 125 ? '#000000' : '#ffffff';
      
      colDiv.addEventListener('click', () => {
        navigator.clipboard.writeText(hex.toUpperCase()).then(() => {
          const originalText = colDiv.textContent;
          colDiv.textContent = 'Copied!';
          setTimeout(() => colDiv.textContent = originalText, 1000);
        });
      });

      paletteContainer.appendChild(colDiv);
    }
  }

  btnGeneratePalette.addEventListener('click', generatePalette);

  // Initial trigger
  updateColorUI('#6366F1');
});
