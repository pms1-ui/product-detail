import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const input = path.join(__dirname, 'final', '03_talk_deal_2.png');
  const output = path.join(__dirname, 'final', '03_talk_deal.jpg');

  // trim: 위아래 흰 부분 자동 제거
  await sharp(input)
    .trim({ background: '#ffffff', threshold: 20 })
    .resize({ width: 890 })
    .jpeg({ quality: 85 })
    .toFile(output);

  const meta = await sharp(output).metadata();
  console.log(`Done: 03_talk_deal.jpg → ${meta.width}x${meta.height}`);
}

main().catch(console.error);
