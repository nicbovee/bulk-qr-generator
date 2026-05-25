// Cloudflare Worker runtime/binding fallback types.
// In CI you can regenerate richer types with: wrangler types

declare namespace Cloudflare {
	interface Env {}
}

interface Env extends Cloudflare.Env {}
