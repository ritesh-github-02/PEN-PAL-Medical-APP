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
      console.log(`--- Page ${i} (length ${text.length}) ---`);
      if (text.length > 0) {
        console.log(text);
      }
    }
  } catch (err) {
    console.error('Error reading', filePath, err.message);
  }
}

parsePdf('Pen-pal structure threme.pdf');
