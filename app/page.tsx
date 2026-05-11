"use client";

import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as RMouseEvent,
} from "react";
import useTranslation from "../hooks/useTranslation";
import { useUIVisibility } from "../contexts/UIVisibilityContext";
import { translations } from "./translations";

// ─── Data ─────────────────────────────────────────────────────────────────────

/* `fit` controls how the photo sits inside the tilt card.
 *   "cover"   — photo fills the card edge-to-edge with a dark gradient
 *               overlay so light text reads on top (Photo card).
 *   "contain" — photo is scaled to fit without cropping, anchored toward
 *               the top so the bg color frames it and leaves room for
 *               the bottom number/label on the card's bg color. Used for
 *               artworks whose aspect ratio differs from the card's. */
const CATS = [
  { href: "/works/fine-art", label: "회화", en: "Fine Art", bg: "#E2DED6", n: "01", photo: "/img/works/fine-art/genesis-2025/process-4.webp", fit: "cover" as const },
  { href: "/works/fashion",  label: "패션", en: "Fashion",  bg: "#CBC6BC", n: "02", photo: "/img/fashion-preview.jpg",  fit: "cover" as const },
  { href: "/works/photo",    label: "사진", en: "Photo",    bg: "#B5B2AD", n: "03", photo: "/img/photo-preview.webp",                       fit: "cover" as const },
];

const CARD_POS = [
  { top: "calc(4% + 35px)",  right: "calc(-2% + 100px)", w: 432, h: 504, r: -7 },
  { top: "calc(22% + 35px)", right: "calc(28% + 100px)", w: 348, h: 442, r:  8 },
  { top: "calc(60% + 35px)", right: "calc(-3% + 100px)", w: 550, h: 238, r: -3 },
];

const MARQUEE_ITEMS = [
  "Fine Art", "Fashion Design", "Photography", "Painting",
  "Drawing", "Installation", "Sungkyunkwan University", "2023 – Present",
  "회화", "패션 디자인", "사진",
];

// ─── Keyframe ─────────────────────────────────────────────────────────────────

const marqueeKf = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
`;

// ─── Ease curve shared across all entrances ────────────────────────────────────
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── Styled ───────────────────────────────────────────────────────────────────

const Scene = styled.div`
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background: #eeebe6;
  cursor: none;
  @media (max-width: 768px) { cursor: auto; }
`;

/* Background lives on its own layer so only it moves during parallax */
const BgLayer = styled(motion.div)`
  position: absolute;
  inset: -4%;
  width: 108%;
  height: 108%;
  z-index: 0;
  background: url('/background.png') center center / cover no-repeat;
  will-change: transform;
`;

/* Left-side gradient veil — ensures hero text area is always readable */
const LeftVeil = styled.div`
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  background: linear-gradient(
    100deg,
    rgba(238, 235, 230, 0.88) 0%,
    rgba(238, 235, 230, 0.72) 28%,
    rgba(238, 235, 230, 0.35) 50%,
    transparent 68%
  );
`;

/* Very faint static film grain — no animation, just texture */
const Grain = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  opacity: 0.032;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
`;

/* 1.5px progress bar — fills once, then stays */
const ProgressWrap = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1.5px;
  z-index: 20;
  background: rgba(0,0,0,0.05);
`;
const ProgressFill = styled(motion.div)`
  height: 100%;
  background: rgba(0,0,0,0.55);
  transform-origin: left;
`;

/* Rotating circular badge */
const BadgeWrap = styled(motion.div)`
  position: absolute;
  top: 19%;
  left: 5.5%;
  z-index: 8;
  width: 80px;
  height: 80px;
  @media (max-width: 900px) { display: none; }
`;

/* ── Cursor ─────────────────────────────────────────────────────────────────── */

const CursorDot = styled(motion.div)`
  position: fixed;
  top: -2.5px; left: -2.5px;
  width: 5px; height: 5px;
  border-radius: 50%;
  background: #111;
  z-index: 9999;
  pointer-events: none;
  mix-blend-mode: multiply;
  @media (max-width: 768px) { display: none; }
`;

const CursorRing = styled(motion.div)`
  position: fixed;
  top: -18px; left: -18px;
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.22);
  z-index: 9998;
  pointer-events: none;
  @media (max-width: 768px) { display: none; }
`;

/* ── Cards ──────────────────────────────────────────────────────────────────── */

const CardsLayer = styled(motion.div)`
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
`;

const CardWrap = styled(motion.div)`
  position: absolute;
  pointer-events: auto;
  @media (max-width: 900px) { display: none; }
`;

const CardInner = styled(motion.div)<{ $w: number; $h: number }>`
  width: ${({ $w }) => $w}px;
  height: ${({ $h }) => $h}px;
  overflow: hidden;
  position: relative;
  transform-style: preserve-3d;
  box-shadow:
    0 1px 3px rgba(0,0,0,0.04),
    0 6px 18px rgba(0,0,0,0.08),
    0 20px 52px rgba(0,0,0,0.07),
    inset 0 1px 0 rgba(255,255,255,0.6);
`;

const CardFace = styled(Link)<{ $bg: string }>`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
  background: ${({ $bg }) => $bg};
  padding: 22px 24px;
  text-decoration: none;
  position: relative;
`;

/* Cursor-tracking radial-gradient highlight that gives the tilt cards
 * their "alive" feel. Spans the full CardInner so the gradient position
 * (calculated as a 0–100% offset within CardInner) stays aligned with
 * the actual cursor — a smaller bounding box would skew the highlight.
 *
 * For "contain" (polaroid-frame) cards, only the painting area should
 * catch the light — never the bg-color frame around it. We use
 * `clip-path` to restrict the visible shimmer to the photo box; the
 * gradient still computes over the whole card so its position remains
 * cursor-aligned. The inset values match the CardPhoto box exactly:
 *   top 5% / right 13% / bottom 15% / left 13%. */
const CardShimmer = styled(motion.div)<{ $fit?: "cover" | "contain" }>`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  ${({ $fit }) =>
    $fit === "contain"
      ? `clip-path: inset(5% 13% 15% 13%);`
      : ""}
`;

/* `$fit` decides how the photo sits inside the card:
 *   "cover"   — fills card edge-to-edge with cropping (Photo card);
 *               CardPhotoGradient overlays at the bottom for legibility.
 *   "contain" — polaroid-style frame: the painting lives in a sized box
 *               anchored toward the top, the card's bg color frames it
 *               on all sides, and the bottom area carries the labels
 *               on the bg color (no gradient, no overlap with the
 *               painting). Box dimensions are tuned so a 4 / 5 image
 *               fills the box edge-to-edge with virtually no inner
 *               letterbox — yielding a clean printed-photo feel.
 *
 * NOTE: `<img>` is a replaced element. With absolute `inset` and `width:
 * auto`, the box is NOT computed from insets — the img falls back to
 * intrinsic pixel size and overflows. We must specify width / height
 * as percentages explicitly. */
const CardPhoto = styled.img<{ $fit?: "cover" | "contain" }>`
  position: absolute;
  object-position: center;

  ${({ $fit }) =>
    $fit === "contain"
      ? `
    /* Box: 74% × 80% of a 432 × 504 card ≈ 320 × 403 (ratio 0.794),
     * almost exactly matching the painting's 4 / 5 (0.8) — so the photo
     * fills the framed area with a sub-pixel letterbox.
     * Bottom 15% reserved for the CardNum / CardLabel pair on the bg. */
    top: 5%;
    left: 13%;
    width: 74%;
    height: 80%;
    object-fit: contain;
  `
      : `
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  `}
`;

const CardPhotoGradient = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.55) 0%,
    rgba(0, 0, 0, 0.1) 45%,
    transparent 70%
  );
  z-index: 1;
`;

const CardNum = styled.span`
  display: block;
  font-size: 13px;
  letter-spacing: 0.2em;
  color: rgba(0,0,0,0.25);
  margin-bottom: 6px;
`;

const CardLabel = styled.span`
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: rgba(0,0,0,0.68);
  letter-spacing: -0.02em;
`;

/* ── Hero ───────────────────────────────────────────────────────────────────── */

const HeroLayer = styled.div`
  position: absolute;
  bottom: 13%;
  left: 6%;
  z-index: 10;
  @media (max-width: 900px) {
    bottom: auto;
    top: 50%;
    transform: translateY(-50%);
    left: 5%;
    right: 5%;
  }
`;

/* Each text block is clipped — inner element slides up through the clip */
const Clip = styled.div`
  overflow: hidden;
`;

const EyebrowInner = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.25rem;
  color: rgba(0,0,0,0.55);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: 1.1rem;
`;

const EyebrowRule = styled.span`
  display: inline-block;
  width: 18px;
  height: 1px;
  background: rgba(0,0,0,0.25);
  flex-shrink: 0;
`;

const NameInner = styled(motion.h1)`
  font-size: clamp(3.8rem, 7.8vw, 9.5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 0.9;
  color: #111;
  margin: 0 0 1.75rem;
  white-space: nowrap;
`;

const DescInner = styled(motion.p)`
  max-width: 380px;
  font-size: 1.4rem;
  color: rgba(0,0,0,0.65);
  line-height: 1.85;
  margin: 0 0 2.25rem;
`;

const CtaRow = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1.75rem;
`;

const CtaPrimary = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  color: #fff;
  background: #111;
  padding: 1rem 2.25rem;
  transition: background 0.22s, gap 0.22s;
  white-space: nowrap;
  &::after { content: '→'; transition: transform 0.2s; }
  &:hover { background: #2a2a2a; gap: 0.7rem; }
  &:hover::after { transform: translateX(2px); }
`;

const CtaSecondary = styled(Link)`
  font-size: 1.1rem;
  font-weight: 500;
  color: rgba(0,0,0,0.36);
  text-decoration: none;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-bottom: 1px solid transparent;
  padding-bottom: 2px;
  transition: color 0.2s, border-color 0.2s;
  white-space: nowrap;
  &:hover { color: rgba(0,0,0,0.6); border-bottom-color: rgba(0,0,0,0.3); }
`;

/* ── Marquee ────────────────────────────────────────────────────────────────── */

const MarqueeWrap = styled.div`
  position: absolute;
  bottom: 0; left: 0; right: 0;
  z-index: 11;
  overflow: hidden;
  border-top: 1px solid rgba(0,0,0,0.06);
  padding: 8px 0;
  background: rgba(255,255,255,0.36);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
`;

const MarqueeTrack = styled.div`
  display: flex;
  width: max-content;
  animation: ${marqueeKf} 42s linear infinite;
`;

const MarqueeItem = styled.span`
  padding: 0 2.25rem;
  font-size: 1rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(0,0,0,0.28);
  white-space: nowrap;
`;

const MarqueeSep = styled.span`
  color: rgba(0,0,0,0.14);
  font-size: 0.8rem;
  align-self: center;
`;

// ─── TiltCard ─────────────────────────────────────────────────────────────────

function TiltCard({
  cat,
  pos,
  delay,
}: {
  cat: (typeof CATS)[0];
  pos: (typeof CARD_POS)[0];
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sRx = useSpring(rx, { stiffness: 280, damping: 28 });
  const sRy = useSpring(ry, { stiffness: 280, damping: 28 });
  const shimX = useMotionValue(50);
  const shimY = useMotionValue(50);

  const shimmerBg = useTransform(
    [shimX, shimY] as MotionValue<number>[],
    ([x, y]: number[]) =>
      `radial-gradient(ellipse at ${x}% ${y}%, rgba(255,255,255,0.24) 0%, transparent 55%)`
  );

  const onMove = (e: RMouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const dx = (e.clientX - left) / width - 0.5;
    const dy = (e.clientY - top) / height - 0.5;
    ry.set(dx * 16);
    rx.set(-dy * 16);
    shimX.set((dx + 0.5) * 100);
    shimY.set((dy + 0.5) * 100);
  };

  const [hovered, setHovered] = useState(false);

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    setHovered(false);
  };

  return (
    <CardWrap
      style={{ top: pos.top, right: pos.right, zIndex: hovered ? 20 : 5 }}
      initial={{ opacity: 0, y: 24, rotate: pos.r }}
      animate={{ opacity: 1, y: 0, rotate: pos.r }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      <CardInner
        ref={ref}
        $w={pos.w}
        $h={pos.h}
        style={{ rotateX: sRx, rotateY: sRy, perspective: 900 }}
        onMouseMove={onMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={onLeave}
        whileHover={{ scale: 1.04 }}
        transition={{ scale: { duration: 0.35, ease: "easeOut" } }}
      >
        <CardFace href={cat.href} $bg={cat.bg}>
          {cat.photo && <CardPhoto src={cat.photo} alt={cat.label} $fit={cat.fit} />}
          {/* Both "cover" and "contain" cards now fill the card with the
              photo, so the labels overlay the image at the bottom. The
              gradient + light-text pair ensures legibility regardless of
              what's at the bottom of the painting/photo. */}
          {cat.photo && <CardPhotoGradient />}
          <div style={{ position: "relative", zIndex: 2 }}>
            <CardNum
              style={{
                color: cat.photo ? "rgba(255,255,255,0.55)" : undefined,
              }}
            >
              {cat.n}
            </CardNum>
            <CardLabel
              style={{
                color: cat.photo ? "rgba(255,255,255,0.92)" : undefined,
              }}
            >
              {cat.en}
            </CardLabel>
          </div>
        </CardFace>
        <CardShimmer
          $fit={cat.fit}
          style={{ background: shimmerBg as unknown as string }}
        />
      </CardInner>
    </CardWrap>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { t } = useTranslation(translations);
  const { home } = t;
  const { hideUI } = useUIVisibility();

  const mouseX = useMotionValue(720);
  const mouseY = useMotionValue(450);

  // Cursor — dot is near-instant, ring follows with gentle lag
  const cursorX = useSpring(mouseX, { stiffness: 2800, damping: 120 });
  const cursorY = useSpring(mouseY, { stiffness: 2800, damping: 120 });
  const ringX   = useSpring(mouseX, { stiffness: 160, damping: 22 });
  const ringY   = useSpring(mouseY, { stiffness: 160, damping: 22 });
  const [ringScale, setRingScale] = useState(1);

  // Background parallax — subtle (max ±8px)
  const sMX = useSpring(mouseX, { stiffness: 50, damping: 16 });
  const sMY = useSpring(mouseY, { stiffness: 50, damping: 16 });
  const bgX    = useTransform(sMX, [0, 1440], [8, -8]);
  const bgY    = useTransform(sMY, [0, 900],  [5, -5]);

  // Cards layer drifts slightly counter to bg (depth separation)
  const cardsX = useTransform(sMX, [0, 1440], [-6, 6]);
  const cardsY = useTransform(sMY, [0, 900],  [-4, 4]);

  useEffect(() => {
    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 2);

    const handleOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("a, button")) setRingScale(2);
      else setRingScale(1);
    };
    document.addEventListener("mouseover", handleOver);
    return () => document.removeEventListener("mouseover", handleOver);
  }, []);

  const onMouseMove = (e: RMouseEvent<HTMLDivElement>) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  return (
    <>
      <CursorDot style={{ x: cursorX, y: cursorY }} />
      <CursorRing
        style={{ x: ringX, y: ringY }}
        animate={{ scale: ringScale, opacity: ringScale > 1 ? 0.45 : 1 }}
        transition={{ scale: { duration: 0.3, ease: "easeOut" }, opacity: { duration: 0.2 } }}
      />

      <Scene onMouseMove={onMouseMove}>
        <BgLayer style={{ x: bgX, y: bgY }} />

        <Grain />

        {/* UI content (fades on hideUI) */}
        <div
          style={{
            opacity: hideUI ? 0 : 1,
            transition: "opacity 0.4s ease",
            pointerEvents: hideUI ? "none" : "auto",
          }}
        >
        <LeftVeil />

        {/* Loading bar — fills once, stays */}
        <ProgressWrap>
          <ProgressFill
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.0, ease: EASE, delay: 0.05 }}
          />
        </ProgressWrap>

        {/* Rotating circular badge */}
        <BadgeWrap
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0, duration: 0.7, ease: EASE }}
        >
          <motion.svg
            viewBox="0 0 80 80"
            width={80}
            height={80}
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          >
            <defs>
              <path
                id="circ"
                d="M 40,40 m -30,0 a 30,30 0 1,1 60,0 a 30,30 0 1,1 -60,0"
              />
            </defs>
            <text fontSize="5" fill="rgba(0,0,0,0.38)" fontWeight="500" letterSpacing="3">
              <textPath href="#circ">Fine Art · Fashion · Photo ·  </textPath>
            </text>
          </motion.svg>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 4,
              height: 4,
              background: "rgba(0,0,0,0.2)",
              borderRadius: "50%",
              transform: "translate(-50%,-50%)",
            }}
          />
        </BadgeWrap>
          {/* Cards — parallax layer */}
          <CardsLayer style={{ x: cardsX, y: cardsY }}>
            {CATS.map((cat, i) => (
              <TiltCard
                key={cat.href}
                cat={cat}
                pos={CARD_POS[i]}
                delay={0.3 + i * 0.1}
              />
            ))}
          </CardsLayer>

          {/* Hero text — clip-path line-by-line reveal */}
          <HeroLayer>
            <Clip>
              <EyebrowInner
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
              >
                <EyebrowRule />
                {home.tagline}
              </EyebrowInner>
            </Clip>

            <Clip>
              <NameInner
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.85, ease: EASE, delay: 0.35 }}
              >
                {home.name}
              </NameInner>
            </Clip>

            <Clip>
              <DescInner
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
              >
                {home.description}
              </DescInner>
            </Clip>

            <CtaRow
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.68 }}
            >
              <CtaPrimary href="/works">{home.cta_works}</CtaPrimary>
              <CtaSecondary href="/about">{t.top_navigation.about}</CtaSecondary>
            </CtaRow>
          </HeroLayer>

          {/* Bottom marquee — very slow, very quiet */}
          <MarqueeWrap>
            <MarqueeTrack>
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                <span key={i} style={{ display: "contents" }}>
                  <MarqueeItem>{item}</MarqueeItem>
                  <MarqueeSep>·</MarqueeSep>
                </span>
              ))}
            </MarqueeTrack>
          </MarqueeWrap>
        </div>
      </Scene>
    </>
  );
}
