"use client";

import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { IconEye, IconEyeOff, IconMenu2, IconX } from "@tabler/icons-react";
import MainContainer from "../components/MainContainer";
import useTranslation from "../hooks/useTranslation";
import { useUIVisibility } from "../contexts/UIVisibilityContext";
import { translations } from "./translations";

/* ── 상단 바 ── */

const TopFixed = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  transition: opacity 0.35s ease, transform 0.35s ease,
    background 0.25s ease, backdrop-filter 0.25s ease;
`;

const TopLinksRow = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TopLinkCss = css`
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  text-decoration: none;
  font-size: 1.5rem;
  padding: 0 1rem;
  color: #555;
  transition: color 0.15s;
  &:hover {
    color: #111;
  }
`;

const TopLogoLink = styled(Link)`
  ${TopLinkCss}
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #111;
  padding-left: 0;
  flex: 0 0 auto;
  &:hover {
    color: #111;
  }
`;

const TopLink = styled(Link)<{ $active?: boolean }>`
  ${TopLinkCss}
  flex: 1 1 auto;
  color: ${({ $active }) => ($active ? "#111" : "#555")};
  font-weight: ${({ $active }) => ($active ? "700" : "400")};
  /* 모바일에서 숨김 */
  @media (max-width: 768px) { display: none; }
`;

const TopLangToggle = styled(Link)`
  ${TopLinkCss}
  flex: 0 0 auto;
  font-size: 1.25rem;
  letter-spacing: 0.1em;
  color: #888;
  padding-right: 0;
  &:hover {
    color: #333;
  }
  /* 모바일에서 숨김 */
  @media (max-width: 768px) { display: none; }
`;

/* ── 햄버거 버튼 ── */

const HamburgerBtn = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #444;
  align-items: center;
  justify-content: center;
  @media (max-width: 768px) { display: flex; }
`;

/* ── 모바일 오버레이 메뉴 ── */

const MobileOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 101;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 2rem 3rem;
`;

const MobileCloseBtn = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  cursor: pointer;
  color: #444;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MobileLink = styled(Link)<{ $active?: boolean }>`
  font-size: clamp(2.2rem, 8vw, 3.2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: ${({ $active }) => ($active ? "#111" : "#bbb")};
  text-decoration: none;
  line-height: 1.2;
  transition: color 0.15s;
  &:hover { color: #111; }
`;

const MobileLangToggle = styled(Link)`
  margin-top: 2.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  color: #aaa;
  text-decoration: none;
  text-transform: uppercase;
  transition: color 0.15s;
  &:hover { color: #555; }
`;

/* ── 사이드바 ── */

const SideFixed = styled.nav<{ $visible: boolean }>`
  position: fixed;
  left: 24px;
  top: 50%;
  transform: ${({ $visible }) =>
    $visible
      ? "translateY(-50%) translateX(0)"
      : "translateY(-50%) translateX(-12px)"};
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  transition: opacity 0.35s ease, transform 0.35s ease;
`;

const SideLinkCss = css`
  display: flex;
  align-items: center;
  padding: 7px 12px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 1.5rem;
  color: #555;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
  &:hover {
    background: rgba(255, 255, 255, 0.7);
    color: #111;
    font-weight: 600;
  }
`;

const SideLogoLink = styled(Link)`
  ${SideLinkCss}
  font-size: 1.8rem;
  font-weight: 700;
  color: #111;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
`;

const SideLink = styled(Link)<{ $active?: boolean }>`
  ${SideLinkCss}
  color: ${({ $active }) => ($active ? "#111" : "#555")};
  font-weight: ${({ $active }) => ($active ? "700" : "400")};
`;

const SideLangToggle = styled(Link)`
  ${SideLinkCss}
  font-size: 1.25rem;
  letter-spacing: 0.1em;
  color: #888;
  margin-top: 8px;
  &:hover {
    color: #333;
  }
`;

const CleanViewBtn = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 200;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  &:hover {
    background: rgba(255, 255, 255, 0.96);
    color: #111;
  }
`;

const SCROLL_THRESHOLD = 80;
const SIDEBAR_MIN_WIDTH = 900;
const SIDEBAR_BODY_PAD = 120;

const ClientNavigation = () => {
  const { t, lang } = useTranslation(translations);
  const { top_navigation: nav } = t;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [wide, setWide] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { hideUI, toggleHideUI } = useUIVisibility();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    const onResize = () => setWide(window.innerWidth >= SIDEBAR_MIN_WIDTH);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    onScroll();
    onResize();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // 라우트 변경 시 메뉴 닫기
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // 메뉴 열릴 때 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const useSidebar = scrolled && wide;

  useEffect(() => {
    document.body.style.transition = "padding 0.35s ease";
    if (useSidebar) {
      document.body.style.paddingLeft = `${SIDEBAR_BODY_PAD}px`;
      document.body.style.paddingRight = `${SIDEBAR_BODY_PAD}px`;
    } else {
      document.body.style.paddingLeft = "";
      document.body.style.paddingRight = "";
    }
  }, [useSidebar]);

  useEffect(() => {
    return () => {
      document.body.style.paddingLeft = "";
      document.body.style.paddingRight = "";
      document.body.style.transition = "";
    };
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Build language toggle URL preserving the current pathname and any other query params (e.g. ?articles=1).
  const langHref = useMemo(() => {
    const next = lang === "ko" ? "en" : "ko";
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", next);
    return `${pathname}?${params.toString()}`;
  }, [lang, pathname, searchParams]);
  const langLabel = lang === "ko" ? "EN" : "KO";

  const NAV_ITEMS = [
    { href: "/about",      label: nav.about },
    { href: "/works",      label: nav.works },
    { href: "/exhibition", label: nav.exhibition },
    { href: "/archive",    label: nav.archive },
  ];

  return (
    <>
      {/* 상단 바 */}
      <TopFixed
        style={{
          opacity: hideUI ? 0 : useSidebar ? 0 : 1,
          transform: useSidebar ? "translateY(-12px)" : "translateY(0)",
          pointerEvents: hideUI || useSidebar ? "none" : "auto",
          background: "rgba(255, 255, 255, 0.82)",
          backdropFilter: "blur(14px) saturate(160%)",
          WebkitBackdropFilter: "blur(14px) saturate(160%)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
        }}
      >
        <MainContainer>
          <TopLinksRow>
            <TopLogoLink href="/">Gwak Minji</TopLogoLink>

            {/* 데스크톱 링크 */}
            {NAV_ITEMS.map(({ href, label }) => (
              <TopLink key={href} href={href} $active={isActive(href)}>
                {label}
              </TopLink>
            ))}
            <TopLangToggle href={langHref}>{langLabel}</TopLangToggle>

            {/* 모바일 햄버거 */}
            <HamburgerBtn
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            >
              {menuOpen ? <IconX size={28} stroke={1.5} /> : <IconMenu2 size={28} stroke={1.5} />}
            </HamburgerBtn>
          </TopLinksRow>
        </MainContainer>
      </TopFixed>

      {/* 좌측 사이드바 */}
      <SideFixed $visible={!hideUI && useSidebar}>
        <SideLogoLink href="/">GM</SideLogoLink>
        {NAV_ITEMS.map(({ href, label }) => (
          <SideLink key={href} href={href} $active={isActive(href)}>
            {label}
          </SideLink>
        ))}
        <SideLangToggle href={langHref}>{langLabel}</SideLangToggle>
      </SideFixed>

      {/* 모바일 풀스크린 메뉴 */}
      <AnimatePresence>
        {menuOpen && (
          <MobileOverlay
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <MobileCloseBtn
              onClick={() => setMenuOpen(false)}
              aria-label="메뉴 닫기"
            >
              <IconX size={28} stroke={1.5} />
            </MobileCloseBtn>

            {NAV_ITEMS.map(({ href, label }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 + i * 0.07, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <MobileLink href={href} $active={isActive(href)}>
                  {label}
                </MobileLink>
              </motion.div>
            ))}

            <MobileLangToggle href={langHref}>{langLabel}</MobileLangToggle>
          </MobileOverlay>
        )}
      </AnimatePresence>

      {/* 우측 하단 — 배경 보기 토글 버튼 (홈 전용) */}
      {pathname === "/" && (
        <CleanViewBtn
          onClick={toggleHideUI}
          title={
            hideUI
              ? (lang === "ko" ? "UI 보이기" : "Show UI")
              : (lang === "ko" ? "배경 보기" : "View Background")
          }
        >
          {hideUI ? <IconEyeOff size={18} stroke={1.5} /> : <IconEye size={18} stroke={1.5} />}
        </CleanViewBtn>
      )}
    </>
  );
};

export default ClientNavigation;
