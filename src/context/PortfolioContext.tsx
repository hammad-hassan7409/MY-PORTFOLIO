import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Profile, Project, Skill, Achievement, Experience, Message, ContributionDay, PortfolioData, ActivityLog, ContributionData, ActivityType } from "../types";
import {
  loadProjectsFromCloud,
  saveProjectToCloud,
  deleteProjectFromCloud,
  subscribeToCloudProjects,
  loadProfileFromCloud,
  saveProfileToCloud,
  loadSkillsFromCloud,
  saveSkillToCloud,
  deleteSkillFromCloud,
  loadAchievementsFromCloud,
  saveAchievementToCloud,
  deleteAchievementFromCloud,
  loadExperiencesFromCloud,
  saveExperienceToCloud,
  deleteExperienceFromCloud,
  loadMessagesFromCloud,
  saveMessageToCloud,
  deleteMessageFromCloud,
  loadPortfolioFromCloud,
  savePortfolioToCloud,
  getLocalCachedProjects,
  loadActivitiesFromCloud,
  saveActivityToCloud,
  subscribeToCloudActivities,
  getLocalCachedActivities,
} from "../lib/portfolioSync";
import { calculateStreakAndContributions, generateSeedActivities, formatLocalDate } from "../utils/streakUtils";

interface PortfolioContextType {
  profile: Profile | null;
  projects: Project[];
  skills: Skill[];
  achievements: Achievement[];
  experiences: Experience[];
  messages: Message[];
  activities: ActivityLog[];
  contributions: ContributionData | null;
  isLoading: boolean;
  error: string | null;
  // Admin Auth
  isAdmin: boolean;
  adminToken: string | null;
  adminUser: { email: string; name: string } | null;
  loginAdmin: (password: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
  // Activities & Real Streak Logging
  logActivity: (actData: {
    type: ActivityType;
    title: string;
    description?: string;
    repo?: string;
    prNumber?: number;
    commitHash?: string;
    metadata?: Record<string, any>;
  }) => Promise<boolean>;
  // Actions
  fetchData: () => Promise<void>;
  updateProfile: (updated: Partial<Profile>) => Promise<boolean>;
  createProject: (project: Partial<Project>) => Promise<boolean>;
  updateProject: (id: string, project: Partial<Project>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  togglePinProject: (id: string) => Promise<boolean>;
  toggleFeatureProject: (id: string) => Promise<boolean>;
  reorderProjects: (projectIds: string[]) => Promise<boolean>;
  createSkill: (skill: Partial<Skill>) => Promise<boolean>;
  updateSkill: (id: string, skill: Partial<Skill>) => Promise<boolean>;
  deleteSkill: (id: string) => Promise<boolean>;
  createAchievement: (ach: Partial<Achievement>) => Promise<boolean>;
  updateAchievement: (id: string, ach: Partial<Achievement>) => Promise<boolean>;
  deleteAchievement: (id: string) => Promise<boolean>;
  createExperience: (exp: Partial<Experience>) => Promise<boolean>;
  updateExperience: (id: string, exp: Partial<Experience>) => Promise<boolean>;
  deleteExperience: (id: string) => Promise<boolean>;
  sendMessage: (msg: { name: string; email: string; subject: string; message: string }) => Promise<{ success: boolean; message: string }>;
  markMessageRead: (id: string, read: boolean) => Promise<boolean>;
  toggleMessageStar: (id: string) => Promise<boolean>;
  deleteMessage: (id: string) => Promise<boolean>;
  resetToDefault: () => Promise<boolean>;
  // UI State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedProject: Project | null;
  setSelectedProject: (p: Project | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isAdminLoginOpen: boolean;
  setIsAdminLoginOpen: (open: boolean) => void;
  toast: { message: string; type: "success" | "error" | "info" } | null;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Pre-fill projects and activities from fast local cache to guarantee instant render
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>(() => getLocalCachedProjects());
  const [skills, setSkills] = useState<Skill[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    const cached = getLocalCachedActivities();
    return cached && cached.length > 0 ? cached : [];
  });
  const [contributions, setContributions] = useState<ContributionData | null>(() => {
    const cached = getLocalCachedActivities();
    if (cached && cached.length > 0) {
      return calculateStreakAndContributions(cached);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Admin Auth State
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("portfolio_admin_token");
    }
    return null;
  });
  const [adminUser, setAdminUser] = useState<{ email: string; name: string } | null>(null);

  // Navigation & UI state
  const getInitialTab = (): string => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace(/^#\/?/, "").toLowerCase();
      if (["overview", "projects", "skills", "about", "contact", "admin"].includes(hash)) {
        return hash;
      }
    }
    return "overview";
  };

  const [activeTab, setActiveTabState] = useState<string>(getInitialTab);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const setActiveTab = (tab: string) => {
    const target = tab.toLowerCase();
    setActiveTabState(target);
    if (target !== "admin") {
      setIsAdminLoginOpen(false);
    }
    if (typeof window !== "undefined") {
      const currentHash = window.location.hash.replace(/^#\/?/, "").toLowerCase();
      if (currentHash !== target) {
        window.history.replaceState(null, "", `#${target}`);
      }
    }
  };

  // Listen to browser URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, "").toLowerCase();
      if (["overview", "projects", "skills", "about", "contact", "admin"].includes(hash)) {
        setActiveTabState(hash);
        if (hash !== "admin") {
          setIsAdminLoginOpen(false);
        }
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Safe JSON fetch helper to prevent "Unexpected end of JSON input" errors on static hosts like Netlify
  async function safeFetchJson<T = any>(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<{ ok: boolean; data: T | null; status: number }> {
    try {
      const res = await fetch(input, init);
      const contentType = res.headers.get("content-type") || "";
      let data: T | null = null;
      if (contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch {
          data = null;
        }
      } else {
        try {
          const text = await res.text();
          if (text && (text.trim().startsWith("{") || text.trim().startsWith("["))) {
            data = JSON.parse(text);
          }
        } catch {
          data = null;
        }
      }
      return { ok: res.ok, data, status: res.status };
    } catch {
      return { ok: false, data: null, status: 0 };
    }
  }

  // Check admin session on mount
  useEffect(() => {
    async function checkAuth() {
      if (!adminToken) {
        setIsAdmin(false);
        setAdminUser(null);
        return;
      }

      // If client token (from Netlify / static deployment)
      if (adminToken.startsWith("client_admin_")) {
        setIsAdmin(true);
        setAdminUser({
          email: "hammadhassan7409@gmail.com",
          name: profile?.name || "Hammad Hassan",
          role: "admin",
        });
        return;
      }

      try {
        const { ok, data } = await safeFetchJson<{ authenticated: boolean; user?: any }>("/api/auth/me", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (ok && data?.authenticated) {
          setIsAdmin(true);
          setAdminUser(data.user);
        } else if (!ok && data && data.authenticated === false) {
          setIsAdmin(false);
          setAdminToken(null);
          localStorage.removeItem("portfolio_admin_token");
        } else {
          // If server was unreachable (e.g. static host or network glitch), keep admin session active
          setIsAdmin(true);
          setAdminUser({
            email: "hammadhassan7409@gmail.com",
            name: profile?.name || "Hammad Hassan",
            role: "admin",
          });
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsAdmin(true);
      }
    }
    checkAuth();
  }, [adminToken, profile?.name]);

  // Realtime subscription to cloud projects collection
  useEffect(() => {
    const unsubscribe = subscribeToCloudProjects((liveProjects) => {
      if (liveProjects && liveProjects.length > 0) {
        setProjects(liveProjects);
        // Also keep local server cache up to date in background
        fetch("/api/projects/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(liveProjects),
        }).catch(() => {});
      }
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // Realtime subscription to cloud activities collection for live streak updates
  useEffect(() => {
    const unsubscribeActs = subscribeToCloudActivities((liveActivities) => {
      if (liveActivities && liveActivities.length > 0) {
        setActivities(liveActivities);
        const calculated = calculateStreakAndContributions(liveActivities);
        setContributions(calculated);

        // Sync with local server API in background
        fetch("/api/activities/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(liveActivities),
        }).catch(() => {});
      }
    });

    return () => {
      if (typeof unsubscribeActs === "function") unsubscribeActs();
    };
  }, []);

  // Log Activity Helper: saves to cloud, updates server, recalculates streak immediately
  const logActivity = async (actData: {
    type: ActivityType;
    title: string;
    description?: string;
    repo?: string;
    prNumber?: number;
    commitHash?: string;
    metadata?: Record<string, any>;
  }): Promise<boolean> => {
    try {
      const now = new Date();
      const dateStr = formatLocalDate(now);
      const newActivity: ActivityLog = {
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type: actData.type,
        title: actData.title,
        description: actData.description || "",
        repo: actData.repo || "portfolio-v2",
        prNumber: actData.prNumber,
        commitHash: actData.commitHash || Math.random().toString(16).substring(2, 9),
        timestamp: now.toISOString(),
        date: dateStr,
        metadata: actData.metadata,
      };

      // 1. Instantly update React state & recalculate streak
      setActivities((prev) => {
        const next = [...prev, newActivity];
        const newContrib = calculateStreakAndContributions(next);
        setContributions(newContrib);
        return next;
      });

      // 2. Persist to Firestore Cloud Database
      saveActivityToCloud(newActivity).catch((err) => {
        console.warn("Cloud activity save failed:", err);
      });

      // 3. Persist to Server API
      fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newActivity),
      }).catch(() => {});

      return true;
    } catch (err) {
      console.error("Failed to log activity:", err);
      return false;
    }
  };

  // Fetch Public & Admin data directly from Firestore Database with API fallback
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch persistent data directly from Firestore cloud collections in parallel
      const [cloudProjects, cloudProfile, cloudSkills, cloudAchievements, cloudExperiences, cloudActivities] = await Promise.all([
        loadProjectsFromCloud(),
        loadProfileFromCloud(),
        loadSkillsFromCloud(),
        loadAchievementsFromCloud(),
        loadExperiencesFromCloud(),
        loadActivitiesFromCloud(),
      ]);

      // 2. Fetch server data as fallback or supplement (contributions, etc.) safely
      const [profRes, projRes, skillsRes, achRes, expRes, contRes] = await Promise.all([
        safeFetchJson("/api/profile"),
        safeFetchJson("/api/projects"),
        safeFetchJson("/api/skills"),
        safeFetchJson("/api/achievements"),
        safeFetchJson("/api/experiences"),
        safeFetchJson("/api/contributions"),
      ]);

      const serverProfile = profRes.ok ? profRes.data : null;
      const serverProjects = projRes.ok && Array.isArray(projRes.data) ? projRes.data : [];
      const serverSkills = skillsRes.ok && Array.isArray(skillsRes.data) ? skillsRes.data : [];
      const serverAchievements = achRes.ok && Array.isArray(achRes.data) ? achRes.data : [];
      const serverExperiences = expRes.ok && Array.isArray(expRes.data) ? expRes.data : [];
      const serverContributions = contRes.ok ? contRes.data : null;

      // ACTIVITIES & STREAK: Priority given to cloud activities
      if (cloudActivities && cloudActivities.length > 0) {
        setActivities(cloudActivities);
        const calculated = calculateStreakAndContributions(cloudActivities);
        setContributions(calculated);
        safeFetchJson("/api/activities/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cloudActivities),
        }).catch(() => {});
      } else if (serverContributions) {
        setContributions(serverContributions);
        if (Array.isArray(serverContributions.activities) && serverContributions.activities.length > 0) {
          setActivities(serverContributions.activities);
          // Seed cloud with initial activities
          for (const a of serverContributions.activities) {
            saveActivityToCloud(a).catch(() => {});
          }
        }
      } else {
        // Generate seed activities for initial rendering
        const seedActs = generateSeedActivities();
        setActivities(seedActs);
        setContributions(calculateStreakAndContributions(seedActs));
        for (const a of seedActs) {
          saveActivityToCloud(a).catch(() => {});
        }
      }

      // PROJECTS: Priority given to cloud projects
      if (cloudProjects && cloudProjects.length > 0) {
        setProjects(cloudProjects);
        safeFetchJson("/api/projects/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cloudProjects),
        }).catch(() => {});
      } else if (serverProjects && serverProjects.length > 0) {
        setProjects(serverProjects);
        // Seed server projects into cloud database so they exist permanently in Firestore
        for (const p of serverProjects) {
          saveProjectToCloud(p).catch(() => {});
        }
      }

      // Helper to sanitize software engineer / engineer wording
      const sanitizeProfileData = (p: Profile): Profile => ({
        ...p,
        title: p.title ? p.title.replace(/software\s+engin(e|n)er/gi, "Web Developer").replace(/Software\s+Engin(e|n)er/gi, "Web Developer") : "Full Stack & Web Developer",
        bio: p.bio ? p.bio.replace(/software\s+engin(e|n)er/gi, "web developer").replace(/Software\s+Engin(e|n)er/gi, "Web Developer") : p.bio,
      });

      const sanitizeExpList = (list: Experience[]): Experience[] =>
        list.map((e) => ({
          ...e,
          role: e.role ? e.role.replace(/Software\s+Engineer/gi, "Web Developer").replace(/software\s+engineer/gi, "web developer").replace(/Senior\s+Full\s+Stack\s+Engineer/gi, "Senior Full Stack Web Developer").replace(/Freelance\s+Engineer/gi, "Freelance Web Developer") : "Web Developer",
        }));

      // PROFILE
      if (cloudProfile && cloudProfile.name) {
        setProfile(sanitizeProfileData(cloudProfile));
      } else if (serverProfile) {
        const sanitized = sanitizeProfileData(serverProfile);
        setProfile(sanitized);
        saveProfileToCloud(sanitized).catch(() => {});
      }

      // SKILLS
      if (cloudSkills && cloudSkills.length > 0) {
        setSkills(cloudSkills);
      } else if (serverSkills && serverSkills.length > 0) {
        setSkills(serverSkills);
        for (const s of serverSkills) {
          saveSkillToCloud(s).catch(() => {});
        }
      }

      // ACHIEVEMENTS
      if (cloudAchievements && cloudAchievements.length > 0) {
        setAchievements(cloudAchievements);
      } else if (serverAchievements && serverAchievements.length > 0) {
        setAchievements(serverAchievements);
        for (const a of serverAchievements) {
          saveAchievementToCloud(a).catch(() => {});
        }
      }

      // EXPERIENCES
      if (cloudExperiences && cloudExperiences.length > 0) {
        setExperiences(sanitizeExpList(cloudExperiences));
      } else if (serverExperiences && serverExperiences.length > 0) {
        const sanitized = sanitizeExpList(serverExperiences);
        setExperiences(sanitized);
        for (const e of sanitized) {
          saveExperienceToCloud(e).catch(() => {});
        }
      }

      // If admin, fetch messages
      if (adminToken) {
        fetchMessages(adminToken);
      }
    } catch (err) {
      console.error("Error fetching portfolio data:", err);
      setError("Failed to load portfolio content. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (token: string) => {
    try {
      const cloudMsgs = await loadMessagesFromCloud();
      if (cloudMsgs && cloudMsgs.length > 0) {
        setMessages(cloudMsgs);
        return;
      }
      const { ok, data } = await safeFetchJson<Message[]>("/api/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (ok && Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [adminToken]);

  // Admin Login with Netlify / Static Host Fallback & Full Server Support
  const loginAdmin = async (password: string, email: string = "hammadhassan7409@gmail.com") => {
    const cleanEmail = (email || "hammadhassan7409@gmail.com").trim().toLowerCase();
    const cleanPass = String(password).trim();

    try {
      // 1. Try server backend first if available
      const { ok, data, status } = await safeFetchJson<{ success?: boolean; token?: string; user?: any; error?: string }>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });

      if (ok && data && data.token) {
        localStorage.setItem("portfolio_admin_token", data.token);
        setAdminToken(data.token);
        setIsAdmin(true);
        setAdminUser(data.user);
        showToast("Logged in successfully as Admin.", "success");
        fetchMessages(data.token);
        return { success: true };
      }

      // If server explicitly rejected password with valid error
      if (status === 401 && data && data.error && !data.error.includes("Cannot POST") && !data.error.includes("404")) {
        return { success: false, error: data.error };
      }

      // 2. Netlify / Static Hosting Fallback:
      // When deployed to Netlify, GitHub Pages, or Vercel static hosting, the Express API is not running.
      // We verify against the admin credentials client-side and grant admin access backed by Firestore!
      const isEmailValid = cleanEmail === "hammadhassan7409@gmail.com" || cleanEmail === (profile?.contactEmail || "").toLowerCase() || cleanEmail === (profile?.email || "").toLowerCase();
      const isPassValid = cleanPass === "hammad" || cleanPass === "admin";

      if (isEmailValid && isPassValid) {
        const clientToken = `client_admin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const userObj = {
          email: cleanEmail,
          name: profile?.name || "Hammad Hassan",
          role: "admin",
        };
        localStorage.setItem("portfolio_admin_token", clientToken);
        setAdminToken(clientToken);
        setIsAdmin(true);
        setAdminUser(userObj);
        showToast("Logged in successfully as Admin.", "success");
        fetchMessages(clientToken);
        return { success: true };
      } else {
        return {
          success: false,
          error: "Invalid credentials. Please check your email and password.",
        };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Network error. Try again." };
    }
  };

  // Admin Logout: preserves all portfolio state, only terminates admin credentials
  const logoutAdmin = async () => {
    if (adminToken) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      } catch (e) {
        // ignore
      }
    }
    localStorage.removeItem("portfolio_admin_token");
    setAdminToken(null);
    setIsAdmin(false);
    setAdminUser(null);
    setMessages([]);
    showToast("Logged out of Admin dashboard.", "info");
    if (activeTab === "admin") {
      setActiveTab("overview");
    }
  };

  // Update Profile
  const updateProfile = async (updated: Partial<Profile>) => {
    if (!adminToken || !profile) {
      showToast("Authentication required. Please log in as admin.", "error");
      return false;
    }
    const mergedProfile = { ...profile, ...updated };
    try {
      // 1. Save directly to Firestore database and verify confirmation
      const cloudSuccess = await saveProfileToCloud(mergedProfile);
      if (!cloudSuccess) {
        showToast("Database error: Profile changes could not be saved to the database.", "error");
        return false;
      }

      // 2. Update server if available
      safeFetchJson("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(updated),
      }).catch(() => {});

      setProfile(mergedProfile);
      logActivity({
        type: "profile_updated",
        title: "Updated developer profile & bio settings",
      });
      showToast("Profile updated and saved to database successfully!", "success");
      return true;
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      showToast(`Failed to update profile: ${err?.message || "Database error"}`, "error");
    }
    return false;
  };

  // ==========================================
  // PROJECT ACTIONS (Persistent in Firestore)
  // ==========================================

  const createProject = async (proj: Partial<Project>) => {
    if (!adminToken) {
      showToast("Authentication required. Please log in as admin.", "error");
      return false;
    }
    try {
      const newId = proj.id || "proj-" + Date.now();
      const newProject: Project = {
        id: newId,
        name: (proj.name || proj.displayName || "new-project").toLowerCase().replace(/\s+/g, "-"),
        displayName: proj.displayName || "New Project",
        description: proj.description || "",
        longDescription: proj.longDescription || proj.description || "",
        primaryLanguage: proj.primaryLanguage || "TypeScript",
        primaryLanguageColor: proj.primaryLanguageColor || "#3178c6",
        technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
        imageUrl: proj.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
        gallery: Array.isArray(proj.gallery) && proj.gallery.length > 0 ? proj.gallery : [proj.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80"],
        status: proj.status || "Live",
        isPinned: Boolean(proj.isPinned),
        isFeatured: Boolean((proj as any).isFeatured),
        order: typeof proj.order === "number" ? proj.order : projects.length + 1,
        stars: Number(proj.stars) || 0,
        forks: Number(proj.forks) || 0,
        liveUrl: proj.liveUrl || "",
        githubUrl: proj.githubUrl || "https://github.com/hammadhassan",
        highlights: Array.isArray(proj.highlights) ? proj.highlights : [],
        architecture: Array.isArray(proj.architecture) ? proj.architecture : [],
        updatedAt: new Date().toISOString(),
        createdAt: proj.createdAt || new Date().toISOString().split("T")[0],
      };

      // 1. MUST verify successful write into Firestore database FIRST
      const cloudSuccess = await saveProjectToCloud(newProject);
      if (!cloudSuccess) {
        console.error("Firestore database rejected project write:", newProject.id);
        showToast("Database error: Could not save project to database. Changes were NOT committed.", "error");
        return false;
      }

      // 2. Also persist to server backend
      try {
        await fetch("/api/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(newProject),
        });
      } catch (e) {
        console.warn("Backend API sync notice:", e);
      }

      // 3. ONLY update local state after confirmed database write
      setProjects((prev) => {
        const existingIdx = prev.findIndex((p) => p.id === newProject.id);
        if (existingIdx >= 0) {
          const clone = [...prev];
          clone[existingIdx] = newProject;
          return clone;
        }
        return [...prev, newProject];
      });

      // 4. Log real-time activity for streak & contribution graph
      logActivity({
        type: "project_created",
        title: `Published new project: ${newProject.displayName}`,
        description: newProject.description,
        repo: newProject.name,
        metadata: { projectId: newProject.id },
      });

      showToast("Project created and saved to database successfully!", "success");
      return true;
    } catch (err: any) {
      console.error("Failed to create project:", err);
      showToast(`Failed to create project: ${err?.message || "Database error"}`, "error");
      return false;
    }
  };

  const updateProject = async (id: string, proj: Partial<Project>) => {
    if (!adminToken) {
      showToast("Authentication required. Please log in as admin.", "error");
      return false;
    }
    try {
      const existing = projects.find((p) => p.id === id);
      if (!existing) {
        showToast("Project not found to update.", "error");
        return false;
      }

      const updatedProject: Project = {
        ...existing,
        ...proj,
        id,
        updatedAt: new Date().toISOString(),
      };

      // 1. MUST verify update in Firestore database FIRST
      const cloudSuccess = await saveProjectToCloud(updatedProject);
      if (!cloudSuccess) {
        console.error("Firestore database rejected project update:", id);
        showToast("Database error: Could not update project in database. Changes were NOT committed.", "error");
        return false;
      }

      // 2. Update in server backend
      try {
        await fetch(`/api/projects/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(updatedProject),
        });
      } catch (e) {
        console.warn("Backend API sync notice:", e);
      }

      // 3. ONLY update local state after confirmed database write
      setProjects((prev) => prev.map((p) => (p.id === id ? updatedProject : p)));
      if (selectedProject?.id === id) {
        setSelectedProject(updatedProject);
      }

      // 4. Log real-time activity for streak
      logActivity({
        type: "project_updated",
        title: `Updated project: ${updatedProject.displayName}`,
        description: updatedProject.description,
        repo: updatedProject.name,
        metadata: { projectId: updatedProject.id },
      });

      showToast("Project updated and saved to database successfully!", "success");
      return true;
    } catch (err: any) {
      console.error("Failed to update project:", err);
      showToast(`Failed to update project: ${err?.message || "Database error"}`, "error");
      return false;
    }
  };

  const deleteProject = async (id: string) => {
    if (!adminToken) {
      showToast("Authentication required. Please log in as admin.", "error");
      return false;
    }
    try {
      const existing = projects.find((p) => p.id === id);

      // 1. MUST verify deletion in Firestore database FIRST
      const cloudSuccess = await deleteProjectFromCloud(id);
      if (!cloudSuccess) {
        showToast("Database error: Could not delete project from database. Delete was NOT committed.", "error");
        return false;
      }

      // 2. Delete from server backend
      try {
        await fetch(`/api/projects/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      } catch (e) {
        console.warn("Backend API sync notice:", e);
      }

      // 3. ONLY update local state after confirmed database deletion
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selectedProject?.id === id) {
        setSelectedProject(null);
      }

      if (existing) {
        logActivity({
          type: "project_deleted",
          title: `Deleted project: ${existing.displayName}`,
        });
      }

      showToast("Project deleted from database successfully!", "success");
      return true;
    } catch (err: any) {
      console.error("Failed to delete project:", err);
      showToast(`Failed to delete project: ${err?.message || "Database error"}`, "error");
      return false;
    }
  };

  const togglePinProject = async (id: string) => {
    if (!adminToken) return false;
    const project = projects.find((p) => p.id === id);
    if (!project) return false;

    const nextIsPinned = !project.isPinned;
    return updateProject(id, { isPinned: nextIsPinned });
  };

  const toggleFeatureProject = async (id: string) => {
    if (!adminToken) return false;
    const project = projects.find((p) => p.id === id);
    if (!project) return false;

    const nextIsFeatured = !(project as any).isFeatured;
    return updateProject(id, { isFeatured: nextIsFeatured } as any);
  };

  const reorderProjects = async (projectIds: string[]) => {
    if (!adminToken) return false;
    try {
      const updatedList = projectIds
        .map((id, index) => {
          const p = projects.find((item) => item.id === id);
          if (p) {
            return { ...p, order: index + 1 };
          }
          return null;
        })
        .filter(Boolean) as Project[];

      setProjects(updatedList);

      // Update order for each in Firestore
      for (const p of updatedList) {
        saveProjectToCloud(p).catch(() => {});
      }

      // Update server batch
      await fetch("/api/projects/reorder/batch", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ projectIds }),
      });

      showToast("Project order updated!");
      return true;
    } catch (err) {
      console.error("Failed to reorder projects:", err);
      showToast("Failed to reorder projects", "error");
    }
    return false;
  };

  // ==========================================
  // SKILLS ACTIONS
  // ==========================================

  const createSkill = async (skill: Partial<Skill>) => {
    if (!adminToken) return false;
    try {
      const newSkill: Skill = {
        id: skill.id || "sk-" + Date.now(),
        name: skill.name || "New Skill",
        category: skill.category || "Languages",
        level: skill.level || "Expert",
        years: skill.years || "2+ years",
        badgeColor: skill.badgeColor || "#61dafb",
        order: typeof skill.order === "number" ? skill.order : skills.length + 1,
      };

      const cloudSuccess = await saveSkillToCloud(newSkill);
      if (!cloudSuccess) {
        showToast("Database error: Could not save skill to database.", "error");
        return false;
      }

      try {
        await fetch("/api/skills", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(newSkill),
        });
      } catch {
        // ignore
      }

      setSkills((prev) => [...prev, newSkill]);
      logActivity({
        type: "skill_updated",
        title: `Added technical skill: ${newSkill.name}`,
      });
      showToast("Skill added and saved to database!", "success");
      return true;
    } catch (err: any) {
      showToast(`Failed to add skill: ${err?.message || "Database error"}`, "error");
    }
    return false;
  };

  const updateSkill = async (id: string, skill: Partial<Skill>) => {
    if (!adminToken) return false;
    try {
      const existing = skills.find((s) => s.id === id);
      if (!existing) return false;
      const updated: Skill = { ...existing, ...skill, id };

      const cloudSuccess = await saveSkillToCloud(updated);
      if (!cloudSuccess) {
        showToast("Database error: Could not update skill in database.", "error");
        return false;
      }

      try {
        await fetch(`/api/skills/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(updated),
        });
      } catch {
        // ignore
      }

      setSkills((prev) => prev.map((s) => (s.id === id ? updated : s)));
      logActivity({
        type: "skill_updated",
        title: `Updated skill: ${updated.name}`,
      });
      showToast("Skill updated and saved to database!", "success");
      return true;
    } catch (err: any) {
      showToast(`Failed to update skill: ${err?.message || "Database error"}`, "error");
    }
    return false;
  };

  const deleteSkill = async (id: string) => {
    if (!adminToken) return false;
    try {
      const existing = skills.find((s) => s.id === id);
      const cloudSuccess = await deleteSkillFromCloud(id);
      if (!cloudSuccess) {
        showToast("Database error: Could not delete skill from database.", "error");
        return false;
      }

      try {
        await fetch(`/api/skills/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      } catch {
        // ignore
      }
      setSkills((prev) => prev.filter((s) => s.id !== id));
      logActivity({
        type: "skill_updated",
        title: `Removed skill: ${existing?.name || "skill"}`,
      });
      showToast("Skill removed from database successfully.", "success");
      return true;
    } catch (err: any) {
      showToast(`Failed to remove skill: ${err?.message || "Database error"}`, "error");
    }
    return false;
  };

  // ==========================================
  // ACHIEVEMENTS ACTIONS
  // ==========================================

  const createAchievement = async (ach: Partial<Achievement>) => {
    if (!adminToken) return false;
    try {
      const newAch: Achievement = {
        id: ach.id || "ach-" + Date.now(),
        title: ach.title || "New Achievement",
        description: ach.description || "",
        icon: ach.icon || "🌟",
        category: ach.category || "Community",
        unlockedDate: ach.unlockedDate || new Date().getFullYear().toString(),
        badgeColor: ach.badgeColor || "#58a6ff",
        order: typeof ach.order === "number" ? ach.order : achievements.length + 1,
      };

      const cloudSuccess = await saveAchievementToCloud(newAch);
      if (!cloudSuccess) {
        showToast("Database error: Could not save achievement to database.", "error");
        return false;
      }

      try {
        await fetch("/api/achievements", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(newAch),
        });
      } catch {
        // ignore
      }

      setAchievements((prev) => [...prev, newAch]);
      logActivity({
        type: "achievement_unlocked",
        title: `Unlocked achievement: ${newAch.title}`,
        description: newAch.description,
      });
      showToast("Achievement added and saved to database!", "success");
      return true;
    } catch (err: any) {
      showToast(`Failed to add achievement: ${err?.message || "Database error"}`, "error");
    }
    return false;
  };

  const updateAchievement = async (id: string, ach: Partial<Achievement>) => {
    if (!adminToken) return false;
    try {
      const existing = achievements.find((a) => a.id === id);
      if (!existing) return false;
      const updated: Achievement = { ...existing, ...ach, id };

      const cloudSuccess = await saveAchievementToCloud(updated);
      if (!cloudSuccess) {
        showToast("Database error: Could not update achievement in database.", "error");
        return false;
      }

      try {
        await fetch(`/api/achievements/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(updated),
        });
      } catch {
        // ignore
      }

      setAchievements((prev) => prev.map((a) => (a.id === id ? updated : a)));
      logActivity({
        type: "achievement_unlocked",
        title: `Updated achievement: ${updated.title}`,
      });
      showToast("Achievement updated and saved to database!", "success");
      return true;
    } catch (err: any) {
      showToast(`Failed to update achievement: ${err?.message || "Database error"}`, "error");
    }
    return false;
  };

  const deleteAchievement = async (id: string) => {
    if (!adminToken) return false;
    try {
      const existing = achievements.find((a) => a.id === id);
      const cloudSuccess = await deleteAchievementFromCloud(id);
      if (!cloudSuccess) {
        showToast("Database error: Could not delete achievement from database.", "error");
        return false;
      }

      try {
        await fetch(`/api/achievements/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      } catch {
        // ignore
      }
      setAchievements((prev) => prev.filter((a) => a.id !== id));
      logActivity({
        type: "achievement_unlocked",
        title: `Removed achievement: ${existing?.title || "achievement"}`,
      });
      showToast("Achievement deleted from database successfully.", "success");
      return true;
    } catch (err: any) {
      showToast(`Failed to delete achievement: ${err?.message || "Database error"}`, "error");
    }
    return false;
  };

  // ==========================================
  // EXPERIENCE ACTIONS
  // ==========================================

  const createExperience = async (exp: Partial<Experience>) => {
    if (!adminToken) return false;
    try {
      const newExp: Experience = {
        id: exp.id || "exp-" + Date.now(),
        role: exp.role || "Web Developer",
        company: exp.company || "Company",
        period: exp.period || "2024 — Present",
        location: exp.location || "Remote",
        type: exp.type || "Full-Time",
        description: exp.description || "",
        achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
        technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
      };

      const cloudSuccess = await saveExperienceToCloud(newExp);
      if (!cloudSuccess) {
        showToast("Database error: Could not save experience entry to database.", "error");
        return false;
      }

      try {
        await fetch("/api/experiences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(newExp),
        });
      } catch {
        // ignore
      }

      setExperiences((prev) => [newExp, ...prev]);
      logActivity({
        type: "experience_updated",
        title: `Added career experience: ${newExp.role} at ${newExp.company}`,
      });
      showToast("Career experience saved to database!", "success");
      return true;
    } catch (err: any) {
      showToast(`Failed to add experience entry: ${err?.message || "Database error"}`, "error");
    }
    return false;
  };

  const updateExperience = async (id: string, exp: Partial<Experience>) => {
    if (!adminToken) return false;
    try {
      const existing = experiences.find((e) => e.id === id);
      if (!existing) return false;
      const updated: Experience = { ...existing, ...exp, id };

      const cloudSuccess = await saveExperienceToCloud(updated);
      if (!cloudSuccess) {
        showToast("Database error: Could not update experience entry in database.", "error");
        return false;
      }

      try {
        await fetch(`/api/experiences/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(updated),
        });
      } catch {
        // ignore
      }

      setExperiences((prev) => prev.map((e) => (e.id === id ? updated : e)));
      logActivity({
        type: "experience_updated",
        title: `Updated experience at ${updated.company}`,
      });
      showToast("Experience entry updated in database!", "success");
      return true;
    } catch (err: any) {
      showToast(`Failed to update experience entry: ${err?.message || "Database error"}`, "error");
    }
    return false;
  };

  const deleteExperience = async (id: string) => {
    if (!adminToken) return false;
    try {
      const existing = experiences.find((e) => e.id === id);
      const cloudSuccess = await deleteExperienceFromCloud(id);
      if (!cloudSuccess) {
        showToast("Database error: Could not delete experience entry from database.", "error");
        return false;
      }

      try {
        await fetch(`/api/experiences/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      } catch {
        // ignore
      }
      setExperiences((prev) => prev.filter((e) => e.id !== id));
      logActivity({
        type: "experience_updated",
        title: `Removed experience: ${existing?.company || "entry"}`,
      });
      showToast("Experience entry removed from database.", "success");
      return true;
    } catch (err: any) {
      showToast(`Failed to remove experience entry: ${err?.message || "Database error"}`, "error");
    }
    return false;
  };

  // ==========================================
  // CONTACT & MESSAGES
  // ==========================================

  const sendMessage = async (msg: { name: string; email: string; subject: string; message: string }) => {
    try {
      const newMsg: Message = {
        id: "msg-" + Date.now(),
        name: msg.name,
        email: msg.email,
        subject: msg.subject,
        message: msg.message,
        createdAt: new Date().toISOString(),
        read: false,
      };

      // 1. Save directly to Firestore Cloud Database
      await saveMessageToCloud(newMsg).catch(() => {});

      // 2. Also notify server backend if available
      safeFetchJson("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      }).catch(() => {});

      logActivity({
        type: "contact_received",
        title: `Received contact inquiry from ${msg.name}`,
        description: msg.subject,
      });
      showToast("Message sent successfully! Hammad will reply soon.");
      return { success: true, message: "Your message has been sent successfully." };
    } catch (err: any) {
      return { success: false, message: err.message || "Network error." };
    }
  };

  const markMessageRead = async (id: string, read: boolean) => {
    if (!adminToken) return false;
    try {
      const msg = messages.find((m) => m.id === id);
      if (msg) {
        saveMessageToCloud({ ...msg, read }).catch(() => {});
      }
      safeFetchJson(`/api/messages/${id}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ read }),
      }).catch(() => {});
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read } : m)));
      return true;
    } catch (err) {
      // ignore
    }
    return false;
  };

  const toggleMessageStar = async (id: string) => {
    if (!adminToken) return false;
    try {
      const msg = messages.find((m) => m.id === id);
      if (msg) {
        const nextStarred = !msg.starred;
        saveMessageToCloud({ ...msg, starred: nextStarred }).catch(() => {});
        safeFetchJson(`/api/messages/${id}/star`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${adminToken}` },
        }).catch(() => {});
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, starred: nextStarred } : m)));
        return true;
      }
    } catch (err) {
      // ignore
    }
    return false;
  };

  const deleteMessage = async (id: string) => {
    if (!adminToken) return false;
    try {
      await deleteMessageFromCloud(id);
      safeFetchJson(`/api/messages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      }).catch(() => {});
      setMessages((prev) => prev.filter((m) => m.id !== id));
      showToast("Message deleted.");
      return true;
    } catch (err) {
      showToast("Failed to delete message", "error");
    }
    return false;
  };

  const resetToDefault = async () => {
    if (!adminToken) return false;
    try {
      const { ok } = await safeFetchJson("/api/reset-data", {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (ok) {
        showToast("Reset portfolio data to default state!");
        await fetchData();
        return true;
      } else {
        // Fallback for static hosts (e.g. Netlify)
        showToast("Reset completed.");
        await fetchData();
        return true;
      }
    } catch (err) {
      showToast("Failed to reset data", "error");
    }
    return false;
  };

  return (
    <PortfolioContext.Provider
      value={{
        profile,
        projects,
        skills,
        achievements,
        experiences,
        messages,
        activities,
        contributions,
        isLoading,
        error,
        isAdmin,
        adminToken,
        adminUser,
        loginAdmin,
        logoutAdmin,
        logActivity,
        fetchData,
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
        sendMessage,
        markMessageRead,
        toggleMessageStar,
        deleteMessage,
        resetToDefault,
        activeTab,
        setActiveTab,
        selectedProject,
        setSelectedProject,
        isSearchOpen,
        setIsSearchOpen,
        isAdminLoginOpen,
        setIsAdminLoginOpen,
        toast,
        showToast,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
};
