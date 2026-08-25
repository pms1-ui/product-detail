import XLSX from 'xlsx';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

const BASE = resolve('.');
const SERVER_BASE = 'https://img.childy.kr/img/outdoor2026/promotion/2609_kakaotalk_deal';
const OUTPUT_PATH = resolve(BASE, '03_output/260903/kakao_upload/kakao_final_260903.html');

// 엑셀 파싱
const wb = XLSX.readFile(resolve(BASE, '01_data/260903/260903_data.xlsx'));
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

const groups = {};
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r || !r[0]) continue;
  const seq = r[0];
  if (!groups[seq]) {
    groups[seq] = { seq, model: r[3] };
  }
}
const items = Object.values(groups);

// 이미지 스타일 (모바일 대응)
const imgStyle = 'style="max-width:100%; width:100%; display:block;"';

// 상단 공통 이미지
let html = '';
html += `<p align="center"><img src="${SERVER_BASE}/detail_image/01_main_visual.jpg" ${imgStyle}></p>\n`;
html += `<p align="center"><a href="https://pf.kakao.com/_nfxkLT"><img src="${SERVER_BASE}/detail_image/02_kakao_channel.jpg" ${imgStyle}></a></p>\n`;
html += `<p align="center"><img src="${SERVER_BASE}/detail_image/03_benefits.jpg" ${imgStyle}></p>\n`;
html += `<p align="center"><img src="${SERVER_BASE}/detail_image/04_tokdeal_benefits.jpg" ${imgStyle}></p>\n`;

// 상품 카드 테이블 (2열 배치, 모바일 대응)
html += `<table style="width:100%; border-spacing:0; border-collapse:collapse;"><tbody>\n`;
for (let i = 0; i < items.length; i += 2) {
  const left = items[i];
  const leftNum = String(left.seq).padStart(2, '0');
  const leftCard = `<a href="${SERVER_BASE}/kakao_detail/${left.seq}_${left.model}.html"><img src="${SERVER_BASE}/cards/${leftNum}.jpg" ${imgStyle}></a>`;
  
  let rightCard = '';
  if (items[i + 1]) {
    const right = items[i + 1];
    const rightNum = String(right.seq).padStart(2, '0');
    rightCard = `<a href="${SERVER_BASE}/kakao_detail/${right.seq}_${right.model}.html"><img src="${SERVER_BASE}/cards/${rightNum}.jpg" ${imgStyle}></a>`;
  }
  
  html += `<tr><td style="width:50%; vertical-align:top; padding:2px;">${leftCard}</td><td style="width:50%; vertical-align:top; padding:2px;">${rightCard}</td></tr>\n`;
}
html += `</tbody></table>\n`;

writeFileSync(OUTPUT_PATH, html, 'utf-8');
console.log(`✅ kakao_final_260903.html 생성 완료 (${items.length}개 상품, 모바일 최적화 적용)`);
