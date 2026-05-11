"use client";

import styled from "@emotion/styled";
import Link from "next/link";
import MainContainer from "../components/MainContainer";
import useTranslation from "../hooks/useTranslation";
import { translations } from "./translations";

/* Next.js App Router renders this file as the default 404 page. The visual
 * grammar mirrors the about / works / exhibition pages: padded `Section`,
 * editorial typography, soft greys, no decorative chrome — but everything
 * is centered vertically so the message has presence on an otherwise
 * empty canvas. */

const PageWrapper = styled.div`
  /* Match the 64px nav offset used elsewhere, then center the content
   * block in whatever vertical space remains (full viewport minus nav). */
  padding-top: 64px;
  min-height: 100vh;
  display: flex;
  align-items: center;
`;

const Inner = styled.section`
  /* Comfortable reading column — narrower than the about page since this
   * is short-form, ceremonial copy (a moment of pause, not a long read). */
  max-width: 640px;
  margin: 0 auto;
  padding: 4rem 0 6rem;
  text-align: center;

  @media (max-width: 720px) {
    padding: 3rem 0 4rem;
  }
`;

/* Tiny tracked label — the editorial signature shared with section labels
 * on Statement / Concept / Series Note throughout the site. */
const Eyebrow = styled.p`
  font-size: 0.78rem;
  letter-spacing: 0.36em;
  text-transform: uppercase;
  color: #999;
  margin: 0 0 2rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
`;

/* Display "404" — the visual anchor of the page. Tabular numerals so the
 * three glyphs are evenly weighted, tight tracking so the number reads
 * as a single character at any size. */
const Code = styled.h1`
  font-size: clamp(5.5rem, 14vw, 9rem);
  font-weight: 700;
  letter-spacing: -0.06em;
  color: #111;
  margin: 0;
  line-height: 0.9;
  font-variant-numeric: tabular-nums;
`;

/* Whisper-thin rule — the same 32–36px hairline used between the name
 * and tagline elsewhere. Quiet visual punctuation, not decoration. */
const Rule = styled.span`
  display: block;
  width: 36px;
  height: 1px;
  background: #d6d6d6;
  margin: 2.25rem auto;
`;

/* Bilingual title stack — primary line in the user's locale, with the
 * other-language echo immediately beneath in a quieter weight. */
const Title = styled.h2`
  font-size: clamp(1.4rem, 3vw, 1.85rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #111;
  margin: 0;
  font-style: italic;
  word-break: keep-all;
  overflow-wrap: break-word;
`;

const TitleAlt = styled.p`
  font-size: 1rem;
  letter-spacing: 0.05em;
  color: #888;
  margin: 0.75rem 0 0;
  word-break: keep-all;
  overflow-wrap: break-word;
`;

const Description = styled.p`
  font-size: 1.05rem;
  line-height: 1.85;
  color: #555;
  margin: 2.5rem auto 0;
  max-width: 480px;
  word-break: keep-all;
  overflow-wrap: break-word;
`;

/* CTA row — primary dark button (Home) + secondary link (View Works).
 * Exactly the affordance pair used on the home hero so the 404 feels
 * native rather than tacked on. */
const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.75rem;
  margin-top: 3.5rem;
  flex-wrap: wrap;
`;

const PrimaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  color: #fff;
  background: #111;
  padding: 0.95rem 2rem;
  transition: background 0.22s, gap 0.22s;
  white-space: nowrap;
  &::after {
    content: "→";
    transition: transform 0.2s;
  }
  &:hover {
    background: #2a2a2a;
    gap: 0.7rem;
  }
  &:hover::after {
    transform: translateX(2px);
  }
`;

const SecondaryLink = styled(Link)`
  font-size: 1rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.45);
  text-decoration: none;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-bottom: 1px solid transparent;
  padding-bottom: 2px;
  transition: color 0.2s, border-color 0.2s;
  white-space: nowrap;
  &:hover {
    color: rgba(0, 0, 0, 0.8);
    border-bottom-color: rgba(0, 0, 0, 0.4);
  }
`;

const NotFoundPage = () => {
  const { t } = useTranslation(translations);
  const { not_found } = t;

  return (
    <PageWrapper>
      <MainContainer>
        <Inner>
          <Eyebrow>{not_found.code}</Eyebrow>
          <Code>404</Code>
          <Rule />
          <Title>{not_found.title}</Title>
          <TitleAlt>{not_found.titleAlt}</TitleAlt>
          <Description>{not_found.description}</Description>
          <Actions>
            <PrimaryLink href="/">{not_found.cta_home}</PrimaryLink>
            <SecondaryLink href="/works">{not_found.cta_works}</SecondaryLink>
          </Actions>
        </Inner>
      </MainContainer>
    </PageWrapper>
  );
};

export default NotFoundPage;
