import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  const audioDir = path.join(process.cwd(), 'public', 'audio', 'exported');
  const manifestPath = path.join(audioDir, 'manifest.json');

  if (!fs.existsSync(audioDir) || !fs.existsSync(manifestPath)) {
    return NextResponse.json(
      { error: 'Audio files not generated yet. Please run the audio export script.' },
      { status: 404 }
    );
  }

  // Return manifest index list of all screen audio files
  if (action === 'list' || !action) {
    try {
      const manifestRaw = fs.readFileSync(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestRaw);

      const fileList = manifest.map((item: any) => ({
        ...item,
        downloadUrl: `/audio/exported/${item.filename}`
      }));

      return NextResponse.json({
        success: true,
        totalFiles: fileList.length,
        outputFolder: 'public/audio/exported/',
        files: fileList
      });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  // Download specific single audio file
  const fileParam = searchParams.get('file');
  if (fileParam) {
    const safeFilename = path.basename(fileParam);
    const targetFile = path.join(audioDir, safeFilename);

    if (!fs.existsSync(targetFile)) {
      return NextResponse.json({ error: 'Audio file not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(targetFile);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${safeFilename}"`
      }
    });
  }

  return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
}
