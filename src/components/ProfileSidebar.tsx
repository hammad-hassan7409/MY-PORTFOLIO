import React, { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import {
  MapPin,
  Mail,
  Link as LinkIcon,
  Github,
  Linkedin,
  Twitter,
  Users,
  Star,
  Check,
  Copy,
  Briefcase,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export const ProfileSidebar: React.FC = () => {
  const { profile, achievements, setActiveTab, showToast } = usePortfolio();
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!profile) return null;

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(profile.email);
    setCopiedEmail(true);
    showToast(`Email copied: ${profile.email}`);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-6">
      {/* Avatar & Basic Info */}
      <div className="flex flex-row lg:flex-col items-start gap-4 lg:gap-0">
        {/* Avatar Container with Status Badge */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 lg:w-64 lg:h-64 rounded-full overflow-hidden border-2 border-[#30363d] bg-[#161b22] shadow-2xl relative">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Status Emoji / Badge */}
          <div
            id="profile-status-indicator"
            className="absolute bottom-1 right-1 lg:bottom-4 lg:right-4 bg-[#161b22] border border-[#30363d] rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-lg text-xs"
            title={profile.status}
          >
            <span className="text-sm">{profile.statusEmoji || "🟢"}</span>
            <span className="hidden lg:inline text-[11px] text-[#c9d1d9] font-medium truncate max-w-[130px]">
              Available for hire
            </span>
          </div>
        </div>

        {/* Name & Bio */}
        <div className="pt-1 lg:pt-4 flex-1 w-full">
          <h1 className="text-2xl font-bold tracking-tight text-[#f0f6fc]">
            <span className="truncate">{profile.name}</span>
          </h1>
          <p className="text-base text-[#8b949e] font-mono leading-none mt-0.5">
            {profile.username}
          </p>

          <p className="mt-3 text-sm text-[#c9d1d9] leading-relaxed">
            {profile.bio}
          </p>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="space-y-2">
        <button
          id="profile-contact-cta"
          onClick={() => setActiveTab("contact")}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#f0f6fc] border border-[#30363d] hover:border-[#8b949e] text-sm font-semibold transition-all cursor-pointer shadow-sm"
        >
          <Mail className="w-4 h-4 text-[#58a6ff]" />
          <span>Get in Touch / Hire</span>
        </button>

        <a
          id="profile-github-link-btn"
          href={profile.github}
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-semibold transition-all cursor-pointer shadow-sm"
        >
          <Github className="w-4 h-4" />
          <span>Follow on GitHub</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </a>
      </div>

      {/* Social / Stats Counts */}
      <div className="flex items-center gap-3 text-xs text-[#8b949e] pt-1">
        <div className="flex items-center gap-1 hover:text-[#58a6ff] cursor-default">
          <Users className="w-4 h-4" />
          <span className="font-bold text-[#f0f6fc]">{profile.followersCount}</span>
          <span>followers</span>
        </div>
        <span>•</span>
        <div className="hover:text-[#58a6ff] cursor-default">
          <span className="font-bold text-[#f0f6fc]">{profile.followingCount}</span>{" "}
          <span>following</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1 hover:text-[#58a6ff] cursor-default">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
          <span className="font-bold text-[#f0f6fc]">{profile.starsCount}</span>
        </div>
      </div>

      {/* Metadata Links List */}
      <div className="space-y-2.5 text-xs text-[#c9d1d9] border-t border-[#30363d] pt-4">
        {/* Current Role/Focus */}
        {profile.company && (
          <div className="flex items-center gap-2 text-[#8b949e]">
            <Briefcase className="w-4 h-4 shrink-0 text-[#8b949e]" />
            <span className="truncate">{profile.company}</span>
          </div>
        )}

        {/* Location */}
        {profile.location && (
          <div className="flex items-center gap-2 text-[#8b949e]">
            <MapPin className="w-4 h-4 shrink-0 text-[#8b949e]" />
            <span className="truncate">{profile.location}</span>
          </div>
        )}

        {/* Email with copy button */}
        <div className="flex items-center justify-between group/email">
          <a
            href={`mailto:${profile.email}`}
            className="flex items-center gap-2 text-[#8b949e] hover:text-[#58a6ff] truncate"
          >
            <Mail className="w-4 h-4 shrink-0" />
            <span className="truncate">{profile.email}</span>
          </a>
          <button
            onClick={handleCopyEmail}
            className="p-1 text-[#8b949e] hover:text-[#f0f6fc] rounded hover:bg-[#21262d] transition-colors cursor-pointer"
            title="Copy email address"
          >
            {copiedEmail ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* GitHub Link */}
        {profile.github && (
          <div className="flex items-center gap-2 text-[#8b949e]">
            <Github className="w-4 h-4 shrink-0 text-[#f0f6fc]" />
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#58a6ff] hover:underline truncate"
            >
              {profile.github.replace(/^https?:\/\/(www\.)?/, "")}
            </a>
          </div>
        )}

        {/* Website */}
        {profile.website && (
          <div className="flex items-center gap-2 text-[#8b949e]">
            <LinkIcon className="w-4 h-4 shrink-0" />
            <a
              href={profile.website}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#58a6ff] hover:underline truncate"
            >
              {profile.website.replace(/^https?:\/\/(www\.)?/, "")}
            </a>
          </div>
        )}

        {/* LinkedIn */}
        {profile.linkedin && (
          <div className="flex items-center gap-2 text-[#8b949e]">
            <Linkedin className="w-4 h-4 shrink-0 text-[#0a66c2]" />
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#58a6ff] hover:underline truncate"
            >
              {profile.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
            </a>
          </div>
        )}

        {/* Twitter */}
        {profile.twitter && (
          <div className="flex items-center gap-2 text-[#8b949e]">
            <Twitter className="w-4 h-4 shrink-0 text-[#1d9bf0]" />
            <a
              href={profile.twitter.startsWith("http") ? profile.twitter : `https://x.com/${profile.twitter.replace("@", "")}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#58a6ff] hover:underline truncate"
            >
              {profile.twitter.startsWith("@") ? profile.twitter : `@${profile.twitter.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//, "")}`}
            </a>
          </div>
        )}
      </div>

      {/* GitHub Achievements Badges */}
      {achievements && achievements.length > 0 && (
        <div className="border-t border-[#30363d] pt-4">
          <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>Achievements</span>
            <span className="text-[10px] text-[#58a6ff] font-mono">x{achievements.length}</span>
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="w-11 h-11 rounded-full bg-[#161b22] border border-[#30363d] p-1 flex items-center justify-center hover:scale-110 hover:border-[#58a6ff]/60 transition-transform cursor-pointer group relative shadow-xs"
                title={`${ach.title}${ach.description ? `: ${ach.description}` : ""}${ach.unlockedDate ? ` (${ach.unlockedDate})` : ""}`}
              >
                <span className="text-lg select-none">{ach.icon || "🏆"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Developer Highlights Box */}
      <div className="border border-[#30363d] rounded-lg p-3.5 bg-[#161b22]/50 text-xs space-y-2">
        <div className="flex items-center gap-1.5 text-[#f0f6fc] font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Core Specialties</span>
        </div>
        <p className="text-[#8b949e] leading-relaxed">
          High-performance React/TypeScript UI architectures, Django microservices, Supabase/Postgres real-time engines, and scalable Docker workflows.
        </p>
      </div>
    </aside>
  );
};
