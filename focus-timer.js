// Timer Settings & State
let totalTime = 1500; // 25 minutes default
let timeLeft = 1500;
let timerInterval = null;
let isRunning = false;
let currentMode = 'focus'; // focus, short-break, long-break

// Web Audio State
let audioCtx = null;
let rainGain = null;
let windGain = null;
let whiteGain = null;

// DOM Elements
const timerTimeDisplay = document.getElementById('timer-time-display');
const timerStateDisplay = document.getElementById('timer-state-display');
const timerProgress = document.getElementById('timer-progress');
const startBtn = document.getElementById('timer-start-btn');
const resetBtn = document.getElementById('timer-reset-btn');
const modeButtons = document.querySelectorAll('.btn-mode');
const volumeSliders = document.querySelectorAll('.volume-slider');

// SVG Dasharray
const TOTAL_DASH = 816.8; // 2 * PI * 130

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initTimer();
  initAudioControls();
});

// Timer Logic
function initTimer() {
  // Mode selection clicks
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const timeValue = parseInt(btn.getAttribute('data-time'), 10);
      currentMode = btn.getAttribute('data-mode');
      
      // Update Timer State text
      switch (currentMode) {
        case 'focus':
          timerStateDisplay.textContent = '專注中';
          break;
        case 'short-break':
          timerStateDisplay.textContent = '短休息';
          break;
        case 'long-break':
          timerStateDisplay.textContent = '長休息';
          break;
      }

      totalTime = timeValue;
      resetTimer();
    });
  });

  // Start / Pause
  startBtn.addEventListener('click', () => {
    // Resume audio context if suspended (browser security)
    resumeAudioContext();
    
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  // Reset
  resetBtn.addEventListener('click', () => {
    resetTimer();
  });

  // Initial draw
  updateTimerDisplay();
}

function startTimer() {
  isRunning = true;
  startBtn.textContent = '暫停';
  startBtn.classList.remove('btn-primary');
  startBtn.classList.add('btn-secondary');

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      playAlarm();
      
      // Auto-toggle to break or focus
      if (currentMode === 'focus') {
        alert('專注時間結束！休息一下吧。');
        triggerMode('short-break');
      } else {
        alert('休息時間結束！開始專注吧。');
        triggerMode('focus');
      }
    }
  }, 1000);
}

function pauseTimer() {
  isRunning = false;
  startBtn.textContent = '開始';
  startBtn.classList.remove('btn-secondary');
  startBtn.classList.add('btn-primary');
  clearInterval(timerInterval);
}

function resetTimer() {
  pauseTimer();
  timeLeft = totalTime;
  updateTimerDisplay();
}

function triggerMode(modeName) {
  const matchingBtn = document.querySelector(`.btn-mode[data-mode="${modeName}"]`);
  if (matchingBtn) {
    matchingBtn.click();
  }
}

function updateTimerDisplay() {
  // Update text
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  timerTimeDisplay.textContent = timeText;
  
  // Update page title dynamically so user sees timer in tab bar
  document.title = `(${timeText}) FocusClock 專注計時器`;

  // Update SVG Progress
  const progressRatio = timeLeft / totalTime;
  const dashOffset = TOTAL_DASH - (progressRatio * TOTAL_DASH);
  timerProgress.style.strokeDashoffset = dashOffset;
}

// Web Audio Synthesis Logic
function initAudio() {
  if (audioCtx) return;

  // Initialize context
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // Create White Noise Buffer (2 seconds loop)
  const bufferSize = 2 * audioCtx.sampleRate;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const outputData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    outputData[i] = Math.random() * 2 - 1;
  }

  // Loop helper
  function createLoopSource(buffer) {
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    return src;
  }

  // 1. White Noise (gentle sea wave lowpass filter)
  const whiteSrc = createLoopSource(noiseBuffer);
  const whiteFilter = audioCtx.createBiquadFilter();
  whiteFilter.type = 'lowpass';
  whiteFilter.frequency.value = 300; // soft rumble
  
  whiteGain = audioCtx.createGain();
  whiteGain.gain.setValueAtTime(0, audioCtx.currentTime);

  whiteSrc.connect(whiteFilter);
  whiteFilter.connect(whiteGain);
  whiteGain.connect(audioCtx.destination);
  whiteSrc.start();

  // 2. Rain Sound (heavy filtering & low frequency focus)
  const rainSrc = createLoopSource(noiseBuffer);
  const rainFilter = audioCtx.createBiquadFilter();
  rainFilter.type = 'bandpass';
  rainFilter.frequency.value = 450;
  rainFilter.Q.value = 0.8;

  rainGain = audioCtx.createGain();
  rainGain.gain.setValueAtTime(0, audioCtx.currentTime);

  rainSrc.connect(rainFilter);
  rainFilter.connect(rainGain);
  rainGain.connect(audioCtx.destination);
  rainSrc.start();

  // 3. Wind Sound (slow frequency modulator LFO)
  const windSrc = createLoopSource(noiseBuffer);
  const windFilter = audioCtx.createBiquadFilter();
  windFilter.type = 'bandpass';
  windFilter.frequency.value = 350;
  windFilter.Q.value = 2.5;

  // LFO
  const lfo = audioCtx.createOscillator();
  lfo.frequency.value = 0.08; // slow drift (approx 12 seconds per sweep)
  
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 160; // sweep detune range

  lfo.connect(lfoGain);
  lfoGain.connect(windFilter.frequency);
  
  windGain = audioCtx.createGain();
  windGain.gain.setValueAtTime(0, audioCtx.currentTime);

  windSrc.connect(windFilter);
  windFilter.connect(windGain);
  windGain.connect(audioCtx.destination);
  
  lfo.start();
  windSrc.start();
}

function initAudioControls() {
  volumeSliders.forEach(slider => {
    slider.addEventListener('input', (e) => {
      resumeAudioContext();
      
      const soundType = e.target.getAttribute('data-sound');
      const volume = parseFloat(e.target.value) / 100;

      // Update card active class
      const mixerItem = document.getElementById(`mixer-${soundType}`);
      if (volume > 0) {
        mixerItem.classList.add('active');
      } else {
        mixerItem.classList.remove('active');
      }

      // Initialize synthesizer nodes if not created yet
      initAudio();

      // Apply volume changes
      switch (soundType) {
        case 'rain':
          if (rainGain) rainGain.gain.setTargetAtTime(volume * 0.4, audioCtx.currentTime, 0.1);
          break;
        case 'wind':
          if (windGain) windGain.gain.setTargetAtTime(volume * 0.3, audioCtx.currentTime, 0.1);
          break;
        case 'white':
          if (whiteGain) whiteGain.gain.setTargetAtTime(volume * 0.25, audioCtx.currentTime, 0.1);
          break;
      }
    });
  });
}

function resumeAudioContext() {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Alarm Beep Synthesizer
function playAlarm() {
  try {
    resumeAudioContext();
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Play a friendly dual-tone chime
    const playTone = (freq, startTime, duration) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gainNode.gain.setValueAtTime(0.25, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = audioCtx.currentTime;
    playTone(523.25, now, 0.2); // C5
    playTone(659.25, now + 0.15, 0.25); // E5
    playTone(783.99, now + 0.3, 0.4); // G5
  } catch (error) {
    console.error('Failed to play sound alarm:', error);
  }
}
