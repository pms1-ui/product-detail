import XLSX from 'xlsx';
import { resolve } from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

const BASE = resolve('.');
const KAKAO_DETAIL_DIR = resolve(BASE, '03_output/260903/before_upload/kakao_detail');

if (!existsSync(KAKAO_DETAIL_DIR)) mkdirSync(KAKAO_DETAIL_DIR, { recursive: true });

// 서버 베이스 URL
const SERVER_BASE = 'https://img.childy.kr/img/outdoor2026/promotion/2609_kakaotalk_deal';

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

// 각 상품 상세 HTML 생성
let count = 0;
for (const item of items) {
  const fileName = `${item.seq}_${item.model}.html`;
  const imgUrl = `${SERVER_BASE}/detail_image/${item.seq}_${item.model}.jpg`;
  
  const html = `<html>
<head><meta charset="utf-8"><title>${item.model}</title></head>
<body style="margin:0; padding:0; background:#fff;">
<p align="center"><img src="${imgUrl}" style="max-width:100%;"></p>
</body>
</html>
`;
  
  writeFileSync(resolve(KAKAO_DETAIL_DIR, fileName), html, 'utf-8');
  count++;
}

console.log(`✅ 상품 상세 HTML ${count}개 생성 완료 → kakao_detail/`);
