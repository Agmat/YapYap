import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false
  }
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audio = formData.get('audio');

    // Check if audio is a File and handle accordingly
    if (audio) {
      const filePath = path.join(process.cwd(), 'public', 'recordings', 'recording.wav');

      // Ensure the directory exists
      const directory = path.dirname(filePath);
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }

      // Write the file
      const fileStream = fs.createWriteStream(filePath);
      for await (const chunk of audio.stream()) {
        fileStream.write(chunk);
      }

      fileStream.end();
      return NextResponse.json({ message: 'Audio file saved', status: 200 });
    } else {
      return NextResponse.json({ error: 'No audio file provided', status: 400 });
    }
  } catch (error) {
    console.error('Error saving audio file:', error);
    return NextResponse.json({ error: 'Error saving audio file', status: 500 });
  }
}
