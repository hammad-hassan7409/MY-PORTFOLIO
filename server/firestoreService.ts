import { db } from "../src/lib/firebase.ts";
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { Project, Profile } from "../src/types.ts";

const PROJECTS_COLLECTION = "projects";
const PROFILE_COLLECTION = "profile";

let serverQuotaSuspendedUntil = 0;

export function isServerFirestoreQuotaSuspended(): boolean {
  return serverQuotaSuspendedUntil > Date.now();
}

function handleServerFirestoreError(err: any, context: string): void {
  const msg = (err?.message || err?.code || "").toString();
  if (
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("resource-exhausted") ||
    msg.includes("Quota limit exceeded") ||
    msg.includes("quota") ||
    msg.includes("Write stream exhausted")
  ) {
    serverQuotaSuspendedUntil = Date.now() + 15 * 60 * 1000;
    console.warn(
      `[Server Firestore Quota Guard] ${context}: Quota reached or stream full. Suspending server Firestore writes for 15 minutes. Relying on local JSON store.`
    );
  }
}

function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirestore(item));
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean;
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T, operationName: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) =>
      setTimeout(() => {
        console.warn(`[Server Firestore Quota Guard] ${operationName} timed out after ${ms}ms. Suspending server Firestore operations.`);
        serverQuotaSuspendedUntil = Date.now() + 15 * 60 * 1000;
        resolve(fallback);
      }, ms)
    ),
  ]);
}

export async function getProjectsFromFirestore(): Promise<Project[] | null> {
  if (isServerFirestoreQuotaSuspended()) return null;
  return withTimeout(
    (async () => {
      try {
        const colRef = collection(db, PROJECTS_COLLECTION);
        const snap = await getDocs(colRef);
        const list: Project[] = [];
        snap.forEach((d) => {
          const data = d.data() as Project;
          if (data && (data.displayName || data.name)) {
            list.push({ ...data, id: d.id || data.id });
          }
        });
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        return list;
      } catch (err) {
        handleServerFirestoreError(err, "getProjectsFromFirestore");
        console.error("Server: Error fetching projects from Firestore:", err);
        return null;
      }
    })(),
    1500,
    null,
    "getProjectsFromFirestore"
  );
}

export async function saveProjectToFirestore(project: Project): Promise<boolean> {
  if (isServerFirestoreQuotaSuspended()) return false;
  return withTimeout(
    (async () => {
      try {
        const docRef = doc(db, PROJECTS_COLLECTION, project.id);
        const sanitized = sanitizeForFirestore({
          ...project,
          updatedAt: project.updatedAt || new Date().toISOString(),
          isPinned: Boolean(project.isPinned),
          isFeatured: Boolean(project.isFeatured),
          order: typeof project.order === "number" ? project.order : 0,
          stars: Number(project.stars) || 0,
          forks: Number(project.forks) || 0,
          technologies: Array.isArray(project.technologies) ? project.technologies : [],
          highlights: Array.isArray(project.highlights) ? project.highlights : [],
          architecture: Array.isArray(project.architecture) ? project.architecture : [],
          gallery: Array.isArray(project.gallery) ? project.gallery : [project.imageUrl].filter(Boolean),
        });
        await setDoc(docRef, sanitized, { merge: true });
        return true;
      } catch (err) {
        handleServerFirestoreError(err, `saveProjectToFirestore(${project.id})`);
        console.error(`Server: Error saving project ${project.id} to Firestore:`, err);
        return false;
      }
    })(),
    1500,
    false,
    `saveProjectToFirestore(${project.id})`
  );
}

export async function deleteProjectFromFirestore(projectId: string): Promise<boolean> {
  if (isServerFirestoreQuotaSuspended()) return false;
  return withTimeout(
    (async () => {
      try {
        const docRef = doc(db, PROJECTS_COLLECTION, projectId);
        await deleteDoc(docRef);
        return true;
      } catch (err) {
        handleServerFirestoreError(err, `deleteProjectFromFirestore(${projectId})`);
        console.error(`Server: Error deleting project ${projectId} from Firestore:`, err);
        return false;
      }
    })(),
    1500,
    false,
    `deleteProjectFromFirestore(${projectId})`
  );
}

export async function syncProjectsToFirestore(projects: Project[]): Promise<boolean> {
  if (isServerFirestoreQuotaSuspended()) return false;
  try {
    for (const p of projects) {
      if (isServerFirestoreQuotaSuspended()) break;
      await saveProjectToFirestore(p);
    }
    return true;
  } catch (err) {
    handleServerFirestoreError(err, "syncProjectsToFirestore");
    console.error("Server: Error syncing projects to Firestore:", err);
    return false;
  }
}

export async function getProfileFromFirestore(): Promise<Profile | null> {
  if (isServerFirestoreQuotaSuspended()) return null;
  return withTimeout(
    (async () => {
      try {
        const docRef = doc(db, PROFILE_COLLECTION, "main");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return snap.data() as Profile;
        }
        return null;
      } catch (err) {
        handleServerFirestoreError(err, "getProfileFromFirestore");
        console.error("Server: Error fetching profile from Firestore:", err);
        return null;
      }
    })(),
    1500,
    null,
    "getProfileFromFirestore"
  );
}

export async function saveProfileToFirestore(profile: Profile): Promise<boolean> {
  if (isServerFirestoreQuotaSuspended()) return false;
  return withTimeout(
    (async () => {
      try {
        const docRef = doc(db, PROFILE_COLLECTION, "main");
        const sanitized = sanitizeForFirestore(profile);
        await setDoc(docRef, sanitized, { merge: true });
        return true;
      } catch (err) {
        handleServerFirestoreError(err, "saveProfileToFirestore");
        console.error("Server: Error saving profile to Firestore:", err);
        return false;
      }
    })(),
    1500,
    false,
    "saveProfileToFirestore"
  );
}

