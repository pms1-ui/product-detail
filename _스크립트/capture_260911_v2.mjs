import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { resolve } from 'path';
import { mkdirSync, existsSync, readdirSync, unlinkSync, statSync } from 'fs';

const BASE = resolve('.');
const SOURCE = resolve(BASE, '_작업소스/260911');
const OUTPUT = resolve(BASE, '_작업소스/260911/메인&카드 캡처결과');
const CARDS_DIR = resolve(OUTPUT, 'cards');

[CARDS_DIR].forEach(d => { if (!existsSync(d)) mkdirSync(d, { recursive: true }); });

const htmlPath = `file://${resolve(SOURCE, '작업용.html')}`;
const QUALITY = 92;

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 890, height: 5000, deviceScaleFactor: 2 });
  await page.goto(htmlPath, { waitUntil: 'networkidle0', timeout: 60000 });

  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  console.log('페이지 전체 높이:', bodyHeight, 'px');

  const sections = await page.evaluate(() => {
    const rectOf = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
    const result = {};

    // 01_main_visual: 로고바(top-bar) + 메인비주얼(height:1251px) 합친 영역
    const topbar = document.querySelector('div[style*="background:#1a0086"]');
    const mainv = document.querySelector('div[style*="height:1251px"]');
    if (topbar && mainv) {
      const a = topbar.getBoundingClientRect(), b = mainv.getBoundingClientRect();
      result.main = { x: a.x, y: a.y, width: a.width, height: (b.y + b.height) - a.y };
    }
    // 02_kakao_channel: 노란 톡채널 버튼
    const kakao = document.querySelector('div[style*="background:#fee500"]');
    if (kakao) result.kakao = rectOf(kakao);
    // 03_benefits: 구매사은품 혜택 (#e8e6e7)
    const benefits = document.querySelector('div[style*="background:#e8e6e7"]');
    if (benefits) result.benefits = rectOf(benefits);
    // 04_tokdeal_benefits: 톡딜 혜택 (#edeaef)
    const tokdeal = document.querySelector('div[style*="background:#edeaef"]');
    if (tokdeal) result.tokdeal = rectOf(tokdeal);

    // 카드
    const cards = [];
    document.querySelectorAll('table td').forEach(td => {
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

  // === 상단 공통 이미지 4장 캡처 ===
  const topShots = [
    ['main', '01_main_visual'],
    ['kakao', '02_kakao_channel'],
    ['benefits', '03_benefits'],
    ['tokdeal', '04_tokdeal_benefits'],
  ];
  for (const [key, name] of topShots) {
    if (!sections[key]) { console.log('⚠️ 영역 못 찾음:', name); continue; }
    const png = resolve(OUTPUT, name + '.png');
    const jpg = resolve(OUTPUT, name + '.jpg');
    await page.screenshot({ path: png, clip: sections[key] });
    await sharp(png).jpeg({ quality: QUALITY }).toFile(jpg);
    unlinkSync(png);
    console.log('✅', name + '.jpg', Math.round(statSync(jpg).size / 1024) + 'KB');
  }

  console.log('[상품 카드 캡처]', sections.cards.length, '개');
  for (let i = 0; i < sections.cards.length; i++) {
    const num = String(i + 1).padStart(2, '0');
    await page.screenshot({ path: resolve(CARDS_DIR, num + '.png'), clip: sections.cards[i] });
    if ((i + 1) % 10 === 0 || i === 0) console.log('  카드', num, '완료');
  }
  console.log('✅ 카드', sections.cards.length, '개 캡처 완료');
  await browser.close();

  console.log('[이미지 최적화] quality:', QUALITY, '%');
  let cardCount = 0;
  for (let i = 1; i <= sections.cards.length; i++) {
    const num = String(i).padStart(2, '0');
    const pngPath = resolve(CARDS_DIR, num + '.png');
    const jpgPath = resolve(CARDS_DIR, num + '.jpg');
    if (existsSync(pngPath)) {
      await sharp(pngPath).jpeg({ quality: QUALITY }).toFile(jpgPath);
      unlinkSync(pngPath);
      cardCount++;
    }
  }
  console.log('  카드:', cardCount, '개 JPG 변환 완료');

  const cardFiles = readdirSync(CARDS_DIR).filter(f => f.endsWith('.jpg'));
  const totalSize = cardFiles.reduce((sum, f) => sum + statSync(resolve(CARDS_DIR, f)).size, 0);
  console.log('  카드 평균:', Math.round(totalSize / cardFiles.length / 1024), 'KB');
  console.log('\n✅ 전체 완료!');
}

main().catch(err => { console.error('❌ 에러:', err); process.exit(1); });
