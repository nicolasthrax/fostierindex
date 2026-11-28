// Fostier Index — a field of fine jade dust.
// Hero: a drifting field with one brighter point. Services: the dust gathers into
// three forms, each level with its service row. Consultation: everything collapses
// into one bright point. The swarm flows between scenes as you scroll.
(() => {
  const root = document.documentElement;
  const canvas = document.querySelector('[data-field]');
  const veil = document.querySelector('[data-veil]');
  if (!canvas || !window.THREE) { root.classList.add('no-webgl'); return; }
  const T = window.THREE;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const light = window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;

  let renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  } catch (e) {
    root.classList.add('no-webgl');
    return;
  }
  const DPR = Math.min(window.devicePixelRatio || 1, light ? 1.5 : 2);
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x030a08, 1);

  const FOV = 35, CAM_Z = 10;
  const HALF_H = Math.tan((FOV / 2) * Math.PI / 180) * CAM_Z;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(FOV, 1, 0.1, 60);
  camera.position.set(0, 0, CAM_Z);

  /* ---- Particles ---- */
  const N = light ? 4500 : 12000;
  let seed = 20261128;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const gauss = () => {
    const u = Math.max(rnd(), 1e-6), v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const onSphere = () => {
    const z = rnd() * 2 - 1, a = rnd() * Math.PI * 2, r = Math.sqrt(1 - z * z);
    return [r * Math.cos(a), r * Math.sin(a), z];
  };

  const aHero = new Float32Array(N * 3);
  const aCluster = new Float32Array(N);
  const aOffB = new Float32Array(N * 3);
  const aOffC = new Float32Array(N * 3);
  const aRand = new Float32Array(N * 4);
  const aCurl = new Float32Array(N * 3);

  // Rebuild lattice: 6 x 4 x 4 nodes
  const LAT = [5, 4, 3], STEP = 0.36;
  const node = (i, j, k) => [(i - (LAT[0] - 1) / 2) * STEP, (j - (LAT[1] - 1) / 2) * STEP, (k - (LAT[2] - 1) / 2) * STEP];
  const RINGS = [0.28, 0.55, 0.82, 1.08];
  const ringTotal = RINGS.reduce((s, r) => s + r, 0);

  for (let i = 0; i < N; i++) {
    const i3 = i * 3;
    // Hero: a Gaussian field (in sigma units) plus a thin even scatter across the screen
    if (rnd() < 0.76) {
      aHero[i3] = gauss(); aHero[i3 + 1] = gauss(); aHero[i3 + 2] = gauss();
    } else {
      aHero[i3] = rnd() * 4.6 - 2.3; aHero[i3 + 1] = rnd() * 4.2 - 2.1; aHero[i3 + 2] = rnd() * 2.2 - 1.6;
    }

    // Services: three forms
    const k = i % 3;
    aCluster[i] = k;
    let o;
    if (k === 0) {
      // Diagnostic: you (the larger cluster) beside two smaller competitors
      const q = rnd();
      if (q < 0.6) o = [0.38 + gauss() * 0.26, gauss() * 0.26, gauss() * 0.22];
      else if (q < 0.8) o = [-0.64 + gauss() * 0.12, 0.36 + gauss() * 0.12, gauss() * 0.1];
      else o = [-0.56 + gauss() * 0.12, -0.4 + gauss() * 0.12, gauss() * 0.1];
    } else if (k === 1) {
      // Rebuild: nodes and edges of an ordered lattice
      const a = [Math.floor(rnd() * LAT[0]), Math.floor(rnd() * LAT[1]), Math.floor(rnd() * LAT[2])];
      const p = node(a[0], a[1], a[2]);
      if (rnd() < 0.45) {
        o = p.map((v) => v + gauss() * 0.012);
      } else {
        const axis = Math.floor(rnd() * 3);
        const b = a.slice();
        b[axis] = Math.min(LAT[axis] - 1, b[axis] + 1);
        const q = node(b[0], b[1], b[2]);
        const t = rnd();
        o = [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
      }
    } else {
      // Authority: concentric rings
      if (rnd() < 0.06) {
        o = [gauss() * 0.05, gauss() * 0.05, gauss() * 0.05];
      } else {
        let pick = rnd() * ringTotal, r = RINGS[0];
        for (const rr of RINGS) { if (pick < rr) { r = rr; break; } pick -= rr; }
        const a = rnd() * Math.PI * 2;
        o = [Math.cos(a) * r + gauss() * 0.015, Math.sin(a) * r + gauss() * 0.015, gauss() * 0.015];
      }
    }
    aOffB[i3] = o[0]; aOffB[i3 + 1] = o[1]; aOffB[i3 + 2] = o[2];

    // Consultation: a bright core with a fine halo
    const s = onSphere();
    const r = 0.012 + Math.pow(rnd(), 3.4) * 1.9;
    aOffC[i3] = s[0] * r; aOffC[i3 + 1] = s[1] * r; aOffC[i3 + 2] = s[2] * r * 0.6;

    const c = onSphere(), cm = 0.5 + rnd() * 0.9;
    aCurl[i3] = c[0] * cm; aCurl[i3 + 1] = c[1] * cm; aCurl[i3 + 2] = c[2] * cm;

    aRand[i * 4] = rnd();                                 // delay
    aRand[i * 4 + 1] = rnd();                             // phase
    // size: mostly fine dust; about 1 in 18 is a large, faint haze particle
    aRand[i * 4 + 2] = rnd() < 0.055 ? 16 + rnd() * 30 : 1.6 + Math.pow(rnd(), 3) * 3.4;
    aRand[i * 4 + 3] = rnd();                             // tone
  }

  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.BufferAttribute(new Float32Array(N * 3), 3)); // unused, required
  geo.setAttribute('aHero', new T.BufferAttribute(aHero, 3));
  geo.setAttribute('aCluster', new T.BufferAttribute(aCluster, 1));
  geo.setAttribute('aOffB', new T.BufferAttribute(aOffB, 3));
  geo.setAttribute('aOffC', new T.BufferAttribute(aOffC, 3));
  geo.setAttribute('aRand', new T.BufferAttribute(aRand, 4));
  geo.setAttribute('aCurl', new T.BufferAttribute(aCurl, 3));
  geo.boundingSphere = new T.Sphere(new T.Vector3(), 100);

  const U = {
    uTime: { value: 0 },
    uProg: { value: 0 },
    uPixelRatio: { value: DPR },
    uFieldCenter: { value: new T.Vector3() },
    uFieldScale: { value: new T.Vector3(1, 1, 1) },
    uC0: { value: new T.Vector3() },
    uC1: { value: new T.Vector3() },
    uC2: { value: new T.Vector3() },
    uCScale: { value: 0.6 },
    uPoint: { value: new T.Vector3() },
    uMouse: { value: new T.Vector2(9, 9) },
    uAspect: { value: 1 },
    uRepel: { value: 0 },
    uDeep: { value: new T.Color(0x14634a) },
    uJade: { value: new T.Color(0x2fb487) },
    uPale: { value: new T.Color(0xc9f3e2) },
  };

  const material = new T.ShaderMaterial({
    uniforms: U,
    transparent: true,
    depthWrite: false,
    blending: T.AdditiveBlending,
    vertexShader: `
      attribute vec3 aHero; attribute float aCluster; attribute vec3 aOffB; attribute vec3 aOffC;
      attribute vec4 aRand; attribute vec3 aCurl;
      uniform float uTime, uProg, uPixelRatio, uCScale, uAspect, uRepel;
      uniform vec3 uFieldCenter, uFieldScale, uC0, uC1, uC2, uPoint, uDeep, uJade, uPale;
      uniform vec2 uMouse;
      varying float vAlpha; varying vec3 vColor;

      float ease(float x) { x = clamp(x, 0.0, 1.0); return x * x * x * (x * (x * 6.0 - 15.0) + 10.0); }
      mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

      void main() {
        float delay = aRand.x, ph = aRand.y * 6.2831853;

        // Hero field, turning slowly
        vec3 h = aHero;
        h.xz = rot(uTime * 0.035) * h.xz;
        vec3 A = uFieldCenter + h * uFieldScale;

        // Service forms
        vec3 o = aOffB, center;
        if (aCluster < 0.5) {
          center = uC0;
        } else if (aCluster < 1.5) {
          center = uC1;
          o.xz = rot(uTime * 0.16) * o.xz;
          o.yz = rot(0.38) * o.yz;
        } else {
          center = uC2;
          float r = length(o.xy);
          o.xy *= 1.0 + 0.07 * sin(uTime * 1.3 - r * 5.5);
          o.yz = rot(1.05) * o.yz;
        }
        vec3 B = center + o * uCScale;

        // One point
        vec3 C = uPoint + aOffC * (1.0 + 0.06 * sin(uTime * 0.8 + ph));

        // The swarm flows: per-particle delay and a curved path
        float e0 = ease(uProg * 1.6 - delay * 0.6);
        float e1 = ease((uProg - 1.0) * 1.6 - delay * 0.6);
        vec3 p = mix(A, B, e0);
        p = mix(p, C, e1);
        p += aCurl * (sin(e0 * 3.14159) + sin(e1 * 3.14159)) * 0.85;

        float amp = mix(mix(0.2, 0.03, e0), 0.015, e1);
        p += vec3(sin(uTime * 0.31 + ph), cos(uTime * 0.27 + ph * 1.3), sin(uTime * 0.23 + ph * 0.7)) * amp;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);

        // Part around the pointer, in screen space
        vec4 clip = projectionMatrix * mv;
        vec2 d = clip.xy / clip.w - uMouse;
        d.x *= uAspect;
        float dist = length(d);
        float push = uRepel * smoothstep(0.3, 0.0, dist);
        if (dist > 0.0001) mv.xy += (d / dist) * push * 0.05 * -mv.z;

        gl_Position = projectionMatrix * mv;
        gl_PointSize = aRand.z * uPixelRatio * (9.0 / -mv.z);

        float depthFade = smoothstep(24.0, 7.5, -mv.z);
        float haze = step(10.0, aRand.z);
        vAlpha = (0.45 + 0.55 * fract(aRand.w * 7.31)) * depthFade * mix(1.0, 0.6, e1) * mix(1.0, 0.045, haze)
               * (1.0 + 0.35 * e0 * (1.0 - e1));
        vColor = mix(mix(uDeep, uJade, smoothstep(0.0, 0.55, aRand.w)), uPale, smoothstep(0.6, 1.0, aRand.w));
      }
    `,
    fragmentShader: `
      varying float vAlpha; varying vec3 vColor;
      void main() {
        float r = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, r);
        gl_FragColor = vec4(vColor, a * a * vAlpha);
      }
    `,
  });
  const points = new T.Points(geo, material);
  points.frustumCulled = false;
  scene.add(points);

  /* ---- The one brighter point ---- */
  const glowTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(0.12, 'rgba(255,255,255,.8)');
    r.addColorStop(0.35, 'rgba(255,255,255,.18)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
    return new T.CanvasTexture(c);
  })();
  const halo = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0x7cf0c4, transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false }));
  const core = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xeafff6, transparent: true, opacity: 1, blending: T.AdditiveBlending, depthWrite: false }));
  scene.add(halo, core);

  /* ---- Layout: where each form sits, from the live page ---- */
  const scenes = [...document.querySelectorAll('[data-scene]')];
  const rows = [...document.querySelectorAll('.menu li')];
  const svcBody = document.querySelector('.services-body');
  const services = document.querySelector('.services');
  const consult = document.querySelector('.consult');
  const panel = document.querySelector('.panel');
  let W = 0, H = 0, halfW = 0, wide = true;
  const toWorld = (x, y, out) => out.set((x / W * 2 - 1) * halfW, -(y / H * 2 - 1) * HALF_H, 0);
  const hint0 = new T.Vector3();

  const layout = () => {
    // Service forms
    if (wide && svcBody && rows.length === 3) {
      const left = svcBody.getBoundingClientRect().left;
      let rowH = 0;
      [U.uC0, U.uC1, U.uC2].forEach((u, i) => {
        const r = rows[i].getBoundingClientRect();
        rowH += r.height / 3;
        toWorld(left * 0.5, r.top + r.height / 2, u.value);
      });
      U.uCScale.value = Math.min(1.0, Math.max(0.4, (rowH / H) * 2 * HALF_H * 0.54));
    } else if (services) {
      const top = services.getBoundingClientRect().top + H * 0.19;
      [U.uC0, U.uC1, U.uC2].forEach((u, i) => toWorld(W * (0.2 + 0.3 * i), top, u.value));
      U.uCScale.value = (W / 3 / W) * halfW * 0.62;
    }
    // Final point
    if (wide && panel) {
      const r = panel.getBoundingClientRect();
      toWorld((r.right + W) / 2, Math.min(H * 0.72, Math.max(H * 0.28, r.top + r.height * 0.45)), U.uPoint.value);
    } else if (consult) {
      toWorld(W / 2, consult.getBoundingClientRect().top + H * 0.15, U.uPoint.value);
    }
  };

  /* ---- Scroll ---- */
  let tops = [];
  let target = 0, prog = 0;
  const measure = () => { tops = scenes.map((s) => s.getBoundingClientRect().top + window.scrollY); };
  const readScroll = () => {
    const vh = window.innerHeight;
    const a = window.scrollY + vh * 0.75;
    let p = 0;
    for (let i = 1; i < tops.length; i++) p += Math.min(1, Math.max(0, (a - tops[i]) / (vh * 0.6)));
    target = p;
  };

  /* ---- Pointer ---- */
  const mouse = new T.Vector2(9, 9);
  let repelTarget = 0, lastMove = 0, px = 0, py = 0;
  window.addEventListener('pointermove', (e) => {
    mouse.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    px = mouse.x; py = mouse.y;
    repelTarget = 1;
    lastMove = performance.now();
  }, { passive: true });
  document.addEventListener('pointerleave', () => { repelTarget = 0; });

  /* ---- Frame ---- */
  const ease = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * x * (x * (x * 6 - 15) + 10); };
  const tmp = new T.Vector3(), tmpB = new T.Vector3();
  let cx = 0, cy = 0;
  const render = (t) => {
    layout();
    U.uTime.value = t;
    U.uProg.value = prog;

    // pointer: follow smoothly; let the dust settle back when the pointer rests
    if (performance.now() - lastMove > 1400) repelTarget = 0;
    U.uMouse.value.lerp(mouse, 0.2);
    U.uRepel.value += (repelTarget - U.uRepel.value) * 0.06;
    cx += (px * 0.25 - cx) * 0.04;
    cy += (py * 0.15 - cy) * 0.04;
    camera.position.set(cx, cy, CAM_Z);
    camera.lookAt(0, 0, 0);

    // the brighter point follows the same three states
    const e0 = ease(prog * 1.6 - 0.18), e1 = ease((prog - 1) * 1.6 - 0.18);
    tmp.copy(hint0);
    tmpB.copy(U.uC0.value).addScaledVector(new T.Vector3(0.38, 0, 0), U.uCScale.value);
    tmp.lerp(tmpB, e0).lerp(U.uPoint.value, e1);
    halo.position.copy(tmp);
    core.position.copy(tmp);
    const pulse = 1 + Math.sin(t * 1.7) * 0.12;
    const big = 1 + e1 * 1.6;
    halo.scale.setScalar(0.9 * pulse * big);
    core.scale.setScalar(0.22 * pulse * (1 + e1 * 0.8));

    if (veil) veil.style.opacity = (wide ? 0 : Math.min(prog, 1) * 0.28).toFixed(3);
    renderer.render(scene, camera);
  };

  let running = false, clock = 0, last = 0;
  const loop = (now) => {
    if (!running) return;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    clock += dt;
    prog += (target - prog) * Math.min(1, dt * 3.2);
    render(clock);
    requestAnimationFrame(loop);
  };
  const start = () => {
    if (running || reduce) return;
    running = true;
    last = 0;
    requestAnimationFrame(loop);
  };

  /* ---- Size ---- */
  const resize = () => {
    W = canvas.clientWidth; H = canvas.clientHeight;
    if (!W || !H) return;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    halfW = HALF_H * camera.aspect;
    U.uAspect.value = camera.aspect;
    wide = W >= 960;
    if (W / H >= 0.85) {
      U.uFieldCenter.value.set(0.24 * halfW, 0.12 * HALF_H, 0);
      U.uFieldScale.value.set(0.3 * halfW, 0.36 * HALF_H, 1.7);
      hint0.set(0.34 * halfW, 0.24 * HALF_H, 1.2);
    } else {
      U.uFieldCenter.value.set(0, 0.34 * HALF_H, 0);
      U.uFieldScale.value.set(0.62 * halfW, 0.34 * HALF_H, 1.6);
      hint0.set(0.28 * halfW, 0.42 * HALF_H, 1.0);
    }
    measure();
    readScroll();
    if (!running) { prog = target; render(reduce ? 0 : clock); }
  };

  window.addEventListener('scroll', () => {
    readScroll();
    if (reduce) { prog = target; render(0); }
  }, { passive: true });
  resize();
  new ResizeObserver(resize).observe(document.body);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); readScroll(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) running = false;
    else start();
  });
  start();
})();
