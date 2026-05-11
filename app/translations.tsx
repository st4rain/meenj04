const KO = {
  top_navigation: {
    about: "소개",
    works: "작업",
    exhibition: "전시",
    archive: "아카이브",
  },
  home: {
    name: "곽민지",
    tagline: "미술 · 의상",
    description:
      "회화와 패션을 공부하며 다양한 방식으로 세계를 표현합니다.",
    cta_works: "작업 보기",
  },
  about: {
    title: "소개",
    // Each paragraph is split into phrase chunks (rendered with hard breaks).
    // Word-level wrapping (no mid-word breaks) is handled by CSS
    // `word-break: keep-all` on BioText.
    bio: [
      [
        "회화와 패션을 기반으로",
        "다양한 재료와 무드를 실험하며 작업하고 있습니다.",
      ],
      [
        "재료를 자유롭게 혼합하고 새로운 표현 방식을 시도하는 과정 자체를 중요하게 생각하며,",
        "회화적 감각을 패션과 비주얼 작업으로 확장해가고 있습니다.",
      ],
      [
        "하나의 스타일에 머무르기보다",
        "여러 가능성을 탐구하고 경험하는 과정 속에서",
        "자신만의 방향성과 시각 언어를 만들어가고 있습니다.",
      ],
    ],
    education_label: "학력",
    education: "성균관대학교 미술학과 · 의상학과",
    education_period: "2023.02 — 현재",
    contact_label: "연락처",
    contact_description: "작업 문의 및 협업은 아래로 연락 주세요.",
    /* Listed in the order they appear on the about page. The first entry
     * is treated as the primary inbox; secondary entries follow in a
     * compact stacked list. */
    emails: ["mjkwag4505@naver.com", "me@meenj04.com"],
  },
  works: {
    title: "작업",
    fine_art: "회화",
    fashion: "패션",
    photo: "사진",
    fine_art_description: "드로잉, 설치 등 회화 작업.",
    fashion_description: "의상 디자인 및 패션 관련 작업.",
    photo_description: "사진 작업.",
    empty: "작품을 준비 중입니다.",
  },
  exhibition: {
    title: "전시",
    description: "참여한 전시 및 출품 작품.",
    empty: "전시 이력을 준비 중입니다.",
  },
  archive: {
    title: "아카이브",
    description: "과정의 기록, 습작, 그리고 지난 작업들.",
    empty: "아카이브를 준비 중입니다.",
  },
  not_found: {
    code: "Error 404",
    /* Bilingual stack: `title` is the primary line in the user's locale
     * ("페이지를 찾을 수 없습니다" in KO mode), `titleAlt` is the
     * alternate-language echo shown beneath it (the English equivalent).
     * Reversed in the EN block below. */
    title: "페이지를 찾을 수 없습니다",
    titleAlt: "Page Not Found",
    description: "찾으시는 페이지가 존재하지 않거나 옮겨졌습니다.",
    cta_home: "홈으로",
    cta_works: "작업 보기",
  },
};

const EN = {
  top_navigation: {
    about: "About",
    works: "Works",
    exhibition: "Exhibition",
    archive: "Archive",
  },
  home: {
    name: "Gwak Minji",
    tagline: "Fine Art · Fashion",
    description:
      "Studying fine art and fashion, expressing the world in various ways.",
    cta_works: "View Works",
  },
  about: {
    title: "About",
    bio: [
      [
        "I work across painting and fashion,",
        "experimenting with a wide range of materials and moods.",
      ],
      [
        "What matters most to me is the process itself —",
        "freely mixing materials and trying new modes of expression,",
        "while extending painterly sensibility into fashion and visual work.",
      ],
      [
        "Rather than settling into a single style,",
        "I am building my own direction and visual language",
        "through the ongoing process of exploring and experiencing many possibilities.",
      ],
    ],
    education_label: "Education",
    education: "Sungkyunkwan University, Fine Art & Fashion Design",
    education_period: "2023.02 — Present",
    contact_label: "Contact",
    contact_description: "For work inquiries and collaborations, feel free to reach out.",
    /* Listed in the order they appear on the about page. */
    emails: ["mjkwag4505@naver.com", "me@meenj04.com"],
  },
  works: {
    title: "Works",
    fine_art: "Fine Art",
    fashion: "Fashion",
    photo: "Photo",
    fine_art_description: "Paintings, drawings, and installations.",
    fashion_description: "Fashion design and related works.",
    photo_description: "Photography.",
    empty: "Works coming soon.",
  },
  exhibition: {
    title: "Exhibition",
    description: "Exhibitions and featured works.",
    empty: "Exhibition history coming soon.",
  },
  archive: {
    title: "Archive",
    description: "Process records, studies, and past works.",
    empty: "Archive coming soon.",
  },
  not_found: {
    code: "Error 404",
    title: "Page Not Found",
    titleAlt: "페이지를 찾을 수 없습니다",
    description: "The page you're looking for doesn't exist or has been moved.",
    cta_home: "Home",
    cta_works: "View Works",
  },
};

export const translations = {
  ko: KO,
  en: EN,
};
