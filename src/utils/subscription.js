// 订阅工具：构建订阅 URL，并在本地模式下执行导入

import { useMainStore } from "@/stores/mainStore.js";
import { trackEvent } from '@/utils/useAnalytics.js';

export function buildSubscriptionUrl(paths) {
  const jsonString = JSON.stringify(paths);
  const base64String = btoa(encodeURIComponent(jsonString));
  return `bettergi://script?import=${base64String}`;
}

export async function subscribePaths(paths) {
  const mainStore = useMainStore();
  const environment = mainStore.isModeSingle ? 'single' : 'web';
  // 防刷榜：检查 12 小时内是否重复订阅
  const checkSpam = (identifier) => {
    const KEY = 'subscription_tracking_history';
    const COOLDOWN = 3600 * 1000 * 12;
    let history = {};
    try {
      history = JSON.parse(localStorage.getItem(KEY) || '{}');
    } catch (e) {
      history = {};
    }
    const now = Date.now();

    // 清理过期数据
    let changed = false;
    Object.keys(history).forEach(k => {
      if (now - history[k] > COOLDOWN) {
        delete history[k];
        changed = true;
      }
    });

    if (history[identifier] && now - history[identifier] < COOLDOWN) {
      if (changed) localStorage.setItem(KEY, JSON.stringify(history));
      return false; // 处于冷却期，不记录
    }

    history[identifier] = now;
    localStorage.setItem(KEY, JSON.stringify(history));
    return true; // 允许记录
  };

  if (Array.isArray(paths)) {
    paths.forEach(path => {
      const label = typeof path === 'string' ? path : JSON.stringify(path);
      if (checkSpam(label)) {
        trackEvent("subscribe_path", {
          event_category: "subscription",
          event_label: label,
          environment: environment,
        });
      }
    });
  } else {
    const label = JSON.stringify(paths);
    if (checkSpam(label)) {
      trackEvent("subscribe_path", {
        event_category: "subscription",
        event_label: label,
        environment: environment,
      });
    }
  }

  const url = buildSubscriptionUrl(paths);
  if (mainStore.isModeSingle) {
    const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
    await repoWebBridge.ImportUri(url);
    return { ok: true, url };
  }
  // Web 模式由调用方自行复制 URL
  return { ok: true, url, needsCopy: true };
}
