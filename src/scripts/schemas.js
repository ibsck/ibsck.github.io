import { SVG_NS, TILE } from './constants.js';

/* Cadence d'allumage : un cran par demi-carreau, à vitesse constante sur tout le schéma. */
const STEP_PX = TILE / 2;
const STEP_MS = 26;
const steps = (px) => Math.max(2, Math.round(px / STEP_PX));

/* Schémas des études de cas : relie les plaques entre colonnes, puis allume l'itinéraire
   quand le schéma entre dans l'écran, un aiguillage après l'autre.
   Sans script, le schéma s'affiche déjà allumé. */
export function initSchemas() {
  document.querySelectorAll('.schema').forEach((schema) => {
    const flow = schema.querySelector('.schema__flow');
    if (!flow) return;
    const links = [...flow.querySelectorAll('.schema__link')].filter(
      (l) => l.firstElementChild && l.previousElementSibling && l.nextElementSibling,
    );
    const centreY = (el, box) => {
      const r = el.getBoundingClientRect();
      return r.top + r.height / 2 - box.top;
    };

    /** Aiguillages entre deux colonnes : un tracé par paire de plaques reliées. */
    function drawLink(link) {
      const box = link.getBoundingClientRect();
      const { width: w, height: h } = box;
      const svg = link.firstElementChild;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.replaceChildren();
      const from = [...link.previousElementSibling.querySelectorAll('.node')].map((n) => centreY(n, box));
      const to = [...link.nextElementSibling.querySelectorAll('.node')].map((n) => centreY(n, box));
      const m = w / 2;
      const paths = [];
      for (const ya of from) {
        for (const yb of to) {
          const dy = yb - ya;
          if (Math.abs(dy) < 1) {
            paths.push(`M0 ${ya} H${w}`);
            continue;
          }
          const d = Math.abs(dy);
          if (d <= w * 0.6) {
            // Écart court : une seule diagonale à 45°, centrée, sans segment vertical.
            paths.push(`M0 ${ya} H${m - d / 2} L${m + d / 2} ${yb} H${w}`);
          } else {
            // Écart long : aiguillage à pans coupés de 12 px, comme sur le faisceau de l'accueil.
            const k = 12 * Math.sign(dy);
            paths.push(`M0 ${ya} H${m - 12} L${m} ${ya + k} V${yb - k} L${m + 12} ${yb} H${w}`);
          }
        }
      }
      let longest = 0;
      for (const cls of ['schema__case', 'schema__core']) {
        for (const d of paths) {
          const p = document.createElementNS(SVG_NS, 'path');
          p.setAttribute('d', d);
          p.setAttribute('class', cls);
          svg.append(p);
          if (cls === 'schema__core') {
            const len = p.getTotalLength();
            longest = Math.max(longest, len);
            p.style.setProperty('--len', len);
            p.style.setProperty('--steps', steps(len));
          }
        }
      }
      link.classList.add('is-drawn');
      // Toutes les branches d'un même aiguillage arrivent ensemble : la plus longue fixe la durée.
      return steps(longest) * STEP_MS;
    }

    function draw() {
      const vertical = getComputedStyle(flow).flexDirection === 'column';

      if (vertical) {
        // Mobile : une seule voie verticale, qui descend d'une gare à l'autre.
        links.forEach((l) => l.classList.add('is-drawn'));
        const railSteps = steps(flow.offsetHeight);
        const railDur = railSteps * STEP_MS;
        flow.style.setProperty('--rail-steps', railSteps);
        flow.style.setProperty('--rail-dur', `${railDur}ms`);
        return;
      }

      // Ordinateur : chaque aiguillage s'allume quand le précédent a fini.
      let t = 0;
      links.forEach((link) => {
        const dur = drawLink(link);
        link.style.setProperty('--delay', `${t}ms`);
        link.style.setProperty('--dur', `${dur}ms`);
        t += dur;
      });
    }

    // Redessiner seulement si la taille a vraiment changé : remplacer les tracés en cours
    // d'allumage les ferait apparaître d'un coup, d'où un à-coup visible.
    let size = '';
    const redraw = () => {
      const next = `${flow.offsetWidth}x${flow.offsetHeight}`;
      if (next === size) return;
      size = next;
      draw();
    };
    let frame;
    new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(redraw);
    }).observe(flow);

    // Le schéma part éteint dès le premier affichage (classe .js) ; sans IntersectionObserver, on l'allume tout de suite.
    if (!('IntersectionObserver' in window)) {
      redraw();
      schema.classList.add('is-lit');
      return;
    }
    // L'allumage n'est armé qu'une fois les polices chargées et la géométrie définitive tracée.
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    fontsReady.then(() => {
      redraw();
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            requestAnimationFrame(() => schema.classList.add('is-lit'));
            io.disconnect();
          }
        },
        { threshold: 0.25 },
      );
      io.observe(flow);
    });
    // À l'impression, le schéma doit apparaître allumé même s'il n'a pas été vu.
    addEventListener('beforeprint', () => schema.classList.add('is-lit'));
  });
}
