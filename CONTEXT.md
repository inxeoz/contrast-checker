# Contrast Checker

## Glossary

| Term | Definition |
|------|-----------|
| **Region** | A rectangular area of the viewport selected by the user via click-and-drag. Defined by x, y, width, height in viewport coordinates. |
| **Contrast ratio** | Ratio computed by the WCAG 2.1 relative luminance formula: `(L1 + 0.05) / (L2 + 0.05)`, where L1 is the lighter of the two luminances. |
| **Meaningful element** | An element in the selected region that visibly contributes to the page: has direct text content, a visible border/outline, an explicit non-transparent background, or is an interactive control. Purely structural wrappers are excluded. |
| **Check type** | What contrast is being measured: `text` (foreground color vs background), `border` (border color vs element background), or `graphic` (icon/foreground graphic vs background). |
| **WCAG AA** | Minimum contrast: 4.5:1 for normal text, 3:1 for large text (≥18pt or ≥14pt bold) and UI components. |
| **WCAG AAA** | Enhanced contrast: 7:1 for normal text, 4.5:1 for large text. |
| **Active tab** | The browser tab the user is currently viewing. Extension has temporary access via the `activeTab` permission when invoked. |
