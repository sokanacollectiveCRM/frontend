# Backend: public signing manifest coordinates (copy to backend repo / ticket)

Use this when implementing or fixing `GET /signing/:token` → `signingManifest` and the PDF served at `pdfUrl` for the public signing flow (`/signing/:token` in the frontend).

## Consumers

- **Frontend:** `frontend-crm/src/features/public-signing/SigningPdf.tsx`
- **Mapping:** `frontend-crm/src/features/public-signing/signingFields.ts` → `overlayStylePx`
- **Types:** `frontend-crm/src/features/public-signing/types.ts` → `SigningManifestField`, `SigningCoordinates`

The browser overlays HTML field boxes on top of the PDF canvas rendered by **react-pdf** / **pdf.js**. The manifest must describe field positions in the **same coordinate space** as the PDF bytes returned in `pdfUrl`.

---

## API shape (unchanged)

```json
{
  "contractId": "…",
  "pdfUrl": "/signing/{token}/document",
  "signingManifest": [
    {
      "id": "initials-financial-deposit",
      "kind": "initials",
      "page": 2,
      "coordinates": { "x": 0.45, "y": 0.32, "width": 0.09, "height": 0.025 },
      "required": true,
      "label": "Deposit initials"
    }
  ]
}
```

### Field kinds

| `kind` | Overlay in browser | Notes |
|--------|-------------------|--------|
| `initials` | Yes | Guided click-to-apply |
| `signature` | Yes | Guided click-to-apply |
| `signing_date` | Yes | Guided click-to-apply |
| `acknowledgment` | Yes | Guided click-to-apply |
| `snapshot_text` | **No** | Text is baked into the PDF only; no HTML overlay |

---

## Coordinate contract (required)

### Units

All of `x`, `y`, `width`, `height` are **unitless fractions in the range 0–1** (not PDF points, not percentages 0–100).

### Origin and axes

- **Origin:** top-left of the rendered page
- **+X:** right
- **+Y:** down
- **Anchor:** `(x, y)` is the **top-left corner** of the field box (not center)

This matches CSS absolute positioning used by the frontend. It is **not** PDF user space (bottom-left origin).

### Page index

- `page` is **1-based** (first page = `1`), matching react-pdf `pageNumber`.

### Reference page box

Normalize against the same viewport pdf.js uses when rendering:

```text
pageWidth  = viewBox[2] - viewBox[0]
pageHeight = viewBox[3] - viewBox[1]
```

where `page.view` from pdf.js is `[xMin, yMin, xMax, yMax]`.

Do **not** normalize against:

- Template DOCX layout dimensions
- A pre-merge PDF that differs from `pdfUrl`
- SignNow/provider coordinates without an explicit conversion layer

### Rotation

If the PDF page has `/Rotate` 90/180/270, coordinates must be expressed in the **rotated display space** (after rotation), because react-pdf renders the rotated viewport.

---

## When to generate the manifest

**Generate `signingManifest` only after the final PDF bytes exist** — the exact file served at `pdfUrl`.

Required order:

1. Merge contract data (amounts, names, dates, `snapshot_text`, etc.) into the document
2. Produce final PDF bytes
3. Compute field coordinates from **that** PDF (or from the same layout pass that produced it)
4. Persist manifest + PDF together
5. Serve both on `GET /signing/:token`

### Common failure mode (observed)

Coordinates are computed from:

- the blank template, or
- a PDF **before** financial amounts / merge fields are applied,

but the signer sees a **post-merge** PDF where lines reflow (e.g. `FINANCIAL AGREEMENT` deposit/balance lines). Overlays appear near the right section but over the wrong words.

**Fix:** re-run placement on the merged PDF, or anchor fields to merge-field markers in the same rendering pipeline.

---

## Normalization formula

Given a field rectangle in PDF user space (top-left based, same orientation as displayed page):

```text
x      = fieldLeft   / pageWidth
y      = fieldTop    / pageHeight
width  = fieldWidth  / pageWidth
height = fieldHeight / pageHeight
```

Clamp to `[0, 1]` and ensure `x + width <= 1`, `y + height <= 1`.

### Converting from PDF bottom-left origin

If your placement tool reports `(left, bottom, width, height)` in PDF points with bottom-left origin:

```text
fieldTop = pageHeight - bottom - height
```

then apply the normalization above.

### Converting from SignNow / provider coords

Do not copy provider coordinates directly unless you document and test the mapping. Add an explicit adapter that outputs this contract.

---

## Validation rules (backend)

Reject or regenerate manifests that violate:

| Rule | Check |
|------|--------|
| Range | `0 <= x,y,width,height <= 1` |
| Inside page | `x + width <= 1`, `y + height <= 1` |
| Page exists | `1 <= page <= numPages` |
| PDF/manifest pairing | manifest `pdfHash` or `generatedAt` matches PDF (recommended) |
| Unique ids | `id` unique within manifest |

Recommended response metadata (optional):

```json
{
  "manifestVersion": "1",
  "pdfContentHash": "sha256:…",
  "pageBoxes": [{ "page": 1, "widthPt": 612, "heightPt": 792, "view": [0, 0, 612, 792] }]
}
```

---

## Frontend rendering behavior (for backend test alignment)

After this hardening, the frontend:

1. Waits until container `width > 0` before rendering pages
2. Clears overlay size when container width changes
3. Sizes overlays from the **rendered canvas** `clientWidth` / `clientHeight` (floored), via `onRenderSuccess`
4. Places overlay layer **inside** the react-pdf `<Page>` (same containing block as canvas/text layer)
5. Maps manifest fractions with `overlayStylePx(coordinates, pageWidth, pageHeight)`

Backend tests should not assume overlay placement from `onLoadSuccess` page dimensions; canvas CSS pixels are authoritative on the client.

---

## Backend tests to add

### Unit: coordinate normalization

- Letter page 612×792, field at top-left 61.2×79.2 → `{ x: 0.1, y: 0.1, width: 0.1, height: 0.1 }`
- Non-zero view origin `[36, 36, 576, 756]` → normalize using **width 540**, **height 720**, not 576/756
- Bottom-left PDF point → correct `y` after flip

### Integration: manifest ↔ PDF

1. Generate contract with known amounts (e.g. deposit `$500.00`, balance `$2,000.00`)
2. Load final PDF in pdf.js; for each manifest field (except `snapshot_text`), assert the rectangle overlaps the intended blank/underline region (visual snapshot test or text-boundary heuristic)
3. Change amounts to alter line length; assert overlays still align (regression for reflow bug)

### API: signing session

- `GET /signing/:token` returns manifest whose field count/kinds match PDF intent
- Refreshing `pdfUrl` without regenerating manifest fails validation (if hash metadata enabled)

---

## Debugging checklist (signer reports misaligned boxes)

1. Hash compare: PDF at `pdfUrl` vs PDF used to build manifest
2. Confirm manifest values are fractions, not points or 0–100
3. Confirm `page` is 1-based and matches the visible page
4. Confirm generation ran **after** merge/snapshot_text
5. In browser DevTools: canvas `clientWidth` × `clientHeight` vs overlay container (should match after frontend hardening)
6. If canvas matches overlay but boxes still wrong → manifest geometry bug (backend)

---

## Related frontend files

| File | Role |
|------|------|
| `src/features/public-signing/SigningPdf.tsx` | PDF render + overlays |
| `src/features/public-signing/signingFields.ts` | `overlayStylePx`, `floorRenderedPageSize` |
| `src/features/public-signing/signingApi.ts` | `GET /signing/:token` |
| `src/features/public-signing/types.ts` | Manifest types |

---

## Changelog

| Date | Note |
|------|------|
| 2026-08-29 | Initial contract; documents top-left normalized coords and post-merge PDF requirement |
