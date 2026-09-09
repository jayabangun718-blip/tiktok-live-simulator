import { useEffect } from "react";
import { Platform } from "react-native";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";

// Keeps the screen on during a live session. Only runs on native (APK/iOS);
// the browser Wake Lock API is unreliable and throws on navigation, so we skip it on web.
export function useKeepScreenAwake() {
  useEffect(() => {
    if (Platform.OS === "web") return;
    activateKeepAwakeAsync().catch(() => {});
    return () => {
      try {
        deactivateKeepAwake();
      } catch {}
    };
  }, []);
}
