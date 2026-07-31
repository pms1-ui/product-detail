import { readFileSync, writeFileSync, readdirSync } from 'fs';

// image 폴더의 파일 목록 읽기
const imageFiles = readdirSync('./image');

// 구성번호별 이미지 매핑
const imageMap = new Map(); // key: 구성번호(number), value: [파일명들]

for (const file of imageFiles) {
  // 파일명 패턴: "번호.스타일_컬러.ext" 또는 "번호-1.스타일_컬러.ext"
  const match = file.match(/^(\d+)(?:-(\d+))?\.(.+)$/);
  if (match) {
    const num = parseInt(match[1]);
    const subNum = match[2] ? parseInt(match[2]) : 0;
    
    if (!imageMap.has(num)) {
      imageMap.set(num, []);
    }
    imageMap.get(num).push({ file, subNum });
  }
}

// 정렬 (subNum 순서대로)
for (const [key, files] of imageMap) {
  files.sort((a, b) => a.subNum - b.subNum);
}

// HTML 읽기
let html = readFileSync('./index.html', 'utf-8');

// 각 구성별로 이미지 교체
for (let i = 1; i <= 89; i++) {
  const numStr = String(i).padStart(2, '0');
  const images = imageMap.get(i);
  
  if (!images || images.length === 0) {
    console.log(`⚠️  구성 ${numStr}: 이미지 없음`);
    continue;
  }

  let imgHtml;
  
  if (images.length === 1) {
    // 단일 이미지
    imgHtml = `<img src="image/${images[0].file}" style="max-width:100%; max-height:100%; object-fit:contain;">`;
  } else {
    // 2장 나란히
    imgHtml = images.map(img => 
      `<img src="image/${img.file}" style="max-width:48%; max-height:100%; object-fit:contain;">`
    ).join('\n');
  }

  // 해당 구성의 이미지 영역 찾아서 교체
  // 패턴: 구성 XX 뒤에 나오는 이미지 div
  const searchPattern = `구성 ${numStr}</span>
</div>
<div style="background:#f5f6f8; height:300px; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; justify-content:center;">
<img src="4_상품한개예시.jpeg" style="max-width:100%; max-height:100%; object-fit:contain;">`;

  const replacePattern = `구성 ${numStr}</span>
</div>
<div style="background:#f5f6f8; height:300px; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; justify-content:center;">
${imgHtml}`;

  if (html.includes(searchPattern)) {
    html = html.replace(searchPattern, replacePattern);
    console.log(`✅ 구성 ${numStr}: ${images.length}장 (${images.map(x => x.file).join(', ')})`);
  } else {
    console.log(`❌ 구성 ${numStr}: HTML에서 패턴 못 찾음`);
  }
}

writeFileSync('./index.html', html, 'utf-8');
console.log('\nDone!');
