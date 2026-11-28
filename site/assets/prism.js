// Fostier Index — the obsidian prism.
// Faint rays (the web's sources) flow into a dark glass prism; one jade beam
// leaves it and lands on "Your firm", cited as source [1].
(() => {
  const root = document.documentElement;
  const canvas = document.querySelector('[data-prism]');
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

  /* ---- Studio environment: soft boxes the obsidian reflects ---- */
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
  softbox(0.7, 14, 0xffffff, 3.2, -9, 2, -6);  // thin white strip, back left (a streak on the left face)
  softbox(0.9, 14, 0x6fe0b6, 3.2, 9, 1, -6);   // thin jade strip, back right
  softbox(9, 9, 0xdff5ec, 0.9, 0, 11, 1);      // overhead (top face)
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

  const additive = (map, color, opacity) => new T.MeshBasicMaterial({
    map, color, transparent: true, opacity, blending: T.AdditiveBlending,
    depthWrite: false, side: T.DoubleSide, fog: false,
  });
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
  pool.scale.set(7, 3.2, 1);
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
  const dust = new T.Points(dustGeo, new T.PointsMaterial({
    map: glowTex, color: 0xbfeedd, size: 0.07, transparent: true, opacity: 0.55,
    blending: T.AdditiveBlending, depthWrite: false,
  }));
  scene.add(dust);

  /* ---- Light paths (rebuilt per layout) ---- */
  const lightGroup = new T.Group();
  scene.add(lightGroup);
  const rays = [];
  const pulses = [];
  const anchors = { query: new T.Vector3(), cite: new T.Vector3() };
  let flareIn, flareOut, flareEnd;

  // Entry and exit points on the prism, in rig space.
  const ENTRY = new T.Vector3(-0.55, 0.3, 0.62);
  const EXIT = new T.Vector3(0.62, 0.75, 0.55);

  const LAYOUTS = {
    wide: {
      cam: [0, 2.3, 12.5], look: [0, 0.75, 0], rig: [1.75, 1.15, 0], scale: 0.94,
      query: [-3.6, 3.15, 0.4], cite: [4.0, 3.0, 0.4],
      rays: { x: [-7, -2.4], y: [2.4, 4.4], z: [-2.5, 1.2] },
    },
    tall: {
      cam: [0, 3.0, 15], look: [0, 1.5, 0], rig: [-0.15, 2.0, 0], scale: 0.62,
      query: [-0.05, 4.5, 0.4], cite: [1.05, 3.4, 0.4],
      rays: { x: [-3.4, -1.2], y: [3.6, 5.6], z: [-2, 1] },
    },
  };
  let layout = null;

  const buildLight = (L) => {
    lightGroup.clear();
    rays.length = 0;
    pulses.length = 0;
    rig.updateMatrixWorld(true);
    const e = rig.localToWorld(ENTRY.clone());
    const x = rig.localToWorld(EXIT.clone());
    const c = new T.Vector3(...L.cite);
    anchors.query.set(...L.query);
    anchors.cite.copy(c);

    const n = light ? 22 : 42;
    for (let i = 0; i < n; i++) {
      const a = new T.Vector3(
        L.rays.x[0] + rnd() * (L.rays.x[1] - L.rays.x[0]),
        L.rays.y[0] + rnd() * (L.rays.y[1] - L.rays.y[0]),
        L.rays.z[0] + rnd() * (L.rays.z[1] - L.rays.z[0])
      );
      const tint = rnd() < 0.3 ? JADE_HI : 0xdff5ec;
      lightGroup.add(strand(a, e, 0.05 + rnd() * 0.05, additive(rayTex, tint, 0.16 + rnd() * 0.22)));
      const p = sprite(0xe9fff6, 0, 0.16 + rnd() * 0.1);
      lightGroup.add(p);
      rays.push({ a, b: e, p, speed: 0.12 + rnd() * 0.16, phase: rnd() });
    }

    // The answer: one jade beam to your firm
    lightGroup.add(strand(x, c, 0.5 * L.scale + 0.25, additive(beamTex, JADE, 0.55)));
    lightGroup.add(strand(x, c, 0.09, additive(beamTex, JADE_HI, 1)));
    lightGroup.add(strand(x, c, 0.03, additive(beamTex, 0xffffff, 0.9)));
    for (let i = 0; i < 3; i++) {
      const p = sprite(0xd9fff0, 0, 0.45);
      lightGroup.add(p);
      pulses.push({ a: x, b: c, p, phase: i / 3 });
    }
    flareIn = sprite(0xdff5ec, 0.5, 0.9); flareIn.position.copy(e); lightGroup.add(flareIn);
    flareOut = sprite(JADE_HI, 0.9, 1.4); flareOut.position.copy(x); lightGroup.add(flareOut);
    flareEnd = sprite(JADE, 0.85, 1.6); flareEnd.position.copy(c); lightGroup.add(flareEnd);
  };

  const applyLayout = (name) => {
    if (layout === name) return;
    layout = name;
    const L = LAYOUTS[name];
    camera.position.set(...L.cam);
    camera.userData.base = new T.Vector3(...L.cam);
    camera.userData.look = new T.Vector3(...L.look);
    camera.lookAt(camera.userData.look);
    rig.position.set(...L.rig);
    rig.scale.setScalar(L.scale);
    pool.position.set(L.rig[0], -2.19, L.rig[2] + 0.4);
    pool.scale.set(7 * L.scale, 3.2 * L.scale, 1);
    buildLight(L);
  };

  /* ---- HTML labels pinned to 3D points ---- */
  const tags = {};
  document.querySelectorAll('[data-anchor]').forEach((el) => { tags[el.dataset.anchor] = el; });
  const v = new T.Vector3();
  const placeTags = (W, H) => {
    for (const key of Object.keys(tags)) {
      const el = tags[key];
      v.copy(anchors[key]).project(camera);
      let px = ((v.x + 1) / 2) * W;
      let py = ((1 - v.y) / 2) * H;
      const w = el.offsetWidth, h = el.offsetHeight;
      if (key === 'cite') {
        // sit just past the beam's end; if that would leave the screen, sit above it
        let lx = px + 14, ly = py - h / 2;
        if (lx + w > W - 12) { lx = Math.max(12, W - 12 - w); ly = py - h - 18; }
        px = lx; py = ly;
      } else {
        px = Math.min(Math.max(12, px - w / 2), W - 12 - w);
        py -= h / 2;
      }
      el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
      el.classList.add('on');
    }
  };

  /* ---- Size ---- */
  let W = 0, H = 0;
  const resize = () => {
    W = canvas.clientWidth; H = canvas.clientHeight;
    if (!W || !H) return;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    applyLayout(W / H < 0.85 ? 'tall' : 'wide');
    if (!running) render(reduce ? 3.2 : clock);
  };

  /* ---- Pointer ---- */
  let tx = 0, ty = 0, mx = 0, my = 0;
  window.addEventListener('pointermove', (e) => {
    tx = (e.clientX / window.innerWidth) * 2 - 1;
    ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  /* ---- Frame ---- */
  const tmp = new T.Vector3();
  const render = (t) => {
    mx += (tx - mx) * 0.04;
    my += (ty - my) * 0.04;
    pivot.rotation.y = mx * 0.22 + Math.sin(t * 0.22) * 0.08;
    pivot.rotation.x = 0.06 + my * 0.06;
    const base = camera.userData.base, look = camera.userData.look;
    if (base) {
      camera.position.set(base.x + mx * 0.35, base.y - my * 0.2, base.z);
      camera.lookAt(look);
    }

    for (const r of rays) {
      const f = (t * r.speed + r.phase) % 1;
      r.p.position.lerpVectors(r.a, r.b, f);
      r.p.material.opacity = Math.sin(f * Math.PI) * 0.75;
    }
    for (const q of pulses) {
      const f = (t * 0.32 + q.phase) % 1;
      q.p.position.lerpVectors(q.a, q.b, f);
      q.p.material.opacity = Math.sin(f * Math.PI) * 0.9;
    }
    if (flareOut) {
      flareOut.material.opacity = 0.75 + Math.sin(t * 2.1) * 0.15;
      flareEnd.scale.setScalar(1.5 + Math.sin(t * 1.6) * 0.15);
    }

    const d = dustGeo.attributes.position.array;
    for (let i = 0; i < DUST; i++) {
      d[i * 3 + 1] += 0.0016;
      if (d[i * 3 + 1] > 5.8) d[i * 3 + 1] = -2.2;
    }
    dustGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    placeTags(W, H);
  };

  let running = false, clock = 0, last = 0;
  const loop = (now) => {
    if (!running) return;
    clock += last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    render(clock);
    requestAnimationFrame(loop);
  };
  const start = () => {
    if (running || reduce) return;
    running = true;
    last = 0;
    requestAnimationFrame(loop);
  };

  resize();
  new ResizeObserver(resize).observe(canvas);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => placeTags(W, H));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) running = false;
    else start();
  });
  start();
})();
