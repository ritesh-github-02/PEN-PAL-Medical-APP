import fs from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

function createBmp(width, height, rgbaBuffer) {
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;
  const bmp = Buffer.alloc(fileSize);

  // BMP Header
  bmp.write('BM', 0);
  bmp.writeUInt32LE(fileSize, 2);
  bmp.writeUInt32LE(54, 10); // offset

  // DIB Header (BITMAPINFOHEADER)
  bmp.writeUInt32LE(40, 14); // header size
  bmp.writeInt32LE(width, 18);
  bmp.writeInt32LE(height, 22); // bottom-up
  bmp.writeUInt16LE(1, 26); // planes
  bmp.writeUInt16LE(24, 28); // bits per pixel
  bmp.writeUInt32LE(0, 30); // compression
  bmp.writeUInt32LE(pixelArraySize, 34);

  for (let y = 0; y < height; y++) {
    const srcY = height - 1 - y;
    for (let x = 0; x < width; x++) {
      const srcIdx = (srcY * width + x) * (rgbaBuffer.length === width * height * 4 ? 4 : 3);
      const dstIdx = 54 + y * rowSize + x * 3;
      if (rgbaBuffer.length === width * height * 4) {
        bmp[dstIdx] = rgbaBuffer[srcIdx + 2];     // B
        bmp[dstIdx + 1] = rgbaBuffer[srcIdx + 1]; // G
        bmp[dstIdx + 2] = rgbaBuffer[srcIdx];     // R
      } else {
        bmp[dstIdx] = rgbaBuffer[srcIdx + 2];
        bmp[dstIdx + 1] = rgbaBuffer[srcIdx + 1];
        bmp[dstIdx + 2] = rgbaBuffer[srcIdx];
      }
    }
  }
  return bmp;
}

async function extractImagesFromPdf(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjs.getDocument({ data }).promise;
  console.log('Total pages:', doc.numPages);
  
  if (!fs.existsSync('scripts/pdf_images')) {
    fs.mkdirSync('scripts/pdf_images', { recursive: true });
  }

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const ops = await page.getOperatorList();
    for (let j = 0; j < ops.fnArray.length; j++) {
      if (ops.fnArray[j] === pdfjs.OPS.paintImageXObject) {
        const objId = ops.argsArray[j][0];
        try {
          const img = await new Promise((resolve) => {
            page.objs.get(objId, (image) => resolve(image));
          });
          if (img && img.data && img.width > 200) {
            console.log(`Page ${i} Image: ${img.width}x${img.height}`);
            const bmp = createBmp(img.width, img.height, img.data);
            fs.writeFileSync(`scripts/pdf_images/page_${i}.bmp`, bmp);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
  console.log('Done extracting images.');
}

extractImagesFromPdf('Pen-pal structure threme.pdf');
