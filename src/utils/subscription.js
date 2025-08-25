// 订阅工具：构建订阅 URL，并在本地模式下执行导入

export function buildSubscriptionUrl(paths) {
  const jsonString = JSON.stringify(paths);
  const base64String = btoa(encodeURIComponent(jsonString));
  return `bettergi://script?import=${base64String}`;
}

export async function subscribePaths(paths) {
  const url = buildSubscriptionUrl(paths);
  const mode = import.meta.env.VITE_MODE;
  if (mode === 'single') {
    const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
    await repoWebBridge.ImportUri(url);
    return { ok: true, url };
  }
  // Web 模式由调用方自行复制 URL
  return { ok: true, url, needsCopy: true };
}

export async function subscribePath(path) {
  return subscribePaths([path]);
}


