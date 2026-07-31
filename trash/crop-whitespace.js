import sharp from 'sharp';

const input = 'final/03_talk_deal_2.png';
const output = 'final/03_talk_deal.jpg';

const { data, info } = await sharp(input).raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
console.log('Original:', width, 'x', height, 'ch:', channels);

// 상단 흰 여백 찾기
let topCrop = 0;
for (let y = 0; y < height; y++) {
  let isWhite = true;
  for (let x = 0; x < width; x += 10) {
    const idx = (y * width + x) * channels;
    if (data[idx] < 240 || data[idx+1] < 240 || data[idx+2] < 240) {
      isWhite = false;
      break;
    }
  }
  if (!isWhite) { topCrop = y; break; }
}

// 하단 흰 여백 찾기
let bottomCrop = height;
for (let y = height - 1; y >= 0; y--) {
  let isWhite = true;
  for (let x = 0; x < width; x += 10) {
    const idx = (y * width + x) * channels;
    if (data[idx] < 240 || data[idx+1] < 240 || data[idx+2] < 240) {
      isWhite = false;
      break;
    }
  }
  if (!isWhite) { bottomCrop = y + 1; break; }
}

console.log('Top white:', topCrop, 'px');
console.log('Bottom ends:', bottomCrop, 'px');
console.log('Content height:', bottomCrop - topCrop, 'px');

// crop하고 890px로 리사이즈
const contentHeight = bottomCrop - topCrop;
await sharp(input)
  .extract({ left: 0, top: topCrop, width: width, height: contentHeight })
  .resize({ width: 890 })
  .jpeg({ quality: 85 })
  .toFile(output);

const meta = await sharp(output).metadata();
console.log('Final:', meta.width + 'x' + meta.height);
