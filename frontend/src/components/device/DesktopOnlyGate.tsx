import { useCallback, useEffect, useState } from "react";
import DesktopOnlyBlockedPage from "./DesktopOnlyBlockedPage";
import {
  analyzeDevice,
  getDefaultDeviceInfo,
  type DeviceInfo,
} from "./deviceDetection";

interface DesktopOnlyGateProps {
  children: React.ReactNode;
}

function logGateStatus(info: DeviceInfo) {
  if (!import.meta.env.DEV) return;
  console.info("[DesktopOnlyGate] Detected device gate status:", {
    blocked: info.blocked,
    deviceType: info.deviceType,
    screenWidth: info.screenWidth,
    ready: info.ready,
  });
}

export default function DesktopOnlyGate({ children }: DesktopOnlyGateProps) {
  const [info, setInfo] = useState<DeviceInfo>(getDefaultDeviceInfo);

  const checkDevice = useCallback(() => {
    try {
      const next = analyzeDevice();
      setInfo(next);
      logGateStatus(next);
    } catch (error) {
      const fallback: DeviceInfo = {
        deviceType: "Unknown",
        screenWidth: 0,
        blocked: true,
        ready: true,
      };
      setInfo(fallback);
      if (import.meta.env.DEV) {
        console.warn("[DesktopOnlyGate] Detection failed, blocking access:", error);
      }
    }
  }, []);

  useEffect(() => {
    checkDevice();

    if (typeof window === "undefined") return;

    window.addEventListener("resize", checkDevice);
    window.addEventListener("orientationchange", checkDevice);

    const portraitQuery = window.matchMedia?.("(orientation: portrait)");
    const onPortraitChange = () => checkDevice();
    portraitQuery?.addEventListener?.("change", onPortraitChange);

    return () => {
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("orientationchange", checkDevice);
      portraitQuery?.removeEventListener?.("change", onPortraitChange);
    };
  }, [checkDevice]);

  if (info.blocked) {
    return <DesktopOnlyBlockedPage info={info} />;
  }

  return <>{children}</>;
}
