document.addEventListener('DOMContentLoaded', () => {
  const category = document.getElementById('convert-category');
  const unitFrom = document.getElementById('unit-from');
  const unitTo = document.getElementById('unit-to');
  const inputVal = document.getElementById('input-val');
  const outputVal = document.getElementById('output-val');

  const units = {
    length: {
      '公尺 (m)': 1,
      '公分 (cm)': 0.01,
      '公釐 (mm)': 0.001,
      '公里 (km)': 1000,
      '英吋 (inch)': 0.0254,
      '英呎 (feet)': 0.3048,
      '碼 (yard)': 0.9144,
      '英哩 (mile)': 1609.344
    },
    weight: {
      '公斤 (kg)': 1,
      '公克 (g)': 0.001,
      '毫克 (mg)': 0.000001,
      '磅 (lb)': 0.45359237,
      '盎司 (oz)': 0.028349523
    },
    temp: {
      '攝氏 (°C)': 'C',
      '華氏 (°F)': 'F',
      '絕對溫度 (K)': 'K'
    },
    currency: {
      '美金 (USD)': 1,
      '台幣 (TWD)': 0.0308, // Base fallback rates relative to USD
      '歐元 (EUR)': 1.08,
      '日圓 (JPY)': 0.0064,
      '人民幣 (CNY)': 0.14,
      '港幣 (HKD)': 0.128,
      '英鎊 (GBP)': 1.26
    }
  };

  // Load live currency rates if possible
  fetch('https://open.er-api.com/v6/latest/USD')
    .then(r => r.json())
    .then(data => {
      if (data && data.rates) {
        // Rates in API are how many USD per 1 unit of foreign currency? 
        // Actually er-api outputs how many Foreign Currency per 1 USD. e.g. TWD: 32.5
        // So value in USD = Value / Rate
        const newRates = {};
        for (let code in data.rates) {
          const keyName = getCurrencyName(code);
          if (keyName) {
            newRates[keyName] = 1 / data.rates[code];
          }
        }
        units.currency = newRates;
        if (category.value === 'currency') {
          performConversion();
        }
      }
    }).catch(e => console.log('Using offline currency rates:', e));

  function getCurrencyName(code) {
    const names = {
      USD: '美金 (USD)',
      TWD: '台幣 (TWD)',
      EUR: '歐元 (EUR)',
      JPY: '日圓 (JPY)',
      CNY: '人民幣 (CNY)',
      HKD: '港幣 (HKD)',
      GBP: '英鎊 (GBP)'
    };
    return names[code] || null;
  }

  function renderUnits() {
    const cat = category.value;
    const opts = Object.keys(units[cat]);
    
    unitFrom.innerHTML = '';
    unitTo.innerHTML = '';
    
    opts.forEach((opt, idx) => {
      const o1 = document.createElement('option');
      o1.value = opt;
      o1.textContent = opt;
      unitFrom.appendChild(o1);

      const o2 = document.createElement('option');
      o2.value = opt;
      o2.textContent = opt;
      // Default to select second item for target unit to be different
      if (idx === 1 || (idx === 0 && opts.length === 1)) {
        o2.selected = true;
      }
      unitTo.appendChild(o2);
    });

    performConversion();
  }

  function performConversion() {
    const cat = category.value;
    const fromUnit = unitFrom.value;
    const toUnit = unitTo.value;
    const val = parseFloat(inputVal.value);

    if (isNaN(val)) {
      outputVal.value = '';
      return;
    }

    if (cat === 'temp') {
      const uFrom = units.temp[fromUnit];
      const uTo = units.temp[toUnit];
      let tempInC = 0;

      // Convert to Celsius first
      if (uFrom === 'C') tempInC = val;
      else if (uFrom === 'F') tempInC = (val - 32) * 5 / 9;
      else if (uFrom === 'K') tempInC = val - 273.15;

      // Convert Celsius to Target
      let finalVal = 0;
      if (uTo === 'C') finalVal = tempInC;
      else if (uTo === 'F') finalVal = (tempInC * 9 / 5) + 32;
      else if (uTo === 'K') finalVal = tempInC + 273.15;

      outputVal.value = parseFloat(finalVal.toFixed(4));
    } else {
      const baseVal = val * units[cat][fromUnit];
      const targetVal = baseVal / units[cat][toUnit];
      outputVal.value = parseFloat(targetVal.toFixed(6));
    }
  }

  category.addEventListener('change', renderUnits);
  unitFrom.addEventListener('change', performConversion);
  unitTo.addEventListener('change', performConversion);
  inputVal.addEventListener('input', performConversion);

  // Initial load
  renderUnits();
});
