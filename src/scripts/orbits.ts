// =============================================================================
//  Μηχανή τροχιών: κινεί τις τελείες πάνω στις ελλείψεις των <svg data-orbits>.
//  Ο δείκτης του ποντικιού αλλάζει την "κλίση" του επιπέδου (σαν να κοιτάς
//  το σύστημα από άλλη γωνία). Κλικ = ώθηση, οι τροχιές επιταχύνουν για λίγο.
// =============================================================================

type Orbit = {
  path: SVGEllipseElement;
  dot: SVGCircleElement;
  label?: SVGTextElement | null;
  rx: number;
  ratio: number;
  rot: number;
  speed: number;
  phase: number;
  r: number;
  active: boolean;
};

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function mountOrbits(svg: SVGSVGElement): () => void {
  const orbits: Orbit[] = [...svg.querySelectorAll<SVGGElement>('[data-orbit]')].map((g) => {
    const i = g.dataset.orbit!;
    return {
      path: g.querySelector('ellipse')!,
      dot: svg.querySelector<SVGCircleElement>(`[data-dot="${i}"]`)!,
      label: svg.querySelector<SVGTextElement>(`[data-label="${i}"]`),
      rx: +g.dataset.rx!,
      ratio: +g.dataset.ratio!,
      rot: +g.dataset.rot!,
      speed: +g.dataset.speed!,
      phase: +g.dataset.phase!,
      r: +g.dataset.r!,
      active: false,
    };
  });

  const interactive = svg.dataset.interactive !== 'false';
  let tilt = 0.5, tiltTarget = 0.5;       // 0 = βλέπουμε το επίπεδο "από το πλάι", 1 = από πάνω
  let spin = 0, spinTarget = 0;           // επιπλέον περιστροφή από τη θέση Χ του ποντικιού
  let boost = 0;                          // ώθηση από κλικ
  let t = performance.now() / 1000;
  let last = performance.now();
  let raf = 0;
  let visible = true;
  let anyActive = false;

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    boost *= 0.94;
    const slow = anyActive ? 0.25 : 1;
    t += dt * (1 + boost * 6) * slow;
    tilt += (tiltTarget - tilt) * 0.06;
    spin += (spinTarget - spin) * 0.06;

    for (const o of orbits) {
      const ry = o.rx * o.ratio * (0.25 + tilt * 0.95);
      const rot = o.rot + spin;
      o.path.setAttribute('ry', ry.toFixed(2));
      o.path.parentElement!.setAttribute('transform', `rotate(${rot.toFixed(2)})`);

      const th = t * o.speed + o.phase;
      const lx = o.rx * Math.cos(th);
      const ly = ry * Math.sin(th);
      const a = (rot * Math.PI) / 180;
      const x = lx * Math.cos(a) - ly * Math.sin(a);
      const y = lx * Math.sin(a) + ly * Math.cos(a);
      // μπροστά (sin > 0) η τελεία μεγαλώνει και γεμίζει· πίσω γίνεται κούφια
      const depth = (Math.sin(th) + 1) / 2;
      const r = o.r * (0.55 + depth * 0.75) * (o.active ? 1.8 : 1);
      o.dot.setAttribute('cx', x.toFixed(2));
      o.dot.setAttribute('cy', y.toFixed(2));
      o.dot.setAttribute('r', r.toFixed(2));
      o.dot.classList.toggle('is-back', depth < 0.5);
      if (o.label) {
        o.label.setAttribute('x', (x + r + 10).toFixed(2));
        o.label.setAttribute('y', (y + 5).toFixed(2));
      }
    }
    if (visible) raf = requestAnimationFrame(frame);
  }

  const onMove = (e: PointerEvent) => {
    const b = svg.getBoundingClientRect();
    tiltTarget = Math.min(1, Math.max(0, (e.clientY - b.top) / b.height));
    spinTarget = ((e.clientX - b.left) / b.width - 0.5) * 24;
  };
  const onLeave = () => { tiltTarget = 0.5; spinTarget = 0; };
  const onClick = () => { boost = 1; };

  const host = (svg.closest('[data-orbit-host]') as HTMLElement) ?? svg;
  if (interactive) {
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    host.addEventListener('click', onClick);
  }

  // Δημόσιο API για επισήμανση μιας τροχιάς (π.χ. από τη λίστα μελών)
  const setActive = (e: Event) => {
    const id = (e as CustomEvent<string | null>).detail;
    anyActive = id !== null;
    svg.classList.toggle('has-active', anyActive);
    svg.querySelectorAll('[data-orbit]').forEach((g) => {
      const on = (g as SVGGElement).dataset.orbit === id;
      g.classList.toggle('is-active', on);
    });
    orbits.forEach((o, idx) => {
      const g = svg.querySelectorAll<SVGGElement>('[data-orbit]')[idx];
      o.active = g.dataset.orbit === id;
      o.dot.classList.toggle('is-active', o.active);
      o.label?.classList.toggle('is-active', o.active);
    });
  };
  svg.addEventListener('orbit:active', setActive);

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !reduce()) { last = performance.now(); raf = requestAnimationFrame(frame); }
  });
  io.observe(svg);

  if (reduce()) { frame(performance.now()); visible = false; cancelAnimationFrame(raf); }
  else raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    host.removeEventListener('pointermove', onMove);
    host.removeEventListener('pointerleave', onLeave);
    host.removeEventListener('click', onClick);
    svg.removeEventListener('orbit:active', setActive);
  };
}

let cleanups: Array<() => void> = [];
document.addEventListener('astro:page-load', () => {
  cleanups = [...document.querySelectorAll<SVGSVGElement>('svg[data-orbits]')].map(mountOrbits);
});
document.addEventListener('astro:before-swap', () => {
  cleanups.forEach((c) => c());
  cleanups = [];
});
