import type { ParsedLinks } from '$lib/layout/types';

const SPLIT_PATTERN = /[\n,\t;]+/;

function normalizeCandidate(rawValue: string): string | null {
	const trimmed = rawValue.trim();
	if (!trimmed) {
		return null;
	}

	try {
		return new URL(trimmed).toString();
	} catch {
		try {
			return new URL(`https://${trimmed}`).toString();
		} catch {
			return null;
		}
	}
}

export function parseLinks(input: string): ParsedLinks {
	const links: string[] = [];
	const invalid: string[] = [];
	const seen = new Set<string>();

	for (const chunk of input.split(SPLIT_PATTERN)) {
		const normalized = normalizeCandidate(chunk);
		if (!chunk.trim()) {
			continue;
		}

		if (!normalized) {
			invalid.push(chunk.trim());
			continue;
		}

		if (!seen.has(normalized)) {
			seen.add(normalized);
			links.push(normalized);
		}
	}

	return { links, invalid };
}
