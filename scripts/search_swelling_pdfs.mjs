import fs from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const files = [
  'media_1788991808392.pdf',
  'media_1788992028510.pdf',
  'media_1788992199101.pdf',
  'media_1788992806784.pdf',
  'media_1788994042272.pdf',
  'media_1788958408843.pdf'
];

async function main() {
  const dir = 'C:/Users/User/.gemini/antigravity-ide/brain/3618fc55-ef3f-48e9-9d0b-bd1a3193ae69/.user_uploaded/';
  for (const f of files) {
    const filePath = dir + f;
    if (!fs.existsSync(filePath)) continue;
    try {
      const data = new Uint8Array(fs.readFileSync(filePath));
      const doc = await pdfjs.getDocument({ data }).promise;
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map(item => item.str).join(' ').trim();
        if (/swell/i.test(text)) {
          console.log(`MATCH in ${f} page ${i}:\n${text}\n`);
        }
      }
    } catch (e) {
      console.error(f, e.message);
    }
  }
}

main();
