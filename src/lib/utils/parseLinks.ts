import type { ParsedLinks } from '$lib/layout/types';

const SPLIT_PATTERN = /[\n,\t;]+/;

function collectStringValues(value: unknown, collector: string[]): void {
	if (typeof value === 'string') {
		collector.push(value);
		return;
	}

	if (Array.isArray(value)) {
		for (const nested of value) {
			collectStringValues(nested, collector);
		}
		return;
	}

	if (!value || typeof value !== 'object') {
		return;
	}

	for (const nested of Object.values(value)) {
		collectStringValues(nested, collector);
	}
}

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

function extractNormalizedLinksFromJson(input: string): string[] {
	try {
		const parsed = JSON.parse(input);
		const rawValues: string[] = [];
		const links: string[] = [];
		const seen = new Set<string>();

		collectStringValues(parsed, rawValues);

		for (const rawValue of rawValues) {
			const normalized = normalizeCandidate(rawValue);
			if (!normalized || seen.has(normalized)) {
				continue;
			}

			seen.add(normalized);
			links.push(normalized);
		}

		return links;
	} catch {
		return [];
	}
}

export function normalizeJsonLinksToCsv(input: string): string | null {
	const links = extractNormalizedLinksFromJson(input);
	if (links.length === 0) {
		return null;
	}

	return links.join(', ');
}

export function parseLinks(input: string): ParsedLinks {
	const jsonLinks = extractNormalizedLinksFromJson(input);
	if (jsonLinks.length > 0) {
		return { links: jsonLinks, invalid: [] };
	}

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
