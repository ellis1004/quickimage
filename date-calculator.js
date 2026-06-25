document.addEventListener('DOMContentLoaded', () => {
  // Date Interval Elements
  const dateFrom = document.getElementById('date-from');
  const dateTo = document.getElementById('date-to');
  const daysResult = document.getElementById('days-result');

  // Date Math Elements
  const dateBase = document.getElementById('date-base');
  const offsetDays = document.getElementById('offset-days');
  const offsetOp = document.getElementById('offset-op');
  const dateMathResult = document.getElementById('date-math-result');

  // Timestamp Elements
  const tsInput = document.getElementById('timestamp-input');
  const btnNowTs = document.getElementById('btn-now-ts');
  const btnConvertTs = document.getElementById('btn-convert-ts');
  const tsDateResult = document.getElementById('ts-date-result');

  const dtInput = document.getElementById('datetime-input');
  const btnConvertDt = document.getElementById('btn-convert-dt');
  const dtTsResult = document.getElementById('dt-ts-result');

  // 1. Set default dates
  const todayStr = new Date().toISOString().split('T')[0];
  dateFrom.value = todayStr;
  dateTo.value = todayStr;
  dateBase.value = todayStr;
  
  // Set current datetime-local
  const tzOffset = (new Date()).getTimezoneOffset() * 60000; 
  const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, -1).substring(0, 16);
  dtInput.value = localISOTime;

  // 2. Interval Calculation
  function calculateInterval() {
    const from = new Date(dateFrom.value);
    const to = new Date(dateTo.value);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      daysResult.textContent = '0';
      return;
    }
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    daysResult.textContent = diffDays;
  }

  dateFrom.addEventListener('change', calculateInterval);
  dateTo.addEventListener('change', calculateInterval);

  // 3. Date Offset Calculation
  function calculateOffset() {
    const base = new Date(dateBase.value);
    const offset = parseInt(offsetDays.value);
    const op = offsetOp.value;

    if (isNaN(base.getTime()) || isNaN(offset)) {
      dateMathResult.textContent = '-';
      return;
    }

    const targetDate = new Date(base);
    const multiplier = op === 'add' ? 1 : -1;
    targetDate.setDate(base.getDate() + (offset * multiplier));
    
    // Format Result Date
    const y = targetDate.getFullYear();
    const m = String(targetDate.getMonth() + 1).padStart(2, '0');
    const d = String(targetDate.getDate()).padStart(2, '0');
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const w = days[targetDate.getDay()];
    dateMathResult.textContent = `${y}-${m}-${d} (星期${w})`;
  }

  dateBase.addEventListener('change', calculateOffset);
  offsetDays.addEventListener('input', calculateOffset);
  offsetOp.addEventListener('change', calculateOffset);

  // 4. Timestamp to Date
  function convertTimestamp() {
    let val = parseInt(tsInput.value.trim());
    if (isNaN(val)) return;

    // Detect seconds vs milliseconds
    if (val.toString().length === 10) {
      val = val * 1000;
    }

    const dt = new Date(val);
    if (isNaN(dt.getTime())) {
      tsDateResult.textContent = '❌ 無效的時間戳';
    } else {
      tsDateResult.textContent = dt.toLocaleString('zh-TW', { hour12: false });
    }
  }

  btnNowTs.addEventListener('click', () => {
    tsInput.value = Math.floor(Date.now() / 1000);
    convertTimestamp();
  });

  btnConvertTs.addEventListener('click', convertTimestamp);

  // 5. Date to Timestamp
  btnConvertDt.addEventListener('click', () => {
    const val = dtInput.value;
    if (!val) return;
    const dt = new Date(val);
    if (isNaN(dt.getTime())) {
      dtTsResult.textContent = '❌ 無效的日期格式';
    } else {
      dtTsResult.textContent = `${Math.floor(dt.getTime() / 1000)} (秒)`;
    }
  });

  // Initial runs
  calculateInterval();
  calculateOffset();
  tsInput.value = Math.floor(Date.now() / 1000);
  convertTimestamp();
});
