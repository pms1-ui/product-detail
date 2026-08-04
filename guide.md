# 카카오 톡딜 상세페이지 작업 가이드

## 프로젝트 개요
- **목적**: 카카오 스토어 톡딜 묶음상품 상세페이지 제작
- **구성**: 89개 상품 카드 (2열 그리드) + 상단 프로모션 이미지
- **최종 산출물**: `output-for-kakao.html` (카카오 상품상세 HTML 편집기에 붙여넣기용)

---

## 작업 순서 (A to Z)

### 1. 엑셀 데이터 준비
- `final/new.xlsx` 에 89개 상품 데이터 정리
  - A열: 순서 (1~89)
  - B열: 품번
  - C열: 상품명
  - D열: 정상가 (택가)
  - E열: 톡딜가
  - F열: 할인율 (자동계산)
  - G열: 쿠폰가 (톡딜 혜택가)
  - H열: 최종 할인율 = `ROUND(1 - G/D, 2)`

### 2. index.html 메인 작업물 구성
- 상단 프로모션 영역 (HTML + 인라인 CSS)
  - 메인 비주얼 (로고, 배경, 쿠폰, 타이틀)
  - 카카오 톡채널 친구추가 버튼
  - 방송 혜택 (양말/바디백/반팔티 증정)
  - 톡딜 혜택 (쿠폰, 장바구니, 카카오페이, 무료배송)
- 하단 상품 카드 89개 (table 2열 배치)

### 3. 가격 데이터 업데이트
- 엑셀(`final/new.xlsx`) 기준으로 89개 상품의 가격 일괄 반영
  - 정상가 (D열 택가)
  - 톡딜가 (E열)
  - 쿠폰가 (G열 톡딜 혜택가)
  - 할인율 = `ROUND((1 - 쿠폰가/택가) * 100)` %
- 기존 레거시 쿠폰가 제거 후 새로 삽입

### 4. 컬러칩 설정
- `update-colorchips.js` (현재 삭제됨, 이미 적용 완료)
- 엑셀의 상품상세코드에서 컬러코드 추출 → 컬러맵 매핑
- 예시: LGN = `#d0e3c7`, BLK = `#111111`, OWH = `#fafaf5` 등

### 5. 상품 카드 디자인 조정
- **상품명**: 29px (원래 32px에서 10% 축소, 두줄 넘침 방지)
- **정상가 행**: 26px 회색 취소선 + 우측 할인율(40px 빨강)
- **톡딜가 행**: 30px bold 네이비(#1e3a8a)
- **쿠폰가 행**: 33px bold 빨강(#dc2626)
- **세로 간격**: 세 행 모두 `margin-bottom:8px` 균등

### 6. 상단 영역 이미지 변환
- 상단 HTML 영역을 puppeteer로 캡처 → 이미지로 변환
- 이유: 카카오 상품상세 편집기에서 복잡한 CSS가 깨지므로
- 생성 파일 (JPG, quality 85):
  - `01_main_visual.jpg` (375KB)
  - `02_kakao_channel.jpg` (21KB)
  - `03_broadcast_benefits.jpg` (248KB)
  - `04_tokdeal_benefits.jpg` (196KB)
- 서버 업로드 경로: `img/outdoor2026/promotion/detail_image/`

### 7. 상품 카드 이미지 변환
- 89개 상품 카드 각각을 puppeteer로 개별 캡처 (445px 너비, 2x)
- 이유: 카카오 편집기에서 인라인 style이 필터링되어 레이아웃이 깨짐
- 생성 파일: `01.jpg` ~ `89.jpg` (각 ~85KB, 총 7.5MB)
- 서버 업로드 경로: `img/outdoor2026/promotion/cards/`

### 8. 최종 HTML 생성 (output-for-kakao.html)
- 카카오 편집기 호환 형태로 생성
- 구조:
```
&lt;!-- 상단 이미지 --&gt;
&lt;p align="center"&gt;&lt;img src="...01_main_visual.jpg"&gt;&lt;/p&gt;
&lt;p align="center"&gt;&lt;a href="플친링크"&gt;&lt;img src="...02_kakao_channel.jpg"&gt;&lt;/a&gt;&lt;/p&gt;
&lt;p align="center"&gt;&lt;img src="...03_broadcast_benefits.jpg"&gt;&lt;/p&gt;
&lt;p align="center"&gt;&lt;img src="...04_tokdeal_benefits.jpg"&gt;&lt;/p&gt;

&lt;!-- 상품 카드 (2열 테이블, 이미지 기반) --&gt;
&lt;table&gt;&lt;tbody&gt;
&lt;tr&gt;
  &lt;td&gt;&lt;a href="상세URL"&gt;&lt;img src="...cards/01.jpg"&gt;&lt;/a&gt;&lt;/td&gt;
  &lt;td&gt;&lt;a href="상세URL"&gt;&lt;img src="...cards/02.jpg"&gt;&lt;/a&gt;&lt;/td&gt;
&lt;/tr&gt;
...
&lt;/tbody&gt;&lt;/table&gt;
```

### 9. 카카오 스토어 등록
1. 서버에 이미지 업로드 (상단 4개 + 카드 89개)
2. `output-for-kakao.html` 내용 전체 복사
3. 카카오 스토어 상품상세 → HTML 편집기에 붙여넣기
4. 모바일/PC 미리보기 확인

---

## 폴더 구조

```
임시(카카오)/
├── assets/           ← 메인 비주얼 소스 이미지 (로고, 배경 등)
├── final/            ← 엑셀 데이터
│   ├── 통합 문서1.xlsx  (기존)
│   └── new.xlsx        (최신 가격 데이터)
├── generated/        ← 캡처된 이미지 (서버 업로드용)
│   ├── 01_main_visual.jpg
│   ├── 02_kakao_channel.jpg
│   ├── 03_broadcast_benefits.jpg
│   ├── 04_tokdeal_benefits.jpg
│   └── cards/        ← 89개 상품 카드 이미지
│       ├── 01.jpg ~ 89.jpg
├── html/             ← 상품별 상세 HTML (89개, 클릭시 이동하는 페이지)
├── image/            ← 상품 썸네일 원본 (89개 jpg)
├── index.html        ← 메인 작업물 (풀 HTML 버전)
├── output-for-kakao.html ← ★ 최종 산출물 (카카오 편집기용)
├── guide.md          ← 이 파일
├── .env              ← API 키
└── package.json      ← 의존성 (sharp, puppeteer, xlsx 등)
```

---

## 이미지 서버 경로 정리

| 용도 | 서버 경로 |
|------|-----------|
| 상단 프로모 이미지 | `https://img.childy.kr/img/outdoor2026/promotion/detail_image/` |
| 상품 카드 이미지 | `https://img.childy.kr/img/outdoor2026/promotion/cards/` |
| 상품 상세 HTML | `https://img.childy.kr/img/outdoor2026/promotion/kakao_detail/` |
| 상품 촬영 이미지 | `https://img.childy.kr/img/outdoor2026/promotion/` |

---

## 주요 포인트 & 주의사항

1. **카카오 편집기 제약**: `style` 속성 대부분 필터링됨 → 반드시 이미지 기반으로 변환
2. **모바일 대응**: 고정 px 폭 사용 금지, 이미지 기반이면 자동 스케일됨
3. **타사 참고 구조**: `<table><tr><td><a><img></a></td></tr>` 형태가 가장 안전
4. **가격 변경 시**: `final/new.xlsx` 수정 → index.html 업데이트 → 카드 이미지 재캡처 필요
5. **컬러칩 변경 시**: index.html에서 해당 컬러 hex 값 직접 수정 → 카드 이미지 재캡처
