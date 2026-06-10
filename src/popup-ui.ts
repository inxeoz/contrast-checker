import { ContrastResult, Region, ExportData } from './types';

const POPUP_STYLES = `
.cc-popup {
  all: initial;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  max-height: 80vh;
  background: #1a1a2e;
  color: #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  z-index: 1000000;
  font: 13px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none;
}
.cc-popup * {
  all: unset;
  display: revert;
  box-sizing: border-box;
}
.cc-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #16213e;
  border-radius: 12px 12px 0 0;
  cursor: move;
  flex-shrink: 0;
}
.cc-popup-title {
  font-weight: 600;
  font-size: 14px;
  color: #e0e0e0;
}
.cc-popup-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  color: #888;
  background: transparent;
  border: none;
}
.cc-popup-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e0e0e0;
}
.cc-popup-summary {
  padding: 12px 16px;
  background: #0f3460;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.cc-summary-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}
.cc-summary-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.cc-summary-label {
  color: #aaa;
}
.cc-summary-value {
  font-weight: 600;
  color: #e0e0e0;
}
.cc-popup-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  min-height: 0;
}
.cc-result {
  padding: 10px 12px;
  margin-bottom: 6px;
  background: #16213e;
  border-radius: 8px;
  border-left: 3px solid #555;
}
.cc-result.pass-aa {
  border-left-color: #4caf50;
}
.cc-result.fail-aa {
  border-left-color: #f44336;
}
.cc-result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 6px;
}
.cc-result-text {
  font-size: 13px;
  color: #e0e0e0;
  word-break: break-word;
  line-height: 1.4;
}
.cc-result-meta {
  font-size: 11px;
  color: #888;
  margin-top: 1px;
}
.cc-result-body {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.cc-colors {
  display: flex;
  align-items: center;
  gap: 6px;
}
.cc-swatch {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
}
.cc-color-hex {
  font-size: 11px;
  color: #aaa;
  font-family: 'SF Mono', 'Fira Code', monospace;
}
.cc-ratio {
  font-weight: 700;
  font-size: 14px;
  color: #e0e0e0;
}
.cc-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.3;
}
.cc-badge.pass {
  background: rgba(76, 175, 80, 0.2);
  color: #81c784;
}
.cc-badge.fail {
  background: rgba(244, 67, 54, 0.2);
  color: #e57373;
}
.cc-badges {
  display: flex;
  gap: 4px;
}
.cc-check-type {
  font-size: 10px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.cc-popup-footer {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #16213e;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}
.cc-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 0.15s;
}
.cc-btn-primary {
  background: #0f3460;
  color: #e0e0e0;
}
.cc-btn-primary:hover {
  background: #1a4a8a;
}
.cc-btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #e0e0e0;
}
.cc-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
}
.cc-resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
  background: linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.15) 50%);
  border-radius: 0 0 12px 0;
}
.cc-empty {
  padding: 32px 16px;
  text-align: center;
  color: #888;
  font-size: 13px;
}
`;

function rgbToHex(rgb: string): string {
  const m = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!m) return rgb;
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(+m[1])}${toHex(+m[2])}${toHex(+m[3])}`;
}

function formatTime(): string {
  return new Date().toISOString();
}

export class ContrastPopup {
  private el: HTMLDivElement;
  private styleTag: HTMLStyleElement;
  private isDragging = false;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private isResizing = false;
  private resizeStartX = 0;
  private resizeStartY = 0;
  private resizeStartW = 0;
  private resizeStartH = 0;
  private results: ContrastResult[] = [];
  private region: Region = { x: 0, y: 0, width: 0, height: 0 };

  constructor(
    private callbacks: {
      onRecheck: () => void;
      onClose: () => void;
    }
  ) {
    this.styleTag = document.createElement('style');
    this.styleTag.textContent = POPUP_STYLES;
    document.documentElement.appendChild(this.styleTag);

    this.el = document.createElement('div');
    this.el.className = 'cc-popup';
  }

  show(results: ContrastResult[], region: Region): void {
    this.results = results;
    this.region = region;

    this.el.innerHTML = '';
    this.el.appendChild(this.buildHeader());
    this.el.appendChild(this.buildSummary());
    this.el.appendChild(this.buildList());
    this.el.appendChild(this.buildFooter());

    const handle = document.createElement('div');
    handle.className = 'cc-resize-handle';
    this.el.appendChild(handle);

    document.documentElement.appendChild(this.el);
    this.bindDrag();
    this.bindResize(handle);
  }

  private buildHeader(): HTMLDivElement {
    const header = document.createElement('div');
    header.className = 'cc-popup-header';
    header.innerHTML = `
      <span class="cc-popup-title">Contrast Checker</span>
      <button class="cc-popup-close">✕</button>
    `;

    header.querySelector('.cc-popup-close')!.addEventListener('click', () => {
      this.callbacks.onClose();
    });

    return header;
  }

  private buildSummary(): HTMLDivElement {
    const summary = document.createElement('div');
    summary.className = 'cc-popup-summary';

    const total = this.results.length;
    const passAA = this.results.filter((r) => r.wcagAA === 'pass').length;
    const failAA = total - passAA;
    const passAAA = this.results.filter((r) => r.wcagAAA === 'pass').length;
    const failAAA = total - passAAA;

    summary.innerHTML = `
      <span class="cc-summary-item">
        <span class="cc-summary-label">Total:</span>
        <span class="cc-summary-value">${total}</span>
      </span>
      <span class="cc-summary-item">
        <span class="cc-summary-dot" style="background:#4caf50"></span>
        <span class="cc-summary-label">AA:</span>
        <span class="cc-summary-value" style="color:#81c784">${passAA}</span>
        <span class="cc-summary-label">/</span>
        <span class="cc-summary-value" style="color:#e57373">${failAA}</span>
      </span>
      <span class="cc-summary-item">
        <span class="cc-summary-dot" style="background:#4caf50"></span>
        <span class="cc-summary-label">AAA:</span>
        <span class="cc-summary-value" style="color:#81c784">${passAAA}</span>
        <span class="cc-summary-label">/</span>
        <span class="cc-summary-value" style="color:#e57373">${failAAA}</span>
      </span>
    `;

    return summary;
  }

  private buildList(): HTMLDivElement {
    const list = document.createElement('div');
    list.className = 'cc-popup-list';

    if (this.results.length === 0) {
      list.innerHTML = '<div class="cc-empty">No elements found in this region.</div>';
      return list;
    }

    const sorted = [...this.results].sort((a, b) => a.contrastRatio - b.contrastRatio);

    for (const result of sorted) {
      const card = document.createElement('div');
      card.className = `cc-result ${result.wcagAA === 'pass' ? 'pass-aa' : 'fail-aa'}`;

      const fgHex = rgbToHex(result.foreground);
      const bgHex = rgbToHex(result.background);

      card.innerHTML = `
        <div class="cc-result-header">
          <div>
            <div class="cc-result-text">${this.escape(result.text || `<${result.tag}>`)}</div>
            <div class="cc-result-meta">${this.escape(result.selector)}</div>
          </div>
          <div class="cc-badges">
            <span class="cc-badge ${result.wcagAA}">AA</span>
            <span class="cc-badge ${result.wcagAAA}">AAA</span>
          </div>
        </div>
        <div class="cc-result-body">
          <div class="cc-colors">
            <span class="cc-swatch" style="background:${result.foreground}"></span>
            <span class="cc-color-hex">${fgHex}</span>
          </div>
          <span style="color:#555">→</span>
          <div class="cc-colors">
            <span class="cc-swatch" style="background:${result.background}"></span>
            <span class="cc-color-hex">${bgHex}</span>
          </div>
          <span class="cc-ratio">${result.contrastRatio}:1</span>
          <span class="cc-check-type">${result.checkType}${result.isLargeText ? ' (large)' : ''}</span>
        </div>
      `;

      list.appendChild(card);
    }

    return list;
  }

  private buildFooter(): HTMLDivElement {
    const footer = document.createElement('div');
    footer.className = 'cc-popup-footer';

    const recheck = document.createElement('button');
    recheck.className = 'cc-btn cc-btn-secondary';
    recheck.textContent = 'Re-check';
    recheck.addEventListener('click', () => this.callbacks.onRecheck());

    const spacer = document.createElement('div');
    spacer.style.flex = '1';

    const exportBtn = document.createElement('button');
    exportBtn.className = 'cc-btn cc-btn-primary';
    exportBtn.textContent = 'Export JSON';
    exportBtn.addEventListener('click', () => this.doExport());

    footer.append(recheck, spacer, exportBtn);
    return footer;
  }

  private doExport(): void {
    const data: ExportData = {
      url: window.location.href,
      region: this.region,
      timestamp: formatTime(),
      results: this.results,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contrast-check-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private bindDrag(): void {
    const header = this.el.querySelector('.cc-popup-header') as HTMLElement;
    if (!header) return;

    const onDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.cc-popup-close')) return;
      this.isDragging = true;
      this.dragOffsetX = e.clientX - this.el.offsetLeft;
      this.dragOffsetY = e.clientY - this.el.offsetTop;
      this.el.style.transition = 'none';
    };

    const onMove = (e: MouseEvent) => {
      if (!this.isDragging) return;
      this.el.style.left = `${e.clientX - this.dragOffsetX}px`;
      this.el.style.top = `${e.clientY - this.dragOffsetY}px`;
      this.el.style.transform = 'none';
    };

    const onUp = () => {
      this.isDragging = false;
    };

    header.addEventListener('mousedown', onDown);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  private bindResize(handle: HTMLElement): void {
    const onDown = (e: MouseEvent) => {
      e.stopPropagation();
      this.isResizing = true;
      this.resizeStartX = e.clientX;
      this.resizeStartY = e.clientY;
      this.resizeStartW = this.el.offsetWidth;
      this.resizeStartH = this.el.offsetHeight;
    };

    const onMove = (e: MouseEvent) => {
      if (!this.isResizing) return;
      const dw = e.clientX - this.resizeStartX;
      const dh = e.clientY - this.resizeStartY;
      this.el.style.width = `${Math.max(320, this.resizeStartW + dw)}px`;
      this.el.style.height = `${Math.max(200, this.resizeStartH + dh)}px`;
      this.el.style.maxHeight = 'none';
    };

    const onUp = () => {
      this.isResizing = false;
    };

    handle.addEventListener('mousedown', onDown);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  private escape(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  destroy(): void {
    this.el.remove();
    this.styleTag.remove();
  }
}
