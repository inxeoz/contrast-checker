import { Region } from './types';

const STYLES = `
.cc-overlay {
  position: fixed;
  inset: 0;
  z-index: 999999;
  cursor: crosshair;
}
.cc-mask {
  position: absolute;
  background: rgba(0, 0, 0, 0.25);
  transition: background 0.15s;
}
.cc-mask:hover {
  background: rgba(0, 0, 0, 0.35);
}
.cc-selection {
  position: absolute;
  border: 2px solid #fff;
  outline: 1px solid rgba(0, 0, 0, 0.4);
  box-sizing: border-box;
  pointer-events: none;
}
.cc-info {
  position: absolute;
  top: -28px;
  left: 0;
  background: #1a1a2e;
  color: #e0e0e0;
  padding: 4px 10px;
  border-radius: 4px;
  font: 12px/1.4 sans-serif;
  white-space: nowrap;
  pointer-events: none;
}
`;

export class RegionSelector {
  private overlay: HTMLDivElement;
  private selection: HTMLDivElement;
  private masks: HTMLDivElement[];
  private info: HTMLDivElement;
  private styleTag: HTMLStyleElement;
  private startX = 0;
  private startY = 0;
  private active = false;

  constructor(private onSelected: (region: Region) => void) {
    this.styleTag = document.createElement('style');
    this.styleTag.textContent = STYLES;
    document.documentElement.appendChild(this.styleTag);

    this.overlay = document.createElement('div');
    this.overlay.className = 'cc-overlay';

    this.selection = document.createElement('div');
    this.selection.className = 'cc-selection';

    this.info = document.createElement('div');
    this.info.className = 'cc-info';

    this.masks = [];
    for (let i = 0; i < 4; i++) {
      const mask = document.createElement('div');
      mask.className = 'cc-mask';
      this.overlay.appendChild(mask);
      this.masks.push(mask);
    }

    this.overlay.appendChild(this.selection);
    this.overlay.appendChild(this.info);
    document.documentElement.appendChild(this.overlay);

    this.bindEvents();
  }

  private bindEvents(): void {
    this.overlay.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    this.overlay.addEventListener('mouseleave', this.onMouseUp);
  }

  private onMouseDown = (e: MouseEvent): void => {
    if (e.button !== 0) return;
    this.active = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.selection.style.display = 'block';
    this.updateSelection(e.clientX, e.clientY);
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.active) return;
    this.updateSelection(e.clientX, e.clientY);
  };

  private onMouseUp = (): void => {
    if (!this.active) return;
    this.active = false;

    const rect = this.selection.getBoundingClientRect();
    const region: Region = {
      x: Math.round(rect.left),
      y: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };

    if (region.width > 5 && region.height > 5) {
      this.destroy();
      this.onSelected(region);
    } else {
      this.selection.style.display = 'none';
      this.info.textContent = '';
      this.updateMasks(0, 0, 0, 0);
    }
  };

  private updateSelection(cx: number, cy: number): void {
    const x = Math.min(this.startX, cx);
    const y = Math.min(this.startY, cy);
    const w = Math.abs(cx - this.startX);
    const h = Math.abs(cy - this.startY);

    this.selection.style.left = `${x}px`;
    this.selection.style.top = `${y}px`;
    this.selection.style.width = `${w}px`;
    this.selection.style.height = `${h}px`;

    this.updateMasks(x, y, w, h);

    this.info.textContent = `${w} × ${h}`;
    this.info.style.left = `${x}px`;
    this.info.style.top = `${Math.max(y - 28, 4)}px`;
  }

  private updateMasks(x: number, y: number, w: number, h: number): void {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    this.masks[0].style.cssText = `top:0;left:0;width:100%;height:${y}px;`;
    this.masks[1].style.cssText = `top:${y + h}px;left:0;width:100%;height:${vh - y - h}px;`;
    this.masks[2].style.cssText = `top:${y}px;left:0;width:${x}px;height:${h}px;`;
    this.masks[3].style.cssText = `top:${y}px;left:${x + w}px;width:${vw - x - w}px;height:${h}px;`;
  }

  destroy(): void {
    this.overlay.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    this.overlay.removeEventListener('mouseleave', this.onMouseUp);
    this.overlay.remove();
    this.styleTag.remove();
  }
}
