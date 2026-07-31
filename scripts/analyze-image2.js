import sharp from 'sharp';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  const filepath = path.join(__dirname, '2_방송중혜택및이벤트.jpeg');
  
  // 890x2768 → 매우 긴 이미지. 상하 2등분해서 각각 분석
  const metadata = await sharp(filepath).metadata();
  console.log(`Original: ${metadata.width}x${metadata.height}`);
  
  const halfHeight = Math.floor(metadata.height / 2);
  
  // 상단 절반
  const topHalf = await sharp(filepath)
    .extract({ left: 0, top: 0, width: metadata.width, height: halfHeight })
    .resize({ width: 600 })
    .jpeg({ quality: 70 })
    .toBuffer();
  
  // 하단 절반
  const bottomHalf = await sharp(filepath)
    .extract({ left: 0, top: halfHeight, width: metadata.width, height: metadata.height - halfHeight })
    .resize({ width: 600 })
    .jpeg({ quality: 70 })
    .toBuffer();
  
  console.log(`Top half: ${(topHalf.length/1024).toFixed(1)}KB`);
  console.log(`Bottom half: ${(bottomHalf.length/1024).toFixed(1)}KB`);
  
  const topBase64 = `data:image/jpeg;base64,${topHalf.toString('base64')}`;
  const bottomBase64 = `data:image/jpeg;base64,${bottomHalf.toString('base64')}`;
  
  // 상단 분석
  console.log('\n=== 2_방송중혜택 (상단) ===');
  const topResponse = await openai.chat.completions.create({
    model: 'gpt-5.5',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: '이 이미지를 자세히 분석해줘. 모든 텍스트 내용을 정확히 읽어서 적어주고, 전체 레이아웃, 색상, 디자인 스타일을 설명해줘. 한국어로 답변해줘.' },
        { type: 'image_url', image_url: { url: topBase64, detail: 'high' } }
      ]
    }],
    max_completion_tokens: 2000
  });
  console.log(topResponse.choices[0].message.content);
  
  await new Promise(r => setTimeout(r, 2000));
  
  // 하단 분석
  console.log('\n=== 2_방송중혜택 (하단) ===');
  const bottomResponse = await openai.chat.completions.create({
    model: 'gpt-5.5',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: '이 이미지를 자세히 분석해줘. 모든 텍스트 내용을 정확히 읽어서 적어주고, 전체 레이아웃, 색상, 디자인 스타일을 설명해줘. 한국어로 답변해줘.' },
        { type: 'image_url', image_url: { url: bottomBase64, detail: 'high' } }
      ]
    }],
    max_completion_tokens: 2000
  });
  console.log(bottomResponse.choices[0].message.content);
  
  // 결과 저장
  fs.writeFileSync(path.join(__dirname, 'image2-analysis.json'), JSON.stringify({
    top: topResponse.choices[0].message.content,
    bottom: bottomResponse.choices[0].message.content
  }, null, 2));
  console.log('\nSaved to image2-analysis.json');
}

main().catch(console.error);
