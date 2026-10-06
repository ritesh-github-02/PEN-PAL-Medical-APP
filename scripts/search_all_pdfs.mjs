import fs from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const dir = 'C:/Users/User/.gemini/antigravity-ide/brain/3618fc55-ef3f-48e9-9d0b-bd1a3193ae69/.user_uploaded/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));

async function search() {
  for (const f of files) {
    try {
      const data = new Uint8Array(fs.readFileSync(dir + f));
      const doc = await pdfjs.getDocument({ data }).promise;
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map(it => it.str).join(' ');
        if (/lips|tongue|face|angioedema|7-1-2|transcript/i.test(text)) {
          console.log(`FOUND in ${f} p.${i}:`);
          console.log(text.slice(0, 300));
          console.log('---');
        }
      }
    } catch(e) {}
  }
}
search();
