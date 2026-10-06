import fs from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

async function parsePdf(filePath) {
  if (!fs.existsSync(filePath)) return;
  console.log('====================================');
  console.log('PARSING:', filePath);
  try {
    const data = new Uint8Array(fs.readFileSync(filePath));
    const doc = await pdfjs.getDocument({ data }).promise;
    console.log('Total pages:', doc.numPages);
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map(item => item.str).join(' ').trim();
      if (text.length > 0) {
        console.log(`--- Page ${i} ---`);
        console.log(text.slice(0, 300));
        if (/swell/i.test(text)) {
          console.log('SWELLING MATCH on page', i, ':\n', text);
        }
      }
    }
  } catch (err) {
    console.error('Error reading', filePath, err.message);
  }
}

async function main() {
  await parsePdf('C:/Users/User/.gemini/antigravity-ide/brain/3618fc55-ef3f-48e9-9d0b-bd1a3193ae69/.user_uploaded/media_1790618916763.pdf');
  await parsePdf('C:/Users/User/.gemini/antigravity-ide/brain/3618fc55-ef3f-48e9-9d0b-bd1a3193ae69/.user_uploaded/media_1790621440924.pdf');
}

main();
