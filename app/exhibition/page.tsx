"use client";

import styled from "@emotion/styled";
import { IconArrowUpRight } from "@tabler/icons-react";
import MainContainer from "../../components/MainContainer";
import useTranslation from "../../hooks/useTranslation";
import { translations } from "../translations";

/* ── Data ─────────────────────────────────────────────────────────────────
 * Each exhibition is one card on the listing. The whole card is a link —
 * if `url` is set the card opens that URL in a new tab (Artsteps virtual
 * galleries, external press, etc.); if absent, it falls back to a "no
 * link" state (the card still shows but isn't clickable). `cover` is
 * optional — when missing, the card renders a styled placeholder with
 * the venue name centred, so the grid never looks broken while images
 * are still being prepared. */

type ExhibitionType = "virtual" | "group" | "solo" | "submission";

type Exhibition = {
  id: number;
  title: string;
  /** Optional Korean title — renders on a second line beneath the
   * English title when present. */
  titleKo?: string;
  /** Display year (e.g. "2025"). Always shown. */
  year: string;
  /** Optional fuller date string (e.g. "2025.06" or "2025.06.21 – 07.15").
   * When provided, replaces the bare year on the card meta line. */
  date?: string;
  /** Venue label — bilingual. e.g. "Artsteps Virtual Gallery". */
  venue: { ko: string; en: string };
  /** Exhibition kind, used both for the chip and for placeholder styling. */
  type: ExhibitionType;
  /** Cover thumbnail path. Falls back to a placeholder card when
   * omitted. Default aspect is 4:5 portrait — override per entry via
   * `coverAspect` when the source image is naturally landscape (e.g. a
   * panoramic gallery screenshot). */
  cover?: string;
  /** Optional CSS aspect-ratio override for the cover box. Examples:
   * "4 / 5" (default portrait), "16 / 9" (landscape banner),
   * "3 / 2" (classic photo). The card slot grows/shrinks vertically
   * around it — the grid simply renders each card at its natural
   * height, so mixing portraits and landscapes is fine. */
  coverAspect?: string;
  /** External link (Artsteps, gallery page, press). If absent, card is
   * non-interactive — useful for archival entries without surviving
   * online links. */
  url?: string;
};

const EXHIBITIONS: Exhibition[] = [
  {
    /* Metadata pulled from the Artsteps API
     * (GET /api/exhibitions/{id}) — cover image was the gallery's own
     * `image.preview` snapshot, saved locally for offline reliability. */
    id: 1,
    title: "Where Nature Seeps In",
    titleKo: "자연이 스민 옷",
    year: "2025",
    date: "2025.07",
    venue: {
      ko: "Artsteps 가상 갤러리",
      en: "Artsteps Virtual Gallery",
    },
    type: "group",
    cover: "/img/exhibitions/nature-seeps-in-2025/cover.webp",
    /* Source is a tighter gallery shot (451×297, ≈1.52:1) — the three
     * hanging photographs are framed cleanly with no dark side walls,
     * so a 3:2 card crops effectively nothing (the source is 1.2%
     * wider than 3:2, an invisible difference) while giving the card
     * a comfortable editorial proportion. */
    coverAspect: "3 / 2",
    url: "https://www.artsteps.com/view/6866b0a7a07640b1312ad329",
  },
];

/* Type chip labels — kept inline so the chip text travels with the
 * exhibition kind without needing a translations.tsx round-trip. */
const TYPE_LABEL: Record<ExhibitionType, { ko: string; en: string }> = {
  virtual: { ko: "가상 전시", en: "Virtual" },
  group: { ko: "단체전", en: "Group Show" },
  solo: { ko: "개인전", en: "Solo Show" },
  submission: { ko: "출품", en: "Featured" },
};

/* ── Styled ───────────────────────────────────────────────────────────── */

const PageWrapper = styled.div`
  padding-top: 64px;
  min-height: 100vh;
`;

const Section = styled.section`
  padding: 5rem 0;
`;

const Masthead = styled.header`
  margin-bottom: 4rem;

  @media (max-width: 720px) {
    margin-bottom: 3rem;
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
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #111;
  margin: 0;
  line-height: 1;
`;

const PageDescription = styled.p`
  font-size: 1.2rem;
  color: #777;
  margin: 1.25rem 0 0;
  max-width: 540px;
  line-height: 1.55;
`;

const Hairline = styled.div`
  margin-top: 1.6rem;
  border-top: 1px solid #ececec;
  width: 100%;
`;

const EmptyState = styled.div`
  padding: 6rem 0;
  color: #bbb;
  font-size: 1.3rem;
  letter-spacing: 0.05em;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem 2rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2.5rem 1.5rem;
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

/* The card is an <a> when a URL exists, a static <div> otherwise.
 * Both share visual styling via the same styled component. */
const Card = styled.a`
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  /* Subtle group-hover affordance on the whole card. */
  &:hover img,
  &:hover .placeholder {
    transform: scale(1.025);
  }
  &:hover .ext-icon {
    transform: translate(2px, -2px);
    color: #111;
  }
`;

const CardStatic = Card.withComponent("div");

/* Thumbnail box — default 4:5 portrait (matches the works grid so
 * visitors recognise the rhythm). Each card can override via the
 * `$aspect` prop, e.g. "16 / 9" for panoramic gallery screenshots,
 * which lets mixed-orientation covers coexist cleanly in the grid.
 * Overflow hidden so the hover scale doesn't leak past the box edges. */
const Thumb = styled.div<{ $aspect?: string }>`
  position: relative;
  width: 100%;
  aspect-ratio: ${({ $aspect }) => $aspect ?? "4 / 5"};
  background: #f5f5f5;
  overflow: hidden;
  margin-bottom: 1.1rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.45s ease;
  }
`;

/* Placeholder thumbnail for entries without a cover image yet — a soft
 * neutral surface with the venue name centred. Reads as "intentional
 * card" rather than a missing image. */
const Placeholder = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  text-align: center;
  background: linear-gradient(180deg, #f4f3f0 0%, #e9e7e2 100%);
  color: #888;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  line-height: 1.5;
  transition: transform 0.45s ease;
`;

/* Type chip — top-left of the thumbnail, semi-opaque so it works on
 * both image and placeholder backgrounds. */
const TypeChip = styled.span`
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.92);
  color: #333;
  font-size: 0.7rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-weight: 600;
  padding: 5px 10px 4px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
`;

/* External link icon — top-right corner, signals the card will leave the
 * site. Uses a translateY/X hover bump that pairs with the Card's
 * &:hover .ext-icon selector. */
const ExtIcon = styled.span`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: #555;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: transform 0.25s ease, color 0.2s ease;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  font-style: italic;
  letter-spacing: -0.01em;
  color: #111;
  margin: 0 0 0.25rem;
  line-height: 1.3;
`;

const CardTitleKo = styled.p`
  font-size: 0.95rem;
  color: #666;
  margin: 0 0 0.5rem;
  letter-spacing: -0.01em;
`;

const CardMeta = styled.p`
  font-size: 0.9rem;
  color: #999;
  margin: 0;
  letter-spacing: 0.01em;
  /* Venue · 2025 — the dot keeps both parts legible without splitting
   * onto two lines on wider cards. */
  span + span::before {
    content: "·";
    margin: 0 0.5em;
    color: #ccc;
  }
`;

/* ── Component ────────────────────────────────────────────────────────── */

const ExhibitionPage = () => {
  const { t, lang } = useTranslation(translations);
  const { exhibition } = t;

  return (
    <PageWrapper>
      <MainContainer>
        <Section>
          <Masthead>
            <Eyebrow>{lang === "ko" ? "전시 기록" : "Record"}</Eyebrow>
            <PageTitle>{exhibition.title}</PageTitle>
            <PageDescription>{exhibition.description}</PageDescription>
            <Hairline />
          </Masthead>

          {EXHIBITIONS.length === 0 ? (
            <EmptyState>{exhibition.empty}</EmptyState>
          ) : (
            <Grid>
              {EXHIBITIONS.map((e) => {
                const chipLabel = TYPE_LABEL[e.type][lang];
                const venueLabel = e.venue[lang];
                const meta = e.date ?? e.year;

                /* Card body is the same regardless of whether the entry
                 * has a URL; only the outer element switches between
                 * link and static. */
                const body = (
                  <>
                    <Thumb $aspect={e.coverAspect}>
                      <TypeChip>{chipLabel}</TypeChip>
                      {e.url && (
                        <ExtIcon
                          className="ext-icon"
                          aria-hidden="true"
                        >
                          <IconArrowUpRight size={16} stroke={1.75} />
                        </ExtIcon>
                      )}
                      {e.cover ? (
                        <img src={e.cover} alt={e.title} />
                      ) : (
                        <Placeholder className="placeholder">
                          {venueLabel}
                        </Placeholder>
                      )}
                    </Thumb>
                    <CardTitle>{e.title}</CardTitle>
                    {e.titleKo && <CardTitleKo>{e.titleKo}</CardTitleKo>}
                    <CardMeta>
                      <span>{venueLabel}</span>
                      <span>{meta}</span>
                    </CardMeta>
                  </>
                );

                return e.url ? (
                  <Card
                    key={e.id}
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={
                      lang === "ko"
                        ? `${e.title} — 새 탭에서 열기`
                        : `${e.title} — open in new tab`
                    }
                  >
                    {body}
                  </Card>
                ) : (
                  <CardStatic key={e.id} as="div">
                    {body}
                  </CardStatic>
                );
              })}
            </Grid>
          )}
        </Section>
      </MainContainer>
    </PageWrapper>
  );
};

export default ExhibitionPage;
