<script lang="ts">
	import { parseLinks } from '$lib/utils/parseLinks';

	interface Props {
		onAddLinks: (links: string[]) => void;
		totalItems: number;
	}

	let { onAddLinks, totalItems }: Props = $props();

	let bulkInput = $state('');
	let statusMessage = $state('');
	let invalidLinks = $state<string[]>([]);

	function handleAddLinks() {
		const parsed = parseLinks(bulkInput);
		invalidLinks = parsed.invalid;

		if (parsed.links.length === 0) {
			statusMessage = 'No valid links found in this batch.';
			return;
		}

		onAddLinks(parsed.links);
		statusMessage = `Added ${parsed.links.length} link${parsed.links.length === 1 ? '' : 's'}.`;
		bulkInput = '';
	}
</script>

<section class="panel">
	<h2>Links</h2>
	<p class="help">
		Paste URLs separated by new lines, commas, tabs, or semicolons. Duplicate links in the same batch
		are ignored.
	</p>

	<textarea
		bind:value={bulkInput}
		placeholder="https://example.com&#10;https://svelte.dev&#10;example.org"
		rows="10"
	></textarea>

	<div class="actions">
		<button type="button" onclick={handleAddLinks}>Add links</button>
		<span>{totalItems} total QR items</span>
	</div>

	{#if statusMessage}
		<p class="status">{statusMessage}</p>
	{/if}

	{#if invalidLinks.length > 0}
		<div class="invalid">
			<strong>Invalid entries</strong>
			<ul>
				{#each invalidLinks as invalid}
					<li>{invalid}</li>
				{/each}
			</ul>
		</div>
	{/if}
</section>

<style>
	.panel {
		display: grid;
		gap: 0.75rem;
		padding: 1rem;
		border: 1px solid #d8d8d8;
		border-radius: 0.75rem;
		background: #fff;
	}

	h2 {
		margin: 0;
		font-size: 1.125rem;
	}

	.help {
		margin: 0;
		color: #4c4c4c;
		font-size: 0.9rem;
	}

	textarea {
		width: 100%;
		resize: vertical;
		border: 1px solid #c9c9c9;
		border-radius: 0.5rem;
		padding: 0.65rem;
		font: inherit;
	}

	.actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	button {
		border: none;
		border-radius: 0.5rem;
		padding: 0.5rem 0.85rem;
		background: #1f6feb;
		color: #fff;
		font-weight: 600;
		cursor: pointer;
	}

	.status {
		margin: 0;
		font-size: 0.9rem;
		color: #175d2c;
	}

	.invalid {
		border: 1px solid #efcc00;
		background: #fff9d9;
		border-radius: 0.5rem;
		padding: 0.65rem;
	}

	.invalid ul {
		margin: 0.45rem 0 0;
		padding-left: 1.2rem;
	}

	.invalid li {
		word-break: break-all;
	}
</style>
