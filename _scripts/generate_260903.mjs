import XLSX from 'xlsx';
import { resolve, extname } from 'path';
import { writeFileSync, readdirSync } from 'fs';

// === 엑셀 파싱 ===
const wb = XLSX.readFile(resolve('01_data/260903/260903_data.xlsx'));
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

// 구성별 그룹핑
const groups = {};
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r || !r[0]) continue;
  const seq = r[0];
  if (!groups[seq]) {
    groups[seq] = {
      seq,
      model: r[3],
      name: r[5],
      tagPrice: r[6],
      dealPrice: r[7],
      benefitPrice: r[8],
      discountRate: r[9],
      colors: []
    };
  }
  const fullCode = r[4] || '';
  const colorCode = fullCode.split('_').pop();
  groups[seq].colors.push(colorCode);
}
const items = Object.values(groups);

// === 컬러코드 → HEX 매핑 (컬러칩용) ===
const COLOR_MAP = {
  BEI: '#d4b896', BGN: '#2e8b8b', BLK: '#111111', BLU: '#2e6eb5',
  BRN: '#6b3a2a', BUG: '#5E192B', CHC: '#4a4a4a', CML: '#A36953',
  CRE: '#f5f0e8', DBE: '#B58F64', DGN: '#2d5a3a', DGY: '#555555',
  DNY: '#1a2a4a', GRN: '#3a8a3a', GRY: '#999999', IVY: '#f5f0e0',
  KHA: '#6b6b40', LBE: '#e8d8c4', LBL: '#8ab8e0', LEM: '#f0e040',
  LGN: '#80c870', LGY: '#bbbbbb', LIM: '#b8e040', LKH: '#9a9a6a',
  LPK: '#f5b0c0', LPU: '#c8a0d8', MIN: '#7ecbb8', MLG: '#c8c8c8',
  MUS: '#c8a030', MWH: '#f0ebe5', NVY: '#1a2050', OLI: '#6a7040',
  ORG: '#e87030', OTM: '#d8c0a0', OWH: '#fafaf5', PNK: '#e890a8',
  PUR: '#7a40a0', RBL: '#4070c0', SBL: '#5090c0', WHT: '#ffffff',
  YEL: '#f0d020'
};
// 밝은 색상 (border 필요)
const LIGHT_COLORS = new Set(['CRE', 'IVY', 'LBE', 'MWH', 'OWH', 'WHT']);

// === 이미지 파일 매핑 ===
const imageDir = resolve('02_source/260903/image');
const imageFiles = readdirSync(imageDir).filter(f => !f.startsWith('.') && f !== '사은품');

// 이미지 파일을 순서번호로 매핑
function findImages(seq) {
  const prefix = `${seq}.`;
  const subPrefix = `${seq}-1.`;
  const main = imageFiles.find(f => f.startsWith(prefix) && !f.startsWith(subPrefix));
  const sub = imageFiles.find(f => f.startsWith(subPrefix));
  return { main, sub };
}

// === 가격 포맷 ===
function formatPrice(n) {
  return Number(n).toLocaleString('ko-KR') + '원';
}

// === 카드 HTML 생성 ===
function generateCard(item) {
  const seq = String(item.seq).padStart(2, '0');
  const dr = Math.round((1 - item.benefitPrice / item.tagPrice) * 100);
  const { main, sub } = findImages(item.seq);
  const colorStr = item.colors.join(', ');
  
  // 혜택가 == 톡딜가인 경우 (양말 등) → 혜택가 행 생략
  const showBenefit = item.benefitPrice !== item.dealPrice;
  
  // OD263 신상품 마크
  const isNew = item.model.startsWith('OD263');
  const newBadge = isNew ? `<div style="position:absolute; top:10px; left:10px; background:#e80000; color:#fff; font-size:16px; font-weight:800; padding:5px 12px; border-radius:6px; z-index:2;">NEW</div>` : '';
  
  // 컬러칩 생성
  const colorChips = item.colors.map(code => {
    const hex = COLOR_MAP[code] || '#cccccc';
    const border = LIGHT_COLORS.has(code) ? ' border:1px solid #ddd;' : '';
    return `<div style="width:18px; height:18px; border-radius:50%; background:${hex};${border}"></div>`;
  }).join('\n');
  const colorChipHtml = colorChips ? `<div style="position:absolute; top:10px; right:10px; display:flex; flex-direction:column; gap:5px; z-index:1;">\n${colorChips}\n</div>` : '';
  
  // 이미지 경로 (로컬 상대 경로)
  const imgBase = 'image/';
  let imgHtml = '';
  if (main && sub) {
    imgHtml = `<img src="${imgBase}${main}" style="max-width:48%; max-height:100%; object-fit:contain;">
<img src="${imgBase}${sub}" style="max-width:48%; max-height:100%; object-fit:contain;">`;
  } else if (main) {
    imgHtml = `<img src="${imgBase}${main}" style="max-width:100%; max-height:100%; object-fit:contain;">`;
  }

  // 가격 영역
  let priceHtml = `<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;"><div><span style="display:inline-block; background:#9ca3af; color:#fff; font-size:18px; font-weight:700; padding:6px 12px; border-radius:6px; margin-right:10px; vertical-align:middle;">정상가</span><span style="font-family:Pretendard,sans-serif; font-size:26px; color:#8e939d; text-decoration:line-through; vertical-align:middle;">${formatPrice(item.tagPrice)}</span></div><span style="font-family:Pretendard,sans-serif; font-size:40px; font-weight:800; color:#e80000;">${dr}%</span></div>`;
  priceHtml += `<div style="display:flex; align-items:center; margin-bottom:8px;"><span style="display:inline-block; background:#1e3a8a; color:#fff; font-size:18px; font-weight:700; padding:6px 12px; border-radius:6px; margin-right:10px; vertical-align:middle;">톡딜가</span><span style="font-family:Pretendard,sans-serif; font-size:30px; font-weight:800; color:#1e3a8a; vertical-align:middle;">${formatPrice(item.dealPrice)}</span></div>`;
  if (showBenefit) {
    priceHtml += `<div style="display:flex; align-items:center; margin-bottom:8px;"><span style="display:inline-block; background:#dc2626; color:#fff; font-size:18px; font-weight:700; padding:6px 12px; border-radius:6px; margin-right:10px; vertical-align:middle;">혜택가</span><span style="font-family:Pretendard,sans-serif; font-size:33px; font-weight:800; color:#dc2626; vertical-align:middle;">${formatPrice(item.benefitPrice)}</span></div>`;
  }

  return `<td style="width:445px; padding:4px; vertical-align:top;">
<a href="https://img.childy.kr/img/outdoor2026/promotion/2609_kakaotalk_deal/kakao_detail/${item.seq}_${item.model}.html" style="text-decoration:none; color:inherit;">
<div style="width:100%; background:#fff; border-radius:20px; overflow:hidden; border:1px solid #e5e7eb;">
<div style="background:#1e3a8a; padding:26px 0; text-align:center;">
<span style="font-family:Pretendard,sans-serif; font-size:36px; font-weight:800; color:#fff;">구성 ${seq}</span>
</div>
<div style="background:#f5f6f8; height:300px; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; justify-content:center; position:relative;">
${newBadge}
${colorChipHtml}
${imgHtml}
</div>
<div style="padding:28px;">
<p style="font-family:Pretendard,sans-serif; font-size:29px; font-weight:800; color:#111827; margin:0 0 6px 0; line-height:1.3;">${item.name}</p>
<p style="font-family:Pretendard,sans-serif; font-size:22px; color:#8e939d; margin:0 0 18px 0;">${colorStr}</p>
<div style="border-top:1px solid #e5e7eb; padding-top:14px;">
${priceHtml}
</div>
</div>
</div>
</a>
</td>`;
}

// === 전체 HTML 생성 ===
let cardsHtml = '';
for (let i = 0; i < items.length; i += 2) {
  const left = generateCard(items[i]);
  const right = items[i + 1] ? generateCard(items[i + 1]) : '<td style="width:445px; padding:4px; vertical-align:top;"></td>';
  cardsHtml += `<tr>\n${left}\n${right}\n</tr>\n`;
}

// === 상품 카드 영역만 생성하여 기존 작업용.html의 카드 부분 교체 ===
import { readFileSync } from 'fs';

const existingHtml = readFileSync(resolve('02_source/260903/작업용.html'), 'utf-8');

// 상품 리스트 테이블 부분 찾아서 교체
const tableStart = existingHtml.indexOf('<!-- ===== 상품 리스트');
const tableEnd = existingHtml.indexOf('</center>');

if (tableStart === -1 || tableEnd === -1) {
  console.error('❌ 상품 리스트 영역을 찾을 수 없습니다.');
  process.exit(1);
}

const before = existingHtml.substring(0, tableStart);
const newTable = `<!-- ===== 상품 리스트 (${items.length}개) ===== -->
<table style="width:890px; border-spacing:0; border-collapse:collapse; margin:0 auto;">
<tbody>
${cardsHtml}
</tbody>
</table>
</center>
`;

writeFileSync(resolve('02_source/260903/작업용.html'), before + newTable, 'utf-8');
console.log(`✅ 260903 작업용.html 카드 영역 재생성 완료 (${items.length}개 구성, OD263 NEW 마크 적용)`);

