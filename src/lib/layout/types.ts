export type PagePreset = 'LETTER' | 'A4';
export type PageOrientation = 'portrait' | 'landscape';
export type ExportMode = 'interactive' | 'static';

export interface DocumentSettings {
	preset: PagePreset;
	orientation: PageOrientation;
	margin: number;
	gridSize: number;
	exportMode: ExportMode;
}

export interface QrItem {
	id: string;
	url: string;
	label: string;
	x: number;
	y: number;
	size: number;
	qrDataUrl: string | null;
}

export interface PageDimensions {
	width: number;
	height: number;
}

export interface ParsedLinks {
	links: string[];
	invalid: string[];
}
