"use client";

import styled from "@emotion/styled";
import { Fragment } from "react";
import MainContainer from "../../components/MainContainer";
import useTranslation from "../../hooks/useTranslation";
import { translations } from "../translations";

const PageWrapper = styled.div`
  padding-top: 64px;
  min-height: 100vh;
`;

const Section = styled.section`
  padding: 5rem 0;
`;

const PageTitle = styled.h1`
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #111;
  margin: 0 0 3rem;
`;

/* Three-column editorial layout: portrait | bio | meta.
 * The portrait column is intentionally narrower than the bio so the bio
 * remains the page's primary text body. On tablet, bio + meta collapse
 * into a single stack alongside the portrait. On mobile, all three stack
 * vertically with the portrait sized down to a comfortable reading width. */
const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(240px, 320px) minmax(0, 1.5fr) minmax(0, 1fr);
  gap: 4.5rem;

  @media (max-width: 1100px) {
    grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
    gap: 3.5rem;
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

/* Portrait column — sticky on desktop so the photo stays visible while
 * the bio scrolls past, mirroring how museum artist pages anchor the
 * subject. Falls back to static positioning at narrow widths so it
 * doesn't fight the natural document flow on small screens. */
const ProfileColumn = styled.div`
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 96px;
  align-self: start;

  @media (max-width: 1100px) {
    grid-column: 1 / 2;
    grid-row: 1 / span 2;
  }

  @media (max-width: 720px) {
    position: static;
    max-width: 320px;
    grid-column: auto;
    grid-row: auto;
  }
`;

/* Frame for the portrait. Soft off-white background fills any letterboxing
 * if the source image's aspect ratio differs slightly from 4/5. A whisper
 * of shadow lifts it off the page without looking glossy or stocky. */
const ProfileFrame = styled.figure`
  margin: 0 0 1.5rem;
  width: 100%;
  aspect-ratio: 4 / 5;
  background: #f4f4f3;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 12px 32px rgba(0, 0, 0, 0.06);
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    /* Subtle warm wash to soften the studio-white background and tie the
       portrait into the page's editorial palette. */
    filter: saturate(1.02) contrast(1.02);
    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }

  &:hover img {
    transform: scale(1.015);
  }
`;

const ProfileName = styled.p`
  font-size: 1.25rem;
  letter-spacing: -0.01em;
  color: #111;
  margin: 0;
  font-weight: 600;
`;

const ProfileTagline = styled.p`
  font-size: 0.9rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #888;
  margin: 0.45rem 0 0;
`;

const BioBlock = styled.div`
  @media (max-width: 1100px) {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
  }

  @media (max-width: 720px) {
    grid-column: auto;
    grid-row: auto;
  }
`;

const BioText = styled.p`
  font-size: 1.4rem;
  line-height: 1.8;
  color: #333;
  margin: 0 0 2rem;
  /* Wrap at word boundaries so Korean words don't break mid-syllable
     (e.g. avoid "있습\n니다."). */
  word-break: keep-all;
  overflow-wrap: break-word;

  &:last-child {
    margin-bottom: 0;
  }
`;

const MetaBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (max-width: 1100px) {
    grid-column: 2 / 3;
    grid-row: 2 / 3;
    margin-top: 1rem;
    padding-top: 2.5rem;
    border-top: 1px solid #f0f0f0;
  }

  @media (max-width: 720px) {
    grid-column: auto;
    grid-row: auto;
    margin-top: 0;
    padding-top: 0;
    border-top: none;
  }
`;

const MetaItem = styled.div``;

const MetaLabel = styled.p`
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #aaa;
  text-transform: uppercase;
  margin: 0 0 0.5rem;
`;

const MetaValue = styled.p`
  font-size: 1.3rem;
  color: #333;
  margin: 0;
  line-height: 1.6;
`;

const MetaPeriod = styled.p`
  font-size: 1.1rem;
  color: #aaa;
  margin: 0.2rem 0 0;
`;

/* Email list — first entry is the primary inbox; secondary entries follow
 * in a slightly lighter weight. Keeps both clickable and keeps the meta
 * column from feeling crowded when more than one address is listed. */
const EmailList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.4rem;
`;

const ContactLink = styled.a<{ $primary?: boolean }>`
  color: #111;
  text-decoration: underline;
  text-underline-offset: 3px;
  font-size: ${({ $primary }) => ($primary ? "1.3rem" : "1.1rem")};
  font-weight: ${({ $primary }) => ($primary ? 500 : 400)};
  &:hover {
    color: #555;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #f0f0f0;
  margin: 0;
`;

const AboutPage = () => {
  const { t } = useTranslation(translations);
  const { about, home } = t;

  return (
    <PageWrapper>
      <MainContainer>
        <Section>
          <PageTitle>{about.title}</PageTitle>
          <Grid>
            <ProfileColumn>
              <ProfileFrame>
                <img src="/img/about/profile.png" alt={home.name} />
              </ProfileFrame>
              <ProfileName>{home.name}</ProfileName>
              <ProfileTagline>{home.tagline}</ProfileTagline>
            </ProfileColumn>
            <BioBlock>
              {about.bio.map((para, i) => (
                <BioText key={i}>
                  {para.map((line, j) => (
                    <Fragment key={j}>
                      {j > 0 && <br />}
                      {line}
                    </Fragment>
                  ))}
                </BioText>
              ))}
            </BioBlock>
            <MetaBlock>
              <MetaItem>
                <MetaLabel>{about.education_label}</MetaLabel>
                <MetaValue>{about.education}</MetaValue>
                <MetaPeriod>{about.education_period}</MetaPeriod>
              </MetaItem>
              <Divider />
              <MetaItem>
                <MetaLabel>{about.contact_label}</MetaLabel>
                <MetaValue>{about.contact_description}</MetaValue>
                <EmailList>
                  {about.emails.map((email, i) => (
                    <ContactLink
                      key={email}
                      href={`mailto:${email}`}
                      $primary={i === 0}
                    >
                      {email}
                    </ContactLink>
                  ))}
                </EmailList>
              </MetaItem>
            </MetaBlock>
          </Grid>
        </Section>
      </MainContainer>
    </PageWrapper>
  );
};

export default AboutPage;
