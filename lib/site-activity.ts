import { LEARNING_PROGRESS_EVENT } from "@/lib/learning-progress";

const SITE_TRACKING_INTERVAL_MS = 60_000;
let activeCleanup: (() => void) | null = null;

export function startSiteActivityTracking() {
  if (typeof window === "undefined") {
    return () => {};
  }

  if (activeCleanup) {
    return activeCleanup;
  }

  let intervalId: number | null = null;

  const stopTracking = () => {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  };

  const sendSiteMinute = async () => {
    if (document.visibilityState !== "visible") {
      return;
    }

    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "session",
          activityType: "site",
          durationMinutes: 1,
        }),
      });

      if (response.ok) {
        window.dispatchEvent(new Event(LEARNING_PROGRESS_EVENT));
      }
    } catch {
      // Ignore transient tracking errors so the app keeps working.
    }
  };

  const startTracking = () => {
    stopTracking();
    intervalId = window.setInterval(() => {
      void sendSiteMinute();
    }, SITE_TRACKING_INTERVAL_MS);
    void sendSiteMinute();
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      startTracking();
    } else {
      stopTracking();
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("focus", startTracking);
  window.addEventListener("blur", stopTracking);

  startTracking();

  activeCleanup = () => {
    stopTracking();
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("focus", startTracking);
    window.removeEventListener("blur", stopTracking);
    activeCleanup = null;
  };

  return activeCleanup;
}
