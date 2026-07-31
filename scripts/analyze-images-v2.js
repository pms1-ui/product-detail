import sharp from 'sharp';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const files = [
  '1_메인이미지.jpeg',
  '2_방송중혜택및이벤트.jpeg',
  '3_톡딜혜택.jpeg',
  '4_상품한개예시.jpeg',
];

async function analyzeImage(filename) {
  const filepath = path.join(__dirname, filename);
  
  const metadata = await sharp(filepath).metadata();
  console.log(`\n=== ${filename} ===`);
  console.log(`  Original Size: ${metadata.width}x${metadata.height}`);
  
  // 리사이즈 (긴 변 기준 1000px 이내)
  const maxDim = 1000;
  let resizeOpts = {};
  if (metadata.width > metadata.height) {
    resizeOpts = { width: Math.min(metadata.width, maxDim) };
  } else {
    resizeOpts = { height: Math.min(metadata.height, maxDim) };
  }
  
  const resizedBuffer = await sharp(filepath)
    .resize(resizeOpts)
    .jpeg({ quality: 70 })
    .toBuffer();
  
  const base64 = resizedBuffer.toString('base64');
  const dataUrl = `data:image/jpeg;base64,${base64}`;
  
  console.log(`  Resized buffer size: ${(resizedBuffer.length / 1024).toFixed(1)}KB`);
  
  const response = await openai.chat.completions.create({
    model: 'gpt-5.5',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: '이 이미지를 자세히 분석해줘. 1) 전체 레이아웃/구조 2) 색상 톤 3) 텍스트 내용 (모든 글자를 정확히 읽어서 적어줘) 4) 디자인 스타일 5) 사이즈 비율. 한국어로 답변해줘.' },
          { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } }
        ]
      }
    ],
    max_completion_tokens: 2000
  });
  
  const analysis = response.choices[0].message.content;
  console.log(`  Analysis:\n${analysis}\n`);
  return { filename, width: metadata.width, height: metadata.height, analysis };
}

async function main() {
  const results = [];
  for (const file of files) {
    try {
      const result = await analyzeImage(file);
      results.push(result);
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  
  fs.writeFileSync(
    path.join(__dirname, 'image-analysis-v2.json'),
    JSON.stringify(results, null, 2)
  );
  console.log('\nDone! Saved to image-analysis-v2.json');
}

main().catch(console.error);
