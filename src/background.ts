// 확장 설치·새로고침 전에 열린 탭에는 content script가 없으므로, 응답이 없으면 주입한 뒤 다시 보낸다.
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id === undefined) return;
  try {
    await chrome.tabs.sendMessage(tab.id, "toggle");
  } catch {
    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
      await chrome.tabs.sendMessage(tab.id, "toggle");
    } catch {
      // 주입할 수 없는 탭(chrome:// 등): 동작하지 않는다.
    }
  }
});
