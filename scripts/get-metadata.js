import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = [
  '1_메인이미지.jpeg',
  '1-2_톡채널친구추가바로가기.jpeg',
  '2_방송중혜택및이벤트.jpeg',
  '3_톡딜혜택.jpeg',
  '4_상품한개예시.jpeg',
];

async function main() {
  for (const file of files) {
    const filepath = path.join(__dirname, file);
    const metadata = await sharp(filepath).metadata();
    console.log(`${file}: ${metadata.width}x${metadata.height} (${metadata.format})`);
  }
}

main().catch(console.error);
