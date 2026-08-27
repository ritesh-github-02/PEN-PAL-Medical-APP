import fs from 'fs';
import path from 'path';
import { questionnaireConfig, QuestionnaireStep } from '../config/questionnaire';

/**
 * Builds the complete text script for a given questionnaire step.
 */
function buildScreenScript(step: QuestionnaireStep, locale: 'en' | 'es'): string {
  const parts: string[] = [];

  const title = locale === 'es' ? step.titleEs : step.titleEn;
  const description = locale === 'es' ? step.descriptionEs : step.descriptionEn;
  const content = locale === 'es' ? step.contentEs : step.contentEn;

  if (title) parts.push(title);
  if (description) parts.push(description);
  if (content) {
    // Clean markdown headings/bullets for audio speech
    const cleanContent = content
      .replace(/#\d+\.\s*/g, 'Step ')
      .replace(/•\s*/g, '')
      .replace(/\n+/g, '. ');
    parts.push(cleanContent);
  }

  if (step.options && step.options.length > 0) {
    const optionIntro = locale === 'es' ? 'Opciones:' : 'Options:';
    const optionLabels = step.options
      .map((opt, idx) => {
        const label = locale === 'es' ? opt.labelEs : opt.labelEn;
        return `${idx + 1}. ${label}`;
      })
      .join('. ');
    parts.push(`${optionIntro} ${optionLabels}`);
  }

  return parts.join('. ').replace(/\.\./g, '.');
}

/**
 * Downloads audio for text using Google Translate TTS API endpoint.
 */
async function fetchTtsAudioBuffer(text: string, lang: string): Promise<Buffer> {
  // Truncate text chunks to 200 chars max for Google TTS limit per chunk
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= 180) {
      chunks.push(remaining);
      break;
    }
    let sliceIdx = remaining.lastIndexOf('.', 180);
    if (sliceIdx === -1 || sliceIdx < 50) sliceIdx = remaining.lastIndexOf(' ', 180);
    if (sliceIdx === -1) sliceIdx = 180;

    chunks.push(remaining.slice(0, sliceIdx + 1).trim());
    remaining = remaining.slice(sliceIdx + 1).trim();
  }

  const buffers: Buffer[] = [];

  for (const chunk of chunks) {
    if (!chunk) continue;
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${lang}&client=tw-ob`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`TTS API error (${response.status}): ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    buffers.push(Buffer.from(arrayBuffer));
    
    // Slight pause between requests to prevent rate limiting
    await new Promise((res) => setTimeout(res, 200));
  }

  return Buffer.concat(buffers);
}

async function exportAllScreenAudio() {
  const outputDir = path.join(process.cwd(), 'public', 'audio', 'exported');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\n==================================================`);
  console.log(` Starting Screen-by-Screen Machine Audio Export `);
  console.log(` Target Directory: ${outputDir}`);
  console.log(`==================================================\n`);

  const manifest: Array<{
    stepId: string;
    screenIndex: number;
    locale: string;
    filename: string;
    text: string;
  }> = [];

  for (let i = 0; i < questionnaireConfig.length; i++) {
    const step = questionnaireConfig[i];
    const screenNum = i + 1;

    for (const locale of ['en', 'es'] as const) {
      const langCode = locale === 'es' ? 'es-US' : 'en-US';
      const textScript = buildScreenScript(step, locale);
      const filename = `${step.id}_${locale}.mp3`;
      const filePath = path.join(outputDir, filename);

      console.log(`[Screen ${screenNum}/${questionnaireConfig.length}] Generating ${locale.toUpperCase()} Audio (${filename})...`);
      console.log(`   Text: "${textScript.slice(0, 70)}..."`);

      try {
        const audioBuffer = await fetchTtsAudioBuffer(textScript, langCode);
        fs.writeFileSync(filePath, audioBuffer);
        console.log(`   ✓ Saved (${(audioBuffer.length / 1024).toFixed(1)} KB) -> ${filePath}\n`);

        manifest.push({
          stepId: step.id,
          screenIndex: screenNum,
          locale,
          filename,
          text: textScript
        });
      } catch (err: any) {
        console.error(`   ❌ Failed to generate audio for ${filename}:`, err.message);
      }
    }
  }

  // Write manifest index JSON
  const manifestPath = path.join(outputDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`==================================================`);
  console.log(` ✓ ALL ${manifest.length} SCREEN AUDIO FILES EXPORTED!`);
  console.log(` Manifest file written: ${manifestPath}`);
  console.log(`==================================================\n`);
}

exportAllScreenAudio().catch((err) => {
  console.error("Audio generation failed:", err);
});
