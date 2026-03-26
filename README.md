# CNN News Timeline

CNN 뉴스 기사를 자동으로 수집하여 타임라인 형태로 정리해주는 Chrome 브라우저 확장 프로그램입니다. Claude AI를 활용해 기사 요약을 한국어로 제공합니다.

## 주요 기능

- **자동 기사 수집**: CNN 페이지를 방문하면 기사 제목, 날짜, 본문을 자동으로 저장
- **타임라인 시각화**: 저장된 기사를 시간순으로 정렬하여 타임라인 형태로 표시
- **AI 요약 (Claude)**: Anthropic Claude API를 사용해 기사를 한국어로 요약 (5줄 이내)
- **폴백 요약**: API 키 없이도 첫 5문장을 자동 추출하여 요약 제공
- **요약 툴팁**: 기사 카드에 마우스를 올리면 요약 내용 확인 가능

## 미리보기

- 타임라인 UI: 빨간 점 마커와 카드 형태의 기사 목록
- CNN 빨간색(#cc0000) 테마
- 팝업 크기: 480px × 최대 680px

## 설치 방법

1. 이 저장소를 클론하거나 ZIP으로 다운로드
   ```bash
   git clone https://github.com/your-username/news_timeline.git
   ```

2. Chrome 브라우저에서 `chrome://extensions` 접속

3. 우측 상단 **개발자 모드** 활성화

4. **압축해제된 확장 프로그램을 로드합니다** 클릭

5. 다운로드한 폴더 선택

## 사용 방법

1. CNN 뉴스 기사 페이지를 방문하면 자동으로 기사가 저장됩니다.
2. Chrome 툴바의 확장 프로그램 아이콘을 클릭하면 타임라인을 확인할 수 있습니다.
3. 기사 카드에 마우스를 올리면 요약 툴팁이 표시됩니다.
4. 기사 제목을 클릭하면 CNN 원문 페이지로 이동합니다.
5. 개별 기사 삭제 또는 전체 삭제가 가능합니다.

## Claude AI 요약 설정 (선택)

1. 확장 프로그램 아이콘 우클릭 → **옵션** 클릭
2. [Anthropic Console](https://console.anthropic.com)에서 발급받은 API 키 입력
3. **저장** 클릭

> API 키가 없어도 자동 추출 방식으로 요약이 제공됩니다.

## 기술 스택

| 항목 | 내용 |
|------|------|
| 플랫폼 | Chrome Extension Manifest V3 |
| 언어 | Vanilla JavaScript, HTML5, CSS3 |
| AI 모델 | Claude Haiku (`claude-haiku-4-5-20251001`) |
| 저장소 | Chrome Local Storage API |
| 대상 사이트 | `https://*.cnn.com/*` |

## 파일 구조

```
news_timeline/
├── manifest.json       # 확장 프로그램 설정
├── background.js       # 서비스 워커 (기사 저장 & 요약 생성)
├── content.js          # 콘텐츠 스크립트 (CNN 페이지에서 기사 추출)
├── popup.html          # 타임라인 UI
├── popup.js            # 팝업 동작 로직
├── popup.css           # 타임라인 스타일
├── options.html        # 설정 페이지
├── options.js          # 설정 저장 로직
└── icons/              # 확장 프로그램 아이콘
```

## 권한

| 권한 | 용도 |
|------|------|
| `storage` | 기사 및 API 키 로컬 저장 |
| `activeTab` | 현재 탭의 기사 내용 읽기 |
| `host_permissions` | CNN 도메인 접근 허용 |

## 라이선스

MIT License
