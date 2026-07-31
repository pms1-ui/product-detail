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
  '1-2_톡채널친구추가바로가기.jpeg',
  '2_방송중혜택및이벤트.jpeg',
  '3_톡딜혜택.jpeg',
  '4_상품한개예시.jpeg',
];

async function analyzeImage(filename) {
  const filepath = path.join(__dirname, filename);
  
  // 메타데이터
  const metadata = await sharp(filepath).metadata();
  console.log(`\n=== ${filename} ===`);
  console.log(`  Size: ${metadata.width}x${metadata.height}, Format: ${metadata.format}`);
  
  // OpenAI Vision으로 내용 분석
  const imageBuffer = fs.readFileSync(filepath);
  const base64 = imageBuffer.toString('base64');
  const dataUrl = `data:image/jpeg;base64,${base64}`;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-5.5',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: '이 이미지를 자세히 분석해줘. 1) 전체 레이아웃/구조 2) 색상 톤 3) 텍스트 내용 4) 디자인 스타일 5) 사이즈 비율. 한국어로 답변해줘.' },
          { type: 'image_url', image_url: { url: dataUrl } }
        ]
      }
    ],
    max_completion_tokens: 1000
  });
  
  console.log(`  Analysis:\n${response.choices[0].message.content}`);
  return { filename, metadata, analysis: response.choices[0].message.content };
}

async function main() {
  const results = [];
  for (const file of files) {
    const result = await analyzeImage(file);
    results.push(result);
    await new Promise(r => setTimeout(r, 1000));
  }
  
  // 결과 저장
  fs.writeFileSync(
    path.join(__dirname, 'image-analysis.json'),
    JSON.stringify(results, null, 2)
  );
  console.log('\n\nAnalysis saved to image-analysis.json');
}

main().catch(console.error);
