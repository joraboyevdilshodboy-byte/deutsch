export function getActivityMinutes(
  sessions: Array<{ activityType: string; durationMinutes: number }>,
  activityType: string,
) {
  return sessions
    .filter((session) => session.activityType === activityType)
    .reduce((total, session) => total + session.durationMinutes, 0);
}

export function getMinutesForWindow<T extends { createdAt: Date | string; durationMinutes: number }>(
  sessions: T[],
  start: Date,
  end: Date,
) {
  return sessions.reduce((total, session) => {
    const createdAt = new Date(session.createdAt);
    if (createdAt >= start && createdAt < end) {
      return total + session.durationMinutes;
    }
    return total;
  }, 0);
}
