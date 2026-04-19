import sharp from "sharp";
import { readdir } from "fs/promises";
import { join } from "path";

const framesDir = "public/frames";
const files = (await readdir(framesDir)).filter((f) => f.endsWith(".png"));

console.log(`Converting ${files.length} PNG frames to WebP...`);

let done = 0;
const BATCH = 20;

for (let i = 0; i < files.length; i += BATCH) {
  const batch = files.slice(i, i + BATCH);
  await Promise.all(
    batch.map(async (file) => {
      const input = join(framesDir, file);
      const output = join(framesDir, file.replace(".png", ".webp"));
      await sharp(input).webp({ quality: 80 }).toFile(output);
      done++;
      if (done % 40 === 0 || done === files.length) {
        console.log(`  ${done}/${files.length}`);
      }
    })
  );
}

console.log("Done! All frames converted to WebP.");
