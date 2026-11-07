<script lang="ts">
  import type { Behaviour } from '../lib/types';
  import { requestBehaviour } from '../lib/store.svelte';
  import { shortName } from '../lib/theme';

  let { b }: { b: Behaviour } = $props();
  let open = $state(true);
  const method = (m: string) => {
    const [cls, name] = m.split('#');
    return `${shortName(cls.replace(/\$/g, '.'))}.${name}`;
  };
  const ignored = $derived(
    [
      b.flaky ? `${b.flaky} that change from run to run` : '',
      b.stateOnly ? `${b.stateOnly} that differ only in private fields` : '',
      b.nullOnly ? `${b.nullOnly} that fail only on null inputs` : '',
    ].filter(Boolean),
  );
</script>

<section class="card behaviour" class:differs={b.status === 'done' && b.differ}>
  <div class="card-head">
    <span class="label">Behaviour</span>
    {#if b.status === 'done'}
      {#if b.differ}
        <span class="warnc">{b.differ} call{b.differ > 1 ? 's' : ''} now behave differently</span>
      {:else}
        <span class="good">No difference in {b.ran} call{b.ran === 1 ? '' : 's'}</span>
      {/if}
    {/if}
    <span class="spacer"></span>
    {#if b.status === 'done' && b.differ}
      <button class="link" onclick={() => (open = !open)} aria-expanded={open}>{open ? 'Hide' : 'Show'}</button>
    {/if}
    {#if b.status !== 'queued' && b.status !== 'running'}
      <button class="btn secondary sm" title="Run the changed methods before and after this commit again" onclick={() => requestBehaviour(b.sha)}>Re-run</button>
    {/if}
  </div>

  {#if b.status === 'queued' || b.status === 'running'}
    <p class="faint"><span class="spinner inline"></span>{b.status === 'queued' ? 'Waiting to run' : 'Running'} the changed methods before and after this commit…</p>
  {:else if b.status === 'skipped' || b.status === 'failed'}
    <p class="faint">{b.status === 'failed' ? 'Could not finish: ' : 'Not run: '}{b.reason}</p>
  {:else}
    <p class="faint">
      Called {(b.methods ?? []).map(method).join(', ')} with the same inputs on the code before and after this commit.
      {#if b.differ}Was each change below meant?{/if}
    </p>
    {#if b.differ && open}
      {#each b.differences ?? [] as d, i (i)}
        <div class="diff">
          <div class="call mono">{d.call}</div>
          <div class="row"><span class="tag before">before</span><span class="mono">{d.old}</span></div>
          <div class="row"><span class="tag after">after</span><span class="mono">{d.new}</span></div>
        </div>
      {/each}
      {#if (b.differ ?? 0) > (b.differences?.length ?? 0)}<p class="faint">and {(b.differ ?? 0) - (b.differences?.length ?? 0)} more like these.</p>{/if}
    {/if}
    {#if ignored.length}<p class="faint small">Not counted: {ignored.join(', ')}.</p>{/if}
    {#each b.notes ?? [] as n (n)}<p class="faint small">{n}</p>{/each}
  {/if}
</section>

<style>
  .card { margin-top: 14px; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--r-lg); background: var(--surface-2); }
  .card.differs { border-left: 2px solid var(--warn); }
  .card-head { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
  .spacer { flex: 1; }
  .warnc { color: var(--warn); font-size: 12px; font-weight: 600; }
  .good { color: var(--good); font-size: 12px; }
  .faint { margin: 4px 0 0; font-size: 12px; line-height: 1.5; }
  .small { font-size: 11.5px; }
  .diff { margin-top: 8px; padding: 8px 10px; border: 1px solid var(--border); border-radius: var(--r); background: var(--code-bg); }
  .call { font-size: 12px; color: var(--text); overflow-wrap: anywhere; }
  .row { display: grid; grid-template-columns: 52px 1fr; gap: 6px; margin-top: 4px; font-size: 11.5px; }
  .row .mono { overflow-wrap: anywhere; color: var(--text-2); }
  .tag { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-3); line-height: 18px; }
  .tag.after { color: var(--warn); }
  .link { padding: 0; border: 0; background: none; font-size: 12px; color: var(--accent-text); }
  .spinner.inline { display: inline-block; width: 10px; height: 10px; vertical-align: -1px; margin-right: 4px; }
</style>
