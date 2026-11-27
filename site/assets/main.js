// Fostier Index — hero citation orbit + "ask an AI" before/after demo.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
   * Citation orbit: websites circle an AI engine. A question is typed,
   * a pulse goes out, and three sources get cited. One is always you.
   * ------------------------------------------------------------------ */
  const wrap = document.querySelector('[data-orbit]');
  if (wrap) {
    const canvas = wrap.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const qBox = wrap.querySelector('.orbit-q');
    const qText = wrap.querySelector('[data-orbit-query]');
    const queries = JSON.parse(wrap.dataset.queries || '[]');
    const youLabel = wrap.dataset.you || 'You';

    const COL = { cobalt: '#213C9E', ink: '#0F1B4D', glaze: '#A9BBE6', marigold: '#FFB31A', paper: '#F8FAFD' };
    const FONT = '"Hanken Grotesk", "Noto Sans TC", system-ui, sans-serif';
    const TAU = Math.PI * 2;
    const spark = new Path2D('M12 2C12.6 7.4 16.6 11.4 22 12C16.6 12.6 12.6 16.6 12 22C11.4 16.6 7.4 12.6 2 12C7.4 11.4 11.4 7.4 12 2Z');

    let seed = 20261128;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

    const RINGS = [0.36, 0.52, 0.68, 0.84];
    const ringSpeed = (i) => (i % 2 ? -1 : 1) * (0.05 - i * 0.008); // rad/s, alternating
    const dots = [];
    RINGS.forEach((r, i) => {
      const n = Math.round(8 + r * 50);
      for (let k = 0; k < n; k++) {
        dots.push({
          r, ring: i,
          a0: (k / n) * TAU + rnd() * 0.3,
          dr: (rnd() - 0.5) * 0.06,
          speed: ringSpeed(i),
          size: 1.2 + rnd() * 2,
          alpha: 0.28 + rnd() * 0.6,
        });
      }
    });
    const you = { r: RINGS[2], ring: 2, a0: -2.3, dr: 0, speed: ringSpeed(2), size: 6, alpha: 1, you: true };
    dots.push(you);

    let W = 0, R = 0, cx = 0, cy = 0;
    let elapsed = 0;          // seconds of motion (only advances while visible)
    let cycleStart = 0;
    let qIndex = 0;
    let targets = [];
    let running = false;
    let last = 0;

    const angle = (d) => d.a0 + d.speed * elapsed;
    const pos = (d) => {
      const a = angle(d), rr = (d.r + d.dr) * R;
      return { x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr, a };
    };
    const angDist = (a, b) => {
      const d = Math.abs(((a - b) % TAU + TAU) % TAU);
      return Math.min(d, TAU - d);
    };
    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const ease = (t) => 1 - Math.pow(1 - clamp01(t), 3);

    const pickTargets = () => {
      const ya = angle(you);
      const bottom = Math.PI / 2; // query pill sits at the bottom
      const ok = (d) => !d.you && d.size > 2.2 && d.ring !== 3 && angDist(angle(d), ya) > 1 && angDist(angle(d), bottom) > 0.7;
      const pool = dots.filter(ok);
      const t1 = pool[Math.floor(rnd() * pool.length)];
      const pool2 = pool.filter((d) => angDist(angle(d), angle(t1)) > 1);
      const t2 = pool2[Math.floor(rnd() * pool2.length)] || pool[0];
      targets = [you, t1, t2];
    };

    const resize = () => {
      const w = wrap.clientWidth;
      if (!w) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(w * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = w; R = w * 0.47; cx = cy = w / 2;
      if (!running) draw(reduce ? 4.5 : (elapsed - cycleStart));
    };

    // Timeline of one cycle, in seconds
    const T = { type: 1.5, pulse: 1.6, link: 2.0, label: 2.7, fade: 6.4, end: 7.4 };

    const roundRect = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, W, W);
      if (!W) return;
      const s = W / 640; // scale factor for strokes
      const ts = Math.min(1.1, Math.max(0.9, s)); // labels stay legible on phones

      const fadeOut = 1 - ease((t - T.fade) / (T.end - T.fade - 0.2));
      const hold = clamp01((t - T.link) / 0.6) * fadeOut;

      // Dial: ticks on the outer rim, like a porcelain plate border
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = COL.glaze;
      for (let i = 0; i < 144; i++) {
        const a = (i / 144) * TAU;
        const long = i % 12 === 0;
        const r1 = R * (long ? 0.925 : 0.955), r2 = R * 0.985;
        ctx.lineWidth = (long ? 1.6 : 1) * s;
        ctx.globalAlpha = long ? 0.95 : 0.6;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
        ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // Rings
      RINGS.forEach((r, i) => {
        ctx.beginPath();
        ctx.lineWidth = 1 * s;
        ctx.setLineDash(i === 3 ? [2 * s, 6 * s] : []);
        ctx.globalAlpha = i === 3 ? 0.9 : 0.55;
        ctx.arc(0, 0, r * R, 0, TAU);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.restore();

      // Dots (websites)
      const dim = 1 - 0.5 * hold;
      for (const d of dots) {
        if (d.you) continue;
        const p = pos(d);
        const isT = targets.includes(d);
        ctx.globalAlpha = isT ? Math.max(d.alpha, hold) : d.alpha * dim;
        ctx.fillStyle = COL.cobalt;
        ctx.beginPath();
        ctx.arc(p.x, p.y, (isT ? d.size + 1.4 * hold : d.size) * s, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Pulse from the centre
      const pt = (t - T.pulse) / 1.1;
      if (pt > 0 && pt < 1) {
        ctx.beginPath();
        ctx.strokeStyle = COL.cobalt;
        ctx.lineWidth = 1.5 * s;
        ctx.globalAlpha = (1 - pt) * 0.6;
        ctx.arc(cx, cy, R * (0.12 + 0.8 * ease(pt)), 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Links from engine to cited sources
      targets.forEach((d, i) => {
        const prog = ease((t - T.link - i * 0.2) / 0.9);
        if (prog <= 0) return;
        const p = pos(d);
        const dx = p.x - cx, dy = p.y - cy, len = Math.hypot(dx, dy) || 1;
        const bend = len * 0.2 * (i % 2 ? -1 : 1);
        const qx = (cx + p.x) / 2 - (dy / len) * bend, qy = (cy + p.y) / 2 + (dx / len) * bend;
        ctx.beginPath();
        const steps = 40;
        for (let k = 0; k <= steps * prog; k++) {
          const u = k / steps, v = 1 - u;
          const x = v * v * cx + 2 * v * u * qx + u * u * p.x;
          const y = v * v * cy + 2 * v * u * qy + u * u * p.y;
          k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.globalAlpha = fadeOut;
        ctx.strokeStyle = d.you ? COL.marigold : COL.cobalt;
        ctx.lineWidth = (d.you ? 3 : 1.6) * s;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // You: marigold dot with a soft halo
      {
        const p = pos(you);
        const breathe = 0.5 + 0.5 * Math.sin(elapsed * 2.2);
        ctx.fillStyle = COL.marigold;
        ctx.globalAlpha = 0.22 + 0.2 * hold + 0.08 * breathe;
        ctx.beginPath();
        ctx.arc(p.x, p.y, (14 + 6 * hold + 2 * breathe) * s, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, you.size * s, 0, TAU);
        ctx.fill();
        ctx.lineWidth = 1.6 * s;
        ctx.strokeStyle = COL.ink;
        ctx.stroke();
      }

      // Engine at the centre
      ctx.beginPath();
      ctx.fillStyle = COL.cobalt;
      ctx.arc(cx, cy, R * 0.1, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.strokeStyle = COL.cobalt;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1 * s;
      ctx.arc(cx, cy, R * 0.15, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.save();
      const k = (R * 0.1) / 15;
      ctx.translate(cx - 12 * k, cy - 12 * k);
      ctx.scale(k, k);
      ctx.fillStyle = COL.paper;
      ctx.fill(spark);
      ctx.restore();

      // Citation labels [1] [2] [3]
      targets.forEach((d, i) => {
        const la = ease((t - T.label - i * 0.18) / 0.4) * fadeOut;
        if (la <= 0) return;
        const p = pos(d);
        const ox = Math.cos(p.a), oy = Math.sin(p.a);
        const off = (d.you ? 22 : 16) * ts;
        const bx = p.x + ox * off, by = p.y + oy * off;
        const chip = 22 * ts;
        ctx.globalAlpha = la;
        ctx.font = `600 ${Math.round(12 * ts * 10) / 10}px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (d.you) {
          // chip + name pill, laid out away from the centre
          ctx.font = `600 ${Math.round(13 * ts * 10) / 10}px ${FONT}`;
          const tw = ctx.measureText(youLabel).width;
          const pw = tw + 20 * ts, ph = 26 * ts, gap = 6 * ts;
          const total = chip + gap + pw;
          let x0 = ox >= 0 ? bx - chip / 2 : bx - total + chip / 2;
          const y0 = by - ph / 2;
          x0 = Math.max(4, Math.min(W - total - 4, x0));
          roundRect(x0, by - chip / 2, chip, chip, 7 * ts);
          ctx.fillStyle = COL.marigold; ctx.fill();
          ctx.lineWidth = 1.4 * ts; ctx.strokeStyle = COL.ink; ctx.stroke();
          ctx.fillStyle = COL.ink;
          ctx.fillText('1', x0 + chip / 2, by + 0.5 * s);
          roundRect(x0 + chip + gap, y0, pw, ph, ph / 2);
          ctx.fillStyle = COL.ink; ctx.fill();
          ctx.fillStyle = COL.paper;
          ctx.fillText(youLabel, x0 + chip + gap + pw / 2, by + 0.5 * s);
        } else {
          roundRect(bx - chip / 2, by - chip / 2, chip, chip, 7 * ts);
          ctx.fillStyle = COL.cobalt; ctx.fill();
          ctx.fillStyle = COL.paper;
          ctx.fillText(String(i + 1), bx, by + 0.5 * s);
        }
        ctx.globalAlpha = 1;
      });
    };

    // Typing the question in the pill
    let shown = -1;
    const setQuery = (t) => {
      const q = Array.from(queries[qIndex % queries.length] || '');
      const n = reduce ? q.length : Math.min(q.length, Math.ceil(q.length * clamp01(t / T.type)));
      if (n !== shown) {
        qText.textContent = q.slice(0, n).join('') || ' ';
        shown = n;
      }
      qBox.classList.toggle('typing', !reduce && t < T.type + 0.6);
      qText.style.opacity = t > T.fade ? '0.35' : '1';
    };

    const frame = (now) => {
      if (!running) return;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      elapsed += dt;
      let t = elapsed - cycleStart;
      if (t > T.end) {
        cycleStart = elapsed;
        qIndex++;
        shown = -1;
        pickTargets();
        t = 0;
      }
      setQuery(t);
      draw(t);
      requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || reduce) return;
      running = true;
      last = 0;
      requestAnimationFrame(frame);
    };
    const stop = () => { running = false; };

    pickTargets();
    resize();
    if (reduce) setQuery(T.type);

    new ResizeObserver(resize).observe(wrap);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!running) resize(); });

    let inView = true;
    new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      inView && !document.hidden ? start() : stop();
    }).observe(wrap);
    document.addEventListener('visibilitychange', () => (inView && !document.hidden ? start() : stop()));
  }

  /* ------------------------------------------------------------------
   * Ask an AI: industry chips change the question; the switch shows the
   * answer before and after a rebuild, with sources re-ranking in place.
   * ------------------------------------------------------------------ */
  const fig = document.querySelector('[data-answer]');
  if (fig) {
    const list = fig.querySelector('[data-sources]');
    const q = fig.querySelector('[data-answer-q]');
    const sw = document.querySelector('[data-switch]');
    const chips = document.querySelectorAll('[data-chip]');

    chips.forEach((chip) =>
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
        q.textContent = chip.dataset.q;
      })
    );

    sw.addEventListener('click', () => {
      const on = sw.getAttribute('aria-checked') !== 'true';
      const items = [...list.children];
      const before = new Map(items.map((el) => [el, el.getBoundingClientRect().top]));
      sw.setAttribute('aria-checked', String(on));
      fig.dataset.state = on ? 'after' : 'before';
      if (reduce) return;
      items.forEach((el) => {
        const dy = before.get(el) - el.getBoundingClientRect().top;
        if (Math.abs(dy) < 1) return;
        el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], {
          duration: 560,
          easing: 'cubic-bezier(.2,.7,.2,1)',
        });
      });
    });
  }
})();
