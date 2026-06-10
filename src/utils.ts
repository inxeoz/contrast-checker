import { Region } from './types';
import { parseRgbColor, blendColors } from './contrast';

export function getDirectTextContent(element: Element): string {
  let text = '';
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent || '';
    }
  }
  return text.trim();
}

export function getElementSelector(element: Element): string {
  if (element.id) return `#${element.id}`;

  const path: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.body && current !== document.documentElement) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      path.unshift(`#${current.id}`);
      break;
    }

    const parent: HTMLElement | null = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (s: Element) => s.tagName === current!.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    if (current.classList.length > 0) {
      for (const cls of current.classList) {
        if (!cls.startsWith('_') && !cls.startsWith('ng-') && !cls.startsWith('v-')) {
          selector += `.${cls}`;
          break;
        }
      }
    }

    path.unshift(selector);
    current = parent;
  }

  return path.join(' > ');
}

export function getComputedBackground(element: Element): string {
  let current: Element | null = element;
  let blended: { r: number; g: number; b: number; a: number } | null = null;

  while (current) {
    const style = getComputedStyle(current);
    const bg = style.backgroundColor;

    if (bg === 'transparent') {
      current = current.parentElement;
      continue;
    }

    const color = parseRgbColor(bg);
    if (!color) {
      current = current.parentElement;
      continue;
    }

    if (color.a >= 1) {
      return bg;
    }

    if (blended) {
      blended = blendColors(color, blended);
    } else {
      blended = blendColors(color, { r: 255, g: 255, b: 255, a: 1 });
    }

    current = current.parentElement;
  }

  if (blended) {
    return `rgb(${blended.r}, ${blended.g}, ${blended.b})`;
  }

  const htmlBg = getComputedStyle(document.documentElement).backgroundColor;
  if (htmlBg && htmlBg !== 'transparent') return htmlBg;

  return 'rgb(255, 255, 255)';
}

export function getVisibleBorderColor(element: Element): string | null {
  const style = getComputedStyle(element);
  const sides = ['top', 'right', 'bottom', 'left'];

  for (const side of sides) {
    const width = parseFloat(style.getPropertyValue(`border-${side}-width`));
    const color = style.getPropertyValue(`border-${side}-color`);
    if (width > 0 && color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)') {
      return color;
    }
  }

  return null;
}

const SKIP_TAGS = new Set([
  'script', 'style', 'link', 'meta', 'head', 'br', 'hr', 'wbr',
  'template', 'slot',
]);

const INTERACTIVE_TAGS = new Set([
  'a', 'button', 'input', 'select', 'textarea', 'summary',
]);

export function isMeaningfulElement(element: Element): boolean {
  const tag = element.tagName.toLowerCase();
  if (SKIP_TAGS.has(tag)) return false;

  const style = getComputedStyle(element);
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    parseFloat(style.opacity) === 0
  ) return false;

  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;

  if (tag === 'html' || tag === 'body') return false;

  // Has direct text content
  const text = getDirectTextContent(element);
  if (text.length > 0) return true;

  // Interactive element
  if (INTERACTIVE_TAGS.has(tag)) return true;
  if (element.getAttribute('role') === 'button') return true;
  if (element.getAttribute('tabindex') !== null) return true;

  // Has explicit non-transparent background
  const bg = style.backgroundColor;
  if (bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
    const color = parseRgbColor(bg);
    if (color && color.a > 0) return true;
  }

  // Has visible border
  for (const side of ['top', 'right', 'bottom', 'left'] as const) {
    const width = parseFloat(style.getPropertyValue(`border-${side}-width`));
    const color = style.getPropertyValue(`border-${side}-color`);
    if (width > 0 && color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)') return true;
  }

  return false;
}

export function getElementsInRegion(region: Region): Element[] {
  const all = document.querySelectorAll('*');
  const result: Element[] = [];

  for (const el of all) {
    if (!isMeaningfulElement(el)) continue;

    const rect = el.getBoundingClientRect();
    const overlap =
      rect.left < region.x + region.width &&
      rect.right > region.x &&
      rect.top < region.y + region.height &&
      rect.bottom > region.y;

    if (overlap) {
      result.push(el);
    }
  }

  return result;
}
