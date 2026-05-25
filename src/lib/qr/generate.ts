import QRCode from 'qrcode';

export interface GenerateQrOptions {
	size?: number;
	margin?: number;
}

export async function generateQrDataUrl(
	value: string,
	options: GenerateQrOptions = {}
): Promise<string> {
	const size = options.size ?? 512;
	const margin = options.margin ?? 1;

	return QRCode.toDataURL(value, {
		errorCorrectionLevel: 'M',
		type: 'image/png',
		width: size,
		margin,
		color: {
			dark: '#000000',
			light: '#FFFFFF'
		}
	});
}
