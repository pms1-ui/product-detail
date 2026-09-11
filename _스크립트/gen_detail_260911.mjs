// 260911 상세 HTML 21개 생성
// img/outdoor2026/promotion/2611_kakaotalk_deal/kakao_detail/{순서}_{품번}.html
// 상세 이미지: detail_image/{순서}_{품번}.jpg (서버 S3)
import XLSX from 'xlsx';
import { resolve } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

const SERVER = '2609_2_kakaotalk_deal';
const S3 = `https://aws-childy-image.s3.ap-northeast-2.amazonaws.com/img/outdoor2026/promotion/${SERVER}`;
const OUT = resolve(`img/outdoor2026/promotion/${SERVER}/kakao_detail`);
mkdirSync(OUT, { recursive: true });

const wb = XLSX.readFile(resolve('_작업소스/260911/데이터/상품데이터.xlsx'));
const rows = XLSX.utils.sheet_to_json(wb.Sheets['상품리스트'], { header: 1, defval: '' }).slice(1).filter(r => r.some(c => c !== ''));

// 구성 대표(품번별 첫 행)
const seen = new Set();
const items = [];
for (const r of rows) {
  const code = String(r[1]).trim();
  if (seen.has(code)) continue;
  seen.add(code);
  items.push({ seq: Number(r[0]), code });
}
items.sort((a, b) => a.seq - b.seq);

for (const it of items) {
  const html = `<html>
<head><meta charset="utf-8"><title>${it.code}</title></head>
<body style="margin:0; padding:0; background:#fff;">
<p align="center"><img src="${S3}/detail_image/${it.seq}_${it.code}.jpg" style="max-width:100%;"></p>
</body>
</html>
`;
  writeFileSync(resolve(OUT, `${it.seq}_${it.code}.html`), html, 'utf-8');
}
console.log(`✅ 상세 HTML ${items.length}개 생성 → ${OUT}`);
