<script lang="ts">
	import type { DocumentSettings, PageOrientation, PagePreset } from '$lib/layout/types';

	interface Props {
		settings: DocumentSettings;
		totalItems: number;
		readyItems: number;
		onUpdateSettings: (partial: Partial<DocumentSettings>) => void;
		onExportPdf: () => void;
		onClear: () => void;
	}

	let { settings, totalItems, readyItems, onUpdateSettings, onExportPdf, onClear }: Props = $props();

	function handlePresetChange(event: Event) {
		const target = event.currentTarget as HTMLSelectElement;
		onUpdateSettings({ preset: target.value as PagePreset });
	}

	function handleOrientationChange(event: Event) {
		const target = event.currentTarget as HTMLSelectElement;
		onUpdateSettings({ orientation: target.value as PageOrientation });
	}

	function handleMarginChange(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		const margin = Number(target.value);
		if (Number.isFinite(margin)) {
			onUpdateSettings({ margin: Math.min(120, Math.max(0, margin)) });
		}
	}
 </script>

<section class="panel">
	<h2>Export</h2>
	<div class="controls">
		<label>
			Page size
			<select value={settings.preset} on:change={handlePresetChange}>
				<option value="LETTER">Letter</option>
				<option value="A4">A4</option>
			</select>
		</label>

		<label>
			Orientation
			<select value={settings.orientation} on:change={handleOrientationChange}>
				<option value="portrait">Portrait</option>
				<option value="landscape">Landscape</option>
			</select>
		</label>

		<label>
			Margin (pt)
			<input type="number" min="0" max="120" value={settings.margin} on:input={handleMarginChange} />
		</label>
	</div>

	<p class="counts">{readyItems} / {totalItems} QR images ready</p>

	<div class="actions">
		<button type="button" on:click={onExportPdf} disabled={totalItems === 0 || readyItems !== totalItems}>
			Export interactive PDF
		</button>
		<button type="button" class="clear" on:click={onClear} disabled={totalItems === 0}>Clear all</button>
	</div>

	<p class="note">
		Interactive object behavior is optimized for Adobe Acrobat. Other PDF viewers may show static content
		without editable object controls.
	</p>
</section>

<style>
	.panel {
		display: grid;
		gap: 0.8rem;
		padding: 1rem;
		border: 1px solid #d8d8d8;
		border-radius: 0.75rem;
		background: #fff;
	}

	h2 {
		margin: 0;
		font-size: 1.1rem;
	}

	.controls {
		display: grid;
		gap: 0.65rem;
	}

	label {
		display: grid;
		gap: 0.35rem;
		font-size: 0.9rem;
	}

	select,
	input {
		font: inherit;
		padding: 0.4rem 0.45rem;
		border: 1px solid #c8c8c8;
		border-radius: 0.45rem;
		background: #fff;
	}

	.counts {
		margin: 0;
		font-size: 0.85rem;
		color: #4b4b4b;
	}

	.actions {
		display: flex;
		gap: 0.6rem;
	}

	button {
		border: none;
		border-radius: 0.5rem;
		padding: 0.45rem 0.75rem;
		font-weight: 600;
		cursor: pointer;
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	button:first-child {
		background: #0f7b45;
		color: #fff;
	}

	.clear {
		background: #ececec;
		color: #303030;
	}

	.note {
		margin: 0;
		font-size: 0.82rem;
		color: #575757;
	}
</style>
