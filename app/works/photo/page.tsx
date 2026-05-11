"use client";

import styled from "@emotion/styled";
import { AnimatePresence, motion } from "framer-motion";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import MainContainer from "../../../components/MainContainer";
import useTranslation from "../../../hooks/useTranslation";
import { translations } from "../../translations";

/* ── Articles data ───────────────────────────────────────────────────────── */

type Article = {
  id: number;
  title: string;
  year: string;
  thumbnail: string;
  images: string[];
};

const ARTICLES: Article[] = [
  {
    id: 1,
    title: "City Still",
    year: "2023",
    thumbnail: "/img/works/photo/city-still-2023/main.jpg",
    images: [
      "/img/works/photo/city-still-2023/main.jpg",
      "/img/works/photo/city-still-2023/2.jpg",
    ],
  },
  {
    id: 2,
    title: "Remains",
    year: "2023",
    thumbnail: "/img/works/photo/remains-2023/main.jpg",
    images: [
      "/img/works/photo/remains-2023/main.jpg",
      "/img/works/photo/remains-2023/1.jpg",
      "/img/works/photo/remains-2023/2.jpg",
      "/img/works/photo/remains-2023/3.jpg",
    ],
  },
  {
    id: 3,
    title: "Through",
    year: "2023",
    thumbnail: "/img/works/photo/through-2023/main.jpg",
    images: [
      "/img/works/photo/through-2023/main.jpg",
      "/img/works/photo/through-2023/2.jpg",
    ],
  },
  {
    id: 4,
    title: "Reflection",
    year: "2023",
    thumbnail: "/img/works/photo/reflection-2023/main.jpg",
    images: [
      "/img/works/photo/reflection-2023/main.jpg",
      "/img/works/photo/reflection-2023/2.jpg",
    ],
  },
  {
    id: 5,
    title: "Fountain",
    year: "2023",
    thumbnail: "/img/works/photo/fountain-2023/main.jpg",
    images: [
      "/img/works/photo/fountain-2023/main.jpg",
      "/img/works/photo/fountain-2023/2.jpg",
      "/img/works/photo/fountain-2023/3.jpg",
      "/img/works/photo/fountain-2023/4.jpg",
    ],
  },
  {
    id: 6,
    title: "A Brief Pause in Life",
    year: "2023",
    thumbnail: "/img/works/photo/a-brief-pause-in-life-2023/main.jpg",
    images: [
      "/img/works/photo/a-brief-pause-in-life-2023/main.jpg",
      "/img/works/photo/a-brief-pause-in-life-2023/2.jpg",
      "/img/works/photo/a-brief-pause-in-life-2023/3.jpg",
    ],
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

const BreadcrumbLink = styled(Link)`
  color: #aaa;
  text-decoration: none;
  &:hover {
    color: #555;
  }
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
  margin: 0 0 3rem;
`;

const EmptyState = styled.div`
  padding: 6rem 0;
  color: #bbb;
  font-size: 1.3rem;
  letter-spacing: 0.05em;
`;

/* Grid view */
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

/* Detail view */
const DetailWrap = styled.div`
  display: flex;
  flex-direction: column;
`;

const DetailHeader = styled.header`
  text-align: center;
  padding: 1.5rem 0 4rem;
  margin-bottom: 4rem;
  border-bottom: 1px solid #ececec;
`;

const DetailTitle = styled.h2`
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #111;
  margin: 0 0 0.6rem;
  font-style: italic;
`;

const DetailYear = styled.p`
  font-size: 1rem;
  color: #999;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin: 0;
`;

const ImagesStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5rem;

  @media (max-width: 768px) {
    gap: 3rem;
  }
`;

const ImageBlock = styled.figure`
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

/* Clickable image button — wraps DetailImage so it's keyboard-accessible
 * and animates on hover. Clicking opens the lightbox. */
const ImageBtn = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: zoom-in;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  transition: opacity 0.3s ease;
  &:hover {
    opacity: 0.92;
  }
`;

const DetailImage = styled(motion.img)`
  max-width: 100%;
  max-height: 80vh;
  width: auto;
  height: auto;
  display: block;
  object-fit: contain;
`;

const ImageIndex = styled.figcaption`
  font-size: 0.85rem;
  color: #b0b0b0;
  letter-spacing: 0.18em;
  font-variant-numeric: tabular-nums;
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

/* ── Lightbox ─────────────────────────────────────────────────────────── */

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

const PhotoPage = () => {
  const { t, lang } = useTranslation(translations);
  const { works } = t;
  const searchParams = useSearchParams();
  const router = useRouter();

  const articleParam = searchParams.get("articles");
  const articleId = articleParam ? parseInt(articleParam, 10) : null;
  const article = articleId ? ARTICLES.find((a) => a.id === articleId) : null;

  // Lightbox — index of currently expanded photo (null = closed)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const total = article?.images.length ?? 0;
  const goPrev = useCallback(
    () =>
      setLightboxIndex((i) => (i === null ? null : (i - 1 + total) % total)),
    [total],
  );
  const goNext = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i + 1) % total)),
    [total],
  );

  // Reset lightbox when switching articles
  useEffect(() => setLightboxIndex(null), [articleId]);

  // Keyboard nav (Esc / ← / →) + body scroll lock while lightbox open
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

  // Scroll to top when switching between list/detail
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [articleId]);

  return (
    <PageWrapper>
      <MainContainer>
        <Section>
          <Breadcrumb>
            <BreadcrumbLink href="/works">{works.title}</BreadcrumbLink>
            <BreadcrumbSep>/</BreadcrumbSep>
            {article ? (
              <>
                <BreadcrumbBtn onClick={() => router.push("/works/photo")}>
                  {works.photo}
                </BreadcrumbBtn>
                <BreadcrumbSep>/</BreadcrumbSep>
                <span>
                  {article.title}, {article.year}
                </span>
              </>
            ) : (
              <span>{works.photo}</span>
            )}
          </Breadcrumb>

          {article ? (
            <DetailWrap>
              <DetailHeader>
                <DetailTitle>{article.title}</DetailTitle>
                <DetailYear>{article.year}</DetailYear>
              </DetailHeader>
              <ImagesStack>
                {article.images.map((src, i) => (
                  <ImageBlock key={i}>
                    <ImageBtn
                      onClick={() => setLightboxIndex(i)}
                      aria-label={
                        lang === "ko"
                          ? `${article.title} ${i + 1} 크게 보기`
                          : `Enlarge ${article.title} ${i + 1}`
                      }
                    >
                      <DetailImage
                        layoutId={`photo-${article.id}-${i}`}
                        src={src}
                        alt={`${article.title} ${i + 1}`}
                        whileHover={{ scale: 1.012 }}
                        transition={{
                          duration: 0.4,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    </ImageBtn>
                    <ImageIndex>
                      {String(i + 1).padStart(2, "0")} / {String(article.images.length).padStart(2, "0")}
                    </ImageIndex>
                  </ImageBlock>
                ))}
              </ImagesStack>
              <BackLink onClick={() => router.push("/works/photo")}>
                {works.photo}
              </BackLink>

              {/* Lightbox — sophisticated zoom with morph from stack image */}
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
                      layoutId={`photo-${article.id}-${lightboxIndex}`}
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
                      {article.title}
                      <span>, {article.year}</span>
                    </LightboxCaption>
                  </LightboxBackdrop>
                )}
              </AnimatePresence>
            </DetailWrap>
          ) : (
            <>
              <PageTitle>{works.photo}</PageTitle>
              {ARTICLES.length === 0 ? (
                <EmptyState>{works.empty}</EmptyState>
              ) : (
                <Grid>
                  {ARTICLES.map((a) => (
                    <ArticleCard
                      key={a.id}
                      onClick={() =>
                        router.push(`/works/photo?articles=${a.id}`)
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

export default PhotoPage;
