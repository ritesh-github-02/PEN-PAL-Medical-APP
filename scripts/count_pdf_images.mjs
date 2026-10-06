import fs from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

async function listAllImages() {
  const filePath = 'C:/Users/User/.gemini/antigravity-ide/brain/3618fc55-ef3f-48e9-9d0b-bd1a3193ae69/.user_uploaded/media_1790698073970.pdf';
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjs.getDocument({ data }).promise;
  console.log('Total pages:', doc.numPages);

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const ops = await page.getOperatorList();
    let imgCount = 0;
    for (let j = 0; j < ops.fnArray.length; j++) {
      if (ops.fnArray[j] === pdfjs.OPS.paintImageXObject) {
        imgCount++;
      }
    }
    console.log(`Page ${i}: ${imgCount} paintImageXObject ops`);
  }
}

listAllImages();
