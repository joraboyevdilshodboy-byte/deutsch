import { useEffect, useState } from "react";

export const LEVELS = ["A1", "A2", "B1", "B2"] as const;
export type UserLevel = (typeof LEVELS)[number];

export const USER_LEVEL_STORAGE_KEY = "userLevelPreference";
export const USER_LEVEL_EVENT = "user-level-changed";

export function getStoredLevel(): UserLevel {
  if (typeof window === "undefined") return "A1";
  const stored = window.localStorage.getItem(USER_LEVEL_STORAGE_KEY);
  if (!stored) return "A1";
  // If stored value is corrupted (e.g. JSON array or combined string), try to recover
  // by extracting the first valid level token. This prevents multiple-active UI states
  // when some other code accidentally wrote a composite value.
  if (LEVELS.includes(stored as UserLevel)) return stored as UserLevel;
  const match = stored.match(/A1|A2|B1|B2/);
  return match && LEVELS.includes(match[0] as UserLevel) ? (match[0] as UserLevel) : "A1";
}

export function setStoredLevel(level: UserLevel) {
  if (typeof window === "undefined") return;
  // Sanitize input and only persist a single valid level string.
  const next = LEVELS.includes(level) ? level : "A1";
  window.localStorage.setItem(USER_LEVEL_STORAGE_KEY, next);
  window.dispatchEvent(new CustomEvent(USER_LEVEL_EVENT, { detail: level }));
}

export function getLevelLabel(level: UserLevel) {
  switch (level) {
    case "A2":
      return "A2 — o‘rta bosqich";
    case "B1":
      return "B1 — mustahkam bosqich";
    case "B2":
      return "B2 — ilg‘or bosqich";
    default:
      return "A1 — boshlang‘ich bosqich";
  }
}

export function useUserLevel() {
  const [level, setLevelState] = useState<UserLevel>(getStoredLevel);

  useEffect(() => {
    const handleLevelChange = () => setLevelState(getStoredLevel());
    handleLevelChange();
    window.addEventListener(USER_LEVEL_EVENT, handleLevelChange as EventListener);
    return () => window.removeEventListener(USER_LEVEL_EVENT, handleLevelChange as EventListener);
  }, []);

  const setLevel = (nextLevel: UserLevel) => {
    setStoredLevel(nextLevel);
    setLevelState(nextLevel);
  };

  return [level, setLevel] as const;
}
