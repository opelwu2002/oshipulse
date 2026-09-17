/**
 * 設備指紋辨識工具
 * 採用 @fingerprintjs/fingerprintjs 獲取唯一設備 visitorId 用於防弊防刷投票
 */
import FingerprintJS from "@fingerprintjs/fingerprintjs";

let fpPromise: Promise<string> | null = null;

export async function getDeviceFingerprint(): Promise<string> {
  if (typeof window === "undefined") {
    return "server-env-fallback";
  }

  // 優先從本地記憶快取讀取
  const cachedFp = localStorage.getItem("oshipulse_device_fp");
  if (cachedFp) {
    return cachedFp;
  }

  if (!fpPromise) {
    fpPromise = (async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const visitorId = result.visitorId;
        localStorage.setItem("oshipulse_device_fp", visitorId);
        return visitorId;
      } catch (err) {
        console.warn("無法取得標準設備指紋，啟用降級隨機標識：", err);
        const fallbackId = "dev_" + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
        localStorage.setItem("oshipulse_device_fp", fallbackId);
        return fallbackId;
      }
    })();
  }

  return fpPromise;
}
