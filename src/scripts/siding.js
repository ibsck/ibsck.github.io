import { SVG_NS, TILE } from './constants.js';

/* Un cran par carreau ; durée proportionnelle, bornée pour qu'un survol reste une réponse immédiate. */
const STEP_MS = 24;
const duration = (n) => Math.min(360, Math.max(160, n * STEP_MS));

/* Faisceau : trace les aiguillages jusqu'au rail de chaque voie, puis allume l'itinéraire choisi. */
export function initSiding() {
  const board = document.querySelector('.siding__board');
  if (!board) return;
  const fan = board.querySelector('.fan');
  const tracks = [...board.querySelectorAll('.track')].filter((t) => t.querySelector('.rail'));
  if (!fan || !tracks.length) return;

  function draw() {
    const w = fan.getBoundingClientRect().width;
    if (!w) return;

    // Caler la mosaïque sur le tableau : son coin haut-gauche tombe sur un joint.
    const bb = board.getBoundingClientRect();
    const ox = (((bb.left + scrollX) % TILE) + TILE) % TILE;
    const oy = (((bb.top + scrollY) % TILE) + TILE) % TILE;
    document.body.style.backgroundPosition = `${ox}px ${oy}px`;

    // Chaque rail sur un joint horizontal : la marge avant la voie absorbe l'arrondi.
    tracks.forEach((t) => (t.style.paddingTop = '0px'));
    const ys = tracks.map((t) => {
      const r = t.querySelector('.rail').getBoundingClientRect();
      const y = r.top + r.height / 2 - board.getBoundingClientRect().top;
      const pad = Math.ceil(y / TILE) * TILE - y;
      t.style.paddingTop = `${pad}px`;
      return y + pad;
    });

    const box = fan.getBoundingClientRect();
    fan.setAttribute('viewBox', `0 0 ${w} ${box.height}`);
    fan.replaceChildren();
    const y0 = ys[0];
    // Voie d'échelle : un collecteur vertical, puis une aiguille à 45° vers chaque voie,
    // collecteur et aiguilles sur des carreaux entiers.
    const a = w >= TILE * 3 ? TILE : TILE / 2;
    const k = w >= a + TILE * 2 ? TILE : TILE / 2;
    ys.forEach((y, i) => {
      const d = i === 0 ? `M0 ${y0} H${w}` : `M0 ${y0} H${a} V${y - k} L${a + k} ${y} H${w}`;
      const g = document.createElementNS(SVG_NS, 'g');
      g.dataset.route = String(i + 1);
      for (const cls of ['fan__case', 'fan__core']) {
        const p = document.createElementNS(SVG_NS, 'path');
        p.setAttribute('d', d);
        p.setAttribute('class', cls);
        g.append(p);
      }
      fan.append(g);
      const core = g.lastChild;
      const len = core.getTotalLength();
      core.style.setProperty('--len', len);
      // Un pas d'allumage par carreau de la mosaïque.
      const n = Math.max(2, Math.round(len / TILE));
      core.style.setProperty('--steps', n);
      // Même durée pour le tracé et pour sa voie : le rail et la plaque partent quand l'aiguillage est établi.
      core.style.setProperty('--fan-dur', `${duration(n)}ms`);
      tracks[i]?.style.setProperty('--fan-dur', `${duration(n)}ms`);
    });
    // La voie suivante, en pointillé, passe sous les autres pour ne pas hachurer le collecteur.
    fan.prepend(fan.lastChild);
    // Signal d'entrée au départ du tronc : son feu s'allume en premier.
    const mast = document.createElementNS(SVG_NS, 'rect');
    mast.setAttribute('class', 'fan__signal');
    for (const [k, v] of Object.entries({ x: 0, y: y0 - 40, width: 18, height: 30 })) mast.setAttribute(k, v);
    const lens = document.createElementNS(SVG_NS, 'circle');
    lens.setAttribute('class', 'fan__lens');
    for (const [k, v] of Object.entries({ cx: 9, cy: y0 - 25, r: 6 })) lens.setAttribute(k, v);
    fan.append(mast, lens);
    tracks.forEach((t) => {
      const rail = t.querySelector('.rail');
      const n = Math.max(2, Math.round(rail.offsetWidth / TILE));
      rail.style.setProperty('--rail-steps', n);
      t.style.setProperty('--rail-dur', `${duration(n)}ms`);
    });
  }

  function light(route) {
    board.dataset.route = route || '';
    fan.querySelectorAll('g').forEach((g) => g.classList.toggle('is-lit', g.dataset.route === route));
    tracks.forEach((t) => t.classList.toggle('is-lit', t.dataset.route === route));
    if (route) {
      // Remonter la voie allumée au premier plan du tracé.
      const g = fan.querySelector(`g[data-route="${route}"]`);
      if (g) fan.insertBefore(g, fan.querySelector('.fan__signal'));
    }
  }

  tracks.forEach((t) => {
    t.addEventListener('pointerenter', () => light(t.dataset.route));
    t.addEventListener('focusin', () => light(t.dataset.route));
  });
  board.addEventListener('pointerleave', () => {
    if (!board.contains(document.activeElement)) light('');
  });
  board.addEventListener('focusout', (e) => {
    if (!board.contains(e.relatedTarget)) light('');
  });

  draw();
  let frame;
  const redraw = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      draw();
      light(board.dataset.route);
    });
  };
  new ResizeObserver(redraw).observe(board);
  // Le tableau peut se déplacer sans changer de taille (colonne centrée) : recaler la mosaïque.
  addEventListener('resize', redraw);

  // Sans survol, la voie qui passe au centre de l'écran établit son itinéraire.
  if (matchMedia('(hover: none)').matches && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).pop();
        if (hit) light(hit.target.dataset.route);
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    tracks.forEach((t) => io.observe(t));
  }
  document.fonts?.ready.then(() => {
    draw();
    light(board.dataset.route);
  });
}
