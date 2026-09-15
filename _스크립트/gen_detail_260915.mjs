// 260911 상세 HTML 재생성 (새 엑셀 상품데이터_260915.xlsx 기준, 23개 구성)
// 출력: _작업소스/260911/상품상세html/{순서}_{품번}.html (여기서 만들어 S3에 업로드)
// 상세 이미지: S3 detail_image/{순서}_{품번}.jpg (피그마 작업물, 상세이미지/ 폴더에서 업로드)
// 컬럼: 순서0 품번1 모델_컬러2 색상3 복종4 품명5 택가6 톡딜가7 최종가8 할인율9 비고10 썸네일11
import XLSX from 'xlsx';
import { resolve } from 'path';
import { writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'fs';

const SERVER = '2609_2_kakaotalk_deal';
const S3 = `https://aws-childy-image.s3.ap-northeast-2.amazonaws.com/img/outdoor2026/promotion/${SERVER}`;
const OUT = resolve('_작업소스/260911/상품상세html'); // 엑셀기반 품번별 상세 html (여기서 만들고 S3 업로드)
mkdirSync(OUT, { recursive: true });

// 기존 상세 HTML 정리 (구성이 전면 재배치되었으므로 초기화)
if (existsSync(OUT)) {
  for (const f of readdirSync(OUT).filter(f => f.endsWith('.html'))) {
    unlinkSync(resolve(OUT, f));
  }
}

const wb = XLSX.readFile(resolve('_작업소스/260911/기초데이터/상품데이터_260915.xlsx'));
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
console.log('   파일 목록:');
items.forEach(it => console.log(`   ${it.seq}_${it.code}.html`));
