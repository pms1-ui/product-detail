# 상품 상세 페이지 생성기

## 브랜드 약어

| 약어 | 브랜드명 |
|------|----------|
| OD | 아웃도어프로덕츠 (Outdoor Products) |
| OH | 오디너리홀리데이 (Ordinary Holiday) |

## 페이지 구조

| 파일 | 설명 |
|------|------|
| `index.html` | 사용법 가이드 및 브랜드 선택 메인 페이지 |
| `outdoorproducts.html` | OD 상품 상세 생성기 |
| `ordinary-holiday.html` | OH 상품 상세 생성기 |

## 브랜드별 상세 페이지 구성

### OD (아웃도어프로덕츠)
- 인트로 (메인 히어로 + 상품명 + 소개 이미지 + 설명)
- 모델컷
- Detail Point (원단 + 디테일컷)
- KC 안전인증마크
- Model Size
- Size Guide (나이/신장/체중 테이블)
- Product Size (도식화 + 치수 테이블)
- Check Point (핏/두께감/신축성/안감)

### OH (오디너리홀리데이)
- 인트로 이미지 (컬렉션명 텍스트 포함)
- 모델컷 1 (캡션 포함)
- 모델컷 2
- 상품 정보 TOP (메인 이미지 + 상품명 + 설명 + 컬러)
- Detail (디테일 이미지 + FABRIC INFO)
- SIZE INFO (도식화 + 사이즈 테이블)
- PRODUCT INFO (두께감/비침/촉감/안감/신축성/계절)
- WASHING TIP
- 상품정보 제공고시

## 공통 기능
- 품번 조회 → 컬러 선택 → 버전 관리 (localStorage)
- 서버 업로드 및 코드화 (품번_컬러_버전_분할순번_연월일시.png)
- 이미지 분할 다운로드 (PNG / ZIP)
- 품번 전체보기 (시즌 폴더별 탐색)
- 저장 / 다른 품번으로 저장 / 복사
