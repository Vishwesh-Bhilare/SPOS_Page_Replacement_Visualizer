const $ = s => document.querySelector(s);
const ALGOS = ['FIFO', 'LRU', 'OPT'];
const NAME = { FIFO: 'FIFO', LRU: 'LRU', OPT: 'Optimal' };
const COL = { FIFO: '#4a5a78', LRU: '#9a7a45', OPT: '#2b2926' };
const DASH = { FIFO: '', LRU: '7 5', OPT: '2 4' };
const DESC = {
  FIFO: 'Replaces the page that has been in memory longest.',
  LRU: 'Replaces the page unused for the longest time.',
  OPT: 'Replaces the page whose next use is farthest away.'
};
const PLAY_MS = 1800;

const EX = [
  { label: 'Example 1', refs: '7 0 1 2 0 3 0 4 2 3 0 3', n: 3, expect: { algo: 'FIFO', hits: 2, faults: 10 } },
  { label: 'Example 2', refs: '1 2 3 4 2 5 1 2 6 3 2 4', n: 4, expect: { algo: 'FIFO', hits: 2, faults: 10 } },
  { label: 'Belady', refs: '1 2 3 4 1 2 5 1 2 3 4 5', n: 3 },
  { label: 'Classic', refs: '7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1', n: 3 }
];

let S = { refs: [], n: 3, res: {}, algo: 'FIFO', step: 0, timer: null };

/* ---------- simulation ---------- */
function simulate(algo, refs, n) {
  const fr = Array(n).fill(null), last = {};
  let ptr = 0, faults = 0;
  const steps = [];
  refs.forEach((p, i) => {
    let slot = fr.indexOf(p), fault = slot < 0, ev = null, note = '';
    if (!fault) {
      note = `Page ${p} is already in frame ${slot + 1}. Hit.`;
    } else {
      faults++;
      const empty = fr.indexOf(null);
      if (empty >= 0) {
        slot = empty;
        note = `Page ${p} is not in memory. Frame ${slot + 1} is free, so it is loaded there.`;
        if (algo === 'FIFO') ptr = (slot + 1) % n;
      } else {
        if (algo === 'FIFO') {
          slot = ptr; ptr = (ptr + 1) % n;
          note = `Page ${p} is not in memory. ${fr[slot]} has been resident longest, so it is replaced.`;
        } else if (algo === 'LRU') {
          let best = Infinity;
          fr.forEach((q, j) => { if (last[q] < best) { best = last[q]; slot = j; } });
          note = `Page ${p} is not in memory. ${fr[slot]} was last used at t=${best + 1}, the longest ago, so it is replaced.`;
        } else {
          let far = -1;
          fr.forEach((q, j) => {
            const nx = refs.indexOf(q, i + 1), d = nx < 0 ? Infinity : nx;
            if (d > far) { far = d; slot = j; }
          });
          note = `Page ${p} is not in memory. ${fr[slot]} ${far === Infinity ? 'is never used again' : 'is next used at t=' + (far + 1)}, so it is replaced.`;
        }
        ev = fr[slot];
      }
      fr[slot] = p;
    }
    last[p] = i;
    steps.push({ page: p, frames: [...fr], fault, ev, slot, note, faults });
  });
  return { algo, steps, faults, hits: refs.length - faults };
}
const faultsFor = (a, refs, n) => simulate(a, refs, n).faults;
const pct = (a, b) => (100 * a / b).toFixed(2);

/* ---------- input ---------- */
function err(m) { $('#err').textContent = m; return null; }
function parse() {
  const refs = $('#refs').value.trim().split(/[\s,]+/).filter(Boolean);
  const n = parseInt($('#frames').value, 10);
  if (!refs.length) return err('Enter at least one page reference.');
  if (refs.length > 60) return err('Up to 60 references.');
  if (!(n >= 1 && n <= 10)) return err('Frames must be between 1 and 10.');
  err('');
  return { refs, n };
}
function analyze() {
  const p = parse(); if (!p) return;
  stop();
  S.refs = p.refs; S.n = p.n; S.step = 0;
  S.res = {}; ALGOS.forEach(a => S.res[a] = simulate(a, p.refs, p.n));
  build(); update();
}
function load(ex) {
  $('#refs').value = ex.refs; $('#frames').value = ex.n; analyze();
}

/* ---------- build (once per analysis) ---------- */
function build() {
  buildExamples(); buildCheck(); buildSummary(); buildBars(); buildTabs();
  buildChips(); buildStage(); buildTraces(); buildSweep(); buildMath();
}

function matchEx() {
  const key = S.refs.join(' ');
  return EX.find(e => e.refs === key && e.n === S.n);
}
function buildExamples() {
  const cur = matchEx();
  $('#examples').innerHTML = EX.map((e, i) =>
    `<button class="ex ${cur === e ? 'on' : ''}" data-i="${i}">${e.label}<span class="muted"> · ${e.n} frames</span></button>`).join('') +
    `<button class="ex" id="rand">Random</button>`;
  document.querySelectorAll('.ex[data-i]').forEach(b => b.onclick = () => load(EX[+b.dataset.i]));
  $('#rand').onclick = () => {
    $('#refs').value = Array.from({ length: 14 }, () => 1 + Math.floor(Math.random() * 6)).join(' ');
    analyze();
  };
}
function buildCheck() {
  const e = matchEx();
  if (!e || !e.expect) { $('#check').innerHTML = ''; return; }
  const r = S.res[e.expect.algo];
  const ok = r.hits === e.expect.hits && r.faults === e.expect.faults;
  $('#check').innerHTML = ok
    ? `${NAME[e.expect.algo]}: hit ${r.hits}, fault ${r.faults}.`
    : `<span class="bad">Differs from notes.</span> Notes: hit ${e.expect.hits}, fault ${e.expect.faults}. Computed: hit ${r.hits}, fault ${r.faults}.`;
}

function buildSummary() {
  const N = S.refs.length;
  const min = Math.min(...ALGOS.map(a => S.res[a].faults));
  $('#summary').innerHTML = ALGOS.map(a => {
    const r = S.res[a];
    return `<div class="sum" style="--c:${COL[a]}">
      <h3>${NAME[a]}</h3>
      <div class="big">${pct(r.faults, N)}%</div>
      <div class="sub">page fault rate</div>
      <div class="kv"><div><b>${r.faults}</b>Faults</div><div><b>${r.hits}</b>Hits</div><div><b>${pct(r.hits, N)}%</b>Hit ratio</div></div>
      <div class="tl">${r.faults === min ? 'Fewest faults' : ''}</div>
    </div>`;
  }).join('');
}

function buildBars() {
  const N = S.refs.length;
  $('#bars').innerHTML = ALGOS.map(a => {
    const r = S.res[a];
    return `<div class="bar-row"><span style="color:${COL[a]}">${NAME[a]}</span>
      <div class="bar-track"><div class="bar-fill" data-w="${100 * r.faults / N}" style="background:${COL[a]}"></div></div>
      <span class="mono muted">${r.faults}/${N}</span></div>`;
  }).join('');
  setTimeout(() => document.querySelectorAll('.bar-fill').forEach(b => b.style.width = b.dataset.w + '%'), 80);
}

function buildTabs() {
  $('#tabs').innerHTML = ALGOS.map(a => `<button class="tab" style="--c:${COL[a]}" data-a="${a}">${NAME[a]}</button>`).join('');
  document.querySelectorAll('.tab').forEach(b => b.onclick = () => { S.algo = b.dataset.a; update(); });
}

function buildChips() {
  $('#chips').innerHTML = S.refs.map((p, i) => `<div class="chip" data-i="${i + 1}">${p}</div>`).join('');
  document.querySelectorAll('.chip').forEach(c => c.onclick = () => { stop(); S.step = +c.dataset.i; update(); });
  $('#slider').max = S.refs.length;
}

function buildStage() {
  $('#stage').innerHTML = `<div class="frames">${Array.from({ length: S.n }, (_, j) =>
    `<div class="fslot"><div class="fbox" id="fb${j}"></div><div class="evict" id="ev${j}"></div><div class="fidx">Frame ${j + 1}</div></div>`).join('')}</div>
    <div class="info"><div class="status" id="status"></div><div class="note" id="note"></div><div class="tally mono" id="tally"></div></div>`;
}

function buildTraces() {
  $('#traces').innerHTML = ALGOS.map(a => {
    const r = S.res[a];
    let h = `<div class="tr-wrap"><h3 style="color:${COL[a]}">${NAME[a]} <span>· hit ${r.hits}, fault ${r.faults}</span></h3><table class="tr"><tr><th>REF</th>`;
    h += S.refs.map(p => `<td class="ref">${p}</td>`).join('') + '</tr>';
    for (let j = 0; j < S.n; j++) {
      h += `<tr><th>F${j + 1}</th>` + r.steps.map((s, i) => {
        const v = s.frames[j];
        const c = s.slot === j ? (s.fault ? 'fl' : 'hl') : '';
        return `<td class="${c}" data-a="${a}" data-i="${i + 1}">${v === null ? '' : v}</td>`;
      }).join('') + '</tr>';
    }
    h += `<tr><th></th>${r.steps.map((s, i) => `<td class="mk ${s.fault ? 'f' : 'h'}" data-a="${a}" data-i="${i + 1}">${s.fault ? 'F' : 'H'}</td>`).join('')}</tr></table></div>`;
    return h;
  }).join('');
  document.querySelectorAll('table.tr td[data-i]').forEach(td => td.onclick = () => {
    stop(); S.algo = td.dataset.a; S.step = +td.dataset.i; update();
    $('#stage').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

function buildSweep() {
  const distinct = new Set(S.refs).size;
  const maxF = Math.min(12, Math.max(distinct + 1, S.n + 2));
  const xs = Array.from({ length: maxF }, (_, i) => i + 1);
  const data = {}; ALGOS.forEach(a => data[a] = xs.map(f => faultsFor(a, S.refs, f)));
  const W = 720, H = 280, L = 40, R = 16, T = 14, B = 40;
  const ymax = Math.max(...ALGOS.flatMap(a => data[a]), 1);
  const X = f => L + (f - 1) * (W - L - R) / Math.max(maxF - 1, 1);
  const Y = v => T + (H - T - B) * (1 - v / ymax);
  let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto">`;
  const step = Math.max(1, Math.ceil(ymax / 6));
  for (let v = 0; v <= ymax; v += step)
    svg += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="#ece8de"/><text x="${L - 10}" y="${Y(v) + 4}" text-anchor="end">${v}</text>`;
  xs.forEach(f => svg += `<text x="${X(f)}" y="${H - 20}" text-anchor="middle">${f}</text>`);
  svg += `<text x="${(L + W - R) / 2}" y="${H - 2}" text-anchor="middle">frames</text>`;
  svg += `<line x1="${X(S.n)}" x2="${X(S.n)}" y1="${T}" y2="${H - B}" stroke="#d9d3c6" stroke-dasharray="2 4"/>`;
  ALGOS.forEach(a => {
    const pts = xs.map((f, i) => `${X(f)},${Y(data[a][i])}`).join(' ');
    svg += `<polyline points="${pts}" fill="none" stroke="${COL[a]}" stroke-width="1.8" stroke-dasharray="${DASH[a]}" stroke-linejoin="round"/>`;
    xs.forEach((f, i) => svg += `<circle cx="${X(f)}" cy="${Y(data[a][i])}" r="${f === S.n ? 4 : 2.5}" fill="${COL[a]}"><title>${NAME[a]}, ${f} frames: ${data[a][i]} faults</title></circle>`);
  });
  svg += '</svg>';
  $('#sweep').innerHTML = svg + `<div class="legend">${ALGOS.map(a =>
    `<span><i style="border-color:${COL[a]};border-top-style:${a === 'FIFO' ? 'solid' : a === 'LRU' ? 'dashed' : 'dotted'}"></i>${NAME[a]}</span>`).join('')}<span>Dotted vertical line: current frame count</span></div>`;

  const up = [];
  for (let i = 0; i < xs.length - 1; i++)
    if (data.FIFO[i + 1] > data.FIFO[i]) up.push(`${xs[i]} to ${xs[i + 1]} frames raises FIFO faults from ${data.FIFO[i]} to ${data.FIFO[i + 1]}`);
  $('#belady').innerHTML = up.length
    ? `<div class="alert"><b>Belady's anomaly.</b> ${up.join('; ')}. LRU and Optimal are stack algorithms and cannot do this.</div>`
    : `<div class="alert ok">No Belady's anomaly for this string. The Belady example shows one.</div>`;
}

function buildMath() {
  const N = S.refs.length;
  const opt = S.res.OPT.faults;
  $('#math').innerHTML = ALGOS.map(a => {
    const r = S.res[a], p = r.faults / N;
    const ft = r.steps.map((s, i) => s.fault ? i + 1 : null).filter(Boolean);
    const ht = r.steps.map((s, i) => !s.fault ? i + 1 : null).filter(Boolean);
    return `<div class="math" style="--c:${COL[a]}"><h3>${NAME[a]}</h3>
      <div class="hf">Hit → ${r.hits} &nbsp; Fault → ${r.faults}</div>
      <div class="eq"><small>Fault rate</small>${r.faults} / ${N} = ${p.toFixed(4)} (${(p * 100).toFixed(2)}%)</div>
      <div class="eq"><small>Hit ratio</small>${r.hits} / ${N} = ${(1 - p).toFixed(4)} (${((1 - p) * 100).toFixed(2)}%)</div>
      <div class="eq"><small>Faults at t</small>${ft.join(', ') || 'none'}</div>
      <div class="eq"><small>Hits at t</small>${ht.join(', ') || 'none'}</div>
      <div class="eq"><small>Against optimal</small>${r.faults - opt === 0 ? 'Equal to optimal' : '+' + (r.faults - opt) + ' faults'}</div>
    </div>`;
  }).join('');
}

/* ---------- update (every step) ---------- */
function update() {
  const r = S.res[S.algo], k = S.step, N = S.refs.length;
  const cur = k > 0 ? r.steps[k - 1] : null;

  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.a === S.algo));
  document.querySelectorAll('.chip').forEach(c => {
    const i = +c.dataset.i;
    c.className = 'chip' + (i > k ? ' future' : r.steps[i - 1].fault ? ' f' : ' h') + (i === k ? ' cur' : '');
  });

  for (let j = 0; j < S.n; j++) {
    const v = cur ? cur.frames[j] : null, box = $('#fb' + j);
    box.textContent = v === null ? '' : v;
    box.className = 'fbox' + (cur && j === cur.slot ? (cur.fault ? ' fault' : ' hit') : '');
    $('#ev' + j).textContent = cur && cur.fault && cur.ev !== null && j === cur.slot ? `out: ${cur.ev}` : '';
  }
  const st = $('#status');
  st.textContent = !cur ? 'Ready' : cur.fault ? 'Page fault' : 'Hit';
  st.className = 'status' + (cur ? (cur.fault ? ' f' : ' h') : '');
  $('#note').innerHTML = cur ? `<span class="mono muted">t=${k}</span> &nbsp; Request <b>${cur.page}</b>. ${cur.note}` : `${DESC[S.algo]} Step forward to begin.`;
  $('#tally').textContent = `Hit → ${cur ? k - cur.faults : 0}   Fault → ${cur ? cur.faults : 0}`;

  $('#slider').value = k;
  $('#stepLbl').textContent = `${k} / ${N}`;
  $('#bPlay').textContent = S.timer ? 'Pause' : 'Play';
  document.querySelectorAll('table.tr td[data-i]').forEach(td =>
    td.classList.toggle('cur', td.dataset.a === S.algo && +td.dataset.i === k && !td.classList.contains('mk')));
}

/* ---------- player ---------- */
function stop() { if (S.timer) { clearInterval(S.timer); S.timer = null; } }
function go(k) { S.step = Math.max(0, Math.min(S.refs.length, k)); update(); }
$('#bNext').onclick = () => { stop(); go(S.step + 1); };
$('#bPrev').onclick = () => { stop(); go(S.step - 1); };
$('#bReset').onclick = () => { stop(); go(0); };
$('#slider').oninput = e => { stop(); go(+e.target.value); };
$('#bPlay').onclick = () => {
  if (S.timer) { stop(); update(); return; }
  if (S.step >= S.refs.length) S.step = 0;
  S.timer = setInterval(() => {
    if (S.step >= S.refs.length) { stop(); update(); return; }
    go(S.step + 1);
  }, PLAY_MS);
  update();
};
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' && e.target.type !== 'range') return;
  if (e.key === 'ArrowRight') { stop(); go(S.step + 1); }
  if (e.key === 'ArrowLeft') { stop(); go(S.step - 1); }
});

/* ---------- controls ---------- */
$('#run').onclick = analyze;
$('#refs').addEventListener('keydown', e => { if (e.key === 'Enter') analyze(); });
$('#frames').onchange = analyze;

load(EX[0]);
