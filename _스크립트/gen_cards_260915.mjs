// 260911 카드(상품리스트) 영역만 재생성 → 작업용.html의 상품 table만 교체
// 상단 공통영역(메인비주얼/사은품/톡딜혜택)의 수동수정분은 보존한다.
// 새 엑셀: 상품데이터_260915.xlsx (시트 상품리스트)
// 컬럼: 순서0 품번1 모델_컬러2 색상3 복종4 품명5 택가6 톡딜가7 최종가8 할인율9 비고10 썸네일11
import XLSX from 'xlsx';
import { resolve } from 'path';
import { writeFileSync, readFileSync, readdirSync } from 'fs';

const SERVER = '2609_2_kakaotalk_deal';
const S3 = `https://img.childy.kr/img/outdoor2026/promotion/${SERVER}`;
const SRC = '_작업소스/260911';

// === 엑셀 파싱 ===
const wb = XLSX.readFile(resolve(SRC, '데이터/상품데이터_260915.xlsx'));
const ws = wb.Sheets['상품리스트'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }).slice(1).filter(r => r.some(c => c !== ''));

const groups = {};
for (const r of rows) {
  const code = String(r[1]).trim();
  if (!groups[code]) {
    groups[code] = {
      seq: Number(r[0]), code,
      name: String(r[5]).trim(),
      tag: Number(r[6]), deal: Number(r[7]), final: Number(r[8]),
      bigo: String(r[10]).trim(),
      colors: [], thumbColor: null,
    };
  }
  const color = String(r[3]).trim();
  groups[code].colors.push(color);
  if (String(r[11]).trim().toUpperCase() === 'Y') groups[code].thumbColor = color;
}
const items = Object.values(groups).sort((a, b) => a.seq - b.seq);
console.log('구성 개수:', items.length);

// === 컬러코드 → HEX ===
const COLOR_MAP = {
  BEI: '#d4b896', BGN: '#2e8b8b', BLK: '#111111', BLU: '#2e6eb5',
  BRN: '#6b3a2a', BUG: '#5E192B', CHC: '#4a4a4a', CML: '#A36953',
  CRE: '#f5f0e8', DBE: '#B58F64', DGN: '#2d5a3a', DGY: '#555555',
  DNY: '#1a2a4a', GRN: '#3a8a3a', GRY: '#999999', IVY: '#f5f0e0',
  KHA: '#6b6b40', LBE: '#e8d8c4', LBL: '#8ab8e0', LEM: '#f0e040',
  LGN: '#EEF2D5', LGY: '#bbbbbb', LIM: '#E6F2AC', LKH: '#9a9a6a',
  LPK: '#f5b0c0', LPU: '#c8a0d8', MIN: '#7ecbb8', MLG: '#c8c8c8',
  MUS: '#c8a030', MWH: '#f0ebe5', NVY: '#1a2050', OLI: '#6a7040',
  ORG: '#e87030', OTM: '#d8c0a0', OWH: '#fafaf5', PNK: '#e890a8',
  PUR: '#7a40a0', RBL: '#4070c0', SBL: '#5090c0', WHT: '#ffffff',
  YEL: '#f0d020'
};
const LIGHT_COLORS = new Set(['CRE', 'IVY', 'LBE', 'LGN', 'LGY', 'LIM', 'MWH', 'OWH', 'WHT']);

const allColors = new Set(items.flatMap(i => i.colors));
const missing = [...allColors].filter(c => !COLOR_MAP[c]);
if (missing.length) console.log('⚠️ 컬러맵 누락:', missing.join(', '));

// === 이미지 매핑 ===
const imageDir = resolve(SRC, '상품이미지');
const imageFiles = readdirSync(imageDir).filter(f => !f.startsWith('.') && /\.(png|jpg)$/i.test(f) && f !== 'recommend.png');
function findImages(seq) {
  const main = imageFiles.find(f => new RegExp(`^${seq}\\.`).test(f));
  const sub = imageFiles.find(f => new RegExp(`^${seq}-1\\.`).test(f));
  return { main, sub };
}
const won = n => Number(n).toLocaleString('ko-KR') + '원';

// === 카드 생성 (기존 260911 카드 마크업과 동일 스타일) ===
function card(item) {
  const seq = String(item.seq).padStart(2, '0');
  const dr = Math.round((1 - item.final / item.tag) * 100);
  const { main, sub } = findImages(item.seq);
  const colorStr = item.colors.join(', ');

  const recBadge = item.bigo === '추천'
    ? `<img src="상품이미지/recommend.png" style="position:absolute; top:10px; left:10px; width:64px; height:64px; z-index:3; object-fit:contain;">`
    : '';

  const chips = item.colors.map(code => {
    const hex = COLOR_MAP[code] || '#cccccc';
    const border = LIGHT_COLORS.has(code) ? ' border:1px solid #ddd;' : '';
    return `<div style="width:18px; height:18px; border-radius:50%; background:${hex};${border}"></div>`;
  }).join('\n');
  const chipHtml = chips ? `<div style="position:absolute; top:10px; right:10px; display:flex; flex-direction:column; gap:5px; z-index:1;">\n${chips}\n</div>` : '';

  let imgHtml = '';
  if (main && sub) {
    imgHtml = `<img src="상품이미지/${main}" style="max-width:48%; max-height:100%; object-fit:contain;">
<img src="상품이미지/${sub}" style="max-width:48%; max-height:100%; object-fit:contain;">`;
  } else if (main) {
    imgHtml = `<img src="상품이미지/${main}" style="max-width:100%; max-height:100%; object-fit:contain;">`;
  }

  let price = `<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;"><div><span style="display:inline-block; background:#9ca3af; color:#fff; font-size:18px; font-weight:700; padding:6px 12px; border-radius:6px; margin-right:10px; vertical-align:middle;">정상가</span><span style="font-family:Pretendard,sans-serif; font-size:26px; color:#8e939d; text-decoration:line-through; vertical-align:middle;">${won(item.tag)}</span></div><span style="font-family:Pretendard,sans-serif; font-size:40px; font-weight:800; color:#e80000;">${dr}%</span></div>`;
  price += `<div style="display:flex; align-items:center; margin-bottom:8px;"><span style="display:inline-block; background:#1e3a8a; color:#fff; font-size:18px; font-weight:700; padding:6px 12px; border-radius:6px; margin-right:10px; vertical-align:middle;">톡딜가</span><span style="font-family:Pretendard,sans-serif; font-size:30px; font-weight:800; color:#1e3a8a; vertical-align:middle;">${won(item.deal)}</span></div>`;
  price += `<div style="display:flex; align-items:center; margin-bottom:8px;"><span style="display:inline-block; background:#dc2626; color:#fff; font-size:18px; font-weight:700; padding:6px 12px; border-radius:6px; margin-right:10px; vertical-align:middle;">최종가</span><span style="font-family:Pretendard,sans-serif; font-size:33px; font-weight:800; color:#dc2626; vertical-align:middle;">${won(item.final)}</span></div>`;

  return `<td style="width:445px; padding:4px; vertical-align:top;">
<a href="${S3}/kakao_detail/${item.seq}_${item.code}.html" style="text-decoration:none; color:inherit;">
<div style="width:100%; background:#fff; border-radius:20px; overflow:hidden; border:1px solid #e5e7eb;">
<div style="background:#1e3a8a; padding:26px 0; text-align:center;">
<span style="font-family:Pretendard,sans-serif; font-size:36px; font-weight:800; color:#fff;">구성 ${seq}</span>
</div>
<div style="background:#f5f6f8; height:300px; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; justify-content:center; position:relative;">
${recBadge}
${chipHtml}
${imgHtml}
</div>
<div style="padding:28px;">
<p style="font-family:Pretendard,sans-serif; font-size:29px; font-weight:800; color:#111827; margin:0 0 6px 0; line-height:1.3;">${item.name}</p>
<p style="font-family:Pretendard,sans-serif; font-size:22px; color:#8e939d; margin:0 0 18px 0;">${colorStr}</p>
<div style="border-top:1px solid #e5e7eb; padding-top:14px;">
${price}
</div>
</div>
</div>
</a>
</td>`;
}

let cards = '';
for (let i = 0; i < items.length; i += 2) {
  const l = card(items[i]);
  const r = items[i + 1] ? card(items[i + 1]) : '<td style="width:445px; padding:4px; vertical-align:top;"></td>';
  cards += `<tr>\n${l}\n${r}\n</tr>\n`;
}

const tableBlock = `<!-- ===== 상품 리스트 (${items.length}개) ===== -->
<table style="width:890px; border-spacing:0; border-collapse:collapse; margin:0 auto;">
<tbody>
${cards}
</tbody>
</table>`;

// === 작업용.html에서 상품 table 부분만 교체 ===
const htmlPath = resolve(SRC, '작업용.html');
let html = readFileSync(htmlPath, 'utf-8');

// 상품 리스트 주석부터 </table>까지를 통째로 교체
const startMarker = '<!-- ===== 상품 리스트';
const startIdx = html.indexOf(startMarker);
if (startIdx === -1) { console.error('❌ 상품 리스트 시작 마커를 찾을 수 없음'); process.exit(1); }
const tableEnd = html.indexOf('</table>', startIdx);
if (tableEnd === -1) { console.error('❌ </table> 종료를 찾을 수 없음'); process.exit(1); }
const endIdx = tableEnd + '</table>'.length;

const before = html.slice(0, startIdx);
const after = html.slice(endIdx);
html = before + tableBlock + after;

writeFileSync(htmlPath, html, 'utf-8');
console.log(`✅ 카드 영역 교체 완료 (${items.length}개 구성, 추천 딱지 ${items.filter(i => i.bigo === '추천').length}개)`);
console.log('   백그래픽(앞뒷면):', items.filter(i => findImages(i.seq).sub).map(i => i.seq).join(', '));
