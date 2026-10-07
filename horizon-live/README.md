# HORIZON 라이브 맵

실시간 국제 이슈 지도 데모 (주식회사 호라이즌).

## 기능
- **지도**: MapLibre 지구본, 뉴스 클러스터링, 시간 범위(1H/6H/24H/7D), 레이어 on/off, 검색, 지역 랭킹, 속보 띠(최근 4시간), 상세 카드
- **실데이터**: GDELT(분류별 뉴스 위치), USGS(지진 M2.5+, 5분 갱신), NASA EONET(진행 중 자연재해), OpenSky(화면 영역 항공기, 확대 시), Frankfurter(환율)
- **마켓**: 주요 환율 7종, 30일 추이
- **퀴즈**: 하루 5문제, XP·연속 정답·칭호·리더보드
- **기자단**: 지도에서 위치 찍고 발행 → 즉시 지도·속보 띠 반영

뉴스 연결이 막힌 환경에서는 `[예시]` 표시 기사로 대체합니다. 기자단 기사·퀴즈 기록은 현재 브라우저(localStorage)에 저장됩니다. 정식 서비스에서는 서버 DB로 옮깁니다.

## 실행
빌드 없음. 정적 파일 그대로 배포하면 됩니다 (Vercel / Cloudflare Pages / Netlify).
로컬: `python3 -m http.server` 후 http://localhost:8000

## 라이선스·출처
MapLibre GL JS(BSD-3), 배경지도 CARTO Dark Matter(© OpenStreetMap, © CARTO), 예비 국경 Natural Earth.
레이어 구성은 God's Eye View(MIT)와 Argos Atlas를 참고했습니다.
