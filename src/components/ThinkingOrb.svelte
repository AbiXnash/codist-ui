<script lang="ts">
  // The thinking-orbs indicators (MIT, Jakub Antalik) drawn with their framework-free engine, so Codist can show
  // what the AI is doing: searching, solving, weaving and the rest. The package's own component is for React.
  import { MODE_FRAMES, paintFrame, resolvePreset, type OrbState } from 'thinking-orbs/engine';

  let {
    state: orbState = 'working',
    size = 20,
    speed = 1,
    label = '',
  }: { state?: OrbState; size?: 20 | 32 | 64; speed?: number; label?: string } = $props();

  const LABELS: Record<OrbState, string> = {
    working: 'Working', searching: 'Searching', solving: 'Solving', listening: 'Listening', connecting: 'Connecting',
    weaving: 'Weaving', composing: 'Composing', breathing: 'Waiting', shaping: 'Shaping',
  };

  let canvas: HTMLCanvasElement | undefined = $state();

  // Dark follows the page's data-theme, or the system when the page sets none.
  function isDark(): boolean {
    const t = document.documentElement.getAttribute('data-theme');
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }

  $effect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    const { mode, speed: base, opts } = resolvePreset(orbState, size);
    const frameFn = MODE_FRAMES[mode];
    let dark = isDark();
    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      paintFrame(ctx, frameFn(size, t, opts), dark);
    };
    const themeWatch = new MutationObserver(() => (dark = isDark()));
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      draw(0.6); // one still frame
      return () => themeWatch.disconnect();
    }
    let raf = 0;
    let running = false;
    let visible = true;
    const loop = () => {
      draw((performance.now() / 1000) * base * speed);
      if (running) raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    draw((performance.now() / 1000) * base * speed);
    // Pause when off screen or when the tab is hidden.
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && document.visibilityState !== 'hidden') start();
      else stop();
    });
    io.observe(canvas);
    const onVis = () => (document.visibilityState === 'hidden' ? stop() : visible && start());
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stop();
      io.disconnect();
      themeWatch.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  });
</script>

<span class="orb" role="img" aria-label={label || LABELS[orbState]}>
  <canvas bind:this={canvas} aria-hidden="true" style:width="{size}px" style:height="{size}px"></canvas>
</span>

<style>
  .orb { display: inline-flex; vertical-align: middle; flex: none; }
  .orb canvas { display: block; }
</style>
