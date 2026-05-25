// Powder Box — a falling-sand cellular-automaton sandbox.
// Zero dependencies. Pure typed-array grid rendered to a canvas.

// ---- Element definitions -------------------------------------------------
// Each element has a numeric id (its index), a movement category, a density
// used for buoyancy/sinking, and a base RGB colour.

const CAT = { EMPTY: 0, STATIC: 1, POWDER: 2, LIQUID: 3, GAS: 4 };

const EL = [
  { name: 'Empty', cat: CAT.EMPTY, density: 0, color: [12, 14, 20] },
  { name: 'Wall', cat: CAT.STATIC, density: 999, color: [110, 116, 128] },
  { name: 'Sand', cat: CAT.POWDER, density: 9, color: [201, 170, 92] },
  { name: 'Water', cat: CAT.LIQUID, density: 6, color: [54, 110, 214] },
  { name: 'Oil', cat: CAT.LIQUID, density: 4, color: [86, 64, 38] },
  { name: 'Fire', cat: CAT.GAS, density: 1, color: [240, 120, 30] },
  { name: 'Wood', cat: CAT.STATIC, density: 50, color: [120, 78, 38] },
  { name: 'Smoke', cat: CAT.GAS, density: 2, color: [70, 70, 78] },
  { name: 'Steam', cat: CAT.GAS, density: 2, color: [180, 190, 205] },
  { name: 'Plant', cat: CAT.STATIC, density: 50, color: [54, 168, 70] },
  { name: 'Lava', cat: CAT.LIQUID, density: 8, color: [220, 80, 24] },
  { name: 'Acid', cat: CAT.LIQUID, density: 6, color: [150, 230, 40] },
  { name: 'Salt', cat: CAT.POWDER, density: 9, color: [232, 232, 236] },
  { name: 'Stone', cat: CAT.STATIC, density: 999, color: [90, 86, 92] },
];

// Named indices for readability.
const EMPTY = 0, WALL = 1, SAND = 2, WATER = 3, OIL = 4, FIRE = 5,
  WOOD = 6, SMOKE = 7, STEAM = 8, PLANT = 9, LAVA = 10, ACID = 11,
  SALT = 12, STONE = 13;

const FLAMMABLE = new Set([WOOD, OIL, PLANT]);

class Sandbox {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.size = w * h;
    this.cells = new Uint8Array(this.size);     // element id per cell
    this.life = new Uint8Array(this.size);       // timer for transient cells
    this.shade = new Uint8Array(this.size);      // per-cell colour jitter
    this.updated = new Uint8Array(this.size);    // processed-this-frame flag
    this.frame = 0;
  }

  idx(x, y) { return y * this.w + x; }
  inBounds(x, y) { return x >= 0 && x < this.w && y >= 0 && y < this.h; }

  set(x, y, el) {
    if (!this.inBounds(x, y)) return;
    const i = y * this.w + x;
    this.cells[i] = el;
    this.shade[i] = (Math.random() * 40) | 0;
    if (el === FIRE) this.life[i] = 60 + ((Math.random() * 40) | 0);
    else if (el === SMOKE) this.life[i] = 120 + ((Math.random() * 80) | 0);
    else if (el === STEAM) this.life[i] = 140 + ((Math.random() * 100) | 0);
    else this.life[i] = 0;
  }

  clear() {
    this.cells.fill(EMPTY);
    this.life.fill(0);
  }

  // ---- Movement primitives ----------------------------------------------
  // density-based displacement: a mover may enter `to` if it's empty or holds
  // a non-static fluid/gas of strictly lower density (they swap).
  canEnter(moverDensity, toEl) {
    if (toEl === EMPTY) return true;
    const t = EL[toEl];
    if (t.cat === CAT.STATIC || t.cat === CAT.POWDER) return false;
    return t.density < moverDensity;
  }

  swap(a, b) {
    const c = this.cells, l = this.life, s = this.shade;
    const tc = c[a]; c[a] = c[b]; c[b] = tc;
    const tl = l[a]; l[a] = l[b]; l[b] = tl;
    const ts = s[a]; s[a] = s[b]; s[b] = ts;
    this.updated[b] = 1;
  }

  // ---- Main step ---------------------------------------------------------
  step() {
    this.frame++;
    this.updated.fill(0);
    const { w, h } = this;
    // Scan bottom-to-top; alternate horizontal direction to reduce bias.
    for (let y = h - 1; y >= 0; y--) {
      const ltr = (this.frame + y) & 1;
      for (let k = 0; k < w; k++) {
        const x = ltr ? k : w - 1 - k;
        const i = y * w + x;
        if (this.updated[i]) continue;
        const el = this.cells[i];
        if (el === EMPTY || el === WALL || el === STONE) continue;
        this.react(x, y, i, el);
        if (this.cells[i] !== el) continue; // transformed by reaction
        switch (EL[el].cat) {
          case CAT.POWDER: this.powder(x, y, i, el); break;
          case CAT.LIQUID: this.liquid(x, y, i, el); break;
          case CAT.GAS: this.gas(x, y, i, el); break;
        }
      }
    }
  }

  powder(x, y, i, el) {
    const { w } = this;
    const d = EL[el].density;
    const below = i + w;
    if (y + 1 < this.h && this.canEnter(d, this.cells[below])) {
      this.swap(i, below); return;
    }
    if (y + 1 >= this.h) return;
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (const dx of [dir, -dir]) {
      const nx = x + dx;
      if (nx < 0 || nx >= w) continue;
      const t = below + dx;
      if (this.canEnter(d, this.cells[t])) { this.swap(i, t); return; }
    }
  }

  liquid(x, y, i, el) {
    const { w, h } = this;
    const d = EL[el].density;
    const below = i + w;
    if (y + 1 < h && this.canEnter(d, this.cells[below])) {
      this.swap(i, below); return;
    }
    const dir = Math.random() < 0.5 ? -1 : 1;
    // diagonal down
    if (y + 1 < h) {
      for (const dx of [dir, -dir]) {
        const nx = x + dx;
        if (nx < 0 || nx >= w) continue;
        const t = below + dx;
        if (this.canEnter(d, this.cells[t])) { this.swap(i, t); return; }
      }
    }
    // horizontal flow — reach a few cells for runnier spread
    for (const dx of [dir, -dir]) {
      for (let step = 1; step <= 4; step++) {
        const nx = x + dx * step;
        if (nx < 0 || nx >= w) break;
        const t = i + dx * step;
        if (this.cells[t] === EMPTY || this.canEnter(d, this.cells[t])) {
          this.swap(i, t);
        } else break;
      }
      if (this.updated[i]) return;
    }
  }

  gas(x, y, i, el) {
    const { w } = this;
    // transient gases age and expire
    if (el === FIRE || el === SMOKE || el === STEAM) {
      if (this.life[i] <= 1) {
        if (el === FIRE) this.set(x, y, Math.random() < 0.4 ? SMOKE : EMPTY);
        else if (el === STEAM) this.set(x, y, Math.random() < 0.25 ? WATER : EMPTY);
        else this.set(x, y, EMPTY);
        return;
      }
      this.life[i]--;
    }
    const d = EL[el].density;
    const above = i - w;
    if (y - 1 >= 0 && this.canEnter(d, this.cells[above])) {
      this.swap(i, above); return;
    }
    const dir = Math.random() < 0.5 ? -1 : 1;
    if (y - 1 >= 0) {
      for (const dx of [dir, -dir]) {
        const nx = x + dx;
        if (nx < 0 || nx >= w) continue;
        const t = above + dx;
        if (this.canEnter(d, this.cells[t])) { this.swap(i, t); return; }
      }
    }
    for (const dx of [dir, -dir]) {
      const nx = x + dx;
      if (nx < 0 || nx >= w) continue;
      const t = i + dx;
      if (this.cells[t] === EMPTY) { this.swap(i, t); return; }
    }
  }

  // ---- Reactions ---------------------------------------------------------
  react(x, y, i, el) {
    switch (el) {
      case FIRE: return this.reactFire(x, y, i);
      case LAVA: return this.reactLava(x, y, i);
      case ACID: return this.reactAcid(x, y, i);
      case PLANT: return this.reactPlant(x, y, i);
      case SALT: return this.reactSalt(x, y, i);
    }
  }

  forNeighbors(x, y, fn) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (!this.inBounds(nx, ny)) continue;
        if (fn(nx, ny, ny * this.w + nx) === true) return;
      }
    }
  }

  reactFire(x, y, i) {
    this.forNeighbors(x, y, (nx, ny, ni) => {
      const n = this.cells[ni];
      if (n === WATER) { this.set(x, y, STEAM); return true; }
      if (FLAMMABLE.has(n) && Math.random() < 0.35) this.set(nx, ny, FIRE);
    });
  }

  reactLava(x, y, i) {
    this.forNeighbors(x, y, (nx, ny, ni) => {
      const n = this.cells[ni];
      if (n === WATER) { this.set(x, y, STONE); this.set(nx, ny, STEAM); return true; }
      if (FLAMMABLE.has(n) && Math.random() < 0.25) this.set(nx, ny, FIRE);
    });
    // occasionally spit fire upward
    if (Math.random() < 0.02 && y > 0 && this.cells[i - this.w] === EMPTY) {
      this.set(x, y - 1, FIRE);
    }
  }

  reactAcid(x, y, i) {
    this.forNeighbors(x, y, (nx, ny, ni) => {
      const n = this.cells[ni];
      if ((n === SAND || n === WOOD || n === STONE || n === PLANT || n === SALT)
          && Math.random() < 0.18) {
        this.set(nx, ny, EMPTY);
        if (Math.random() < 0.5) this.set(x, y, EMPTY); // acid is consumed
        return true;
      }
    });
  }

  reactPlant(x, y, i) {
    if (Math.random() > 0.05) return;
    this.forNeighbors(x, y, (nx, ny, ni) => {
      if (this.cells[ni] === WATER && Math.random() < 0.5) {
        this.set(nx, ny, PLANT); return true;
      }
    });
  }

  reactSalt(x, y, i) {
    this.forNeighbors(x, y, (nx, ny, ni) => {
      if (this.cells[ni] === WATER && Math.random() < 0.08) {
        this.set(x, y, EMPTY); return true;
      }
    });
  }
}

// expose for other modules / debugging
window.Sandbox = Sandbox;
window.EL = EL;
window.ELEMENTS = {
  EMPTY, WALL, SAND, WATER, OIL, FIRE, WOOD, SMOKE, STEAM, PLANT, LAVA, ACID, SALT, STONE,
};
