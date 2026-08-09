const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// pdfjs-dist for Node.js
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');

const SERTIFIKAT_DIR = path.join(__dirname, 'sertifikat');
const OUTPUT_DIR = path.join(__dirname, 'assets', 'certs');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function convertPdfToPng(pdfPath, outputPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const page = await doc.getPage(1);

  const scale = 2.0; // High quality
  const viewport = page.getViewport({ scale });

  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext('2d');

  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`  ✓ ${path.basename(outputPath)}`);
}

async function main() {
  const files = fs.readdirSync(SERTIFIKAT_DIR);
  console.log(`Found ${files.length} certificate files.\n`);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const baseName = path.basename(file, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const srcPath = path.join(SERTIFIKAT_DIR, file);

    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      // Copy image files directly
      const destPath = path.join(OUTPUT_DIR, `${baseName}.png`);
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✓ ${baseName}.png (copied)`);
    } else if (ext === '.pdf') {
      // Convert PDF to PNG
      const destPath = path.join(OUTPUT_DIR, `${baseName}.png`);
      try {
        await convertPdfToPng(srcPath, destPath);
      } catch (err) {
        console.error(`  ✗ Failed: ${file} — ${err.message}`);
      }
    }
  }

  // List all generated files
  const outputFiles = fs.readdirSync(OUTPUT_DIR);
  console.log(`\nDone! ${outputFiles.length} images in assets/certs/:`);
  outputFiles.forEach(f => console.log(`  → ${f}`));
}

main().catch(err => console.error('Error:', err));
