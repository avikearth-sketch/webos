const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playUISound(type) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  const now = audioCtx.currentTime;

  if (type === 'open') {
    osc.type = 'sine'; osc.frequency.setValueAtTime(300, now); osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
    gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.start(now); osc.stop(now + 0.08);
  } else if (type === 'close') {
    osc.type = 'sine'; osc.frequency.setValueAtTime(500, now); osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
    gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.start(now); osc.stop(now + 0.08);
  } else if (type === 'snap') {
    osc.type = 'triangle'; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
    gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    osc.start(now); osc.stop(now + 0.05);
  }
}

function updateTaskbar() {
  const container = document.getElementById('taskbar-apps');
  container.innerHTML = '';
  document.querySelectorAll('.window').forEach(win => {
    if (win.style.display === 'flex') {
      const title = win.querySelector('.window-header span').innerText;
      const tab = document.createElement('div');
      tab.className = 'taskbar-tab';
      tab.innerText = title;
      tab.onclick = () => {
        document.querySelectorAll('.window').forEach(w => w.style.zIndex = '10');
        win.style.zIndex = '20';
      };
      container.appendChild(tab);
    }
  });
}

function closeWindow(id) {
  playUISound('close');
  document.getElementById(id).style.display = 'none';
  updateTaskbar();
}

function openWindow(id) {
  playUISound('open');
  const win = document.getElementById(id);
  win.style.display = 'flex';
  document.querySelectorAll('.window').forEach(w => w.style.zIndex = '10');
  win.style.zIndex = '20';

  win.style.animation = 'none';
  win.offsetHeight;
  win.style.animation = 'windowOpenAnim 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
  updateTaskbar();
}

function toggleMaximize(id) {
  document.getElementById(id).classList.toggle('maximized');
  playUISound('snap');
}

function handleTerminalCommand(e) {
  if (e.key === 'Enter') {
    const input = e.target;
    const output = document.getElementById('term-output');
    const cmd = input.value.trim().toLowerCase();
    output.innerText += `\n> ${input.value}`;

    if (cmd === 'help') {
      output.innerText += `\nAvailable commands: help, clear, time, matrix, echo [text]`;
    } else if (cmd === 'clear') {
      output.innerText = '';
    } else if (cmd === 'time') {
      output.innerText += `\nSystem Time: ${new Date().toLocaleTimeString()}`;
    } else if (cmd === 'matrix') {
      output.innerText += `\nHaha, You thought you would escape the MATRIX!?\n LOL you are trapped in it`;
    } else if (cmd.startsWith('echo ')) {
      output.innerText += `\n${input.value.substring(5)}`;
    } else if (cmd !== '') {
      output.innerText += `\nAyoo! look what you wrote: ${cmd}\n i dont support everything! look up by typing "help"`;
    }
    input.value = '';
    output.scrollTop = output.scrollHeight;
  }
}

let calcVal = '0';
function calcInput(char) {
  if (char === 'C') calcVal = '0';
  else calcVal = calcVal === '0' ? char : calcVal + char;
  document.getElementById('calc-screen').value = calcVal;
}
function calcEqual() {
  try { calcVal = eval(calcVal).toString(); } 
  catch { calcVal = 'Error'; }
  document.getElementById('calc-screen').value = calcVal;
}

let timerInterval = null, timerMs = 0;
function startStopwatch() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; } 
  else {
    let start = Date.now() - timerMs;
    timerInterval = setInterval(() => {
      timerMs = Date.now() - start;
      let ms = Math.floor((timerMs % 1000) / 100);
      let sec = Math.floor((timerMs / 1000) % 60);
      let min = Math.floor(timerMs / 60000);
      document.getElementById('stopwatch-display').innerText = 
        `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms}`;
    }, 100);
  }
}
function resetStopwatch() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  timerMs = 0;
  document.getElementById('stopwatch-display').innerText = '00:00.0';
}

const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
function rollDice() {
  playUISound('snap');
  const result = document.getElementById('dice-result');
  let count = 0;
  let interval = setInterval(() => {
    result.innerText = diceFaces[Math.floor(Math.random() * 6)];
    count++;
    if (count > 8) clearInterval(interval);
  }, 50);
}
setInterval(() => { document.getElementById('clock').innerText = new Date().toLocaleTimeString(); }, 1000);

document.getElementById('music-upload').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    document.getElementById('audio-player').src = URL.createObjectURL(file);
    document.getElementById('audio-player').play();
  }
});

const themeBtn = document.getElementById('theme-btn');
const body = document.body;
const bgVideo = document.getElementById('bg-video');
const desktop = document.getElementById('desktop');

const themeData = {
  dark: { bgUrl: 'default-dark-bg.mp4', bgType: 'video', iconNotes: 'icon-notes-dark.png', iconMusic: 'icon-music-dark.png', btnText: '🌘 Dark Mode' },
  light: { bgUrl: 'default-light-bg.mp4', bgType: 'video', iconNotes: 'icon-notes-light.png', iconMusic: 'icon-music-light.png', btnText: '🌅 Light Mode' }
};

let currentTheme = 'dark';
function applyTheme(theme) {
  const data = themeData[theme];
  document.getElementById('icon-notes').src = data.iconNotes;
  document.getElementById('icon-music').src = data.iconMusic;
  if (data.bgType === 'video') {
    bgVideo.style.display = 'block'; bgVideo.src = data.bgUrl; desktop.style.backgroundImage = 'none';
  } else {
    bgVideo.style.display = 'none'; desktop.style.backgroundImage = `url(${data.bgUrl})`; desktop.style.backgroundSize = 'cover'; desktop.style.backgroundPosition = 'center';
  }
  themeBtn.innerText = data.btnText;
}

themeBtn.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  body.className = `${currentTheme}-theme`;
  applyTheme(currentTheme);
});

document.getElementById('dark-bg-upload').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  themeData.dark.bgUrl = URL.createObjectURL(file);
  themeData.dark.bgType = file.type.startsWith('video/') ? 'video' : 'image';
  if (currentTheme === 'dark') applyTheme('dark');
});

document.getElementById('light-bg-upload').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  themeData.light.bgUrl = URL.createObjectURL(file);
  themeData.light.bgType = file.type.startsWith('video/') ? 'video' : 'image';
  if (currentTheme === 'light') applyTheme('light');
});

document.querySelectorAll('.window').forEach(makeDraggable);

function makeDraggable(element) {
  const header = element.querySelector('.window-header');
  const snapPreview = document.getElementById('snap-preview');
  let isDragging = false, startX = 0, startY = 0;
  let targetX = element.offsetLeft, targetY = element.offsetTop;
  let velocityX = 0, velocityY = 0, lastMouseX = 0, lastMouseY = 0;
  let animationFrameId = null, currentSnapZone = null;

  header.ondblclick = () => { element.classList.toggle('maximized'); playUISound('snap'); };

  header.onmousedown = (e) => {
    if (e.target.classList.contains('control-btn')) return;
    e.preventDefault();
    isDragging = true;

    if (element.classList.contains('maximized')) {
      element.classList.remove('maximized');
      targetX = e.clientX - 150; targetY = e.clientY - 20;
    }

    document.querySelectorAll('.window').forEach(w => w.style.zIndex = '10');
    element.style.zIndex = '20';
    element.classList.add('dragging');

    startX = e.clientX - targetX; startY = e.clientY - targetY;
    lastMouseX = e.clientX; lastMouseY = e.clientY;

    document.onmousemove = onMouseMove; document.onmouseup = onMouseUp;
    if (!animationFrameId) animationFrameId = requestAnimationFrame(updatePhysics);
  };

  function onMouseMove(e) {
    if (!isDragging) return;
    targetX = e.clientX - startX; targetY = e.clientY - startY;
    if (targetY < 35) targetY = 35;
    velocityX = e.clientX - lastMouseX; velocityY = e.clientY - lastMouseY;
    lastMouseX = e.clientX; lastMouseY = e.clientY;

    const threshold = 15;
    if (e.clientX < threshold) {
      currentSnapZone = 'left'; showSnapPreview(0, 35, window.innerWidth / 2, window.innerHeight - 83);
    } else if (e.clientX > window.innerWidth - threshold) {
      currentSnapZone = 'right'; showSnapPreview(window.innerWidth / 2, 35, window.innerWidth / 2, window.innerHeight - 83);
    } else if (e.clientY < 35 + threshold) {
      currentSnapZone = 'top'; showSnapPreview(0, 35, window.innerWidth, window.innerHeight - 83);
    } else {
      currentSnapZone = null; if (snapPreview) snapPreview.style.display = 'none';
    }
  }

  function showSnapPreview(x, y, w, h) {
    if (!snapPreview) return;
    snapPreview.style.display = 'block'; snapPreview.style.left = `${x}px`; snapPreview.style.top = `${y}px`; snapPreview.style.width = `${w}px`; snapPreview.style.height = `${h}px`;
  }

  function updatePhysics() {
    if (isDragging) {
      let tiltX = Math.max(Math.min(velocityY * 1.2, 25), -25);
      let tiltY = Math.max(Math.min(velocityX * -1.2, 25), -25);
      element.style.top = `${targetY}px`; element.style.left = `${targetX}px`;
      element.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      velocityX *= 0.8; velocityY *= 0.8;
      animationFrameId = requestAnimationFrame(updatePhysics);
    }
  }

  function onMouseUp() {
    isDragging = false; document.onmousemove = null; document.onmouseup = null;
    if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
    element.classList.remove('dragging');
    if (snapPreview) snapPreview.style.display = 'none';

    if (currentSnapZone) {
      playUISound('snap');
      element.style.transform = "none";
      if (currentSnapZone === 'top') element.classList.add('maximized');
      else if (currentSnapZone === 'left') { element.style.top = '35px'; element.style.left = '0px'; element.style.width = '50vw'; element.style.height = 'calc(100vh - 83px)'; }
      else if (currentSnapZone === 'right') { element.style.top = '35px'; element.style.left = '50vw'; element.style.width = '50vw'; element.style.height = 'calc(100vh - 83px)'; }
    } else {
      element.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    }
  }
}
