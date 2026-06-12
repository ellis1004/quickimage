// State and Settings
let options = [];
let isSpinning = false;
let currentAngle = 0;
let spinSpeed = 0;
let spinDecel = 0.985; // Deceleration factor
let spinTime = 0;
let spinDuration = 0;

// Colors Palette
const wheelColors = [
  '#6366f1', // Indigo
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6'  // Blue
];

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Wheel elements
const canvas = document.getElementById('wheel-canvas');
const ctx = canvas.getContext('2d');
const optionsTextarea = document.getElementById('wheel-options');
const spinBtn = document.getElementById('wheel-spin-btn');
const spinPin = document.getElementById('wheel-spin-pin');
const resetColorsBtn = document.getElementById('reset-wheel-btn');

// List elements
const namesTextarea = document.getElementById('picker-names');
const drawCountSelect = document.getElementById('picker-draw-count');
const listDrawBtn = document.getElementById('list-draw-btn');

// Winner output card
const winnerCard = document.getElementById('winner-card');
const winnerTitle = document.getElementById('winner-title');
const winnerNameTxt = document.getElementById('winner-name-txt');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initWheel();
  initListDrawer();
});

// Tab switching logic
function initTabs() {
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Add active to clicked
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');

      // Hide winner card when switching tabs
      winnerCard.style.display = 'none';
    });
  });
}

// Wheel Functionality
function initWheel() {
  // Parse initial options
  updateOptionsFromTextarea();

  // Listeners
  optionsTextarea.addEventListener('input', () => {
    updateOptionsFromTextarea();
    drawWheel();
  });

  spinBtn.addEventListener('click', startSpin);
  spinPin.addEventListener('click', startSpin);
  resetColorsBtn.addEventListener('click', () => {
    drawWheel();
  });

  // Draw initial
  drawWheel();
}

function updateOptionsFromTextarea() {
  options = optionsTextarea.value
    .split('\n')
    .map(opt => opt.trim())
    .filter(opt => opt.length > 0);
}

function drawWheel() {
  const numOptions = options.length;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = canvas.width / 2 - 10;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (numOptions === 0) {
    // Draw placeholder circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#1f2c42';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px inherit';
    ctx.textAlign = 'center';
    ctx.fillText('在右側輸入選項', cx, cy + 5);
    return;
  }

  const arcSize = (2 * Math.PI) / numOptions;

  for (let i = 0; i < numOptions; i++) {
    const angle = currentAngle + i * arcSize;
    
    // Draw Slice
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, angle, angle + arcSize);
    ctx.closePath();
    ctx.fillStyle = wheelColors[i % wheelColors.length];
    ctx.fill();
    
    // Draw Border
    ctx.strokeStyle = 'rgba(11, 15, 25, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw Text
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle + arcSize / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    // Choose appropriate font size based on options length
    const fontSize = numOptions > 12 ? '10px' : (numOptions > 8 ? '12px' : '14px');
    ctx.font = `bold ${fontSize} Outfit, Inter, sans-serif`;
    
    // Limit text length to prevent overflow into the center pin
    let text = options[i];
    if (text.length > 10) text = text.substring(0, 9) + '...';
    ctx.fillText(text, radius - 20, 5);
    ctx.restore();
  }
}

function startSpin() {
  if (isSpinning || options.length === 0) return;

  isSpinning = true;
  winnerCard.style.display = 'none';

  // Random spin speed and duration
  spinSpeed = 0.3 + Math.random() * 0.2; // Initial angular speed (radians/frame)
  spinTime = 0;
  // Spin between 120 and 180 frames (approx 2-3 seconds at 60fps)
  spinDuration = 120 + Math.random() * 60;

  animateSpin();
}

function animateSpin() {
  if (!isSpinning) return;

  // Apply angle accumulation
  currentAngle += spinSpeed;
  
  // Decelerate speed
  spinSpeed *= spinDecel;

  // Check if we stop
  if (spinSpeed < 0.001) {
    isSpinning = false;
    spinSpeed = 0;
    determineWinner();
  } else {
    drawWheel();
    requestAnimationFrame(animateSpin);
  }
}

function determineWinner() {
  drawWheel();
  const numOptions = options.length;
  const arcSize = (2 * Math.PI) / numOptions;

  // The pointer is at the top (-90 degrees or 1.5 * Math.PI)
  // We want to see which slice falls under 270 degrees (1.5 * PI)
  // Normalize angle to be positive and within [0, 2*PI]
  let normalizedAngle = currentAngle % (2 * Math.PI);
  if (normalizedAngle < 0) {
    normalizedAngle += 2 * Math.PI;
  }

  // Pointer position is at 3/2 * PI (270 degrees)
  const pointerAngle = 1.5 * Math.PI;
  let winnerIndex = Math.floor((pointerAngle - normalizedAngle) / arcSize) % numOptions;
  if (winnerIndex < 0) {
    winnerIndex += numOptions;
  }

  const winner = options[winnerIndex];

  // Display winner
  displayWinner("🎡 轉盤選中結果 🎡", winner);
}

// Name List Drawer Functionality
function initListDrawer() {
  listDrawBtn.addEventListener('click', () => {
    const listText = namesTextarea.value.trim();
    const items = listText
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (items.length === 0) {
      alert('請先輸入抽籤名單！');
      return;
    }

    const count = parseInt(drawCountSelect.value, 10);
    
    // Disable button for animation effect
    listDrawBtn.disabled = true;
    listDrawBtn.textContent = '正在抽取...';
    winnerCard.style.display = 'none';

    // Simulate simple shuffling / picking animation delay
    setTimeout(() => {
      const shuffled = [...items].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.min(count, items.length));
      
      const winnerResultText = selected.join(', ');
      
      displayWinner("📋 隨機抽籤結果 📋", winnerResultText);
      listDrawBtn.disabled = false;
      listDrawBtn.textContent = '開始抽籤';
    }, 600);
  });
}

function displayWinner(title, name) {
  winnerTitle.textContent = title;
  winnerNameTxt.textContent = name;
  winnerCard.style.display = 'block';

  // Confetti effect (using the canvas-confetti script)
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981']
    });
  }
}
