# 카카오 톡딜 상세페이지

카카오 스토어 톡딜 묶음상품의 상세페이지를 제작·관리하는 프로젝트입니다.
작업은 월 1~2회 날짜 단위로 진행되며, 폴더도 날짜별(YYMMDD)로 관리합니다.

---

## 폴더 구조 & 목적

```
14 (카카오 톡딜)/
│
├── 01_data/                         ★ 데이터 (엑셀)
│   ├── 260806/                        1회차 (2026-08-06 진행)
│   │   ├── data_260806.xlsx             가격 데이터 엑셀
│   │   └── 통합 문서1_원본.xlsx          원본 참고용
│   └── 260903/                        2회차 (2026-09-03 진행) ← 현재 작업
│       └── ⬇️ 제작 요청서 엑셀 여기에 넣기
│
├── 02_source/                       ★ 소스 파일 (디자인 작업)
│   ├── main-bg.png                    공용 에셋 (회차 무관)
│   ├── outdoor-logo.png               공용 에셋
│   ├── talkdeal-logo.png              공용 에셋
│   ├── x-separator.png                공용 에셋
│   ├── 02_kakao_channel.jpg           공용 에셋 (톡채널 버튼)
│   ├── 260806/                        1회차 소스
│   │   ├── 작업용.html                  디자인 작업 메인 파일
│   │   ├── html/                       상품별 상세 HTML (89개)
│   │   └── image/                      상품 이미지 (89개)
│   └── 260903/                        2회차 소스 ← 현재 작업
│       ├── 작업용.html                  디자인 작업 메인 (이전 회차 기반)
│       ├── html/                       상품별 상세 HTML
│       └── image/                      상품 이미지
│
├── 03_output/                       ★ 산출물 (캡처 결과 + 업로드용)
│   ├── 260806/                        1회차 산출물
│   │   ├── before_upload/               Puppeteer 캡처 결과
│   │   │   ├── 작업용_260806.html         캡처 시점 HTML 스냅샷
│   │   │   ├── 01_main_visual.jpg         상단 프로모 이미지
│   │   │   └── cards/                     상품 카드 이미지들
│   │   └── kakao_upload/                카카오 편집기 최종본
│   │       └── kakao_final_260806.html    서버 URL 조합 최종 HTML
│   └── 260903/                        2회차 산출물 ← 현재 작업
│       ├── before_upload/
│       │   └── cards/
│       └── kakao_upload/
│
├── README.md                        이 파일 (프로젝트 가이드)
├── package.json                     Node.js 의존성 (puppeteer, sharp 등)
└── .env                             환경변수 (서버 경로 등)
```

---

## 폴더별 상세 설명

| 폴더 | 목적 | 넣을 파일 |
|------|------|-----------|
| `01_data/YYMMDD/` | 제작 요청서·가격 데이터 | 엑셀 파일 (.xlsx) |
| `02_source/YYMMDD/html/` | 개별 상품 상세 HTML | 상품코드별 .html 파일 |
| `02_source/YYMMDD/image/` | 상품 대표 이미지 | 상품코드별 .jpg 파일 |
| `02_source/YYMMDD/작업용.html` | 전체 레이아웃 디자인 | 가격·상품 통합 HTML |
| `02_source/` (루트) | 공용 에셋 | 로고, 배경 등 (회차 무관) |
| `03_output/YYMMDD/before_upload/` | 캡처된 이미지 | Puppeteer 스크린샷 결과물 |
| `03_output/YYMMDD/before_upload/cards/` | 상품 카드 이미지 | 01.jpg ~ N.jpg |
| `03_output/YYMMDD/kakao_upload/` | 카카오 등록용 최종 HTML | kakao_final_YYMMDD.html |

---

## ⚠️ 작업 시작 전 — Kiro에게 반드시 확인받을 것

> **새 작업을 시작할 때 아래 순서로 Kiro가 먼저 물어봐야 합니다.**

### Kiro 작업 시작 체크리스트

1. **작업 날짜 확인** → "이번 작업 날짜(YYMMDD)가 무엇인가요?"
2. **엑셀 데이터 수령 확인** → `01_data/YYMMDD/` 에 엑셀 파일 준비되었는지
3. **상품 이미지 준비 확인** → `02_source/YYMMDD/image/` 에 jpg 파일 있는지
4. **상품 HTML 소스 준비 확인** → `02_source/YYMMDD/html/` 에 html 파일 있는지
5. **작업용.html 기준본 확인** → 없으면 이전 회차에서 복사
6. **공용 에셋 확인** → `02_source/` 루트의 로고·배경 파일 존재 여부
7. **특이사항 확인** → 추가/제외 상품, 혜택가 없는 품목 등

> ✅ 위 항목 모두 확인된 후에 가격 반영 작업부터 진행합니다.

---

## 왜 이런 방식인가?

카카오 스토어 상품상세 HTML 편집기는 `style` 속성 대부분을 필터링합니다.
인라인 CSS 레이아웃을 그대로 넣으면 모바일에서 깨집니다.
따라서 **디자인은 로컬 HTML로 작업하고, 최종 등록 시에는 이미지로 변환**합니다.

이 작업은 상품 수십 개의 가격 반영, 개별 이미지 캡처, 경로 매핑 등
대량 반복 작업이 수반되므로 **AI 에이전트(Kiro) 기반으로 진행**합니다.

---

## 작업 순서 (Step by Step)

### Step 1. 폴더 준비

새 날짜 폴더를 생성합니다.
- `01_data/YYMMDD/`
- `02_source/YYMMDD/` (이전 회차 에셋 복사)
- `03_output/YYMMDD/`

### Step 2. 데이터 준비 (`01_data/YYMMDD/`)

**제작 요청서 엑셀 파일**을 해당 날짜 폴더에 넣습니다.

| 열 | 내용 |
|----|------|
| D | 택가 (정상가) |
| E | 톡딜가 |
| G | 혜택가 (톡딜 혜택가) |

할인율 = `ROUND((1 - 혜택가/택가) × 100)`

### Step 3. 디자인 작업 (`02_source/YYMMDD/`)

`작업용.html`을 브라우저에서 열고 디자인합니다.
이 단계에서는 카카오 편집기 제약을 신경 쓸 필요 없습니다.

### Step 4. 가격 반영

Kiro에게 엑셀 기준으로 `작업용.html`의 가격을 일괄 업데이트 요청합니다.

### Step 5. 이미지 캡처 → `03_output/YYMMDD/before_upload/`

Puppeteer로 `작업용.html`의 상단 영역 + 상품 카드를 각각 JPG로 캡처합니다.
- `작업용_YYMMDD.html` — 캡처 시점 소스 스냅샷
- `01_main_visual.jpg`, `02_kakao_channel.jpg`
- `cards/01.jpg ~ cards/N.jpg`

### Step 5-1. ⚠️ 이미지 최적화 (캡처 후 필수)

캡처 직후 반드시 두 가지 최적화를 진행합니다. **빠뜨리면 카카오에서 깨지거나 느립니다.**

**① 용량 최적화 (PNG → JPG 변환, sharp)**
- 캡처된 이미지를 `sharp`로 JPG 변환 + 압축
- 상단 배너 기준 4.6MB → 375KB 수준으로 줄어야 정상
- 대상: `01_main_visual.jpg`, `cards/*.jpg` 전체

**② 모바일 대응 최적화 (고정 px → 100%/max-width)**
- `kakao_final_YYMMDD.html` 내 이미지 태그의 고정 너비(`width:890px` 등) 제거
- `style="max-width:100%; width:100%;"` 또는 `width="100%"` 로 변환
- 미적용 시 모바일에서 이미지가 잘리거나 가로 스크롤 발생

> 두 작업 모두 Kiro가 자동으로 처리합니다. 완료 후 카카오 스토어 **모바일 미리보기 필수 확인.**

### Step 6. 서버 업로드

베이스 URL: `https://img.childy.kr/img/outdoor2006/promotion/`
회차별 폴더: `YYMM_kakaotalk_deal/` (예: `2609_kakaotalk_deal/`)

| 용도 | 서버 하위 경로 | 파일명 규칙 |
|------|----------------|-------------|
| 상단 공통 이미지 + 상품 상세 이미지 | `YYMM_kakaotalk_deal/detail_image/` | 01_main_visual.jpg, 02_kakao_channel.jpg, {순서}_{모델코드}.jpg |
| 상품 카드 이미지 | `YYMM_kakaotalk_deal/cards/` | 01.jpg ~ N.jpg |
| 상품 상세 HTML | `YYMM_kakaotalk_deal/kakao_detail/` | {순서}_{모델코드}.html |

### Step 7. 카카오 스토어 등록

`03_output/YYMMDD/kakao_upload/kakao_final_YYMMDD.html` 내용을
카카오 스토어 상품상세 HTML 편집기에 붙여넣기.
**모바일 미리보기 필수 확인.**

---

## 수정이 필요할 때

| 변경 사항 | 해야 할 일 |
|-----------|------------|
| 가격 변경 | 엑셀 수정 → 작업용.html 반영 → 카드 이미지 재캡처 → 서버 재업로드 |
| 디자인 수정 | 작업용.html 수정 → 해당 영역 이미지 재캡처 → 서버 재업로드 |
| 컬러칩 변경 | 작업용.html에서 hex 값 수정 → 해당 카드 재캡처 |

---

## 주의사항

1. 카카오 편집기에 인라인 style HTML 직접 넣기 **금지** — 반드시 이미지로 변환
2. 고정 px 너비 사용 금지 — 이미지 기반이면 모바일 자동 스케일
3. 톡채널 버튼에 `<a href="플친URL">` 링크 필수
4. 구성 내 양말 등 특정 품목은 혜택가 없이 톡딜가만 노출 (매 회차 확인)
5. 최종 파일명 규칙: `kakao_upload/kakao_final_YYMMDD.html`
6. **이미지 캡처 후 반드시 용량 최적화(PNG→JPG, sharp) 처리** — 미처리 시 카카오 로딩 느림
7. **kakao_final html의 이미지 태그는 반드시 `width:100%/max-width`로** — 미처리 시 모바일 잘림

---

## 회차 이력

| 날짜 | 폴더 | 상품 수 | 비고 |
|------|------|---------|------|
| 2026-08-06 | 260806 | 89 | 1회차 (완료) |
| 2026-09-03 | 260903 | - | 2회차 (진행 예정) |
