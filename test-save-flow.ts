import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import fs from "fs";
import { sanitizeForFirestore } from "./src/lib/portfolioSync";

async function run() {
  const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
  const app = initializeApp(config);
  const db = config.firestoreDatabaseId && config.firestoreDatabaseId !== "(default)"
    ? initializeFirestore(app, {}, config.firestoreDatabaseId)
    : getFirestore(app);

  console.log("=== STEP 1: Current docs in Firestore ===");
  let snap = await getDocs(collection(db, "projects"));
  console.log("Found:", snap.size);
  snap.forEach(d => console.log("-", d.id, d.data().displayName));

  console.log("=== STEP 2: Adding Project 3 ===");
  const p3 = {
    id: "proj-test-3",
    name: "test-project-3",
    displayName: "Test Project Three",
    description: "Description of test project 3",
    longDescription: "Long description",
    primaryLanguage: "TypeScript",
    primaryLanguageColor: "#3178c6",
    technologies: ["React", "TypeScript"],
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200",
    gallery: ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200"],
    status: "Live",
    isPinned: false,
    isFeatured: false,
    order: 3,
    stars: 10,
    forks: 2,
    liveUrl: "https://example.com/3",
    githubUrl: "https://github.com/test/3",
    highlights: ["Highlight 1"],
    architecture: ["Arch 1"],
    updatedAt: new Date().toISOString(),
    createdAt: "2025-01-01"
  };

  const docRef3 = doc(db, "projects", p3.id);
  await setDoc(docRef3, sanitizeForFirestore(p3), { merge: true });
  console.log("SetDoc p3 successful!");

  console.log("=== STEP 3: Verifying p3 ===");
  snap = await getDocs(collection(db, "projects"));
  console.log("Found after p3:", snap.size);
  snap.forEach(d => console.log("-", d.id, d.data().displayName));

  console.log("=== STEP 4: Cleaning up p3 ===");
  await deleteDoc(docRef3);
  console.log("Deleted p3.");

  process.exit(0);
}

run().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
