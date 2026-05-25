import { writable } from 'svelte/store';
import type { DocumentSettings, PageDimensions, PagePreset, QrItem } from '$lib/layout/types';

const PAGE_PRESET_DIMENSIONS: Record<PagePreset, PageDimensions> = {
	LETTER: { width: 612, height: 792 },
	A4: { width: 595, height: 842 }
};

const DEFAULT_ITEM_SIZE = 92;
const DEFAULT_GAP = 16;

export interface QrComposerState {
	items: QrItem[];
	settings: DocumentSettings;
}

const defaultSettings: DocumentSettings = {
	preset: 'LETTER',
	orientation: 'portrait',
	margin: 24,
	gridSize: 12
};

function normalizePageDimensions(settings: DocumentSettings): PageDimensions {
	const base = PAGE_PRESET_DIMENSIONS[settings.preset];
	if (settings.orientation === 'portrait') {
		return base;
	}

	return { width: base.height, height: base.width };
}

function getWorkspaceDimensions(settings: DocumentSettings): PageDimensions {
	const page = normalizePageDimensions(settings);
	return {
		width: Math.max(100, page.width - settings.margin * 2),
		height: Math.max(100, page.height - settings.margin * 2)
	};
}

function getNextPosition(state: QrComposerState): { x: number; y: number } {
	const workspace = getWorkspaceDimensions(state.settings);
	const slotSize = DEFAULT_ITEM_SIZE + DEFAULT_GAP;
	const columns = Math.max(1, Math.floor(workspace.width / slotSize));
	const overallIndex = state.items.length;
	const row = Math.floor(overallIndex / columns);
	const column = overallIndex % columns;

	const maxX = Math.max(0, workspace.width - DEFAULT_ITEM_SIZE);
	const maxY = Math.max(0, workspace.height - DEFAULT_ITEM_SIZE);

	return {
		x: Math.min(column * slotSize, maxX),
		y: Math.min(row * slotSize, maxY)
	};
}

function labelFromUrl(url: string): string {
	try {
		const parsed = new URL(url);
		return parsed.hostname;
	} catch {
		return url;
	}
}

function clampItemToWorkspace(item: QrItem, workspace: PageDimensions): QrItem {
	const maxX = Math.max(0, workspace.width - item.size);
	const maxY = Math.max(0, workspace.height - item.size);

	return {
		...item,
		x: Math.min(Math.max(0, item.x), maxX),
		y: Math.min(Math.max(0, item.y), maxY)
	};
}

function createInitialState(): QrComposerState {
	return {
		items: [],
		settings: { ...defaultSettings }
	};
}

const { subscribe, update, set } = writable<QrComposerState>(createInitialState());

function addLinks(urls: string[]) {
	update((state) => {
		const nextItems = [...state.items];

		urls.forEach((url) => {
			const position = getNextPosition({ ...state, items: nextItems });
			nextItems.push({
				id: crypto.randomUUID(),
				url,
				label: labelFromUrl(url),
				x: position.x,
				y: position.y,
				size: DEFAULT_ITEM_SIZE,
				qrDataUrl: null
			});
		});

		return {
			...state,
			items: nextItems
		};
	});
}

function removeItem(id: string) {
	update((state) => ({
		...state,
		items: state.items.filter((item) => item.id !== id)
	}));
}

function updateItemPosition(id: string, x: number, y: number) {
	update((state) => {
		const workspace = getWorkspaceDimensions(state.settings);
		return {
			...state,
			items: state.items.map((item) =>
				item.id === id ? clampItemToWorkspace({ ...item, x, y }, workspace) : item
			)
		};
	});
}

function updateItemLabel(id: string, label: string) {
	update((state) => ({
		...state,
		items: state.items.map((item) => (item.id === id ? { ...item, label } : item))
	}));
}

function updateItemSize(id: string, size: number) {
	const normalized = Math.min(240, Math.max(48, size));
	update((state) => {
		const workspace = getWorkspaceDimensions(state.settings);
		return {
			...state,
			items: state.items.map((item) =>
				item.id === id ? clampItemToWorkspace({ ...item, size: normalized }, workspace) : item
			)
		};
	});
}

function setItemQrDataUrl(id: string, qrDataUrl: string) {
	update((state) => ({
		...state,
		items: state.items.map((item) => (item.id === id ? { ...item, qrDataUrl } : item))
	}));
}

function updateSettings(partial: Partial<DocumentSettings>) {
	update((state) => {
		const settings: DocumentSettings = { ...state.settings, ...partial };
		const workspace = getWorkspaceDimensions(settings);
		return {
			settings,
			items: state.items.map((item) => clampItemToWorkspace(item, workspace))
		};
	});
}

function clearItems() {
	update((state) => ({ ...state, items: [] }));
}

function resetComposer() {
	set(createInitialState());
}

export const qrComposerStore = {
	subscribe
};

export const qrComposerActions = {
	addLinks,
	removeItem,
	updateItemPosition,
	updateItemLabel,
	updateItemSize,
	setItemQrDataUrl,
	updateSettings,
	clearItems,
	resetComposer
};

export { getWorkspaceDimensions, normalizePageDimensions };
