import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { resolve } from 'path';
import { mkdirSync, existsSync, readdirSync, unlinkSync, statSync } from 'fs';

const BASE = resolve('.');
const SOURCE = resolve(BASE, '02_source/260903');
const OUTPUT = resolve(BASE, '03_output/260903/before_upload');
const CARDS_DIR = resolve(OUTPUT, 'cards');
const DETAIL_DIR = resolve(OUTPUT, 'detail_image');

[CARDS_DIR, DETAIL_DIR].forEach(d => { if (!existsSync(d)) mkdirSync(d, { recursive: true }); });

const htmlPath = `file://${resolve(SOURCE, '작업용.html')}`;
const QUALITY = 92;

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  // 2x 해상도로 캡처 (고화질)
  await page.setViewport({ width: 890, height: 5000, deviceScaleFactor: 2 });
  await page.goto(htmlPath, { waitUntil: 'networkidle0', timeout: 60000 });

  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  console.log(`페이지 전체 높이: ${bodyHeight}px`);

  // ===== 섹션별 좌표 측정 =====
  const sections = await page.evaluate(() => {
    const result = {};
    
    // 프로모 배너 (로고+배경+쿠폰+타이틀) — 카카오 버튼 직전까지
    const promoBanner = document.querySelector('div[style*="background:#110b55"]');
    if (promoBanner) {
      const rect = promoBanner.getBoundingClientRect();
      // 배너 안의 카카오 버튼 링크 찾기
      const kakaoLink = promoBanner.querySelector('a[href*="pf.kakao.com"]');
      if (kakaoLink) {
        const kakaoRect = kakaoLink.getBoundingClientRect();
        result.mainVisual = { x: 0, y: 0, width: 890, height: kakaoRect.y };
        result.kakaoChannel = { x: kakaoRect.x, y: kakaoRect.y, width: kakaoRect.width, height: kakaoRect.height };
      } else {
        result.mainVisual = { x: 0, y: 0, width: 890, height: rect.height };
      }
    }
    
    // 구매사은품 혜택
    const benefitsEl = document.querySelector('div[style*="background:#e8e6e7"]');
    if (benefitsEl) {
      const rect = benefitsEl.getBoundingClientRect();
      result.benefits = { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }
    
    // 톡딜 혜택
    const tokdealEl = document.querySelector('div[style*="background:#edeaef"]');
    if (tokdealEl) {
      const rect = tokdealEl.getBoundingClientRect();
      result.tokdeal = { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }
    
    // 상품 카드
    const tds = document.querySelectorAll('table td');
    const cards = [];
    tds.forEach(td => {
      const link = td.querySelector('a');
      if (!link) return;
      const rect = td.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        cards.push({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
      }
    });
    result.cards = cards;
    
    return result;
  });

  // ===== 캡처 =====
  // 01_main_visual: 프로모 배너 (카카오 버튼 미포함)
  if (sections.mainVisual) {
    await page.screenshot({
      path: resolve(OUTPUT, '01_main_visual.png'),
      clip: sections.mainVisual
    });
    console.log(`✅ 01_main_visual.png (0~${sections.mainVisual.height}px)`);
  }

  // 02_kakao_channel: 카카오 버튼만
  if (sections.kakaoChannel) {
    await page.screenshot({
      path: resolve(OUTPUT, '02_kakao_channel.png'),
      clip: sections.kakaoChannel
    });
    console.log(`✅ 02_kakao_channel.png`);
  }

  // 03_benefits: 구매사은품 혜택
  if (sections.benefits) {
    await page.screenshot({
      path: resolve(OUTPUT, '03_benefits.png'),
      clip: sections.benefits
    });
    console.log(`✅ 03_benefits.png`);
  }

  // 04_tokdeal_benefits: 톡딜 혜택
  if (sections.tokdeal) {
    await page.screenshot({
      path: resolve(OUTPUT, '04_tokdeal_benefits.png'),
      clip: sections.tokdeal
    });
    console.log(`✅ 04_tokdeal_benefits.png`);
  }

  // 카드 캡처
  console.log(`\n[상품 카드 캡처] ${sections.cards.length}개`);
  for (let i = 0; i < sections.cards.length; i++) {
    const card = sections.cards[i];
    const num = String(i + 1).padStart(2, '0');
    await page.screenshot({
      path: resolve(CARDS_DIR, `${num}.png`),
      clip: card
    });
    if ((i + 1) % 20 === 0 || i === 0) {
      console.log(`  카드 ${num} 완료`);
    }
  }
  console.log(`✅ 카드 ${sections.cards.length}개 캡처 완료`);

  await browser.close();

  // ===== Sharp 최적화 (PNG → JPG, quality 92%) =====
  console.log(`\n[이미지 최적화] quality: ${QUALITY}%`);

  const topImages = ['01_main_visual', '02_kakao_channel', '03_benefits', '04_tokdeal_benefits'];
  for (const name of topImages) {
    const pngPath = resolve(OUTPUT, `${name}.png`);
    const jpgPath = resolve(OUTPUT, `${name}.jpg`);
    if (existsSync(pngPath)) {
      await sharp(pngPath).jpeg({ quality: QUALITY }).toFile(jpgPath);
      const size = statSync(jpgPath).size;
      console.log(`  ${name}: ${(size / 1024).toFixed(0)}KB`);
      unlinkSync(pngPath);
    }
  }

  let cardCount = 0;
  for (let i = 1; i <= sections.cards.length; i++) {
    const num = String(i).padStart(2, '0');
    const pngPath = resolve(CARDS_DIR, `${num}.png`);
    const jpgPath = resolve(CARDS_DIR, `${num}.jpg`);
    if (existsSync(pngPath)) {
      await sharp(pngPath).jpeg({ quality: QUALITY }).toFile(jpgPath);
      unlinkSync(pngPath);
      cardCount++;
    }
  }
  console.log(`  카드: ${cardCount}개 변환 완료`);

  // 카드 평균 사이즈
  const cardFiles = readdirSync(CARDS_DIR).filter(f => f.endsWith('.jpg'));
  const totalSize = cardFiles.reduce((sum, f) => sum + statSync(resolve(CARDS_DIR, f)).size, 0);
  console.log(`  카드 평균: ${(totalSize / cardFiles.length / 1024).toFixed(0)}KB`);

  console.log('\n✅ 전체 완료!');
}

main().catch(err => { console.error('❌ 에러:', err); process.exit(1); });
