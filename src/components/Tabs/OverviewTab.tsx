import React from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { PinnedProjects } from "../PinnedProjects";
import { ContributionGraph } from "../ContributionGraph";
import {
  Terminal,
  BookOpen,
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Code2,
  Cpu,
  Layers,
  Award,
  FolderGit2,
  Activity,
} from "lucide-react";
import { ActivityLog } from "../../types";

function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (isNaN(diffMs) || diffMs < 0) return "Just now";

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return "Yesterday";
    if (diffDay < 7) return `${diffDay}d ago`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

function getActivityIcon(type: string) {
  switch (type) {
    case "pr_merged":
    case "pr_opened":
      return <GitPullRequest className="w-4 h-4 text-[#39d353] shrink-0 mt-0.5" />;
    case "project_created":
    case "project_updated":
      return <FolderGit2 className="w-4 h-4 text-[#58a6ff] shrink-0 mt-0.5" />;
    case "achievement_unlocked":
      return <Award className="w-4 h-4 text-[#d29922] shrink-0 mt-0.5" />;
    case "skill_updated":
      return <Code2 className="w-4 h-4 text-[#bc8cff] shrink-0 mt-0.5" />;
    case "experience_updated":
      return <Layers className="w-4 h-4 text-[#58a6ff] shrink-0 mt-0.5" />;
    case "commit_pushed":
    default:
      return <GitCommit className="w-4 h-4 text-[#8957e5] shrink-0 mt-0.5" />;
  }
}

export const OverviewTab: React.FC = () => {
  const { profile, projects, skills, activities, setActiveTab } = usePortfolio();

  const recentActivities = (activities || []).slice(-6).reverse();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* GitHub-style README.md container */}
      <div className="border border-[#30363d] rounded-lg bg-[#161b22] overflow-hidden shadow-sm">
        {/* README.md Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d1117]/70 border-b border-[#30363d] text-xs">
          <div className="flex items-center gap-2 text-[#8b949e] font-mono">
            <BookOpen className="w-3.5 h-3.5 text-[#58a6ff]" />
            <span className="text-[#f0f6fc] font-semibold">hammadhassan</span>
            <span>/</span>
            <span>README.md</span>
          </div>
          <span className="text-[11px] text-[#8b949e]">preview</span>
        </div>

        {/* README Content Body */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* Hero Greeting & Terminal Box */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">👋</span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#f0f6fc]">
                Hi, I'm {profile?.name || "Hammad Hassan"}
              </h2>
            </div>
            <p className="text-sm text-[#c9d1d9] leading-relaxed">
              {profile?.detailedBio || profile?.bio}
            </p>
          </div>

          {/* Interactive Developer Terminal Snapshot */}
          <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-4 font-mono text-xs text-[#c9d1d9] space-y-2 shadow-inner">
            <div className="flex items-center gap-2 pb-2 border-b border-[#30363d]/40 text-[#8b949e]">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[11px]">hammad@dev-macbook ~ % neofetch --profile</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 pt-1">
              <div>
                <span className="text-[#58a6ff]">Role:</span> Full Stack Web Developer
              </div>
              <div>
                <span className="text-[#58a6ff]">Experience:</span> {profile?.yearsOfExperience || 4}+ Years Production
              </div>
              <div>
                <span className="text-[#39d353]">Frontend:</span> React, TypeScript, Tailwind, Next.js
              </div>
              <div>
                <span className="text-[#39d353]">Backend:</span> Python, Django, Node.js, FastAPI
              </div>
              <div>
                <span className="text-[#8957e5]">Databases:</span> Supabase, PostgreSQL, Redis
              </div>
              <div>
                <span className="text-[#8957e5]">DevOps:</span> Docker, GitHub Actions, AWS
              </div>
              <div className="col-span-1 sm:col-span-2 text-[#d29922]">
                <span>Status:</span> {profile?.status || "Available for high-impact roles"}
              </div>
            </div>
          </div>

          {/* Quick Skill Badges Strip */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8b949e] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span>Primary Technology Stack</span>
              </h3>
              <button
                onClick={() => setActiveTab("skills")}
                className="text-xs text-[#58a6ff] hover:underline"
              >
                View all skills →
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 8).map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#21262d] border border-[#30363d] text-xs font-medium text-[#f0f6fc] hover:border-[#58a6ff]/50 transition-colors"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: skill.badgeColor || "#58a6ff" }}
                  />
                  <span>{skill.name}</span>
                  <span className="text-[10px] text-[#8b949e] font-mono">({skill.level})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pinned Repositories Section */}
      <PinnedProjects />

      {/* Contribution Heatmap */}
      <ContributionGraph />

      {/* Recent Activity Timeline */}
      <div className="border border-[#30363d] rounded-lg p-5 bg-[#161b22] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#58a6ff]" />
            <h2 className="text-sm font-semibold text-[#f0f6fc]">
              Recent Web Developer Activity & Events
            </h2>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-[#39d353] font-mono">
            <span className="w-2 h-2 rounded-full bg-[#39d353] animate-pulse" />
            Live Sync
          </span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {recentActivities.length === 0 ? (
            <div className="text-center py-6 text-[#8b949e] font-sans text-xs">
              No recent activities recorded yet.
            </div>
          ) : (
            recentActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 p-3 rounded-md bg-[#0d1117] border border-[#30363d]/50 hover:border-[#30363d] transition-colors"
              >
                {getActivityIcon(act.type)}
                <div className="flex-1 min-w-0">
                  <div className="text-[#f0f6fc] font-medium break-words">
                    {act.title}
                    {act.repo && (
                      <span className="ml-1 text-[#58a6ff] text-[11px] font-normal">
                        in {act.repo.startsWith("hammadhassan/") ? act.repo : `hammadhassan/${act.repo}`}
                      </span>
                    )}
                  </div>
                  {act.description && (
                    <div className="text-[11px] text-[#8b949e] mt-0.5 line-clamp-2">
                      "{act.description}"
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-[#8b949e] shrink-0 whitespace-nowrap pt-0.5">
                  {formatRelativeTime(act.timestamp)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
