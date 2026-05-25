// UI, rendering and input for Powder Box.

const W = 200, H = 130, SCALE = 4;
const sim = new Sandbox(W, H);

const canvas = document.getElementById('screen');
canvas.width = W * SCALE;
canvas.height = H * SCALE;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Offscreen grid-resolution buffer, scaled up on draw.
const buf = document.createElement('canvas');
buf.width = W; buf.height = H;
const bctx = buf.getContext('2d');
const img = bctx.createImageData(W, H);
const data = img.data;

const E = ELEMENTS;

// Palette shown in the toolbar. EMPTY acts as the eraser.
const PALETTE = [
  { id: E.SAND, key: '2' },
  { id: E.WATER, key: '3' },
  { id: E.OIL, key: '4' },
  { id: E.WALL, key: '1' },
  { id: E.WOOD, key: '6' },
  { id: E.PLANT, key: '9' },
  { id: E.FIRE, key: '5' },
  { id: E.LAVA, key: 'l' },
  { id: E.ACID, key: 'a' },
  { id: E.SALT, key: 's' },
  { id: E.STEAM, key: 't' },
  { id: E.SMOKE, key: 'k' },
  { id: E.EMPTY, key: '0' },
];

let current = E.SAND;
let brush = 4;
let paused = false;
let drawing = false;
let erase = false;
let pointer = { x: -1, y: -1 };

// ---- Toolbar ------------------------------------------------------------
const palDiv = document.getElementById('palette');
const buttons = new Map();
for (const p of PALETTE) {
  const el = EL[p.id];
  const b = document.createElement('button');
  b.className = 'swatch';
  b.textContent = el.name;
  b.title = `${el.name} (${p.key})`;
  if (p.id === E.EMPTY) {
    b.style.background = '#1a1c24';
    b.style.color = '#8a90a0';
    b.textContent = 'Eraser';
  } else {
    const [r, g, bl] = el.color;
    b.style.background = `rgb(${r},${g},${bl})`;
    b.style.color = (r * 0.299 + g * 0.587 + bl * 0.114) > 140 ? '#111' : '#fff';
  }
  b.addEventListener('click', () => selectEl(p.id));
  palDiv.appendChild(b);
  buttons.set(p.id, b);
}

function selectEl(id) {
  current = id;
  for (const [k, b] of buttons) b.classList.toggle('active', k === id);
}
selectEl(current);

// ---- Controls -----------------------------------------------------------
const brushInput = document.getElementById('brush');
const brushVal = document.getElementById('brushVal');
function syncBrush() { brush = +brushInput.value; brushVal.textContent = brush; }
brushInput.addEventListener('input', syncBrush);
syncBrush();

const pauseBtn = document.getElementById('pause');
pauseBtn.addEventListener('click', () => {
  paused = !paused;
  pauseBtn.textContent = paused ? 'Play' : 'Pause';
});

document.getElementById('clear').addEventListener('click', () => sim.clear());
document.getElementById('demo').addEventListener('click', buildDemo);

window.addEventListener('keydown', (e) => {
  if (e.key === ' ') { e.preventDefault(); pauseBtn.click(); return; }
  if (e.key === 'c') { sim.clear(); return; }
  const hit = PALETTE.find((p) => p.key === e.key.toLowerCase());
  if (hit) selectEl(hit.id);
});

// ---- Pointer drawing ----------------------------------------------------
function toGrid(ev) {
  const rect = canvas.getBoundingClientRect();
  const px = (ev.clientX - rect.left) * (canvas.width / rect.width);
  const py = (ev.clientY - rect.top) * (canvas.height / rect.height);
  return { x: Math.floor(px / SCALE), y: Math.floor(py / SCALE) };
}

const SPARSE = new Set([E.FIRE, E.SAND, E.SALT, E.WATER, E.OIL, E.ACID]);

function paint(gx, gy) {
  const el = erase ? E.EMPTY : current;
  const r = brush;
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r) continue;
      const x = gx + dx, y = gy + dy;
      if (!sim.inBounds(x, y)) continue;
      if (el !== E.EMPTY && SPARSE.has(el) && Math.random() < 0.4) continue;
      sim.set(x, y, el);
    }
  }
}

canvas.addEventListener('pointerdown', (e) => {
  drawing = true;
  erase = e.button === 2;
  const g = toGrid(e);
  pointer = g;
  paint(g.x, g.y);
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  const g = toGrid(e);
  if (drawing) {
    const last = pointer;
    const steps = Math.max(Math.abs(g.x - last.x), Math.abs(g.y - last.y), 1);
    for (let s = 0; s <= steps; s++) {
      const x = Math.round(last.x + (g.x - last.x) * (s / steps));
      const y = Math.round(last.y + (g.y - last.y) * (s / steps));
      paint(x, y);
    }
  }
  pointer = g;
});
canvas.addEventListener('pointerup', () => { drawing = false; erase = false; });
canvas.addEventListener('pointerleave', () => { pointer = { x: -1, y: -1 }; });
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// ---- Demo scene ---------------------------------------------------------
function buildDemo() {
  sim.clear();
  // floor + side walls forming a basin
  for (let x = 16; x < W - 16; x++) sim.set(x, H - 6, E.WALL);
  for (let y = H - 30; y < H - 6; y++) { sim.set(16, y, E.WALL); sim.set(W - 17, y, E.WALL); }
  // water pool on the left
  for (let x = 20; x < W / 2 - 5; x++)
    for (let y = H - 26; y < H - 7; y++) sim.set(x, y, E.WATER);
  // sand dune on the right
  for (let x = (W / 2 + 10) | 0; x < W - 22; x++)
    for (let y = H - 20; y < H - 7; y++)
      if (Math.random() < 0.9) sim.set(x, y, E.SAND);
  // wooden platform with a plant seed
  for (let x = 40; x < 90; x++) sim.set(x, 30, E.WOOD);
  sim.set(65, 29, E.PLANT);
  // lava blob ready to drop into the water
  for (let x = 130; x < 150; x++)
    for (let y = 18; y < 30; y++) sim.set(x, y, E.LAVA);
}

// ---- Render loop --------------------------------------------------------
let lastFps = performance.now();
let frames = 0;
const fpsEl = document.getElementById('fps');

function clamp(v) { return v < 0 ? 0 : v > 255 ? 255 : v; }

function render() {
  const cells = sim.cells, shade = sim.shade;
  for (let i = 0; i < sim.size; i++) {
    const el = cells[i];
    const c = EL[el].color;
    const o = i * 4;
    if (el === E.EMPTY) {
      data[o] = c[0]; data[o + 1] = c[1]; data[o + 2] = c[2];
    } else {
      const j = (shade[i] | 0) - 20;
      data[o] = clamp(c[0] + j);
      data[o + 1] = clamp(c[1] + j);
      data[o + 2] = clamp(c[2] + j);
    }
    data[o + 3] = 255;
  }
  bctx.putImageData(img, 0, 0);
  ctx.drawImage(buf, 0, 0, canvas.width, canvas.height);

  if (pointer.x >= 0) {
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc((pointer.x + 0.5) * SCALE, (pointer.y + 0.5) * SCALE, brush * SCALE, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function loop() {
  if (!paused) sim.step();
  render();
  frames++;
  const now = performance.now();
  if (now - lastFps >= 500) {
    fpsEl.textContent = Math.round((frames * 1000) / (now - lastFps));
    frames = 0; lastFps = now;
  }
  requestAnimationFrame(loop);
}

buildDemo();
loop();
