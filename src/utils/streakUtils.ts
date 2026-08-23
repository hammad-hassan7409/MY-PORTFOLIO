import { ActivityLog, ActivityType, ContributionData, ContributionDay } from "../types";

/**
 * Format a Date object or ISO string to standard YYYY-MM-DD
 */
export function formatLocalDate(dateInput: Date | string = new Date()): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) {
    return new Date().toISOString().split("T")[0];
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Generates an ISO timestamp for right now
 */
export function getCurrentIsoString(): string {
  return new Date().toISOString();
}

/**
 * Compute the date N days before or after a given reference date
 */
export function getRelativeDate(daysOffset: number, baseDate: Date = new Date()): Date {
  const result = new Date(baseDate);
  result.setDate(result.getDate() + daysOffset);
  return result;
}

/**
 * Calculate streak, heatmap days, and stats from real persistent activities
 */
export function calculateStreakAndContributions(
  activities: ActivityLog[] = [],
  referenceDate: Date = new Date()
): ContributionData {
  const todayStr = formatLocalDate(referenceDate);
  const yesterdayStr = formatLocalDate(getRelativeDate(-1, referenceDate));

  // Map activities by YYYY-MM-DD date and accumulate counts
  const activityCounts = new Map<string, number>();
  let commitsCount = 0;
  let pullRequestsCount = 0;
  let reviewsCount = 0;

  for (const act of activities) {
    const actDate = act.date || (act.timestamp ? formatLocalDate(act.timestamp) : todayStr);
    activityCounts.set(actDate, (activityCounts.get(actDate) || 0) + 1);

    if (act.type === "code_commit" || act.type === "project_created" || act.type === "project_updated") {
      commitsCount += 1;
    } else if (act.type === "pull_request" || act.type === "deploy") {
      pullRequestsCount += 1;
    } else if (act.type === "code_review" || act.type === "achievement_unlocked") {
      reviewsCount += 1;
    } else {
      commitsCount += 1;
    }
  }

  // Generate 52 weeks (364 days + today = 365 days)
  const days: ContributionDay[] = [];
  let totalContributions = 0;

  for (let i = 364; i >= 0; i--) {
    const d = getRelativeDate(-i, referenceDate);
    const dateStr = formatLocalDate(d);
    const count = activityCounts.get(dateStr) || 0;
    totalContributions += count;

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count > 0 && count <= 2) level = 1;
    else if (count > 2 && count <= 5) level = 2;
    else if (count > 5 && count <= 9) level = 3;
    else if (count > 9) level = 4;

    days.push({ date: dateStr, count, level });
  }

  // Calculate Current Streak
  let currentStreak = 0;
  const hasTodayActivity = (activityCounts.get(todayStr) || 0) > 0;
  const hasYesterdayActivity = (activityCounts.get(yesterdayStr) || 0) > 0;

  if (hasTodayActivity) {
    currentStreak = 1;
    let checkOffset = -1;
    while (true) {
      const checkDateStr = formatLocalDate(getRelativeDate(checkOffset, referenceDate));
      if ((activityCounts.get(checkDateStr) || 0) > 0) {
        currentStreak++;
        checkOffset--;
      } else {
        break;
      }
    }
  } else if (hasYesterdayActivity) {
    currentStreak = 1;
    let checkOffset = -2;
    while (true) {
      const checkDateStr = formatLocalDate(getRelativeDate(checkOffset, referenceDate));
      if ((activityCounts.get(checkDateStr) || 0) > 0) {
        currentStreak++;
        checkOffset--;
      } else {
        break;
      }
    }
  } else {
    currentStreak = 0;
  }

  // Calculate Longest Streak in dataset
  const sortedDates = Array.from(activityCounts.keys()).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const count = activityCounts.get(dateStr) || 0;
    if (count <= 0) continue;

    const currDate = new Date(dateStr);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = currDate;
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // Find last active date
  let lastActiveDate: string | undefined;
  if (sortedDates.length > 0) {
    lastActiveDate = sortedDates[sortedDates.length - 1];
  }

  return {
    total: totalContributions,
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    commitsCount,
    pullRequestsCount,
    reviewsCount,
    year: referenceDate.getFullYear(),
    days,
    activities: activities.slice(-50).reverse(), // Most recent 50
    lastActiveDate,
  };
}

/**
 * Generate a rich, realistic baseline activity history that seamlessly leads directly into today's active streak
 */
export function generateSeedActivities(baseDate: Date = new Date()): ActivityLog[] {
  const list: ActivityLog[] = [];
  const repos = [
    "hammadhassan/nexus-cloud-orchestrator",
    "hammadhassan/finledger-django-api",
    "hammadhassan/supabase-pulse-collab",
    "hammadhassan/distributed-task-mesh",
    "hammadhassan/react-native-crypto-wallet",
    "hammadhassan/portfolio-v4",
  ];

  const commitMessages = [
    "feat(telemetry): optimize real-time WebSocket cluster metrics with sub-50ms latency",
    "perf(reconciliation): add PostgreSQL transaction row-level locking & Celery queue worker",
    "feat(sync): multiplayer markdown workspace synchronization engine with granular RLS",
    "refactor(auth): implement JWT token rotation and secure HTTP-only cookies",
    "ci: setup automated GitHub actions deployment to Google Cloud Run",
    "fix(cache): resolve Redis cache eviction bug in distributed session store",
    "docs(architecture): update system design diagrams and OpenAPI 3.0 specification",
    "feat(database): migrate schema migrations and partition transactional ledger tables",
    "perf(frontend): dynamic code-splitting and asset prefetching optimization",
    "feat(api): add rate-limiting middleware with Redis token bucket algorithm",
  ];

  // Populate 365 days of realistic developer activity with an active sprint leading to today
  for (let offset = -365; offset <= 0; offset++) {
    const d = getRelativeDate(offset, baseDate);
    const dateStr = formatLocalDate(d);
    const dayOfWeek = d.getDay(); // 0 is Sun, 6 is Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Seed continuous active streak for the past 30 days up to today
    const inCurrentActiveStreak = offset >= -30;

    let numEvents = 0;
    if (inCurrentActiveStreak) {
      numEvents = isWeekend ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 6) + 2;
    } else {
      const pseudo = Math.sin(offset * 31.7 + (offset % 5)) * 10000;
      const rand = Math.abs(pseudo - Math.floor(pseudo));
      if (!isWeekend && rand > 0.3) {
        numEvents = Math.floor(rand * 6) + 1;
      } else if (isWeekend && rand > 0.7) {
        numEvents = Math.floor(rand * 3) + 1;
      }
    }

    for (let k = 0; k < numEvents; k++) {
      const repo = repos[(Math.abs(offset * 3 + k)) % repos.length];
      const msg = commitMessages[(Math.abs(offset * 7 + k)) % commitMessages.length];
      const hour = 9 + ((k * 3) % 12);
      const minute = (k * 17) % 60;
      const timeDate = new Date(d);
      timeDate.setHours(hour, minute, 0, 0);

      let actType: ActivityType = "code_commit";
      if (k === 0 && offset % 7 === 0) actType = "pull_request";
      else if (k === 1 && offset % 11 === 0) actType = "code_review";

      list.push({
        id: `act-${dateStr}-${k}`,
        type: actType,
        title: actType === "pull_request" ? `Merged PR #${40 + Math.abs(offset % 60)} in ${repo}` : `Pushed commit to ${repo}`,
        description: msg,
        repo,
        prNumber: actType === "pull_request" ? 40 + Math.abs(offset % 60) : undefined,
        commitHash: Math.random().toString(16).substring(2, 9),
        timestamp: timeDate.toISOString(),
        date: dateStr,
      });
    }
  }

  return list;
}
