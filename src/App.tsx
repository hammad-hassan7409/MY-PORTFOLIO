import React from "react";
import { PortfolioProvider, usePortfolio } from "./context/PortfolioContext";
import { Header } from "./components/Header";
import { ProfileSidebar } from "./components/ProfileSidebar";
import { OverviewTab } from "./components/Tabs/OverviewTab";
import { ProjectsTab } from "./components/Tabs/ProjectsTab";
import { SkillsTab } from "./components/Tabs/SkillsTab";
import { AboutTab } from "./components/Tabs/AboutTab";
import { ContactTab } from "./components/Tabs/ContactTab";
import { AdminDashboard } from "./components/Admin/AdminDashboard";
import { ProjectModal } from "./components/ProjectModal";
import { SearchModal } from "./components/SearchModal";
import { AdminLoginModal } from "./components/AdminLoginModal";
import { Toast } from "./components/Toast";
import { Code2, Github, Heart, ShieldCheck, Sparkles, Terminal } from "lucide-react";

function PortfolioContent() {
  const { activeTab, setActiveTab, isLoading, error, profile, isAdmin, setIsAdminLoginOpen } = usePortfolio();

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center text-[#f0f6fc] space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#30363d] border-t-[#58a6ff] animate-spin" />
        <p className="text-xs text-[#8b949e] font-mono">Initializing developer workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] flex flex-col selection:bg-[#58a6ff]/30 selection:text-[#f0f6fc]">
      {/* Navigation Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Sticky Profile Sidebar */}
          <ProfileSidebar />

          {/* Right Main Tab Body */}
          <div className="flex-1 w-full min-w-0">
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "projects" && <ProjectsTab />}
            {activeTab === "skills" && <SkillsTab />}
            {activeTab === "about" && <AboutTab />}
            {activeTab === "contact" && <ContactTab />}
            {activeTab === "admin" && <AdminDashboard />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#30363d] bg-[#161b22] py-8 text-xs text-[#8b949e] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#58a6ff]" />
            <span className="text-[#f0f6fc] font-semibold">
              {profile?.name || "Hammad Hassan"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <button
              onClick={() => setActiveTab("overview")}
              className="hover:text-[#58a6ff] transition-colors cursor-pointer"
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className="hover:text-[#58a6ff] transition-colors cursor-pointer"
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab("skills")}
              className="hover:text-[#58a6ff] transition-colors cursor-pointer"
            >
              Skills
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className="hover:text-[#58a6ff] transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className="hover:text-[#58a6ff] transition-colors cursor-pointer"
            >
              Contact
            </button>
            {isAdmin ? (
              <button
                onClick={() => setActiveTab("admin")}
                className="text-[#58a6ff] hover:underline cursor-pointer"
              >
                Admin Suite
              </button>
            ) : (
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="hover:text-[#58a6ff] transition-colors cursor-pointer"
              >
                Admin Login
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span>Designed with GitHub Dark Aesthetics</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#39d353]" />
          </div>
        </div>
      </footer>

      {/* Overlays & Modals */}
      <ProjectModal />
      <SearchModal />
      <AdminLoginModal />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <PortfolioProvider>
      <PortfolioContent />
    </PortfolioProvider>
  );
}
