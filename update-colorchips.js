import XLSX from 'xlsx';
import { readFileSync, writeFileSync } from 'fs';

// 컬러코드 → 실제 색상 매핑
const colorMap = {
  BEI: '#d4b896',
  BGN: '#228B22',
  BLK: '#111111',
  BLU: '#2e6eb5',
  BRN: '#6b3a2a',
  CHC: '#4a4a4a',
  CRE: '#f5f0e8',
  DGN: '#2d5a3a',
  DGY: '#555555',
  DNY: '#1a2a4a',
  GRN: '#3a8a3a',
  GRY: '#999999',
  IVY: '#a8c090',
  KHA: '#6b6b40',
  LBE: '#e8d8c4',
  LBL: '#8ab8e0',
  LEM: '#f0e040',
  LGN: '#d0e3c7',
  LGY: '#bbbbbb',
  LIM: '#b8e040',
  LKH: '#9a9a6a',
  LPK: '#f5b0c0',
  LPU: '#c8a0d8',
  MIN: '#7ecbb8',
  MLG: '#c0d8b0',
  MUS: '#c8a030',
  MWH: '#f0ebe5',
  NVY: '#1a2050',
  OLI: '#6a7040',
  ORG: '#e87030',
  OTM: '#d8c0a0',
  OWH: '#fafaf5',
  PNK: '#e890a8',
  PUR: '#7a40a0',
  RBL: '#4070c0',
  SBL: '#5090c0',
  WHT: '#ffffff',
  YEL: '#f0d020',
};

// 엑셀 읽어서 구성별 컬러 순서 가져오기
const workbook = XLSX.readFile('./final/통합 문서1.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

const groups = [];
let currentGroup = null;
let lastStyleNum = null;

for (let i = 1; i < data.length; i++) {
  const row = data[i];
  const styleNum = row[1];
  const styleFull = row[2];
  const colorCode = styleFull ? styleFull.split('_').pop() : '';

  if (styleNum !== lastStyleNum) {
    currentGroup = { colors: [] };
    groups.push(currentGroup);
    lastStyleNum = styleNum;
  }

  if (currentGroup && colorCode && !currentGroup.colors.includes(colorCode)) {
    currentGroup.colors.push(colorCode);
  }
}

console.log(`Total groups: ${groups.length}`);

// HTML 읽기
let html = readFileSync('./index.html', 'utf-8');

// 각 구성별로 컬러칩 추가
for (let i = 0; i < groups.length; i++) {
  const numStr = String(i + 1).padStart(2, '0');
  const colors = groups[i].colors;
  
  // 컬러칩 HTML 생성
  const chips = colors.map(code => {
    const hex = colorMap[code] || '#cccccc';
    const border = (code === 'WHT' || code === 'OWH' || code === 'CRE' || code === 'MWH') 
      ? 'border:1px solid #ddd;' : '';
    return `<div style="width:18px; height:18px; border-radius:50%; background:${hex}; ${border}"></div>`;
  }).join('\n');

  const chipContainer = `<div style="position:absolute; top:10px; right:10px; display:flex; flex-direction:column; gap:5px; z-index:1;">
${chips}
</div>`;

  // 이미지 영역의 div를 찾아서 position:relative 추가 + 컬러칩 삽입
  // 패턴: 구성 XX 뒤에 나오는 이미지 div
  const searchStr = `구성 ${numStr}</span>
</div>
<div style="background:#f5f6f8; height:300px; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; justify-content:center;">`;

  const replaceStr = `구성 ${numStr}</span>
</div>
<div style="background:#f5f6f8; height:300px; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; justify-content:center; position:relative;">
${chipContainer}`;

  if (html.includes(searchStr)) {
    html = html.replace(searchStr, replaceStr);
    console.log(`✅ 구성 ${numStr}: ${colors.join(', ')}`);
  } else {
    console.log(`❌ 구성 ${numStr}: 패턴 못 찾음`);
  }
}

writeFileSync('./index.html', html, 'utf-8');
console.log('\nDone!');
