import React from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import {
  Briefcase,
  Calendar,
  MapPin,
  Award,
  BookOpen,
  Code2,
  CheckCircle2,
  Terminal,
  ExternalLink,
  Mail,
  FileText,
} from "lucide-react";

export const AboutTab: React.FC = () => {
  const { profile, experiences, setActiveTab } = usePortfolio();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Bio Overview Card */}
      <div className="border border-[#30363d] rounded-lg p-6 sm:p-8 bg-[#161b22] space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#30363d]">
          <BookOpen className="w-4 h-4 text-[#58a6ff]" />
          <h2 className="text-base font-bold text-[#f0f6fc]">
            About Me & Web Development Journey
          </h2>
        </div>

        <div className="prose prose-invert max-w-none text-sm text-[#c9d1d9] leading-relaxed space-y-4">
          <p>
            Hello! I'm <strong className="text-[#f0f6fc] font-semibold">{profile?.name || "Hammad Hassan"}</strong>, a passionate Full Stack Web Developer with 4+ years of production experience crafting performant web applications, cloud microservices, and developer platforms.
          </p>
          <p>
            My technical journey started with deep curiosity around distributed systems, Python automation, and modern web interfaces. Over the years, I've architected enterprise SaaS platforms, real-time collaboration engines using Supabase and WebSockets, and high-reliability financial ledgers using Python and Django REST Framework.
          </p>
          <p>
            I believe that great software is the intersection of strict architectural discipline, exceptional user experience, and readable, maintainable code. When I'm not shipping code, I'm exploring new open-source technologies, optimizing database query plans, and contributing to developer communities.
          </p>
        </div>

        {/* Quick Facts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#30363d]/60">
          <div className="p-4 rounded-lg bg-[#0d1117] border border-[#30363d]/50">
            <div className="text-xs text-[#8b949e]">Location</div>
            <div className="text-sm font-semibold text-[#f0f6fc] mt-0.5">
              {profile?.location || "Lahore, Pakistan"}
            </div>
            <div className="text-[11px] text-[#39d353] mt-1">Available for Remote</div>
          </div>

          <div className="p-4 rounded-lg bg-[#0d1117] border border-[#30363d]/50">
            <div className="text-xs text-[#8b949e]">Primary Stack</div>
            <div className="text-sm font-semibold text-[#f0f6fc] mt-0.5">
              React • Python • Django
            </div>
            <div className="text-[11px] text-[#58a6ff] mt-1">TypeScript & Supabase</div>
          </div>

          <div className="p-4 rounded-lg bg-[#0d1117] border border-[#30363d]/50">
            <div className="text-xs text-[#8b949e]">Experience Level</div>
            <div className="text-sm font-semibold text-[#f0f6fc] mt-0.5">
              {profile?.yearsOfExperience || 4}+ Years Production
            </div>
            <div className="text-[11px] text-amber-400 mt-1">Senior Full Stack</div>
          </div>
        </div>
      </div>

      {/* Experience & Career Timeline */}
      <div className="border border-[#30363d] rounded-lg p-6 sm:p-8 bg-[#161b22] space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#30363d]">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#58a6ff]" />
            <h2 className="text-base font-bold text-[#f0f6fc]">
              Professional Experience & Work History
            </h2>
          </div>
          <button
            onClick={() => setActiveTab("contact")}
            className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1 font-medium"
          >
            <span>Request Resume / CV</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#30363d]">
          {experiences.map((exp) => (
            <div key={exp.id} className="relative group">
              {/* Timeline Bullet */}
              <div className="absolute -left-6 sm:-left-8 top-1.5 w-4 h-4 rounded-full bg-[#161b22] border-2 border-[#58a6ff] group-hover:bg-[#58a6ff] transition-colors" />

              <div className="p-5 rounded-lg bg-[#0d1117] border border-[#30363d]/60 space-y-3 hover:border-[#58a6ff]/40 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h3 className="text-sm font-bold text-[#f0f6fc]">
                      {exp.role}
                    </h3>
                    <div className="text-xs text-[#58a6ff] font-medium">
                      {exp.company}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#8b949e] font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{exp.period}</span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[10px]">
                      {exp.type}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#c9d1d9] leading-relaxed">
                  {exp.description}
                </p>

                {/* Achievements Bullet points */}
                {exp.achievements && exp.achievements.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {exp.achievements.map((ach, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#8b949e]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#39d353] shrink-0 mt-0.5" />
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tech Pills */}
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#30363d]/40">
                    {exp.technologies.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#21262d] text-[#8b949e] font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Footer */}
      <div className="p-6 rounded-lg bg-gradient-to-r from-[#161b22] to-[#0d1117] border border-[#30363d] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[#f0f6fc]">
            Looking for a dependable web developer to build your next product?
          </h3>
          <p className="text-xs text-[#8b949e] mt-1">
            Available for full-time web developer roles, contract MVPs, and web consulting.
          </p>
        </div>
        <button
          onClick={() => setActiveTab("contact")}
          className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] rounded-md transition-colors whitespace-nowrap shadow-sm"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Get in Touch</span>
        </button>
      </div>
    </div>
  );
};
