import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { resolve } from 'path';
import { mkdirSync, existsSync, unlinkSync, statSync, readdirSync } from 'fs';

const BASE = resolve('.');
const SOURCE = resolve(BASE, '_src/260903');
const OUTPUT = resolve(BASE, '_src/260903/output');
const CARDS_DIR = resolve(OUTPUT, 'cards');
[CARDS_DIR].forEach(d => { if (!existsSync(d)) mkdirSync(d, { recursive: true }); });

const htmlPath = 'file://' + resolve(SOURCE, '작업용.html');
const QUALITY = 92;

async function main() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 890, height: 5000, deviceScaleFactor: 2 });
  await page.goto(htmlPath, { waitUntil: 'networkidle0', timeout: 60000 });

  const sections = await page.evaluate(() => {
    const result = {};
    // 구매사은품 혜택
    const benefitsEl = document.querySelector('div[style*="background:#e8e6e7"]');
    if (benefitsEl) {
      const rect = benefitsEl.getBoundingClientRect();
      result.benefits = { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }
    // 카드
    const tds = document.querySelectorAll('table td');
    const cards = [];
    tds.forEach(td => {
      const link = td.querySelector('a');
      if (!link) return;
      const rect = td.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) cards.push({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
    });
    result.cards = cards;
    return result;
  });

  // 구매사은품 혜택 캡처
  if (sections.benefits) {
    await page.screenshot({ path: resolve(OUTPUT, '03_benefits.png'), clip: sections.benefits });
    await sharp(resolve(OUTPUT, '03_benefits.png')).jpeg({ quality: QUALITY }).toFile(resolve(OUTPUT, '03_benefits.jpg'));
    unlinkSync(resolve(OUTPUT, '03_benefits.png'));
    console.log('✅ 03_benefits.jpg 캡처 완료 (' + Math.round(statSync(resolve(OUTPUT, '03_benefits.jpg')).size/1024) + 'KB)');
  }

  // 카드 캡처
  console.log('[카드 캡처]', sections.cards.length, '개');
  for (let i = 0; i < sections.cards.length; i++) {
    const card = sections.cards[i];
    const num = String(i + 1).padStart(2, '0');
    await page.screenshot({ path: resolve(CARDS_DIR, num + '.png'), clip: card });
  }
  await browser.close();

  // JPG 변환
  let count = 0;
  for (let i = 1; i <= sections.cards.length; i++) {
    const num = String(i).padStart(2, '0');
    const png = resolve(CARDS_DIR, num + '.png');
    const jpg = resolve(CARDS_DIR, num + '.jpg');
    if (existsSync(png)) { await sharp(png).jpeg({ quality: QUALITY }).toFile(jpg); unlinkSync(png); count++; }
  }
  console.log('✅ 카드', count, '개 JPG 변환 완료');
  console.log('✅ 전체 완료!');
}
main().catch(e => { console.error('❌', e); process.exit(1); });
