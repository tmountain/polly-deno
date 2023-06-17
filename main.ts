import { SynthesizeSpeechCommandOutput } from "https://deno.land/x/aws_sdk@v3.32.0-1/client-polly/mod.ts";
import { PollyClient, SynthesizeSpeechCommand } from "./deps.ts";

const client = new PollyClient({ region: "us-east-1" });

const command = new SynthesizeSpeechCommand({
  OutputFormat: "mp3",
  Text: "Hello, world!",
  VoiceId: "Joanna",
});

client.send(command).then(async (response: SynthesizeSpeechCommandOutput) => {
  const audio: ReadableStream = response.AudioStream as ReadableStream;
  if (audio) {
    const reader = audio.getReader();

    // Create a Uint8Array to store the audio data
    const chunks: Uint8Array[] = [];

    // Read the audio data from the stream and store it in chunks
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }

    // Combine the audio chunks into a single Uint8Array
    const audioData = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    chunks.forEach((chunk) => {
      audioData.set(chunk, offset);
      offset += chunk.length;
    });

    // Save the audio data to an MP3 file
    const filePath = "output.mp3";
    Deno.writeFileSync(filePath, audioData);
    console.log(`Audio saved to ${filePath}`);
  }
});
