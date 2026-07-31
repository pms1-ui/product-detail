import XLSX from 'xlsx';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const workbook = XLSX.readFile('./final/통합 문서1.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// 품번별 그룹핑 (순서대로)
const groups = [];
let lastStyleNum = null;

for (let i = 1; i < data.length; i++) {
  const row = data[i];
  const styleNum = row[1];

  if (styleNum !== lastStyleNum) {
    groups.push(styleNum);
    lastStyleNum = styleNum;
  }
}

console.log(`Total groups: ${groups.length}`);

// html 폴더 생성
mkdirSync('./html', { recursive: true });

// 각 품번별 빈 HTML 생성
for (const styleNum of groups) {
  const htmlContent = `<html>
<head><meta charset="utf-8"><title>${styleNum}</title></head>
<body>
</body>
</html>`;
  writeFileSync(`./html/${styleNum}.html`, htmlContent, 'utf-8');
}

console.log(`${groups.length}개 HTML 파일 생성 완료`);

// index.html에서 각 구성의 링크를 품번.html로 변경
let html = readFileSync('./index.html', 'utf-8');

for (let i = 0; i < groups.length; i++) {
  const numStr = String(i + 1).padStart(2, '0');
  const styleNum = groups[i];
  
  const oldHref = `href="https://your-hosting.com/detail/product${numStr}.html"`;
  const newHref = `href="https://img.childy.kr/img/outdoor2026/promotion/kakao/${styleNum}.html"`;
  
  if (html.includes(oldHref)) {
    html = html.replace(oldHref, newHref);
    console.log(`✅ 구성 ${numStr}: ${styleNum}.html`);
  } else {
    console.log(`❌ 구성 ${numStr}: 링크 못 찾음`);
  }
}

writeFileSync('./index.html', html, 'utf-8');
console.log('\nDone!');
