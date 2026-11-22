const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
const colors = ['#ff6b5f', '#ffbf46', '#a9d9f5', '#fff6e8', '#ff8daf'];
let pieces = [];
let animationFrame;

function sizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function celebrate(amount = 170) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count = reducedMotion ? Math.min(amount, 35) : amount;
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
window.addEventListener('resize', sizeCanvas);

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 3, 2) * 90}ms`;
  observer.observe(element);
});

document.getElementById('openSurprise').addEventListener('click', () => {
  celebrate(190);
  document.getElementById('surprise').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('sparkleButton').addEventListener('click', () => celebrate(130));

const wishButton = document.getElementById('wishButton');
const cake = document.querySelector('.cake');
const wishStatus = document.getElementById('wishStatus');

wishButton.addEventListener('click', () => {
  cake.classList.add('wished');
  wishButton.disabled = true;
  wishButton.textContent = 'Your wish is on its way ✦';
  wishStatus.textContent = 'May every wonderful thing you wished for find you, Debu.';
  celebrate(240);
  setTimeout(() => {
    cake.classList.remove('wished');
    wishButton.disabled = false;
    wishButton.innerHTML = 'Make another wish <span aria-hidden="true">♥</span>';
  }, 6000);
});

document.getElementById('replayButton').addEventListener('click', () => {
  celebrate(220);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('load', () => {
  document.querySelector('.hero-copy').classList.add('visible');
  setTimeout(() => celebrate(95), 650);
});
