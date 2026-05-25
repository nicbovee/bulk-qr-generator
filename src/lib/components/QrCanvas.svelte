<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy } from 'svelte';
	import QrItemCard from '$lib/components/QrItem.svelte';
	import type { QrItem } from '$lib/layout/types';

	interface Props {
		items: QrItem[];
		workspaceWidth: number;
		workspaceHeight: number;
		gridSize: number;
		selectedItemId: string | null;
		onSelectItem: (id: string | null) => void;
		onMoveItem: (id: string, x: number, y: number) => void;
		onLabelChange: (id: string, label: string) => void;
		onRemoveItem: (id: string) => void;
	}

	let {
		items,
		workspaceWidth,
		workspaceHeight,
		gridSize,
		selectedItemId,
		onSelectItem,
		onMoveItem,
		onLabelChange,
		onRemoveItem
	}: Props = $props();

	interface DragState {
		id: string;
		startX: number;
		startY: number;
		startPointerX: number;
		startPointerY: number;
		size: number;
	}

	let dragState = $state<DragState | null>(null);

	function clamp(value: number, min: number, max: number): number {
		return Math.min(max, Math.max(min, value));
	}

	function snapToGrid(value: number): number {
		return Math.round(value / gridSize) * gridSize;
	}

	function handlePointerDown(event: PointerEvent, item: QrItem) {
		const target = event.target as HTMLElement | null;
		if (target?.closest('input,button')) {
			return;
		}

		if (event.button !== 0) {
			return;
		}

		event.preventDefault();
		dragState = {
			id: item.id,
			startX: item.x,
			startY: item.y,
			startPointerX: event.clientX,
			startPointerY: event.clientY,
			size: item.size
		};

		if (!browser) {
			return;
		}

		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', stopDragging);
	}

	function handlePointerMove(event: PointerEvent) {
		if (!dragState) {
			return;
		}

		const deltaX = event.clientX - dragState.startPointerX;
		const deltaY = event.clientY - dragState.startPointerY;
		const maxX = Math.max(0, workspaceWidth - dragState.size);
		const maxY = Math.max(0, workspaceHeight - dragState.size);

		const nextX = clamp(snapToGrid(dragState.startX + deltaX), 0, maxX);
		const nextY = clamp(snapToGrid(dragState.startY + deltaY), 0, maxY);
		onMoveItem(dragState.id, nextX, nextY);
	}

	function stopDragging() {
		dragState = null;
		if (!browser) {
			return;
		}
		window.removeEventListener('pointermove', handlePointerMove);
		window.removeEventListener('pointerup', stopDragging);
	}

	function handleWorkspacePointerDown(event: PointerEvent) {
		if (event.target === event.currentTarget) {
			onSelectItem(null);
		}
	}

	function handleWorkspaceKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onSelectItem(null);
		}
	}

	onDestroy(() => {
		stopDragging();
	});
</script>

<section class="canvas-panel">
	<header>
		<h2>Layout</h2>
		<p>Drag QR cards to position them on the export page.</p>
	</header>

	<div class="surface">
		<div
			class="workspace"
			style={`width:${workspaceWidth}px;height:${workspaceHeight}px;background-size:${gridSize}px ${gridSize}px;`}
			role="button"
			tabindex="0"
			onpointerdown={handleWorkspacePointerDown}
			onkeydown={handleWorkspaceKeydown}
		>
			{#if items.length === 0}
				<p class="empty">Add links to start generating QR cards.</p>
			{/if}

			{#each items as item (item.id)}
				<QrItemCard
					item={item}
					selected={item.id === selectedItemId}
					onPointerDown={handlePointerDown}
					onLabelChange={onLabelChange}
					onRemove={onRemoveItem}
					onSelect={() => onSelectItem(item.id)}
				/>
			{/each}
		</div>
	</div>
</section>

<style>
	.canvas-panel {
		display: grid;
		gap: 0.8rem;
	}

	header h2 {
		margin: 0;
		font-size: 1.125rem;
	}

	header p {
		margin: 0.2rem 0 0;
		font-size: 0.9rem;
		color: #4f4f4f;
	}

	.surface {
		overflow: auto;
		border: 1px solid #d8d8d8;
		border-radius: 0.75rem;
		padding: 1rem;
		background: #f8f8f8;
	}

	.workspace {
		position: relative;
		border: 1px solid #cfcfcf;
		background-image:
			linear-gradient(to right, rgba(0, 0, 0, 0.07) 1px, transparent 1px),
			linear-gradient(to bottom, rgba(0, 0, 0, 0.07) 1px, transparent 1px);
		background-color: #fff;
	}

	.empty {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		color: #676767;
		font-size: 0.95rem;
	}
</style>
