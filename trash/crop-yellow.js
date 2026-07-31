import sharp from 'sharp';

const input = 'final/03_talk_deal_2.png';
const output = 'final/03_talk_deal_2_cropped.png';

const { data, info } = await sharp(input).raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
console.log('Original:', width, 'x', height, 'ch:', channels);

// 노란색 감지: R>200, G>180, B<150 정도면 노란색 계열
function isYellowish(r, g, b) {
  return r > 180 && g > 150 && b < 150;
}

function isWhiteish(r, g, b) {
  return r > 245 && g > 245 && b > 245;
}

// 상단에서 첫 non-white 행 찾기
let topCrop = 0;
for (let y = 0; y < height; y++) {
  let nonWhiteCount = 0;
  for (let x = 0; x < width; x += 5) {
    const idx = (y * width + x) * channels;
    if (!isWhiteish(data[idx], data[idx+1], data[idx+2])) {
      nonWhiteCount++;
    }
  }
  // 행의 10% 이상이 non-white면 콘텐츠 시작
  if (nonWhiteCount > (width / 5) * 0.1) {
    topCrop = Math.max(0, y - 2);
    break;
  }
}

// 하단에서 첫 non-white 행 찾기
let bottomCrop = height;
for (let y = height - 1; y >= 0; y--) {
  let nonWhiteCount = 0;
  for (let x = 0; x < width; x += 5) {
    const idx = (y * width + x) * channels;
    if (!isWhiteish(data[idx], data[idx+1], data[idx+2])) {
      nonWhiteCount++;
    }
  }
  if (nonWhiteCount > (width / 5) * 0.1) {
    bottomCrop = Math.min(height, y + 3);
    break;
  }
}

console.log('Top crop at:', topCrop, 'px');
console.log('Bottom crop at:', bottomCrop, 'px');
console.log('Content height:', bottomCrop - topCrop, 'px');

const contentHeight = bottomCrop - topCrop;
await sharp(input)
  .extract({ left: 0, top: topCrop, width: width, height: contentHeight })
  .resize({ width: 890 })
  .png()
  .toFile(output);

const meta = await sharp(output).metadata();
console.log('Final:', meta.width + 'x' + meta.height);
