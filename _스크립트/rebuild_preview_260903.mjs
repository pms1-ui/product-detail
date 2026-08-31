// 260903 로컬확인 프리뷰 재생성 (작업용.html의 남은 카드 링크 + cards/01~85.jpg)
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const WORK = resolve('_작업소스/260903/작업용.html');
const PREVIEW = resolve('미리보기/260903_로컬확인.html');
const S3 = 'https://aws-childy-image.s3.ap-northeast-2.amazonaws.com/img/outdoor2026/promotion/2609_kakaotalk_deal';

// 1) 작업용.html에서 상세링크 순서 추출 (남은 85개)
const work = readFileSync(WORK, 'utf8');
const links = [...work.matchAll(/kakao_detail\/([^"]+\.html)/g)].map(m => m[1]);
console.log('링크 개수:', links.length);

// 2) 카드 셀 생성 함수
const cell = (link, jpgNum) =>
  `<td style="width:50%; vertical-align:top; padding:2px;">` +
  `<a href="${S3}/kakao_detail/${link}">` +
  `<img src="../_작업소스/260903/캡처결과/cards/${jpgNum}.jpg" style="max-width:100%; width:100%; display:block;"></a></td>`;

// 3) 2개씩 tr 묶기
let rows = '';
for (let i = 0; i < links.length; i += 2) {
  const jpg1 = String(i + 1).padStart(2, '0');
  let tr = '<tr>' + cell(links[i], jpg1);
  if (i + 1 < links.length) {
    const jpg2 = String(i + 2).padStart(2, '0');
    tr += cell(links[i + 1], jpg2);
  }
  tr += '</tr>\n';
  rows += tr;
}

// 4) 기존 프리뷰의 헤더/푸터 유지, 카드 tr만 교체
const preview = readFileSync(PREVIEW, 'utf8');
const openTag = '<table style="width:100%; border-spacing:0; border-collapse:collapse;"><tbody>\n';
const closeTag = '</tbody></table>';
const startIdx = preview.indexOf(openTag);
const endIdx = preview.indexOf(closeTag);
if (startIdx === -1 || endIdx === -1) throw new Error('프리뷰 table 마커 못 찾음');

const head = preview.slice(0, startIdx + openTag.length);
const tail = preview.slice(endIdx);
const newPreview = head + rows + tail;
writeFileSync(PREVIEW, newPreview, 'utf8');
console.log('✅ 프리뷰 재생성 완료. 카드', links.length, '개');
