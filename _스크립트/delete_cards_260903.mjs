// 260903 카드 삭제 + 재번호 스크립트 (1회성)
// 삭제 대상(HTML 구성번호 기준): 18,47,58,60,63,67,72,81,82,83,88,89,91
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const HTML = resolve('_작업소스/260903/작업용.html');
const DELETE = new Set([18, 47, 58, 60, 63, 67, 72, 81, 82, 83, 88, 89, 91]);

let html = readFileSync(HTML, 'utf8');

// 1) tbody 영역 분리
const tbodyOpen = html.indexOf('<tbody>');
const tbodyClose = html.indexOf('</tbody>');
if (tbodyOpen === -1 || tbodyClose === -1) throw new Error('tbody 못 찾음');

const head = html.slice(0, tbodyOpen + '<tbody>'.length);
const body = html.slice(tbodyOpen + '<tbody>'.length, tbodyClose);
const tail = html.slice(tbodyClose);

// 2) body 안의 카드 td 블록 추출
// 카드 td 시작 마커: <td style="width:445px; padding:4px; vertical-align:top;">
const TD_START = '<td style="width:445px; padding:4px; vertical-align:top;">';
const parts = body.split(TD_START);
// parts[0] = 첫 td 이전(<tr> 등), 이후 각 조각은 "카드내용...</td>...(다음 tr/td 잔여)"
// 각 조각에서 카드 = 처음부터 첫 </td> 까지. 그 뒤 잔여(</tr><tr> 등)는 버리고 우리가 재조립.
const cards = [];
for (let i = 1; i < parts.length; i++) {
  const seg = parts[i];
  const endIdx = seg.indexOf('</td>');
  if (endIdx === -1) throw new Error('카드 ' + i + ' </td> 못 찾음');
  const cardInner = seg.slice(0, endIdx); // <a>...</a> 내부
  cards.push(cardInner);
}

console.log('추출된 카드 수:', cards.length);
if (cards.length !== 98) throw new Error('카드 98개가 아님: ' + cards.length);

// 3) 각 카드의 구성번호 확인 + 삭제 필터
const kept = [];
cards.forEach((c, idx) => {
  const num = idx + 1; // 원래 구성번호
  const m = c.match(/구성 (\d{2})<\/span>/);
  if (!m) throw new Error('카드 ' + num + ' 구성라벨 못 찾음');
  const label = parseInt(m[1], 10);
  if (label !== num) throw new Error(`순번 불일치: DOM ${num} vs 라벨 ${label}`);
  if (DELETE.has(num)) {
    console.log('  삭제:', String(num).padStart(2, '0'));
    return;
  }
  kept.push(c);
});

console.log('남은 카드 수:', kept.length);

// 4) 재번호: kept의 구성 NN 라벨을 01..N 으로
const renumbered = kept.map((c, i) => {
  const newNum = String(i + 1).padStart(2, '0');
  return c.replace(/구성 \d{2}<\/span>/, '구성 ' + newNum + '</span>');
});

// 5) tr 재조립 (2개씩)
let rebuilt = '\n';
for (let i = 0; i < renumbered.length; i += 2) {
  rebuilt += '<tr>\n';
  rebuilt += TD_START + renumbered[i] + '</td>\n';
  if (i + 1 < renumbered.length) {
    rebuilt += TD_START + renumbered[i + 1] + '</td>\n';
  }
  rebuilt += '</tr>\n';
}

const newHtml = head + rebuilt + tail;
writeFileSync(HTML, newHtml, 'utf8');
console.log('✅ 저장 완료. 최종 카드 수:', renumbered.length);
