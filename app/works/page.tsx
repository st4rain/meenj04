"use client";

import styled from "@emotion/styled";
import Link from "next/link";
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

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CategoryCard = styled(Link)`
  display: block;
  text-decoration: none;
`;

const CardImage = styled.div`
  width: 100%;
  /* 4 / 5 matches the natural aspect ratio of the Fine Art preview image
   * (652 × 814), so the painting fills the card edge-to-edge with no
   * letterbox. Empty placeholder cards (Fashion, Photo) keep the same
   * shape so the 3-card grid stays visually consistent. */
  aspect-ratio: 4 / 5;
  background: #f5f5f5;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: background 0.2s;
  ${CategoryCard}:hover & {
    background: #eee;
  }
`;

/* Inner image — fills the entire card box edge-to-edge. `cover` crops
 * any aspect-ratio mismatch (and any built-in source-image padding, e.g.
 * the moodboard's paper-background margin) so the card never shows
 * letterbox bands. The Fine Art preview is exactly 4 / 5, so cover and
 * contain render identically for it; Fashion's moodboard is ~0.835
 * portrait with extra whitespace below the photos — cover trims that
 * cleanly. */
const CardImageInner = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
  ${CategoryCard}:hover & {
    transform: scale(1.02);
  }
`;

const CardTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 600;
  color: #111;
  margin: 0 0 0.25rem;
  letter-spacing: -0.01em;
`;

const CardDesc = styled.p`
  font-size: 1.15rem;
  color: #999;
  margin: 0;
  line-height: 1.5;
`;

const WorksPage = () => {
  const { t } = useTranslation(translations);
  const { works } = t;

  const categories = [
    {
      href: "/works/fine-art",
      title: works.fine_art,
      description: works.fine_art_description,
      image: "/img/fine-art-preview.png",
    },
    {
      href: "/works/fashion",
      title: works.fashion,
      description: works.fashion_description,
      image: "/img/fashion-preview.jpg",
    },
    {
      href: "/works/photo",
      title: works.photo,
      description: works.photo_description,
      image: "/img/photo-preview.jpg",
    },
  ];

  return (
    <PageWrapper>
      <MainContainer>
        <Section>
          <PageTitle>{works.title}</PageTitle>
          <CategoryGrid>
            {categories.map((cat) => (
              <CategoryCard key={cat.href} href={cat.href}>
                <CardImage>
                  {cat.image && (
                    <CardImageInner src={cat.image} alt={cat.title} />
                  )}
                </CardImage>
                <CardTitle>{cat.title}</CardTitle>
                <CardDesc>{cat.description}</CardDesc>
              </CategoryCard>
            ))}
          </CategoryGrid>
        </Section>
      </MainContainer>
    </PageWrapper>
  );
};

export default WorksPage;
