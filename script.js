setInterval(() => {
  document.getElementById('clock').innerText = new Date().toLocaleTimeString();
}, 1000);

function closeWindow(id) {
  document.getElementById(id).style.display = 'none';
}

function openWindow(id) {
  const win = document.getElementById(id);
  win.style.display = 'flex';
  document.querySelectorAll('.window').forEach(w => w.style.zIndex = '10');
  win.style.zIndex = '20';

  // Force popup animation refresh
  win.style.animation = 'none';
  win.offsetHeight; /* Trigger DOM reflow */
  win.style.animation = 'windowOpenAnim 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
}

// --- Music Player & Theme Engine logic remains unchanged ---
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
    bgVideo.style.display = 'block';
    bgVideo.src = data.bgUrl;
    desktop.style.backgroundImage = 'none';
  } else {
    bgVideo.style.display = 'none';
    desktop.style.backgroundImage = `url(${data.bgUrl})`;
    desktop.style.backgroundSize = 'cover';
    desktop.style.backgroundPosition = 'center';
  }
  themeBtn.innerText = data.btnText;
}

themeBtn.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  body.className = `${currentTheme}-theme`;
  applyTheme(currentTheme);
});

// Settings App Custom Uploads
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


// =========================================================
// ULTRA-SMOOTH GPU-ACCELERATED DRAGGING ENGINE
// =========================================================
document.querySelectorAll('.window').forEach(makeDraggable);

function makeDraggable(element) {
  const header = element.querySelector('.window-header');
  
  let isDragging = false;
  let startX = 0, startY = 0;
  let currentX = element.offsetLeft, currentY = element.offsetTop;
  let targetX = currentX, targetY = currentY;
  
  let velocityX = 0, velocityY = 0;
  let lastMouseX = 0, lastMouseY = 0;
  let animationFrameId = null;

  header.onmousedown = (e) => {
    e.preventDefault();
    isDragging = true;

    // Bring clicked window to top
    document.querySelectorAll('.window').forEach(w => w.style.zIndex = '10');
    element.style.zIndex = '20';
    element.classList.add('dragging');

    // Record initial coordinates
    startX = e.clientX - targetX;
    startY = e.clientY - targetY;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    document.onmousemove = onMouseMove;
    document.onmouseup = onMouseUp;

    // Start rendering loop on monitor refresh rate
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(updatePhysics);
    }
  };

  function onMouseMove(e) {
    if (!isDragging) return;

    // Target positions based on cursor
    targetX = e.clientX - startX;
    targetY = e.clientY - startY;

    // Keep top edge below taskbar (40px)
    if (targetY < 40) targetY = 40;

    // Calculate instantaneous mouse velocity for tilt calculation
    velocityX = e.clientX - lastMouseX;
    velocityY = e.clientY - lastMouseY;

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  }

  function updatePhysics() {
    if (isDragging) {
      // Calculate smooth tilt based on velocity (clamped to +/- 25 degrees)
      let tiltX = Math.max(Math.min(velocityY * 1.2, 25), -25);
      let tiltY = Math.max(Math.min(velocityX * -1.2, 25), -25);

      // Hardware-accelerated GPU transform
      element.style.top = `${targetY}px`;
      element.style.left = `${targetX}px`;
      element.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

      // Decay velocity gradually when cursor slows down
      velocityX *= 0.8;
      velocityY *= 0.8;

      animationFrameId = requestAnimationFrame(updatePhysics);
    }
  }

  function onMouseUp() {
    isDragging = false;
    document.onmousemove = null;
    document.onmouseup = null;

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    element.classList.remove('dragging');
    
    // Smoothly snap window back to flat angle
    element.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  }
}