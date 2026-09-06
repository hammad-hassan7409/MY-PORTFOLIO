import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

async function main() {
  const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
  const app = initializeApp(config);
  const db = config.firestoreDatabaseId && config.firestoreDatabaseId !== "(default)"
    ? initializeFirestore(app, {}, config.firestoreDatabaseId)
    : getFirestore(app);

  const snap = await getDocs(collection(db, "projects"));
  console.log("--- FIRESTORE PROJECTS COUNT:", snap.size, "---");
  snap.forEach((d) => {
    const data = d.data();
    console.log("ID:", d.id, "| Name:", data.displayName, "| Image length:", data.imageUrl ? data.imageUrl.length : 0);
  });
  process.exit(0);
}

main().catch((err) => {
  console.error("ERROR IN FIRESTORE:", err);
  process.exit(1);
});
