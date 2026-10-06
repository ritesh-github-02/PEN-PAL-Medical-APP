const fs = require('fs');
const zlib = require('zlib');

function extractStreams(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const buf = fs.readFileSync(filePath);
  let idx = 0;
  let matches = [];
  while ((idx = buf.indexOf('stream', idx)) !== -1) {
    let start = idx + 6;
    if (buf[start] === 13 && buf[start+1] === 10) start += 2;
    else if (buf[start] === 10 || buf[start] === 13) start += 1;
    let end = buf.indexOf('endstream', start);
    if (end !== -1) {
      const slice = buf.subarray(start, end);
      try {
        const decomp = zlib.inflateSync(slice).toString('latin1');
        matches.push(decomp);
      } catch (e) {
        // Not deflated
      }
    }
    idx = end !== -1 ? end + 9 : idx + 6;
  }
  return matches;
}

const streams = extractStreams('C:/Users/User/.gemini/antigravity-ide/brain/3618fc55-ef3f-48e9-9d0b-bd1a3193ae69/.user_uploaded/media_1790698073970.pdf');
console.log('Streams found:', streams.length);
for (let i = 0; i < streams.length; i++) {
  const s = streams[i];
  if (/lip|face|tongue|swelling|rash|hives|blister/i.test(s)) {
    console.log(`Stream ${i} length ${s.length}:`);
    const clean = s.replace(/[^a-zA-Z0-9 .,?!/():-]/g, ' ').replace(/\s+/g, ' ');
    console.log(clean.slice(0, 300));
  }
}
