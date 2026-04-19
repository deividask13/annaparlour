import { readdir, readFile } from "fs/promises";
import { createHash } from "crypto";
import { join } from "path";

const framesDir = "public/frames";
const files = (await readdir(framesDir))
  .filter((f) => f.endsWith(".webp"))
  .sort();

console.log(`Checking ${files.length} frames for duplicates...\n`);

const hashMap = new Map();
const duplicates = [];

for (const file of files) {
  const data = await readFile(join(framesDir, file));
  const hash = createHash("md5").update(data).digest("hex");

  if (hashMap.has(hash)) {
    duplicates.push({ file, duplicateOf: hashMap.get(hash) });
  } else {
    hashMap.set(hash, file);
  }
}

const uniqueCount = hashMap.size;
console.log(`Total frames: ${files.length}`);
console.log(`Unique frames: ${uniqueCount}`);
console.log(`Duplicates: ${duplicates.length}\n`);

if (duplicates.length > 0) {
  console.log("Duplicate pairs:");
  for (const d of duplicates) {
    console.log(`  ${d.file} == ${d.duplicateOf}`);
  }
}
