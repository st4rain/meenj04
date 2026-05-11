# meenj04.com

곽민지 · Gwak Minji — Personal Portfolio
[meenj04.com](https://meenj04.com)

---

## 한국어

[meenj04.com](https://meenj04.com) 은 작가 **곽민지**(Gwak Minji)의 개인 포트폴리오 사이트입니다.

미술(Fine Art)과 의상(Fashion)을 중심으로, 작가가 그동안 진행해 온 작업·전시·아카이브를 한 곳에 정리한 공간입니다. 모든 콘텐츠는 한국어와 영어로 함께 제공됩니다.

### 사이트 구성

- **/works** — 작업물 (Fine Art / Fashion / Photo)
- **/exhibition** — 전시 이력
- **/archive** — 아카이브 · 설치 작업 등
- **/about** — 작가 소개 · 연락처

### 작품 문의

작품 사용·전시·협업 등 모든 문의는 [mjkwag4505@naver.com](mailto:mjkwag4505@naver.com) 또는 [me@meenj04.com](mailto:me@meenj04.com) 으로 보내주세요.

---

## English

[meenj04.com](https://meenj04.com) is the personal portfolio of artist **Gwak Minji** (곽민지).

The site collects the artist's ongoing work in fine art and fashion — paintings, drawings, installations, photographs, and writings — in one bilingual (Korean / English) space.

### Site sections

- **/works** — Works (Fine Art / Fashion / Photo)
- **/exhibition** — Exhibition history
- **/archive** — Archived & installation pieces
- **/about** — About the artist · Contact

### Inquiries

For exhibition, licensing, or collaboration inquiries, please contact [mjkwag4505@naver.com](mailto:mjkwag4505@naver.com) or [me@meenj04.com](mailto:me@meenj04.com).

---

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router, static export)
- [TypeScript](https://www.typescriptlang.org/) · [React 18](https://react.dev/)
- [Emotion](https://emotion.sh/) (CSS-in-JS) · [Framer Motion](https://www.framer.com/motion/) (animations)
- [@solved-ac/ui-react](https://github.com/solved-ac/ui-react) · [Tabler Icons](https://tabler.io/icons)
- Hosted on **GitHub Pages** with custom domain via DNS A records.

## Local development

```bash
yarn install     # 의존성 설치
yarn dev         # http://localhost:3000 개발 서버
yarn build       # 정적 빌드 → out/
yarn lint        # ESLint
```

## Deployment

`main` 브랜치에 push 하거나, 매월 15일에 자동으로 GitHub Actions 워크플로우([deploy.yml](.github/workflows/deploy.yml))가 실행되어 GitHub Pages에 배포됩니다. Actions 탭에서 수동 트리거(`Run workflow`)도 가능합니다.

## License

이 저장소는 두 가지 라이선스를 함께 사용합니다 — 자세한 내용은 [LICENSE](LICENSE) 참고.

- **소스 코드** · MIT License
- **작품 이미지·사진·글** · © 2026 Gwak Minji, All Rights Reserved
