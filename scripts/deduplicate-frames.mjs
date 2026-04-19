import { readdir, readFile, rename, unlink, writeFile } from "fs/promises";
import { createHash } from "crypto";
import { join } from "path";

const framesDir = "public/frames";
const files = (await readdir(framesDir))
  .filter((f) => f.endsWith(".webp"))
  .sort();

// Step 1: Identify unique frames (keep first occurrence, skip duplicates)
const seen = new Map();
const uniqueFiles = [];
const duplicateFiles = [];

for (const file of files) {
  const data = await readFile(join(framesDir, file));
  const hash = createHash("md5").update(data).digest("hex");

  if (seen.has(hash)) {
    duplicateFiles.push(file);
  } else {
    seen.set(hash, file);
    uniqueFiles.push(file);
  }
}

console.log(`Unique: ${uniqueFiles.length}, Duplicates to remove: ${duplicateFiles.length}`);

// Step 2: Delete duplicate files
for (const file of duplicateFiles) {
  await unlink(join(framesDir, file));
}
console.log(`Deleted ${duplicateFiles.length} duplicate files.`);

// Step 3: Renumber remaining files sequentially (frame_0001.webp, frame_0002.webp, ...)
const remaining = (await readdir(framesDir))
  .filter((f) => f.endsWith(".webp"))
  .sort();

// First rename to temp names to avoid collisions
for (let i = 0; i < remaining.length; i++) {
  await rename(
    join(framesDir, remaining[i]),
    join(framesDir, `_temp_${String(i + 1).padStart(4, "0")}.webp`)
  );
}

// Then rename to final names
for (let i = 0; i < remaining.length; i++) {
  await rename(
    join(framesDir, `_temp_${String(i + 1).padStart(4, "0")}.webp`),
    join(framesDir, `frame_${String(i + 1).padStart(4, "0")}.webp`)
  );
}

console.log(`Renumbered ${remaining.length} frames sequentially.`);
console.log(`\nDone! Update TOTAL_FRAMES to ${remaining.length}`);
