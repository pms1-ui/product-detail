// 260911 미리보기 HTML 2종 최초 생성
//  - 미리보기/260911_로컬확인.html   (카드=로컬 캡처결과, 인터넷 없이 확인)
//  - 미리보기/260911_카카오톡딜.html  (카드=S3 URL, 실배포 확인)
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const SERVER = '2609_2_kakaotalk_deal';
const S3 = `https://aws-childy-image.s3.ap-northeast-2.amazonaws.com/img/outdoor2026/promotion/${SERVER}`;
// 실제 S3 구조: 상단 4장은 SERVER 바로 밑, 카드는 SERVER/card/ (단수)
const WORK = resolve('_작업소스/260911/작업용.html');
mkdirSync(resolve('미리보기'), { recursive: true });

// 작업용.html에서 카드 상세링크 순서 추출
const work = readFileSync(WORK, 'utf8');
const links = [...work.matchAll(/kakao_detail\/([^"]+\.html)/g)].map(m => m[1]);
console.log('카드 링크 개수:', links.length);

function buildRows(imgSrcFn) {
  let rows = '';
  for (let i = 0; i < links.length; i += 2) {
    const j1 = String(i + 1).padStart(2, '0');
    let tr = '<tr>' +
      `<td style="width:50%; vertical-align:top; padding:2px;"><a href="${S3}/kakao_detail/${links[i]}"><img src="${imgSrcFn(j1)}" style="max-width:100%; width:100%; display:block;"></a></td>`;
    if (i + 1 < links.length) {
      const j2 = String(i + 2).padStart(2, '0');
      tr += `<td style="width:50%; vertical-align:top; padding:2px;"><a href="${S3}/kakao_detail/${links[i + 1]}"><img src="${imgSrcFn(j2)}" style="max-width:100%; width:100%; display:block;"></a></td>`;
    } else {
      tr += '<td style="width:50%;"></td>';
    }
    tr += '</tr>\n';
    rows += tr;
  }
  return rows;
}

// 상단 공통 이미지 4장 (imgBase로 로컬/ S3 전환)
function topImages(imgBase) {
  return `<p align="center"><img src="${imgBase}/01_main_visual.jpg" style="max-width:100%; width:100%; display:block;"></p>
<p align="center"><a href="https://pf.kakao.com/_nfxkLT"><img src="${imgBase}/02_kakao_channel.jpg" style="max-width:100%; width:100%; display:block;"></a></p>
<p align="center"><img src="${imgBase}/03_benefits.jpg" style="max-width:100%; width:100%; display:block;"></p>
<p align="center"><img src="${imgBase}/04_tokdeal_benefits.jpg" style="max-width:100%; width:100%; display:block;"></p>
`;
}

function page(title, top, rows) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title></head>
<body style="margin:0; padding:0; background:#fff;">
<div style="max-width:900px; margin:0 auto;">
${top}<table style="width:100%; border-spacing:0; border-collapse:collapse;"><tbody>
${rows}</tbody></table>
</div>
</body></html>`;
}

// 1) 로컬확인용 (상단+카드 = 로컬 캡처결과)
const localTop = topImages('../_작업소스/260911/캡처결과');
const localRows = buildRows(j => `../_작업소스/260911/캡처결과/cards/${j}.jpg`);
writeFileSync(resolve('미리보기/260911_로컬확인.html'), page('260911 로컬확인', localTop, localRows), 'utf8');
console.log('✅ 260911_로컬확인.html 생성');

// 2) 실배포확인용 (상단 4장=SERVER 바로 밑, 카드=SERVER/card/)
const s3Top = topImages(`${S3}`);
const s3Rows = buildRows(j => `${S3}/card/${j}.jpg`);
writeFileSync(resolve('미리보기/260911_카카오톡딜.html'), page('260911 카카오톡딜', s3Top, s3Rows), 'utf8');
console.log('✅ 260911_카카오톡딜.html 생성');

// 3) 카카오 최종 소스 (kakao_final .html/.txt) — 스타일 없는 단순 셀, 상단 detail_image + 카드
function finalTop() {
  return `<p align="center"><img src="${S3}/01_main_visual.jpg"></p>
<p align="center"><a href="https://pf.kakao.com/_nfxkLT"><img src="${S3}/02_kakao_channel.jpg"></a></p>
<p align="center"><img src="${S3}/03_benefits.jpg"></p>
<p align="center"><img src="${S3}/04_tokdeal_benefits.jpg"></p>
`;
}
let finalRows = '';
for (let i = 0; i < links.length; i += 2) {
  const j1 = String(i + 1).padStart(2, '0');
  let tr = '<tr><td><a href="' + `${S3}/kakao_detail/${links[i]}` + '"><img src="' + `${S3}/card/${j1}.jpg` + '"></a></td>';
  if (i + 1 < links.length) {
    const j2 = String(i + 2).padStart(2, '0');
    tr += '<td><a href="' + `${S3}/kakao_detail/${links[i + 1]}` + '"><img src="' + `${S3}/card/${j2}.jpg` + '"></a></td>';
  }
  tr += '</tr>\n';
  finalRows += tr;
}
const finalSrc = finalTop() + '<table><tbody>\n' + finalRows + '</tbody></table>\n';
writeFileSync(resolve('_작업소스/260911/kakao_final_260911.html'), finalSrc, 'utf8');
writeFileSync(resolve('_작업소스/260911/kakao_final_260911.txt'), finalSrc, 'utf8');
console.log('✅ kakao_final_260911.html/.txt 생성');
