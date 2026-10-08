const sharp = require('sharp');

async function test() {
  const width = 600;
  const height = 385;

  const bubbleW = 460;
  const bubbleH = Math.round(bubbleW * (260 / 430)); // 278

  const svg = `<svg width="${bubbleW}" height="${bubbleH}" viewBox="0 0 430 260" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M 213, 8
         C 317, 8  404, 56  404, 120
         C 404, 146  392, 172  372, 186
         C 388, 198  412, 212  432, 224
         C 398, 228  362, 226  328, 222
         C 292, 230  254, 236  213, 236
         C 109, 236  28, 184  28, 120
         C 28, 56  109, 8  213, 8
         Z"
      fill="#ffffff"
      stroke="#27707e"
      stroke-width="2.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <text x="200" y="78" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#142724" text-anchor="middle">
      <tspan x="200" dy="0">Amoxicillin is one of the best</tspan>
      <tspan x="200" dy="24">antibiotics. But many kids do</tspan>
      <tspan x="200" dy="24">not get it because they are</tspan>
      <tspan x="200" dy="24">believed to be allergic to it.</tspan>
    </text>
  </svg>`;
  const bubbleBuf = await sharp(Buffer.from(svg)).toBuffer();

  const nurseW = 125;
  const nurseH = Math.round(nurseW * (766 / 386)); // 248
  const nurseBuf = await sharp('public/images/nurse-anna.png')
    .resize(nurseW, nurseH)
    .toBuffer();

  const nurseTop = height - nurseH; // 385 - 248 = 137
  const nurseLeft = 442;

  await sharp({
    create: {
      width: 600,
      height: 385,
      channels: 4,
      background: { r: 244, g: 248, b: 236, alpha: 1 }
    }
  })
  .composite([
    { input: nurseBuf, top: nurseTop, left: nurseLeft },
    { input: bubbleBuf, top: 0, left: 0 }
  ])
  .png()
  .toFile('scripts/test_breathing_space2.png');

  console.log('Saved scripts/test_breathing_space2.png');
}

test();
