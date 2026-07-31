import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const outputDir = path.join(__dirname, 'generated');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

async function generateImage(prompt, filename, size) {
  console.log(`\nGenerating: ${filename} (${size})...`);
  try {
    const response = await openai.images.generate({
      model: 'gpt-image-2',
      prompt,
      n: 1,
      size,
    });
    
    const imageData = response.data[0].b64_json;
    const buffer = Buffer.from(imageData, 'base64');
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, buffer);
    console.log(`  ✅ Saved: ${filename} (${(buffer.length/1024).toFixed(1)}KB)`);
    return filepath;
  } catch (err) {
    console.error(`  ❌ Error: ${err.message}`);
    if (err.error) console.error(`  Detail:`, err.error.message);
    return null;
  }
}

async function main() {
  // 1. 메인 이미지 (890x1202 비율 → 1024x1536이 가장 근접)
  await generateImage(
    `Korean kids outdoor fashion brand "차일디(CHILDY)" summer live commerce promotional banner.
    
Layout (vertical banner, ratio ~3:4):
- Top area: light sky blue / mint background with tropical palm leaves on the edges
- Top center: brand collaboration logos "차일디 × 톡딜" small text
- Main title area: Large bold text "썸머 라이브" in dark blue, below it "톡딜 OPEN" in white 3D embossed style text with a heart shape inside the O
- Period info: Green capsule-shaped badge with white text "기간: 8/6(수) 0시 ~ 8/9(토) 24시"
- Center: 4 young children (age 3-5) standing side by side wearing cute summer outdoor clothes (t-shirts, shorts, hats), cheerful poses, white/bright background
- Background elements: ocean, beach, palm trees, bird silhouettes for vacation mood
- Bottom: Large orange coupon-shaped box with rounded edges and semicircle cutouts on sides, containing "플친 전용 쿠폰" and big text "2,000원 추가 할인"
- Bottom corners: tropical green leaves as frame decoration

Color palette: sky blue, mint green, white, orange accent for coupon, cheerful summer pastels
Style: Cute Korean kids fashion e-commerce banner, bright and clean, rounded fonts, playful but professional`,
    '01_main_visual.png',
    '1024x1536'
  );

  await new Promise(r => setTimeout(r, 3000));

  // 2. 방송중 혜택 (890x2768 → 매우 긴 세로. 1024x1536으로 2장 생성 후 합치기 or 1장으로)
  // 1장으로 핵심 내용만 담자
  await generateImage(
    `Korean live commerce broadcast benefits infographic banner for kids outdoor clothing brand "차일디(CHILDY)".

Layout (vertical, long format):
- Background: soft pastel mint/green color
- All content inside white rounded rectangle cards with generous padding

Section 1 - "BENEFIT 01 구매 혜택":
- Title in rounded border badge "BENEFIT 01" with bold text "구매 혜택" below
- Content: "방송시간: 8월 9일 오전 11시 30분"
- "라이브 당일, 3만원 이상 구매시 아웃도어 양말 증정 (주문번호당 1회)"
- Show image of outdoor hiking socks

Section 2 - "BENEFIT 02 선착순 혜택":
- "5만원 이상 구매고객 선착순 10명 → 아웃도어 바디백 블랙 증정"
- "구매인증 선착순 5명 → 에센셜 파노라마 반팔티 증정"
- Show images of black body bag and t-shirt
- Small note: "※컬러 랜덤 & 구매사이즈로 발송"

Section 3 - "BENEFIT 03 라이브 이벤트":
- Two-column grid layout
- Left card: green circle badge "소통왕 5명" with red "LIVE" label, prize "투썸 아메리카노 쿠폰"
- Right card: green circle badge "구매인증 10명" with red "LIVE" label, prize "아웃도어 쿨링 상하복"

Bottom note boxes in light green: 
- "※방송중 구매시에만 증정됩니다"
- "※사은품은 선착순으로 증정, 마감시 예고없이 종료"

Color: pastel mint background, white cards, red LIVE badges, black bold text, green accent badges
Style: Clean Korean e-commerce event infographic, cute and friendly, rounded elements, generous whitespace`,
    '02_broadcast_benefits.png',
    '1024x1536'
  );

  await new Promise(r => setTimeout(r, 3000));

  // 3. 톡딜 혜택 (890x1195 → 1024x1536 근접)
  await generateImage(
    `Korean "Talk Deal" (톡딜) benefits promotional infographic for kids outdoor brand "차일디(CHILDY)".

Layout (vertical poster, ~3:4 ratio):
- Background: soft pastel mint/light green color
- Top center: Brand name "차일디" in clean font
- Main title: Large bold "톡딜 혜택" with "톡딜" in red color
- Period badge: Orange rounded capsule bar with white text "8/6(수) 0시 ~ 8/9(토) 24시"

Main content area - white rounded rectangle card with 2x2 grid of benefits:

Top-left "혜택 1":
- Fluorescent yellow label "·혜택 1·"
- Text: "톡딜 기간 동안 쿠폰 발급"
- Yellow-bordered ticket/coupon graphic showing "2,000원"
- "카카오톡 플러스 친구 추가시 발급"

Top-right "혜택 2":
- "·혜택 2·" label
- "장바구니 쿠폰"
- Three coupon tiers:
  "① 2만원 이상 5% (최대 2천원)"
  "② 5만원 이상 5% (최대 5천원)"  
  "③ 10만원 이상 7% (최대 7만원)"

Bottom-left "혜택 3":
- "·혜택 3·" label
- "카카오페이 머니로 1만원 이상 결제시"
- Large red "7% 추가할인"
- KakaoPay logo/icon
- "(최대 2만원, 횟수 제한 없음)"

Bottom-right "혜택 4":
- "·혜택 4·" label
- "전상품"
- Large "무료배송" with delivery truck icon
- "Free" text

Color: mint background, white card, red for key numbers (2000원, 7%), fluorescent yellow labels, black text
Style: Clean Korean shopping promotion infographic, bright pastels, rounded shapes, bold sans-serif fonts for prices`,
    '03_talk_deal.png',
    '1024x1536'
  );

  console.log('\n\n=== All done! ===');
}

main().catch(console.error);
