import { db } from "../src/lib/firebase.ts";
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { Project, Profile } from "../src/types.ts";

const PROJECTS_COLLECTION = "projects";
const PROFILE_COLLECTION = "profile";

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

export async function getProjectsFromFirestore(): Promise<Project[]> {
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
    console.error("Server: Error fetching projects from Firestore:", err);
    return [];
  }
}

export async function saveProjectToFirestore(project: Project): Promise<boolean> {
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
    console.error(`Server: Error saving project ${project.id} to Firestore:`, err);
    return false;
  }
}

export async function deleteProjectFromFirestore(projectId: string): Promise<boolean> {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error(`Server: Error deleting project ${projectId} from Firestore:`, err);
    return false;
  }
}

export async function syncProjectsToFirestore(projects: Project[]): Promise<boolean> {
  try {
    for (const p of projects) {
      await saveProjectToFirestore(p);
    }
    return true;
  } catch (err) {
    console.error("Server: Error syncing projects to Firestore:", err);
    return false;
  }
}

export async function getProfileFromFirestore(): Promise<Profile | null> {
  try {
    const docRef = doc(db, PROFILE_COLLECTION, "main");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Profile;
    }
    return null;
  } catch (err) {
    console.error("Server: Error fetching profile from Firestore:", err);
    return null;
  }
}

export async function saveProfileToFirestore(profile: Profile): Promise<boolean> {
  try {
    const docRef = doc(db, PROFILE_COLLECTION, "main");
    const sanitized = sanitizeForFirestore(profile);
    await setDoc(docRef, sanitized, { merge: true });
    return true;
  } catch (err) {
    console.error("Server: Error saving profile to Firestore:", err);
    return false;
  }
}
