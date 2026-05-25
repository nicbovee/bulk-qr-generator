<script lang="ts">
	import type { QrItem } from '$lib/layout/types';

	interface Props {
		item: QrItem;
		selected: boolean;
		onPointerDown: (event: PointerEvent, item: QrItem) => void;
		onLabelChange: (id: string, label: string) => void;
		onRemove: (id: string) => void;
		onSelect: (id: string) => void;
	}

	let { item, selected, onPointerDown, onLabelChange, onRemove, onSelect }: Props = $props();

	function handlePointerDown(event: PointerEvent) {
		onPointerDown(event, item);
		onSelect(item.id);
	}

	function handleLabelInput(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		onLabelChange(item.id, target.value);
	}
</script>

<article
	class:selected
	class="qr-item"
	style={`left:${item.x}px;top:${item.y}px;width:${item.size}px;height:${item.size + 26}px;`}
	on:pointerdown={handlePointerDown}
>
	<button class="remove" type="button" aria-label={`Remove ${item.label}`} on:click={() => onRemove(item.id)}>
		×
	</button>

	<div class="preview">
		{#if item.qrDataUrl}
			<img src={item.qrDataUrl} alt={`QR code for ${item.label}`} draggable="false" />
		{:else}
			<div class="loading">Generating...</div>
		{/if}
	</div>

	<input value={item.label} on:input={handleLabelInput} on:click|stopPropagation />
</article>

<style>
	.qr-item {
		position: absolute;
		user-select: none;
		background: #fff;
		border: 1px solid #d4d4d4;
		border-radius: 0.45rem;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
		overflow: hidden;
		cursor: grab;
	}

	.qr-item.selected {
		border-color: #1f6feb;
		box-shadow: 0 0 0 2px rgba(31, 111, 235, 0.16);
	}

	.preview {
		width: 100%;
		height: var(--preview-height, 92px);
		display: grid;
		place-items: center;
		background: #fff;
	}

	img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
		pointer-events: none;
	}

	.loading {
		font-size: 0.78rem;
		color: #646464;
	}

	input {
		width: 100%;
		border: none;
		border-top: 1px solid #ececec;
		padding: 0.35rem 0.4rem;
		font-size: 0.72rem;
		text-align: center;
	}

	.remove {
		position: absolute;
		top: 0.2rem;
		right: 0.2rem;
		width: 1rem;
		height: 1rem;
		display: grid;
		place-items: center;
		border: none;
		border-radius: 999px;
		background: rgba(0, 0, 0, 0.45);
		color: #fff;
		cursor: pointer;
		font-size: 0.75rem;
		line-height: 1;
	}
</style>
