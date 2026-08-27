import XLSX from 'xlsx';
import { resolve } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

// === 엑셀 파싱 ===
const wb = XLSX.readFile(resolve('01_data/260903/260903_data.xlsx'));
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

// 구성별 그룹핑 (순서 + 모델코드만 필요)
const groups = {};
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r || !r[0]) continue;
  const seq = r[0];
  if (!groups[seq]) {
    groups[seq] = { seq, model: r[3] };
  }
}
const items = Object.values(groups).sort((a, b) => a.seq - b.seq);

// === 출력 디렉토리 ===
const outDir = resolve('02_source/260903/html');
mkdirSync(outDir, { recursive: true });

// === 상세 HTML 생성 ===
const BASE_URL = 'https://img.childy.kr/img/outdoor2026/promotion/2609_kakaotalk_deal/detail_image';

for (const item of items) {
  const filename = `${item.seq}_${item.model}.html`;
  const imageUrl = `${BASE_URL}/${item.seq}_${item.model}.jpg`;
  
  const html = `<html>
<head><meta charset="utf-8"><title>${item.model}</title></head>
<body style="margin:0; padding:0; background:#fff;">
<p align="center"><img src="${imageUrl}" style="max-width:100%;"></p>
</body>
</html>
`;

  writeFileSync(resolve(outDir, filename), html, 'utf-8');
}

console.log(`✅ 상세 HTML ${items.length}개 생성 완료 → ${outDir}`);
