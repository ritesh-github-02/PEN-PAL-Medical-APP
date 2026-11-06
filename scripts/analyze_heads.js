const sharp = require('sharp');
const path = require('path');

// Let's examine school-aged vs toddler, teen, adult
async function analyze() {
  // Let's crop school-aged head or measure its width across shoulders / head
  const files = ['baby.png', 'toddler.png', 'school-aged.png', 'teen.png', 'adult.png'];
  
  for (const f of files) {
    const filePath = path.join('public/images/cohorts', f);
    const img = sharp(filePath);
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    
    // Find width at 25% from top of content, 50% from top, etc.
    console.log(`Analyzing ${f}:`);
  }
}

analyze();
