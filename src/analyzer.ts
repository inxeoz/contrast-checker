import { ContrastResult, Region } from './types';
import {
  getElementsInRegion,
  getDirectTextContent,
  getElementSelector,
  getComputedBackground,
  getVisibleBorderColor,
} from './utils';
import { contrastRatio, isLargeText } from './contrast';

export function analyzeRegion(region: Region): ContrastResult[] {
  const elements = getElementsInRegion(region);
  const results: ContrastResult[] = [];

  for (const el of elements) {
    const style = getComputedStyle(el);
    const selector = getElementSelector(el);
    const tag = el.tagName.toLowerCase();
    const text = getDirectTextContent(el);
    const bg = getComputedBackground(el);

    // Text check
    if (text.length > 0) {
      const fg = style.color;
      const ratio = contrastRatio(fg, bg);
      const large = isLargeText(el);
      results.push({
        selector,
        tag,
        text: text.substring(0, 120),
        foreground: fg,
        background: bg,
        contrastRatio: Math.round(ratio * 100) / 100,
        wcagAA: ratio >= (large ? 3 : 4.5) ? 'pass' : 'fail',
        wcagAAA: ratio >= (large ? 4.5 : 7) ? 'pass' : 'fail',
        checkType: 'text',
        isLargeText: large,
      });
    }

    // Border check
    const borderColor = getVisibleBorderColor(el);
    if (borderColor) {
      const ratio = contrastRatio(borderColor, bg);
      if (ratio > 0) {
        results.push({
          selector,
          tag,
          text: text.substring(0, 80),
          foreground: borderColor,
          background: bg,
          contrastRatio: Math.round(ratio * 100) / 100,
          wcagAA: ratio >= 3 ? 'pass' : 'fail',
          wcagAAA: ratio >= 4.5 ? 'pass' : 'fail',
          checkType: 'border',
          isLargeText: false,
        });
      }
    }
  }

  return results;
}
