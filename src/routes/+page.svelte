<script lang="ts">
	import ExportControls from '$lib/components/ExportControls.svelte';
	import LinkInputPanel from '$lib/components/LinkInputPanel.svelte';
	import QrCanvas from '$lib/components/QrCanvas.svelte';
	import { exportInteractivePdf } from '$lib/pdf/exportInteractivePdf';
	import { generateQrDataUrl } from '$lib/qr/generate';
	import {
		getWorkspaceDimensions,
		qrComposerActions,
		qrComposerStore
	} from '$lib/stores/qrItems';

	let selectedItemId = $state<string | null>(null);
	const generatingIds = new Set<string>();

	const workspace = $derived(getWorkspaceDimensions($qrComposerStore.settings));
	const readyItemCount = $derived($qrComposerStore.items.filter((item) => item.qrDataUrl).length);
	const selectedItem = $derived(
		$qrComposerStore.items.find((item) => item.id === selectedItemId) ?? null
	);

	$effect(() => {
		for (const item of $qrComposerStore.items) {
			if (item.qrDataUrl || generatingIds.has(item.id)) {
				continue;
			}

			generatingIds.add(item.id);
			void generateQrDataUrl(item.url)
				.then((qrDataUrl) => {
					qrComposerActions.setItemQrDataUrl(item.id, qrDataUrl);
				})
				.finally(() => {
					generatingIds.delete(item.id);
				});
		}
	});

	function handleExportPdf() {
		void exportInteractivePdf({
			items: $qrComposerStore.items,
			settings: $qrComposerStore.settings
		});
	}

	function handleSelectedSizeChange(event: Event) {
		if (!selectedItem) {
			return;
		}

		const target = event.currentTarget as HTMLInputElement;
		const size = Number(target.value);
		if (Number.isFinite(size)) {
			qrComposerActions.updateItemSize(selectedItem.id, size);
		}
	}
</script>

<svelte:head>
	<title>SvelteKit QR PDF Composer</title>
</svelte:head>

<main>
	<section class="left-pane">
		<h1>QR PDF Composer</h1>
		<p class="subtitle">
			Add as many links as you need, arrange QR cards by dragging, and export a PDF with one interactive
			object per QR.
		</p>

		<LinkInputPanel
			totalItems={$qrComposerStore.items.length}
			onAddLinks={(links) => qrComposerActions.addLinks(links)}
		/>

		<ExportControls
			settings={$qrComposerStore.settings}
			totalItems={$qrComposerStore.items.length}
			readyItems={readyItemCount}
			onUpdateSettings={(partial) => qrComposerActions.updateSettings(partial)}
			onExportPdf={handleExportPdf}
			onClear={() => {
				selectedItemId = null;
				qrComposerActions.clearItems();
			}}
		/>

		{#if selectedItem}
			<section class="panel selected-item-panel">
				<h2>Selected QR</h2>
				<p>{selectedItem.label}</p>
				<label>
					Size (pt)
					<input
						type="range"
						min="48"
						max="240"
						step="4"
						value={selectedItem.size}
						on:input={handleSelectedSizeChange}
					/>
				</label>
				<p>{selectedItem.size}pt</p>
			</section>
		{/if}
	</section>

	<section class="right-pane">
		<QrCanvas
			items={$qrComposerStore.items}
			workspaceWidth={workspace.width}
			workspaceHeight={workspace.height}
			gridSize={$qrComposerStore.settings.gridSize}
			selectedItemId={selectedItemId}
			onSelectItem={(id) => (selectedItemId = id)}
			onMoveItem={qrComposerActions.updateItemPosition}
			onLabelChange={qrComposerActions.updateItemLabel}
			onRemoveItem={(id) => {
				if (selectedItemId === id) {
					selectedItemId = null;
				}
				qrComposerActions.removeItem(id);
			}}
		/>
	</section>
</main>

<style>
	main {
		display: grid;
		grid-template-columns: minmax(280px, 360px) 1fr;
		gap: 1rem;
		padding: 1rem;
		max-width: 1500px;
		margin: 0 auto;
	}

	.left-pane {
		display: grid;
		gap: 0.9rem;
		align-content: start;
	}

	h1 {
		margin: 0;
		font-size: 1.6rem;
	}

	.subtitle {
		margin: 0;
		color: #4c4c4c;
		font-size: 0.92rem;
	}

	.right-pane {
		min-width: 0;
	}

	.panel {
		display: grid;
		gap: 0.5rem;
		padding: 1rem;
		border: 1px solid #d8d8d8;
		border-radius: 0.75rem;
		background: #fff;
	}

	.selected-item-panel h2 {
		margin: 0;
		font-size: 1.05rem;
	}

	.selected-item-panel p {
		margin: 0;
		font-size: 0.88rem;
		color: #454545;
	}

	.selected-item-panel label {
		display: grid;
		gap: 0.45rem;
		font-size: 0.88rem;
	}

	@media (max-width: 1000px) {
		main {
			grid-template-columns: 1fr;
		}
	}
</style>
