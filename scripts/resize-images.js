import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const outputDir = path.join(__dirname, 'final');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

async function main() {
  // 생성된 이미지들을 890px 폭으로 리사이즈
  const generatedFiles = [
    { src: 'generated/01_main_visual.png', out: '01_main_visual.jpg' },
    { src: 'generated/02_broadcast_benefits.png', out: '02_broadcast_benefits.jpg' },
    { src: 'generated/03_talk_deal.png', out: '03_talk_deal.jpg' },
  ];

  for (const file of generatedFiles) {
    const srcPath = path.join(__dirname, file.src);
    const outPath = path.join(outputDir, file.out);
    
    await sharp(srcPath)
      .resize({ width: 890 })
      .jpeg({ quality: 85 })
      .toFile(outPath);
    
    const meta = await sharp(outPath).metadata();
    console.log(`${file.out}: ${meta.width}x${meta.height}`);
  }

  // 1-2 톡채널 이미지는 원본 그대로 복사
  const kakaoSrc = path.join(__dirname, '1-2_톡채널친구추가바로가기.jpeg');
  const kakaoDst = path.join(outputDir, '01-2_kakao_friend.jpg');
  fs.copyFileSync(kakaoSrc, kakaoDst);
  console.log('01-2_kakao_friend.jpg: copied (890x148)');
  
  console.log('\nAll final images ready in ./final/');
}

main().catch(console.error);
