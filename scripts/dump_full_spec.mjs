import fs from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

async function main() {
  const filePath = 'C:/Users/User/.gemini/antigravity-ide/brain/3618fc55-ef3f-48e9-9d0b-bd1a3193ae69/.user_uploaded/media_1790618916763.pdf';
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjs.getDocument({ data }).promise;
  let full = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map(item => item.str).join(' ').trim();
    full += `\n\n=== PAGE ${i} ===\n` + text;
  }
  fs.writeFileSync('scripts/pdf_spec_full.txt', full);
  console.log('Saved pdf_spec_full.txt, total chars:', full.length);
}

main();
