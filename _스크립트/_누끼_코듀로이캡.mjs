// 코듀로이 캠프캡 모델컷 2장 배경 제거(누끼) — 밝은 회색 배경 → 투명
// 결과: 사은품 폴더에 *_누끼.png 로 저장
import sharp from 'sharp';
import { resolve } from 'path';

const DIR = resolve('_작업소스/260911/누끼컷&사은품/사은품');
const targets = ['코듀로이 캠프캡1.jpg', '코듀로이 캠프캡2.jpg'];

// 밝은 배경 임계값: 픽셀이 충분히 밝고 무채색에 가까우면 투명 처리
const THRESH = 236; // 이 값 이상(밝기)이면 배경으로 간주

for (const name of targets) {
  const src = resolve(DIR, name);
  const out = resolve(DIR, name.replace(/\.jpg$/i, '_누끼.png'));

  const img = sharp(src);
  const { width, height } = await img.metadata();
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels; // 4

  // flood-fill from edges: 배경(밝은 무채색)만 투명화 (내부 밝은 옷/얼굴 보호)
  const W = info.width, H = info.height;
  const visited = new Uint8Array(W * H);
  const stack = [];
  const isBg = (i) => {
    const r = data[i], g = data[i+1], b = data[i+2];
    const mx = Math.max(r,g,b), mn = Math.min(r,g,b);
    return mx >= THRESH && (mx - mn) <= 18; // 밝고 무채색
  };
  // 테두리 픽셀 시드
  for (let x = 0; x < W; x++) { stack.push([x,0]); stack.push([x,H-1]); }
  for (let y = 0; y < H; y++) { stack.push([0,y]); stack.push([W-1,y]); }
  while (stack.length) {
    const [x,y] = stack.pop();
    if (x<0||y<0||x>=W||y>=H) continue;
    const p = y*W+x;
    if (visited[p]) continue;
    const i = p*ch;
    if (!isBg(i)) continue;
    visited[p] = 1;
    data[i+3] = 0; // 투명
    stack.push([x+1,y]); stack.push([x-1,y]); stack.push([x,y+1]); stack.push([x,y-1]);
  }

  await sharp(data, { raw: { width: W, height: H, channels: ch } })
    .png()
    .toFile(out);
  console.log('✅ 누끼:', out.split('/').pop());
}
console.log('완료');
