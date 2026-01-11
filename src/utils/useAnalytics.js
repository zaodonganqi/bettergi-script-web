/**
 * Google Analytics 埋点工具
 * 根据环境变量 VITE_APP_ENV 自动判断是否上报
 */

export function trackEvent(eventName, eventParams = {}) {
  if (import.meta.env.VITE_APP_ENV === 'test') {
    return;
  }

  if (typeof window.gtag === 'function') {
    window.gtag("event", eventName, eventParams);
  } else {
    // console.warn('GA gtag is not defined');
  }
}
