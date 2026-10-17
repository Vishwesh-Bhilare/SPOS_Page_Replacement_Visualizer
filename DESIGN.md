# Quiet Paper — Design System

A light, minimal, editorial theme. Warm off-white paper, ink-dark text, muted accents, thin hairlines, slow motion. Built for tools that explain things: analyzers, visualizers, dashboards, reports.

Source implementation: `style.css` in this folder (Page Replacement Analyzer).

---

## 1. Principles

1. **Calm over loud.** No glows, gradients, shadows-as-decoration, bounce or pop. Nothing should compete with the content.
2. **Paper, not screen.** Warm neutrals instead of pure white or pure black. It should feel like a printed page or a notebook.
3. **Hairlines, not boxes.** Separate with 1px lines and whitespace. Avoid heavy cards, thick borders, drop shadows.
4. **Color means something.** Accent colors encode state (fault / hit, series A / B / C). They are never decoration.
5. **Slow and soft.** Transitions are around one second, ease curves, and fades. Changes should be noticed gently, not announced.
6. **Text over icons.** Buttons and labels use words. No emoji. Symbols only where they carry data (a letter mark, a dot).
7. **Serif for voice, mono for data, sans for UI.**

---

## 2. Color tokens

### Neutrals (paper and ink)

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#faf8f4` | Page background |
| `--card` | `#fffefb` | Inputs, buttons, raised surfaces |
| `--line` | `#e7e2d8` | All hairlines, borders, empty tracks |
| `--tx` | `#26231f` | Primary text, primary button fill |
| `--mu` | `#8b857a` | Secondary text, labels, axis text |

Extra neutrals used sparingly: `#ece8de` (chart gridlines), `#d9d3c6` (reference lines), `#d4cfc4` (empty placeholder), `#3d3933` (primary button hover).

### Semantic (state)

| Token | Hex | Background tint | Meaning |
|---|---|---|---|
| `--fault` | `#a8503b` | `#f4e3dc` | Negative / error / miss |
| `--hit` | `#56785f` | `#e2ece4` | Positive / success / hit |

Soft borders for tinted states: fault `#dcb5a8` (strong) / `#e3c2b7` (light), hit `#b3cabb` (strong) / `#bfd3c5` (light).

### Series (data categories)

| Token | Hex | Pairing |
|---|---|---|
| `--FIFO` | `#4a5a78` | Slate blue, solid line |
| `--LRU` | `#9a7a45` | Ochre, dashed line (`7 5`) |
| `--OPT` | `#2b2926` | Charcoal, dotted line (`2 4`) |

Rule: always pair series color with a second channel (dash pattern, label) so charts are readable without color.

Rename the series tokens per project (`--series-a/b/c`), keep the muted saturation.

---

## 3. Typography

| Role | Stack | Notes |
|---|---|---|
| Headings, big numbers | `"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif` | Weight 400–500, tight tracking `-0.01em` to `-0.02em` |
| UI and body | `ui-sans-serif,system-ui,-apple-system,"Segoe UI",Inter,sans-serif` | 14–15px, line-height 1.6 |
| Data, inputs, code | `ui-monospace,"JetBrains Mono",Menlo,Consolas,monospace` | 13–15px |

No web fonts needed. All system stacks.

### Scale

| Element | Size | Style |
|---|---|---|
| H1 | `clamp(30px, 5vw, 46px)` | Serif, weight 500 |
| Big stat | 52px | Serif, weight 400, line-height 1.1 |
| Sub-stat | 20px | Serif, weight 500 |
| Section label (H2) | 13px | Sans, weight 600, uppercase, `letter-spacing .16em`, muted |
| Eyebrow | 11px | Uppercase, `letter-spacing .22em`, muted |
| Field label | 11px | Uppercase, `letter-spacing .14em`, muted |
| Body | 14–15px | Sans |
| Small / helper | 13px | Muted |
| Micro label | 10px | Uppercase, `letter-spacing .14–.18em`, muted |

Pattern: **tiny uppercase tracked label above, large serif number or heading below.**

---

## 4. Layout and spacing

- Single centered column, `max-width: 980px`, side padding 24px.
- Sections are separated by **56px** vertical gap, no dividers or card frames between them.
- Section header: uppercase H2 label, 18px below it to content.
- Multi-column groups: `grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 28px`.
- Inner gaps: 6px (dense chips), 10–16px (controls), 22–40px (groups).
- Radii: 5–6px (tiny cells, chips), 8px (inputs, buttons), 12px (large panels).
- Hero: centered, 72px top padding, eyebrow, title, one-line muted lede.

---

## 5. Components

### Buttons
- Default: `--card` fill, 1px `--line` border, 8px radius, `9px 18px` padding, 14px text.
- Hover: border becomes `--tx`. No lift, no shadow.
- Primary (`.solid`): `--tx` fill, `--card` text.
- Text tabs (`.tab`, `.ex`): no box, no fill. Muted text, 1px underline in `--tx` or the series color when active.

### Inputs
- `--card` fill, 1px `--line` border, 8px radius, mono 15px.
- Focus: border becomes `--tx`. No glow ring.
- Labels: uppercase micro label above.

### Summary stat
- 2px top border in the series color, 16px padding-top.
- Uppercase series name in series color, big serif number, muted caption, small row of `label / value` pairs.

### Bars
- Track: 6px high, `--line`, fully rounded.
- Fill: series color, width animates over ~1.8s.

### Chips (sequence tokens)
- 32px square, 6px radius, hairline border, mono 13px.
- States: future (45% opacity), fault (soft terracotta border + text), hit (soft sage border + text), current (solid ink fill, light text).

### Stage / panel
- `--card` background, 1px `--line` border, 12px radius, 32px padding.
- Cells inside: 70px squares, 8px radius, `--bg` fill, serif 24px value, empty shows a faint en dash.
- Active cell takes the semantic tint (fault or hit) with its soft border.

### Table / grid trace
- `border-collapse: separate; border-spacing: 3px`.
- 34×32 cells, 5px radius, hairline border, mono 13px.
- Semantic tint on active cells, 1px ink outline for the current column.
- Marker row uses single letters (`H`, `F`) in semantic color, no icons.

### Chart (SVG)
- Gridlines `#ece8de`, axis text mono 11px muted.
- Lines 1.8px, distinct dash patterns per series, small round markers (2.5px, 4px for the highlighted point).
- A dotted vertical reference line marks the current value.

### Callout
- Left border 2px (`--fault` for warning, `--line` for neutral), tinted background, `0 6px 6px 0` radius, 14px text.

### Calculation block
- Series-colored top border, serif result line, then rows separated by 1px `--line`, each with a micro uppercase label over a mono formula.

---

## 6. Motion

| Property | Duration | Easing |
|---|---|---|
| Color, background, border changes | `1.1s` (`--slow`) | `ease` |
| Input focus border | `0.8s` | `ease` |
| Button hover | `0.8s` | `ease` |
| Section entrance | `1.6s` | `ease`, fade + 6px upward drift |
| Bar growth | `1.8s` | `cubic-bezier(.3,.6,.2,1)` |
| Autoplay step interval | `1800ms` | |

Rules:
- Animate color and opacity, not size or position. No scale pops, no bounce, no spring.
- Keep DOM elements persistent and toggle classes so transitions actually play. Re-creating nodes via `innerHTML` skips the transition.
- Honor `prefers-reduced-motion`: disable animation and transitions.

---

## 7. Voice and copy

- Plain sentences, no exclamation marks, no emoji.
- Short ledes under titles. One line.
- Labels are nouns (`Frames`, `Fault rate`). Buttons are verbs (`Analyze`, `Play`).
- Show the numbers the user would write by hand (`Hit → 2   Fault → 10`) alongside derived ratios.

---

## 8. Drop-in CSS tokens

```css
:root{
  /* paper and ink */
  --bg:#faf8f4; --card:#fffefb; --line:#e7e2d8; --tx:#26231f; --mu:#8b857a;
  /* state */
  --fault:#a8503b; --faultbg:#f4e3dc;
  --hit:#56785f;   --hitbg:#e2ece4;
  /* series */
  --series-a:#4a5a78; --series-b:#9a7a45; --series-c:#2b2926;
  /* motion */
  --slow:1.1s;
}
body{
  background:var(--bg); color:var(--tx); line-height:1.6;
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Inter,sans-serif;
}
h1,.big{font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;font-weight:500}
.mono{font-family:ui-monospace,"JetBrains Mono",Menlo,Consolas,monospace}
h2{font-size:13px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--mu)}
main{max-width:980px;margin:0 auto;padding:12px 24px 80px;display:flex;flex-direction:column;gap:56px}
button{background:var(--card);color:var(--tx);border:1px solid var(--line);padding:9px 18px;border-radius:8px;font:inherit;font-size:14px;cursor:pointer;transition:border-color .8s ease,background .8s ease}
button:hover{border-color:var(--tx)}
button.solid{background:var(--tx);color:var(--card);border-color:var(--tx)}
input{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:10px 12px;font-family:ui-monospace,Menlo,monospace;transition:border-color .8s ease}
input:focus{outline:none;border-color:var(--tx)}
@keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.block{animation:fade 1.6s ease both}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
```

---

## 9. Reuse checklist

- [ ] Paper background, ink text, no pure white or black
- [ ] One serif for headings and numbers, mono for data, system sans for UI
- [ ] Uppercase tracked micro-labels above values
- [ ] 1px hairlines, no shadows, no gradients, no glows
- [ ] Accent colors only for state or data series, always with a second visual channel
- [ ] Transitions about one second, color and opacity only
- [ ] No emoji, buttons use words
- [ ] Persistent DOM nodes for animated state
- [ ] Reduced-motion fallback

---

## 10. Prompt snippet for other projects

> Use the "Quiet Paper" design system: warm off-white background `#faf8f4`, ink text `#26231f`, muted text `#8b857a`, 1px hairlines `#e7e2d8`. Serif headings and large numbers (Iowan Old Style / Georgia), mono for data, system sans for UI. Uppercase letter-spaced micro labels. Single centered column, max 980px, 56px between sections, no cards or shadows. Muted semantic colors (terracotta `#a8503b` for negative, sage `#56785f` for positive) with soft tinted backgrounds. All transitions about 1.1s ease on color and opacity only; section fade-in 1.6s. No emoji, no gradients, no bounce. Charts use thin lines with distinct dash patterns rather than relying on color alone. Respect `prefers-reduced-motion`.
