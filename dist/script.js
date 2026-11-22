const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
const colors = ['#ff6b5f', '#ffbf46', '#a9d9f5', '#fff6e8', '#ff8daf'];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let pieces = [];
let animationFrame;
let storyStarted = false;

function sizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function celebrate(amount = 170) {
  const count = reduceMotion ? Math.min(amount, 35) : amount;
  pieces.push(...Array.from({ length: count }, (_, index) => ({
    x: window.innerWidth * (0.15 + Math.random() * 0.7),
    y: window.innerHeight * (0.2 + Math.random() * 0.25),
    vx: (Math.random() - 0.5) * 12,
    vy: -5 - Math.random() * 8,
    gravity: 0.16 + Math.random() * 0.12,
    drag: 0.986,
    size: 5 + Math.random() * 7,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.25,
    color: colors[index % colors.length],
    life: 160 + Math.random() * 70,
    shape: Math.random() > 0.7 ? 'circle' : 'rect'
  })));
  if (!animationFrame) animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  pieces = pieces.filter(piece => piece.life > 0 && piece.y < window.innerHeight + 40);
  pieces.forEach(piece => {
    piece.vx *= piece.drag;
    piece.vy += piece.gravity;
    piece.x += piece.vx;
    piece.y += piece.vy;
    piece.rotation += piece.spin;
    piece.life -= 1;
    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.rotation);
    ctx.globalAlpha = Math.min(1, piece.life / 35);
    ctx.fillStyle = piece.color;
    if (piece.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, piece.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-piece.size / 2, -piece.size / 3, piece.size, piece.size * 0.66);
    }
    ctx.restore();
  });
  if (pieces.length) animationFrame = requestAnimationFrame(animateConfetti);
  else {
    animationFrame = null;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

sizeCanvas();
window.addEventListener('resize', sizeCanvas, { passive: true });

const musicToggle = document.getElementById('musicToggle');
const soundtrack = new window.BirthdaySoundtrack(musicToggle);
musicToggle.addEventListener('click', () => soundtrack.toggle());

const premiere = document.getElementById('premiere');
async function startStory(withMusic) {
  if (storyStarted) return;
  storyStarted = true;
  if (withMusic) await soundtrack.play();
  document.body.classList.remove('is-locked');
  document.body.classList.add('story-started');
  premiere.classList.add('is-gone');
  document.querySelector('.hero-copy').classList.add('visible');
  window.setTimeout(() => celebrate(210), reduceMotion ? 80 : 420);
  window.setTimeout(() => { premiere.hidden = true; }, 1300);
}

document.getElementById('enterWithMusic').addEventListener('click', () => startStory(true));
document.getElementById('enterQuietly').addEventListener('click', () => startStory(false));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

document.querySelectorAll('.reveal:not(.hero-copy)').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 3, 2) * 90}ms`;
  observer.observe(element);
});

let scrollTicking = false;
function updateScrollEffects() {
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  const progress = distance > 0 ? Math.min(window.scrollY / distance, 1) : 0;
  document.getElementById('scrollProgress').style.width = `${progress * 100}%`;
  document.body.classList.toggle('page-scrolled', window.scrollY > 80);
  if (!reduceMotion) {
    const cakeScene = document.getElementById('cakeScene');
    if (cakeScene) {
      const rect = cakeScene.getBoundingClientRect();
      const offset = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight));
      cakeScene.style.setProperty('--scene-drift', `${offset * -18}px`);
    }
  }
  scrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(updateScrollEffects);
    scrollTicking = true;
  }
}, { passive: true });

document.getElementById('openSurprise').addEventListener('click', () => {
  celebrate(190);
  document.getElementById('surprise').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
});

document.getElementById('sparkleButton').addEventListener('click', () => {
  soundtrack.chime();
  celebrate(135);
});

const wishButton = document.getElementById('wishButton');
const cake = document.querySelector('.cake');
const wishStatus = document.getElementById('wishStatus');

wishButton.addEventListener('click', () => {
  cake.classList.add('wished');
  wishButton.disabled = true;
  wishButton.textContent = 'Your wish is on its way ✦';
  wishStatus.textContent = 'May every wonderful thing you wished for find you, Debu.';
  soundtrack.chime();
  celebrate(260);
  if ('vibrate' in navigator) navigator.vibrate([25, 40, 25]);
  window.setTimeout(() => {
    cake.classList.remove('wished');
    wishButton.disabled = false;
    wishButton.innerHTML = 'Make another wish <span aria-hidden="true">♥</span>';
  }, 6000);
});

document.getElementById('replayButton').addEventListener('click', () => {
  soundtrack.chime();
  celebrate(230);
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
});

document.addEventListener('visibilitychange', () => {
  if (!soundtrack.context || !soundtrack.playing) return;
  if (document.hidden) soundtrack.context.suspend();
  else soundtrack.context.resume();
});

window.addEventListener('load', updateScrollEffects);
