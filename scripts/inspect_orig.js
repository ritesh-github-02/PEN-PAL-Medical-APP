const sharp = require('sharp');
const path = require('path');

const originalFiles = [
  'C:/Users/User/.gemini/antigravity/brain/d10e5fac-cdec-4813-be4d-ad8b6c6705d5/.user_uploaded/media_1793905979151_188c8e89.jpg', // school aged
  'C:/Users/User/.gemini/antigravity/brain/d10e5fac-cdec-4813-be4d-ad8b6c6705d5/.user_uploaded/media_1793906125875_e3535e41.jpg', // teen
  'C:/Users/User/.gemini/antigravity/brain/d10e5fac-cdec-4813-be4d-ad8b6c6705d5/.user_uploaded/media_1793906210889_8a84d837.jpg'  // adult
];

async function inspectOriginals() {
  for (const f of originalFiles) {
    const meta = await sharp(f).metadata();
    console.log(path.basename(f), `${meta.width}x${meta.height}`);
  }
}

inspectOriginals();
