// Primary buttons: on hover (or keyboard focus) a slim jade line makes one lap of the
// button's outline at an even pace, then fades. The outline is drawn to the button's
// real size, so the line moves at the same speed along straight edges and round ends.
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const PAD = 5; // gap between the button and the line, in px

  const pill = (w, h, s) => {
    const r = h / 2 - s;
    const l = h / 2, rgt = w - h / 2;
    return `M${l} ${s}H${rgt}A${r} ${r} 0 0 1 ${rgt} ${h - s}H${l}A${r} ${r} 0 0 1 ${l} ${s}Z`;
  };

  document.querySelectorAll('.btn:not(.btn-quiet)').forEach((btn) => {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'orbit');
    svg.setAttribute('aria-hidden', 'true');
    const tail = document.createElementNS(NS, 'path');
    const head = document.createElementNS(NS, 'path');
    tail.setAttribute('class', 'orbit-tail');
    head.setAttribute('class', 'orbit-head');
    for (const p of [tail, head]) p.setAttribute('pathLength', '100');
    svg.append(tail, head);
    btn.append(svg);

    const run = () => {
      const w = btn.offsetWidth + PAD * 2, h = btn.offsetHeight + PAD * 2;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      const d = pill(w, h, 0.75);
      tail.setAttribute('d', d);
      head.setAttribute('d', d);
      svg.classList.remove('run');
      void svg.getBoundingClientRect(); // restart the animation on every hover
      svg.classList.add('run');
    };
    btn.addEventListener('pointerenter', run);
    btn.addEventListener('focus', () => { if (btn.matches(':focus-visible')) run(); });
  });
})();
