import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const input = path.join(__dirname, 'final', '03_talk_deal_2_cropped.png');
const output = path.join(__dirname, 'final', '03_talk_deal_2_cropped_tmp.png');

const meta = await sharp(input).metadata();
console.log('Current:', meta.width + 'x' + meta.height);

// 위 3px, 아래 3px 추가 crop
const newHeight = meta.height - 6;
await sharp(input)
  .extract({ left: 0, top: 3, width: meta.width, height: newHeight })
  .png()
  .toFile(output);

const meta2 = await sharp(output).metadata();
console.log('Final:', meta2.width + 'x' + meta2.height);
