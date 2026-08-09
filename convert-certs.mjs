import { pdf } from 'pdf-to-img';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERTIFIKAT_DIR = path.join(__dirname, 'sertifikat');
const OUTPUT_DIR = path.join(__dirname, 'assets', 'certs');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

async function main() {
  const files = fs.readdirSync(SERTIFIKAT_DIR);
  console.log(`Found ${files.length} certificate files.\n`);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const baseName = slugify(path.basename(file, ext));
    const srcPath = path.join(SERTIFIKAT_DIR, file);

    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      const destPath = path.join(OUTPUT_DIR, `${baseName}.png`);
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✓ ${baseName}.png (copied)`);
    } else if (ext === '.pdf') {
      const destPath = path.join(OUTPUT_DIR, `${baseName}.png`);
      try {
        let pageNum = 0;
        const document = await pdf(srcPath, { scale: 2.0 });
        for await (const image of document) {
          pageNum++;
          if (pageNum === 1) {
            fs.writeFileSync(destPath, image);
            console.log(`  ✓ ${baseName}.png (converted from PDF)`);
          }
          break; // Only first page
        }
      } catch (err) {
        console.error(`  ✗ Failed: ${file} — ${err.message}`);
      }
    }
  }

  const outputFiles = fs.readdirSync(OUTPUT_DIR);
  console.log(`\nDone! ${outputFiles.length} images in assets/certs/:`);
  outputFiles.forEach(f => console.log(`  → ${f}`));
}

main().catch(err => console.error('Error:', err));
