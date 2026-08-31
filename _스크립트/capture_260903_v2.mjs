import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { resolve } from 'path';
import { mkdirSync, existsSync, readdirSync, unlinkSync, statSync } from 'fs';

const BASE = resolve('.');
const SOURCE = resolve(BASE, '_작업소스/260903');
const OUTPUT = resolve(BASE, '_작업소스/260903/캡처결과');
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

  // 카드 좌표 측정
  const sections = await page.evaluate(() => {
    const result = {};
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

  // 카드 캡처
  console.log('[상품 카드 캡처]', sections.cards.length, '개');
  for (let i = 0; i < sections.cards.length; i++) {
    const card = sections.cards[i];
    const num = String(i + 1).padStart(2, '0');
    await page.screenshot({
      path: resolve(CARDS_DIR, num + '.png'),
      clip: card
    });
    if ((i + 1) % 20 === 0 || i === 0) {
      console.log('  카드', num, '완료');
    }
  }
  console.log('✅ 카드', sections.cards.length, '개 캡처 완료');

  await browser.close();

  // PNG → JPG 변환
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
