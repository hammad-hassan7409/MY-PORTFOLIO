import React, { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import {
  Code2,
  Search,
  BookOpen,
  FolderGit2,
  Cpu,
  User,
  Mail,
  ShieldCheck,
  LogOut,
  Sparkles,
  Command,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

export const Header: React.FC = () => {
  const {
    profile,
    projects,
    activeTab,
    setActiveTab,
    isAdmin,
    adminUser,
    logoutAdmin,
    setIsAdminLoginOpen,
    setIsSearchOpen,
    messages,
  } = usePortfolio();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadMessagesCount = messages.filter((m) => !m.read).length;

  const navItems = [
    { id: "overview", label: "Overview", icon: BookOpen },
    {
      id: "projects",
      label: "Projects",
      icon: FolderGit2,
      badge: projects.length.toString(),
    },
    { id: "skills", label: "Skills", icon: Cpu },
    { id: "about", label: "About", icon: User },
    { id: "contact", label: "Contact", icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#161b22] border-b border-[#30363d]">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <button
              id="brand-home-button"
              onClick={() => setActiveTab("overview")}
              className="flex items-center gap-2.5 text-[#f0f6fc] hover:text-[#58a6ff] transition-colors group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[#58a6ff] group-hover:border-[#58a6ff]/50 transition-all shadow-inner">
                <Code2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-base tracking-tight text-[#f0f6fc] flex items-center gap-1.5">
                  {profile?.name || "Hammad Hassan"}
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-semibold hidden sm:inline-flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                    PREMIUM
                  </span>
                </span>
                <p className="text-xs text-[#8b949e] font-mono leading-none hidden md:block mt-0.5">
                  MY PORTFOLIO • @{profile?.username || "hammadhassan"}
                </p>
              </div>
            </button>
          </div>

          {/* Center / Search & Quick Command Palette */}
          <div className="hidden sm:flex flex-1 max-w-md mx-4">
            <button
              id="global-search-trigger"
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-[#8b949e] bg-[#0d1117] hover:bg-[#0d1117]/80 border border-[#30363d] hover:border-[#8b949e] rounded-md transition-all group"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-[#8b949e] group-hover:text-[#58a6ff]" />
                <span>Search projects, tech stack, bio...</span>
              </span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-[#21262d] text-[#8b949e] border border-[#30363d] rounded">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            </button>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              id="mobile-search-btn"
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden p-2 text-[#8b949e] hover:text-[#f0f6fc] bg-[#21262d] border border-[#30363d] rounded-md"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Resume / Available indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-md bg-[#21262d]/60 border border-[#30363d] text-xs text-[#8b949e]">
              <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse"></span>
              <span className="text-[#c9d1d9] font-medium">Available for hire</span>
            </div>

            {/* Admin status / Login button */}
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <button
                  id="admin-tab-toggle"
                  onClick={() => setActiveTab(activeTab === "admin" ? "overview" : "admin")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                    activeTab === "admin"
                      ? "bg-[#1f6feb] text-white border-[#388bfd]"
                      : "bg-[#21262d] text-[#58a6ff] border-[#30363d] hover:border-[#58a6ff]"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                  {unreadMessagesCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                      {unreadMessagesCount}
                    </span>
                  )}
                </button>
                <button
                  id="admin-logout-btn"
                  onClick={logoutAdmin}
                  className="p-1.5 text-[#8b949e] hover:text-rose-400 bg-[#21262d] border border-[#30363d] rounded-md hover:border-rose-500/40 transition-colors"
                  title="Logout Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="admin-login-modal-open"
                onClick={() => setIsAdminLoginOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#8b949e] hover:text-[#f0f6fc] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#8b949e]" />
                <span className="hidden sm:inline">Admin Login</span>
              </button>
            )}

            {/* Mobile menu hamburger */}
            <button
              id="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#8b949e] hover:text-[#f0f6fc] bg-[#21262d] border border-[#30363d] rounded-md"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* GitHub Navigation Tabs */}
        <nav className="flex items-center space-x-1 border-t border-[#30363d]/40 -mb-[1px] overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "border-[#f78166] text-[#f0f6fc] font-semibold bg-[#0d1117]/30"
                    : "border-transparent text-[#8b949e] hover:text-[#f0f6fc] hover:border-[#8b949e]/40"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-[#f78166]" : "text-[#8b949e]"
                  }`}
                />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-[#30363d] text-[#f0f6fc] font-bold"
                        : "bg-[#21262d] text-[#8b949e]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {isAdmin && (
            <button
              id="nav-tab-admin"
              onClick={() => setActiveTab("admin")}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "admin"
                  ? "border-[#58a6ff] text-[#58a6ff] font-semibold bg-[#0d1117]/30"
                  : "border-transparent text-[#8b949e] hover:text-[#58a6ff] hover:border-[#58a6ff]/40"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#58a6ff]" />
              <span>Admin Suite</span>
              {unreadMessagesCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold">
                  {unreadMessagesCount} new
                </span>
              )}
            </button>
          )}
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#30363d] bg-[#161b22] px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? "bg-[#21262d] text-[#f0f6fc] font-semibold text-[#58a6ff]"
                    : "text-[#8b949e] hover:bg-[#21262d]/50 hover:text-[#f0f6fc]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#21262d] text-[#8b949e]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {isAdmin ? (
            <button
              onClick={() => {
                setActiveTab("admin");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === "admin"
                  ? "bg-[#1f6feb]/20 text-[#58a6ff] border border-[#388bfd]"
                  : "text-[#58a6ff] hover:bg-[#21262d]"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Suite</span>
              </div>
              {unreadMessagesCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold">
                  {unreadMessagesCount} new
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => {
                setIsAdminLoginOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-[#8b949e] hover:bg-[#21262d]/50 hover:text-[#f0f6fc]"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-[#8b949e]" />
                <span>Admin Login</span>
              </div>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
