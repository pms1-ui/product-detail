import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const outputDir = path.join(__dirname, 'images');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// 이미지 생성 함수
async function generateImage(prompt, filename, size = '1024x1024') {
  console.log(`Generating: ${filename}...`);
  try {
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size,
    });
    
    // gpt-image-1 returns b64_json
    const imageData = response.data[0].b64_json;
    const buffer = Buffer.from(imageData, 'base64');
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, buffer);
    console.log(`  ✅ Saved: ${filepath}`);
    return filepath;
  } catch (err) {
    console.error(`  ❌ Error generating ${filename}:`, err.message);
    return null;
  }
}

// 1. 메인 비주얼
const prompts = [
  {
    prompt: "A modern Korean outdoor fashion brand promotional banner. Clean and stylish design with autumn/winter outdoor clothing collection theme. Brand name 'CHILDY' displayed prominently. Mountain and nature background with warm earth tones. Professional e-commerce banner style, 890px wide format, no text other than brand name.",
    filename: "01_main_visual.png",
    size: "1536x1024"
  },
  {
    prompt: "A bright yellow KakaoTalk channel friend-add button banner. Korean text '카카오톡 채널 친구추가' with a right arrow icon. KakaoTalk yellow (#FEE500) background, black text, clean flat design. Simple call-to-action banner style for e-commerce.",
    filename: "02_kakao_friend.png",
    size: "1536x1024"
  },
  {
    prompt: "Korean e-commerce live broadcast benefits information graphic. Title '방송 혜택' (Broadcast Benefits). Include gift box icons. Show promotional details: free socks with 30,000 KRW purchase, body bag giveaway for top 10 buyers over 50,000 KRW. Clean infographic style with outdoor/sports theme, dark navy and orange accent colors.",
    filename: "03_broadcast_benefits.png",
    size: "1024x1536"
  },
  {
    prompt: "Korean e-commerce 'Talk Deal' promotion benefits infographic. Title '톡딜 혜택'. Show coupon tiers: 5% off over 20,000 KRW, 5% off over 50,000 KRW, 7% off over 100,000 KRW. KakaoPay 7% discount. Free shipping badge. Clean modern design with warm colors, shopping cart icons, coupon graphics.",
    filename: "04_talk_deal.png",
    size: "1024x1536"
  },
];

// 상품 20개
const products = [
  { name: "에센셜 윈드브레이커", price: "89,000", color: "black wind jacket" },
  { name: "클래식 마운틴 후디", price: "79,000", color: "gray mountain hoodie" },
  { name: "울트라라이트 다운", price: "129,000", color: "navy lightweight down jacket" },
  { name: "트레킹 카고팬츠", price: "69,000", color: "khaki cargo hiking pants" },
  { name: "아웃도어 반팔티 화이트", price: "39,000", color: "white outdoor t-shirt" },
  { name: "파노라마 반팔티", price: "42,000", color: "olive green panorama t-shirt" },
  { name: "고어텍스 레인자켓", price: "159,000", color: "bright blue gore-tex rain jacket" },
  { name: "플리스 집업", price: "65,000", color: "cream fleece zip-up jacket" },
  { name: "스트레치 조거팬츠", price: "55,000", color: "charcoal stretch jogger pants" },
  { name: "바디백 블랙", price: "45,000", color: "black outdoor body bag crossbody" },
  { name: "메쉬 캡 블랙", price: "29,000", color: "black mesh outdoor cap" },
  { name: "트레일 러닝화", price: "119,000", color: "red and black trail running shoes" },
  { name: "UV 프로텍션 셔츠", price: "52,000", color: "light blue UV protection long sleeve" },
  { name: "컨버터블 팬츠", price: "72,000", color: "beige convertible zip-off pants" },
  { name: "소프트쉘 자켓", price: "98,000", color: "dark green softshell jacket" },
  { name: "쿨맥스 양말 3팩", price: "18,000", color: "multicolor coolmax hiking socks set" },
  { name: "경량 버킷햇", price: "32,000", color: "sand beige lightweight bucket hat" },
  { name: "방수 등산배낭 30L", price: "89,000", color: "orange waterproof hiking backpack" },
  { name: "기능성 이너웨어", price: "28,000", color: "white functional base layer top" },
  { name: "아웃도어 숏팬츠", price: "45,000", color: "navy outdoor short pants" },
];

for (let i = 0; i < products.length; i++) {
  const p = products[i];
  prompts.push({
    prompt: `Product thumbnail for Korean outdoor fashion e-commerce. Single ${p.color} displayed on clean white background. Professional product photography style, centered composition, soft shadow. No text, no watermark, no human model. Studio lighting, high quality product shot.`,
    filename: `product_${String(i + 1).padStart(2, '0')}.png`,
    size: "1024x1024"
  });
}

// 순차 실행
async function main() {
  console.log(`Total images to generate: ${prompts.length}`);
  console.log('---');
  
  for (const item of prompts) {
    await generateImage(item.prompt, item.filename, item.size);
    // rate limit 방지
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log('---');
  console.log('Done! All images saved to ./images/');
}

main().catch(console.error);
