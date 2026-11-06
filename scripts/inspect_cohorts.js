const sharp = require('sharp');
const path = require('path');

const files = ['baby.png', 'toddler.png', 'school-aged.png', 'teen.png', 'adult.png'];

async function inspect() {
  for (const f of files) {
    const filePath = path.join('public/images/cohorts', f);
    const img = sharp(filePath);
    const meta = await img.metadata();
    
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    let minX = info.width, maxX = 0, minY = info.height, maxY = 0;
    
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const idx = (y * info.width + x) * info.channels;
        const alpha = info.channels === 4 ? data[idx + 3] : 255;
        if (alpha > 10) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    
    const contentWidth = maxX - minX + 1;
    const contentHeight = maxY - minY + 1;
    
    console.log(`\n--- ${f} ---`);
    console.log(`Image size: ${meta.width} x ${meta.height}`);
    console.log(`Content bbox: x=[${minX}, ${maxX}] (${contentWidth}px), y=[${minY}, ${maxY}] (${contentHeight}px)`);
    console.log(`Top padding: ${minY}px, Bottom padding: ${meta.height - 1 - maxY}px`);
  }
}

inspect().catch(console.error);
