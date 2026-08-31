// 260903 배포용 HTML 2종 재생성 (S3 URL 참조, 남은 85개 카드)
//  - 미리보기/260903_카카오톡딜.html  (스타일 있는 td)
//  - _작업소스/260903/kakao_final_260903.html  (스타일 없는 td)
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const WORK = resolve('_작업소스/260903/작업용.html');
const S3 = 'https://aws-childy-image.s3.ap-northeast-2.amazonaws.com/img/outdoor2026/promotion/2609_kakaotalk_deal';

const work = readFileSync(WORK, 'utf8');
const links = [...work.matchAll(/kakao_detail\/([^"]+\.html)/g)].map(m => m[1]);
console.log('링크 개수:', links.length);

function buildRows(cellFn) {
  let rows = '';
  for (let i = 0; i < links.length; i += 2) {
    const j1 = String(i + 1).padStart(2, '0');
    let tr = '<tr>' + cellFn(links[i], j1);
    if (i + 1 < links.length) {
      const j2 = String(i + 2).padStart(2, '0');
      tr += cellFn(links[i + 1], j2);
    }
    tr += '</tr>\n';
    rows += tr;
  }
  return rows;
}

function replaceCards(file, openTag, closeTag, rows) {
  const txt = readFileSync(file, 'utf8');
  const s = txt.indexOf(openTag);
  const e = txt.indexOf(closeTag);
  if (s === -1 || e === -1) throw new Error('마커 못 찾음: ' + file);
  const out = txt.slice(0, s + openTag.length) + '\n' + rows + txt.slice(e);
  writeFileSync(file, out, 'utf8');
}

// 1) 카카오톡딜.html (스타일 있는 셀)
const cellStyled = (link, jpg) =>
  `<td style="width:50%; vertical-align:top; padding:2px;">` +
  `<a href="${S3}/kakao_detail/${link}">` +
  `<img src="${S3}/cards/${jpg}.jpg" style="max-width:100%; width:100%; display:block;"></a></td>`;
replaceCards(
  resolve('미리보기/260903_카카오톡딜.html'),
  '<table style="width:100%; border-spacing:0; border-collapse:collapse;"><tbody>',
  '</tbody></table>',
  buildRows(cellStyled)
);
console.log('✅ 260903_카카오톡딜.html 재생성');

// 2) kakao_final (단순 셀)
const cellPlain = (link, jpg) =>
  `<td><a href="${S3}/kakao_detail/${link}"><img src="${S3}/cards/${jpg}.jpg"></a></td>`;
replaceCards(
  resolve('_작업소스/260903/kakao_final_260903.html'),
  '<table><tbody>',
  '</tbody></table>',
  buildRows(cellPlain)
);
console.log('✅ kakao_final_260903.html 재생성');
