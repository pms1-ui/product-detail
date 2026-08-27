import XLSX from 'xlsx';
import sharp from 'sharp';
import { resolve } from 'path';
import { readdirSync, existsSync, mkdirSync } from 'fs';

const BASE = resolve('.');
const IMAGE_DIR = resolve(BASE, '02_source/260903/image');
const DETAIL_DIR = resolve(BASE, '03_output/260903/before_upload/detail_image');

if (!existsSync(DETAIL_DIR)) mkdirSync(DETAIL_DIR, { recursive: true });

// 엑셀 파싱 → 구성별 모델코드
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

// 이미지 파일 목록
const imageFiles = readdirSync(IMAGE_DIR).filter(f => !f.startsWith('.') && f !== '사은품');

function findMainImage(seq) {
  const prefix = `${seq}.`;
  const subPrefix = `${seq}-1.`;
  return imageFiles.find(f => f.startsWith(prefix) && !f.startsWith(subPrefix));
}

// 각 상품의 메인 이미지를 890px 폭 JPG로 변환 (흰 배경)
let count = 0;
for (const item of items) {
  const mainImg = findMainImage(item.seq);
  if (!mainImg) {
    console.log(`⚠️  구성${item.seq} 이미지 없음`);
    continue;
  }
  
  const srcPath = resolve(IMAGE_DIR, mainImg);
  const outName = `${item.seq}_${item.model}.jpg`;
  const outPath = resolve(DETAIL_DIR, outName);
  
  await sharp(srcPath)
    .resize(890, null, { fit: 'inside', withoutEnlargement: false })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 85 })
    .toFile(outPath);
  
  count++;
}

console.log(`✅ 상품 상세 이미지 ${count}개 생성 완료 → detail_image/`);
