import React, { useState } from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { Skill, SkillCategory } from "../../types";
import {
  Cpu,
  Layers,
  Database,
  Terminal,
  Code2,
  CheckCircle2,
  Sparkles,
  Plus,
  ArrowUpRight,
} from "lucide-react";

export const SkillsTab: React.FC = () => {
  const { skills, projects, isAdmin, setActiveTab } = usePortfolio();
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories: Array<{ id: string; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: "All", label: "All Technologies", icon: Cpu },
    { id: "Frontend", label: "Frontend", icon: Layers },
    { id: "Backend", label: "Backend & APIs", icon: Terminal },
    { id: "Database & Cloud", label: "Database & Cloud", icon: Database },
    { id: "Languages", label: "Languages", icon: Code2 },
    { id: "DevOps & Tools", label: "DevOps & Tooling", icon: Terminal },
  ];

  const filteredSkills = activeCategory === "All"
    ? skills
    : skills.filter((s) => s.category === activeCategory);

  // Group skills by category for structured view
  const groupedSkills: { [key in SkillCategory]?: Skill[] } = {};
  skills.forEach((s) => {
    if (!groupedSkills[s.category]) groupedSkills[s.category] = [];
    groupedSkills[s.category]!.push(s);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Category Pills & Admin Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363d] pb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#1f6feb] text-white font-semibold shadow-sm"
                    : "bg-[#161b22] text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d] hover:border-[#8b949e]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {isAdmin && (
          <button
            onClick={() => setActiveTab("admin")}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] rounded-md transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill</span>
          </button>
        )}
      </div>

      {/* Main Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill) => {
          // Find how many repos use this skill
          const relatedProjectsCount = projects.filter(
            (p) =>
              p.technologies.some((t) => t.toLowerCase() === skill.name.toLowerCase()) ||
              p.primaryLanguage.toLowerCase() === skill.name.toLowerCase()
          ).length;

          return (
            <div
              key={skill.id}
              className="p-4 rounded-lg border border-[#30363d] bg-[#161b22] hover:border-[#58a6ff]/60 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: skill.badgeColor || "#58a6ff" }}
                    />
                    <h3 className="font-semibold text-sm text-[#f0f6fc] group-hover:text-[#58a6ff] transition-colors">
                      {skill.name}
                    </h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-[#0d1117] text-[#8b949e] border border-[#30363d]">
                    {skill.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#8b949e] mt-1">
                  <span className="text-emerald-400 font-medium">{skill.level}</span>
                  <span>•</span>
                  <span>{skill.years}</span>
                </div>
              </div>

              {/* Footer link to projects */}
              <div className="mt-4 pt-3 border-t border-[#30363d]/40 flex items-center justify-between text-xs text-[#8b949e]">
                <span>
                  Used in <strong className="text-[#c9d1d9]">{relatedProjectsCount}</strong>{" "}
                  {relatedProjectsCount === 1 ? "project" : "projects"}
                </span>
                <span className="text-[11px] text-[#58a6ff] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <span>Verified</span>
                  <CheckCircle2 className="w-3 h-3 text-[#39d353]" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tech Stack Matrix Overview */}
      <div className="border border-[#30363d] rounded-lg p-6 bg-[#161b22] space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-[#f0f6fc]">
            Web Development Philosophy & Architecture Principles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-[#0d1117] border border-[#30363d]/60 space-y-1.5">
            <h4 className="font-semibold text-[#58a6ff]">Type-Safe Full Stack</h4>
            <p className="text-[#8b949e] leading-relaxed">
              End-to-end type safety from React UI down to PostgreSQL schemas using TypeScript, strict types, and robust schemas.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#0d1117] border border-[#30363d]/60 space-y-1.5">
            <h4 className="font-semibold text-[#39d353]">High-Throughput APIs</h4>
            <p className="text-[#8b949e] leading-relaxed">
              Designing asynchronous Python/Django and Node.js microservices with Redis caching, connection pooling, and sub-100ms response times.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#0d1117] border border-[#30363d]/60 space-y-1.5">
            <h4 className="font-semibold text-[#8957e5]">Cloud & Containerization</h4>
            <p className="text-[#8b949e] leading-relaxed">
              Reproducible Docker environments, zero-downtime rolling deployments, and automated GitHub Actions pipelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
