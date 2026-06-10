export function parseRgbColor(css: string): { r: number; g: number; b: number; a: number } | null {
  const rgb = css.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (rgb) return { r: +rgb[1], g: +rgb[2], b: +rgb[3], a: 1 };

  const rgba = css.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);
  if (rgba) return { r: +rgba[1], g: +rgba[2], b: +rgba[3], a: +rgba[4] };

  return null;
}

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

export function contrastRatio(fg: string, bg: string): number {
  const fgColor = parseRgbColor(fg);
  const bgColor = parseRgbColor(bg);
  if (!fgColor || !bgColor) return 0;

  const l1 = relativeLuminance(fgColor.r, fgColor.g, fgColor.b);
  const l2 = relativeLuminance(bgColor.r, bgColor.g, bgColor.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

export function isLargeText(element: Element): boolean {
  const style = getComputedStyle(element);
  const size = parseFloat(style.fontSize);
  const weight = parseInt(style.fontWeight);
  return size >= 18 || (size >= 14 && weight >= 700);
}

export function blendColors(
  fg: { r: number; g: number; b: number; a: number },
  bg: { r: number; g: number; b: number; a: number }
): { r: number; g: number; b: number; a: number } {
  const alpha = fg.a;
  return {
    r: Math.round(fg.r * alpha + bg.r * (1 - alpha)),
    g: Math.round(fg.g * alpha + bg.g * (1 - alpha)),
    b: Math.round(fg.b * alpha + bg.b * (1 - alpha)),
    a: 1,
  };
}
