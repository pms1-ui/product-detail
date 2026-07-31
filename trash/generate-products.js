import XLSX from 'xlsx';
import { readFileSync, writeFileSync } from 'fs';

const workbook = XLSX.readFile('./final/통합 문서1.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// 행 순서대로 읽으면서, 품번(B열)이 바뀔 때마다 새 구성으로 잡는다
const groups = [];
let currentGroup = null;
let lastStyleNum = null;

for (let i = 1; i < data.length; i++) {
  const row = data[i];
  const styleNum = row[1]; // B열: 품번
  const styleFull = row[2]; // C열: 품번_컬러코드
  let productName = row[4]; // E열: 상품명
  const tagPrice = row[5]; // F열: 택가(정상가)
  const talkDealPrice = row[6]; // G열: 톡딜가
  const couponPrice = row[7]; // H열: 쿠폰가

  // 컬러코드 추출 (품번_XXX에서 XXX 부분)
  const colorCode = styleFull ? styleFull.split('_').pop() : '';

  // 상품명 클리닝
  if (productName) {
    productName = productName.replace(/^아웃도어\s*프로덕츠\s*\[.*?\]\s*/, '');
    productName = productName.replace(/\s*\(\d+color\)\s*$/, '').trim();
  }

  // 품번이 바뀌면 새 구성
  if (styleNum !== lastStyleNum) {
    currentGroup = {
      productName: productName,
      tagPrice: tagPrice,
      talkDealPrice: talkDealPrice,
      couponPrice: (couponPrice !== null && couponPrice !== undefined) ? couponPrice : null,
      colors: []
    };
    groups.push(currentGroup);
    lastStyleNum = styleNum;
  }

  // 현재 구성에 컬러 추가
  if (currentGroup && colorCode && !currentGroup.colors.includes(colorCode)) {
    currentGroup.colors.push(colorCode);
  }
}

console.log(`Total groups: ${groups.length}`);

// 처음 5개 확인
for (let i = 0; i < 5; i++) {
  console.log(`구성 ${String(i+1).padStart(2,'0')}: ${groups[i].productName} | 컬러: ${groups[i].colors.join(', ')} | 정상가: ${groups[i].tagPrice} | 톡딜가: ${groups[i].talkDealPrice} | 쿠폰가: ${groups[i].couponPrice}`);
}

if (groups.length !== 89) {
  console.log('\n⚠️  89개가 아님! 전체 구성 목록:');
  for (let i = 0; i < groups.length; i++) {
    console.log(`  ${String(i+1).padStart(2,'0')}: ${groups[i].productName} (${groups[i].colors.join(', ')}) | 쿠폰가: ${groups[i].couponPrice}`);
  }
  process.exit(1);
}

// HTML 생성
function formatPrice(price) {
  return Math.round(price).toLocaleString('ko-KR') + '원';
}

function calcDiscount(tagPrice, talkDealPrice, couponPrice) {
  if (couponPrice) {
    return Math.round((1 - couponPrice / tagPrice) * 100);
  }
  return Math.round((1 - talkDealPrice / tagPrice) * 100);
}

function buildCard(item, num) {
  const discount = calcDiscount(item.tagPrice, item.talkDealPrice, item.couponPrice);
  const colorStr = item.colors.join(', ');
  const numStr = String(num).padStart(2, '0');
  
  let priceSection = '';
  
  priceSection += `<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
<div><span style="display:inline-block; background:#9ca3af; color:#fff; font-size:18px; font-weight:700; padding:6px 12px; border-radius:6px; margin-right:10px; vertical-align:middle;">정상가</span><span style="font-family:Pretendard,sans-serif; font-size:26px; color:#8e939d; text-decoration:line-through; vertical-align:middle;">${formatPrice(item.tagPrice)}</span></div>
<span style="font-family:Pretendard,sans-serif; font-size:40px; font-weight:800; color:#e80000;">${discount}%</span>
</div>`;
  
  priceSection += `<div style="display:flex; align-items:center; margin-bottom:6px;"><span style="display:inline-block; background:#1e3a8a; color:#fff; font-size:18px; font-weight:700; padding:6px 12px; border-radius:6px; margin-right:10px; vertical-align:middle;">톡딜가</span><span style="font-family:Pretendard,sans-serif; font-size:36px; font-weight:800; color:#1e3a8a; vertical-align:middle;">${formatPrice(item.talkDealPrice)}</span></div>`;
  
  if (item.couponPrice) {
    priceSection += `<div style="display:flex; align-items:center;"><span style="display:inline-block; background:#dc2626; color:#fff; font-size:18px; font-weight:700; padding:6px 12px; border-radius:6px; margin-right:10px; vertical-align:middle;">쿠폰가</span><span style="font-family:Pretendard,sans-serif; font-size:36px; font-weight:800; color:#dc2626; vertical-align:middle;">${formatPrice(item.couponPrice)}</span></div>`;
  }

  return `<td style="width:445px; padding:4px; vertical-align:top;">
<a href="https://your-hosting.com/detail/product${numStr}.html" style="text-decoration:none; color:inherit;">
<div style="width:100%; background:#fff; border-radius:20px; overflow:hidden; border:1px solid #e5e7eb;">
<div style="background:#1e3a8a; padding:26px 0; text-align:center;">
<span style="font-family:Pretendard,sans-serif; font-size:36px; font-weight:800; color:#fff;">구성 ${numStr}</span>
</div>
<div style="background:#f5f6f8; height:300px; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; justify-content:center;">
<img src="4_상품한개예시.jpeg" style="max-width:100%; max-height:100%; object-fit:contain;">
</div>
<div style="padding:28px;">
<p style="font-family:Pretendard,sans-serif; font-size:32px; font-weight:800; color:#111827; margin:0 0 6px 0; line-height:1.3;">${item.productName}</p>
<p style="font-family:Pretendard,sans-serif; font-size:22px; color:#8e939d; margin:0 0 18px 0;">${colorStr}</p>
<div style="border-top:1px solid #e5e7eb; padding-top:14px;">
${priceSection}
</div>
</div>
</div>
</a>
</td>
`;
}

let productCards = '';

for (let i = 0; i < groups.length; i += 2) {
  productCards += '<tr>\n';
  productCards += buildCard(groups[i], i + 1);
  
  if (i + 1 < groups.length) {
    productCards += buildCard(groups[i + 1], i + 2);
  } else {
    productCards += '<td style="width:445px; padding:4px; vertical-align:top;"></td>\n';
  }
  
  productCards += '</tr>\n';
}

const htmlPath = './final/kakao-store-detail.html';
let html = readFileSync(htmlPath, 'utf-8');

const tableStart = '<!-- ===== 상품 리스트';
const startIdx = html.indexOf(tableStart);
const endIdx = html.indexOf('</table>', startIdx) + '</table>'.length;

const newTable = `<!-- ===== 상품 리스트 (89개) ===== -->
<table style="width:890px; border-spacing:0; border-collapse:collapse; margin:0 auto;">
<tbody>
${productCards}</tbody>
</table>`;

html = html.substring(0, startIdx) + newTable + html.substring(endIdx);

writeFileSync(htmlPath, html, 'utf-8');
console.log('Done! HTML updated.');
