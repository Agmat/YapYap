'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

export default function Home() {
  const [recording, setRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('Media Devices API or getUserMedia not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');
        try {
          const response = await fetch('/api/audio', {
            method: 'POST',
            body: formData
          });
          if (response.ok) {
            console.log('Audio file saved');
          } else {
            console.error('Failed to save the audio file');
          }
        } catch (error) {
          console.error('Error while sending the audio file:', error);
        }
        audioChunks.current = [];
      };

      mediaRecorder.current.start();
      setRecording(true);
    } catch (error) {
      console.error('Error accessing the microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
      setRecording(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div>
        <button
          className="bg-accent flex h-[90px] w-[90px] items-center justify-center rounded-full transition duration-150 hover:opacity-50"
          onClick={recording ? stopRecording : startRecording}
        >
          <Image src="/microphone.svg" alt="microphone" width={50} height={50} />
        </button>
      </div>
      {recording && <p>Recording...</p>}
    </main>
  );
}
