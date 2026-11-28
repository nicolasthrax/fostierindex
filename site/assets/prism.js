// Fostier Index — the obsidian prism.
// Faint rays (the web's sources) flow into a dark glass prism; one jade beam
// leaves it and lands on "Your firm", cited as source [1]. The prism stays
// behind the page and the camera moves to a new view for each scene.
(() => {
  const root = document.documentElement;
  const canvas = document.querySelector('[data-prism]');
  const veil = document.querySelector('[data-veil]');
  const labels = document.querySelector('[data-labels]');
  if (!canvas || !window.THREE) { root.classList.add('no-webgl'); return; }
  const T = window.THREE;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const light = window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;

  let renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    root.classList.add('no-webgl');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, light ? 1.5 : 2));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const BG = 0x030a08;
  const JADE = 0x2fb487;
  const JADE_HI = 0x7cf0c4;
  const scene = new T.Scene();
  scene.background = new T.Color(BG);
  scene.fog = new T.Fog(BG, 9, 21);
  const camera = new T.PerspectiveCamera(30, 1, 0.1, 100);

  /* ---- Studio environment: light strips the obsidian reflects ---- */
  const pmrem = new T.PMREMGenerator(renderer);
  const env = new T.Scene();
  const softbox = (w, h, hex, k, x, y, z) => {
    const m = new T.Mesh(
      new T.PlaneGeometry(w, h),
      new T.MeshBasicMaterial({ color: new T.Color(hex).multiplyScalar(k), side: T.DoubleSide })
    );
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  softbox(0.7, 14, 0xffffff, 3.2, -9, 2, -6);  // thin white strip, back left
  softbox(0.9, 14, 0x6fe0b6, 3.2, 9, 1, -6);   // thin jade strip, back right
  softbox(9, 9, 0xdff5ec, 0.9, 0, 11, 1);      // overhead
  softbox(7, 2.2, 0xffffff, 2.2, -6, 5, 6);    // key, front left
  softbox(1.4, 9, 0x6fe0b6, 2.4, 8, 0, 4);     // jade, front right
  softbox(12, 1.4, 0xbfe9d8, 0.8, 0, -7, 4);   // floor bounce
  scene.environment = pmrem.fromScene(env, 0.035).texture;

  /* ---- Textures drawn in code ---- */
  const tex = (w, h, paint) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    paint(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c);
    t.encoding = T.sRGBEncoding;
    return t;
  };
  const glowTex = tex(128, 128, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(0.18, 'rgba(255,255,255,.55)');
    r.addColorStop(0.5, 'rgba(255,255,255,.12)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, w, h);
  });
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  // u runs across the strip, v along it (v=0 at the start point, 1 at the end).
  const strip = (along) => tex(32, 128, (g, w, h) => {
    const img = g.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      const v = 1 - y / (h - 1);
      const av = along(v);
      for (let x = 0; x < w; x++) {
        const u = (x / (w - 1) - 0.5) * 2;
        const a = Math.min(1, Math.exp(-u * u * 22) + 0.3 * Math.exp(-u * u * 3.5)) * av;
        const i = (y * w + x) * 4;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
        img.data[i + 3] = Math.round(a * 255);
      }
    }
    g.putImageData(img, 0, 0);
  });
  const rayTex = strip((v) => Math.pow(v, 1.5) * (1 - ss(0.97, 1, v)));
  const beamTex = strip((v) => ss(0, 0.04, v) * (1 - 0.3 * v) * (1 - ss(0.92, 1, v)));

  const additive = (map, color, opacity) => {
    const m = new T.MeshBasicMaterial({
      map, color, transparent: true, opacity, blending: T.AdditiveBlending,
      depthWrite: false, side: T.DoubleSide, fog: false,
    });
    m.userData.base = opacity;
    return m;
  };
  const UP = new T.Vector3(0, 1, 0);
  const strand = (a, b, width, mat) => {
    const dir = new T.Vector3().subVectors(b, a);
    const len = dir.length();
    dir.normalize();
    const geo = new T.PlaneGeometry(width, len);
    const g = new T.Group();
    for (let i = 0; i < 2; i++) {
      const m = new T.Mesh(geo, mat);
      m.rotation.y = (i * Math.PI) / 2;
      g.add(m);
    }
    g.position.copy(a).add(b).multiplyScalar(0.5);
    g.quaternion.setFromUnitVectors(UP, dir);
    return g;
  };
  const sprite = (color, opacity, scale) => {
    const s = new T.Sprite(new T.SpriteMaterial({
      map: glowTex, color, transparent: true, opacity, blending: T.AdditiveBlending, depthWrite: false, fog: false,
    }));
    s.material.userData.base = opacity;
    s.scale.setScalar(scale);
    return s;
  };

  /* ---- The prism ---- */
  const rig = new T.Group();
  scene.add(rig);
  const pivot = new T.Group();
  rig.add(pivot);
  const prismGeo = new T.CylinderGeometry(1.1, 1.1, 3.8, 3, 1);
  const prism = new T.Mesh(prismGeo, new T.MeshPhysicalMaterial({
    color: 0x030806, roughness: 0.32, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.025,
    envMapIntensity: 1.6, flatShading: true,
  }));
  prism.rotation.y = -0.32;
  prism.add(new T.LineSegments(
    new T.EdgesGeometry(prismGeo),
    new T.LineBasicMaterial({ color: JADE_HI, transparent: true, opacity: 0.3, blending: T.AdditiveBlending, depthWrite: false })
  ));
  pivot.add(prism);
  pivot.rotation.set(0.06, 0, -0.12);

  // The light paths light the glass: white where the rays enter, jade where the beam leaves.
  const keyIn = new T.PointLight(0xe6fff4, 3.2, 7, 2);
  keyIn.position.set(-1.9, 0.6, 1.9);
  rig.add(keyIn);
  const keyOut = new T.PointLight(0x5fe0ae, 4.2, 7, 2);
  keyOut.position.set(2.0, 1.4, 1.6);
  rig.add(keyOut);
  const topLight = new T.DirectionalLight(0xcfeee2, 0.35);
  topLight.position.set(-1, 6, 2);
  rig.add(topLight);

  const backGlow = sprite(JADE, 0.42, 10);
  backGlow.position.set(0, 0.4, -3.5);
  rig.add(backGlow);

  /* ---- Floor: dark lacquer with a pool of jade light ---- */
  const floor = new T.Mesh(
    new T.PlaneGeometry(60, 60),
    new T.MeshStandardMaterial({ color: 0x06120e, roughness: 0.28, metalness: 0.7, envMapIntensity: 0.5 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.2;
  scene.add(floor);
  const pool = new T.Mesh(new T.PlaneGeometry(1, 1), additive(glowTex, JADE, 0.32));
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = -2.19;
  scene.add(pool);

  /* ---- Dust in the light ---- */
  const DUST = light ? 160 : 460;
  const dustPos = new Float32Array(DUST * 3);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = rnd() * 18 - 9;
    dustPos[i * 3 + 1] = rnd() * 8 - 2.2;
    dustPos[i * 3 + 2] = rnd() * 10 - 6;
  }
  const dustGeo = new T.BufferGeometry();
  dustGeo.setAttribute('position', new T.BufferAttribute(dustPos, 3));
  scene.add(new T.Points(dustGeo, new T.PointsMaterial({
    map: glowTex, color: 0xbfeedd, size: 0.07, transparent: true, opacity: 0.55,
    blending: T.AdditiveBlending, depthWrite: false,
  })));

  /* ---- Views: one per scene (hero, services, consultation) ---- */
  // Hero positions are given in world space; the light paths are built from them
  // in rig space so they travel with the prism into the later views.
  const VIEWS = {
    wide: {
      query: [-3.6, 3.15, 0.4], cite: [4.0, 3.0, 0.4],
      rays: { x: [-7, -2.4], y: [2.4, 4.4], z: [-2.5, 1.2] },
      keys: [
        { cam: [0, 2.3, 12.5], look: [0, 0.75, 0], rig: [1.75, 1.15, 0], rotY: 0, scale: 0.94, rays: 1, tags: 1, beam: 1, veil: 0, glow: 0.42 },
        { cam: [0, 1.6, 12], look: [0, 0.9, 0], rig: [-3.3, 0.85, -1], rotY: 0.7, scale: 1, rays: 0.2, tags: 0, beam: 0.9, veil: 0.12, glow: 0.5 },
        { cam: [0, 2.4, 12.5], look: [0, 0.9, 0], rig: [3.0, 0.95, -1.2], rotY: -0.45, scale: 1, rays: 0, tags: 0, beam: 0.55, veil: 0.08, glow: 0.45 },
      ],
    },
    tall: {
      query: [-0.05, 4.5, 0.4], cite: [1.05, 3.4, 0.4],
      rays: { x: [-3.4, -1.2], y: [3.6, 5.6], z: [-2, 1] },
      keys: [
        { cam: [0, 3.0, 15], look: [0, 1.5, 0], rig: [-0.15, 2.0, 0], rotY: 0, scale: 0.62, rays: 1, tags: 1, beam: 1, veil: 0, glow: 0.42 },
        { cam: [0, 3.0, 15], look: [0, 1.5, 0], rig: [0.1, 3.3, -1.5], rotY: 0.7, scale: 0.5, rays: 0.15, tags: 0, beam: 0.9, veil: 0.4, glow: 0.45 },
        { cam: [0, 3.0, 15], look: [0, 1.5, 0], rig: [0.1, 3.4, -1.5], rotY: -0.45, scale: 0.5, rays: 0, tags: 0, beam: 0.55, veil: 0.35, glow: 0.45 },
      ],
    },
  };

  const lightGroup = new T.Group();
  rig.add(lightGroup);
  const rays = [];
  const pulses = [];
  const rayMats = [];
  const beamMats = [];
  const flares = [];
  const anchors = { query: new T.Vector3(), cite: new T.Vector3() };
  const ENTRY = new T.Vector3(-0.55, 0.3, 0.62);
  const EXIT = new T.Vector3(0.62, 0.75, 0.55);
  let view = null, viewName = '';

  const buildLight = (V) => {
    lightGroup.clear();
    rays.length = pulses.length = rayMats.length = beamMats.length = flares.length = 0;
    const k0 = V.keys[0];
    const toLocal = (p) => new T.Vector3(
      (p[0] - k0.rig[0]) / k0.scale, (p[1] - k0.rig[1]) / k0.scale, (p[2] - k0.rig[2]) / k0.scale
    );
    anchors.query.copy(toLocal(V.query));
    anchors.cite.copy(toLocal(V.cite));
    const c = anchors.cite;

    const n = light ? 22 : 42;
    for (let i = 0; i < n; i++) {
      const a = toLocal([
        V.rays.x[0] + rnd() * (V.rays.x[1] - V.rays.x[0]),
        V.rays.y[0] + rnd() * (V.rays.y[1] - V.rays.y[0]),
        V.rays.z[0] + rnd() * (V.rays.z[1] - V.rays.z[0]),
      ]);
      const mat = additive(rayTex, rnd() < 0.3 ? JADE_HI : 0xdff5ec, 0.16 + rnd() * 0.22);
      rayMats.push(mat);
      lightGroup.add(strand(a, ENTRY, (0.05 + rnd() * 0.05) / k0.scale, mat));
      const p = sprite(0xe9fff6, 0, (0.16 + rnd() * 0.1) / k0.scale);
      lightGroup.add(p);
      rays.push({ a, b: ENTRY, p, speed: 0.12 + rnd() * 0.16, phase: rnd() });
    }

    // The answer: one jade beam to your firm
    [[0.75, JADE, 0.55], [0.1, JADE_HI, 1], [0.035, 0xffffff, 0.9]].forEach(([w, col, o]) => {
      const mat = additive(beamTex, col, o);
      beamMats.push(mat);
      lightGroup.add(strand(EXIT, c, w, mat));
    });
    for (let i = 0; i < 3; i++) {
      const p = sprite(0xd9fff0, 0, 0.45);
      lightGroup.add(p);
      pulses.push({ a: EXIT, b: c, p, phase: i / 3 });
    }
    const flare = (col, o, s, at) => { const f = sprite(col, o, s); f.position.copy(at); lightGroup.add(f); flares.push(f); };
    flare(0xdff5ec, 0.5, 0.9, ENTRY);
    flare(JADE_HI, 0.9, 1.4, EXIT);
    flare(JADE, 0.85, 1.6, c);
  };

  /* ---- Scroll: which view, and how far between two ---- */
  const scenes = [...document.querySelectorAll('[data-scene]')];
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

  const lerp = (a, b, f) => a + (b - a) * f;
  const mix3 = (a, b, f) => [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)];
  const state = (p) => {
    const K = view.keys;
    const i = Math.min(K.length - 2, Math.max(0, Math.floor(p)));
    const f = ss(0, 1, p - i);
    const a = K[i], b = K[i + 1];
    const out = {};
    for (const k of Object.keys(a)) out[k] = Array.isArray(a[k]) ? mix3(a[k], b[k], f) : lerp(a[k], b[k], f);
    return out;
  };

  /* ---- HTML labels pinned to 3D points ---- */
  const tags = {};
  document.querySelectorAll('[data-anchor]').forEach((el) => { tags[el.dataset.anchor] = el; });
  const v = new T.Vector3();
  let W = 0, H = 0;
  const placeTags = () => {
    for (const key of Object.keys(tags)) {
      const el = tags[key];
      v.copy(anchors[key]);
      rig.localToWorld(v);
      v.project(camera);
      let px = ((v.x + 1) / 2) * W;
      let py = ((1 - v.y) / 2) * H;
      const w = el.offsetWidth, h = el.offsetHeight;
      if (key === 'cite') {
        let lx = px + 14, ly = py - h / 2;
        if (lx + w > W - 12) { lx = Math.max(12, W - 12 - w); ly = py - h - 18; }
        px = lx; py = ly;
      } else {
        px = Math.min(Math.max(12, px - w / 2), W - 12 - w);
        py -= h / 2;
      }
      py = Math.max(py, W < 560 ? 76 : 88); // keep clear of the header
      el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
      el.classList.add('on');
    }
  };

  /* ---- Pointer ---- */
  let tx = 0, ty = 0, mx = 0, my = 0;
  window.addEventListener('pointermove', (e) => {
    tx = (e.clientX / window.innerWidth) * 2 - 1;
    ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  /* ---- Frame ---- */
  const render = (t) => {
    if (!view) return;
    // Reduced motion keeps the hero view and only dims the 3D under content.
    const s = state(reduce ? 0 : prog);
    const sv = reduce ? state(target) : s;

    mx += (tx - mx) * 0.04;
    my += (ty - my) * 0.04;
    pivot.rotation.y = mx * 0.22 + Math.sin(t * 0.22) * 0.08;
    pivot.rotation.x = 0.06 + my * 0.06;

    rig.position.set(s.rig[0], s.rig[1], s.rig[2]);
    rig.rotation.y = s.rotY;
    rig.scale.setScalar(s.scale);
    rig.updateMatrixWorld(true);
    pool.position.set(s.rig[0], -2.19, s.rig[2] + 0.4);
    pool.scale.set(7 * s.scale, 3.2 * s.scale, 1);
    backGlow.material.opacity = s.glow;
    camera.position.set(s.cam[0] + mx * 0.35, s.cam[1] - my * 0.2, s.cam[2]);
    camera.lookAt(s.look[0], s.look[1], s.look[2]);
    camera.updateMatrixWorld(true);

    for (const m of rayMats) m.opacity = m.userData.base * s.rays;
    for (const m of beamMats) m.opacity = m.userData.base * s.beam;
    for (const r of rays) {
      const f = (t * r.speed + r.phase) % 1;
      r.p.position.lerpVectors(r.a, r.b, f);
      r.p.material.opacity = Math.sin(f * Math.PI) * 0.75 * s.rays;
    }
    for (const q of pulses) {
      const f = (t * 0.32 + q.phase) % 1;
      q.p.position.lerpVectors(q.a, q.b, f);
      q.p.material.opacity = Math.sin(f * Math.PI) * 0.9 * s.beam;
    }
    flares[0].material.opacity = flares[0].material.userData.base * Math.max(s.rays, 0.25);
    flares[1].material.opacity = (0.75 + Math.sin(t * 2.1) * 0.15) * s.beam;
    flares[2].material.opacity = flares[2].material.userData.base * s.beam;
    flares[2].scale.setScalar(1.5 + Math.sin(t * 1.6) * 0.15);

    const d = dustGeo.attributes.position.array;
    for (let i = 0; i < DUST; i++) {
      d[i * 3 + 1] += 0.0016;
      if (d[i * 3 + 1] > 5.8) d[i * 3 + 1] = -2.2;
    }
    dustGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    if (veil) veil.style.opacity = sv.veil.toFixed(3);
    if (labels) labels.style.opacity = sv.tags.toFixed(3);
    placeTags();
  };

  let running = false, clock = 0, last = 0;
  const loop = (now) => {
    if (!running) return;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    clock += dt;
    prog += (target - prog) * Math.min(1, dt * 4.5);
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
    const name = W / H < 0.85 ? 'tall' : 'wide';
    if (name !== viewName) { viewName = name; view = VIEWS[name]; buildLight(view); }
    measure();
    readScroll();
    if (!running) { prog = target; render(reduce ? 3.2 : clock); }
  };

  window.addEventListener('scroll', () => { readScroll(); if (reduce) render(3.2); }, { passive: true });
  resize();
  new ResizeObserver(resize).observe(document.body);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); readScroll(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) running = false;
    else start();
  });
  start();
})();
