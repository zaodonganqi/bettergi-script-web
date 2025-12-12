// 订阅工具：构建订阅 URL，并在本地模式下执行导入

import { useMainStore } from "@/stores/mainStore.js";
import { event } from "vue-gtag";

export function buildSubscriptionUrl(paths) {
  const jsonString = JSON.stringify(paths);
  const base64String = btoa(encodeURIComponent(jsonString));
  return `bettergi://script?import=${base64String}`;
}

export async function subscribePaths(paths) {
  if (Array.isArray(paths)) {
    paths.forEach(path => {
      event("subscribe_path", {
        event_category: "subscription",
        event_label: typeof path === 'string' ? path : JSON.stringify(path)
      });
    });
  } else {
    event("subscribe_path", {
      event_category: "subscription",
      event_label: JSON.stringify(paths)
    });
  }
  const url = buildSubscriptionUrl(paths);
  const mainStore = useMainStore();
  if (mainStore.isModeSingle) {
    const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
    await repoWebBridge.ImportUri(url);
    return { ok: true, url };
  }
  // Web 模式由调用方自行复制 URL
  return { ok: true, url, needsCopy: true };
}
