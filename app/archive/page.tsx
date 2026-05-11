"use client";

import styled from "@emotion/styled";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { IconX, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import MainContainer from "../../components/MainContainer";
import useTranslation from "../../hooks/useTranslation";
import { translations } from "../translations";

/* ── Articles data ───────────────────────────────────────────────────────── */

type Article = {
  id: number;
  title: string;
  /** Optional Korean title — renders the caption as
   *  "{titleKo} / {title} ({year})" when present. */
  titleKo?: string;
  year: string;
  thumbnail: string;
  images: string[];
  label: { ko: string; en: string };
  /** Material — optional for installation works where medium is implicit. */
  medium?: { ko: string; en: string };
  /** Dimensions — optional for drafts/sketches where size doesn't apply. */
  dimensions?: { ko: string; en: string };
  description?: { ko: string[]; en: string[] };
  /** Short display / installation note shown as a smaller side block. */
  display?: { ko: string; en: string };
};

const ARTICLES: Article[] = [
  {
    id: 1,
    title: "Drawing Studies",
    year: "2023",
    thumbnail: "/img/archive/drawing-studies-2023/thumbnail.jpg",
    images: [
      "/img/archive/drawing-studies-2023/1.png",
      "/img/archive/drawing-studies-2023/2.png",
    ],
    label: { ko: "습작", en: "Sketches" },
    medium: { ko: "종이에 연필", en: "Pencil on Paper" },
    dimensions: {
      ko: "297 × 210 mm 에서 자름",
      en: "Cropped from 297 × 210 mm",
    },
  },
  {
    id: 3,
    title: "Draft for the Goblin Fire Project",
    year: "2025",
    thumbnail: "/img/archive/goblin-fire-project-draft-2025/thumbnail.jpg",
    images: [
      "/img/archive/goblin-fire-project-draft-2025/1.png",
      "/img/archive/goblin-fire-project-draft-2025/2.png",
      "/img/archive/goblin-fire-project-draft-2025/3.png",
      "/img/archive/goblin-fire-project-draft-2025/4.png",
      "/img/archive/goblin-fire-project-draft-2025/5.png",
    ],
    label: { ko: "아카이브", en: "Archive" },
  },
  {
    id: 2,
    title: "Gamcheon Village Drawing",
    titleKo: "감천마을 드로잉",
    year: "2024",
    thumbnail: "/img/archive/gamcheon-village-drawing-2024/thumbnail.jpg",
    images: ["/img/archive/gamcheon-village-drawing-2024/main.png"],
    label: { ko: "아카이브", en: "Archive" },
    dimensions: { ko: "가변설치", en: "Variable Installation" },
    description: {
      ko: [
        "역사는 단순한 사건의 기록이 아니라, 서로 다른 개인들의 삶과 서사가 축적된 총체다. 그중에서도 다양한 사람과 환경, 생활의 흔적이 모여 있는 ‘동네’가 가장 많은 내러티브를 담고 있는 공간이라고 보았다. 각각의 동네는 서로 다른 분위기와 구조를 가지며, 외부의 다른 동네들과도 연결되어 하나의 사회적 흐름을 형성한다.",
        "나는 특히 많은 변화가 축적된 장소일수록 더욱 풍부한 역사성을 가진다고 생각했고, 이에 따라 6.25 전쟁 이후의 흔적을 담고 있는 부산 사하구 감천문화마을에 주목하게 되었다. 감천마을은 전쟁 당시 피란민들이 정착할 공간을 찾지 못해 산비탈에 모여 살게 되면서 형성된 곳이다.",
        "현재까지도 공동체와 생활의 흔적이 남아 있는 공간으로, 한국의 특이한 내러티브를 담고 있는 장소라고 느꼈다. 개개인의 내러티브와 동네의 내러티브에 초점을 맞춰 알아보기 시작했고 그 안에서 ‘호혜성’을 발견했다.",
      ],
      en: [
        "History is not simply a record of events, but a totality in which the lives and narratives of different individuals accumulate over time. Among these, I viewed the “neighborhood” as a space containing the richest narratives, where various people, environments, and traces of everyday life coexist. Each neighborhood possesses its own atmosphere and structure while also remaining connected to surrounding areas, collectively forming a broader social flow.",
        "I believed that places shaped by continuous change hold deeper historical significance, which led me to focus on Gamcheon Culture Village in Saha-gu, Busan — a place that still carries traces of life after the Korean War. Gamcheon Village was formed when refugees during the war gathered along the mountainside after failing to find proper places to settle.",
        "Even today, the village retains strong traces of community and everyday life, and I came to see it as a place containing a uniquely Korean narrative. As I began exploring both the narratives of individuals and the narratives embedded within the neighborhood itself, I discovered the idea of “reciprocity” within the community.",
      ],
    },
    display: {
      ko: "감천문화마을을 방문했을 당시, 여전히 빨랫줄에 빨래를 널어두는 풍경에서 모티브를 얻었다. 이를 바탕으로 작품 또한 빨래집게 형식을 활용하여 디스플레이하였다.",
      en: "During my visit to Gamcheon Culture Village, I was inspired by the sight of laundry still hanging along clotheslines throughout the neighborhood. Based on this motif, the work was displayed using a clothes-peg installation format.",
    },
  },
];

/* ── Styled ──────────────────────────────────────────────────────────────── */

const PageWrapper = styled.div`
  padding-top: 64px;
  min-height: 100vh;
`;

const Section = styled.section`
  padding: 5rem 0;
`;

const Breadcrumb = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  color: #aaa;
`;

const BreadcrumbBtn = styled.button`
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: #aaa;
  cursor: pointer;
  &:hover {
    color: #555;
  }
`;

const BreadcrumbSep = styled.span``;

const PageTitle = styled.h1`
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #111;
  margin: 0 0 1rem;
`;

const PageDescription = styled.p`
  font-size: 1.3rem;
  color: #888;
  margin: 0 0 3rem;
`;

const EmptyState = styled.div`
  padding: 6rem 0;
  color: #bbb;
  font-size: 1.3rem;
  letter-spacing: 0.05em;
`;

/* List view */
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ArticleCard = styled.button`
  display: flex;
  flex-direction: column;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
  width: 100%;
`;

const Thumb = styled.div`
  width: 100%;
  /* Match Fine Art portrait thumbnails so the (4:5) image fills the box. */
  aspect-ratio: 4 / 5;
  background: #f0f0f0;
  overflow: hidden;
  margin-bottom: 1rem;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }
  ${ArticleCard}:hover & img {
    transform: scale(1.03);
  }
`;

const Caption = styled.p`
  font-size: 1.15rem;
  color: #333;
  margin: 0;
  letter-spacing: -0.01em;
  font-style: italic;
  span {
    font-style: normal;
    color: #888;
    margin-left: 0.4em;
  }
`;

/* Detail view — split: vertical image stack + side caption */
const DetailLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(220px, 1fr);
  gap: 4rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
`;

const ImageStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (max-width: 600px) {
    gap: 1rem;
  }
`;

const StackImageBtn = styled.button`
  width: 100%;
  background: none;
  border: none;
  padding: 0;
  cursor: zoom-in;
  display: block;
  position: relative;
  overflow: hidden;
  transition: opacity 0.3s ease;
  &:hover {
    opacity: 0.92;
  }
`;

const StackImage = styled(motion.img)`
  width: 100%;
  height: auto;
  display: block;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5rem;

  @media (max-width: 900px) {
    gap: 4rem;
    border-top: 1px solid #ececec;
    padding-top: 2rem;
  }
`;

const CaptionBlock = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
`;

const CaptionLabel = styled.p`
  font-size: 0.85rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #999;
  margin: 0 0 0.4rem;
`;

const CaptionTitle = styled.h2`
  font-size: clamp(1.4rem, 2.4vw, 1.9rem);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #111;
  margin: 0;
  font-style: italic;
  span {
    font-style: normal;
    color: #888;
    font-weight: 400;
    margin-left: 0.4em;
  }
`;

const CaptionMeta = styled.p`
  font-size: 1.05rem;
  color: #444;
  line-height: 1.55;
  margin: 0;
`;

const CaptionDim = styled.p`
  font-size: 1rem;
  color: #888;
  margin: 0.6rem 0 0;
`;

const StatementSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const StatementLabel = styled.p`
  font-size: 0.85rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #999;
  margin: 0;
`;

const StatementText = styled.p`
  font-size: 1rem;
  line-height: 1.85;
  color: #333;
  margin: 0;
`;

/* Display / installation note — smaller and quieter than the main statement,
 * sits as a side block (e.g. "displayed using a clothes-peg installation"). */
const DisplaySection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const DisplayLabel = styled.p`
  font-size: 0.8rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #aaa;
  margin: 0;
`;

const DisplayText = styled.p`
  font-size: 0.9rem;
  line-height: 1.75;
  color: #666;
  margin: 0;
`;

const BackLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  margin: 5rem auto 0;
  font: inherit;
  color: #666;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.2s, gap 0.2s;
  &::before {
    content: '←';
    transition: transform 0.2s;
  }
  &:hover {
    color: #111;
    gap: 0.85rem;
  }
  &:hover::before {
    transform: translateX(-3px);
  }
`;

const BackWrap = styled.div`
  display: flex;
  justify-content: center;
`;

/* Lightbox */
const LightboxBackdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(8, 8, 10, 0.94);
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
`;

const LightboxImg = styled(motion.img)`
  max-width: 92vw;
  max-height: 88vh;
  width: auto;
  height: auto;
  display: block;
  cursor: default;
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.55),
    0 6px 20px rgba(0, 0, 0, 0.4);
`;

const LightboxCounter = styled(motion.div)`
  position: fixed;
  top: 28px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.9rem;
  letter-spacing: 0.22em;
  color: rgba(255, 255, 255, 0.7);
  font-variant-numeric: tabular-nums;
`;

const LightboxClose = styled.button`
  position: fixed;
  top: 24px;
  right: 24px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.85);
  transition: background 0.2s, color 0.2s, transform 0.2s;
  &:hover {
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
    transform: scale(1.06);
  }
`;

const LightboxNav = styled.button<{ $side: "left" | "right" }>`
  position: fixed;
  top: 50%;
  ${({ $side }) => ($side === "left" ? "left: 24px" : "right: 24px")};
  transform: translateY(-50%);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.85);
  transition: background 0.2s, color 0.2s, transform 0.2s;
  &:hover {
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
    transform: translateY(-50%) scale(1.06);
  }
  @media (max-width: 600px) {
    width: 44px;
    height: 44px;
    ${({ $side }) => ($side === "left" ? "left: 12px" : "right: 12px")};
  }
`;

const LightboxCaption = styled(motion.div)`
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.05em;
  font-size: 0.95rem;
  max-width: 80vw;
  font-style: italic;
  span {
    font-style: normal;
    color: rgba(255, 255, 255, 0.55);
    margin-left: 0.4em;
  }
`;

/* ── Component ───────────────────────────────────────────────────────────── */

const ArchivePage = () => {
  const { t, lang } = useTranslation(translations);
  const { archive } = t;
  const searchParams = useSearchParams();
  const router = useRouter();

  const articleParam = searchParams.get("articles");
  const articleId = articleParam ? parseInt(articleParam, 10) : null;
  const article = articleId ? ARTICLES.find((a) => a.id === articleId) : null;

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const total = article?.images.length ?? 0;
  const goPrev = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i - 1 + total) % total)),
    [total],
  );
  const goNext = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i + 1) % total)),
    [total],
  );

  useEffect(() => setLightboxIndex(null), [articleId]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIndex, closeLightbox, goPrev, goNext]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [articleId]);

  return (
    <PageWrapper>
      <MainContainer>
        <Section>
          <Breadcrumb>
            {article ? (
              <>
                <BreadcrumbBtn onClick={() => router.push("/archive")}>
                  {archive.title}
                </BreadcrumbBtn>
                <BreadcrumbSep>/</BreadcrumbSep>
                <span>
                  {article.title}, {article.year}
                </span>
              </>
            ) : (
              <span>{archive.title}</span>
            )}
          </Breadcrumb>

          {article ? (
            <>
              <DetailLayout>
                <ImageStack>
                  {article.images.map((src, i) => (
                    <StackImageBtn
                      key={i}
                      onClick={() => setLightboxIndex(i)}
                      aria-label={
                        lang === "ko"
                          ? `${article.title} ${i + 1} 크게 보기`
                          : `Enlarge ${article.title} ${i + 1}`
                      }
                    >
                      <StackImage
                        layoutId={`archive-${article.id}-${i}`}
                        src={src}
                        alt={`${article.title} ${i + 1}`}
                        whileHover={{ scale: 1.012 }}
                        transition={{
                          duration: 0.4,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    </StackImageBtn>
                  ))}
                </ImageStack>

                <RightColumn>
                  <CaptionBlock>
                    <CaptionLabel>{article.label[lang]}</CaptionLabel>
                    <CaptionTitle>
                      {article.titleKo ? (
                        <>
                          {article.titleKo} / {article.title}
                          <span> ({article.year})</span>
                        </>
                      ) : (
                        <>
                          {article.title}
                          <span>, {article.year}</span>
                        </>
                      )}
                    </CaptionTitle>
                    {article.medium && (
                      <CaptionMeta>{article.medium[lang]}</CaptionMeta>
                    )}
                    {article.dimensions && (
                      <CaptionDim>{article.dimensions[lang]}</CaptionDim>
                    )}
                  </CaptionBlock>

                  {article.description && (
                    <StatementSection>
                      <StatementLabel>
                        {lang === "ko" ? "작가 노트" : "Statement"}
                      </StatementLabel>
                      {article.description[lang].map((para, i) => (
                        <StatementText key={i}>{para}</StatementText>
                      ))}
                    </StatementSection>
                  )}

                  {article.display && (
                    <DisplaySection>
                      <DisplayLabel>
                        {lang === "ko" ? "디스플레이" : "Display"}
                      </DisplayLabel>
                      <DisplayText>{article.display[lang]}</DisplayText>
                    </DisplaySection>
                  )}
                </RightColumn>
              </DetailLayout>

              <BackWrap>
                <BackLink onClick={() => router.push("/archive")}>
                  {archive.title}
                </BackLink>
              </BackWrap>

              {/* Lightbox */}
              <AnimatePresence>
                {lightboxIndex !== null && (
                  <LightboxBackdrop
                    key="lightbox"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    onClick={closeLightbox}
                  >
                    <LightboxCounter
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: 0.15, duration: 0.3 }}
                    >
                      {String(lightboxIndex + 1).padStart(2, "0")} /{" "}
                      {String(total).padStart(2, "0")}
                    </LightboxCounter>

                    <LightboxImg
                      layoutId={`archive-${article.id}-${lightboxIndex}`}
                      src={article.images[lightboxIndex]}
                      alt={`${article.title} ${lightboxIndex + 1}`}
                      onClick={(e) => e.stopPropagation()}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 30,
                      }}
                    />

                    <LightboxClose
                      onClick={(e) => {
                        e.stopPropagation();
                        closeLightbox();
                      }}
                      aria-label={lang === "ko" ? "닫기" : "Close"}
                    >
                      <IconX size={20} stroke={1.5} />
                    </LightboxClose>

                    {total > 1 && (
                      <>
                        <LightboxNav
                          $side="left"
                          onClick={(e) => {
                            e.stopPropagation();
                            goPrev();
                          }}
                          aria-label={lang === "ko" ? "이전" : "Previous"}
                        >
                          <IconChevronLeft size={24} stroke={1.5} />
                        </LightboxNav>
                        <LightboxNav
                          $side="right"
                          onClick={(e) => {
                            e.stopPropagation();
                            goNext();
                          }}
                          aria-label={lang === "ko" ? "다음" : "Next"}
                        >
                          <IconChevronRight size={24} stroke={1.5} />
                        </LightboxNav>
                      </>
                    )}

                    <LightboxCaption
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ delay: 0.15, duration: 0.3 }}
                    >
                      {article.titleKo ? (
                        <>
                          {article.titleKo} / {article.title}
                          <span> ({article.year})</span>
                        </>
                      ) : (
                        <>
                          {article.title}
                          <span>, {article.year}</span>
                        </>
                      )}
                    </LightboxCaption>
                  </LightboxBackdrop>
                )}
              </AnimatePresence>
            </>
          ) : (
            <>
              <PageTitle>{archive.title}</PageTitle>
              <PageDescription>{archive.description}</PageDescription>
              {ARTICLES.length === 0 ? (
                <EmptyState>{archive.empty}</EmptyState>
              ) : (
                <Grid>
                  {ARTICLES.map((a) => (
                    <ArticleCard
                      key={a.id}
                      onClick={() =>
                        router.push(`/archive?articles=${a.id}`)
                      }
                    >
                      <Thumb>
                        <img src={a.thumbnail} alt={a.title} />
                      </Thumb>
                      <Caption>
                        {a.title}
                        <span>, {a.year}</span>
                      </Caption>
                    </ArticleCard>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Section>
      </MainContainer>
    </PageWrapper>
  );
};

export default ArchivePage;
