// Rich text markup and SVG teaching pictures (spec in CONTRACT.md).
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const Rich = {
  html(s) {
    let t = esc(s == null ? '' : s);
    t = t.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    t = t.replace(/~\{([^{}]*)\}/g, (m, d) => '<span class="rec">' + [...d].map((c, i, a) =>
      `<span class="d${i === 0 || i === a.length - 1 ? ' dot' : ''}">${c}</span>`).join('') + '</span>');
    t = t.replace(/\{([^{}\/]+)\/([^{}]+)\}/g, '<span class="frac"><span>$1</span><span>$2</span></span>');
    t = t.replace(/\^\{([^{}]*)\}/g, '<sup>$1</sup>').replace(/_\{([^{}]*)\}/g, '<sub>$1</sub>');
    return t.replace(/\n/g, '<br>');
  },
  // Plain text for SVG labels: {3/4} -> 3/4, x^{2} -> x²
  plain(s) {
    const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '−': '⁻', '-': '⁻', n: 'ⁿ' };
    return String(s == null ? '' : s).replace(/\*\*/g, '')
      .replace(/\^\{([^}]*)\}/g, (m, x) => [...x].map(c => SUP[c] || c).join(''))
      .replace(/_\{([^}]*)\}/g, '$1').replace(/~\{([^}]*)\}/g, '$1')
      .replace(/\{([^{}\/]+)\/([^{}]+)\}/g, '$1/$2');
  },
};

const Viz = (() => {
  const COLORS = { red: '#ff5a5f', blue: '#3b82f6', green: '#22c55e', yellow: '#facc15', purple: '#a855f7', orange: '#fb923c' };
  const CYCLE = ['#ff5a5f', '#3b82f6', '#facc15', '#22c55e', '#a855f7', '#fb923c', '#ec4899', '#14b8a6'];
  const INK = 'var(--ink)', MUTED = 'var(--muted)', ACC = 'var(--accent)', SKY = 'var(--sky)', POP = 'var(--pop)', P2 = 'var(--panel2)', GO = 'var(--go)';
  let uid = 0;
  const n = x => (typeof U !== 'undefined' ? U.fmt(x) : String(x));
  const rad = d => d * Math.PI / 180;
  const r1 = x => Math.round(x * 10) / 10;

  const svg = (w, h, body, maxW) =>
    `<svg viewBox="0 0 ${r1(w)} ${r1(h)}" role="img" xmlns="http://www.w3.org/2000/svg" style="max-width:${Math.round(Math.min(440, maxW || w * 1.5))}px">${body}</svg>`;
  const T = (x, y, s, o = {}) =>
    `<text x="${r1(x)}" y="${r1(y)}" text-anchor="${o.a || 'middle'}" dominant-baseline="${o.b || 'central'}" font-size="${o.size || 16}"${o.fill ? ` style="fill:${o.fill}"` : ''}${o.rot ? ` transform="rotate(${o.rot} ${r1(x)} ${r1(y)})"` : ''}>${esc(Rich.plain(s))}</text>`;
  const L = (x1, y1, x2, y2, c = INK, w = 3, dash) =>
    `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" style="stroke:${c};stroke-width:${w};stroke-linecap:round${dash ? ';stroke-dasharray:6 6' : ''}"/>`;
  const R = (x, y, w, h, fill, stroke = 'rgba(0,0,0,.35)', sw = 1.5, rx = 0) =>
    `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${rx}" style="fill:${fill};stroke:${stroke};stroke-width:${sw}"/>`;
  const C = (cx, cy, r, fill, stroke = 'none', sw = 2) =>
    `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" style="fill:${fill};stroke:${stroke};stroke-width:${sw}"/>`;
  const P = (d, fill = 'none', stroke = INK, sw = 3, extra = '') =>
    `<path d="${d}" style="fill:${fill};stroke:${stroke};stroke-width:${sw};stroke-linejoin:round;stroke-linecap:round${extra}"/>`;
  const poly = pts => 'M' + pts.map(p => `${r1(p[0])} ${r1(p[1])}`).join(' L') + ' Z';
  // Arc between math-angles a1→a2 (degrees, counter-clockwise, y up) around (cx, cy)
  const arc = (cx, cy, r, a1, a2) => {
    while (a2 < a1) a2 += 360;
    const x1 = cx + r * Math.cos(rad(a1)), y1 = cy - r * Math.sin(rad(a1));
    const x2 = cx + r * Math.cos(rad(a2)), y2 = cy - r * Math.sin(rad(a2));
    return `M${r1(x1)} ${r1(y1)} A${r} ${r} 0 ${a2 - a1 > 180 ? 1 : 0} 0 ${r1(x2)} ${r1(y2)}`;
  };
  const angleMark = (cx, cy, a1, a2, r, color = ACC) => {
    let span = a2 - a1; while (span < 0) span += 360;
    if (Math.abs(span - 90) < 0.01) {
      const s = r * 0.55, u = [Math.cos(rad(a1)), -Math.sin(rad(a1))], v = [Math.cos(rad(a2)), -Math.sin(rad(a2))];
      return P(`M${r1(cx + u[0] * s)} ${r1(cy + u[1] * s)} L${r1(cx + (u[0] + v[0]) * s)} ${r1(cy + (u[1] + v[1]) * s)} L${r1(cx + v[0] * s)} ${r1(cy + v[1] * s)}`, 'none', color, 2.5);
    }
    return P(arc(cx, cy, r, a1, a2), 'none', color, 2.5);
  };
  const at = (cx, cy, r, a) => [cx + r * Math.cos(rad(a)), cy - r * Math.sin(rad(a))];
  const num = s => { const m = String(s || '').replace(/,/g, '').match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : NaN; };
  const arrowHead = (x, y, ang, c = INK) => {
    const a = rad(ang), s = 9;
    return P(`M${r1(x - s * Math.cos(a - 0.5))} ${r1(y + s * Math.sin(a - 0.5))} L${r1(x)} ${r1(y)} L${r1(x - s * Math.cos(a + 0.5))} ${r1(y + s * Math.sin(a + 0.5))}`, 'none', c, 2.5);
  };

  const R_ = {};

  R_.base10 = ({ n: v = 0 }) => {
    const c = 9, h = Math.floor(v / 100), t = Math.floor((v % 100) / 10), o = v % 10;
    let x = 6, out = '';
    for (let i = 0; i < h; i++) {
      out += R(x, 6, c * 10, c * 10, POP, 'rgba(0,0,0,.4)', 2);
      for (let k = 1; k < 10; k++) out += L(x + k * c, 6, x + k * c, 6 + c * 10, 'rgba(0,0,0,.25)', 1) + L(x, 6 + k * c, x + c * 10, 6 + k * c, 'rgba(0,0,0,.25)', 1);
      x += c * 10 + 10;
    }
    for (let i = 0; i < t; i++) {
      out += R(x, 6, c, c * 10, SKY, 'rgba(0,0,0,.4)', 2);
      for (let k = 1; k < 10; k++) out += L(x, 6 + k * c, x + c, 6 + k * c, 'rgba(0,0,0,.3)', 1);
      x += c + 5;
    }
    if (o) x += 4;
    for (let i = 0; i < o; i++) {
      const col = Math.floor(i / 5), row = i % 5;
      out += R(x + col * (c + 5), 6 + c * 10 - (row + 1) * (c + 3) + 3, c, c, ACC, 'rgba(0,0,0,.4)', 1.5);
    }
    x += Math.ceil(o / 5) * (c + 5);
    return svg(Math.max(x + 6, 40), c * 10 + 12, out, Math.max(x + 6, 40) * 2.4);
  };

  R_.numberLine = ({ min = 0, max = 10, step = 1, labelEvery, points = [], jumps = [] }) => {
    const W = 440, m = 26, ticks = Math.round((max - min) / step);
    const y = jumps.length ? 96 : points.some(p => p.label) ? 70 : 50;
    const X = v => m + (v - min) / (max - min || 1) * (W - 2 * m);
    const every = labelEvery || (ticks <= 12 ? 1 : ticks <= 24 ? 2 : 5);
    let out = L(m - 14, y, W - m + 14, y, INK, 3) + arrowHead(W - m + 16, y, 0) + arrowHead(m - 16, y, 180);
    const hidden = points.filter(p => p.label === '?').map(p => U.clean(p.at));
    for (let i = 0; i <= ticks; i++) {
      const v = U.clean(min + i * step), x = X(v), big = i % every === 0;
      out += L(x, y - (big ? 10 : 6), x, y + (big ? 10 : 6), INK, big ? 2.5 : 1.5);
      if (big && !hidden.some(hv => Math.abs(hv - v) < 1e-9)) out += T(x, y + 26, n(v), { size: 15 });
    }
    jumps.forEach(j => {
      const x1 = X(j.from), x2 = X(j.to), mid = (x1 + x2) / 2, hgt = Math.min(60, 22 + Math.abs(x2 - x1) * 0.35);
      out += P(`M${r1(x1)} ${y - 4} Q${r1(mid)} ${r1(y - 4 - hgt * 2)} ${r1(x2)} ${y - 4}`, 'none', POP, 3);
      out += arrowHead(x2, y - 4, x2 > x1 ? -60 : 240, POP);
      if (j.label) out += T(mid, y - 10 - hgt, j.label, { size: 15, fill: POP });
    });
    points.forEach(p => {
      const x = X(p.at);
      out += C(x, y, 8, p.label === '?' ? ACC : POP, 'rgba(0,0,0,.4)', 2);
      if (p.label) out += T(x, y - 24, p.label, { size: p.label === '?' ? 22 : 16, fill: p.label === '?' ? ACC : INK });
    });
    return svg(W, y + 44, out);
  };

  R_.array = ({ rows = 2, cols = 3, emoji }) => {
    const s = 34; let out = '';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = 8 + c * s + s / 2, y = 8 + r * s + s / 2;
      out += emoji ? T(x, y + 1, emoji, { size: 24 }) : C(x, y, 11, ACC, 'rgba(0,0,0,.35)', 2);
    }
    return svg(cols * s + 16, rows * s + 16, out, (cols * s + 16) * 1.6);
  };

  R_.objects = ({ groups = [5], emoji = '🍪' }) => {
    const s = 26, W = 440; let x = 6, y = 6, rowH = 0, out = '', maxX = 0;
    groups.forEach(g => {
      const cols = Math.max(1, Math.ceil(Math.sqrt(g))), rows = Math.max(1, Math.ceil(g / cols));
      const bw = cols * s + 18, bh = rows * s + 18;
      if (x + bw > W) { x = 6; y += rowH + 10; rowH = 0; }
      if (groups.length > 1) out += R(x, y, bw, bh, 'none', MUTED, 2.5, 18);
      for (let i = 0; i < g; i++) out += T(x + 9 + (i % cols) * s + s / 2, y + 9 + Math.floor(i / cols) * s + s / 2 + 1, emoji, { size: 20 });
      x += bw + 10; rowH = Math.max(rowH, bh); maxX = Math.max(maxX, x);
    });
    return svg(maxX, y + rowH + 6, out, maxX * 1.5);
  };

  R_.bond = ({ whole = '?', parts = ['?', '?'] }) => {
    const box = (x, y, v) => C(x, y, 32, v === '?' ? ACC : P2, INK, 3) + T(x, y + 1, v, { size: 22, fill: v === '?' ? 'var(--accent-ink)' : INK });
    return svg(260, 180, L(130, 50, 60, 140) + L(130, 50, 200, 140) + box(130, 44, whole) + box(60, 140, parts[0]) + box(200, 140, parts[1]));
  };

  R_.fractionBar = ({ bars = [] }) => {
    const lab = bars.some(b => b.label), x0 = lab ? 84 : 14, w = 440 - x0 - 14, h = 40; let out = '';
    bars.forEach((b, i) => {
      const y = 10 + i * 56, pw = w / b.parts;
      for (let k = 0; k < b.parts; k++) out += R(x0 + k * pw, y, pw, h, k < b.shaded ? ACC : P2, INK, 2);
      if (b.label) out += T(x0 - 12, y + h / 2, b.label, { a: 'end', size: 17 });
    });
    return svg(440, bars.length * 56 + 6, out);
  };

  R_.pie = ({ pies, parts, shaded }) => {
    pies = pies || [{ parts, shaded }];
    const r = 52; let out = '';
    pies.forEach((p, i) => {
      const cx = 66 + i * 124, cy = 64;
      if (p.parts <= 1) { out += C(cx, cy, r, p.shaded ? ACC : P2, INK, 3); return; }
      for (let k = 0; k < p.parts; k++) {
        const a1 = 90 - k * 360 / p.parts, a2 = 90 - (k + 1) * 360 / p.parts;
        const [x1, y1] = at(cx, cy, r, a1), [x2, y2] = at(cx, cy, r, a2);
        out += P(`M${cx} ${cy} L${r1(x1)} ${r1(y1)} A${r} ${r} 0 0 1 ${r1(x2)} ${r1(y2)} Z`, k < p.shaded ? ACC : P2, INK, 2.5);
      }
    });
    return svg(pies.length * 124 + 8, 130, out, (pies.length * 124 + 8) * 1.5);
  };

  R_.clock = ({ h = 3, m = 0 }) => {
    const cx = 110, cy = 110; let out = C(cx, cy, 98, P2, INK, 5);
    for (let i = 0; i < 60; i++) {
      const [x1, y1] = at(cx, cy, 92, 90 - i * 6), [x2, y2] = at(cx, cy, i % 5 ? 86 : 80, 90 - i * 6);
      out += L(x1, y1, x2, y2, INK, i % 5 ? 1.5 : 3);
    }
    for (let i = 1; i <= 12; i++) { const [x, y] = at(cx, cy, 66, 90 - i * 30); out += T(x, y + 1, i, { size: 19 }); }
    const ha = 90 - ((h % 12) + m / 60) * 30, ma = 90 - m * 6;
    const [hx, hy] = at(cx, cy, 46, ha), [mx, my] = at(cx, cy, 74, ma);
    out += L(cx, cy, hx, hy, INK, 8) + L(cx, cy, mx, my, POP, 5) + C(cx, cy, 7, INK);
    return svg(220, 220, out, 260);
  };

  R_.coins = ({ values = [] }, ctx = {}) => {
    const cur = ctx.currency || '₼'; let x = 6, y = 6, rowH = 0, out = '', maxX = 0;
    values.forEach(v => {
      const coin = v <= 2, w = coin ? 62 : 112, h = coin ? 62 : 58;
      if (x + w > 440) { x = 6; y += rowH + 10; rowH = 0; }
      if (coin) out += C(x + 31, y + 31, 29, '#f6c945', '#9a6b00', 3) + C(x + 31, y + 31, 22, 'none', '#c99a1c', 1.5) + T(x + 31, y + 32, cur + v, { size: 18, fill: '#4a3300' });
      else out += R(x, y, w, h, '#62d39a', '#1d7a4d', 3, 8) + R(x + 6, y + 6, w - 12, h - 12, 'none', '#1d7a4d', 1.5, 5) + T(x + w / 2, y + h / 2 + 1, cur + v, { size: 22, fill: '#0b3d24' });
      x += w + 10; rowH = Math.max(rowH, h); maxX = Math.max(maxX, x);
    });
    return svg(maxX, y + rowH + 6, out, maxX * 1.4);
  };

  R_.shape2d = ({ shape = 'square', dims = {} }) => {
    const F = 'color-mix(in srgb, var(--sky) 30%, transparent)';
    let out = '', W = 380, H = 240;
    const label = (x, y, s, o) => (s ? T(x, y, s, Object.assign({ size: 17, fill: ACC }, o)) : '');
    const fit = (bw, bh, maxW = 250, maxH = 150) => {
      let rw = num(bw), rh = num(bh);
      if (!(rw > 0 && rh > 0)) return [maxW, maxH * 0.8];
      let ratio = Math.min(2.8, Math.max(0.35, rw / rh));
      let w = maxW, h = w / ratio;
      if (h > maxH) { h = maxH; w = h * ratio; }
      return [w, h];
    };
    const regular = k => {
      const cx = 190, cy = 120, Rr = 95, pts = [];
      for (let i = 0; i < k; i++) { const a = Math.PI / 2 + Math.PI / k + 2 * Math.PI * i / k; pts.push([cx + Rr * Math.cos(a), cy + Rr * Math.sin(a)]); }
      return P(poly(pts), F, INK, 3.5);
    };
    switch (shape) {
      case 'square': case 'rectangle': {
        const [w, h] = shape === 'square' ? [150, 150] : fit(dims.base, dims.height);
        const x = 190 - w / 2, y = 120 - h / 2;
        out += P(poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]), F, INK, 3.5) + angleMark(x, y + h, 0, 90, 18, INK);
        out += label(190, y + h + 20, dims.base) + label(x + w + 12, 120, dims.height, { a: 'start' });
        break;
      }
      case 'parallelogram': {
        const [w, h] = fit(dims.base, dims.height, 210, 140), off = Math.min(60, w * 0.3), x = 190 - (w + off) / 2, y = 120 - h / 2;
        out += P(poly([[x + off, y], [x + off + w, y], [x + w, y + h], [x, y + h]]), F, INK, 3.5);
        if (dims.height) out += L(x + off, y, x + off, y + h, MUTED, 2, true) + angleMark(x + off, y + h, 0, 90, 14, MUTED) + label(x + off + 8, 120, dims.height, { a: 'start' });
        out += label(x + w / 2, y + h + 20, dims.base);
        break;
      }
      case 'triangle': {
        const [w, h] = fit(dims.base, dims.height, 250, 150), x = 190 - w / 2, y = 120 - h / 2, ax = x + w * 0.62;
        out += P(poly([[x, y + h], [x + w, y + h], [ax, y]]), F, INK, 3.5);
        if (dims.height) out += L(ax, y, ax, y + h, MUTED, 2, true) + angleMark(ax, y + h, 0, 90, 14, MUTED) + label(ax + 8, 120, dims.height, { a: 'start' });
        out += label(190, y + h + 20, dims.base);
        break;
      }
      case 'rightTriangle': {
        const [w, h] = fit(dims.base, dims.height, 230, 150), x = 200 - w / 2, y = 120 - h / 2;
        out += P(poly([[x, y + h], [x + w, y + h], [x, y]]), F, INK, 3.5) + angleMark(x, y + h, 0, 90, 18, INK);
        out += label(x + w / 2, y + h + 20, dims.base) + label(x - 10, 120, dims.height, { a: 'end' });
        break;
      }
      case 'trapezium': {
        const tw = num(dims.top), bw = num(dims.base), ratio = tw > 0 && bw > 0 ? Math.min(0.9, Math.max(0.25, tw / bw)) : 0.55;
        const w = 260, h = 130, t = w * ratio, x = 190 - w / 2, y = 120 - h / 2, tx = x + (w - t) * 0.4;
        out += P(poly([[tx, y], [tx + t, y], [x + w, y + h], [x, y + h]]), F, INK, 3.5);
        if (dims.height) out += L(tx, y, tx, y + h, MUTED, 2, true) + angleMark(tx, y + h, 0, 90, 14, MUTED) + label(tx + 8, 120, dims.height, { a: 'start' });
        out += label(tx + t / 2, y - 16, dims.top) + label(190, y + h + 20, dims.base);
        break;
      }
      case 'circle': case 'semicircle': {
        const cx = 190, cy = shape === 'circle' ? 120 : 160, r = 92;
        out += shape === 'circle' ? C(cx, cy, r, F, INK, 3.5) : P(`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy} Z`, F, INK, 3.5);
        out += C(cx, cy, 4, INK);
        if (dims.radius) out += L(cx, cy, cx + r, cy, POP, 3) + label(cx + r / 2, cy - 14, dims.radius);
        if (dims.diameter) out += L(cx - r, cy, cx + r, cy, POP, 3) + label(cx, cy - 14, dims.diameter);
        break;
      }
      case 'rhombus': out += P(poly([[190, 48], [330, 120], [190, 192], [50, 120]]), F, INK, 3.5); break;
      case 'kite': out += P(poly([[190, 20], [270, 90], [190, 222], [110, 90]]), F, INK, 3.5); break;
      case 'pentagon': out += regular(5); break;
      case 'hexagon': out += regular(6); break;
      case 'octagon': out += regular(8); break;
      case 'L': {
        let w = num(dims.w), h = num(dims.h), a = num(dims.a), b = num(dims.b);
        if (!(w > 0 && h > 0 && a > 0 && b > 0 && a < w && b < h)) { w = 10; h = 8; a = 4; b = 3; }
        const s = Math.min(250 / w, 170 / h), x0 = 190 - w * s / 2, y0 = 120 - h * s / 2, X = v => x0 + v * s, Y = v => y0 + v * s;
        out += P(poly([[X(0), Y(0)], [X(w - a), Y(0)], [X(w - a), Y(b)], [X(w), Y(b)], [X(w), Y(h)], [X(0), Y(h)]]), F, INK, 3.5);
        out += label(X(w / 2), Y(h) + 20, dims.w) + label(X(0) - 10, Y(h / 2), dims.h, { a: 'end' });
        out += label(X(w - a / 2), Y(b) - 14, dims.a) + label(X(w - a) + 8, Y(b / 2), dims.b, { a: 'start' });
        break;
      }
      default: out += regular(4);
    }
    return svg(W, H, out);
  };

  R_.shape3d = ({ shape = 'cube', dims = {} }) => {
    const F1 = 'color-mix(in srgb, var(--sky) 34%, transparent)', F2 = 'color-mix(in srgb, var(--sky) 20%, transparent)', F3 = 'color-mix(in srgb, var(--sky) 48%, transparent)';
    const lab = (x, y, s, o) => (s ? T(x, y, s, Object.assign({ size: 16, fill: ACC }, o)) : '');
    let out = '';
    if (shape === 'cube' || shape === 'cuboid' || shape === 'triangularPrism') {
      const w = shape === 'cube' ? 130 : 180, h = shape === 'cube' ? 130 : 110, dx = 60, dy = -44, x = 70, y = 90;
      if (shape === 'triangularPrism') {
        const A = [x, y + h], B = [x + w, y + h], Cc = [x + w / 2, y];
        out += L(A[0] + dx, A[1] + dy, B[0] + dx, B[1] + dy, MUTED, 2, true) + L(A[0], A[1], A[0] + dx, A[1] + dy, MUTED, 2, true) + L(A[0] + dx, A[1] + dy, Cc[0] + dx, Cc[1] + dy, MUTED, 2, true);
        out += P(poly([B, [B[0] + dx, B[1] + dy], [Cc[0] + dx, Cc[1] + dy], Cc]), F2, INK, 3);
        out += P(poly([A, B, Cc]), F1, INK, 3);
        out += lab(x + w / 2, y + h + 20, dims.l) + lab(B[0] + dx / 2 + 12, B[1] + dy / 2 + 8, dims.w, { a: 'start' }) + lab(x + w / 2 - 6, y + h / 2 + 18, dims.h);
      } else {
        out += L(x + dx, y + dy + h, x + dx, y + dy, MUTED, 2, true) + L(x, y + h, x + dx, y + dy + h, MUTED, 2, true) + L(x + dx, y + dy + h, x + w + dx, y + dy + h, MUTED, 2, true);
        out += P(poly([[x, y], [x + dx, y + dy], [x + w + dx, y + dy], [x + w, y]]), F3, INK, 3);
        out += P(poly([[x + w, y], [x + w + dx, y + dy], [x + w + dx, y + dy + h], [x + w, y + h]]), F2, INK, 3);
        out += P(poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]), F1, INK, 3);
        out += lab(x + w / 2, y + h + 20, dims.l) + lab(x - 10, y + h / 2, dims.h, { a: 'end' }) + lab(x + w + dx / 2 + 10, y + h + dy / 2 + 6, dims.w, { a: 'start' });
      }
      return svg(380, 240, out);
    }
    const cx = 190;
    if (shape === 'cylinder') {
      out += P(`M${cx - 80} 50 L${cx - 80} 190 A80 22 0 0 0 ${cx + 80} 190 L${cx + 80} 50`, F1, INK, 3);
      out += P(`M${cx - 80} 190 A80 22 0 0 1 ${cx + 80} 190`, 'none', MUTED, 2, ';stroke-dasharray:6 6');
      out += `<ellipse cx="${cx}" cy="50" rx="80" ry="22" style="fill:${F2};stroke:${INK};stroke-width:3"/>`;
      if (dims.r) out += L(cx, 50, cx + 80, 50, POP, 2.5) + C(cx, 50, 3.5, INK) + lab(cx + 40, 38, dims.r);
      if (dims.h) out += lab(cx + 92, 120, dims.h, { a: 'start' });
    } else if (shape === 'cone') {
      out += P(`M${cx} 24 L${cx - 85} 190 A85 24 0 0 0 ${cx + 85} 190 Z`, F1, INK, 3);
      out += P(`M${cx - 85} 190 A85 24 0 0 1 ${cx + 85} 190`, 'none', MUTED, 2, ';stroke-dasharray:6 6');
      if (dims.h) out += L(cx, 24, cx, 190, MUTED, 2, true) + lab(cx + 8, 110, dims.h, { a: 'start' });
      if (dims.r) out += L(cx, 190, cx + 85, 190, POP, 2.5) + lab(cx + 42, 178, dims.r);
    } else if (shape === 'sphere') {
      out += C(cx, 118, 95, F1, INK, 3) + `<ellipse cx="${cx}" cy="118" rx="95" ry="24" style="fill:none;stroke:${MUTED};stroke-width:2;stroke-dasharray:6 6"/>`;
    } else if (shape === 'squarePyramid') {
      const A = [cx - 100, 190], B = [cx + 60, 190], Cc = [cx + 110, 150], D = [cx - 50, 150], top = [cx + 5, 26];
      out += L(D[0], D[1], A[0], A[1], MUTED, 2, true) + L(D[0], D[1], Cc[0], Cc[1], MUTED, 2, true) + L(D[0], D[1], top[0], top[1], MUTED, 2, true);
      out += P(poly([A, B, top]), F1, INK, 3) + P(poly([B, Cc, top]), F2, INK, 3);
    }
    return svg(380, 240, out);
  };

  R_.angle = ({ mode = 'single', parts = [60], labels = [] }) => {
    let out = '';
    if (mode === 'single') {
      const d = parts[0], cx = 180, cy = d > 180 ? 170 : 170, len = 140;
      const [x2, y2] = at(cx, cy, len, d);
      out += L(cx, cy, cx + len, cy, INK, 4) + L(cx, cy, x2, y2, INK, 4) + angleMark(cx, cy, 0, d, 38);
      const [lx, ly] = at(cx, cy, d > 180 ? 62 : 64, d / 2);
      out += T(lx, ly, labels[0] || '', { size: 20, fill: ACC });
      const minY = Math.min(cy, y2) - 20, maxY = Math.max(cy, y2, d > 180 ? cy + 70 : cy) + 20;
      return `<svg viewBox="0 ${r1(minY)} 360 ${r1(maxY - minY)}" style="max-width:420px" role="img" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
    }
    if (mode === 'line' || mode === 'point') {
      const cx = 190, cy = mode === 'line' ? 170 : 150, len = mode === 'line' ? 160 : 120;
      if (mode === 'line') out += L(cx - len, cy, cx + len, cy, INK, 4);
      let cum = 0;
      parts.forEach((p, i) => {
        const a1 = cum, a2 = cum + p;
        if (mode === 'point' || i > 0) { const [x, y] = at(cx, cy, len, a1); out += L(cx, cy, x, y, INK, 4); }
        out += angleMark(cx, cy, a1, a2, i % 2 ? 46 : 34, i % 2 ? POP : ACC);
        const [lx, ly] = at(cx, cy, p < 30 ? 92 : 72, (a1 + a2) / 2);
        out += T(lx, ly, labels[i] || '', { size: 18, fill: i % 2 ? POP : ACC });
        cum = a2;
      });
      out += C(cx, cy, 4, INK);
      return mode === 'line' ? svg(380, 200, out) : svg(380, 300, out);
    }
    // triangle
    const [A, B] = parts, Cang = 180 - A - B, base = 300;
    const ac = base * Math.sin(rad(B)) / Math.sin(rad(Cang));
    let pts = [[0, 0], [base, 0], [ac * Math.cos(rad(A)), ac * Math.sin(rad(A))]];
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), maxY = Math.max(...ys);
    const s = Math.min(320 / (maxX - minX), 200 / maxY);
    pts = pts.map(p => [30 + (p[0] - minX) * s, 220 - p[1] * s]);
    out += P(poly(pts), 'color-mix(in srgb, var(--sky) 22%, transparent)', INK, 3.5);
    const ang = (p, q) => Math.atan2(-(q[1] - p[1]), q[0] - p[0]) * 180 / Math.PI;
    pts.forEach((p, i) => {
      const q1 = pts[(i + 1) % 3], q2 = pts[(i + 2) % 3];
      let a1 = ang(p, q1), a2 = ang(p, q2);
      let span = ((a2 - a1) % 360 + 360) % 360;
      if (span > 180) { [a1, a2] = [a2, a1]; span = 360 - span; }
      out += angleMark(p[0], p[1], a1, a1 + span, 26, [ACC, POP, SKY][i]);
      const [lx, ly] = at(p[0], p[1], span < 35 ? 66 : 50, a1 + span / 2);
      out += T(lx, ly, labels[i] || '', { size: 18, fill: [ACC, POP, SKY][i] });
    });
    return svg(380, 240, out);
  };

  R_.parallelLines = ({ theta = 60, labels = {} }) => {
    const y1 = 80, y2 = 190, k = 55 / Math.tan(rad(theta));
    const A = [190 + k, y1], B = [190 - k, y2];
    const dir = [Math.cos(rad(theta)), -Math.sin(rad(theta))];
    let out = L(14, y1, 366, y1, INK, 3.5) + L(14, y2, 366, y2, INK, 3.5);
    out += L(B[0] - dir[0] * 60, B[1] - dir[1] * 60, A[0] + dir[0] * 60, A[1] + dir[1] * 60, SKY, 3.5);
    [y1, y2].forEach(y => { out += P(`M52 ${y - 7} L60 ${y} L52 ${y + 7}`, 'none', INK, 2.5) + P(`M62 ${y - 7} L70 ${y} L62 ${y + 7}`, 'none', INK, 2.5); });
    const ranges = { tr: [0, theta], tl: [theta, 180], bl: [180, 180 + theta], br: [180 + theta, 360] };
    Object.entries(labels).forEach(([key, text], i) => {
      const [pt, pos] = key.split('.');
      const p = pt === 'A' ? A : B, rg = ranges[pos];
      if (!rg) return;
      const c = i % 2 ? POP : ACC;
      out += P(arc(p[0], p[1], 20, rg[0], rg[1]), 'none', c, 2.5);
      const [lx, ly] = at(p[0], p[1], 40, (rg[0] + rg[1]) / 2);
      out += T(lx, ly, text, { size: 17, fill: c });
    });
    return svg(380, 270, out);
  };

  R_.polygon = ({ n: k = 5, show, label }) => {
    const cx = 190, cy = 125, Rr = 92, pts = [];
    for (let i = 0; i < k; i++) { const a = Math.PI / 2 + Math.PI / k + 2 * Math.PI * i / k; pts.push([cx + Rr * Math.cos(a), cy + Rr * Math.sin(a)]); }
    let out = P(poly(pts), 'color-mix(in srgb, var(--sky) 24%, transparent)', INK, 3.5);
    const V = pts[1], Pv = pts[0], N = pts[2];
    const ang = (p, q) => Math.atan2(-(q[1] - p[1]), q[0] - p[0]) * 180 / Math.PI;
    if (show === 'interior') {
      let a1 = ang(V, N), a2 = ang(V, Pv), span = ((a2 - a1) % 360 + 360) % 360;
      if (span > 180) { [a1, a2] = [a2, a1]; span = 360 - span; }
      out += angleMark(V[0], V[1], a1, a1 + span, 24);
      const [lx, ly] = at(V[0], V[1], 50, a1 + span / 2);
      out += T(lx, ly, label || '', { size: 17, fill: ACC });
    } else if (show === 'exterior') {
      const d = [V[0] - Pv[0], V[1] - Pv[1]], len = Math.hypot(...d), E = [V[0] + d[0] / len * 70, V[1] + d[1] / len * 70];
      out += L(V[0], V[1], E[0], E[1], MUTED, 2.5, true);
      let a1 = ang(V, E), a2 = ang(V, N), span = ((a2 - a1) % 360 + 360) % 360;
      if (span > 180) { [a1, a2] = [a2, a1]; span = 360 - span; }
      out += angleMark(V[0], V[1], a1, a1 + span, 24, POP);
      const [lx, ly] = at(V[0], V[1], 48, a1 + span / 2);
      out += T(lx, ly, label || '', { size: 17, fill: POP });
    }
    return svg(380, 250, out);
  };

  R_.grid = ({ xmin = -5, xmax = 5, ymin = -5, ymax = 5, points = [], lines = [], segments = [], polygons = [] }) => {
    const s = Math.min(30, 380 / (xmax - xmin), 320 / (ymax - ymin)), pad = 24;
    const W = (xmax - xmin) * s + pad * 2, H = (ymax - ymin) * s + pad * 2;
    const X = x => pad + (x - xmin) * s, Y = y => pad + (ymax - y) * s;
    const every = (xmax - xmin) > 12 || (ymax - ymin) > 12 ? 2 : 1, id = 'g' + (++uid);
    let out = `<defs><clipPath id="${id}"><rect x="${X(xmin)}" y="${Y(ymax)}" width="${(xmax - xmin) * s}" height="${(ymax - ymin) * s}"/></clipPath></defs>`;
    for (let x = xmin; x <= xmax; x++) out += L(X(x), Y(ymin), X(x), Y(ymax), 'var(--line)', 1);
    for (let y = ymin; y <= ymax; y++) out += L(X(xmin), Y(y), X(xmax), Y(y), 'var(--line)', 1);
    if (ymin <= 0 && ymax >= 0) out += L(X(xmin), Y(0), X(xmax) + 8, Y(0), INK, 2.5) + arrowHead(X(xmax) + 10, Y(0), 0) + T(X(xmax) + 14, Y(0) - 12, 'x', { size: 15, a: 'start' });
    if (xmin <= 0 && xmax >= 0) out += L(X(0), Y(ymin), X(0), Y(ymax) - 8, INK, 2.5) + arrowHead(X(0), Y(ymax) - 10, 90) + T(X(0) + 12, Y(ymax) - 14, 'y', { size: 15, a: 'start' });
    const ax = ymin <= 0 && ymax >= 0 ? Y(0) : Y(ymin), ay = xmin <= 0 && xmax >= 0 ? X(0) : X(xmin);
    for (let x = xmin; x <= xmax; x++) if (x !== 0 && x % every === 0) out += T(X(x), ax + 13, n(x), { size: 11, fill: MUTED });
    for (let y = ymin; y <= ymax; y++) if (y !== 0 && y % every === 0) out += T(ay - 8, Y(y), n(y), { size: 11, fill: MUTED, a: 'end' });
    if (xmin <= 0 && xmax >= 0 && ymin <= 0 && ymax >= 0) out += T(X(0) - 8, Y(0) + 12, '0', { size: 11, fill: MUTED, a: 'end' });
    polygons.forEach((pg, i) => {
      const d = poly(pg.pts.map(([x, y]) => [X(x), Y(y)]));
      out += pg.ghost ? P(d, 'none', MUTED, 2.5, ';stroke-dasharray:6 5') : P(d, `color-mix(in srgb, ${i % 2 ? 'var(--pop)' : 'var(--sky)'} 35%, transparent)`, i % 2 ? POP : SKY, 3);
      if (pg.label) {
        const cx = pg.pts.reduce((a, p) => a + p[0], 0) / pg.pts.length, cy = pg.pts.reduce((a, p) => a + p[1], 0) / pg.pts.length;
        out += T(X(cx), Y(cy), pg.label, { size: 15 });
      }
    });
    out += `<g clip-path="url(#${id})">`;
    lines.forEach((ln, i) => {
      const c = [POP, SKY, ACC][i % 3];
      out += L(X(xmin), Y(ln.m * xmin + ln.c), X(xmax), Y(ln.m * xmax + ln.c), c, 3);
    });
    out += '</g>';
    lines.forEach((ln, i) => {
      if (!ln.label) return;
      let lx = xmax - 0.6, ly = ln.m * lx + ln.c;
      if (ly > ymax - 0.5 || ly < ymin + 0.5) { ly = ln.m >= 0 ? ymax - 0.8 : ymin + 0.8; lx = ln.m ? (ly - ln.c) / ln.m : lx; }
      out += T(X(lx) - 6, Y(ly) - 12, ln.label, { size: 14, fill: [POP, SKY, ACC][i % 3], a: 'end' });
    });
    segments.forEach(sg => { out += L(X(sg.x1), Y(sg.y1), X(sg.x2), Y(sg.y2), POP, 3.5) + C(X(sg.x1), Y(sg.y1), 5, POP) + C(X(sg.x2), Y(sg.y2), 5, POP); });
    points.forEach(p => {
      out += C(X(p.x), Y(p.y), 6, ACC, 'rgba(0,0,0,.45)', 2);
      if (p.label) out += T(X(p.x) + 9, Y(p.y) - 12, p.label, { size: 15, a: 'start', fill: ACC });
    });
    return svg(W + 12, H, out, 440);
  };

  const niceStep = (max, maxTicks = 8) => {
    for (const s of [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000]) if (max / s <= maxTicks) return s;
    return Math.ceil(max / maxTicks);
  };

  R_.barChart = ({ bars = [], step, yLabel, title }) => {
    const W = 440, H = 280, l = 52, b = 44, t = title ? 34 : 14, r = 12;
    const max = Math.max(1, ...bars.map(x => x.value)), st = step || niceStep(max), top = Math.ceil(max / st) * st;
    const ph = H - t - b, pw = W - l - r, bw = pw / bars.length;
    let out = title ? T(W / 2, 14, title, { size: 16 }) : '';
    for (let v = 0; v <= top; v += st) {
      const y = t + ph - v / top * ph;
      out += L(l, y, W - r, y, 'var(--line)', 1) + T(l - 8, y, n(v), { a: 'end', size: 13, fill: MUTED });
    }
    bars.forEach((br, i) => {
      const h = br.value / top * ph, x = l + i * bw + bw * 0.18;
      out += R(x, t + ph - h, bw * 0.64, h, CYCLE[i % CYCLE.length], 'rgba(0,0,0,.35)', 1.5, 4);
      out += T(l + i * bw + bw / 2, t + ph + 16, br.label, { size: bars.length > 6 ? 11 : 13 });
    });
    out += L(l, t, l, t + ph, INK, 2.5) + L(l, t + ph, W - r, t + ph, INK, 2.5);
    if (yLabel) out += T(14, t + ph / 2, yLabel, { size: 13, rot: -90, fill: MUTED });
    return svg(W, H, out);
  };

  R_.pictogram = ({ rows = [], symbol = '⭐', per = 1, title }) => {
    const lw = 112, s = 30, t = title ? 32 : 8; let out = title ? T(220, 14, title, { size: 16 }) : '', maxW = 0;
    rows.forEach((row, i) => {
      const y = t + i * 40, full = Math.floor(row.count / per), part = (row.count % per) / per;
      out += T(lw - 12, y + 16, row.label, { a: 'end', size: 15 }) + L(lw, y - 2, lw, y + 36, 'var(--line)', 1);
      for (let k = 0; k < full; k++) out += T(lw + 10 + k * s + s / 2, y + 17, symbol, { size: 24 });
      if (part > 0) {
        const id = 'pc' + (++uid), x = lw + 10 + full * s;
        out += `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${s * part}" height="34"/></clipPath></defs><g clip-path="url(#${id})">${T(x + s / 2, y + 17, symbol, { size: 24 })}</g>`;
      }
      maxW = Math.max(maxW, lw + 20 + (full + 1) * s);
    });
    const ky = t + rows.length * 40 + 10;
    out += T(lw, ky + 10, `Key: ${symbol} = ${per}`, { a: 'start', size: 14, fill: MUTED });
    return svg(Math.max(maxW, 300), ky + 26, out);
  };

  R_.tally = ({ rows = [] }) => {
    const lw = 112; let out = '', maxW = 0;
    rows.forEach((row, i) => {
      const y = 8 + i * 44; let x = lw + 12;
      out += T(lw - 12, y + 16, row.label, { a: 'end', size: 15 });
      for (let k = 0; k < row.count; k++) {
        if (k % 5 === 4) { out += L(x - 4 * 10 - 4, y + 26, x + 2, y + 4, ACC, 3); x += 16; }
        else { out += L(x, y + 2, x, y + 30, INK, 3); x += 10; }
      }
      maxW = Math.max(maxW, x + 10);
    });
    return svg(Math.max(maxW, 240), rows.length * 44 + 10, out);
  };

  R_.table = ({ headers = [], rows = [] }) =>
    `<div style="overflow-x:auto;max-width:100%"><table class="vt"><thead><tr>${headers.map(h => `<th>${Rich.html(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${Rich.html(typeof c === 'number' ? n(c) : c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

  R_.bag = ({ items = [] }) => {
    const balls = [];
    items.forEach(it => { for (let i = 0; i < it.count; i++) balls.push(it.color); });
    for (let i = balls.length - 1; i > 0; i--) { const j = (i * 7 + 3) % (i + 1); [balls[i], balls[j]] = [balls[j], balls[i]]; }
    let out = P('M70 70 Q40 90 40 160 Q40 230 150 230 Q260 230 260 160 Q260 90 230 70 Z', 'color-mix(in srgb, var(--accent) 22%, var(--panel2))', INK, 3);
    out += P('M80 70 Q150 50 220 70', 'none', INK, 3) + P('M110 58 Q150 30 190 58', 'none', 'var(--muted)', 4);
    const cols = balls.length > 12 ? 6 : 5;
    balls.forEach((c, i) => {
      const row = Math.floor(i / cols), col = i % cols, rowCount = Math.min(cols, balls.length - row * cols);
      const x = 150 - (rowCount - 1) * 15 + col * 30, y = 210 - row * 28;
      out += C(x, y, 13, COLORS[c] || c, 'rgba(0,0,0,.4)', 2) + T(x, y + 1, (c[0] || '').toUpperCase(), { size: 11, fill: '#111' });
    });
    return svg(300, 240, out, 300);
  };

  R_.spinner = ({ sectors = [] }) => {
    const cx = 130, cy = 120, r = 100, k = sectors.length || 1; let out = '';
    sectors.forEach((s, i) => {
      const a1 = 90 - i * 360 / k, a2 = 90 - (i + 1) * 360 / k;
      const [x1, y1] = at(cx, cy, r, a1), [x2, y2] = at(cx, cy, r, a2);
      out += k === 1 ? C(cx, cy, r, COLORS[s.color] || CYCLE[0], INK, 3)
        : P(`M${cx} ${cy} L${r1(x1)} ${r1(y1)} A${r} ${r} 0 ${360 / k > 180 ? 1 : 0} 1 ${r1(x2)} ${r1(y2)} Z`, COLORS[s.color] || s.color || CYCLE[i % CYCLE.length], INK, 2.5);
      if (s.label != null) { const [lx, ly] = at(cx, cy, r * 0.62, (a1 + a2) / 2); out += T(lx, ly, s.label, { size: 18, fill: '#111' }); }
    });
    out += P(`M${cx} ${cy} L${cx + 40} ${cy - 46}`, 'none', INK, 5) + arrowHead(cx + 42, cy - 48, 49) + C(cx, cy, 8, INK);
    return svg(260, 240, out, 280);
  };

  R_.balance = ({ left = '', right = '' }) => {
    let out = P('M190 200 L170 236 L210 236 Z', 'var(--muted)', INK, 2.5) + L(190, 200, 190, 70, INK, 4) + L(50, 70, 330, 70, INK, 5) + C(190, 70, 7, INK);
    [[90, left], [290, right]].forEach(([x, txt]) => {
      out += L(x - 50, 70, x - 60, 150, MUTED, 2) + L(x + 50, 70, x + 60, 150, MUTED, 2);
      out += P(`M${x - 72} 150 Q${x} 186 ${x + 72} 150 Z`, 'color-mix(in srgb, var(--sky) 30%, var(--panel2))', INK, 3);
      out += R(x - 66, 104, 132, 40, P2, INK, 2.5, 10) + T(x, 125, txt, { size: 19 });
    });
    return svg(380, 240, out);
  };

  R_.barModel = ({ rows = [], total }) => {
    const lw = 84, maxParts = Math.max(1, ...rows.map(r => r.parts)), bw = Math.min(64, 330 / maxParts), t = total ? 34 : 8;
    let out = '';
    rows.forEach((row, i) => {
      const y = t + i * 54;
      out += T(lw - 12, y + 21, row.label, { a: 'end', size: 15 });
      for (let k = 0; k < row.parts; k++) out += R(lw + k * bw, y, bw, 42, i % 2 ? 'color-mix(in srgb, var(--pop) 40%, var(--panel2))' : 'color-mix(in srgb, var(--sky) 40%, var(--panel2))', INK, 2.5, 4) + (row.value != null ? T(lw + k * bw + bw / 2, y + 22, row.value, { size: 14 }) : '');
    });
    if (total) {
      const w = (rows.length > 1 ? Math.max(...rows.map(r => r.parts)) : maxParts) * bw;
      out += P(`M${lw} 26 L${lw} 18 L${lw + w} 18 L${lw + w} 26`, 'none', ACC, 2.5) + T(lw + w / 2, 9, total, { size: 15, fill: ACC });
    }
    return svg(Math.max(lw + maxParts * bw + 14, 260), t + rows.length * 54, out);
  };

  R_.placeValue = ({ value = '0', highlight }) => {
    const s = String(typeof value === 'number' ? U.fmt(value).replace(/,/g, '') : value).replace('−', '-');
    const neg = s.startsWith('-'), [ip, dp = ''] = s.replace('-', '').split('.');
    const INT = ['M', 'HTh', 'TTh', 'Th', 'H', 'T', 'O'], DEC = ['t', 'h', 'th'];
    const heads = INT.slice(INT.length - ip.length).concat(dp ? ['.'] : [], DEC.slice(0, dp.length));
    const digits = [...ip, ...(dp ? ['.'] : []), ...dp];
    let di = -1;
    const cells = digits.map(d => { if (d !== '.') di++; return `<td${d !== '.' && di === highlight ? ' style="background:var(--accent);color:var(--accent-ink)"' : ''}>${d}</td>`; });
    return `<table class="vt"><thead><tr>${heads.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody><tr>${neg ? '' : ''}${cells.join('')}</tr></tbody></table>`;
  };

  R_.sequence = ({ terms = [], step }) => {
    const bw = 62, gap = 34, W = terms.length * bw + (terms.length - 1) * gap + 16; let out = '';
    terms.forEach((tm, i) => {
      const x = 8 + i * (bw + gap), q = tm === '?';
      out += R(x, 34, bw, 50, q ? ACC : P2, INK, 2.5, 12) + T(x + bw / 2, 60, tm, { size: 20, fill: q ? 'var(--accent-ink)' : INK });
      if (i < terms.length - 1) {
        out += P(`M${x + bw + 4} 46 Q${x + bw + gap / 2} 24 ${x + bw + gap - 4} 46`, 'none', POP, 2.5) + arrowHead(x + bw + gap - 4, 46, -50, POP);
        if (step) out += T(x + bw + gap / 2, 16, step, { size: 13, fill: POP });
      }
    });
    return svg(W, 92, out, Math.min(440, W * 1.3));
  };

  R_.thermometer = ({ value = 0, min = -10, max = 10 }) => {
    const top = 20, bot = 230, X = 90, Y = v => bot - (v - min) / (max - min) * (bot - top);
    const st = niceStep(max - min, 10);
    let out = R(X - 12, top - 8, 24, bot - top + 16, P2, INK, 3, 12) + C(X, bot + 26, 22, '#ff5a5f', INK, 3);
    out += R(X - 6, Y(value), 12, bot + 10 - Y(value), '#ff5a5f', 'none', 0, 4);
    for (let v = Math.ceil(min / st) * st; v <= max; v += st) {
      out += L(X + 14, Y(v), X + 24, Y(v), INK, 2) + T(X + 30, Y(v), n(v) + '°', { a: 'start', size: 13 });
    }
    return svg(180, 280, out, 200);
  };

  function render(v, ctx) {
    if (!v || !R_[v.type]) return '';
    try { return `<div class="viz">${R_[v.type](v, ctx || {})}</div>`; }
    catch (e) { console.warn('visual failed', v, e); return ''; }
  }
  return { render, types: Object.keys(R_) };
})();
