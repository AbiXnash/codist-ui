<script lang="ts">
  let { checked = $bindable(false), label, title = '' }: { checked: boolean; label: string; title?: string } = $props();
</script>

<label class="toggle" {title}>
  <input type="checkbox" bind:checked />
  <span class="track"><span class="knob"></span></span>
  {label}
</label>

<style>
  .toggle { display: inline-flex; align-items: center; gap: 7px; cursor: pointer; user-select: none; font-size: 12px; color: var(--text-2); }
  input { position: absolute; opacity: 0; pointer-events: none; }
  .track { position: relative; width: 26px; height: 16px; border-radius: 999px; background: var(--border-strong); transition: background 0.15s; }
  .knob { position: absolute; top: 2px; left: 2px; width: 12px; height: 12px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); transition: transform 350ms cubic-bezier(0.34, 1.35, 0.64, 1); } /* transitions.dev toggle: the thumb overshoots and settles */
  input:checked + .track { background: var(--accent); }
  input:checked + .track .knob { transform: translateX(10px); }
  input:focus-visible + .track { outline: 2px solid var(--accent); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { .track, .knob { transition: none; } }
  input:focus-visible + .track { outline: 2px solid var(--accent); outline-offset: 2px; }
</style>
