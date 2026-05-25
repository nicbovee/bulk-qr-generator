# SvelteKit QR PDF Composer

A SvelteKit app for bulk QR generation and layout-driven PDF export.

## Features

- Add unlimited URLs in one batch (newline, comma, tab, or semicolon separated)
- Auto-generate QR images for each link
- Drag QR cards around a grid-aligned page workspace
- Tune page settings (Letter/A4, orientation, margin)
- Export an interactive-object PDF where each QR has its own overlay object

## Local Development

```sh
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build and Validate

```sh
npm run check
npm run build
```

## PDF Compatibility Notes

This project targets **Adobe Acrobat/Reader** first for object-level workflows. Exported PDFs include:

- rendered QR images,
- and per-QR interactive button overlays to preserve object separation.

Viewer behavior differs:

- **Adobe Acrobat/Reader**: best support for selecting/interacting with per-QR objects.
- **macOS Preview**: often displays as static content with limited form/object editing.
- **Browser PDF viewers**: typically render static content; interactive editing controls may not be available.

If the viewer does not expose object editing tools, the PDF still preserves visual placement and print output.
