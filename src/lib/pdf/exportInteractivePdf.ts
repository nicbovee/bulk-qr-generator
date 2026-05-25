import { PDFDocument, rgb } from 'pdf-lib';
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
	const blob = new Blob([bytes], { type: 'application/pdf' });
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
	const form = pdfDoc.getForm();

	for (const [index, item] of items.entries()) {
		if (!item.qrDataUrl) {
			continue;
		}

		const image = await pdfDoc.embedPng(dataUrlToBytes(item.qrDataUrl));
		const x = settings.margin + item.x;
		const y = pageDimensions.height - settings.margin - item.y - item.size;

		page.drawImage(image, {
			x,
			y,
			width: item.size,
			height: item.size
		});

		// This invisible button gives each QR its own interactive PDF object.
		const button = form.createButton(`qr_button_${index}_${safeFieldName(item.id)}`);
		button.addToPage('', page, {
			x,
			y,
			width: item.size,
			height: item.size,
			borderWidth: 0,
			borderColor: rgb(0, 0, 0)
		});

		page.drawText(item.label, {
			x,
			y: y - 12,
			size: 8,
			color: rgb(0.2, 0.2, 0.2),
			maxWidth: item.size
		});
	}

	const pdfBytes = await pdfDoc.save();
	const date = new Date().toISOString().slice(0, 10);
	downloadPdf(pdfBytes, filename ?? `qr-layout-${date}.pdf`);
}
