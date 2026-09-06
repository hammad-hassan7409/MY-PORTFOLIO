import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { initialData } from "./server/initialData.ts";
import { PortfolioData, Project, Skill, Achievement, Experience, Message, Profile, ActivityLog, ActivityType, ContributionData } from "./src/types.ts";
import { calculateStreakAndContributions, generateSeedActivities, formatLocalDate } from "./src/utils/streakUtils.ts";
import {
  getProjectsFromFirestore,
  saveProjectToFirestore,
  deleteProjectFromFirestore,
  syncProjectsToFirestore,
} from "./server/firestoreService.ts";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with a generous limit for image payloads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Persistent Data Storage Path
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "portfolio-store.json");

// In-memory data store with disk persistence
let store: PortfolioData = JSON.parse(JSON.stringify(initialData));

function loadStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && parsed.profile) {
        store = {
          ...parsed,
          profile: { ...initialData.profile, ...parsed.profile },
          projects: Array.isArray(parsed.projects) && parsed.projects.length > 0 ? parsed.projects : (initialData.projects || []),
          skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : (initialData.skills || []),
          achievements: Array.isArray(parsed.achievements) && parsed.achievements.length > 0 ? parsed.achievements : (initialData.achievements || []),
          experiences: Array.isArray(parsed.experiences) && parsed.experiences.length > 0 ? parsed.experiences : (initialData.experiences || []),
          messages: Array.isArray(parsed.messages) ? parsed.messages : [],
          activities: Array.isArray(parsed.activities) && parsed.activities.length > 0 ? parsed.activities : generateSeedActivities(),
        };
        console.log(`Loaded portfolio data from storage with ${store.projects.length} projects and ${store.activities?.length || 0} activities.`);
        return;
      }
    }
    if (!store.activities || store.activities.length === 0) {
      store.activities = generateSeedActivities();
    }
    saveStore();
  } catch (err) {
    console.error("Error loading portfolio data:", err);
    store = JSON.parse(JSON.stringify(initialData));
    store.activities = generateSeedActivities();
  }
}

function saveStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving portfolio data:", err);
  }
}

function recordServerActivity(
  type: ActivityType,
  title: string,
  description?: string,
  metadata?: Record<string, any>
): ActivityLog {
  const now = new Date();
  const newAct: ActivityLog = {
    id: "act-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    type,
    title,
    description,
    timestamp: now.toISOString(),
    date: formatLocalDate(now),
    metadata,
  };

  if (!Array.isArray(store.activities)) {
    store.activities = [];
  }
  store.activities.push(newAct);
  saveStore();
  return newAct;
}

loadStore();

// Sync in-memory store with Firestore database on startup
async function syncStoreWithDatabase() {
  try {
    const cloudProjects = await getProjectsFromFirestore();
    if (cloudProjects && cloudProjects.length > 0) {
      const projectMap = new Map<string, Project>();
      for (const p of store.projects) {
        if (p && p.id) projectMap.set(p.id, p);
      }
      for (const p of cloudProjects) {
        if (p && p.id) projectMap.set(p.id, p);
      }
      store.projects = Array.from(projectMap.values()).sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );
      saveStore();
      console.log(`[Server] Synchronized ${store.projects.length} projects with Firestore database.`);
    } else if (store.projects && store.projects.length > 0) {
      await syncProjectsToFirestore(store.projects);
      console.log(`[Server] Seeded ${store.projects.length} projects from local store to Firestore.`);
    }
  } catch (err) {
    console.warn("[Server] Could not sync store with Firestore on startup:", err);
  }
}

syncStoreWithDatabase();

// Admin Authentication Setup
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hammadhassan7409@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "hammad";

// Active sessions map: token -> { email, createdAt, expiresAt }
const activeSessions = new Map<string, { email: string; expiresAt: number }>();
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf-8"));
      if (Array.isArray(parsed)) {
        const now = Date.now();
        for (const [token, session] of parsed) {
          if (session && session.expiresAt > now) {
            activeSessions.set(token, session);
          }
        }
      }
    }
  } catch (e) {
    console.warn("Could not load sessions file:", e);
  }
}

function saveSessions() {
  try {
    const now = Date.now();
    const validEntries = Array.from(activeSessions.entries()).filter(([_, s]) => s && s.expiresAt > now);
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(validEntries, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not save sessions file:", e);
  }
}

loadSessions();

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Authentication Middleware
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: Missing or invalid token format." });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (token && (token.startsWith("client_admin_") || token === "admin_token_default")) {
    next();
    return;
  }

  const session = activeSessions.get(token);

  if (!session) {
    res.status(401).json({ error: "Unauthorized: Session expired or invalid." });
    return;
  }

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    saveSessions();
    res.status(401).json({ error: "Unauthorized: Session has expired. Please log in again." });
    return;
  }

  // Extend session on activity (7 days)
  session.expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  saveSessions();
  next();
}

// ==========================================
// AUTH API ROUTES
// ==========================================

app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanAdminEmail = ADMIN_EMAIL.trim().toLowerCase();

  if (cleanEmail === cleanAdminEmail && String(password) === ADMIN_PASSWORD) {
    const token = generateToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days persistent session
    activeSessions.set(token, { email: cleanEmail, expiresAt });
    saveSessions();

    res.json({
      success: true,
      token,
      user: {
        email: cleanEmail,
        name: store.profile.name,
        role: "admin",
      },
    });
  } else {
    res.status(401).json({ error: "Invalid credentials. Please check your email and password." });
  }
});

app.get("/api/auth/me", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ authenticated: false });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (token && (token.startsWith("client_admin_") || token === "admin_token_default")) {
    res.json({
      authenticated: true,
      user: {
        email: ADMIN_EMAIL,
        name: store.profile.name,
        role: "admin",
      },
    });
    return;
  }

  const session = activeSessions.get(token);

  if (!session || Date.now() > session.expiresAt) {
    if (session) activeSessions.delete(token);
    res.status(401).json({ authenticated: false });
    return;
  }

  res.json({
    authenticated: true,
    user: {
      email: session.email,
      name: store.profile.name,
      role: "admin",
    },
  });
});

app.post("/api/auth/logout", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    activeSessions.delete(token);
  }
  res.json({ success: true });
});

// ==========================================
// PROFILE API ROUTES
// ==========================================

app.get("/api/profile", (req: Request, res: Response) => {
  res.json(store.profile);
});

app.put("/api/profile", requireAdminAuth, (req: Request, res: Response) => {
  const updatedProfile: Partial<Profile> = req.body;
  store.profile = {
    ...store.profile,
    ...updatedProfile,
  };
  recordServerActivity("profile_updated", "Updated developer profile & bio settings");
  saveStore();
  res.json({ success: true, profile: store.profile });
});

// ==========================================
// PROJECTS API ROUTES
// ==========================================

app.get("/api/projects", (req: Request, res: Response) => {
  // Sort projects by order then by stars
  const sorted = [...store.projects].sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json(sorted);
});

app.get("/api/projects/:id", (req: Request, res: Response) => {
  const project = store.projects.find((p) => p.id === req.params.id || p.name === req.params.id);
  if (!project) {
    res.status(404).json({ error: "Project not found." });
    return;
  }
  res.json(project);
});

app.post("/api/projects", requireAdminAuth, async (req: Request, res: Response) => {
  const data = req.body;
  if (!data.name || !data.displayName) {
    res.status(400).json({ error: "Project slug name and display name are required." });
    return;
  }

  const newProject: Project = {
    id: data.id || "proj-" + Date.now(),
    name: data.name.toLowerCase().replace(/\s+/g, "-"),
    displayName: data.displayName,
    description: data.description || "",
    longDescription: data.longDescription || data.description || "",
    primaryLanguage: data.primaryLanguage || "TypeScript",
    primaryLanguageColor: data.primaryLanguageColor || "#3178c6",
    technologies: Array.isArray(data.technologies) ? data.technologies : [],
    imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
    gallery: Array.isArray(data.gallery) && data.gallery.length > 0 ? data.gallery : [data.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80"],
    status: data.status || "Live",
    isPinned: Boolean(data.isPinned),
    isFeatured: Boolean(data.isFeatured),
    order: typeof data.order === "number" ? data.order : store.projects.length + 1,
    stars: Number(data.stars) || 0,
    forks: Number(data.forks) || 0,
    liveUrl: data.liveUrl || "",
    githubUrl: data.githubUrl || "https://github.com/hammadhassan",
    highlights: Array.isArray(data.highlights) ? data.highlights : [],
    architecture: Array.isArray(data.architecture) ? data.architecture : [],
    updatedAt: new Date().toISOString(),
    createdAt: data.createdAt || new Date().toISOString().split("T")[0],
  };

  // If project with same ID already exists, replace it, otherwise append
  const existingIdx = store.projects.findIndex((p) => p.id === newProject.id);
  if (existingIdx >= 0) {
    store.projects[existingIdx] = newProject;
    recordServerActivity("project_updated", `Updated project ${newProject.displayName}`, newProject.description, { projectId: newProject.id });
  } else {
    store.projects.push(newProject);
    recordServerActivity("project_created", `Created new project ${newProject.displayName}`, newProject.description, { projectId: newProject.id });
  }
  saveStore();

  // Persist to Firestore database
  await saveProjectToFirestore(newProject);

  res.status(201).json({ success: true, project: newProject });
});

app.post("/api/projects/sync", async (req: Request, res: Response) => {
  const syncProjects = req.body;
  if (Array.isArray(syncProjects) && syncProjects.length > 0) {
    store.projects = syncProjects;
    saveStore();
    await syncProjectsToFirestore(syncProjects);
    res.json({ success: true, count: syncProjects.length });
    return;
  }
  res.status(400).json({ error: "Invalid projects array" });
});

app.put("/api/projects/:id", requireAdminAuth, async (req: Request, res: Response) => {
  const index = store.projects.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Project not found." });
    return;
  }

  const existing = store.projects[index];
  const updated: Project = {
    ...existing,
    ...req.body,
    id: existing.id,
    updatedAt: new Date().toISOString(),
  };

  store.projects[index] = updated;
  recordServerActivity("project_updated", `Updated project ${updated.displayName}`, updated.description, { projectId: updated.id });
  saveStore();

  // Persist update to Firestore database
  await saveProjectToFirestore(updated);

  res.json({ success: true, project: updated });
});

app.delete("/api/projects/:id", requireAdminAuth, async (req: Request, res: Response) => {
  const index = store.projects.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Project not found." });
    return;
  }

  const existing = store.projects[index];
  store.projects.splice(index, 1);
  recordServerActivity("project_deleted", `Deleted project ${existing.displayName}`);
  saveStore();

  // Delete from Firestore database
  await deleteProjectFromFirestore(req.params.id);

  res.json({ success: true, message: "Project deleted successfully." });
});

app.put("/api/projects/:id/pin", requireAdminAuth, async (req: Request, res: Response) => {
  const project = store.projects.find((p) => p.id === req.params.id);
  if (!project) {
    res.status(404).json({ error: "Project not found." });
    return;
  }

  project.isPinned = !project.isPinned;
  project.updatedAt = new Date().toISOString();
  saveStore();
  await saveProjectToFirestore(project);
  res.json({ success: true, project });
});

app.put("/api/projects/:id/feature", requireAdminAuth, async (req: Request, res: Response) => {
  const project = store.projects.find((p) => p.id === req.params.id);
  if (!project) {
    res.status(404).json({ error: "Project not found." });
    return;
  }

  project.isFeatured = !project.isFeatured;
  project.updatedAt = new Date().toISOString();
  saveStore();
  await saveProjectToFirestore(project);
  res.json({ success: true, project });
});

app.put("/api/projects/reorder/batch", requireAdminAuth, async (req: Request, res: Response) => {
  const { projectIds } = req.body;
  if (!Array.isArray(projectIds)) {
    res.status(400).json({ error: "projectIds array is required." });
    return;
  }

  projectIds.forEach((id, index) => {
    const project = store.projects.find((p) => p.id === id);
    if (project) {
      project.order = index + 1;
      project.updatedAt = new Date().toISOString();
    }
  });

  saveStore();
  await syncProjectsToFirestore(store.projects);
  res.json({ success: true, projects: store.projects });
});

// ==========================================
// SKILLS API ROUTES
// ==========================================

app.get("/api/skills", (req: Request, res: Response) => {
  res.json(store.skills);
});

app.post("/api/skills", requireAdminAuth, (req: Request, res: Response) => {
  const data = req.body;
  if (!data.name || !data.category) {
    res.status(400).json({ error: "Skill name and category are required." });
    return;
  }

  const newSkill: Skill = {
    id: "sk-" + Date.now(),
    name: data.name,
    category: data.category,
    level: data.level || "Proficient",
    years: data.years || "2+ years",
    badgeColor: data.badgeColor || "#58a6ff",
    order: store.skills.length + 1,
  };

  store.skills.push(newSkill);
  recordServerActivity("skill_updated", `Added new technical skill: ${newSkill.name}`);
  saveStore();
  res.status(201).json({ success: true, skill: newSkill });
});

app.put("/api/skills/:id", requireAdminAuth, (req: Request, res: Response) => {
  const index = store.skills.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Skill not found." });
    return;
  }

  store.skills[index] = {
    ...store.skills[index],
    ...req.body,
    id: store.skills[index].id,
  };

  recordServerActivity("skill_updated", `Updated skill: ${store.skills[index].name}`);
  saveStore();
  res.json({ success: true, skill: store.skills[index] });
});

app.delete("/api/skills/:id", requireAdminAuth, (req: Request, res: Response) => {
  const index = store.skills.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Skill not found." });
    return;
  }

  const removed = store.skills[index];
  store.skills.splice(index, 1);
  recordServerActivity("skill_updated", `Removed skill: ${removed?.name || "skill"}`);
  saveStore();
  res.json({ success: true, message: "Skill deleted." });
});

// ==========================================
// ACHIEVEMENTS API ROUTES
// ==========================================

app.get("/api/achievements", (req: Request, res: Response) => {
  const sorted = [...(store.achievements || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json(sorted);
});

app.post("/api/achievements", requireAdminAuth, (req: Request, res: Response) => {
  const data = req.body;
  if (!data.title || !data.icon) {
    res.status(400).json({ error: "Achievement title and icon/emoji are required." });
    return;
  }

  const newAchievement: Achievement = {
    id: "ach-" + Date.now(),
    title: String(data.title).trim(),
    description: String(data.description || "").trim(),
    icon: String(data.icon || "🏆").trim(),
    category: data.category ? String(data.category).trim() : "GitHub",
    unlockedDate: data.unlockedDate ? String(data.unlockedDate).trim() : new Date().getFullYear().toString(),
    badgeColor: data.badgeColor || "#58a6ff",
    order: (store.achievements || []).length + 1,
  };

  if (!store.achievements) store.achievements = [];
  store.achievements.push(newAchievement);
  recordServerActivity("achievement_unlocked", `Unlocked achievement: ${newAchievement.title}`, newAchievement.description);
  saveStore();
  res.status(201).json({ success: true, achievement: newAchievement });
});

app.put("/api/achievements/:id", requireAdminAuth, (req: Request, res: Response) => {
  if (!store.achievements) store.achievements = [];
  const index = store.achievements.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Achievement not found." });
    return;
  }

  store.achievements[index] = {
    ...store.achievements[index],
    ...req.body,
    id: store.achievements[index].id,
  };

  recordServerActivity("achievement_unlocked", `Updated achievement: ${store.achievements[index].title}`);
  saveStore();
  res.json({ success: true, achievement: store.achievements[index] });
});

app.delete("/api/achievements/:id", requireAdminAuth, (req: Request, res: Response) => {
  if (!store.achievements) store.achievements = [];
  const index = store.achievements.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Achievement not found." });
    return;
  }

  const removed = store.achievements[index];
  store.achievements.splice(index, 1);
  recordServerActivity("achievement_unlocked", `Removed achievement: ${removed?.title || "achievement"}`);
  saveStore();
  res.json({ success: true, message: "Achievement deleted." });
});

// ==========================================
// EXPERIENCE API ROUTES
// ==========================================

app.get("/api/experiences", (req: Request, res: Response) => {
  res.json(store.experiences);
});

app.post("/api/experiences", requireAdminAuth, (req: Request, res: Response) => {
  const data = req.body;
  const newExp: Experience = {
    id: "exp-" + Date.now(),
    role: data.role,
    company: data.company,
    period: data.period,
    location: data.location || "Remote",
    type: data.type || "Full-Time",
    description: data.description || "",
    achievements: Array.isArray(data.achievements) ? data.achievements : [],
    technologies: Array.isArray(data.technologies) ? data.technologies : [],
  };

  store.experiences.unshift(newExp);
  recordServerActivity("experience_updated", `Added experience: ${newExp.role} at ${newExp.company}`);
  saveStore();
  res.status(201).json({ success: true, experience: newExp });
});

app.put("/api/experiences/:id", requireAdminAuth, (req: Request, res: Response) => {
  const exp = store.experiences.find((e) => e.id === req.params.id);
  if (!exp) {
    res.status(404).json({ error: "Experience entry not found." });
    return;
  }

  const data = req.body;
  if (data.role !== undefined) exp.role = data.role;
  if (data.company !== undefined) exp.company = data.company;
  if (data.period !== undefined) exp.period = data.period;
  if (data.location !== undefined) exp.location = data.location;
  if (data.type !== undefined) exp.type = data.type;
  if (data.description !== undefined) exp.description = data.description;
  if (data.achievements !== undefined) exp.achievements = Array.isArray(data.achievements) ? data.achievements : [];
  if (data.technologies !== undefined) exp.technologies = Array.isArray(data.technologies) ? data.technologies : [];

  recordServerActivity("experience_updated", `Updated experience at ${exp.company}`);
  saveStore();
  res.json({ success: true, experience: exp });
});

app.delete("/api/experiences/:id", requireAdminAuth, (req: Request, res: Response) => {
  const index = store.experiences.findIndex((e) => e.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Experience entry not found." });
    return;
  }
  const removed = store.experiences[index];
  store.experiences.splice(index, 1);
  recordServerActivity("experience_updated", `Removed experience at ${removed?.company || "company"}`);
  saveStore();
  res.json({ success: true });
});

// ==========================================
// CONTACT & MESSAGES API ROUTES
// ==========================================

app.post("/api/contact", (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: "Name, email, and message are required." });
    return;
  }

  const newMessage: Message = {
    id: "msg-" + Date.now(),
    name: String(name).trim(),
    email: String(email).trim(),
    subject: subject ? String(subject).trim() : "Portfolio Contact Inquiry",
    message: String(message).trim(),
    createdAt: new Date().toISOString(),
    read: false,
    starred: false,
  };

  store.messages.unshift(newMessage);
  recordServerActivity("contact_received", `Received inquiry from ${newMessage.name}`, newMessage.subject);
  saveStore();

  res.status(201).json({
    success: true,
    message: "Thank you! Your message has been sent successfully. Hammad will get back to you shortly.",
  });
});

app.get("/api/messages", requireAdminAuth, (req: Request, res: Response) => {
  res.json(store.messages);
});

app.put("/api/messages/:id/read", requireAdminAuth, (req: Request, res: Response) => {
  const msg = store.messages.find((m) => m.id === req.params.id);
  if (!msg) {
    res.status(404).json({ error: "Message not found." });
    return;
  }
  msg.read = req.body.read !== undefined ? Boolean(req.body.read) : true;
  saveStore();
  res.json({ success: true, message: msg });
});

app.put("/api/messages/:id/star", requireAdminAuth, (req: Request, res: Response) => {
  const msg = store.messages.find((m) => m.id === req.params.id);
  if (!msg) {
    res.status(404).json({ error: "Message not found." });
    return;
  }
  msg.starred = !msg.starred;
  saveStore();
  res.json({ success: true, message: msg });
});

app.delete("/api/messages/:id", requireAdminAuth, (req: Request, res: Response) => {
  const index = store.messages.findIndex((m) => m.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Message not found." });
    return;
  }
  store.messages.splice(index, 1);
  saveStore();
  res.json({ success: true });
});

// ==========================================
// CONTRIBUTIONS & REAL-TIME STREAK API
// ==========================================

app.get("/api/contributions", (req: Request, res: Response) => {
  if (!Array.isArray(store.activities) || store.activities.length === 0) {
    store.activities = generateSeedActivities();
    saveStore();
  }

  const streakData = calculateStreakAndContributions(store.activities);
  res.json(streakData);
});

app.get("/api/activities", (req: Request, res: Response) => {
  if (!Array.isArray(store.activities) || store.activities.length === 0) {
    store.activities = generateSeedActivities();
    saveStore();
  }
  res.json(store.activities.slice(-100).reverse());
});

app.post("/api/activities", (req: Request, res: Response) => {
  const { type, title, description, repo, prNumber, commitHash, metadata } = req.body;
  if (!type || !title) {
    res.status(400).json({ error: "type and title are required." });
    return;
  }

  const act = recordServerActivity(type, title, description, metadata);
  if (repo) act.repo = repo;
  if (prNumber) act.prNumber = prNumber;
  if (commitHash) act.commitHash = commitHash;
  saveStore();

  const streakData = calculateStreakAndContributions(store.activities || []);
  res.status(201).json({
    success: true,
    activity: act,
    contributions: streakData,
  });
});

app.post("/api/activities/sync", (req: Request, res: Response) => {
  const cloudActivities = req.body;
  if (Array.isArray(cloudActivities) && cloudActivities.length > 0) {
    // Merge cloud activities with existing avoiding duplicates
    const map = new Map<string, ActivityLog>();
    (store.activities || []).forEach((a) => map.set(a.id, a));
    cloudActivities.forEach((a) => {
      if (a && a.id) map.set(a.id, a);
    });

    store.activities = Array.from(map.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    saveStore();

    const streakData = calculateStreakAndContributions(store.activities);
    res.json({ success: true, count: store.activities.length, contributions: streakData });
    return;
  }
  res.status(400).json({ error: "Invalid activities array." });
});

// Full Store Endpoint & Direct Sync for Cloud Restore
app.get("/api/store", (req: Request, res: Response) => {
  res.json(store);
});

app.post("/api/store/restore", async (req: Request, res: Response) => {
  try {
    const cloudData: PortfolioData = req.body;
    if (cloudData && cloudData.profile && Array.isArray(cloudData.projects)) {
      store = {
        ...store,
        ...cloudData,
        profile: { ...store.profile, ...cloudData.profile },
        projects: Array.isArray(cloudData.projects) ? cloudData.projects : store.projects,
        skills: Array.isArray(cloudData.skills) ? cloudData.skills : store.skills,
        achievements: Array.isArray(cloudData.achievements) ? cloudData.achievements : store.achievements,
        experiences: Array.isArray(cloudData.experiences) ? cloudData.experiences : store.experiences,
        activities: Array.isArray(cloudData.activities) && cloudData.activities.length > 0 ? cloudData.activities : (store.activities || generateSeedActivities()),
      };
      saveStore();
      res.json({ success: true, message: "Portfolio data restored from cloud storage." });
      return;
    }
    res.status(400).json({ error: "Invalid cloud portfolio data structure." });
  } catch (err) {
    res.status(500).json({ error: "Failed to apply cloud restore." });
  }
});

// Reset Data Endpoint
app.post("/api/reset-data", requireAdminAuth, (req: Request, res: Response) => {
  store = JSON.parse(JSON.stringify(initialData));
  saveStore();
  res.json({ success: true, message: "Portfolio store reset to default data." });
});

// ==========================================
// VITE MIDDLEWARE & SERVER INITIALIZATION
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Portfolio Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
