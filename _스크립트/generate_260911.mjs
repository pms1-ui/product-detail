// 260911 카카오 톡딜 작업용.html 최초 생성 (회차당 1회)
// 미소데이즈 X 아웃도어프로덕츠 키즈 가을 신상 공구
// 엑셀: _작업소스/260911/데이터/상품데이터.xlsx (시트: 상품리스트)
// 컬럼: 순서(0) 품번(1) 색상(2) 품명(3) 택가(4) 톡딜가(5) 최종가(6) 할인율(7) 비고(8) 썸네일로사용(9)
import XLSX from 'xlsx';
import { resolve } from 'path';
import { writeFileSync, readdirSync } from 'fs';

const SERVER = '2609_2_kakaotalk_deal'; // 이번 회차 서버 폴더명 (2609_2)
const S3 = `https://img.childy.kr/img/outdoor2026/promotion/${SERVER}`;

// === 엑셀 파싱 ===
const wb = XLSX.readFile(resolve('_작업소스/260911/데이터/상품데이터.xlsx'));
const ws = wb.Sheets['상품리스트'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }).slice(1).filter(r => r.some(c => c !== ''));

// 구성별 그룹핑 (품번 기준으로 묶고, 순서는 대표행에서)
const groups = {};
for (const r of rows) {
  const code = String(r[1]).trim();
  if (!groups[code]) {
    groups[code] = {
      seq: Number(r[0]),
      code,
      name: String(r[3]).trim(),
      tag: Number(r[4]),      // 택가(정상가)
      deal: Number(r[5]),     // 톡딜가
      final: Number(r[6]),    // 최종가
      bigo: String(r[8]).trim(),
      colors: [],
      thumbColor: null,
    };
  }
  const color = String(r[2]).trim();
  groups[code].colors.push(color);
  if (String(r[9]).trim().toUpperCase() === 'Y') groups[code].thumbColor = color;
}
const items = Object.values(groups).sort((a, b) => a.seq - b.seq);
console.log('구성 개수:', items.length);

// === 컬러코드 → HEX (260903 매핑 재사용) ===
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

// 컬러맵 누락 체크
const allColors = new Set(items.flatMap(i => i.colors));
const missing = [...allColors].filter(c => !COLOR_MAP[c]);
if (missing.length) console.log('⚠️ 컬러맵 누락:', missing.join(', '));

// === 이미지 매핑 ===
const imageDir = resolve('_작업소스/260911/상품이미지');
const imageFiles = readdirSync(imageDir).filter(f => !f.startsWith('.') && /\.(png|jpg)$/i.test(f) && f !== 'recommend.png');
function findImages(seq) {
  const main = imageFiles.find(f => new RegExp(`^${seq}\\.`).test(f));
  const sub = imageFiles.find(f => new RegExp(`^${seq}-1\\.`).test(f));
  return { main, sub };
}

const won = n => Number(n).toLocaleString('ko-KR') + '원';

// === 카드 생성 ===
function card(item) {
  const seq = String(item.seq).padStart(2, '0');
  const dr = Math.round((1 - item.final / item.tag) * 100);
  const { main, sub } = findImages(item.seq);
  const colorStr = item.colors.join(', ');

  // 추천 딱지 (비고 == '추천') — 좌상단, 품절임박과 유사 크기
  const recBadge = item.bigo === '추천'
    ? `<img src="상품이미지/recommend.png" style="position:absolute; top:10px; left:10px; width:64px; height:64px; z-index:3; object-fit:contain;">`
    : '';

  // 컬러칩
  const chips = item.colors.map(code => {
    const hex = COLOR_MAP[code] || '#cccccc';
    const border = LIGHT_COLORS.has(code) ? ' border:1px solid #ddd;' : '';
    return `<div style="width:18px; height:18px; border-radius:50%; background:${hex};${border}"></div>`;
  }).join('\n');
  const chipHtml = chips ? `<div style="position:absolute; top:10px; right:10px; display:flex; flex-direction:column; gap:5px; z-index:1;">\n${chips}\n</div>` : '';

  // 이미지 (백그래픽=앞뒷면 2장)
  let imgHtml = '';
  if (main && sub) {
    imgHtml = `<img src="상품이미지/${main}" style="max-width:48%; max-height:100%; object-fit:contain;">
<img src="상품이미지/${sub}" style="max-width:48%; max-height:100%; object-fit:contain;">`;
  } else if (main) {
    imgHtml = `<img src="상품이미지/${main}" style="max-width:100%; max-height:100%; object-fit:contain;">`;
  }

  // 가격 3단: 정상가(택가) / 톡딜가 / 최종가
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

// === 상단 프로모 배너 (260911 혜택 반영) ===
const banner = `<center>
<!-- ===== promo-banner ===== -->
<div style="width:890px; margin:0 auto; background:#110b55; font-family:Pretendard,sans-serif; border-radius:30px; overflow:hidden;">

<!-- top-bar -->
<div style="width:890px; height:90px; background:#1a0086; display:flex; align-items:center; justify-content:center; gap:20px;">
<img src="../공용에셋/outdoor-logo.png" style="height:45px; width:auto;">
<img src="../공용에셋/x-separator.png" style="width:16px; height:16px;">
<img src="../공용에셋/talkdeal-logo.png" style="height:42px; width:auto;">
</div>

<!-- main visual -->
<div style="width:890px; height:1251px; position:relative; overflow:hidden;">
<img src="main-image.jpg" style="width:100%; height:100%; object-fit:cover; position:absolute; top:0; left:0;">
<div style="position:absolute; left:0; right:0; top:600px; height:651px; background:linear-gradient(to bottom, rgba(17,11,85,0), rgba(0,0,0,0.9));"></div>
<div style="position:absolute; top:800px; left:50%; transform:translateX(-50%); width:420px;">
<div style="background:rgba(45,29,133,0.92); border-radius:20px; padding:16px 24px 20px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,0.4); position:relative; overflow:hidden;">
<div style="position:absolute; top:50%; left:-10px; transform:translateY(-50%); width:20px; height:20px; background:#110b55; border-radius:50%;"></div>
<div style="position:absolute; top:50%; right:-10px; transform:translateY(-50%); width:20px; height:20px; background:#110b55; border-radius:50%;"></div>
<div style="position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg, #ffe500, #b4a6ff, #ffe500);"></div>
<p style="margin:0 0 4px; font-size:18px; font-weight:600; color:#b4a6ff; letter-spacing:1px;">톡채널 플친 전용 쿠폰</p>
<span style="font-size:48px; font-weight:900; color:#fff; letter-spacing:-1px;">3,000<span style="font-size:28px;">원</span></span>
</div>
</div>
<div style="position:absolute; top:950px; left:0; right:0; text-align:center;">
<p style="margin:0 0 8px; font-size:80px; font-weight:900; color:#fff; letter-spacing:-2.4px; line-height:1.15; text-shadow:0 4px 16px rgba(17,11,85,0.7);">키즈 가을 신상</p>
<p style="margin:0; font-size:80px; font-weight:900; color:#fff; letter-spacing:-1.6px; line-height:1.15; text-shadow:0 4px 16px rgba(17,11,85,0.7);">공구 특가 OPEN</p>
</div>
</div>

<!-- kakao-button -->
<a href="https://pf.kakao.com/_nfxkLT" style="text-decoration:none; display:block;">
<div style="width:890px; height:142px; background:#fee500; display:flex; align-items:center; justify-content:center; gap:16px;">
<div style="background:#3c1e0f; padding:6px 12px; border-radius:10px;">
<span style="font-family:Inter,sans-serif; font-size:22px; font-weight:700; color:#fff; letter-spacing:1px;">TALK</span>
</div>
<span style="font-family:Inter,sans-serif; font-size:32px; font-weight:700; color:#3c1e0f;">톡채널 친구추가 바로가기 &gt;&gt;</span>
</div>
</a>

<!-- 구매 사은품 혜택 -->
<div style="width:890px; background:#e8e6e7; padding:60px 24px 0; box-sizing:border-box; display:flex; flex-direction:column; align-items:center; gap:28px;">
<p style="margin:0; font-size:64px; font-weight:900; color:#1a0086; letter-spacing:-1.5px;">구매사은품 혜택</p>

<!-- 혜택1: 아우터 → 핫팩파우치 -->
<div style="width:100%; background:#fff; border-radius:20px; padding:32px; box-sizing:border-box; display:flex; align-items:center; gap:24px; box-shadow:0 2px 12px rgba(0,0,0,0.06);">
<div style="flex:1; min-width:0; text-align:left;">
<div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
<span style="display:inline-block; background:linear-gradient(135deg,#1a0086,#4a20d0); padding:6px 14px; border-radius:8px; font-size:20px; font-weight:700; color:#fff;">혜택 1</span>
</div>
<p style="margin:0 0 6px; font-size:28px; font-weight:700; color:#111;">아우터 구매 시</p>
<p style="margin:0 0 8px; font-size:36px; font-weight:900; color:#1a0086;">핫팩파우치 증정</p>
<p style="margin:0; font-size:20px; color:#888;">(컬러 랜덤)</p>
</div>
<div style="flex-shrink:0; width:220px; height:220px; display:flex; align-items:center; justify-content:center;">
<img src="상품이미지/사은품/핫팩파우치_그레이.png" style="width:210px; height:210px; object-fit:contain;">
</div>
</div>

<!-- 혜택2: 3만원 → 양말 -->
<div style="width:100%; background:#fff; border-radius:20px; padding:32px; box-sizing:border-box; display:flex; align-items:center; gap:24px; box-shadow:0 2px 12px rgba(0,0,0,0.06);">
<div style="flex:1; min-width:0; text-align:left;">
<div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
<span style="display:inline-block; background:linear-gradient(135deg,#1a0086,#4a20d0); padding:6px 14px; border-radius:8px; font-size:20px; font-weight:700; color:#fff;">혜택 2</span>
</div>
<p style="margin:0 0 6px; font-size:28px; font-weight:700; color:#111;">3만원 이상 구매 시</p>
<p style="margin:0 0 8px; font-size:36px; font-weight:900; color:#1a0086;">아웃도어 양말 증정</p>
</div>
<div style="flex-shrink:0; width:220px; height:220px; display:flex; align-items:center; justify-content:center;">
<img src="상품이미지/사은품/아웃도어 양말.png" style="width:210px; height:210px; object-fit:contain;">
</div>
</div>

<!-- 혜택3: 10만원 → 코듀로이 캡 -->
<div style="width:100%; background:#fff; border-radius:20px; padding:32px; box-sizing:border-box; display:flex; align-items:center; gap:24px; box-shadow:0 2px 12px rgba(0,0,0,0.06);">
<div style="flex:1; min-width:0; text-align:left;">
<div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
<span style="display:inline-block; background:linear-gradient(135deg,#1a0086,#4a20d0); padding:6px 14px; border-radius:8px; font-size:20px; font-weight:700; color:#fff;">혜택 3</span>
</div>
<p style="margin:0 0 6px; font-size:28px; font-weight:700; color:#111;">10만원 이상 구매 시</p>
<p style="margin:0 0 8px; font-size:36px; font-weight:900; color:#1a0086;">컬러블록 코듀로이 캡 증정</p>
<p style="margin:0; font-size:20px; color:#888;">(컬러 랜덤)</p>
</div>
<div style="flex-shrink:0; width:220px; height:220px; display:flex; align-items:center; justify-content:center;">
<img src="상품이미지/사은품/코듀로이 캠프캡1.jpg" style="width:210px; height:210px; object-fit:contain;">
</div>
</div>

<!-- footer -->
<div style="width:100%; background:#1a0086; padding:14px 20px; text-align:center; box-sizing:border-box;">
<span style="font-size:18px; font-weight:600; color:#fff;">* 사은품은 동일 운송장으로 출고되는 주문 건에 한하여 지급됩니다.</span>
</div>
</div>

<!-- 톡딜 혜택 -->
<div style="width:890px; background:#edeaef; padding:60px 24px 60px; box-sizing:border-box; display:flex; flex-direction:column; align-items:center; gap:28px;">
<p style="margin:0; font-size:64px; font-weight:900; color:#1a0086; letter-spacing:-1.5px;">톡딜 혜택</p>
<div style="background:#1a0086; padding:14px 28px; border-radius:30px; display:inline-flex; align-items:center; gap:8px;">
<span style="font-size:22px; font-weight:700; color:#fff;">기간 : 9/22(월) 17시 ~ 9/28(일) 16시 59분</span>
</div>
<!-- 친구추가 -->
<div style="width:100%; background:#fff; border-radius:20px; padding:28px; box-sizing:border-box;">
<p style="margin:0 0 8px; font-size:28px; font-weight:600; color:#333;">💛 '차일디' 카카오톡 플러스 친구 추가시,</p>
<p style="margin:0; font-size:42px; font-weight:900; color:#1a0086;">3천원 쿠폰 발급</p>
<p style="margin:8px 0 0; font-size:20px; color:#888;">(2만원 이상 구매시 사용 가능)</p>
</div>
<!-- 결제 혜택 -->
<div style="width:100%; background:#fff; border-radius:20px; padding:28px; box-sizing:border-box;">
<p style="margin:0 0 16px; font-size:34px; font-weight:900; color:#111;">🛒 카카오 결제 혜택</p>
<div style="display:flex; flex-direction:column; gap:14px;">
<p style="margin:0; font-size:26px; font-weight:600; color:#111;">장바구니 쿠폰 (매일 17시 발급) : 2만원 이상 <b style="color:#1a0086;">7% 할인</b> <span style="color:#999;">(최대 5천원)</span></p>
<p style="margin:0; font-size:26px; font-weight:600; color:#111;">카카오페이 즉시할인 : 10만원 이상 <b style="color:#1a0086;">7% 할인</b> <span style="color:#999;">(최대 30만원 / 인당 3회)</span></p>
</div>
</div>
<!-- 무료배송 -->
<div style="width:100%; background:#fff; border-radius:20px; padding:28px; box-sizing:border-box;">
<p style="margin:0; font-size:38px; font-weight:900; color:#1a0086;">🚚 전상품 무료배송</p>
</div>
</div>

</div>
`;

const html = `${banner}
<!-- ===== 상품 리스트 (${items.length}개) ===== -->
<table style="width:890px; border-spacing:0; border-collapse:collapse; margin:0 auto;">
<tbody>
${cards}
</tbody>
</table>
</center>
`;

writeFileSync(resolve('_작업소스/260911/작업용.html'), html, 'utf-8');
console.log(`✅ 260911 작업용.html 생성 완료 (${items.length}개 구성, 추천 딱지 ${items.filter(i=>i.bigo==='추천').length}개)`);
