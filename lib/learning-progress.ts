export type LearningModule = "grammar" | "listening" | "reading" | "writing" | "vocabulary" | "speaking";

export type LearningActivity = {
  date: string;
  minutes: number;
  completed: number;
  correct: number;
  attempted: number;
  modules: Partial<Record<LearningModule, number>>;
};

const STORAGE_KEY = "deutsch-gg-learning-activity";
export const LEARNING_PROGRESS_EVENT = "deutsch-gg-learning-progress";

function dayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function emptyActivities(): LearningActivity[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return {
      date: dayKey(date),
      minutes: 0,
      completed: 0,
      correct: 0,
      attempted: 0,
      modules: {},
    };
  });
}

export function getLearningActivity(): LearningActivity[] {
  if (typeof window === "undefined") return emptyActivities();
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return emptyActivities();
    const parsed = JSON.parse(saved) as LearningActivity[];
    return Array.isArray(parsed) ? parsed : emptyActivities();
  } catch {
    return emptyActivities();
  }
}

export function recordLearningActivity({
  module,
  minutes = 5,
  correct = 0,
  attempted = 0,
}: {
  module: LearningModule;
  minutes?: number;
  correct?: number;
  attempted?: number;
}) {
  if (typeof window === "undefined") return;

  const activities = getLearningActivity();
  const today = dayKey();
  const existingIndex = activities.findIndex((item) => item.date === today);
  const previous = existingIndex >= 0
    ? activities[existingIndex]
    : { date: today, minutes: 0, completed: 0, correct: 0, attempted: 0, modules: {} };
  const updated: LearningActivity = {
    ...previous,
    minutes: previous.minutes + minutes,
    completed: previous.completed + 1,
    correct: previous.correct + correct,
    attempted: previous.attempted + attempted,
    modules: { ...previous.modules, [module]: (previous.modules[module] ?? 0) + 1 },
  };
  const next = existingIndex >= 0
    ? activities.map((item, index) => (index === existingIndex ? updated : item))
    : [...activities, updated];

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(LEARNING_PROGRESS_EVENT));
  } catch {
    // Private browsing or a full storage quota should not block the learning flow.
  }
}

export function sevenDayActivity(activities = getLearningActivity()) {
  const values = new Map(activities.map((item) => [item.date, item]));
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const key = dayKey(date);
    return values.get(key) ?? { date: key, minutes: 0, completed: 0, correct: 0, attempted: 0, modules: {} };
  });
}

export function getStreak(activities = getLearningActivity()) {
  const active = new Set(activities.filter((item) => item.minutes > 0 || item.completed > 0).map((item) => item.date));
  const cursor = new Date();
  let streak = 0;
  while (active.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}