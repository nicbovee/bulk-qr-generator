import { ImageAlignment, PDFDocument, rgb } from 'pdf-lib';
import type { DocumentSettings, QrItem } from '$lib/layout/types';
import { normalizePageDimensions } from '$lib/stores/qrItems';

export interface ExportInteractivePdfOptions {
	items: QrItem[];
	settings: DocumentSettings;
	filename?: string;
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
	const [, base64 = ''] = dataUrl.split(',');
	const decoded = atob(base64);
	return Uint8Array.from(decoded, (char) => char.charCodeAt(0));
}

function safeFieldName(id: string): string {
	return id.replace(/[^a-zA-Z0-9_]/g, '_');
}

function downloadPdf(bytes: Uint8Array, filename: string): void {
	const normalizedBytes = new Uint8Array(bytes.byteLength);
	normalizedBytes.set(bytes);
	const blob = new Blob([normalizedBytes], { type: 'application/pdf' });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	URL.revokeObjectURL(url);
}

export async function exportInteractivePdf({
	items,
	settings,
	filename
}: ExportInteractivePdfOptions): Promise<void> {
	const pdfDoc = await PDFDocument.create();
	const pageDimensions = normalizePageDimensions(settings);
	const page = pdfDoc.addPage([pageDimensions.width, pageDimensions.height]);
	const isInteractiveMode = settings.exportMode === 'interactive';
	const form = isInteractiveMode ? pdfDoc.getForm() : null;

	for (const [index, item] of items.entries()) {
		if (!item.qrDataUrl) {
			continue;
		}

		const image = await pdfDoc.embedPng(dataUrlToBytes(item.qrDataUrl));
		const x = settings.margin + item.x;
		const y = pageDimensions.height - settings.margin - item.y - item.size;

		if (form) {
			// Each QR is rendered as the button field appearance to avoid overlay artifacts in Acrobat.
			const button = form.createButton(`qr_button_${index}_${safeFieldName(item.id)}`);
			button.setImage(image, ImageAlignment.Center);
			button.addToPage('', page, {
				x,
				y,
				width: item.size,
				height: item.size,
				borderWidth: 0,
				borderColor: rgb(1, 1, 1),
				backgroundColor: rgb(1, 1, 1)
			});
		} else {
			page.drawImage(image, {
				x,
				y,
				width: item.size,
				height: item.size
			});
		}

		page.drawText(item.label, {
			x,
			y: y - 12,
			size: 3,
			color: rgb(0.2, 0.2, 0.2),
			maxWidth: item.size
		});
	}

	if (form) {
		form.updateFieldAppearances();
	}

	const pdfBytes = await pdfDoc.save();
	const date = new Date().toISOString().slice(0, 10);
	downloadPdf(pdfBytes, filename ?? `qr-layout-${date}.pdf`);
}
