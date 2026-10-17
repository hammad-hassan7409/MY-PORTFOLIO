import React, { useState, useRef } from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { Project, Skill, Achievement, Experience, Message, Profile } from "../../types";
import { optimizeImage } from "../../utils/imageUtils";
import {
  ShieldCheck,
  FolderGit2,
  Cpu,
  Award,
  Briefcase,
  User,
  Mail,
  Plus,
  Trash2,
  Edit3,
  Pin,
  PinOff,
  Star,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Upload,
  RefreshCw,
  Eye,
  ExternalLink,
  Save,
  MessageSquare,
  AlertTriangle,
  RotateCcw,
  Image as ImageIcon,
  Camera,
  Layers,
  Sparkles,
} from "lucide-react";

interface DeleteTarget {
  type: "project" | "skill" | "achievement" | "experience" | "message" | "reset";
  id?: string;
  name?: string;
}

export const AdminDashboard: React.FC = () => {
  const {
    profile,
    projects,
    skills,
    achievements,
    experiences,
    messages,
    isAdmin,
    adminUser,
    logoutAdmin,
    updateProfile,
    createProject,
    updateProject,
    deleteProject,
    togglePinProject,
    toggleFeatureProject,
    reorderProjects,
    createSkill,
    updateSkill,
    deleteSkill,
    createAchievement,
    updateAchievement,
    deleteAchievement,
    createExperience,
    updateExperience,
    deleteExperience,
    markMessageRead,
    toggleMessageStar,
    deleteMessage,
    resetToDefault,
    setSelectedProject,
    showToast,
  } = usePortfolio();

  const [activeAdminTab, setActiveAdminTab] = useState<"projects" | "skills" | "achievements" | "experiences" | "profile" | "messages" | "system">("projects");

  // In-App Deletion Modal State (replaces window.confirm which is blocked in iframes)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Project Editor State
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [projectForm, setProjectForm] = useState<Partial<Project>>({
    name: "",
    displayName: "",
    description: "",
    longDescription: "",
    primaryLanguage: "TypeScript",
    primaryLanguageColor: "#3178c6",
    technologies: ["React", "TypeScript"],
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
    gallery: [],
    status: "Live",
    isPinned: false,
    stars: 120,
    forks: 18,
    liveUrl: "https://demo.example.com",
    githubUrl: "https://github.com/hammadhassan",
    highlights: ["High-performance caching layer", "Sub-50ms query response time"],
    architecture: ["React frontend", "Django REST backend", "PostgreSQL database"],
  });

  // Skill Editor State
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [isCreatingSkill, setIsCreatingSkill] = useState(false);
  const [skillForm, setSkillForm] = useState<Partial<Skill>>({
    name: "",
    category: "Frontend",
    level: "Expert",
    years: "3+ years",
    badgeColor: "#61dafb",
  });

  // Achievement Editor State
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [isCreatingAchievement, setIsCreatingAchievement] = useState(false);
  const [achievementForm, setAchievementForm] = useState<Partial<Achievement>>({
    title: "",
    description: "",
    icon: "🏆",
    category: "GitHub",
    unlockedDate: "2024",
    badgeColor: "#58a6ff",
  });

  const presetAchievementIcons = [
    { emoji: "❄️", label: "Arctic Code Vault" },
    { emoji: "🦈", label: "Pull Shark" },
    { emoji: "⚡", label: "Quickdraw" },
    { emoji: "🌟", label: "Starstruck" },
    { emoji: "🏆", label: "Trophy / Champion" },
    { emoji: "🚀", label: "Rocket Launch" },
    { emoji: "🧠", label: "Galaxy Brain" },
    { emoji: "👯", label: "Pair Extraordinaire" },
    { emoji: "🎯", label: "Target / Precision" },
    { emoji: "💡", label: "Innovator / Idea" },
    { emoji: "🔥", label: "Streak / Fire" },
    { emoji: "🛡️", label: "Security & Shield" },
    { emoji: "🎖️", label: "Honor Medal" },
    { emoji: "💻", label: "Code Master" },
    { emoji: "🪐", label: "Deep Space" },
    { emoji: "💎", label: "Diamond Tier" },
    { emoji: "🦾", label: "Power Builder" },
    { emoji: "🌐", label: "Global Reach" },
  ];

  // Career Experience / Work History State
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [isCreatingExperience, setIsCreatingExperience] = useState(false);
  const [experienceForm, setExperienceForm] = useState<Partial<Experience>>({
    role: "",
    company: "",
    period: "2023 - Present",
    location: "Remote",
    type: "Full-Time",
    description: "",
    achievements: [],
    technologies: [],
  });
  const [newExpAchievement, setNewExpAchievement] = useState("");
  const [newExpTech, setNewExpTech] = useState("");

  // Profile Editor State
  const [profileForm, setProfileForm] = useState<Partial<Profile>>(profile || {});
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [isUploadingProjectImage, setIsUploadingProjectImage] = useState(false);

  // File input refs for device upload
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const projectFileInputRef = useRef<HTMLInputElement>(null);

  // Keep track of whether initial profile has been loaded into form
  const hasInitializedProfileRef = useRef(false);

  React.useEffect(() => {
    if (profile && !hasInitializedProfileRef.current) {
      setProfileForm(profile);
      hasInitializedProfileRef.current = true;
    }
  }, [profile]);

  if (!isAdmin) {
    return (
      <div className="border border-rose-500/30 rounded-lg p-12 bg-[#161b22] text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-[#f0f6fc]">Admin Access Required</h2>
        <p className="text-xs text-[#8b949e] max-w-md mx-auto">
          You must be logged in with administrative credentials to manage portfolio content.
        </p>
      </div>
    );
  }

  // Execute Deletion from In-App Modal
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      if (deleteTarget.type === "project" && deleteTarget.id) {
        await deleteProject(deleteTarget.id);
      } else if (deleteTarget.type === "skill" && deleteTarget.id) {
        await deleteSkill(deleteTarget.id);
      } else if (deleteTarget.type === "achievement" && deleteTarget.id) {
        await deleteAchievement(deleteTarget.id);
      } else if (deleteTarget.type === "experience" && deleteTarget.id) {
        await deleteExperience(deleteTarget.id);
      } else if (deleteTarget.type === "message" && deleteTarget.id) {
        await deleteMessage(deleteTarget.id);
      } else if (deleteTarget.type === "reset") {
        await resetToDefault();
      }
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Handle Project Save
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.name || !projectForm.displayName) {
      showToast("Please provide both a repository name and display title.", "error");
      return;
    }

    try {
      setIsSavingProject(true);
      if (editingProject) {
        const ok = await updateProject(editingProject.id, projectForm);
        if (ok) {
          setEditingProject(null);
        }
      } else if (isCreatingProject) {
        const ok = await createProject(projectForm);
        if (ok) {
          setIsCreatingProject(false);
        }
      }
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleOpenEditProject = (proj: Project) => {
    setEditingProject(proj);
    setIsCreatingProject(false);
    setProjectForm({ ...proj });
  };

  const handleOpenNewProject = () => {
    setIsCreatingProject(true);
    setEditingProject(null);
    setProjectForm({
      name: "",
      displayName: "",
      description: "",
      longDescription: "",
      primaryLanguage: "TypeScript",
      primaryLanguageColor: "#3178c6",
      technologies: ["React", "TypeScript"],
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
      ],
      status: "Live",
      isPinned: false,
      stars: 125,
      forks: 18,
      liveUrl: "https://demo.example.com",
      githubUrl: "https://github.com/hammadhassan",
      highlights: ["Clean modular architecture", "Responsive desktop and mobile interface"],
      architecture: ["React SPA", "Express / Django API", "PostgreSQL database"],
    });
  };

  // Handle Avatar Upload From Device
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (PNG, JPG, WebP, etc.)", "error");
      return;
    }

    try {
      setIsUploadingAvatar(true);
      // Optimize image to crisp 400x400 avatar
      const optimizedDataUrl = await optimizeImage(file, 400, 400, 0.8);
      setProfileForm((prev) => ({
        ...prev,
        avatarUrl: optimizedDataUrl,
      }));
      showToast("Avatar image loaded from device! Click 'Save Profile Changes' below to persist.", "info");
    } catch (err) {
      showToast("Failed to process image from device.", "error");
    } finally {
      setIsUploadingAvatar(false);
      // Reset input value so same file can be re-selected if needed
      if (e.target) e.target.value = "";
    }
  };

  // Handle Project Image Upload From Device
  const handleProjectImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file", "error");
      return;
    }

    try {
      setIsUploadingProjectImage(true);
      // Optimize project image to crisp, compact web preview size
      const optimizedDataUrl = await optimizeImage(file, 1000, 650, 0.75);
      setProjectForm((prev) => ({
        ...prev,
        imageUrl: optimizedDataUrl,
        gallery: [optimizedDataUrl],
      }));
      showToast("Project preview image uploaded from device!", "info");
    } catch (err) {
      showToast("Failed to process project image.", "error");
    } finally {
      setIsUploadingProjectImage(false);
      if (e.target) e.target.value = "";
    }
  };

  // Reordering projects up/down
  const handleMoveProject = (index: number, direction: "up" | "down") => {
    const newProjects = [...projects];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newProjects.length) return;

    const temp = newProjects[index];
    newProjects[index] = newProjects[targetIndex];
    newProjects[targetIndex] = temp;

    const ids = newProjects.map((p) => p.id);
    reorderProjects(ids);
  };

  // Handle Skill Save
  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSkill) {
      const ok = await updateSkill(editingSkill.id, skillForm);
      if (ok) setEditingSkill(null);
    } else if (isCreatingSkill) {
      const ok = await createSkill(skillForm);
      if (ok) setIsCreatingSkill(false);
    }
  };

  // Handle Achievement Save
  const handleSaveAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievementForm.title || !achievementForm.icon) {
      showToast("Please provide both an achievement title and icon.", "error");
      return;
    }

    if (editingAchievement) {
      const ok = await updateAchievement(editingAchievement.id, achievementForm);
      if (ok) setEditingAchievement(null);
    } else if (isCreatingAchievement) {
      const ok = await createAchievement(achievementForm);
      if (ok) setIsCreatingAchievement(false);
    }
  };

  const handleOpenNewAchievement = () => {
    setIsCreatingAchievement(true);
    setEditingAchievement(null);
    setAchievementForm({
      title: "",
      description: "",
      icon: "🏆",
      category: "GitHub",
      unlockedDate: new Date().getFullYear().toString(),
      badgeColor: "#58a6ff",
    });
  };

  const handleOpenEditAchievement = (ach: Achievement) => {
    setEditingAchievement(ach);
    setIsCreatingAchievement(false);
    setAchievementForm({ ...ach });
  };

  // Handle Career Experience Save & Open
  const handleOpenNewExperience = () => {
    setIsCreatingExperience(true);
    setEditingExperience(null);
    setExperienceForm({
      role: "",
      company: "",
      period: `${new Date().getFullYear()} - Present`,
      location: "Remote",
      type: "Full-Time",
      description: "",
      achievements: [
        "Architected scalable cloud microservices reducing query latency by 40%",
        "Led full-stack sprint deliverables across cross-functional web development teams"
      ],
      technologies: ["React", "TypeScript", "Python", "PostgreSQL"],
    });
    setNewExpAchievement("");
    setNewExpTech("");
  };

  const handleOpenEditExperience = (exp: Experience) => {
    setEditingExperience(exp);
    setIsCreatingExperience(false);
    setExperienceForm({ ...exp });
    setNewExpAchievement("");
    setNewExpTech("");
  };

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!experienceForm.role || !experienceForm.company) {
      showToast("Please provide both a role and company name.", "error");
      return;
    }

    if (editingExperience) {
      const ok = await updateExperience(editingExperience.id, experienceForm);
      if (ok) setEditingExperience(null);
    } else if (isCreatingExperience) {
      const ok = await createExperience(experienceForm);
      if (ok) setIsCreatingExperience(false);
    }
  };

  // Handle Profile Save
  const handleSaveProfile = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    try {
      setIsSavingProfile(true);
      setProfileSaveSuccess(false);
      const ok = await updateProfile(profileForm);
      if (ok) {
        setProfileSaveSuccess(true);
        setTimeout(() => setProfileSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Save profile error:", err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Curated project images helper
  const sampleImages = [
    { label: "Cloud Dashboard", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80" },
    { label: "Code Editor", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80" },
    { label: "Analytics & Graphs", url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&auto=format&fit=crop&q=80" },
    { label: "Fintech & Ledger", url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80" },
    { label: "Team Collaboration", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80" },
    { label: "Storefront & Commerce", url: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&auto=format&fit=crop&q=80" },
  ];

  // Preset language colors
  const langColors: { [key: string]: string } = {
    TypeScript: "#3178c6",
    Python: "#3572A5",
    JavaScript: "#f1e05a",
    React: "#61dafb",
    Django: "#092e20",
    Go: "#00ADD8",
    Rust: "#dea584",
    HTML: "#e34c26",
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with Admin Greeting and Quick Actions */}
      <div className="border border-[#388bfd]/40 rounded-lg p-5 bg-[#161b22] bg-gradient-to-r from-[#161b22] to-[#10243e] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1f6feb]/20 border border-[#388bfd] flex items-center justify-center text-[#58a6ff] shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#f0f6fc] flex items-center gap-2">
              <span>Admin Management Suite</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#238636]/30 text-[#39d353] border border-[#238636] font-mono">
                AUTHENTICATED
              </span>
            </h1>
            <p className="text-xs text-[#8b949e]">
              Logged in as <strong className="text-[#c9d1d9]">{adminUser?.email || "hammadhassan7409@gmail.com"}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="admin-top-add-project-btn"
            onClick={() => {
              setActiveAdminTab("projects");
              handleOpenNewProject();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] rounded-md transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </button>

          <button
            onClick={logoutAdmin}
            className="px-3 py-1.5 text-xs font-semibold text-[#8b949e] hover:text-rose-400 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#30363d] pb-2 overflow-x-auto">
        <button
          id="admin-tab-projects"
          onClick={() => setActiveAdminTab("projects")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeAdminTab === "projects"
              ? "bg-[#1f6feb] text-white font-semibold"
              : "text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]"
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Projects ({projects.length})</span>
        </button>

        <button
          id="admin-tab-skills"
          onClick={() => setActiveAdminTab("skills")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeAdminTab === "skills"
              ? "bg-[#1f6feb] text-white font-semibold"
              : "text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Skills ({skills.length})</span>
        </button>

        <button
          id="admin-tab-achievements"
          onClick={() => setActiveAdminTab("achievements")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeAdminTab === "achievements"
              ? "bg-[#1f6feb] text-white font-semibold"
              : "text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Achievements ({achievements.length})</span>
        </button>

        <button
          id="admin-tab-experiences"
          onClick={() => setActiveAdminTab("experiences")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeAdminTab === "experiences"
              ? "bg-[#1f6feb] text-white font-semibold"
              : "text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Career & Activity ({experiences.length})</span>
        </button>

        <button
          id="admin-tab-profile"
          onClick={() => setActiveAdminTab("profile")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeAdminTab === "profile"
              ? "bg-[#1f6feb] text-white font-semibold"
              : "text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile & Avatar</span>
        </button>

        <button
          id="admin-tab-messages"
          onClick={() => setActiveAdminTab("messages")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeAdminTab === "messages"
              ? "bg-[#1f6feb] text-white font-semibold"
              : "text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]"
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Inbox Messages ({messages.length})</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          id="admin-tab-system"
          onClick={() => setActiveAdminTab("system")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeAdminTab === "system"
              ? "bg-[#1f6feb] text-white font-semibold"
              : "text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]"
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>System & Reset</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. PROJECTS MANAGER TAB */}
      {/* ======================================================== */}
      {activeAdminTab === "projects" && (
        <div className="space-y-6">
          {/* Modal / Form for creating or editing a project */}
          {(isCreatingProject || editingProject) && (
            <div className="border border-[#58a6ff]/40 rounded-lg p-6 bg-[#161b22] space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#30363d]">
                <h3 className="font-bold text-sm text-[#f0f6fc] flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#58a6ff]" />
                  <span>{editingProject ? `Edit Project: ${editingProject.name}` : "Add New Project"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingProject(false);
                    setEditingProject(null);
                  }}
                  className="p-1 text-[#8b949e] hover:text-[#f0f6fc] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProject} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#c9d1d9]">Repository Slug Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ai-workflow-builder"
                      value={projectForm.name || ""}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          name: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                        })
                      }
                      className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#c9d1d9]">Display Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AI Workflow Builder & Visual Pipeline"
                      value={projectForm.displayName || ""}
                      onChange={(e) => setProjectForm({ ...projectForm, displayName: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#c9d1d9]">Short Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief 1-2 sentence repo overview..."
                    value={projectForm.description || ""}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#c9d1d9]">Detailed README / Overview (Markdown supported)</label>
                  <textarea
                    rows={4}
                    placeholder="Full deep dive into system architecture, benchmarks, and problems solved..."
                    value={projectForm.longDescription || ""}
                    onChange={(e) => setProjectForm({ ...projectForm, longDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff] resize-y"
                  />
                </div>

                {/* Primary Language, Status & Stars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#c9d1d9]">Primary Language</label>
                    <select
                      value={projectForm.primaryLanguage || "TypeScript"}
                      onChange={(e) => {
                        const lang = e.target.value;
                        setProjectForm({
                          ...projectForm,
                          primaryLanguage: lang,
                          primaryLanguageColor: langColors[lang] || "#3178c6",
                        });
                      }}
                      className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
                    >
                      <option value="TypeScript">TypeScript</option>
                      <option value="Python">Python</option>
                      <option value="JavaScript">JavaScript</option>
                      <option value="React">React</option>
                      <option value="Django">Django</option>
                      <option value="Go">Go</option>
                      <option value="Rust">Rust</option>
                      <option value="HTML">HTML</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#c9d1d9]">Status</label>
                    <select
                      value={projectForm.status || "Live"}
                      onChange={(e: any) => setProjectForm({ ...projectForm, status: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
                    >
                      <option value="Live">Live</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Beta">Beta</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#c9d1d9]">Stars Count</label>
                    <input
                      type="number"
                      value={projectForm.stars || 0}
                      onChange={(e) => setProjectForm({ ...projectForm, stars: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
                    />
                  </div>
                </div>

                {/* Technologies List */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#c9d1d9]">
                    Technologies (comma separated tags)
                  </label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, Django, PostgreSQL, Docker, Tailwind"
                    value={projectForm.technologies?.join(", ") || ""}
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        technologies: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
                  />
                </div>

                {/* PROJECT IMAGE PREVIEW & UPLOAD FROM DEVICE */}
                <div className="space-y-3 p-4 rounded-lg bg-[#0d1117] border border-[#30363d]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#c9d1d9] flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#58a6ff]" />
                      <span>Project Preview Screenshot</span>
                    </label>
                    {projectForm.imageUrl && (
                      <span className="text-[11px] text-[#39d353] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Image selected
                      </span>
                    )}
                  </div>

                  {/* Hidden file input for project screenshot */}
                  <input
                    type="file"
                    ref={projectFileInputRef}
                    onChange={handleProjectImageFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Live Thumbnail Preview */}
                    <div className="w-28 h-18 rounded border border-[#30363d] bg-[#161b22] overflow-hidden shrink-0 flex items-center justify-center relative">
                      {projectForm.imageUrl ? (
                        <img
                          src={projectForm.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[10px] text-[#8b949e] text-center p-1">No Image</span>
                      )}
                    </div>

                    <div className="space-y-2 flex-1 w-full">
                      {/* Primary Device Upload Button */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => projectFileInputRef.current?.click()}
                          disabled={isUploadingProjectImage}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1f6feb] hover:bg-[#388bfd] rounded transition-colors cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploadingProjectImage ? "Optimizing..." : "Upload Image from Device"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setProjectForm({
                              ...projectForm,
                              imageUrl: "",
                              gallery: [],
                            })
                          }
                          className="px-2.5 py-1.5 text-xs text-[#8b949e] hover:text-rose-400 bg-[#21262d] rounded transition-colors"
                        >
                          Clear
                        </button>
                      </div>

                      {/* Online URL input fallback */}
                      <input
                        type="text"
                        value={projectForm.imageUrl || ""}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            imageUrl: e.target.value,
                            gallery: [e.target.value],
                          })
                        }
                        placeholder="Or paste screenshot image URL (https://...)"
                        className="w-full px-3 py-1.5 bg-[#161b22] border border-[#30363d] rounded text-xs text-[#f0f6fc] placeholder-[#8b949e]"
                      />
                    </div>
                  </div>

                  {/* Preset Screenshots Quick Picker */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#8b949e] pt-1">
                    <span>Or quick presets:</span>
                    {sampleImages.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() =>
                          setProjectForm({
                            ...projectForm,
                            imageUrl: s.url,
                            gallery: [s.url],
                          })
                        }
                        className="px-2 py-0.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] border border-[#30363d] cursor-pointer"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Demo & GitHub URLs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#c9d1d9]">Live Demo URL</label>
                    <input
                      type="url"
                      placeholder="https://demo.example.com"
                      value={projectForm.liveUrl || ""}
                      onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#c9d1d9]">GitHub Repo URL</label>
                    <input
                      type="url"
                      placeholder="https://github.com/hammadhassan/..."
                      value={projectForm.githubUrl || ""}
                      onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
                    />
                  </div>
                </div>

                {/* Pinned & Featured Checkboxes */}
                <div className="flex flex-wrap items-center gap-6 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPinnedCheck"
                      checked={Boolean(projectForm.isPinned)}
                      onChange={(e) => setProjectForm({ ...projectForm, isPinned: e.target.checked })}
                      className="rounded bg-[#0d1117] border-[#30363d] cursor-pointer"
                    />
                    <label htmlFor="isPinnedCheck" className="text-xs font-medium text-[#c9d1d9] cursor-pointer">
                      Pin to Overview page (Pinned Repositories)
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isFeaturedCheck"
                      checked={Boolean(projectForm.isFeatured)}
                      onChange={(e) => setProjectForm({ ...projectForm, isFeatured: e.target.checked })}
                      className="rounded bg-[#0d1117] border-[#30363d] cursor-pointer"
                    />
                    <label htmlFor="isFeaturedCheck" className="text-xs font-medium text-[#c9d1d9] cursor-pointer flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>Featured Project badge</span>
                    </label>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#30363d]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingProject(false);
                      setEditingProject(null);
                    }}
                    className="px-4 py-2 text-xs text-[#8b949e] hover:text-[#f0f6fc] bg-[#21262d] rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="admin-save-project-submit-btn"
                    disabled={isSavingProject}
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors cursor-pointer"
                  >
                    <Save className={`w-3.5 h-3.5 ${isSavingProject ? "animate-spin" : ""}`} />
                    <span>{isSavingProject ? "Saving to Database..." : editingProject ? "Update Project" : "Create Project"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-sm font-bold text-[#f0f6fc]">
                Project Repositories ({projects.length})
              </h2>
              <p className="text-xs text-[#8b949e]">
                Manage, add, reorder, edit, and delete repositories displayed across your portfolio.
              </p>
            </div>

            <button
              id="admin-add-project-main-btn"
              onClick={handleOpenNewProject}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#238636] hover:bg-[#2ea043] rounded-md transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Project</span>
            </button>
          </div>

          {/* Projects Table & List */}
          <div className="border border-[#30363d] rounded-lg bg-[#161b22] overflow-hidden">
            <div className="divide-y divide-[#30363d]">
              {projects.length === 0 ? (
                <div className="p-12 text-center text-[#8b949e] space-y-3">
                  <FolderGit2 className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-sm text-[#f0f6fc] font-semibold">No projects yet</p>
                  <p className="text-xs">Click "Add New Project" above to create your first repository showcase.</p>
                  <button
                    onClick={handleOpenNewProject}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] rounded inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project Now</span>
                  </button>
                </div>
              ) : (
                projects.map((proj, idx) => (
                  <div
                    key={proj.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#21262d]/50 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      {/* Order Controls */}
                      <div className="flex sm:flex-col gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveProject(idx, "up")}
                          className="p-1 rounded bg-[#0d1117] hover:bg-[#30363d] disabled:opacity-30 text-[#8b949e] cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          disabled={idx === projects.length - 1}
                          onClick={() => handleMoveProject(idx, "down")}
                          className="p-1 rounded bg-[#0d1117] hover:bg-[#30363d] disabled:opacity-30 text-[#8b949e] cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Image Thumbnail */}
                      {proj.imageUrl && (
                        <div className="w-14 h-10 rounded overflow-hidden border border-[#30363d] bg-[#0d1117] shrink-0 hidden sm:block">
                          <img src={proj.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => setSelectedProject(proj)}
                            className="font-bold text-xs sm:text-sm text-[#58a6ff] hover:underline cursor-pointer"
                          >
                            {proj.name}
                          </button>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0d1117] text-[#8b949e] border border-[#30363d]">
                            {proj.primaryLanguage}
                          </span>
                          {proj.isPinned && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1 font-mono">
                              <Pin className="w-2.5 h-2.5" /> PINNED
                            </span>
                          )}
                          {proj.isFeatured && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1 font-mono">
                              <Star className="w-2.5 h-2.5 fill-indigo-400" /> FEATURED
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#8b949e] line-clamp-1 mt-0.5">
                          {proj.displayName} — {proj.description}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => toggleFeatureProject(proj.id)}
                        className={`p-1.5 rounded border border-[#30363d] text-xs cursor-pointer ${
                          proj.isFeatured ? "text-indigo-400 bg-indigo-500/10 border-indigo-500/40" : "text-[#8b949e] hover:text-[#f0f6fc]"
                        }`}
                        title={proj.isFeatured ? "Unfeature repository" : "Mark as featured repository"}
                      >
                        <Star className={`w-3.5 h-3.5 ${proj.isFeatured ? "fill-indigo-400" : ""}`} />
                      </button>

                      <button
                        onClick={() => togglePinProject(proj.id)}
                        className={`p-1.5 rounded border border-[#30363d] text-xs cursor-pointer ${
                          proj.isPinned ? "text-amber-400 bg-amber-500/10 border-amber-500/40" : "text-[#8b949e] hover:text-[#f0f6fc]"
                        }`}
                        title={proj.isPinned ? "Unpin repository" : "Pin repository"}
                      >
                        {proj.isPinned ? <Pin className="w-3.5 h-3.5 fill-amber-400" /> : <PinOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleOpenEditProject(proj)}
                        className="p-1.5 text-[#58a6ff] hover:bg-[#30363d] border border-[#30363d] rounded cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget({ type: "project", id: proj.id, name: proj.name || proj.displayName })}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 border border-[#30363d] rounded cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SKILLS MANAGER TAB */}
      {/* ======================================================== */}
      {activeAdminTab === "skills" && (
        <div className="space-y-6">
          {/* Create/Edit Skill Form */}
          {(isCreatingSkill || editingSkill) && (
            <div className="border border-[#58a6ff]/40 rounded-lg p-5 bg-[#161b22] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
                <h3 className="font-bold text-xs text-[#f0f6fc]">
                  {editingSkill ? `Edit Skill: ${editingSkill.name}` : "Add New Skill"}
                </h3>
                <button
                  onClick={() => {
                    setIsCreatingSkill(false);
                    setEditingSkill(null);
                  }}
                  className="p-1 text-[#8b949e]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSkill} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#c9d1d9]">Skill / Tech Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Django REST"
                      value={skillForm.name || ""}
                      onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#c9d1d9]">Category *</label>
                    <select
                      value={skillForm.category || "Frontend"}
                      onChange={(e: any) => setSkillForm({ ...skillForm, category: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
                    >
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Database & Cloud">Database & Cloud</option>
                      <option value="Languages">Languages</option>
                      <option value="DevOps & Tools">DevOps & Tools</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#c9d1d9]">Proficiency Level</label>
                    <select
                      value={skillForm.level || "Expert"}
                      onChange={(e: any) => setSkillForm({ ...skillForm, level: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
                    >
                      <option value="Expert">Expert</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Proficient">Proficient</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#c9d1d9]">Years of Experience</label>
                    <input
                      type="text"
                      placeholder="e.g. 3+ years"
                      value={skillForm.years || "3+ years"}
                      onChange={(e) => setSkillForm({ ...skillForm, years: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#c9d1d9]">Badge Color (Hex)</label>
                    <input
                      type="text"
                      placeholder="#58a6ff"
                      value={skillForm.badgeColor || "#58a6ff"}
                      onChange={(e) => setSkillForm({ ...skillForm, badgeColor: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingSkill(false);
                      setEditingSkill(null);
                    }}
                    className="px-3 py-1.5 text-xs text-[#8b949e] bg-[#21262d] rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] rounded cursor-pointer"
                  >
                    {editingSkill ? "Update Skill" : "Add Skill"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#f0f6fc]">
              Configured Skills & Badges ({skills.length})
            </h2>
            <button
              onClick={() => {
                setIsCreatingSkill(true);
                setEditingSkill(null);
                setSkillForm({
                  name: "",
                  category: "Frontend",
                  level: "Expert",
                  years: "3+ years",
                  badgeColor: "#61dafb",
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] rounded transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Skill</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {skills.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-lg border border-[#30363d] bg-[#161b22] flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.badgeColor }} />
                  <div>
                    <div className="font-semibold text-xs text-[#f0f6fc]">{s.name}</div>
                    <div className="text-[10px] text-[#8b949e]">
                      {s.category} • {s.level}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingSkill(s);
                      setIsCreatingSkill(false);
                      setSkillForm({ ...s });
                    }}
                    className="p-1 text-[#58a6ff] hover:bg-[#21262d] rounded cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ type: "skill", id: s.id, name: s.name })}
                    className="p-1 text-rose-400 hover:bg-rose-500/10 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. ACHIEVEMENTS MANAGER TAB (ADD, EDIT, DELETE) */}
      {/* ======================================================== */}
      {activeAdminTab === "achievements" && (
        <div className="space-y-6">
          {/* Header & Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#30363d]">
            <div>
              <h2 className="text-base font-bold text-[#f0f6fc] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#58a6ff]" />
                <span>Profile Achievements & Badges ({achievements.length})</span>
              </h2>
              <p className="text-xs text-[#8b949e] mt-0.5">
                Add, customize, and remove achievement badges displayed on the profile sidebar. All updates take effect immediately.
              </p>
            </div>

            {!isCreatingAchievement && !editingAchievement && (
              <button
                id="admin-add-achievement-btn"
                onClick={handleOpenNewAchievement}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] rounded-md transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Achievement</span>
              </button>
            )}
          </div>

          {/* Achievement Editor Modal / Form */}
          {(isCreatingAchievement || editingAchievement) && (
            <div className="border border-[#388bfd]/40 rounded-lg p-5 bg-[#161b22] space-y-4 shadow-lg animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#30363d]">
                <h3 className="text-sm font-bold text-[#f0f6fc] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#58a6ff]" />
                  <span>{editingAchievement ? `Edit Achievement: ${editingAchievement.title}` : "Create New Achievement Badge"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingAchievement(false);
                    setEditingAchievement(null);
                  }}
                  className="p-1 text-[#8b949e] hover:text-[#f0f6fc] rounded hover:bg-[#21262d] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAchievement} className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column: Form Fields */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#c9d1d9]">
                          Achievement Title <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Pull Shark, Starstruck, Arctic Vault"
                          value={achievementForm.title || ""}
                          onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
                          className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc] focus:border-[#58a6ff] outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#c9d1d9]">Category</label>
                        <select
                          value={achievementForm.category || "GitHub"}
                          onChange={(e) => setAchievementForm({ ...achievementForm, category: e.target.value })}
                          className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc] focus:border-[#58a6ff] outline-hidden cursor-pointer"
                        >
                          <option value="GitHub">GitHub</option>
                          <option value="Open Source">Open Source</option>
                          <option value="Milestone">Milestone</option>
                          <option value="Architecture">Architecture</option>
                          <option value="Performance">Performance</option>
                          <option value="Security">Security</option>
                          <option value="Community">Community</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#c9d1d9]">Unlocked Date / Tier</label>
                        <input
                          type="text"
                          placeholder="e.g. 2024, Gold Tier, x2"
                          value={achievementForm.unlockedDate || ""}
                          onChange={(e) => setAchievementForm({ ...achievementForm, unlockedDate: e.target.value })}
                          className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc] focus:border-[#58a6ff] outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#c9d1d9]">Badge Accent Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="#58a6ff"
                            value={achievementForm.badgeColor || "#58a6ff"}
                            onChange={(e) => setAchievementForm({ ...achievementForm, badgeColor: e.target.value })}
                            className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc] focus:border-[#58a6ff] outline-hidden font-mono"
                          />
                          <input
                            type="color"
                            value={achievementForm.badgeColor || "#58a6ff"}
                            onChange={(e) => setAchievementForm({ ...achievementForm, badgeColor: e.target.value })}
                            className="w-8 h-8 rounded border border-[#30363d] bg-[#0d1117] cursor-pointer p-0.5"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Color Presets */}
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#8b949e]">Color Presets:</label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: "Blue", hex: "#58a6ff" },
                          { name: "Green", hex: "#3fb950" },
                          { name: "Gold", hex: "#d29922" },
                          { name: "Purple", hex: "#bc8cff" },
                          { name: "Coral", hex: "#f85149" },
                          { name: "Cyan", hex: "#39c5cf" },
                          { name: "Amber", hex: "#e3b341" },
                        ].map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => setAchievementForm({ ...achievementForm, badgeColor: c.hex })}
                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#0d1117] border border-[#30363d] text-[10px] text-[#c9d1d9] hover:border-[#58a6ff] cursor-pointer"
                          >
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.hex }} />
                            <span>{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#c9d1d9]">Description</label>
                      <textarea
                        rows={2}
                        placeholder="Briefly describe what this achievement celebrates (e.g. Merged 100+ pull requests in production repositories)"
                        value={achievementForm.description || ""}
                        onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc] focus:border-[#58a6ff] outline-hidden"
                      />
                    </div>

                    {/* Icon Selection & Presets */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#c9d1d9]">
                          Badge Emoji / Icon <span className="text-rose-400">*</span>
                        </label>
                        <span className="text-[11px] text-[#8b949e]">Click a preset or type below</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          placeholder="❄️, 🦈, ⚡, 🌟, 🏆"
                          value={achievementForm.icon || "🏆"}
                          onChange={(e) => setAchievementForm({ ...achievementForm, icon: e.target.value })}
                          className="w-24 text-center px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-base text-[#f0f6fc] focus:border-[#58a6ff] outline-hidden"
                        />
                        <span className="text-xs text-[#8b949e]">
                          Current: <strong className="text-xl ml-1">{achievementForm.icon || "🏆"}</strong>
                        </span>
                      </div>

                      {/* Preset Emoji Grid */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                        {presetAchievementIcons.map((item) => (
                          <button
                            key={item.emoji}
                            type="button"
                            onClick={() =>
                              setAchievementForm({
                                ...achievementForm,
                                icon: item.emoji,
                                title: achievementForm.title || item.label,
                              })
                            }
                            className={`p-1.5 rounded border text-left flex items-center gap-1.5 transition-colors cursor-pointer ${
                              achievementForm.icon === item.emoji
                                ? "bg-[#1f6feb]/20 border-[#58a6ff] text-[#f0f6fc]"
                                : "bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]"
                            }`}
                            title={item.label}
                          >
                            <span className="text-base">{item.emoji}</span>
                            <span className="text-[10px] truncate">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Badge Preview Card */}
                  <div className="lg:col-span-4 flex flex-col justify-between p-4 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-[#58a6ff]" />
                        <span>Live Sidebar Badge Preview</span>
                      </div>

                      <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] text-center space-y-3">
                        <div
                          className="w-16 h-16 rounded-full bg-[#161b22] border-2 mx-auto p-2 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                          style={{ borderColor: achievementForm.badgeColor || "#58a6ff" }}
                        >
                          <span className="text-3xl select-none">{achievementForm.icon || "🏆"}</span>
                        </div>

                        <div>
                          <div className="text-sm font-bold text-[#f0f6fc]">
                            {achievementForm.title || "Achievement Title"}
                          </div>
                          <div className="text-[11px] text-[#58a6ff] mt-0.5">
                            {achievementForm.category || "GitHub"} • {achievementForm.unlockedDate || "2024"}
                          </div>
                          <p className="text-xs text-[#8b949e] mt-2 leading-relaxed">
                            {achievementForm.description || "Description of what this badge commemorates."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 p-2.5 rounded bg-[#161b22]/70 border border-[#30363d] text-[11px] text-[#8b949e] space-y-1">
                        <div className="text-[#c9d1d9] font-medium">✨ GitHub Look & Feel:</div>
                        <p>This badge will appear as a circular interactive achievement in your profile sidebar.</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#30363d]">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingAchievement(false);
                          setEditingAchievement(null);
                        }}
                        className="px-3.5 py-1.5 text-xs text-[#8b949e] hover:text-[#f0f6fc] bg-[#21262d] hover:bg-[#30363d] rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] rounded shadow-sm cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{editingAchievement ? "Update Achievement" : "Save Achievement"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* List of Existing Achievements */}
          {achievements.length === 0 ? (
            <div className="border border-dashed border-[#30363d] rounded-lg p-10 text-center bg-[#161b22] space-y-3">
              <Award className="w-10 h-10 text-[#8b949e] mx-auto opacity-50" />
              <div className="text-sm font-semibold text-[#f0f6fc]">No Achievements Configured</div>
              <p className="text-xs text-[#8b949e] max-w-sm mx-auto">
                Add GitHub achievement badges (e.g. Arctic Code Vault, Pull Shark, Quickdraw) to highlight your developer milestones.
              </p>
              <button
                onClick={handleOpenNewAchievement}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] rounded cursor-pointer"
              >
                Add Your First Achievement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-3.5 rounded-lg border border-[#30363d] bg-[#161b22] hover:border-[#58a6ff]/40 transition-colors flex flex-col justify-between gap-3 group relative"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 shrink-0 rounded-full bg-[#0d1117] border p-1.5 flex items-center justify-center shadow-xs"
                      style={{ borderColor: ach.badgeColor || "#58a6ff" }}
                    >
                      <span className="text-2xl select-none">{ach.icon || "🏆"}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-[#f0f6fc] truncate">{ach.title}</span>
                        {ach.unlockedDate && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#21262d] text-[#58a6ff] font-mono">
                            {ach.unlockedDate}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#8b949e] mt-0.5">{ach.category || "GitHub"}</div>
                      {ach.description && (
                        <p className="text-xs text-[#8b949e] mt-1.5 line-clamp-2 leading-relaxed">
                          {ach.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#30363d]/60 text-xs">
                    <span className="text-[10px] text-[#8b949e] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ach.badgeColor || "#58a6ff" }} />
                      <span>{ach.category || "Badge"}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditAchievement(ach)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-[#58a6ff] hover:bg-[#21262d] rounded transition-colors cursor-pointer"
                        title="Edit achievement details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: "achievement", id: ach.id, name: ach.title })}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                        title="Delete achievement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. CAREER & ACTIVITY TIMELINE TAB */}
      {/* ======================================================== */}
      {activeAdminTab === "experiences" && (
        <div className="space-y-6">
          {/* Header & Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#30363d]">
            <div>
              <h2 className="text-base font-bold text-[#f0f6fc] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#58a6ff]" />
                <span>Career Experience & Activity Timeline ({experiences.length})</span>
              </h2>
              <p className="text-xs text-[#8b949e] mt-0.5">
                Manage professional roles, client contracts, and web development history displayed on your About & Activity page.
              </p>
            </div>

            {!isCreatingExperience && !editingExperience && (
              <button
                id="admin-add-experience-btn"
                onClick={handleOpenNewExperience}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] rounded-md transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Career Entry</span>
              </button>
            )}
          </div>

          {/* Experience Editor Form */}
          {(isCreatingExperience || editingExperience) && (
            <div className="border border-[#388bfd]/40 rounded-lg p-5 bg-[#161b22] space-y-4 shadow-lg animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#30363d]">
                <h3 className="text-sm font-bold text-[#f0f6fc] flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#58a6ff]" />
                  <span>{editingExperience ? `Edit Role: ${editingExperience.role} at ${editingExperience.company}` : "Add New Career Timeline Entry"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingExperience(false);
                    setEditingExperience(null);
                  }}
                  className="p-1 text-[#8b949e] hover:text-[#f0f6fc] rounded hover:bg-[#21262d] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveExperience} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#c9d1d9]">
                      Role Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Full Stack Web Developer, Tech Lead"
                      value={experienceForm.role || ""}
                      onChange={(e) => setExperienceForm({ ...experienceForm, role: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc] focus:border-[#58a6ff] outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#c9d1d9]">
                      Company / Organization <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TechCorp, Freelance, Open Source"
                      value={experienceForm.company || ""}
                      onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc] focus:border-[#58a6ff] outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#c9d1d9]">Period / Dates</label>
                    <input
                      type="text"
                      placeholder="e.g. 2023 - Present"
                      value={experienceForm.period || ""}
                      onChange={(e) => setExperienceForm({ ...experienceForm, period: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc] focus:border-[#58a6ff] outline-hidden font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#c9d1d9]">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Remote, Lahore, PK"
                      value={experienceForm.location || ""}
                      onChange={(e) => setExperienceForm({ ...experienceForm, location: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc] focus:border-[#58a6ff] outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#c9d1d9]">Employment Type</label>
                    <select
                      value={experienceForm.type || "Full-Time"}
                      onChange={(e) => setExperienceForm({ ...experienceForm, type: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc] focus:border-[#58a6ff] outline-hidden cursor-pointer"
                    >
                      <option value="Full-Time">Full-Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Open Source">Open Source</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#c9d1d9]">Role Summary & Overview</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your core responsibilities, team impact, and web development accomplishments..."
                    value={experienceForm.description || ""}
                    onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc] focus:border-[#58a6ff] outline-hidden resize-y"
                  />
                </div>

                {/* Key Achievements List Editor */}
                <div className="space-y-2 p-3 rounded-lg bg-[#0d1117] border border-[#30363d]">
                  <label className="text-xs font-semibold text-[#c9d1d9] flex items-center justify-between">
                    <span>Key Achievements & Milestones ({experienceForm.achievements?.length || 0})</span>
                    <span className="text-[10px] text-[#8b949e]">Bullet points for About page</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add an accomplishment bullet (e.g. Reduced database load by 35% using Redis)"
                      value={newExpAchievement}
                      onChange={(e) => setNewExpAchievement(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (newExpAchievement.trim()) {
                            setExperienceForm({
                              ...experienceForm,
                              achievements: [...(experienceForm.achievements || []), newExpAchievement.trim()],
                            });
                            setNewExpAchievement("");
                          }
                        }
                      }}
                      className="w-full px-3 py-1.5 bg-[#161b22] border border-[#30363d] rounded text-xs text-[#f0f6fc] focus:border-[#58a6ff] outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newExpAchievement.trim()) {
                          setExperienceForm({
                            ...experienceForm,
                            achievements: [...(experienceForm.achievements || []), newExpAchievement.trim()],
                          });
                          setNewExpAchievement("");
                        }
                      }}
                      className="px-3 py-1.5 text-xs bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] rounded font-medium cursor-pointer shrink-0"
                    >
                      Add
                    </button>
                  </div>

                  {experienceForm.achievements && experienceForm.achievements.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      {experienceForm.achievements.map((ach, idx) => (
                        <div key={idx} className="flex items-start justify-between gap-2 p-2 rounded bg-[#161b22] border border-[#30363d] text-xs">
                          <span className="text-[#c9d1d9] flex-1 leading-relaxed">• {ach}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...(experienceForm.achievements || [])];
                              next.splice(idx, 1);
                              setExperienceForm({ ...experienceForm, achievements: next });
                            }}
                            className="p-0.5 text-rose-400 hover:text-rose-300 rounded cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Technologies Tag Editor */}
                <div className="space-y-2 p-3 rounded-lg bg-[#0d1117] border border-[#30363d]">
                  <label className="text-xs font-semibold text-[#c9d1d9] flex items-center justify-between">
                    <span>Tech Stack & Tools ({experienceForm.technologies?.length || 0})</span>
                    <span className="text-[10px] text-[#8b949e]">Tags displayed on timeline</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. React, TypeScript, Django, PostgreSQL"
                      value={newExpTech}
                      onChange={(e) => setNewExpTech(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (newExpTech.trim()) {
                            setExperienceForm({
                              ...experienceForm,
                              technologies: [...(experienceForm.technologies || []), newExpTech.trim()],
                            });
                            setNewExpTech("");
                          }
                        }
                      }}
                      className="w-full px-3 py-1.5 bg-[#161b22] border border-[#30363d] rounded text-xs text-[#f0f6fc] focus:border-[#58a6ff] outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newExpTech.trim()) {
                          setExperienceForm({
                            ...experienceForm,
                            technologies: [...(experienceForm.technologies || []), newExpTech.trim()],
                          });
                          setNewExpTech("");
                        }
                      }}
                      className="px-3 py-1.5 text-xs bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] rounded font-medium cursor-pointer shrink-0"
                    >
                      Add Tag
                    </button>
                  </div>

                  {experienceForm.technologies && experienceForm.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {experienceForm.technologies.map((tech, idx) => (
                        <span key={idx} className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#161b22] border border-[#30363d] text-xs text-[#58a6ff] font-mono">
                          <span>{tech}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...(experienceForm.technologies || [])];
                              next.splice(idx, 1);
                              setExperienceForm({ ...experienceForm, technologies: next });
                            }}
                            className="text-[#8b949e] hover:text-rose-400 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#30363d]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingExperience(false);
                      setEditingExperience(null);
                    }}
                    className="px-4 py-1.5 text-xs text-[#8b949e] hover:text-[#f0f6fc] bg-[#21262d] hover:bg-[#30363d] rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-1.5 text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] rounded shadow-sm cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingExperience ? "Update Career Entry" : "Save Career Entry"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Existing Experience Timeline Entries */}
          {experiences.length === 0 ? (
            <div className="border border-dashed border-[#30363d] rounded-lg p-10 text-center bg-[#161b22] space-y-3">
              <Briefcase className="w-10 h-10 text-[#8b949e] mx-auto opacity-50" />
              <div className="text-sm font-semibold text-[#f0f6fc]">No Career History Entries Configured</div>
              <p className="text-xs text-[#8b949e] max-w-sm mx-auto">
                Add your web developer roles and work experiences to display on the public About & Timeline section.
              </p>
              <button
                onClick={handleOpenNewExperience}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] rounded cursor-pointer"
              >
                Add Your First Experience
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-5 rounded-lg border border-[#30363d] bg-[#161b22] hover:border-[#58a6ff]/40 transition-colors space-y-3 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#30363d]/60">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-[#f0f6fc]">{exp.role}</h3>
                        <span className="text-xs text-[#58a6ff] font-medium">@ {exp.company}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#21262d] text-[#8b949e] border border-[#30363d] font-mono">
                          {exp.type}
                        </span>
                      </div>
                      <div className="text-xs text-[#8b949e] mt-0.5 font-mono">
                        {exp.period} • {exp.location}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleOpenEditExperience(exp)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#58a6ff] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: "experience", id: exp.id, name: `${exp.role} at ${exp.company}` })}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {exp.description && (
                    <p className="text-xs text-[#c9d1d9] leading-relaxed whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}

                  {exp.achievements && exp.achievements.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {exp.achievements.map((ach, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-[#8b949e]">
                          <Check className="w-3.5 h-3.5 text-[#39d353] shrink-0 mt-0.5" />
                          <span>{ach}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#30363d]/40">
                      {exp.technologies.map((t, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-[#0d1117] text-[#8b949e] border border-[#30363d] font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. PROFILE EDITOR TAB (WITH DEVICE AVATAR UPLOAD) */}
      {/* ======================================================== */}
      {activeAdminTab === "profile" && (
        <form noValidate onSubmit={handleSaveProfile} className="border border-[#30363d] rounded-lg p-6 bg-[#161b22] space-y-6 shadow-md">
          <div className="pb-4 border-b border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#f0f6fc] flex items-center gap-2">
                <User className="w-4 h-4 text-[#58a6ff]" />
                <span>Profile Information & Device Avatar Upload</span>
              </h2>
              <p className="text-xs text-[#8b949e] mt-0.5">
                Update your public profile picture, bio, and social links shown on GitHub sidebar and overview.
              </p>
            </div>
            <button
              id="admin-save-profile-top-btn"
              type="submit"
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className={`flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white rounded shadow-sm transition-all cursor-pointer self-start sm:self-auto ${
                profileSaveSuccess
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : isSavingProfile
                  ? "bg-[#238636]/70 cursor-not-allowed"
                  : "bg-[#238636] hover:bg-[#2ea043]"
              }`}
            >
              {isSavingProfile ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : profileSaveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Profile Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>

          {profileSaveSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">
                Profile and avatar changes saved successfully and synced across all pages!
              </span>
            </div>
          )}

          {/* DEDICATED PROFILE AVATAR UPLOAD ZONE */}
          <div className="p-5 rounded-lg bg-[#0d1117] border border-[#388bfd]/30 space-y-4">
            <h3 className="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider text-[#58a6ff]">
              Profile Avatar / PFP (Upload From Device)
            </h3>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={avatarFileInputRef}
              onChange={handleAvatarFileChange}
              accept="image/*"
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Large Current Avatar Preview */}
              <div className="relative group shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-[#58a6ff] bg-[#161b22] shadow-xl relative">
                  <img
                    src={profileForm.avatarUrl || "https://avatars.githubusercontent.com/u/583231"}
                    alt={profileForm.name || "Profile"}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs"
                >
                  <Camera className="w-5 h-5 mb-1" />
                  <span>Change PFP</span>
                </button>
              </div>

              {/* Upload CTA Controls */}
              <div className="space-y-2.5 flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <button
                    id="upload-avatar-device-btn"
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#1f6feb] hover:bg-[#388bfd] rounded-md transition-colors shadow-md cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingAvatar ? "Optimizing image..." : "Upload PFP from Device"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setProfileForm((prev) => ({
                        ...prev,
                        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
                      }))
                    }
                    className="px-3 py-2 text-xs text-[#8b949e] hover:text-[#f0f6fc] bg-[#21262d] hover:bg-[#30363d] rounded border border-[#30363d] transition-colors cursor-pointer"
                  >
                    Sample Avatar
                  </button>
                </div>

                <p className="text-[11px] text-[#8b949e]">
                  Supports PNG, JPG, GIF, WebP. Automatically optimized for retina displays.
                </p>

                {/* Optional online URL field if desired */}
                <div className="pt-1">
                  <label className="text-[11px] font-medium text-[#8b949e] block mb-1">
                    Or direct image URL:
                  </label>
                  <input
                    type="text"
                    value={profileForm.avatarUrl || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full max-w-lg px-3 py-1.5 bg-[#161b22] border border-[#30363d] rounded text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#c9d1d9]">Full Name</label>
              <input
                type="text"
                value={profileForm.name || ""}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#c9d1d9]">Username / Handle</label>
              <input
                type="text"
                value={profileForm.username || ""}
                onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#c9d1d9]">Short Sidebar Bio</label>
            <textarea
              rows={2}
              value={profileForm.bio || ""}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc] resize-y"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#c9d1d9]">Detailed README Bio</label>
            <textarea
              rows={4}
              value={profileForm.detailedBio || ""}
              onChange={(e) => setProfileForm({ ...profileForm, detailedBio: e.target.value })}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc] resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#c9d1d9]">Location</label>
              <input
                type="text"
                value={profileForm.location || ""}
                onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#c9d1d9]">Email Address</label>
              <input
                type="email"
                value={profileForm.email || ""}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#c9d1d9]">Availability Status</label>
              <input
                type="text"
                value={profileForm.status || ""}
                onChange={(e) => setProfileForm({ ...profileForm, status: e.target.value })}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
              />
            </div>
          </div>

          {/* Contact & Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#c9d1d9]">GitHub Profile Link</label>
              <input
                type="text"
                placeholder="https://github.com/..."
                value={profileForm.github || ""}
                onChange={(e) => setProfileForm({ ...profileForm, github: e.target.value })}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#c9d1d9]">LinkedIn Profile Link</label>
              <input
                type="text"
                placeholder="https://linkedin.com/in/..."
                value={profileForm.linkedin || ""}
                onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#c9d1d9]">Twitter / X Link or Handle</label>
              <input
                type="text"
                placeholder="https://x.com/... or @handle"
                value={profileForm.twitter || ""}
                onChange={(e) => setProfileForm({ ...profileForm, twitter: e.target.value })}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#c9d1d9]">WhatsApp Number (+CountryCode...)</label>
              <input
                type="text"
                placeholder="+923004236885"
                value={profileForm.whatsapp || ""}
                onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#c9d1d9]">Website Link</label>
              <input
                type="text"
                placeholder="https://..."
                value={profileForm.website || ""}
                onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
              />
            </div>
          </div>

          {/* Role, Company, Status & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#c9d1d9]">Role / Current Focus</label>
              <input
                type="text"
                placeholder="e.g. Lead Full Stack Web Developer"
                value={profileForm.company || ""}
                onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#c9d1d9]">Years of Experience</label>
              <input
                type="number"
                value={profileForm.yearsOfExperience ?? 4}
                onChange={(e) => setProfileForm({ ...profileForm, yearsOfExperience: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#c9d1d9]">Status Message</label>
              <input
                type="text"
                placeholder="Available for high-impact roles"
                value={profileForm.status || ""}
                onChange={(e) => setProfileForm({ ...profileForm, status: e.target.value })}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#c9d1d9]">Status Emoji</label>
              <input
                type="text"
                placeholder="🟢"
                value={profileForm.statusEmoji || "🟢"}
                onChange={(e) => setProfileForm({ ...profileForm, statusEmoji: e.target.value })}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#f0f6fc] text-center"
              />
            </div>
          </div>

          {/* Social Stats Counters */}
          <div className="p-4 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-3">
            <h4 className="text-xs font-bold text-[#58a6ff] uppercase tracking-wider">
              Public Activity & Counts
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#c9d1d9]">Followers Count</label>
                <input
                  type="number"
                  value={profileForm.followersCount ?? 0}
                  onChange={(e) => setProfileForm({ ...profileForm, followersCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#161b22] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#c9d1d9]">Following Count</label>
                <input
                  type="number"
                  value={profileForm.followingCount ?? 0}
                  onChange={(e) => setProfileForm({ ...profileForm, followingCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#161b22] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#c9d1d9]">Total Stars Count</label>
                <input
                  type="number"
                  value={profileForm.starsCount ?? 0}
                  onChange={(e) => setProfileForm({ ...profileForm, starsCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#161b22] border border-[#30363d] rounded text-xs text-[#f0f6fc]"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              id="admin-save-profile-bottom-btn"
              type="submit"
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className={`flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white rounded shadow-md transition-all cursor-pointer ${
                profileSaveSuccess
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : isSavingProfile
                  ? "bg-[#238636]/70 cursor-not-allowed"
                  : "bg-[#238636] hover:bg-[#2ea043]"
              }`}
            >
              {isSavingProfile ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : profileSaveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Profile Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* 4. INBOX MESSAGES TAB */}
      {/* ======================================================== */}
      {activeAdminTab === "messages" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#f0f6fc]">
              Client & Recruiter Messages ({messages.length})
            </h2>
          </div>

          {messages.length === 0 ? (
            <div className="border border-[#30363d] rounded-lg p-12 text-center bg-[#161b22] text-[#8b949e]">
              <Mail className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold text-[#f0f6fc]">No incoming inquiries yet</p>
              <p className="text-xs text-[#8b949e] mt-1">When clients send a contact message, it appears here instantly.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-lg border transition-all ${
                    msg.read
                      ? "border-[#30363d] bg-[#161b22]"
                      : "border-[#58a6ff]/50 bg-[#161b22] shadow-md shadow-[#58a6ff]/5"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#30363d]/40">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleMessageStar(msg.id)}
                        className={`p-1 rounded cursor-pointer ${
                          msg.starred ? "text-amber-400" : "text-[#8b949e] hover:text-[#f0f6fc]"
                        }`}
                        title="Star message"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                      <h4 className="text-xs sm:text-sm font-bold text-[#f0f6fc]">
                        {msg.name}
                      </h4>
                      <span className="text-xs text-[#58a6ff] font-mono">
                        &lt;{msg.email}&gt;
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#8b949e]">
                      <span>{new Date(msg.createdAt).toLocaleString()}</span>
                      <button
                        onClick={() => markMessageRead(msg.id, !msg.read)}
                        className="p-1 hover:text-[#f0f6fc] rounded cursor-pointer"
                        title={msg.read ? "Mark as unread" : "Mark as read"}
                      >
                        {msg.read ? <Mail className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5 text-[#39d353]" />}
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: "message", id: msg.id, name: `Message from ${msg.name}` })}
                        className="p-1 text-rose-400 hover:bg-rose-500/10 rounded cursor-pointer"
                        title="Delete inquiry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 space-y-1">
                    <div className="text-xs font-semibold text-[#c9d1d9]">
                      Subject: {msg.subject}
                    </div>
                    <p className="text-xs text-[#8b949e] leading-relaxed whitespace-pre-line bg-[#0d1117] p-3 rounded border border-[#30363d]/40">
                      {msg.message}
                    </p>
                  </div>

                  {/* Direct Reply CTA */}
                  <div className="pt-2 flex justify-end">
                    <a
                      href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-[#1f6feb] hover:bg-[#388bfd] rounded"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Reply via Email</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. SYSTEM & RESET TAB */}
      {/* ======================================================== */}
      {activeAdminTab === "system" && (
        <div className="border border-[#30363d] rounded-lg p-6 bg-[#161b22] space-y-6">
          <div>
            <h2 className="text-sm font-bold text-[#f0f6fc] flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#58a6ff]" />
              <span>Cloud Auto-Restore & Persistence Settings</span>
            </h2>
            <p className="text-xs text-[#8b949e] mt-1">
              Your profile picture, website links, projects, skills, and achievements are connected to real-time cloud storage (Firebase Firestore) and automatically restored whenever the app is reinstalled or opened on any device.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#0d1117] border border-[#238636]/40 text-xs space-y-2">
            <div className="flex items-center gap-2 text-[#39d353] font-semibold">
              <Check className="w-4 h-4" />
              <span>Cloud Auto-Restore Active</span>
            </div>
            <p className="text-[#8b949e] leading-relaxed">
              Every change you make in this dashboard automatically syncs to your personal cloud database. If you uninstall, reinstall, or switch browsers, your profile avatar, project websites, live demos, and skills are restored automatically without any manual exports needed.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#0d1117] border border-amber-500/30 text-xs space-y-3">
            <h4 className="font-semibold text-amber-400">Reset to Default Showcase Data</h4>
            <p className="text-[#8b949e] leading-relaxed">
              If you wish to wipe custom edits and restore Hammad Hassan's default initial portfolio showcase data, click below.
            </p>
            <button
              onClick={() => setDeleteTarget({ type: "reset", name: "Default Portfolio Showcase Data" })}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors cursor-pointer"
            >
              Restore Default Portfolio Data
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* IN-APP CONFIRMATION MODAL (REPLACES WINDOW.CONFIRM) */}
      {/* ======================================================== */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => !isDeleting && setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#f0f6fc]">
                  {deleteTarget.type === "reset" ? "Reset Portfolio Data?" : `Confirm Deletion`}
                </h3>
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  {deleteTarget.type === "reset" ? (
                    "Are you sure you want to reset all portfolio projects, skills, achievements, and bio back to the default showcase state?"
                  ) : (
                    <>
                      Are you sure you want to permanently delete{" "}
                      <strong className="text-[#f0f6fc] font-mono">{deleteTarget.name}</strong>? This action cannot be undone.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#30363d]">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-medium text-[#c9d1d9] hover:text-white bg-[#21262d] hover:bg-[#30363d] rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-action-btn"
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors cursor-pointer shadow-sm"
              >
                {isDeleting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{isDeleting ? "Deleting..." : deleteTarget.type === "reset" ? "Reset All Data" : "Delete Permanently"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
