document.addEventListener('DOMContentLoaded', () => {
  const tabSttBtn = document.getElementById('tab-stt-btn');
  const tabTtsBtn = document.getElementById('tab-tts-btn');
  const tabSttContent = document.getElementById('tab-stt-content');
  const tabTtsContent = document.getElementById('tab-tts-content');

  // STT Elements
  const sttLang = document.getElementById('stt-lang');
  const sttOutput = document.getElementById('stt-output');
  const sttWave = document.getElementById('stt-wave');
  const btnSttRecord = document.getElementById('btn-stt-record');
  const btnSttCopy = document.getElementById('btn-stt-copy');
  const btnSttClear = document.getElementById('btn-stt-clear');

  // TTS Elements
  const ttsInput = document.getElementById('tts-input');
  const ttsRate = document.getElementById('tts-rate');
  const ttsRateVal = document.getElementById('tts-rate-val');
  const ttsPitch = document.getElementById('tts-pitch');
  const ttsPitchVal = document.getElementById('tts-pitch-val');
  const btnTtsSpeak = document.getElementById('btn-tts-speak');
  const btnTtsStop = document.getElementById('btn-tts-stop');

  // Tab switching
  tabSttBtn.addEventListener('click', () => {
    tabSttBtn.classList.add('active');
    tabTtsBtn.classList.remove('active');
    tabSttContent.classList.add('active');
    tabTtsContent.classList.remove('active');
  });

  tabTtsBtn.addEventListener('click', () => {
    tabTtsBtn.classList.add('active');
    tabSttBtn.classList.remove('active');
    tabTtsContent.classList.add('active');
    tabSttContent.classList.remove('active');
  });

  // 1. Speech to Text (Recognition)
  let recognition = null;
  let isRecording = false;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    btnSttRecord.disabled = true;
    btnSttRecord.textContent = '❌ 您的瀏覽器不支援 Speech API';
  } else {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      isRecording = true;
      btnSttRecord.textContent = '🛑 停止錄音辨識';
      btnSttRecord.classList.add('btn-primary'); // keep active color
      sttWave.classList.add('active');
    };

    recognition.onend = () => {
      isRecording = false;
      btnSttRecord.textContent = '🎤 開始錄音辨識';
      sttWave.classList.remove('active');
    };

    recognition.onerror = (e) => {
      console.log('STT Error:', e);
      isRecording = false;
      btnSttRecord.textContent = '🎤 開始錄音辨識';
      sttWave.classList.remove('active');
      if (e.error === 'not-allowed') {
        alert('請允許麥克風權限以進行語音輸入！');
      }
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // Prepend or append text
      if (finalTranscript) {
        sttOutput.value += finalTranscript;
      }
    };
  }

  btnSttRecord.addEventListener('click', () => {
    if (!recognition) return;
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.lang = sttLang.value;
      recognition.start();
    }
  });

  btnSttClear.addEventListener('click', () => {
    sttOutput.value = '';
  });

  btnSttCopy.addEventListener('click', () => {
    if (!sttOutput.value) return;
    navigator.clipboard.writeText(sttOutput.value).then(() => {
      const originalText = btnSttCopy.textContent;
      btnSttCopy.textContent = '✅ 已複製！';
      setTimeout(() => btnSttCopy.textContent = originalText, 1500);
    });
  });

  // 2. Text to Speech (Synthesis)
  ttsRate.addEventListener('input', () => {
    ttsRateVal.textContent = ttsRate.value;
  });

  ttsPitch.addEventListener('input', () => {
    ttsPitchVal.textContent = ttsPitch.value;
  });

  btnTtsSpeak.addEventListener('click', () => {
    const text = ttsInput.value.trim();
    if (!text) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = parseFloat(ttsRate.value);
    utterance.pitch = parseFloat(ttsPitch.value);
    
    // We can auto detect or let browser choose default voice
    window.speechSynthesis.speak(utterance);
  });

  btnTtsStop.addEventListener('click', () => {
    window.speechSynthesis.cancel();
  });
});
