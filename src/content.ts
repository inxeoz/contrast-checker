import { analyzeRegion } from './analyzer';
import { RegionSelector } from './region-selector';
import { ContrastPopup } from './popup-ui';
import type { Region } from './types';

if (!(window as any).__ccInjected) {
  (window as any).__ccInjected = true;

  let activePopup: ContrastPopup | null = null;
  let activeSelector: RegionSelector | null = null;

  function activate(): void {
    if (activePopup) {
      activePopup.destroy();
      activePopup = null;
    }

    activeSelector = new RegionSelector((region: Region) => {
      activeSelector = null;
      runAnalysis(region);
    });
  }

  function runAnalysis(region: Region): void {
    const results = analyzeRegion(region);

    activePopup = new ContrastPopup({
      onRecheck: () => {
        if (activePopup) {
          activePopup.destroy();
          activePopup = null;
        }
        activate();
      },
      onClose: () => {
        if (activePopup) {
          activePopup.destroy();
          activePopup = null;
        }
      },
    });

    activePopup.show(results, region);
  }

  browser.runtime.onMessage.addListener((msg: unknown) => {
    if ((msg as { action: string }).action === 'activate-region-selector') {
      activate();
    }
  });
}
