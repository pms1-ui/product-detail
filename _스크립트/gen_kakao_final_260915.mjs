// 260911 kakao_final 재생성 (새 엑셀 상품데이터_260915.xlsx 기준, 23개 구성)
// 기존 260911 규칙 유지: 도메인 aws-childy-image S3, 카드 card/{NN}.jpg(단수), 상세 kakao_detail/{순서}_{품번}.html
// 컬럼: 순서0 품번1 모델_컬러2 색상3 복종4 품명5 택가6 톡딜가7 최종가8 할인율9 비고10 썸네일11
import XLSX from 'xlsx';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

const SERVER = '2609_2_kakaotalk_deal';
const BASE = `https://aws-childy-image.s3.ap-northeast-2.amazonaws.com/img/outdoor2026/promotion/${SERVER}`;
const SRC = '_작업소스/260911';

const wb = XLSX.readFile(resolve(SRC, '데이터/상품데이터_260915.xlsx'));
const rows = XLSX.utils.sheet_to_json(wb.Sheets['상품리스트'], { header: 1, defval: '' }).slice(1).filter(r => r.some(c => c !== ''));

// 품번별 대표(첫 행) → 순서/품번
const seen = new Set();
const items = [];
for (const r of rows) {
  const code = String(r[1]).trim();
  if (seen.has(code)) continue;
  seen.add(code);
  items.push({ seq: Number(r[0]), code });
}
items.sort((a, b) => a.seq - b.seq);

// 상단 공통 이미지 4장
let html = '';
html += `<p align="center"><img src="${BASE}/01_main_visual.jpg"></p>\n`;
html += `<p align="center"><a href="https://pf.kakao.com/_nfxkLT"><img src="${BASE}/02_kakao_channel.jpg"></a></p>\n`;
html += `<p align="center"><img src="${BASE}/03_benefits.jpg"></p>\n`;
html += `<p align="center"><img src="${BASE}/04_tokdeal_benefits.jpg"></p>\n`;

// 카드 테이블 (2열)
html += `<table><tbody>\n`;
for (let i = 0; i < items.length; i += 2) {
  const l = items[i];
  const lNum = String(l.seq).padStart(2, '0');
  const lCard = `<td><a href="${BASE}/kakao_detail/${l.seq}_${l.code}.html"><img src="${BASE}/card/${lNum}.jpg"></a></td>`;
  let rCard = '';
  if (items[i + 1]) {
    const r = items[i + 1];
    const rNum = String(r.seq).padStart(2, '0');
    rCard = `<td><a href="${BASE}/kakao_detail/${r.seq}_${r.code}.html"><img src="${BASE}/card/${rNum}.jpg"></a></td>`;
  }
  html += `<tr>${lCard}${rCard}</tr>\n`;
}
html += `</tbody></table>\n`;

writeFileSync(resolve(SRC, 'kakao_final_260911.txt'), html, 'utf-8');
writeFileSync(resolve(SRC, 'kakao_final_260911.html'), html, 'utf-8');
console.log(`✅ kakao_final_260911 재생성 완료 (${items.length}개 구성)`);

// === 로컬 확인용 프리뷰 (로컬 캡처 이미지 참조, 상세링크는 S3) ===
const IMG = '../_작업소스/260911/캡처결과';
const st = 'style="max-width:100%; width:100%; display:block;"';
let pv = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>260911 로컬확인</title></head>
<body style="margin:0; padding:0; background:#fff;">
<div style="max-width:900px; margin:0 auto;">
<p align="center"><img src="${IMG}/01_main_visual.jpg" ${st}></p>
<p align="center"><a href="https://pf.kakao.com/_nfxkLT"><img src="${IMG}/02_kakao_channel.jpg" ${st}></a></p>
<p align="center"><img src="${IMG}/03_benefits.jpg" ${st}></p>
<p align="center"><img src="${IMG}/04_tokdeal_benefits.jpg" ${st}></p>
<table style="width:100%; border-spacing:0; border-collapse:collapse;"><tbody>
`;
for (let i = 0; i < items.length; i += 2) {
  const l = items[i];
  const lNum = String(l.seq).padStart(2, '0');
  const lCell = `<td style="width:50%; vertical-align:top; padding:2px;"><a href="${BASE}/kakao_detail/${l.seq}_${l.code}.html"><img src="${IMG}/cards/${lNum}.jpg" ${st}></a></td>`;
  let rCell = '<td style="width:50%;"></td>';
  if (items[i + 1]) {
    const r = items[i + 1];
    const rNum = String(r.seq).padStart(2, '0');
    rCell = `<td style="width:50%; vertical-align:top; padding:2px;"><a href="${BASE}/kakao_detail/${r.seq}_${r.code}.html"><img src="${IMG}/cards/${rNum}.jpg" ${st}></a></td>`;
  }
  pv += `<tr>${lCell}${rCell}</tr>\n`;
}
pv += `</tbody></table>\n</div>\n</body></html>\n`;
writeFileSync(resolve('미리보기/260911_로컬확인.html'), pv, 'utf-8');
console.log(`✅ 미리보기/260911_로컬확인.html 재생성 완료`);
