import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import { Uploadable } from 'openai/uploads.mjs';

const system_prompt =
  "You are a helpful translator. You've done this work since forever so you're really good at it. Your task is to translate the give text in portugese. Only add necessary punctuation such as periods and commas, and use only the context provided. Translate the text like you're speaking out loud";

export async function POST(request: NextRequest) {
  try {
    const openai = new OpenAI();
    const formData = await request.formData();
    const audio = formData.get('audio') as Uploadable;

    // Check if audio is a File and handle accordingly
    if (audio) {
      const transcription = await openai.audio.transcriptions.create({
        file: audio,
        model: 'whisper-1'
      });

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: system_prompt
          },
          {
            role: 'user',
            content: transcription.text
          }
        ],
        model: 'gpt-4'
      });
      return NextResponse.json({
        data: {
          transcription: transcription.text,
          translation: completion.choices[0].message.content
        },
        status: 200
      });
    } else {
      return NextResponse.json({ error: 'No audio file provided', status: 400 });
    }
  } catch (error) {
    console.error('Error saving audio file:', error);
    return NextResponse.json({ error: 'Error saving audio file', status: 500 });
  }
}
