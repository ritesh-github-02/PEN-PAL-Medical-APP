import fs from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

function createBmp(width, height, rgbaBuffer) {
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;
  const bmp = Buffer.alloc(fileSize);

  bmp.write('BM', 0);
  bmp.writeUInt32LE(fileSize, 2);
  bmp.writeUInt32LE(54, 10);
  bmp.writeUInt32LE(40, 14);
  bmp.writeInt32LE(width, 18);
  bmp.writeInt32LE(height, 22);
  bmp.writeUInt16LE(1, 26);
  bmp.writeUInt16LE(24, 28);
  bmp.writeUInt32LE(0, 30);
  bmp.writeUInt32LE(pixelArraySize, 34);

  const channels = rgbaBuffer.length === width * height * 4 ? 4 : 3;
  for (let y = 0; y < height; y++) {
    const srcY = height - 1 - y;
    for (let x = 0; x < width; x++) {
      const srcIdx = (srcY * width + x) * channels;
      const dstIdx = 54 + y * rowSize + x * 3;
      bmp[dstIdx] = rgbaBuffer[srcIdx + 2];     // B
      bmp[dstIdx + 1] = rgbaBuffer[srcIdx + 1]; // G
      bmp[dstIdx + 2] = rgbaBuffer[srcIdx];     // R
    }
  }
  return bmp;
}

async function run() {
  const filePath = 'C:/Users/User/.gemini/antigravity-ide/brain/3618fc55-ef3f-48e9-9d0b-bd1a3193ae69/.user_uploaded/media_1790698073970.pdf';
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjs.getDocument({ data }).promise;

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const ops = await page.getOperatorList();
    let imgIdx = 0;
    for (let j = 0; j < ops.fnArray.length; j++) {
      if (ops.fnArray[j] === pdfjs.OPS.paintImageXObject) {
        const objId = ops.argsArray[j][0];
        try {
          const img = await new Promise((resolve) => page.objs.get(objId, resolve));
          if (img && img.data && img.width > 200) {
            imgIdx++;
            const bmp = createBmp(img.width, img.height, img.data);
            fs.writeFileSync(`scripts/pdf_spec_pages/p${i}_${imgIdx}.bmp`, bmp);
            console.log(`Saved p${i}_${imgIdx}.bmp (${img.width}x${img.height})`);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
  console.log('Finished.');
}

run();
