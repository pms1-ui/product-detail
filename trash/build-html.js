import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 상품 데이터 88개
const products = [
  { name: '에센셜 파노라마 반팔 티셔츠', colors: 'IVY, YEL, BLU, BLK, MWH', price: '35,000', discount: '57%', dealPrice: '15,000', couponPrice: '13,000' },
  { name: '에센셜 파노라마 반팔 티셔츠', colors: 'IVY, YEL, BLU, BLK, MWH', price: '35,000', discount: '57%', dealPrice: '15,000', couponPrice: '13,000' },
  { name: '클래식 마운틴 후디', colors: 'GRY, BLK, NVY', price: '79,000', discount: '62%', dealPrice: '29,900', couponPrice: '27,900' },
  { name: '울트라라이트 다운 자켓', colors: 'NVY, BLK, KHK', price: '129,000', discount: '53%', dealPrice: '59,900', couponPrice: '57,900' },
  { name: '트레킹 카고팬츠', colors: 'KHK, BLK, GRY', price: '69,000', discount: '56%', dealPrice: '29,900', couponPrice: '27,900' },
  { name: '아웃도어 반팔티 화이트', colors: 'WHT, BLK, GRY', price: '39,000', discount: '59%', dealPrice: '15,900', couponPrice: '13,900' },
  { name: '파노라마 반팔티', colors: 'OLV, BLK, WHT, NVY', price: '42,000', discount: '57%', dealPrice: '17,900', couponPrice: '15,900' },
  { name: '고어텍스 레인자켓', colors: 'BLU, BLK, YEL', price: '159,000', discount: '50%', dealPrice: '79,000', couponPrice: '77,000' },
  { name: '플리스 집업 자켓', colors: 'CRM, BLK, GRY', price: '65,000', discount: '55%', dealPrice: '29,000', couponPrice: '27,000' },
  { name: '스트레치 조거팬츠', colors: 'CHR, BLK, NVY', price: '55,000', discount: '54%', dealPrice: '24,900', couponPrice: '22,900' },
  { name: '아웃도어 바디백', colors: 'BLK, NVY, KHK', price: '45,000', discount: '51%', dealPrice: '21,900', couponPrice: '19,900' },
  { name: '메쉬 캡', colors: 'BLK, WHT, NVY', price: '29,000', discount: '52%', dealPrice: '13,900', couponPrice: '11,900' },
  { name: '트레일 러닝화', colors: 'RED/BLK, GRY/WHT', price: '119,000', discount: '50%', dealPrice: '59,000', couponPrice: '57,000' },
  { name: 'UV 프로텍션 셔츠', colors: 'LBL, WHT, GRY', price: '52,000', discount: '55%', dealPrice: '23,400', couponPrice: '21,400' },
  { name: '컨버터블 팬츠', colors: 'BGE, KHK, GRY', price: '72,000', discount: '54%', dealPrice: '32,900', couponPrice: '30,900' },
  { name: '소프트쉘 자켓', colors: 'DGR, BLK, NVY', price: '98,000', discount: '52%', dealPrice: '46,900', couponPrice: '44,900' },
  { name: '쿨맥스 양말 3팩', colors: 'MIX', price: '18,000', discount: '50%', dealPrice: '9,000', couponPrice: '7,000' },
  { name: '경량 버킷햇', colors: 'BGE, BLK, NVY', price: '32,000', discount: '53%', dealPrice: '14,900', couponPrice: '12,900' },
  { name: '방수 등산배낭 30L', colors: 'ORG, BLK, NVY', price: '89,000', discount: '51%', dealPrice: '43,500', couponPrice: '41,500' },
  { name: '기능성 이너웨어', colors: 'WHT, BLK, GRY', price: '28,000', discount: '54%', dealPrice: '12,900', couponPrice: '10,900' },
  { name: '아웃도어 숏팬츠', colors: 'NVY, BLK, KHK', price: '45,000', discount: '55%', dealPrice: '19,900', couponPrice: '17,900' },
  { name: '쿨링 크루넥 티셔츠', colors: 'WHT, GRY, BLK, BLU', price: '32,000', discount: '56%', dealPrice: '13,900', couponPrice: '11,900' },
  { name: '립스탑 윈드자켓', colors: 'BLK, NVY, OLV', price: '89,000', discount: '55%', dealPrice: '39,900', couponPrice: '37,900' },
  { name: '스트레치 클라이밍 팬츠', colors: 'GRY, BLK, BGE', price: '78,000', discount: '53%', dealPrice: '36,500', couponPrice: '34,500' },
  { name: '에어메쉬 러닝 반팔티', colors: 'BLK, WHT, MNT', price: '35,000', discount: '57%', dealPrice: '14,900', couponPrice: '12,900' },
  { name: '하이킹 미드컷 부츠', colors: 'BRN, BLK, GRY', price: '139,000', discount: '50%', dealPrice: '69,000', couponPrice: '67,000' },
  { name: '래쉬가드 상의', colors: 'BLK, NVY, WHT', price: '45,000', discount: '55%', dealPrice: '19,900', couponPrice: '17,900' },
  { name: '래쉬가드 하의', colors: 'BLK, NVY', price: '42,000', discount: '55%', dealPrice: '18,900', couponPrice: '16,900' },
  { name: '캠핑 플리스 블랭킷', colors: 'GRY, BGE, NVY', price: '55,000', discount: '52%', dealPrice: '26,400', couponPrice: '24,400' },
  { name: '경량 패커블 자켓', colors: 'BLK, NVY, RED', price: '79,000', discount: '54%', dealPrice: '36,300', couponPrice: '34,300' },
  { name: '트레킹 폴로 셔츠', colors: 'WHT, NVY, BLK', price: '48,000', discount: '56%', dealPrice: '21,000', couponPrice: '19,000' },
  { name: '멀티 포켓 조끼', colors: 'KHK, BLK, NVY', price: '65,000', discount: '53%', dealPrice: '30,500', couponPrice: '28,500' },
  { name: '스포츠 선글라스', colors: 'BLK, WHT', price: '39,000', discount: '51%', dealPrice: '19,000', couponPrice: '17,000' },
  { name: '드라이핏 긴팔 티셔츠', colors: 'BLK, GRY, WHT, NVY', price: '42,000', discount: '55%', dealPrice: '18,900', couponPrice: '16,900' },
  { name: '워터프루프 트레킹화', colors: 'BLK/RED, GRY/GRN', price: '129,000', discount: '50%', dealPrice: '64,500', couponPrice: '62,500' },
  { name: '경량 다운 베스트', colors: 'BLK, NVY, OLV', price: '89,000', discount: '55%', dealPrice: '39,900', couponPrice: '37,900' },
  { name: '아웃도어 스커트', colors: 'BLK, NVY, BGE', price: '52,000', discount: '54%', dealPrice: '23,900', couponPrice: '21,900' },
  { name: '테크 카고 조거', colors: 'BLK, CHR, OLV', price: '68,000', discount: '53%', dealPrice: '31,900', couponPrice: '29,900' },
  { name: '하이넥 바람막이', colors: 'BLK, NVY, YEL', price: '75,000', discount: '52%', dealPrice: '36,000', couponPrice: '34,000' },
  { name: '아이스 쿨링 넥워머', colors: 'BLK, GRY, BLU', price: '15,000', discount: '53%', dealPrice: '7,000', couponPrice: '5,000' },
  { name: '프리미엄 등산 스틱', colors: 'BLK, RED, BLU', price: '45,000', discount: '51%', dealPrice: '22,000', couponPrice: '20,000' },
  { name: '멀티 스포츠 백팩 20L', colors: 'BLK, GRY, NVY', price: '69,000', discount: '52%', dealPrice: '33,000', couponPrice: '31,000' },
  { name: '아웃도어 레깅스', colors: 'BLK, NVY, GRY', price: '38,000', discount: '55%', dealPrice: '17,000', couponPrice: '15,000' },
  { name: '방한 기모 팬츠', colors: 'BLK, NVY, CHR', price: '59,000', discount: '54%', dealPrice: '27,000', couponPrice: '25,000' },
];

// 88개까지 채우기 (44개 데이터를 2번 반복)
while (products.length < 88) {
  const idx = products.length % 44;
  products.push({ ...products[idx] });
}

function makeCard(num, product) {
  const padNum = String(num).padStart(2, '0');
  return `<td style="width:445px; padding:4px; vertical-align:top; border:2px solid #2962ff;">
<a href="https://your-hosting.com/detail/product${padNum}.html" style="text-decoration:none; color:inherit;">
<div style="width:100%; background:#fff; border-radius:20px; overflow:hidden; border:1px solid #e5e7eb;">
<div style="background:#1e3a8a; padding:18px 0; text-align:center;">
<span style="font-family:Pretendard,sans-serif; font-size:22px; font-weight:800; color:#fff;">구성 ${padNum}</span>
</div>
<div style="background:#f5f6f8; height:200px; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; justify-content:center;">
<img src="4_상품한개예시.jpeg" style="max-width:100%; max-height:100%; object-fit:contain;">
</div>
<div style="padding:20px;">
<p style="font-family:Pretendard,sans-serif; font-size:18px; font-weight:800; color:#111827; margin:0 0 6px 0; line-height:1.3;">${product.name}</p>
<p style="font-family:Pretendard,sans-serif; font-size:13px; color:#8e939d; margin:0 0 14px 0;">${product.colors}</p>
<div style="border-top:1px solid #e5e7eb; padding-top:14px;">
<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
<div><span style="display:inline-block; background:#9ca3af; color:#fff; font-size:11px; font-weight:700; padding:4px 8px; border-radius:6px; margin-right:8px;">정상가</span><span style="font-family:Pretendard,sans-serif; font-size:16px; color:#8e939d; text-decoration:line-through;">${product.price}원</span></div>
<span style="font-family:Pretendard,sans-serif; font-size:26px; font-weight:800; color:#e80000;">${product.discount}</span>
</div>
<div style="margin-bottom:6px;"><span style="display:inline-block; background:#1e3a8a; color:#fff; font-size:11px; font-weight:700; padding:4px 8px; border-radius:6px; margin-right:8px;">톡딜가</span><span style="font-family:Pretendard,sans-serif; font-size:22px; font-weight:800; color:#1e3a8a;">${product.dealPrice}원</span></div>
<div><span style="display:inline-block; background:#dc2626; color:#fff; font-size:11px; font-weight:700; padding:4px 8px; border-radius:6px; margin-right:8px;">쿠폰가</span><span style="font-family:Pretendard,sans-serif; font-size:22px; font-weight:800; color:#dc2626;">${product.couponPrice}원</span></div>
</div>
</div>
</div>
</a>
</td>`;
}

// HTML 조립
let html = '';
for (let i = 0; i < 88; i += 2) {
  html += '<tr>\n';
  html += makeCard(i + 1, products[i]) + '\n';
  html += makeCard(i + 2, products[i + 1]) + '\n';
  html += '</tr>\n';
}
html += '</tbody>\n</table>\n</center>\n';

// 기존 파일에 append
const filePath = path.join(__dirname, 'final', 'kakao-store-detail.html');
fs.appendFileSync(filePath, html);
console.log('Done! 88 cards added to kakao-store-detail.html');
