"use client";

import styled from "@emotion/styled";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { IconX } from "@tabler/icons-react";
import MainContainer from "../../../components/MainContainer";
import useTranslation from "../../../hooks/useTranslation";
import { translations } from "../../translations";

/* ── Articles ─────────────────────────────────────────────────────────────
 * Each garment has a portrait "thumbnail" (the moodboard-style featured
 * photo) and a wider "spread" (the full design page with pattern/process
 * notes). The order below is the runway sequence — `look` is the artist's
 * original numbering and is shown as the editorial Look kicker on both
 * the listing card and detail page. */

type FashionArticle = {
  id: number;
  /** Render style for the kicker on listing card and detail page.
   *  "look" (default)  — runway-style "Look NN" with the artist's
   *                      sequence number; for physical garments.
   *  "project"         — replaces "Look NN" with "Project"; for
   *                      digital/conceptual works that aren't single
   *                      garments and don't slot into runway numbering. */
  kind?: "look" | "project";
  /** Look number as the artist labelled it in the source files. Rendered
   * with a leading zero as the kicker on listing thumbnails and detail
   * pages. Ignored when `kind === "project"`. */
  look: string;
  title: string;
  /** Korean title — optional. Some works (e.g. the 2025 collection's
   * English-only names) are intended to read in their original language
   * with no Korean line beneath. */
  titleKo?: string;
  year: string;
  thumbnail: string;
  /** Design spread page(s) shown beneath the hero on the detail view.
   * Single string for the common case; array for works whose process docs
   * span multiple sheets — they render stacked, each independently
   * clickable into the lightbox. */
  spread: string | string[];
  /** Optional sub-category chip (e.g. "Digital Illustration") shown on the
   * listing thumbnail and the detail kicker — used to distinguish work
   * that lives in the collection but isn't a physical garment. */
  label?: { ko: string; en: string };
  /** Optional artist statement shown beneath the spread on the detail
   * page. Most physical-garment items have no description; the digital
   * illustration project has one because the artist provided written
   * concept notes. */
  description?: { ko: string[]; en: string[] };
};

const ARTICLES: FashionArticle[] = [
  {
    id: 1,
    look: "01",
    title: "H-Line Slit Skirt",
    year: "2024",
    thumbnail: "/img/works/fashion/h-line-slit-skirt-2024/thumbnail.jpg",
    spread: "/img/works/fashion/h-line-slit-skirt-2024/spread.png",
  },
  {
    id: 2,
    look: "02",
    title: "Gather Skirt",
    year: "2024",
    thumbnail: "/img/works/fashion/gather-skirt-2024/thumbnail.jpg",
    spread: "/img/works/fashion/gather-skirt-2024/spread.png",
  },
  {
    id: 3,
    look: "03",
    title: "Mandarin Collar",
    year: "2024",
    thumbnail: "/img/works/fashion/mandarin-collar-2024/thumbnail.jpg",
    spread: "/img/works/fashion/mandarin-collar-2024/spread.png",
  },
  {
    id: 4,
    look: "04",
    title: "Flat Collar",
    year: "2024",
    thumbnail: "/img/works/fashion/flat-collar-2024/thumbnail.jpg",
    spread: "/img/works/fashion/flat-collar-2024/spread.png",
  },
  {
    id: 5,
    look: "05",
    title: "Bow Tie Collar",
    year: "2024",
    thumbnail: "/img/works/fashion/bow-tie-collar-2024/thumbnail.jpg",
    spread: "/img/works/fashion/bow-tie-collar-2024/spread.png",
  },
  {
    id: 6,
    look: "06",
    title: "Drop Shoulder Shirt",
    year: "2024",
    thumbnail: "/img/works/fashion/drop-shoulder-shirt-2024/thumbnail.jpg",
    spread: "/img/works/fashion/drop-shoulder-shirt-2024/spread.png",
  },
  {
    id: 7,
    look: "07",
    title: "Hooded Jacket",
    year: "2024",
    thumbnail: "/img/works/fashion/hooded-jacket-2024/thumbnail.jpg",
    spread: "/img/works/fashion/hooded-jacket-2024/spread.png",
  },
  {
    id: 8,
    look: "08",
    title: "Trench Coat",
    year: "2024",
    thumbnail: "/img/works/fashion/trench-coat-2024/thumbnail.jpg",
    spread: "/img/works/fashion/trench-coat-2024/spread.png",
  },
  {
    id: 9,
    kind: "project",
    look: "09",
    title: "Ocean Pearl",
    titleKo: "海珍珠 : 해진주",
    year: "2024",
    label: {
      ko: "디지털 일러스트레이션",
      en: "Digital Illustration",
    },
    thumbnail: "/img/works/fashion/ocean-pearl-2024/thumbnail.jpg",
    spread: "/img/works/fashion/ocean-pearl-2024/spread.png",
    description: {
      ko: [
        "바다의 흐름과 파도, 굴과 조개의 유기적인 형태에서 영감을 받아 디자인한 디지털 패션 일러스트레이션 작업입니다.",
        "차가운 블루 톤과 다양한 소재 표현을 통해 해양의 질감과 분위기를 현대적인 감각으로 재해석했습니다.",
      ],
      en: [
        "This digital fashion illustration project was inspired by the movement of waves and the organic forms of oysters and seashells.",
        "Through cool blue tones and layered fabric textures, the work reinterprets the atmosphere and fluidity of the sea in a contemporary way.",
      ],
    },
  },
  /* ── 2025 Collection ─────────────────────────────────────────────────────
   * Runway sequence is encoded in the source file numbering (1.jpg → look 01,
   * 2.jpg → look 02, …). New ids continue from 10 to keep existing
   * `?articles=N` URLs valid. */
  {
    id: 10,
    look: "01",
    title: "Distorted Frill",
    year: "2025",
    thumbnail: "/img/works/fashion/distorted-frill-2025/thumbnail.jpg",
    spread: "/img/works/fashion/distorted-frill-2025/spread.png",
  },
  {
    id: 11,
    look: "02",
    title: "Tradition in Pieces",
    year: "2025",
    thumbnail: "/img/works/fashion/tradition-in-pieces-2025/thumbnail.jpg",
    spread: "/img/works/fashion/tradition-in-pieces-2025/spread.png",
  },
  {
    id: 12,
    look: "03",
    title: "Layered Fluidity",
    year: "2025",
    thumbnail: "/img/works/fashion/layered-fluidity-2025/thumbnail.jpg",
    spread: "/img/works/fashion/layered-fluidity-2025/spread.png",
  },
  {
    id: 13,
    look: "04",
    title: "Ruffled Illusion",
    year: "2025",
    thumbnail: "/img/works/fashion/ruffled-illusion-2025/thumbnail.jpg",
    spread: "/img/works/fashion/ruffled-illusion-2025/spread.png",
  },
  {
    id: 14,
    look: "05",
    title: "Split Silhouette",
    year: "2025",
    thumbnail: "/img/works/fashion/split-silhouette-2025/thumbnail.jpg",
    spread: "/img/works/fashion/split-silhouette-2025/spread.png",
  },
  {
    id: 15,
    look: "06",
    title: "Linear Contrast",
    year: "2025",
    thumbnail: "/img/works/fashion/linear-contrast-2025/thumbnail.jpg",
    spread: "/img/works/fashion/linear-contrast-2025/spread.png",
  },
  {
    id: 16,
    look: "07",
    title: "Fluid Contour",
    year: "2025",
    thumbnail: "/img/works/fashion/fluid-contour-2025/thumbnail.jpg",
    spread: "/img/works/fashion/fluid-contour-2025/spread.png",
  },
  {
    /* Multi-page design spread: thumbnail (대표이미지) + three 16:9 process
     * sheets that render stacked under the hero. */
    id: 17,
    look: "08",
    title: "The Trace of Wind",
    year: "2025",
    thumbnail: "/img/works/fashion/the-trace-of-wind-2025/thumbnail.jpg",
    spread: [
      "/img/works/fashion/the-trace-of-wind-2025/spread-1.png",
      "/img/works/fashion/the-trace-of-wind-2025/spread-2.png",
      "/img/works/fashion/the-trace-of-wind-2025/spread-3.png",
    ],
  },
  {
    /* Multi-page design spread: thumbnail (대표이미지) + ten 16:9 process
     * sheets stacked under the hero — the longest spread in the lookbook. */
    id: 18,
    look: "09",
    title: "Grace Ceramic",
    year: "2025",
    thumbnail: "/img/works/fashion/grace-ceramic-2025/thumbnail.jpg",
    spread: [
      "/img/works/fashion/grace-ceramic-2025/spread-1.png",
      "/img/works/fashion/grace-ceramic-2025/spread-2.png",
      "/img/works/fashion/grace-ceramic-2025/spread-3.png",
      "/img/works/fashion/grace-ceramic-2025/spread-4.png",
      "/img/works/fashion/grace-ceramic-2025/spread-5.png",
      "/img/works/fashion/grace-ceramic-2025/spread-6.png",
      "/img/works/fashion/grace-ceramic-2025/spread-7.png",
      "/img/works/fashion/grace-ceramic-2025/spread-8.png",
      "/img/works/fashion/grace-ceramic-2025/spread-9.png",
      "/img/works/fashion/grace-ceramic-2025/spread-10.png",
    ],
  },
];

/* ── Page-level layout ─────────────────────────────────────────────────── */

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

/* ── Listing — runway lookbook ─────────────────────────────────────────── */

/* Editorial collection masthead — small caps eyebrow ("2024 COLLECTION")
 * sits above a generous, lightly tracked title to read as a magazine
 * cover line rather than a generic page header. */
const ListingMasthead = styled.header`
  margin-bottom: 5rem;

  @media (max-width: 720px) {
    margin-bottom: 3.5rem;
  }
`;

const Eyebrow = styled.p`
  font-size: 0.78rem;
  letter-spacing: 0.36em;
  text-transform: uppercase;
  color: #999;
  margin: 0 0 1rem;
  font-weight: 600;
`;

const PageTitle = styled.h1`
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  color: #111;
  margin: 0;
  line-height: 1;
`;

const ListingHairline = styled.div`
  margin-top: 1.6rem;
  border-top: 1px solid #ececec;
  width: 100%;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5rem 4rem;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    gap: 3.5rem;
  }
`;

/* Per-year section wrapper — generous breathing room between collections so
 * each year reads as its own runway, but visibly bound to the same lookbook
 * by the shared masthead and grid layout. */
const CollectionSection = styled.section`
  & + & {
    margin-top: 6rem;

    @media (max-width: 720px) {
      margin-top: 4rem;
    }
  }
`;

/* Year kicker that sits above each grid — same typographic style as the
 * masthead Eyebrow but tightened spacing, so it reads as a subhead rather
 * than a second cover line. */
const CollectionEyebrow = styled.p`
  font-size: 0.78rem;
  letter-spacing: 0.36em;
  text-transform: uppercase;
  color: #777;
  margin: 0 0 2.25rem;
  font-weight: 600;

  @media (max-width: 720px) {
    margin-bottom: 1.75rem;
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

/* Look kicker that floats above each card — small caps with a vertical
 * rule, signalling collection sequence the way a runway program would. */
const LookKicker = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.1rem;
  font-size: 0.78rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: #777;
  font-variant-numeric: tabular-nums;
  font-weight: 500;

  &::before {
    content: "";
    display: block;
    width: 28px;
    height: 1px;
    background: #ccc;
  }
`;

const Thumb = styled.div`
  width: 100%;
  aspect-ratio: 4 / 5;
  background: #f4f4f3;
  overflow: hidden;
  margin-bottom: 1.4rem;
  /* Anchor for absolutely-positioned sub-category label chip overlay. */
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
    filter: saturate(1.02) contrast(1.02);
  }

  ${ArticleCard}:hover & img {
    transform: scale(1.02);
  }
`;

/* Frosted-glass label chip overlaid on the thumbnail when a fashion item
 * has a sub-category (e.g. "Digital Illustration") that distinguishes it
 * from the physical-garment runway looks. Mirrors the SeriesChipCard
 * pattern from the fine-art listing so the whole site speaks one chip
 * dialect. */
const LabelChipCard = styled.span`
  position: absolute;
  top: 0.85rem;
  left: 0.85rem;
  z-index: 1;
  padding: 0.32rem 0.7rem;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #2a2a2a;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  font-weight: 500;
  pointer-events: none;
`;

const CaptionTitle = styled.p`
  font-size: 1.4rem;
  letter-spacing: -0.01em;
  color: #111;
  margin: 0;
  font-style: italic;
  font-weight: 500;
`;

const CaptionTitleKo = styled.p`
  font-size: 0.95rem;
  letter-spacing: -0.005em;
  color: #777;
  margin: 0.4rem 0 0;
  font-weight: 400;
`;

const CaptionYear = styled.p`
  font-size: 0.85rem;
  letter-spacing: 0.22em;
  color: #aaa;
  margin: 0.65rem 0 0;
  font-variant-numeric: tabular-nums;
`;

/* ── Detail view — editorial spread ─────────────────────────────────────── */

/* The detail page is a centered single-column composition: portrait hero,
 * a hairline rule, the wide design spread, then a centered caption. The
 * goal is to let the moodboard imagery breathe — the page itself adds
 * almost nothing visually beyond margins and tracked typography. */

const DetailWrap = styled.div`
  max-width: 1080px;
  margin: 0 auto;
`;

const DetailKicker = styled.p`
  text-align: center;
  font-size: 0.78rem;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: #999;
  margin: 0 0 1.4rem;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
`;

const DetailTitle = styled.h2`
  text-align: center;
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #111;
  margin: 0;
  font-style: italic;
  line-height: 1.15;
`;

const DetailTitleKo = styled.p`
  text-align: center;
  font-size: 1.1rem;
  color: #666;
  margin: 0.85rem 0 0;
  letter-spacing: -0.005em;
`;

const DetailYear = styled.p`
  text-align: center;
  font-size: 0.85rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: #aaa;
  margin: 1.4rem 0 0;
  font-variant-numeric: tabular-nums;
`;

const DetailRule = styled.hr`
  border: none;
  border-top: 1px solid #ececec;
  width: 60px;
  margin: 4rem auto;
`;

const HeroFrame = styled.button`
  display: block;
  background: none;
  border: none;
  padding: 0;
  margin: 0 auto;
  cursor: zoom-in;
  width: 100%;
  max-width: 560px;

  img {
    width: 100%;
    height: auto;
    display: block;
    transition: opacity 0.3s ease;
  }

  &:hover img {
    opacity: 0.9;
  }
`;

const SpreadFrame = styled.button`
  display: block;
  background: none;
  border: none;
  padding: 0;
  margin: 0 auto;
  cursor: zoom-in;
  width: 100%;

  img {
    width: 100%;
    height: auto;
    display: block;
    transition: opacity 0.3s ease;
  }

  &:hover img {
    opacity: 0.9;
  }

  /* Multi-page spreads stack tighter than top-level DetailSections so the
   * pages read as one process spread rather than separate sections. */
  & + & {
    margin-top: 2rem;
  }
`;

/* Spacing between hero, spread, and caption blocks. Larger gaps than a
 * typical content page — the imagery deserves room to settle. */
const DetailSection = styled.section`
  margin-bottom: 5rem;

  &:last-of-type {
    margin-bottom: 0;
  }

  @media (max-width: 720px) {
    margin-bottom: 3.5rem;
  }
`;

/* Concept / artist statement shown beneath the spread when a fashion
 * article carries a description. Centered narrow column at a comfortable
 * reading measure — the design notes read as a magazine sidebar, not a
 * dense academic block. */
const StatementBlock = styled.section`
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
`;

const StatementLabel = styled.p`
  font-size: 0.78rem;
  letter-spacing: 0.36em;
  text-transform: uppercase;
  color: #999;
  margin: 0 0 1.6rem;
  font-weight: 600;
`;

const StatementText = styled.p`
  font-size: 1.1rem;
  line-height: 1.95;
  color: #2a2a2a;
  margin: 0 0 1.4rem;
  word-break: keep-all;
  overflow-wrap: break-word;
  letter-spacing: -0.005em;

  &:last-child {
    margin-bottom: 0;
  }
`;

/* ── Lightbox (sophisticated zoom) ──────────────────────────────────────── */

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

/* ── Footer back link (matches fine-art detail) ─────────────────────────── */

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
    content: "←";
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

/* ── Component ─────────────────────────────────────────────────────────── */

const FashionPage = () => {
  const { t, lang } = useTranslation(translations);
  const { works } = t;
  const searchParams = useSearchParams();
  const router = useRouter();

  const articleParam = searchParams.get("articles");
  const articleId = articleParam ? parseInt(articleParam, 10) : null;
  const article = articleId ? ARTICLES.find((a) => a.id === articleId) : null;

  /* Lightbox state — holds the src of the image currently being expanded.
   * Detail page has at most two images (hero + spread), so a simple
   * string-or-null state is enough; no carousel-style index needed. */
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const closeLightbox = useCallback(() => setLightboxSrc(null), []);

  // Reset lightbox when article changes
  useEffect(() => setLightboxSrc(null), [articleId]);

  // Keyboard close + body scroll lock while open
  useEffect(() => {
    if (lightboxSrc === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxSrc, closeLightbox]);

  // Scroll to top on article change
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
                <BreadcrumbBtn onClick={() => router.push("/works/fashion")}>
                  {works.fashion}
                </BreadcrumbBtn>
                <BreadcrumbSep>/</BreadcrumbSep>
                <span>
                  {article.title}, {article.year}
                </span>
              </>
            ) : (
              <span>{works.fashion}</span>
            )}
          </Breadcrumb>

          {article ? (
            <DetailWrap>
              <DetailSection>
                <DetailKicker>
                  {(() => {
                    const collection =
                      lang === "ko"
                        ? `${article.year} 컬렉션`
                        : `${article.year} Collection`;
                    /* "Project" prefix replaces the runway "Look NN"
                     * sequence for digital/conceptual works. */
                    const lead =
                      article.kind === "project"
                        ? lang === "ko"
                          ? "프로젝트"
                          : "PROJECT"
                        : `LOOK ${article.look}`;
                    /* Sub-category label (e.g. "Digital Illustration")
                     * sits next to the collection year so visitors know
                     * this isn't a physical-garment look. */
                    const subcat = article.label
                      ? ` · ${article.label[lang].toUpperCase()}`
                      : "";
                    return `${lead}  ·  ${collection}${subcat}`;
                  })()}
                </DetailKicker>
                <DetailTitle>{article.title}</DetailTitle>
                {article.titleKo && (
                  <DetailTitleKo>{article.titleKo}</DetailTitleKo>
                )}
                <DetailYear>{article.year}</DetailYear>
              </DetailSection>

              <DetailSection>
                <HeroFrame
                  onClick={() => setLightboxSrc(article.thumbnail)}
                  aria-label={
                    lang === "ko"
                      ? `${article.title} 크게 보기`
                      : `Enlarge ${article.title}`
                  }
                >
                  <img src={article.thumbnail} alt={article.title} />
                </HeroFrame>
              </DetailSection>

              <DetailRule />

              <DetailSection>
                {(Array.isArray(article.spread)
                  ? article.spread
                  : [article.spread]
                ).map((src, i, arr) => {
                  const total = arr.length;
                  const pageSuffix =
                    total > 1
                      ? lang === "ko"
                        ? ` (${i + 1}/${total})`
                        : ` (${i + 1}/${total})`
                      : "";
                  return (
                    <SpreadFrame
                      key={src}
                      onClick={() => setLightboxSrc(src)}
                      aria-label={
                        lang === "ko"
                          ? `${article.title} 디자인 스프레드${pageSuffix} 크게 보기`
                          : `Enlarge ${article.title} design spread${pageSuffix}`
                      }
                    >
                      <img
                        src={src}
                        alt={`${article.title} design spread${pageSuffix}`}
                      />
                    </SpreadFrame>
                  );
                })}
              </DetailSection>

              {article.description && (
                <DetailSection>
                  <StatementBlock>
                    <StatementLabel>
                      {lang === "ko" ? "콘셉트" : "Concept"}
                    </StatementLabel>
                    {article.description[lang].map((para, i) => (
                      <StatementText key={i}>{para}</StatementText>
                    ))}
                  </StatementBlock>
                </DetailSection>
              )}

              <BackWrap>
                <BackLink onClick={() => router.push("/works/fashion")}>
                  {works.fashion}
                </BackLink>
              </BackWrap>

              <AnimatePresence>
                {lightboxSrc !== null && (
                  <LightboxBackdrop
                    key="lightbox"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    onClick={closeLightbox}
                  >
                    <LightboxImg
                      src={lightboxSrc}
                      alt={article.title}
                      onClick={(e) => e.stopPropagation()}
                      initial={{ scale: 0.96, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.96, opacity: 0 }}
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
              <ListingMasthead>
                <Eyebrow>
                  {lang === "ko" ? "룩북" : "Lookbook"}
                </Eyebrow>
                <PageTitle>{works.fashion}</PageTitle>
                <ListingHairline />
              </ListingMasthead>
              {/* Group by year so each runway shows as its own section.
               * Newest year first; within a year, looks run in sequence and
               * "project" kind items (e.g. illustrations) trail the
               * physical-garment looks, matching how an editorial would
               * place a concept piece at the end of a collection. */}
              {(() => {
                const years = Array.from(
                  new Set(ARTICLES.map((a) => a.year)),
                ).sort((a, b) => b.localeCompare(a));
                return years.map((year) => {
                  const items = ARTICLES.filter((a) => a.year === year).sort(
                    (a, b) => {
                      const aProj = a.kind === "project" ? 1 : 0;
                      const bProj = b.kind === "project" ? 1 : 0;
                      if (aProj !== bProj) return aProj - bProj;
                      return a.look.localeCompare(b.look);
                    },
                  );
                  return (
                    <CollectionSection key={year}>
                      <CollectionEyebrow>
                        {lang === "ko"
                          ? `${year} 컬렉션`
                          : `${year} Collection`}
                      </CollectionEyebrow>
                      <Grid>
                        {items.map((a) => (
                          <ArticleCard
                            key={a.id}
                            onClick={() =>
                              router.push(`/works/fashion?articles=${a.id}`)
                            }
                          >
                            <LookKicker>
                              {a.kind === "project"
                                ? lang === "ko"
                                  ? "프로젝트"
                                  : "Project"
                                : `Look ${a.look}`}
                            </LookKicker>
                            <Thumb>
                              {a.label && (
                                <LabelChipCard aria-label={a.label[lang]}>
                                  {a.label[lang]}
                                </LabelChipCard>
                              )}
                              <img src={a.thumbnail} alt={a.title} />
                            </Thumb>
                            <CaptionTitle>{a.title}</CaptionTitle>
                            {a.titleKo && (
                              <CaptionTitleKo>{a.titleKo}</CaptionTitleKo>
                            )}
                            <CaptionYear>{a.year}</CaptionYear>
                          </ArticleCard>
                        ))}
                      </Grid>
                    </CollectionSection>
                  );
                });
              })()}
            </>
          )}
        </Section>
      </MainContainer>
    </PageWrapper>
  );
};

export default FashionPage;
