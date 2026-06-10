function createMenu(): void {
  browser.menus.create({
    id: 'check-contrast',
    title: 'Check Contrast',
    contexts: ['all'],
  });
}

createMenu();
browser.runtime.onInstalled.addListener(createMenu);

browser.menus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== 'check-contrast' || !tab?.id || !tab.url) return;
  if (!tab.url.startsWith('http')) return;

  const tabId = tab.id;

  browser.tabs.sendMessage(tabId, { action: 'activate-region-selector' }).catch(() => {
    browser.scripting.executeScript({
      target: { tabId },
      files: ['content.js'],
    }).then(() => {
      browser.tabs.sendMessage(tabId, { action: 'activate-region-selector' }).catch((e) => {
        console.error('Contrast Checker: activation failed', e);
      });
    }).catch((e) => {
      console.error('Contrast Checker: injection failed', e);
    });
  });
});
