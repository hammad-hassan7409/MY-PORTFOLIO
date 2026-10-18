import React, { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { GitCommit, GitPullRequest, GitMerge, Flame, Award } from "lucide-react";

export const ContributionGraph: React.FC = () => {
  const { contributions, profile } = usePortfolio();
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  if (!contributions) {
    return (
      <div className="border border-[#30363d] rounded-lg p-5 bg-[#161b22] animate-pulse">
        <div className="h-4 bg-[#21262d] rounded w-48 mb-4"></div>
        <div className="h-28 bg-[#0d1117] rounded"></div>
      </div>
    );
  }

  // Chunk days into weeks (52-53 weeks)
  const weeks: Array<typeof contributions.days> = [];
  let currentWeek: typeof contributions.days = [];

  contributions.days.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === contributions.days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const currentStreak = contributions.currentStreak ?? 0;
  const longestStreak = contributions.longestStreak ?? 0;
  const commits = contributions.commitsCount ?? Math.floor(contributions.total * 0.76);
  const pullRequests = contributions.pullRequestsCount ?? Math.floor(contributions.total * 0.16);
  const reviews = contributions.reviewsCount ?? Math.floor(contributions.total * 0.08);

  return (
    <div className="border border-[#30363d] rounded-lg p-5 bg-[#161b22] space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-[#f0f6fc]">
            {contributions.total.toLocaleString()} contributions in the last year
          </h2>
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>{currentStreak}-day active streak</span>
          </span>
          {longestStreak > currentStreak && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/20 font-medium">
              <Award className="w-3 h-3 text-[#58a6ff]" />
              <span>{longestStreak}-day best</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-[#8b949e]">
          <span className="font-mono text-[#58a6ff]">{contributions.year}</span>
        </div>
      </div>

      {/* Heatmap Grid View */}
      <div className="relative overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[680px]">
          {/* Months labels */}
          <div className="flex text-[10px] text-[#8b949e] mb-1 pl-7 justify-between pr-2">
            {months.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>

          {/* Grid Container */}
          <div className="flex gap-[3px] items-start">
            {/* Days of week labels */}
            <div className="flex flex-col gap-[3px] text-[9px] text-[#8b949e] pr-1.5 select-none -mt-[1px]">
              <span className="h-[10px] leading-[10px]">Mon</span>
              <span className="h-[10px] leading-[10px] opacity-0">Tue</span>
              <span className="h-[10px] leading-[10px]">Wed</span>
              <span className="h-[10px] leading-[10px] opacity-0">Thu</span>
              <span className="h-[10px] leading-[10px]">Fri</span>
              <span className="h-[10px] leading-[10px] opacity-0">Sat</span>
              <span className="h-[10px] leading-[10px] opacity-0">Sun</span>
            </div>

            {/* Weeks columns */}
            {weeks.map((week, wIndex) => (
              <div key={wIndex} className="flex flex-col gap-[3px]">
                {week.map((day) => {
                  const levelClasses = [
                    "bg-[#161b22] border-[#30363d]/40",
                    "bg-[#0e4429] border-[#0e4429]",
                    "bg-[#006d32] border-[#006d32]",
                    "bg-[#26a641] border-[#26a641]",
                    "bg-[#39d353] border-[#39d353]",
                  ];
                  return (
                    <div
                      key={day.date}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
                        setHoveredDay({ date: day.date, count: day.count });
                      }}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-[10px] h-[10px] rounded-[2px] border ${
                        levelClasses[day.level]
                      } transition-transform hover:scale-125 cursor-pointer`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Floating Tooltip */}
        {hoveredDay && (
          <div
            className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full px-2.5 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md shadow-2xl text-[11px] text-[#f0f6fc] whitespace-nowrap font-medium"
            style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
          >
            <span className="font-bold text-[#39d353]">
              {hoveredDay.count === 0 ? "No contributions" : `${hoveredDay.count} ${hoveredDay.count === 1 ? "contribution" : "contributions"}`}
            </span>{" "}
            on {new Date(hoveredDay.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        )}
      </div>

      {/* Legend & Stats Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8b949e] border-t border-[#30363d]/40 pt-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <GitCommit className="w-3.5 h-3.5 text-[#39d353]" />
            <span>{commits.toLocaleString()} Commits</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GitPullRequest className="w-3.5 h-3.5 text-[#8957e5]" />
            <span>{pullRequests.toLocaleString()} Pull Requests</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GitMerge className="w-3.5 h-3.5 text-[#58a6ff]" />
            <span>{reviews.toLocaleString()} Code Reviews</span>
          </div>
        </div>

        {/* Less to More indicator */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span>Less</span>
          <div className="w-[10px] h-[10px] rounded-[2px] bg-[#161b22] border border-[#30363d]/40" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-[#0e4429]" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-[#006d32]" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-[#26a641]" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-[#39d353]" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
