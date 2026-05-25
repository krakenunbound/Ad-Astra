// Headless verification of the simulation core (no browser needed).
const fs = require('fs');
const vm = require('vm');

const sandbox = { window: {}, Math, console };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(__dirname + '/sandbox.js', 'utf8'), sandbox);

const { Sandbox } = sandbox.window;
const E = sandbox.window.ELEMENTS;

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log(' FAIL ' + name); }
}

// 1. Sand falls under gravity.
{
  const s = new Sandbox(5, 5);
  s.set(2, 0, E.SAND);
  for (let i = 0; i < 10; i++) s.step();
  check('sand falls to the floor', s.cells[s.idx(2, 4)] === E.SAND);
}

// 2. Sand sinks through water (density), water ends up above.
{
  const s = new Sandbox(3, 6);
  for (let y = 2; y < 6; y++) s.set(1, y, E.WATER);
  s.set(1, 0, E.SAND);
  for (let i = 0; i < 30; i++) s.step();
  check('sand sinks below water', s.cells[s.idx(1, 5)] === E.SAND);
}

// 3. Oil floats on water (oil less dense). Start oil at the bottom, water on
//    top, in a closed box; oil should rise above the water layer.
{
  const s = new Sandbox(6, 12);
  for (let y = 8; y < 12; y++) for (let x = 0; x < 6; x++) s.set(x, y, E.OIL);
  for (let y = 4; y < 8; y++) for (let x = 0; x < 6; x++) s.set(x, y, E.WATER);
  for (let i = 0; i < 200; i++) s.step();
  let oilSum = 0, oilN = 0, watSum = 0, watN = 0;
  for (let y = 0; y < 12; y++) for (let x = 0; x < 6; x++) {
    const c = s.cells[s.idx(x, y)];
    if (c === E.OIL) { oilSum += y; oilN++; }
    if (c === E.WATER) { watSum += y; watN++; }
  }
  const avgOil = oilSum / oilN, avgWat = watSum / watN;
  check('oil layers above water', oilN > 0 && watN > 0 && avgOil < avgWat);
}

// 4. Lava + water => stone + steam.
{
  const s = new Sandbox(3, 3);
  s.set(1, 1, E.LAVA);
  s.set(1, 0, E.WATER);
  let madeStone = false, madeSteam = false;
  for (let i = 0; i < 20; i++) {
    s.step();
    for (let k = 0; k < s.size; k++) {
      if (s.cells[k] === E.STONE) madeStone = true;
      if (s.cells[k] === E.STEAM) madeSteam = true;
    }
  }
  check('lava + water makes stone', madeStone);
  check('lava + water makes steam', madeSteam);
}

// 5. Fire ignites wood.
{
  const s = new Sandbox(5, 5);
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) s.set(x, y, E.WOOD);
  s.set(2, 2, E.FIRE);
  let burned = false;
  for (let i = 0; i < 60; i++) {
    s.step();
    let woodLeft = 0;
    for (let k = 0; k < s.size; k++) if (s.cells[k] === E.WOOD) woodLeft++;
    if (woodLeft < 24) burned = true;
  }
  check('fire spreads through wood', burned);
}

// 6. Walls never move.
{
  const s = new Sandbox(3, 3);
  s.set(1, 0, E.WALL);
  for (let i = 0; i < 10; i++) s.step();
  check('wall stays put', s.cells[s.idx(1, 0)] === E.WALL);
}

// 7. Acid dissolves sand.
{
  const s = new Sandbox(3, 4);
  for (let y = 1; y < 4; y++) s.set(1, y, E.SAND);
  s.set(1, 0, E.ACID);
  let dissolved = false;
  for (let i = 0; i < 80; i++) {
    s.step();
    let sandLeft = 0;
    for (let k = 0; k < s.size; k++) if (s.cells[k] === E.SAND) sandLeft++;
    if (sandLeft < 3) dissolved = true;
  }
  check('acid dissolves sand', dissolved);
}

// 8. Mass conservation for inert powder (no element should vanish/multiply).
{
  const s = new Sandbox(10, 10);
  let placed = 0;
  for (let x = 0; x < 10; x++) { s.set(x, 0, E.SAND); placed++; }
  for (let i = 0; i < 50; i++) s.step();
  let count = 0;
  for (let k = 0; k < s.size; k++) if (s.cells[k] === E.SAND) count++;
  check('sand is conserved (no leaks)', count === placed);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
