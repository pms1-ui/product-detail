import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testGenerate() {
  console.log('Testing gpt-image-1...');
  try {
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: 'A simple blue circle on white background',
      n: 1,
      size: '1024x1024',
    });
    console.log('✅ gpt-image-1 works! Response type:', response.data[0].b64_json ? 'b64_json' : 'url');
    
    if (response.data[0].b64_json) {
      const buffer = Buffer.from(response.data[0].b64_json, 'base64');
      fs.writeFileSync(path.join(__dirname, 'test_output.png'), buffer);
      console.log('  Saved test_output.png');
    }
  } catch (err) {
    console.error('❌ gpt-image-1 failed:', err.message);
  }
}

testGenerate().catch(console.error);
