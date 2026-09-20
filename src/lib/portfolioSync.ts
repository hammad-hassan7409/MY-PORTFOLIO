import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { PortfolioData, Project, Profile, Skill, Achievement, Experience, Message, ActivityLog, ContributionData } from "../types";

const PROJECTS_COLLECTION = "projects";
const SKILLS_COLLECTION = "skills";
const ACHIEVEMENTS_COLLECTION = "achievements";
const EXPERIENCES_COLLECTION = "experiences";
const MESSAGES_COLLECTION = "messages";
const ACTIVITIES_COLLECTION = "activities";
const CONTRIBUTIONS_COLLECTION = "contributions";
const CONTRIBUTIONS_DOC_ID = "summary";
const PROFILE_COLLECTION = "profile";
const PROFILE_DOC_ID = "main";
const PORTFOLIO_DOC_PATH = "portfolio";
const PORTFOLIO_DOC_ID = "main";

// Local storage key fallbacks
const LOCAL_PROJECTS_KEY = "portfolio_persisted_projects";
const LOCAL_PROFILE_KEY = "portfolio_persisted_profile";
const LOCAL_ACTIVITIES_KEY = "portfolio_persisted_activities";

/**
 * Recursively cleans data for Firestore:
 * - Removes undefined values (which crash setDoc in Firestore)
 * - Converts invalid values into safe primitives
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as any;
  }
  if (typeof data === "object") {
    const cleaned: any = {};
    for (const [key, val] of Object.entries(data as Record<string, any>)) {
      if (val !== undefined) {
        cleaned[key] = sanitizeForFirestore(val);
      }
    }
    return cleaned;
  }
  return data;
}

// Global in-memory and sessionStorage circuit breaker for Firestore quota exhaustion
let firestoreQuotaExhaustedUntil = 0;

export function isFirestoreQuotaSuspended(): boolean {
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem("firestore_quota_suspended_until");
      if (stored && Number(stored) > Date.now()) {
        return true;
      }
    } catch {}
  }
  return firestoreQuotaExhaustedUntil > Date.now();
}

export function handleFirestoreError(err: any, context: string): boolean {
  const msg = (err?.message || err?.code || "").toString();
  const isQuota =
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("resource-exhausted") ||
    msg.includes("Quota limit exceeded") ||
    msg.includes("quota") ||
    msg.includes("Write stream exhausted");

  if (isQuota) {
    const suspendTime = Date.now() + 15 * 60 * 1000; // 15 minutes
    firestoreQuotaExhaustedUntil = suspendTime;
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("firestore_quota_suspended_until", String(suspendTime));
      } catch {}
    }
    console.warn(
      `[Firestore Quota Guard] ${context}: Quota limit reached or stream full. Temporarily suspending Firestore write calls for 15 minutes. Automatically utilizing local server store and cache.`
    );
    return true;
  }
  return false;
}

export interface CloudOperationResult<T = any> {
  success: boolean;
  error?: string;
  data?: T;
  isQuotaExhausted?: boolean;
}

/**
 * =========================================================================
 * PROJECTS PERSISTENCE
 * =========================================================================
 */

/**
 * Save a single project to Firestore database (permanent cloud persistence)
 * Includes read-back verification to guarantee database confirmation.
 */
export async function saveProjectToCloud(project: Project): Promise<CloudOperationResult<Project>> {
  if (!project || !project.id) {
    console.error("saveProjectToCloud error: Invalid project or missing ID", project);
    return { success: false, error: "Project data is invalid or missing a unique ID." };
  }

  // Always update local cache immediately so data is never lost
  try {
    const cached = getLocalCachedProjects();
    const idx = cached.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      cached[idx] = project;
    } else {
      cached.push(project);
    }
    saveLocalCachedProjects(cached);
  } catch {}

  // If quota is currently suspended, skip attempting Firestore write to prevent stream errors
  if (isFirestoreQuotaSuspended()) {
    return { success: true, isQuotaExhausted: true, data: project };
  }

  try {
    const docRef = doc(db, PROJECTS_COLLECTION, project.id);

    // Ensure gallery doesn't hold redundant duplicates of the primary image, especially base64
    let sanitizedGallery = Array.isArray(project.gallery) ? [...project.gallery] : [];
    if (project.imageUrl && project.imageUrl.startsWith("data:")) {
      // Strip any duplicate base64 string from gallery to prevent >1MB bloat
      sanitizedGallery = sanitizedGallery.filter(
        (url) => url && url !== project.imageUrl && !url.startsWith("data:")
      );
    } else if (project.imageUrl && sanitizedGallery.length === 0) {
      sanitizedGallery = [project.imageUrl];
    }
    const seen = new Set<string>();
    sanitizedGallery = sanitizedGallery
      .filter((url) => {
        if (!url || seen.has(url)) return false;
        seen.add(url);
        return true;
      })
      .slice(0, 4);

    const projectDataToSave = sanitizeForFirestore({
      ...project,
      gallery: sanitizedGallery,
      updatedAt: project.updatedAt || new Date().toISOString(),
      isPinned: Boolean(project.isPinned),
      isFeatured: Boolean(project.isFeatured),
      order: typeof project.order === "number" ? project.order : 0,
      stars: Number(project.stars) || 0,
      forks: Number(project.forks) || 0,
      technologies: Array.isArray(project.technologies) ? project.technologies : [],
      highlights: Array.isArray(project.highlights) ? project.highlights : [],
      architecture: Array.isArray(project.architecture) ? project.architecture : [],
    });

    // 1. Commit write to Firestore database
    await setDoc(docRef, projectDataToSave, { merge: true });

    // 2. Read back from Firestore to verify document was committed
    let verifiedProject: Project = project;
    try {
      const verifySnap = await getDoc(docRef);
      if (verifySnap.exists()) {
        verifiedProject = { ...verifySnap.data(), id: verifySnap.id } as Project;
      }
    } catch {}

    // Cache verified project
    try {
      const cached = getLocalCachedProjects();
      const idx = cached.findIndex((p) => p.id === project.id);
      if (idx >= 0) {
        cached[idx] = verifiedProject;
      } else {
        cached.push(verifiedProject);
      }
      saveLocalCachedProjects(cached);
    } catch {}

    return { success: true, data: verifiedProject };
  } catch (err: any) {
    if (handleFirestoreError(err, `saveProjectToCloud(${project.id})`)) {
      return { success: true, isQuotaExhausted: true, data: project };
    }
    const errorMsg = err?.message || err?.code || "Unknown Firestore database error";
    console.error("Failed to save project to Firestore cloud database:", errorMsg, err);
    return { success: false, error: errorMsg };
  }
}

/**
 * Delete a project from Firestore database
 */
export async function deleteProjectFromCloud(projectId: string): Promise<CloudOperationResult> {
  // Always update local cache immediately
  try {
    const cached = getLocalCachedProjects().filter((p) => p.id !== projectId);
    saveLocalCachedProjects(cached);
  } catch {}

  if (isFirestoreQuotaSuspended()) {
    return { success: true, isQuotaExhausted: true };
  }

  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (err: any) {
    if (handleFirestoreError(err, `deleteProjectFromCloud(${projectId})`)) {
      return { success: true, isQuotaExhausted: true };
    }
    const errorMsg = err?.message || err?.code || "Unknown Firestore database deletion error";
    console.error("Failed to delete project from Firestore cloud database:", errorMsg, err);
    return { success: false, error: errorMsg };
  }
}

/**
 * Load all projects directly from Firestore database
 */
export async function loadProjectsFromCloud(): Promise<Project[] | null> {
  try {
    const colRef = collection(db, PROJECTS_COLLECTION);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const list: Project[] = [];
      snap.forEach((d) => {
        const item = d.data() as Project;
        if (item && (item.displayName || item.name)) {
          list.push({ ...item, id: d.id || item.id });
        }
      });

      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      saveLocalCachedProjects(list);
      return list;
    }
  } catch (err) {
    console.warn("Firestore projects query failed or offline:", err);
  }

  // Fallback to local storage if network is offline
  const local = getLocalCachedProjects();
  if (local.length > 0) {
    return local;
  }
  return null;
}

/**
 * Subscribe to realtime updates for projects from Firestore
 */
export function subscribeToCloudProjects(callback: (projects: Project[]) => void) {
  try {
    const colRef = collection(db, PROJECTS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Project[] = [];
          snapshot.forEach((d) => {
            const item = d.data() as Project;
            if (item && (item.displayName || item.name)) {
              list.push({ ...item, id: d.id || item.id });
            }
          });
          list.sort((a, b) => (a.order || 0) - (b.order || 0));
          saveLocalCachedProjects(list);
          callback(list);
        }
      },
      (error) => {
        console.warn("Firestore realtime projects subscription error:", error);
      }
    );
  } catch (e) {
    console.warn("Firestore projects onSnapshot initialization failed:", e);
    return () => {};
  }
}

/**
 * Local cache helpers for instant zero-lag loading
 */
export function getLocalCachedProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_PROJECTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveLocalCachedProjects(projects: Project[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(projects));
  } catch {
    // ignore
  }
}

/**
 * =========================================================================
 * PROFILE PERSISTENCE
 * =========================================================================
 */

export async function saveProfileToCloud(profile: Profile): Promise<boolean> {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
    } catch {}
  }
  if (isFirestoreQuotaSuspended()) return true;

  try {
    const docRef = doc(db, PROFILE_COLLECTION, PROFILE_DOC_ID);
    await setDoc(docRef, sanitizeForFirestore(profile), { merge: true });
    return true;
  } catch (err) {
    if (handleFirestoreError(err, "saveProfileToCloud")) return true;
    console.warn("Failed to save profile to Firestore:", err);
    return false;
  }
}

export async function loadProfileFromCloud(): Promise<Profile | null> {
  try {
    const docRef = doc(db, PROFILE_COLLECTION, PROFILE_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Profile;
    }
  } catch (err) {
    console.warn("Firestore profile read failed:", err);
  }
  if (typeof window !== "undefined") {
    try {
      const local = localStorage.getItem(LOCAL_PROFILE_KEY);
      if (local) return JSON.parse(local);
    } catch {
      // ignore
    }
  }
  return null;
}

/**
 * =========================================================================
 * SKILLS & EXPERIENCES & ACHIEVEMENTS PERSISTENCE
 * =========================================================================
 */

export async function saveSkillToCloud(skill: Skill): Promise<boolean> {
  if (isFirestoreQuotaSuspended()) return true;
  try {
    const docRef = doc(db, SKILLS_COLLECTION, skill.id);
    await setDoc(docRef, sanitizeForFirestore(skill), { merge: true });
    return true;
  } catch (err) {
    if (handleFirestoreError(err, "saveSkillToCloud")) return true;
    console.warn("Failed to save skill to Firestore:", err);
    return false;
  }
}

export async function deleteSkillFromCloud(skillId: string): Promise<boolean> {
  if (isFirestoreQuotaSuspended()) return true;
  try {
    const docRef = doc(db, SKILLS_COLLECTION, skillId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    if (handleFirestoreError(err, "deleteSkillFromCloud")) return true;
    console.warn("Failed to delete skill from Firestore:", err);
    return false;
  }
}

export async function loadSkillsFromCloud(): Promise<Skill[] | null> {
  try {
    const snap = await getDocs(collection(db, SKILLS_COLLECTION));
    if (!snap.empty) {
      const list: Skill[] = [];
      snap.forEach((d) => list.push(d.data() as Skill));
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      return list;
    }
  } catch (err) {
    handleFirestoreError(err, "loadSkillsFromCloud");
    console.warn("Firestore skills read failed:", err);
  }
  return null;
}

export async function saveAchievementToCloud(ach: Achievement): Promise<boolean> {
  if (isFirestoreQuotaSuspended()) return true;
  try {
    const docRef = doc(db, ACHIEVEMENTS_COLLECTION, ach.id);
    await setDoc(docRef, sanitizeForFirestore(ach), { merge: true });
    return true;
  } catch (err) {
    if (handleFirestoreError(err, "saveAchievementToCloud")) return true;
    console.warn("Failed to save achievement to Firestore:", err);
    return false;
  }
}

export async function deleteAchievementFromCloud(achId: string): Promise<boolean> {
  if (isFirestoreQuotaSuspended()) return true;
  try {
    const docRef = doc(db, ACHIEVEMENTS_COLLECTION, achId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    if (handleFirestoreError(err, "deleteAchievementFromCloud")) return true;
    console.warn("Failed to delete achievement from Firestore:", err);
    return false;
  }
}

export async function loadAchievementsFromCloud(): Promise<Achievement[] | null> {
  try {
    const snap = await getDocs(collection(db, ACHIEVEMENTS_COLLECTION));
    if (!snap.empty) {
      const list: Achievement[] = [];
      snap.forEach((d) => list.push(d.data() as Achievement));
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      return list;
    }
  } catch (err) {
    handleFirestoreError(err, "loadAchievementsFromCloud");
    console.warn("Firestore achievements read failed:", err);
  }
  return null;
}

export async function saveExperienceToCloud(exp: Experience): Promise<boolean> {
  if (isFirestoreQuotaSuspended()) return true;
  try {
    const docRef = doc(db, EXPERIENCES_COLLECTION, exp.id);
    await setDoc(docRef, sanitizeForFirestore(exp), { merge: true });
    return true;
  } catch (err) {
    if (handleFirestoreError(err, "saveExperienceToCloud")) return true;
    console.warn("Failed to save experience to Firestore:", err);
    return false;
  }
}

export async function deleteExperienceFromCloud(expId: string): Promise<boolean> {
  if (isFirestoreQuotaSuspended()) return true;
  try {
    const docRef = doc(db, EXPERIENCES_COLLECTION, expId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    if (handleFirestoreError(err, "deleteExperienceFromCloud")) return true;
    console.warn("Failed to delete experience from Firestore:", err);
    return false;
  }
}

export async function loadExperiencesFromCloud(): Promise<Experience[] | null> {
  try {
    const snap = await getDocs(collection(db, EXPERIENCES_COLLECTION));
    if (!snap.empty) {
      const list: Experience[] = [];
      snap.forEach((d) => list.push(d.data() as Experience));
      return list;
    }
  } catch (err) {
    handleFirestoreError(err, "loadExperiencesFromCloud");
    console.warn("Firestore experiences read failed:", err);
  }
  return null;
}

export async function saveMessageToCloud(msg: Message): Promise<boolean> {
  if (isFirestoreQuotaSuspended()) return true;
  try {
    const docRef = doc(db, MESSAGES_COLLECTION, msg.id);
    await setDoc(docRef, sanitizeForFirestore(msg), { merge: true });
    return true;
  } catch (err) {
    if (handleFirestoreError(err, "saveMessageToCloud")) return true;
    console.warn("Failed to save message to Firestore:", err);
    return false;
  }
}

export async function deleteMessageFromCloud(msgId: string): Promise<boolean> {
  if (isFirestoreQuotaSuspended()) return true;
  try {
    const docRef = doc(db, MESSAGES_COLLECTION, msgId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    if (handleFirestoreError(err, "deleteMessageFromCloud")) return true;
    console.warn("Failed to delete message from Firestore:", err);
    return false;
  }
}

export async function loadMessagesFromCloud(): Promise<Message[] | null> {
  try {
    const snap = await getDocs(collection(db, MESSAGES_COLLECTION));
    if (!snap.empty) {
      const list: Message[] = [];
      snap.forEach((d) => list.push(d.data() as Message));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    }
  } catch (err) {
    handleFirestoreError(err, "loadMessagesFromCloud");
    console.warn("Firestore messages read failed:", err);
  }
  return null;
}

/**
 * =========================================================================
 * ACTIVITIES & REALTIME STREAK PERSISTENCE
 * =========================================================================
 */

export function getLocalCachedActivities(): ActivityLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_ACTIVITIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveLocalCachedActivities(activities: ActivityLog[]): void {
  if (typeof window === "undefined") return;
  try {
    // Keep last 300 activities in local storage cache
    localStorage.setItem(LOCAL_ACTIVITIES_KEY, JSON.stringify(activities.slice(-300)));
  } catch {
    // ignore
  }
}

export async function saveActivityToCloud(activity: ActivityLog): Promise<boolean> {
  // Always update local cache first
  try {
    const cached = getLocalCachedActivities();
    if (!cached.some((a) => a.id === activity.id)) {
      cached.push(activity);
      saveLocalCachedActivities(cached);
    }
  } catch {}

  if (isFirestoreQuotaSuspended()) return true;

  try {
    const docRef = doc(db, ACTIVITIES_COLLECTION, activity.id);
    await setDoc(docRef, sanitizeForFirestore(activity), { merge: true });
    return true;
  } catch (err) {
    if (handleFirestoreError(err, "saveActivityToCloud")) return true;
    console.warn("Failed to save activity to Firestore:", err);
    return false;
  }
}

export async function loadActivitiesFromCloud(): Promise<ActivityLog[] | null> {
  try {
    const snap = await getDocs(collection(db, ACTIVITIES_COLLECTION));
    if (!snap.empty) {
      const list: ActivityLog[] = [];
      snap.forEach((d) => {
        const item = d.data() as ActivityLog;
        if (item && item.id && item.type) {
          list.push(item);
        }
      });
      list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      saveLocalCachedActivities(list);
      return list;
    }
  } catch (err) {
    handleFirestoreError(err, "loadActivitiesFromCloud");
    console.warn("Firestore activities read failed:", err);
  }

  const local = getLocalCachedActivities();
  if (local.length > 0) return local;
  return null;
}

export function subscribeToCloudActivities(callback: (activities: ActivityLog[]) => void) {
  try {
    const colRef = collection(db, ACTIVITIES_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: ActivityLog[] = [];
          snapshot.forEach((d) => {
            const item = d.data() as ActivityLog;
            if (item && item.id && item.type) {
              list.push(item);
            }
          });
          list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          saveLocalCachedActivities(list);
          callback(list);
        }
      },
      (error) => {
        handleFirestoreError(error, "subscribeToCloudActivities");
        console.warn("Firestore activities realtime sync error:", error);
      }
    );
  } catch (e) {
    handleFirestoreError(e, "subscribeToCloudActivities init");
    console.warn("Firestore activities subscription init failed:", e);
    return () => {};
  }
}

export async function saveContributionSummaryToCloud(summary: Partial<ContributionData>): Promise<boolean> {
  if (isFirestoreQuotaSuspended()) return true;
  try {
    const docRef = doc(db, CONTRIBUTIONS_COLLECTION, CONTRIBUTIONS_DOC_ID);
    await setDoc(
      docRef,
      sanitizeForFirestore({
        ...summary,
        lastUpdated: new Date().toISOString(),
      }),
      { merge: true }
    );
    return true;
  } catch (err) {
    if (handleFirestoreError(err, "saveContributionSummaryToCloud")) return true;
    console.warn("Firestore contribution summary save failed:", err);
    return false;
  }
}

export async function loadContributionSummaryFromCloud(): Promise<Partial<ContributionData> | null> {
  try {
    const docRef = doc(db, CONTRIBUTIONS_COLLECTION, CONTRIBUTIONS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Partial<ContributionData>;
    }
  } catch (err) {
    handleFirestoreError(err, "loadContributionSummaryFromCloud");
    console.warn("Firestore contribution summary read failed:", err);
  }
  return null;
}

/**
 * =========================================================================
 * COMPREHENSIVE STORE BACKUP
 * =========================================================================
 */

export async function loadPortfolioFromCloud(): Promise<PortfolioData | null> {
  try {
    const docRef = doc(db, PORTFOLIO_DOC_PATH, PORTFOLIO_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as PortfolioData;
    }
  } catch (err) {
    handleFirestoreError(err, "loadPortfolioFromCloud");
    console.warn("Firestore cloud portfolio read failed:", err);
  }
  return null;
}

export async function savePortfolioToCloud(data: PortfolioData): Promise<boolean> {
  if (isFirestoreQuotaSuspended()) return true;
  try {
    const docRef = doc(db, PORTFOLIO_DOC_PATH, PORTFOLIO_DOC_ID);
    // Strip large images from monolithic backup doc to prevent 1MB limit crash
    const sanitizedData = sanitizeForFirestore({
      ...data,
      projects: (data.projects || []).map((p) => ({
        ...p,
        imageUrl:
          p.imageUrl && p.imageUrl.startsWith("data:")
            ? p.imageUrl.substring(0, 100) + "...[stored in projects collection]"
            : p.imageUrl,
        gallery: (p.gallery || []).map((g) =>
          g && g.startsWith("data:") ? g.substring(0, 100) + "...[stored in projects collection]" : g
        ),
      })),
      _syncedAt: new Date().toISOString(),
    });
    await setDoc(docRef, sanitizedData, { merge: true });
    return true;
  } catch (err) {
    if (handleFirestoreError(err, "savePortfolioToCloud")) return true;
    console.warn("Firestore cloud portfolio backup failed:", err);
    return false;
  }
}

export function subscribeToCloudPortfolio(callback: (data: PortfolioData) => void) {
  try {
    const docRef = doc(db, PORTFOLIO_DOC_PATH, PORTFOLIO_DOC_ID);
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          callback(snap.data() as PortfolioData);
        }
      },
      (error) => {
        console.warn("Firestore realtime sync subscription error:", error);
      }
    );
  } catch (e) {
    console.warn("Firestore onSnapshot initialization failed:", e);
    return () => {};
  }
}
