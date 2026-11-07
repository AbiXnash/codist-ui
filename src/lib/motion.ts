// Motion for Codist's interface, adapted from transitions.dev (https://transitions.dev) by Jakub Antalik, used under
// the transitions.dev licence. Each function is one recipe's timing and curve as a Svelte transition, so it works with
// {#if} blocks: opening runs on the slower clock and closing on the faster one, and everything stops for people who
// asked their system for less motion.

import type { TransitionConfig } from 'svelte/transition';

/** cubic-bezier(0.22, 1, 0.36, 1), the transitions.dev ease: fast start, long soft landing (ease-out quint). */
export const ease = (t: number) => 1 - Math.pow(1 - t, 5);

const still = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
type Dir = { direction?: 'in' | 'out' | 'both' };
const closing = (o?: Dir) => o?.direction === 'out';

/** Menu dropdown: grows from its trigger. Open 250ms from 0.97, close 150ms to 0.99. */
export function dropdown(_: Element, p: { origin?: string } = {}, o?: Dir): TransitionConfig {
  if (still()) return { duration: 0 };
  const from = closing(o) ? 0.99 : 0.97;
  return {
    duration: closing(o) ? 150 : 250,
    easing: ease,
    css: (t) => `transform-origin: ${p.origin ?? 'top left'}; opacity: ${t}; transform: scale(${from + (1 - from) * t})`,
  };
}

/** Modal: scales up from the centre. Open 250ms, close 150ms, from 0.96. `base` keeps a centring transform. */
export function modal(_: Element, p: { base?: string } = {}, o?: Dir): TransitionConfig {
  if (still()) return { duration: 0 };
  return {
    duration: closing(o) ? 150 : 250,
    easing: ease,
    css: (t) => `opacity: ${t}; transform: ${p.base ?? ''} scale(${0.96 + 0.04 * t})`,
  };
}

/** The dimmed layer behind a modal, on the modal's clock. */
export function scrim(_: Element, __: unknown = {}, o?: Dir): TransitionConfig {
  if (still()) return { duration: 0 };
  return { duration: closing(o) ? 150 : 250, easing: ease, css: (t) => `opacity: ${t}` };
}

/** Toast: rises 16px with a slight scale and a 2px cross-blur. Open 350ms, close 250ms. */
export function toast(_: Element, __: unknown = {}, o?: Dir): TransitionConfig {
  if (still()) return { duration: 0 };
  return {
    duration: closing(o) ? 250 : 350,
    easing: ease,
    css: (t, u) => `opacity: ${t}; transform: translateY(${16 * u}px) scale(${0.97 + 0.03 * t}); filter: blur(${2 * u}px)`,
  };
}

/** Accordion: the height opens and the contents fade in from a 2px blur, 250ms both ways. */
export function accordion(node: Element, _: unknown = {}, __?: Dir): TransitionConfig {
  if (still()) return { duration: 0 };
  const h = (node as HTMLElement).offsetHeight;
  return {
    duration: 250,
    easing: ease,
    css: (t, u) => `overflow: hidden; height: ${h * t}px; opacity: ${t}; filter: blur(${2 * u}px)`,
  };
}

/**
 * Tabs sliding: a pill behind the selected option slides to the next one (transitions.dev "tabs sliding", 250ms).
 * Put it on the control: use:pill={{ active: '.on', bg: 'var(--surface-3)' }}. The selected button keeps its text
 * style; the pill draws its background, measured from the button, and follows it on every change and resize.
 */
export function pill(node: HTMLElement, p: { active: string; bg: string }) {
  const el = document.createElement('span');
  el.className = 't-pill';
  el.setAttribute('aria-hidden', 'true');
  el.style.background = p.bg;
  node.classList.add('t-pilled');
  if (getComputedStyle(node).position === 'static') node.style.position = 'relative';
  node.prepend(el);
  let placed = false;
  const place = () => {
    const on = node.querySelector<HTMLElement>(p.active);
    if (!on) {
      el.style.opacity = '0';
      return;
    }
    if (!placed) el.style.transition = 'none';
    el.style.opacity = '1';
    el.style.width = `${on.offsetWidth}px`;
    el.style.height = `${on.offsetHeight}px`;
    el.style.transform = `translate(${on.offsetLeft}px, ${on.offsetTop}px)`;
    if (!placed) {
      void el.offsetWidth; // apply the first position before turning the transition on
      el.style.transition = '';
      placed = true;
    }
  };
  const watch = new MutationObserver(place);
  watch.observe(node, { subtree: true, attributes: true, attributeFilter: ['class', 'aria-selected'], childList: true });
  const resize = new ResizeObserver(place);
  resize.observe(node);
  requestAnimationFrame(place);
  return {
    update(next: { active: string; bg: string }) {
      p = next;
      el.style.background = next.bg;
      place();
    },
    destroy() {
      watch.disconnect();
      resize.disconnect();
      el.remove();
    },
  };
}
