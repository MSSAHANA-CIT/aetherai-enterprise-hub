const MIN_WIDTH = 1024;
const TOUCH_TABLET_MAX_WIDTH = 1180;
const PORTRAIT_MAX_WIDTH = 1180;

export interface DeviceInfo {
  deviceType: string;
  screenWidth: number;
  blocked: boolean;
  ready: boolean;
}

function safeUA(): string {
  try {
    if (typeof navigator !== "undefined" && navigator.userAgent) {
      return navigator.userAgent;
    }
  } catch {
    /* ignore */
  }
  return "";
}

function safeWidth(): number {
  try {
    if (typeof window !== "undefined" && typeof window.innerWidth === "number") {
      return window.innerWidth;
    }
  } catch {
    /* ignore */
  }
  return 0;
}

function safeMaxTouchPoints(): number {
  try {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.maxTouchPoints === "number"
    ) {
      return navigator.maxTouchPoints;
    }
  } catch {
    /* ignore */
  }
  return 0;
}

function safeIsTouchDevice(): boolean {
  try {
    if (typeof window === "undefined") return false;
    return (
      safeMaxTouchPoints() > 0 ||
      "ontouchstart" in window ||
      window.matchMedia?.("(pointer: coarse)")?.matches === true
    );
  } catch {
    return false;
  }
}

function safeIsPortrait(width: number): boolean {
  try {
    if (typeof window === "undefined") return width > 0 && width < PORTRAIT_MAX_WIDTH;
    if (window.matchMedia?.("(orientation: portrait)")?.matches) return true;
    const height =
      typeof window.innerHeight === "number" ? window.innerHeight : 0;
    return height > width;
  } catch {
    return false;
  }
}

function detectMobilePhone(ua: string): boolean {
  return /Android.*Mobile|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini|Windows Phone|Mobile Safari/i.test(
    ua,
  );
}

function detectIPad(ua: string, maxTouchPoints: number): boolean {
  if (/iPad/i.test(ua)) return true;
  if (/Macintosh/i.test(ua) && maxTouchPoints > 1) return true;
  return false;
}

function detectAndroidTablet(ua: string): boolean {
  return /Android/i.test(ua) && !/Mobile/i.test(ua);
}

function detectGenericTablet(ua: string): boolean {
  return /Tablet|PlayBook|Silk|Kindle/i.test(ua);
}

export function analyzeDevice(): DeviceInfo {
  const ua = safeUA();
  const width = safeWidth();
  const maxTouchPoints = safeMaxTouchPoints();
  const isTouch = safeIsTouchDevice();
  const isPortrait = safeIsPortrait(width);

  const isNarrow = width < MIN_WIDTH;
  const isMobile = detectMobilePhone(ua);
  const isIPad = detectIPad(ua, maxTouchPoints);
  const isAndroidTablet = detectAndroidTablet(ua);
  const isGenericTablet = detectGenericTablet(ua);
  const isTouchTablet =
    isTouch && maxTouchPoints > 1 && width > 0 && width < TOUCH_TABLET_MAX_WIDTH;
  const isPortraitBlocked = isPortrait && width > 0 && width < PORTRAIT_MAX_WIDTH;

  let deviceType = "Desktop";
  if (isIPad) deviceType = "iPad";
  else if (isAndroidTablet) deviceType = "Android Tablet";
  else if (isMobile) deviceType = "Mobile";
  else if (isGenericTablet) deviceType = "Tablet";
  else if (isTouchTablet) deviceType = "Tablet";
  else if (isPortraitBlocked && !isNarrow) deviceType = "Small Screen";
  else if (isNarrow) deviceType = "Small Screen";

  const blocked =
    isNarrow ||
    isMobile ||
    isIPad ||
    isAndroidTablet ||
    isGenericTablet ||
    isTouchTablet ||
    isPortraitBlocked;

  return {
    deviceType,
    screenWidth: width,
    blocked,
    ready: true,
  };
}

export function getDefaultDeviceInfo(): DeviceInfo {
  const width = safeWidth();
  return {
    deviceType: width > 0 && width < MIN_WIDTH ? "Small Screen" : "Detecting",
    screenWidth: width,
    blocked: true,
    ready: false,
  };
}

export const DEVICE_GATE_MIN_WIDTH = MIN_WIDTH;
