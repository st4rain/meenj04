"use client";

import styled from "@emotion/styled";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Fragment, useEffect, useState, useCallback } from "react";
import { IconX, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import MainContainer from "../../../components/MainContainer";
import useTranslation from "../../../hooks/useTranslation";
import { translations } from "../../translations";

/* ── Articles data ───────────────────────────────────────────────────────── */

/** Per-image caption — used by multi-piece articles where each image is its
 * own work with distinct title/dimensions. */
type ArticleImageCaption = {
  title: string;
  /** Optional Korean title — when set, the per-piece caption renders as
   *  "{titleKo} / {title} ({year})". */
  titleKo?: string;
  year?: string;
  dimensions: { ko: string; en: string };
};

/** Image entry — plain string for "just an image", or an object that can carry
 * a process note rendered ABOVE the image and/or a caption rendered BELOW. */
type ArticleImage =
  | string
  | {
      src: string;
      noteBefore?: { ko: string; en: string };
      captionAfter?: ArticleImageCaption;
    };

type Article = {
  id: number;
  title: string;
  /** Optional Korean title — when set, the detail-view caption renders as
   *  "{titleKo} / {title} ({year})". Thumbnail and breadcrumb keep `title`. */
  titleKo?: string;
  year: string;
  thumbnail: string;
  images: ArticleImage[];
  /** Process / behind-the-scenes images shown on a separate sub-view (?view=process). */
  processImages?: ArticleImage[];
  /** Process video (timelapse, etc.) shown alongside processImages on the process sub-view. */
  processVideo?: string;
  /** Long-form note rendered at the top of the process sub-view, above the
   *  process images. Used when the artist has a multi-paragraph reflection
   *  on how the work evolved (vs. per-image `noteBefore` captions). */
  processIntro?: { ko: string[]; en: string[] };
  /** Series-level prologue — a shared paragraph block rendered ABOVE the
   *  artist statement when the work belongs to a multi-piece series. The
   *  same prologue is duplicated across each work in the series so a
   *  visitor entering on any single piece sees the framing context. */
  seriesPrologue?: { ko: string[]; en: string[] };
  medium: { ko: string; en: string };
  /** Article-level dimensions; omit for multi-piece articles where each
   *  image carries its own dimensions via `captionAfter`. */
  dimensions?: { ko: string; en: string };
  description?: { ko: string[]; en: string[] };
  /** Caption-block kicker, defaults to "작업물 / Works". e.g. "습작 / Studies". */
  label?: { ko: string; en: string };
  /** Series sequence number — when set, a "시리즈 N / Series N" chip is shown
   *  on the listing card thumbnail and on the detail page caption block.
   *  Used to indicate that a work belongs to a connected sequence (e.g. the
   *  Goblin Fire / Tou trilogy: 16 → 17 → 18). */
  series?: number;
  /** "grid" = 3×3 polaroid layout (default). "stack" = vertical full-width images. */
  layout?: "grid" | "stack";
};

const imgSrc = (img: ArticleImage): string => (typeof img === "string" ? img : img.src);
const imgNote = (img: ArticleImage) =>
  typeof img === "string" ? null : img.noteBefore ?? null;
const imgCaption = (img: ArticleImage): ArticleImageCaption | null =>
  typeof img === "string" ? null : img.captionAfter ?? null;

/* Shared series-level prologue for the Seolmundae Halmang trilogy
 * (Genesis · Invocation · Metamorphosis). Rendered above each work's
 * artist statement so a visitor entering on any single piece sees the
 * trilogy's framing context. */
const TRILOGY_PROLOGUE: { ko: string[]; en: string[] } = {
  ko: [
    "본 작업은 인간의 근원적인 감정에서 비롯된 창조신화와 구전설화의 생성 구조를 회화적으로 탐구한 3부작이다. 제주 설문대할망 설화를 중심으로, 설화가 어떻게 생성되고 공동체 안에서 기원의 서사로 자리 잡으며, 시대에 따라 변형되고 재해석되는지를 회화적 레이어의 방식으로 시각화하였다.",
    "《시화 : 始話》는 설문대할망 설화의 '창조 단계'를, 《기상 : 祈像》은 설화가 공동체의 기원과 의례의 대상으로 기능하는 '신앙화 단계'를, 《변화 : 變話》는 구비전승을 거치며 새로운 형태로 재생산되는 '변형 단계'를 각각 다룬다.",
    "장지 위에 반복적으로 쌓아 올린 물감의 레이어는 설화가 시간 속에서 덧입혀지고 변형되는 구조적 특성을 반영한다. 또한 상징적 이미지의 중첩, 색이 스며들고 사라지는 흔적들은 설화가 지닌 유동성과 시대에 따라 변화하는 의미를 시각적 언어로 표현한 것이다.",
  ],
  en: [
    "This trilogy painterly explores the structural process of creation myths and oral narratives that arise from humanity's most primal emotions. Centered on the myth of Seolmundae Halmang of Jeju Island, the works visualize through painterly layers how a myth is generated, takes root within a community as a foundational narrative, and is transformed and reinterpreted across generations.",
    "《Genesis: The Beginning Tale》 addresses the “creation stage” of the Seolmundae Halmang myth, 《Invocation: The Sacred Form》 the “stage of belief,” in which the narrative becomes an object of communal faith and ritual, and 《Metamorphosis: The Retold Tale》 the “stage of transformation,” in which the story is continuously reproduced through oral transmission.",
    "The repeated layers of pigment built up on Jangji paper reflect the structural quality of myths that accumulate and shift through time. The overlapping of symbolic imagery, along with traces of color seeping and fading, becomes a visual language for the fluidity of myth and the meanings that evolve with each retelling.",
  ],
};

const ARTICLES: Article[] = [
  {
    id: 1,
    title: "Private Records",
    year: "2023",
    thumbnail: "/img/works/fine-art/private-records-2023/main.webp",
    images: [
      "/img/works/fine-art/private-records-2023/1.webp",
      "/img/works/fine-art/private-records-2023/2.webp",
      "/img/works/fine-art/private-records-2023/3.webp",
      "/img/works/fine-art/private-records-2023/4.webp",
      "/img/works/fine-art/private-records-2023/5.webp",
      "/img/works/fine-art/private-records-2023/6.webp",
      "/img/works/fine-art/private-records-2023/7.webp",
      "/img/works/fine-art/private-records-2023/8.webp",
      "/img/works/fine-art/private-records-2023/9.webp",
    ],
    medium: {
      ko: "종이에 연필, 오일 파스텔, 색연필",
      en: "Pencil, Oil Pastel, and Colored Pencil on Paper",
    },
    dimensions: {
      ko: "각각 120 × 100 mm",
      en: "120 × 100 mm each",
    },
    description: {
      ko: [
        "이제의 일기는 스스로를 견디고 이해하기 위한 기록에 가까워졌다.",
        "대학 입학 이후 새로운 환경과 수많은 사람들을 만나며 나를 둘러싼 세계는 빠르게 변화했고, 그 과정 속에서 시작된 블로그 글쓰기에는 꾸밈없는 생각과 감정들이 고스란히 담기기 시작했다. 일기는 더 이상 하루를 나열하는 행위가 아니라, 스스로를 위로하고 모든 감정을 털어놓을 수 있는 공간으로 자리하게 되었다.",
        "이러한 일기의 속성을 바탕으로 사람들의 서로 다른 삶과 감정을 시각적으로 표현하고자 했다. 개별적인 순간을 기록하는 폴라로이드 형식을 차용하여 작업을 구성하였으며, 눈과 입, 귀와 같은 신체의 일부를 통해 각기 다른 사람들의 감정과 관계, 소통의 방식을 드러내고자 했다. 또한 다양한 재료를 함께 사용함으로써, 서로 다른 질감과 특성이 각자의 삶과 닮아 있다는 점을 표현하고자 하였다.",
      ],
      en: [
        "A diary is not simply a form of record for me, but rather a means of survival.",
        "When I was younger, diaries were stories written to be shown to parents and teachers. Now, however, they have become a way for me to endure and understand myself. After entering university, the world surrounding me changed rapidly as I encountered new environments and countless people. Through this process, I began writing on a blog, where my unfiltered thoughts and emotions gradually became embedded in my writing. A diary was no longer just a list of daily events, but a space where I could comfort myself and freely release my emotions.",
        "Based on these characteristics of diaries, I sought to visually express the different lives and emotions of individuals. I constructed the work using the format of Polaroid photographs, which capture personal and fragmented moments. Through body parts such as eyes, mouths, and ears, I aimed to reveal the various emotions, relationships, and modes of communication that exist between people. Furthermore, by incorporating a variety of materials, I intended to convey that just as each material possesses its own distinct texture and quality, every individual life also carries its own unique nature.",
      ],
    },
    layout: "grid",
  },
  {
    id: 2,
    title: "Accident",
    year: "2023",
    thumbnail: "/img/works/fine-art/accident-2023/thumbnail.webp",
    // Default view: only the final installation shot.
    images: [
      "/img/works/fine-art/accident-2023/main.webp",
    ],
    // Process view (?view=process): sketch → cut → ink tiles → verso → recto → installation
    processImages: [
      "/img/works/fine-art/accident-2023/esquisse.webp",
      "/img/works/fine-art/accident-2023/cuttingprocess.webp",
      {
        src: "/img/works/fine-art/accident-2023/septer_process.webp",
        noteBefore: {
          ko: "종이에 전반적으로 물을 뿌린 후 먹을 퍼트리거나 물통 안에서 먹과 비누거품을 섞어 만들어 낸 많은 조각들 중에서 선별하여 배치",
          en: "After spraying water across the surface of the paper, ink was spread and manipulated. Fragments created by mixing ink and soap bubbles inside a container of water were then selectively chosen and arranged.",
        },
      },
      "/img/works/fine-art/accident-2023/septer.webp",
      "/img/works/fine-art/accident-2023/outcome2.webp",
      "/img/works/fine-art/accident-2023/outcome.webp",
    ],
    medium: {
      ko: "종이에 수채화 물감, 먹, 비누 (양면 작업)",
      en: "Watercolor, Sumi Ink, and Soap on Paper (recto and verso)",
    },
    dimensions: {
      ko: "약 750 × 600 mm",
      en: "Approx. 750 × 600 mm",
    },
    description: {
      ko: [
        "‘직접성’과 ‘시간성’이라는 두 가지 키워드를 바탕으로 작업을 진행하였다.",
        "시간성은 형태 없이 흐르는 요소이기에, 시간을 어떤 방식으로 기록하고 드러낼 수 있을지에 대한 고민에서 작업이 시작되었다. 그 과정에서 시간을 표현하는 소재로 ‘구름’을 선택하였다. 구름은 시간에 따라 끊임없이 움직이며 변화하고, 한 번 지나간 하늘의 모습은 다시 같은 형태로 돌아오지 않는다. 이러한 특징에서 “같은 하늘은 다시는 돌아오지 않는다”라는 생각에 도달하게 되었고, 이를 바탕으로 작업을 전개하였다.",
        "또한 작업에는 ‘직접성’의 개념을 함께 담고자 하였다. 직접성이란 중간의 매개 없이 대상과 바로 연결되는 성질을 의미한다. 이를 표현하기 위해 종이를 잘라 물통 속 먹과 물감, 비누 거품과 직접 맞닿게 하여 우연적으로 만들어지는 흔적들을 작업에 활용하였다. 손으로 만든 비누 거품에 먹을 섞어 종이 위에 올리고 자연스럽게 마르도록 두어, 재료 스스로 만들어내는 형태와 흔적이 그대로 드러나도록 하였다.",
        "이 과정에서 만들어진 이미지들은 의도적으로 조형한 구름 작업과 달리 예측할 수 없는 우연의 결과물이었다. 색감이나 형태가 서로 어울리지 않아 제외되는 조각들도 있었지만, 오히려 그러한 불완전함과 불규칙성이 시간의 흐름과 우연성을 더욱 직접적으로 보여준다고 생각한다. 매개 없이 재료 자체가 만들어낸 흔적들은 작업이 의도한 ‘직접성’을 가장 솔직하게 드러내는 요소가 되었다.",
      ],
      en: [
        "This work was developed around two key concepts: “directness” and “temporality.”",
        "Temporality is an intangible element that continuously flows without fixed form, and the work began from the question of how time could be recorded and visually revealed. In this process, I chose “clouds” as a motif for representing time. Clouds constantly move and transform over time, and once a moment in the sky has passed, it never returns in the exact same form. From this characteristic, I arrived at the thought that “the same sky never returns twice,” which became the foundation of the work.",
        "At the same time, I aimed to incorporate the idea of “directness” into the process. Directness refers to a state of immediate connection without the intervention of a mediator. To express this, I cut paper into fragments and allowed them to come into direct contact with ink, paint, and soap bubbles inside a container of water, embracing the traces created through chance. By mixing ink with soap bubbles formed by hand and placing them onto the paper to dry naturally, I sought to reveal forms and marks generated by the materials themselves.",
        "Unlike the cloud imagery, which involved a degree of intentional composition, the images created through ink and paint emerged entirely through unpredictability and chance. Some fragments were discarded because their colors or forms did not harmonize with others; however, I came to see these imperfections and irregularities as elements that more directly embodied temporality and chance. The traces created solely by the materials themselves, without mediation, ultimately became the most honest expression of the “directness” that the work intended to convey.",
      ],
    },
    layout: "stack",
  },
  {
    id: 3,
    title: "Gradually",
    titleKo: "점점",
    year: "2024",
    thumbnail: "/img/works/fine-art/gradually-2024/thumbnail.webp",
    images: [
      "/img/works/fine-art/gradually-2024/main.webp",
    ],
    medium: {
      ko: "캔버스에 유채",
      en: "Oil on Canvas",
    },
    dimensions: {
      ko: "455 × 270 mm",
      en: "455 × 270 mm",
    },
    description: {
      ko: [
        "이 작업은 휴대폰 사진첩을 무심코 들여다보며 시작되었다.",
        "‘나는 어떤 장면을 기록하고 남기고 있는가?’라는 질문 속에서 사진첩에는 유독 풍경 사진이 많다는 사실을 발견하게 되었다. 그중에서도 산이나 KTX를 타고 지나가며 찍은 한적한 시골 풍경들이 반복적으로 남아 있었다.",
        "나는 왜 이러한 풍경에 끌리는지 스스로에게 질문하게 되었고, 그 이유를 찾기 전에 우선 직접 그려보고자 했다. 그렇게 화면 속 풍경은 단순한 기록을 넘어, 내가 편안함과 안정감을 느끼는 감정의 장소로 확장되었다.",
        "제목인 《점점》은 ‘점점 집과 가까워진다’라는 의미에서 가져온 표현이다. 여기서 집은 단순한 공간이 아니라, 나만의 안식처이자 편안함, 그리고 가족의 의미를 담고 있다.",
      ],
      en: [
        "This work began while casually scrolling through the photo gallery on my phone.",
        "I started to question what kinds of images I choose to keep and preserve. As I looked through the gallery, I noticed that a large number of the photographs were landscapes, particularly quiet rural scenes taken while traveling through mountains or riding the KTX.",
        "I began to wonder why I was so drawn to these calm and isolated landscapes. Before searching for a clear answer, I decided to paint them first. Through this process, the landscapes expanded beyond simple records of scenery and became emotional spaces associated with comfort and stability.",
        "The title 《Gradually》 originates from the phrase “gradually getting closer to home.” Here, “home” does not simply refer to a physical place, but to a sense of personal comfort, rest, and family.",
      ],
    },
    layout: "stack",
  },
  {
    id: 4,
    title: "Blueprints",
    year: "2024",
    label: { ko: "습작", en: "Studies" },
    thumbnail: "/img/works/fine-art/blueprint-studies-2024/thumbnail.webp",
    /* Two distinct works grouped under one article — each image carries its
     * own captionAfter (title + dimensions). They share medium, statement,
     * and a process video. */
    images: [
      {
        src: "/img/works/fine-art/palgongsan-2024/main.webp",
        captionAfter: {
          title: "Palgongsan",
          titleKo: "팔공산",
          year: "2024",
          dimensions: { ko: "290 × 225 mm", en: "290 × 225 mm" },
        },
      },
      {
        src: "/img/works/fine-art/mireuksan-2024/main.webp",
        captionAfter: {
          title: "At the Cliffs of Mireuksan",
          titleKo: "미륵산 절벽에서",
          year: "2024",
          dimensions: { ko: "265 × 190 mm", en: "265 × 190 mm" },
        },
      },
    ],
    processVideo: "/img/works/fine-art/blueprint-studies-2024/process.mp4",
    medium: { ko: "캔버스에 유채", en: "Oil on Canvas" },
    /* No article-level dimensions — each piece's dimensions live on its
     * captionAfter. */
    description: {
      ko: [
        "《점점》 작업 이후, 왜 특정 풍경과 기억을 계속해서 사진으로 남기고 반복적으로 떠올리게 되는지에 대해 고민하게 되었다. 이러한 감각을 시간과 청사진(Blueprint)의 개념에 빗대어 시각화 하고자 하였다.",
        "순간은 찰나의 형태로 존재하며, 그 순간이 지나가는 즉시 과거가 된다. 나는 이러한 흐름 속에서 시간이라는 개념이 무엇이며 인간의 삶과 어떤 관계를 맺고 있는지에 대해 고민하기 시작했다. 이 과정은 ‘시간의 전제조건’이라는 주제로 이어지며 작업의 출발점이 되었다.",
        "작업을 진행하던 중 ‘청사진(Blueprint)’이라는 개념에 주목하게 되었다. 청사진은 건축적 설계 도면을 의미하는 동시에 미래에 대한 구상과 희망이라는 상징적 의미를 함께 지니고 있었다. 나는 이러한 의미가 작업의 방향성과 맞닿아 있다고 느꼈고, 이를 시각적으로 풀어내고자 하였다.",
        "작업들은 청사진의 개념을 시각화 하는 과정의 습작이다. 푸른 색을 캔버스 위에 입힌 뒤 테레핀유로 일부를 닦아내어 아래의 젯소 층이 드러나도록 작업하였으며, 이를 통해 시간의 흔적과 지워짐, 그리고 남겨진 감각을 표현하고자 했다.",
      ],
      en: [
        "Following the work 《Gradually》, I began to reflect on why certain landscapes and memories are continuously preserved through photographs and repeatedly recalled over time. I sought to visualize this sensation through the concepts of time and the blueprint.",
        "A moment exists only briefly, and once it passes, it immediately becomes part of the past. From this awareness, I began questioning what time truly is and how it relates to human existence. These thoughts gradually developed into a body of work centered around the “preconditions of time.”",
        "During this process, I became interested in the concept of the “blueprint.” While the term refers to an architectural plan or technical drawing, it also carries symbolic meanings of vision, projection, and hope for the future. I felt that these meanings resonated closely with the direction of my work and attempted to translate them visually.",
        "The works below are preliminary studies exploring the visualization of the blueprint concept. After covering the canvas with a layer of blue paint, I partially removed the surface using turpentine so that the underlying gesso layer would become exposed. Through this process, I aimed to express traces of time, erasure, and the lingering sensations that remain afterward.",
      ],
    },
    layout: "stack",
  },
  {
    id: 5,
    title: "Cityscapes",
    year: "2024",
    thumbnail: "/img/works/fine-art/cityscapes-2024/thumbnail.webp",
    /* Two pieces grouped under one article — each carries its own
     * captionAfter (title + dimensions). Shared medium and statement. */
    images: [
      {
        src: "/img/works/fine-art/inside-the-airplane-2024/main.webp",
        captionAfter: {
          title: "Inside the Airplane",
          titleKo: "비행기 안에서",
          year: "2024",
          dimensions: { ko: "335 × 245 mm", en: "335 × 245 mm" },
        },
      },
      {
        src: "/img/works/fine-art/seoul-nightscape-2024/main.webp",
        captionAfter: {
          title: "Seoul Nightscape",
          titleKo: "서울야경",
          year: "2024",
          dimensions: { ko: "445 × 335 mm", en: "445 × 335 mm" },
        },
      },
    ],
    medium: { ko: "천에 유화", en: "Oil on Fabric" },
    /* No article-level dimensions — each piece's dimensions live on its
     * captionAfter. */
    description: {
      ko: [
        "두 점의 연습 작업이다.",
        "비행기 안에서 내려다본 풍경을 점과 선의 간결한 표현으로 구성한 작업과, 서울의 야경을 점의 반복만으로 표현한 작업으로 이루어져 있다.",
        "단순화된 형태와 빛의 흐름을 통해 도시 풍경이 가진 리듬과 움직임을 시각적으로 드러내고자 하였다.",
      ],
      en: [
        "These two works were created as preliminary studies.",
        "One piece depicts the view seen from an airplane through simplified lines and dots, while the other represents the nightscape of Seoul using only repeated points.",
        "Through simplified forms and the flow of light, the works aim to visually reveal the rhythm and movement embedded within urban landscapes.",
      ],
    },
    layout: "stack",
  },
  {
    id: 6,
    title: "Sanbok Drawing 1",
    year: "2024",
    label: { ko: "드로잉", en: "Drawing" },
    thumbnail: "/img/works/fine-art/sanbok-drawing-1-2024/thumbnail.webp",
    images: ["/img/works/fine-art/sanbok-drawing-1-2024/main.webp"],
    medium: { ko: "종이에 연필", en: "Pencil on Paper" },
    dimensions: { ko: "394 × 279 mm", en: "394 × 279 mm" },
    description: {
      ko: ["부산 감천문화마을 작업의 드로잉."],
      en: ["Drawings from the Gamcheon Culture Village Project."],
    },
    layout: "stack",
  },
  {
    id: 7,
    title: "Sanbok Drawing 2",
    year: "2024",
    label: { ko: "드로잉", en: "Drawing" },
    thumbnail: "/img/works/fine-art/sanbok-drawing-2-2024/thumbnail.webp",
    images: ["/img/works/fine-art/sanbok-drawing-2-2024/main.webp"],
    medium: { ko: "종이에 연필", en: "Pencil on Paper" },
    dimensions: { ko: "394 × 279 mm", en: "394 × 279 mm" },
    description: {
      ko: ["부산 감천문화마을 작업의 드로잉."],
      en: ["Drawings from the Gamcheon Culture Village Project."],
    },
    layout: "stack",
  },
  {
    id: 8,
    title: "Yellow Is Old",
    titleKo: "노란색은 Old",
    year: "2024",
    label: { ko: "드로잉", en: "Drawing" },
    thumbnail: "/img/works/fine-art/yellow-is-old-2024/thumbnail.webp",
    images: ["/img/works/fine-art/yellow-is-old-2024/main.webp"],
    medium: { ko: "종이에 오일파스텔", en: "Oil Pastel on Paper" },
    dimensions: { ko: "200 × 545 mm", en: "200 × 545 mm" },
    description: {
      ko: [
        "감천마을에 황혼이 내리면 불빛들이 하나둘씩 켜지기 시작한다.",
        "노란빛은 오래된 등이고, 푸르스름한 빛은 최근에 교체된 것들이다. 이 불빛들을 통해 마을이 얼마나 오래되었는지, 그리고 집들이 서로 얼마나 밀접하게 연결되어 있는지 알 수 있다.",
      ],
      en: [
        "As dusk falls over Gamcheon Village, lights gradually begin to turn on one by one.",
        "The yellow lights are older lamps, while the bluish lights are ones that have been more recently replaced. Through these lights, it becomes possible to sense how old the village is and how closely the houses are connected to one another.",
      ],
    },
    layout: "stack",
  },
  {
    id: 9,
    title: "Only the White Is New!",
    titleKo: "흰색만 New!",
    year: "2024",
    label: { ko: "드로잉", en: "Drawing" },
    thumbnail: "/img/works/fine-art/only-the-white-is-new-2024/thumbnail.jpg",
    images: ["/img/works/fine-art/only-the-white-is-new-2024/main.webp"],
    medium: { ko: "캔버스에 유화, 파스텔", en: "Oil and Pastel on Canvas" },
    dimensions: { ko: "271 × 454 mm", en: "271 × 454 mm" },
    description: {
      ko: [
        "《Yellow Is Old》 2024와 이어지는 연작이다.",
        "흰색 불빛만 최근에 교체된 조명이며, 그 외의 불빛들은 오랜 시간 마을에 남아 있던 것들이다.",
        "이러한 불빛들을 통해 마을 사람들의 시간과 생활의 흔적을 읽어내고자 하였다.",
      ],
      en: [
        "This work is part of a series connected to Yellow Is Old, 2024.",
        "Only the white lights were recently replaced, while the others have remained in the village for a long time. Through these lights, I sought to trace the passage of time and the lingering presence of the people who have lived within the village.",
      ],
    },
    layout: "stack",
  },
  {
    id: 10,
    title: "Where They Gather",
    titleKo: "그들이 모이는 곳",
    year: "2024",
    label: { ko: "드로잉", en: "Drawing" },
    thumbnail: "/img/works/fine-art/where-they-gather-2024/thumbnail.jpg",
    images: ["/img/works/fine-art/where-they-gather-2024/main.webp"],
    medium: { ko: "종이판넬에 유화", en: "Oil on Paper Panel" },
    dimensions: { ko: "225 × 158 mm", en: "225 × 158 mm" },
    description: {
      ko: ["부산 감천문화마을 작업의 드로잉."],
      en: ["Drawings from the Gamcheon Culture Village Project."],
    },
    layout: "stack",
  },
  {
    id: 11,
    title: "sincerity",
    titleKo: "진심",
    year: "2024",
    label: { ko: "드로잉", en: "Drawing" },
    thumbnail: "/img/works/fine-art/sincerity-2024/thumbnail.jpg",
    images: ["/img/works/fine-art/sincerity-2024/main.webp"],
    medium: { ko: "종이판넬에 유화", en: "Oil on Paper Panel" },
    dimensions: { ko: "178 × 256 mm", en: "178 × 256 mm" },
    description: {
      ko: ["부산 감천문화마을 작업의 드로잉."],
      en: ["Drawings from the Gamcheon Culture Village Project."],
    },
    layout: "stack",
  },
  {
    id: 12,
    title: "Clothesline",
    titleKo: "빨-래, 줄",
    year: "2024",
    label: { ko: "드로잉", en: "Drawing" },
    thumbnail: "/img/works/fine-art/clothesline-2024/thumbnail.jpg",
    images: ["/img/works/fine-art/clothesline-2024/main.webp"],
    medium: { ko: "종이판넬에 오일파스텔", en: "Oil Pastel on Paper Panel" },
    dimensions: { ko: "178 × 256 mm", en: "178 × 256 mm" },
    description: {
      ko: ["부산 감천문화마을 작업의 드로잉."],
      en: ["Drawings from the Gamcheon Culture Village Project."],
    },
    layout: "stack",
  },
  {
    id: 13,
    title: "Gamcheon",
    titleKo: "감천",
    year: "2024",
    label: { ko: "드로잉", en: "Drawing" },
    thumbnail: "/img/works/fine-art/gamcheon-2024/thumbnail.jpg",
    images: ["/img/works/fine-art/gamcheon-2024/main.webp"],
    medium: { ko: "종이에 과슈", en: "Gouache on Paper" },
    dimensions: { ko: "394 × 279 mm", en: "394 × 279 mm" },
    description: {
      ko: ["부산 감천문화마을 작업의 드로잉."],
      en: ["Drawings from the Gamcheon Culture Village Project."],
    },
    layout: "stack",
  },
  {
    id: 14,
    title: "Beginning from Prehistoric Times",
    titleKo: "선사시대부터의 시작",
    year: "2025",
    label: { ko: "드로잉", en: "Drawing" },
    thumbnail: "/img/works/fine-art/beginning-from-prehistoric-times-2025/thumbnail.jpg",
    images: ["/img/works/fine-art/beginning-from-prehistoric-times-2025/main.webp"],
    medium: {
      ko: "장지에 봉채",
      en: "Traditional Korean pigments (Bongchae and Bunchae) on Jangji paper",
    },
    dimensions: { ko: "298 × 212 mm", en: "298 × 212 mm" },
    description: {
      ko: [
        "이 작업에서 도깨비불은 단순히 시각적인 모티프에 머무는 것이 아니라, 예술의 진실을 대변하는 상징으로 기능한다. 역사적으로 예술은 종종 권력의 중심에 존재하며 권위와 신념의 상징 역할을 해왔다. 이러한 경향은 이미 선사시대 예술작품에서도 발견되는데, 당시 인류는 보이지 않는 힘과 신앙의 체계를 시각적 형태로 형상화하여 표현했다.",
        "또한 도깨비불이 이러한 역사적 연속성의 연장선상에 있다고 생각한다. 선사시대부터 오늘날에 이르기까지, 도깨비불은 보이지 않는 힘과 영적인 존재를 시각화 하려는 인류의 지속적인 갈망을 투영한다. 이런 의미에서 도깨비불은 시대를 초월하여 보이지 않는 신념과 상징적 에너지를 드러내는 매개체로 작동한다.",
      ],
      en: [
        "In my work, the goblin fire functions not only as a visual motif but also as a symbol representing the truth of art. Throughout history, art has often existed at the center of power, serving as a symbol of authority and belief. This tendency can already be found in prehistoric artworks, where humans expressed invisible forces and systems of faith through visual forms.",
        "I believe that the goblin fire exists as an extension of this historical continuum. From prehistoric times to the present day, it reflects humanity's enduring desire to visualize unseen powers and spiritual presence. In this sense, the goblin fire operates as a medium that reveals invisible beliefs and symbolic energies across time.",
      ],
    },
    layout: "stack",
  },
  {
    id: 15,
    title: "Goblin Fire",
    titleKo: "도깨비불",
    year: "2025",
    thumbnail: "/img/works/fine-art/goblin-fire-2025/thumbnail.jpg",
    images: [
      "/img/works/fine-art/goblin-fire-2025/main.webp",
      "/img/works/fine-art/goblin-fire-2025/detail-1.webp",
      "/img/works/fine-art/goblin-fire-2025/detail-2.webp",
    ],
    medium: {
      ko: "장지에 봉채와 분채",
      en: "Traditional Korean pigments (Bongchae and Bunchae) on Jangji paper",
    },
    dimensions: { ko: "1622 × 970 mm", en: "1622 × 970 mm" },
    description: {
      ko: [
        "도깨비불은 하나의 예술적 형상으로 설명되기도 하지만, 동시에 공동체 안에서 구전되어 온 존재이기도 하다. 그들은 공동체라는 구조 안에서 서로 어울리며 다양한 모습으로 존재한다. 자세히 들여다보면 각기 다른 표정과 형태를 지니고 있는데, 이는 도깨비불의 기원이 결국 인간의 상상과 믿음에서 비롯되었기 때문이다. 다시 말해, 도깨비불은 인간을 닮은 존재이며 인간의 감정과 욕망이 투영된 형상이다. 이를 통해 “각자의 마음속에는 하나의 도깨비불이 존재한다”는 생각을 담고자 했다.",
        "작품 속 도깨비불은 자유롭게 공중을 떠다닌다. 그들은 사람들의 마음과 소망을 대변하는 존재이다. 사람들은 소망을 빌 때만큼은 어떤 억압이나 시선에서도 벗어나 자유롭게 원하는 것을 상상할 수 있다. 이러한 감정을 시각적으로 드러내기 위해 도깨비불이 부유하듯 날아다니는 형태로 표현했으며, 금분과 화이트 펄을 사용해 빛이 승천하는 듯한 분위기를 강조하였다.",
      ],
      en: [
        "The goblin fire can be understood as an artistic figure, but at the same time, it is also a being that has been passed down orally through communities. Within the structure of a community, they coexist and interact in various forms. When observed closely, each goblin fire possesses different facial expressions and appearances, reflecting the idea that their origin ultimately stems from human imagination and belief. In other words, the goblin fire resembles humanity itself, embodying projected human emotions and desires.",
        "Through this work, I sought to express the idea that “each person carries a goblin fire within their heart.” In the artwork, the goblin fires float freely through the air. They represent the inner mind and wish of people. When making wishes, people are momentarily freed from oppression and the awareness of others, allowing themselves to imagine their true desires without restraint. To visually convey this sense of freedom, I depicted the goblin fires drifting weightlessly in space, while gold powder and white pearl pigments were used to emphasize an atmosphere of ascending light and spiritual elevation.",
      ],
    },
    layout: "stack",
  },
  {
    id: 16,
    title: "Goblin Fire: Oral Narrative",
    titleKo: "도깨비불; 구전",
    year: "2025",
    thumbnail: "/img/works/fine-art/goblin-fire-oral-narrative-2025/thumbnail.jpg",
    images: [
      "/img/works/fine-art/goblin-fire-oral-narrative-2025/main.webp",
      "/img/works/fine-art/goblin-fire-oral-narrative-2025/detail-1.webp",
      "/img/works/fine-art/goblin-fire-oral-narrative-2025/detail-2.webp",
      "/img/works/fine-art/goblin-fire-oral-narrative-2025/detail-3.webp",
    ],
    medium: {
      ko: "장지에 유채와 봉채, 분채",
      en: "Oil paint and traditional Korean pigments (Bongchae and Bunchae) on Jangji paper",
    },
    dimensions: { ko: "1622 × 1303 mm", en: "1622 × 1303 mm" },
    description: {
      ko: [
        "공동체 안에서 구전되어 이어지는 특성에 더욱 초점을 맞춘 작업이다.",
        "작품에는 신라시대의 토우를 차용하였다. 기존 연구에서는 토우가 신라인들의 해학적인 모습과 생활상을 보여준다고 해석되기도 하지만, 단순히 익살스러운 표현에 주목하기보다 서로 다른 형태의 존재들이 하나의 원 안에서 함께 어우러지고 있다는 점에 집중하였다.",
        "현대 사회는 수많은 기준과 규범 속에서 살아가고 있으며, 사람들은 때로 자신의 모습이나 생각을 온전히 드러내지 못한 채 살아간다. 반면 삼국시대의 미술품과 기록물에서는 오늘날보다 더욱 자유롭고 개방적인 태도를 엿볼 수 있었다. 『구당서』와 같은 외부 기록에서도 당시 사회의 독특한 문화와 표현 방식을 확인할 수 있다. 이 작업은 공동체를 주제로 삼고 있지만, 다른 작업들과의 차별점은 삼국시대 문화에서 느껴지는 솔직함과 자유로운 분위기, 그리고 서로 다른 존재를 자연스럽게 받아들이는 태도를 토우의 형상에 빗대어 표현했다는 점에 있다.",
      ],
      en: [
        "This work places greater emphasis on the characteristics of oral tradition and the ways in which stories and beliefs are passed down within a community.",
        "The work incorporates Silla-era clay figurines (Tou). Previous studies have often interpreted these figures as representations of the humor and everyday life of the Silla people. However, rather than focusing solely on their playful qualities, I concentrated on how different forms of beings coexist harmoniously within a single circle or community.",
        "Modern society operates within countless standards and social norms, and people often live without being able to fully reveal their true selves or thoughts. In contrast, artworks and historical records from the Three Kingdoms period suggest a more open and expressive attitude than that of today. Such characteristics can also be found in external historical texts like the Old Book of Tang, which document the unique culture and modes of expression of the time. Although this work also deals with the theme of community, what distinguishes it from my previous works is its focus on the honesty, freedom, and accepting attitude embedded in the culture of the Three Kingdoms period. Through the imagery of the clay figurines, I sought to express a community in which different kinds of beings naturally coexist and embrace one another.",
      ],
    },
    layout: "stack",
  },
  {
    id: 17,
    title: "Invocation: The Sacred Form",
    titleKo: "기상 : 祈像",
    year: "2025",
    series: 2,
    thumbnail: "/img/works/fine-art/invocation-2025/thumbnail.jpg",
    images: ["/img/works/fine-art/invocation-2025/main.webp"],
    processImages: [
      "/img/works/fine-art/invocation-2025/process-1.webp",
      "/img/works/fine-art/invocation-2025/process-2.webp",
      "/img/works/fine-art/invocation-2025/process-3.webp",
      "/img/works/fine-art/invocation-2025/process-4.webp",
      "/img/works/fine-art/invocation-2025/process-5.webp",
    ],
    seriesPrologue: TRILOGY_PROLOGUE,
    medium: {
      ko: "장지에 동양화 물감과 분채",
      en: "Traditional Korean pigments and Bunchae on Jangji paper",
    },
    dimensions: { ko: "727 × 1000 mm", en: "727 × 1000 mm" },
    description: {
      ko: [
        "《기상 : 祈像》 작업에서는 인간이 초월적 존재에게 소망을 비는 행위 자체에 주목한다. 화면 속 촛불은 단순한 오브제를 넘어, 여신이라는 존재 앞에서 각자의 바람을 비는 인간들의 흔적이자 감정의 매개체로 설정하였다. 흔들리며 번져가는 불빛은 눈에 보이지 않는 염원과 믿음의 흐름을 상징하며, 이러한 감각을 강조하기 위해 일부 빛의 표현에는 금분을 사용하였다. 금분은 화면 안에서 일반 안료와 다른 방식으로 반사되며, 현실과 비현실의 사이의 틈을 만드는 동시에 사람들이 품은 소망의 에너지를 시각적으로 드러내는 장치로 작동한다.",
        "형태와 경계를 유동적으로 풀어내어 모호하게 표현하고자 촛불 이미지를 먹으로 한 차례 덮은 뒤, 다시 안료와 금분의 레이어를 반복적으로 쌓아 올리는 방식을 선택하였다. 이 과정에서 이전 흔적이 완전히 사라지지 않고 잔상처럼 남게 되었고, 화면은 하나의 고정된 이미지가 아닌 시간이 축적된 장소처럼 변화하였다.",
        "또한 앞선 작업들과 연결되는 기이하고 불확실한 분위기를 유지하고자 화면 전체에 안개가 스며든 듯한 질감을 형성하였다. 번지고 흐려지는 층들은 실재와 환영의 경계를 모호하게 만들며, 신화와 설화가 현실 속 믿음과 뒤섞여 전승되는 것을 암시한다. 이러한 레이어의 중첩은 단순한 시각적 효과를 넘어, 인간의 소망과 신앙, 그리고 그것이 시간 속에서 변형되고 축적되는 과정을 회화적으로 드러내기 위한 장치이다.",
      ],
      en: [
        "《Invocation: The Sacred Form》 focuses on the act of humans projecting their wishes toward transcendent beings. The candles within the image function not merely as objects, but as traces of individuals praying before the existence of a goddess, serving as emotional mediators that embody human desire and devotion. The flickering and diffusing flames symbolize invisible flows of longing and belief, and to emphasize this sensation, gold powder was incorporated into certain areas of light. Unlike ordinary pigments, the gold reflects light in a distinct manner, creating a subtle threshold between reality and unreality while visually revealing the energy of collective wishes embedded within the image.",
        "To dissolve and blur the boundaries of form, the candle imagery was first covered with layers of ink before repeatedly building up additional layers of pigment and gold powder. Through this process, previous traces were never completely erased and instead remained like afterimages beneath the surface, allowing the painting to transform into a site of accumulated time rather than a fixed image.",
        "Furthermore, to maintain the uncanny and ambiguous atmosphere that connects with the preceding works, the entire surface was treated as though enveloped in fog. The blurred and spreading layers obscure the boundary between the real and the illusory, evoking the way myths and oral narratives become intertwined with belief as they are continuously transmitted through time. The accumulation of these layers functions not simply as a visual effect, but as a painterly device that reveals how human wishes and systems of faith are altered, layered, and preserved over time.",
      ],
    },
    layout: "stack",
  },
  {
    id: 18,
    title: "Metamorphosis: The Retold Tale",
    titleKo: "변화 : 變話",
    year: "2025",
    series: 3,
    thumbnail: "/img/works/fine-art/metamorphosis-2025/thumbnail.jpg",
    images: ["/img/works/fine-art/metamorphosis-2025/main.webp"],
    processImages: [
      "/img/works/fine-art/metamorphosis-2025/process-1.webp",
      "/img/works/fine-art/metamorphosis-2025/process-2.webp",
      "/img/works/fine-art/metamorphosis-2025/process-3.webp",
      "/img/works/fine-art/metamorphosis-2025/process-4.webp",
    ],
    seriesPrologue: TRILOGY_PROLOGUE,
    medium: {
      ko: "장지에 동양화 물감과 분채, 콜라주",
      en: "Traditional Korean pigments, Bunchae, and collage on Jangji paper",
    },
    dimensions: { ko: "1622 × 970 mm", en: "1622 × 970 mm" },
    description: {
      ko: [
        "《변화 : 變話》 작업에서는 시간이 흐르며 신화와 예술의 의미가 변질되고 재맥락화되는 과정을 표현하고자 하였다. 과거의 예술품은 공동체의 신앙과 권력, 의례를 위해 기능하였지만, 시대가 변화함에 따라 본래의 의미는 희미해지고 때로는 정치적 목적이나 새로운 해석 속에서 다른 상징으로 소비되기도 한다. 이러한 변화 과정을 드러내기 위해 화면 전반에는 의도적으로 불안하고 타락한 듯한 분위기를 형성하였다. 익숙하면서도 어딘가 뒤틀린 감각을 통해, 시간이 축적되며 원형이 변형되는 신화와 이미지의 상태를 시각화하고자 했다.",
        "또한 앞선 작업들과 연결되는 동일한 눈의 이미지를 반복적으로 배치하였다. 이는 동일한 기원에서 출발한 존재이지만, 시대와 맥락에 따라 그 의미와 역할이 달라지는 상태를 암시한다. 반복되는 눈의 형상은 설화와 상징이 지속적으로 전승되면서도 완전히 동일한 모습으로 남아있지는 않는다는 점을 드러내며, 기억과 왜곡이 동시에 축적되는 구조를 나타낸다.",
        "향로에서 피어오르는 연기 부분에는 기존의 다른 작업 이미지를 잘라 삽입하는 방식을 사용하였다. 이는 단순한 콜라주의 개념을 넘어, 서로 다른 맥락 속에 존재하던 이미지가 새로운 화면 안에서 다시 해석되고 변형되는 과정을 의미한다. 원래의 의미를 지녔던 조각들은 새로운 위치와 관계 속에서 낯선 감각을 만들어내며, 설화와 신화 역시 시대에 따라 재해석되고 변형되는 구비전승의 특성과 맞닿아 있다. 이처럼 화면 속 이질적인 이미지의 결합은 변질과 재생산, 그리고 의미의 이동 과정을 회화적으로 드러내기 위한 장치로 작동한다.",
      ],
      en: [
        "《Metamorphosis: The Retold Tale》 explores the ways in which myths and artworks become distorted and recontextualized over time. Ancient artworks once functioned as instruments of communal belief, political authority, and ritual practice, yet as time passes, their original meanings fade and are often consumed through new interpretations or political purposes. To visualize this transformation, the overall atmosphere of the painting was intentionally rendered with a sense of unease and corruption. Through imagery that feels both familiar and distorted, the work attempts to embody the condition of myths and symbols as they accumulate, shift, and deteriorate through time.",
        "The repeated placement of identical eyes throughout the composition also connects this work to the preceding pieces in the series. Although they originate from the same source, the eyes signify how meanings and functions continuously change according to different eras and contexts. Their repetition suggests that myths and symbols are transmitted across generations while never remaining completely unchanged, instead accumulating both memory and distortion simultaneously.",
        "For the smoke rising from the incense burner, fragments cut from previous works were inserted directly into the composition. This approach extends beyond simple collage, symbolizing the process through which images originating in different contexts are reinterpreted and transformed within a new visual environment. The fragments, once carrying their own original meanings, generate unfamiliar sensations through their relocation and recombination, reflecting the nature of oral traditions and myths that are continuously reshaped through retelling. In this way, the collision of heterogeneous imagery functions as a painterly device that reveals the processes of distortion, reproduction, and the migration of meaning over time.",
      ],
    },
    layout: "stack",
  },
  {
    id: 19,
    title: "Genesis: The Beginning Tale",
    titleKo: "시화 : 始話",
    year: "2025",
    series: 1,
    thumbnail: "/img/works/fine-art/genesis-2025/thumbnail.jpg",
    images: ["/img/works/fine-art/genesis-2025/main.webp"],
    processImages: [
      "/img/works/fine-art/genesis-2025/process-1.webp",
      "/img/works/fine-art/genesis-2025/process-2.webp",
      "/img/works/fine-art/genesis-2025/process-3.webp",
      "/img/works/fine-art/genesis-2025/process-4.webp",
    ],
    /* Long-form reflection on the work's evolution — surfaces at the top
     * of the process sub-view to give context before the image stack. */
    processIntro: {
      ko: [
        "처음부터 완벽한 계획을 세우고 시작한 것은 아니었다. 초기에는 여신이 창조되는 모습을 담고자 위에서 아래로 서사가 진행되도록 스케치하고 채색을 시작했다. 하지만 작업을 진행할수록 여신의 이미지가 주변 요소들과 어울리지 않았고, 화면이 상하로 나뉘어 따로 노는 느낌이 지속되었다. 결국 기존의 스케치를 엎고 그 위에 다시 그림을 그리기 시작했다.",
        "여신이 있던 자리에는 자연적인 힘을 상징하는 개기일식의 형태를 가져왔고, 하늘과 땅 사이의 중간 단계를 구름으로 풀어냈다. 기이한 분위기를 조성하기 위해 파도를 그려 넣었으며, 설화 속 존재들과 맥락이 유사한 도깨비불을 화면 곳곳에 배치했다. 구름과 도깨비불 사이의 층을 구분하고 그 위에 다시 요소를 얹으며 계속해서 레이어를 쌓아 나갔다.",
        "이 과정에서 의도하지 않은 결과가 나타났다. 수정을 반복하며 쌓인 물감의 층과 그 아래로 어렴풋이 드러나는 이전의 흔적들이 내가 시사하고자 했던 설화의 '구전 방식'과 닮아 있었다. 시간이 흐르며 이야기가 덧입혀지고, 일부는 잊히거나 변형되면서도 본질이 전승되는 구비전승의 유동적인 특성이 작업의 층위 속에 자연스럽게 반영되었다. 결국 의도치 않았던 수정의 흔적들이 설화가 전해 내려오는 구조적 과정을 시각적으로 증명해 주는 결과가 되었다.",
      ],
      en: [
        "This work did not begin with a perfect, pre-determined plan. Initially, I sketched and began coloring a scene of a goddess being created, with the storytelling progressing from top to bottom. However, as the work moved forward, I felt that the image of the goddess did not harmonize with the overall elements, and the painting felt fragmented as if the top and bottom were drifting apart. Ultimately, I decided to overturn the original sketch and start over on the same surface.",
        "In place of the goddess, I introduced the form of a total solar eclipse to symbolize a primordial natural force. I used clouds to bridge the middle stage between heaven and earth, added waves to evoke an eerie sense of an impending supernatural event, and placed goblin fires — beings that have existed since ancient times, much like the goddess in the myth — across the sky. I continuously layered the clouds and goblin fires, distinguishing the planes and then painting new elements over them.",
        "Through this process, an unintended result emerged. The layers of pigment accumulated through repeated revisions, and the traces of previous stages faintly revealing themselves from beneath, bore a striking resemblance to the “oral tradition” I wished to suggest. The fluid nature of oral transmission — where stories are layered with new imaginations, partially forgotten, or transformed over time while maintaining their essence — was naturally reflected in the physical layers of the painting. In the end, the unintended marks of revision became a visual testament to the structural process through which myths are passed down through generations.",
      ],
    },
    seriesPrologue: TRILOGY_PROLOGUE,
    medium: {
      ko: "장지에 동양화 물감과 분채",
      en: "Traditional Korean colors and Bunchae on Jangji paper",
    },
    dimensions: { ko: "1622 × 1303 mm", en: "1622 × 1303 mm" },
    description: {
      ko: [
        "고대의 예술품들은 단순한 미적 대상이 아니라 정치, 종교, 신앙, 그리고 공동체의 질서를 위해 기능해온 존재였다. 안악 3호분, 첨성대, 얼굴무늬수막새와 같은 유물들은 당시 사람들의 세계관과 믿음, 공동체의 가치가 시각적 형상으로 남겨진 결과물이기도 하다. 이러한 흐름 속에서 나는 \"예술은 왜 만들어졌는가?\", \"고대의 예술품은 어떤 이야기를 담고 있었는가?\"라는 질문에 관심을 갖게 되었다. 그리고 그 질문의 출발점이 설화와 신화의 기원에 있다고 생각했다.",
        "설문대할망, 마고할미, 복희와 여와 같은 창조신화들은 인간이 자연에 대한 두려움과 생존의 불안, 그리고 공동체의 정체성을 설명하기 위해 만들어낸 원초적 서사라고 볼 수 있다. 특히 제주 지역의 설문대할망 신화는 거대한 자연환경 속에서 형성되었으며, 구비전승을 통해 시대와 공동체에 따라 내용이 변화하고 확장되어 왔다.",
        "이번 작업은 앞선 도깨비불 작업에서 다루었던 '공동체 안에서 생성되고 구전되는 상징'이라는 개념을 확장한 작업이다. 도깨비불이 인간의 감정과 믿음이 투영된 존재였다면, 이번에는 신화와 설화가 어떻게 공동체 안에서 끊임없이 변형되고 재생산되며 하나의 집단적 기억으로 남게 되는지에 주목하였다.",
        "나는 신화가 단순히 오래된 이야기가 아니라, 시대마다 새로운 의미를 덧입으며 살아 움직이는 시각적 언어라고 생각한다. 따라서 이번 작업은 설문대할망 신화를 기반으로 인간의 상상력과 공동체의 기억이 어떻게 형상을 만들고 이어져 오는지를 표현하고자 하였다.",
      ],
      en: [
        "Ancient artworks were not created merely as aesthetic objects, but functioned as mediums shaped by politics, religion, belief systems, and the needs of communities. Artifacts such as the tomb murals of Anak Tomb No. 3, Cheomseongdae, and roof-end tiles with human face designs reveal how the values, beliefs, and worldviews of their societies were visually embodied through art. Through this perspective, I became interested in the questions: \"Why was art created?\" and \"What kinds of narratives did ancient artworks contain?\" I eventually came to see mythology and oral tradition as the origins of these visual narratives.",
        "Creation myths such as Seolmundae Halmang, Mago Halmi, and Fuxi and Nüwa can be understood as primal narrative structures created by humans to confront the fears of nature, the anxiety of survival, and the need for collective identity within a community. Among them, the myth of Seolmundae Halmang is particularly significant because it emerged from the unique and dramatic natural landscape of Jeju Island, while continuously transforming through oral transmission across generations and communities.",
        "This work expands upon the concept explored in my previous Goblin Fire series: symbols that are collectively created, shared, and transmitted within communities. While the Goblin Fire represented human emotions and beliefs in symbolic form, this new body of work focuses on how myths and oral narratives are repeatedly transformed, reinterpreted, and preserved as forms of collective memory.",
        "I see mythology not simply as an ancient story, but as a living visual language that continuously acquires new meanings through time. Based on the myth of Seolmundae Halmang, this work seeks to explore how human imagination and communal memory generate forms that continue to evolve and endure across generations.",
      ],
    },
    layout: "stack",
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
  aspect-ratio: 4 / 5;
  background: #f0f0f0;
  overflow: hidden;
  margin-bottom: 1rem;
  /* Anchor for absolutely-positioned series chip overlay. */
  position: relative;
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

/* Small "Series N" chip — overlay on the listing card thumbnail (top-left)
 * and inline above the title on the detail page caption block. Subtle pill
 * with editorial uppercase tracking that matches the site's minimalist
 * typography. The card variant uses a frosted backdrop so it stays legible
 * over arbitrary thumbnail content. */
const SeriesChipCard = styled.span`
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 1;
  padding: 0.3rem 0.6rem;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #333;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  font-variant-numeric: tabular-nums;
  pointer-events: none;
`;

const SeriesChipDetail = styled.span<{ $lang?: string }>`
  display: inline-flex;
  align-self: flex-start;
  padding: 0.3rem 0.65rem;
  font-size: 0.72rem;
  letter-spacing: ${({ $lang }) => ($lang === "ko" ? "0.05em" : "0.22em")};
  text-transform: ${({ $lang }) => ($lang === "ko" ? "none" : "uppercase")};
  color: #555;
  background: #f4f4f3;
  border: 1px solid #e5e5e3;
  font-variant-numeric: tabular-nums;
  margin-bottom: 0.2rem;
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

/* Detail view — split: image stack/grid on the left + sticky side caption.
 * `align-items: start` pins the caption to the top so it's visible the moment
 * you land on the page, even when the image stack is very tall (e.g. multiple
 * detail shots). The right column is then made `position: sticky` so the
 * caption stays in view as the user scrolls through the images. */
const DetailLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(220px, 1fr);
  gap: 4rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
    align-items: stretch;
  }
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;

  @media (max-width: 600px) {
    gap: 0.75rem;
  }
`;

/* Vertical stack layout — used when an article's images vary in size/orientation
 * (e.g. process documentation: sketch → process → final). */
const ImageStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (max-width: 600px) {
    gap: 1rem;
  }
`;

/* Process / context note shown above an image (or group of images) in the stack. */
const ImageNote = styled.aside`
  text-align: center;
  font-size: 0.95rem;
  color: #555;
  font-style: italic;
  line-height: 1.7;
  max-width: 620px;
  margin: 1rem auto 0.25rem;
  padding: 1.25rem 1.5rem 0;
  border-top: 1px solid #ececec;
`;

/* Image + caption pair wrapper — keeps the caption visually bound to its
 * image (tight internal gap), and uses a top border on subsequent siblings
 * to clearly separate one piece from the next, matching the ImageNote
 * border-top divider pattern used elsewhere in fine-art articles. */
const FigureBlock = styled.figure`
  margin: 0;
  display: flex;
  flex-direction: column;
  /* Image ↔ caption: a touch of breathing room while still reading as one unit. */
  gap: 1.5rem;

  /* Visual separator between consecutive figure blocks (multi-piece works). */
  & + & {
    padding-top: 2rem;
    border-top: 1px solid #ececec;
  }
`;

/* Per-image caption shown directly below an image — used when an article
 * holds multiple distinct works (each with its own title/dims). Sits inside
 * a FigureBlock so spacing is controlled by the figure's gap. */
const ImageCaption = styled.figcaption`
  text-align: center;
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  color: #333;
  font-style: italic;
  letter-spacing: -0.01em;

  & .year {
    font-style: normal;
    color: #888;
  }

  & .dim {
    display: block;
    font-style: normal;
    color: #888;
    font-size: 0.9rem;
    margin-top: 0.15rem;
    letter-spacing: 0;
  }
`;

const GridImageWrap = styled.button`
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
    opacity: 0.85;
  }
`;

const GridImage = styled(motion.img)`
  width: 100%;
  height: auto;
  display: block;
`;

/* Long-form process narrative — sits at the top of the process sub-view,
 * above the image stack. Constrained reading width and a soft border-bottom
 * give it the feel of an essay preface before the visual sequence begins. */
const ProcessIntro = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  max-width: 720px;
  margin: 0 auto 1rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #ececec;
`;

/* Process video — embedded HTML5 video, sized to match image stack width.
 * Constrained max-height so portrait videos don't dominate the viewport. */
const ProcessVideo = styled.video`
  width: 100%;
  max-height: 80vh;
  height: auto;
  display: block;
  background: #000;
  object-fit: contain;
`;

/* ── Lightbox (sophisticated zoom-in) ─────────────────────────────────────── */

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

const LightboxImgShadow = `
  display: block;
  cursor: default;
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.55),
    0 6px 20px rgba(0, 0, 0, 0.4);
`;

/* Grid-layout articles (e.g. Private Records polaroids):
 * Fixed height so all images appear visually identical, regardless of
 * minor pixel-dimension differences in source files. */
const LightboxImgFixed = styled(motion.img)`
  height: 78vh;
  width: auto;
  max-width: 88vw;
  ${LightboxImgShadow}
`;

/* Stack-layout articles (e.g. Accident process images):
 * Mixed aspect ratios — let each image fit naturally within viewport. */
const LightboxImgFit = styled(motion.img)`
  max-width: 92vw;
  max-height: 85vh;
  width: auto;
  height: auto;
  ${LightboxImgShadow}
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

/* Right column wrapper — holds caption + statement on desktop. */
const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5rem;
  /* Stays in view while the user scrolls through a long image stack —
   * top: 80px clears the fixed top nav (~64px) with a small breathing gap.
   * max-height + overflow-y let very long statements scroll independently
   * inside the sticky column rather than being cut off mid-paragraph. */
  position: sticky;
  top: 80px;
  align-self: start;
  max-height: calc(100vh - 96px);
  overflow-y: auto;
  /* Hide scrollbar visually but keep scrollable */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
  }

  @media (max-width: 900px) {
    /* Sticky doesn't make sense in a single-column mobile layout — the right
     * column flows below the images, so keep it normal. */
    position: static;
    max-height: none;
    overflow: visible;
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

const CaptionLabel = styled.p<{ $lang?: string }>`
  font-size: 0.85rem;
  /* Korean: minimal tracking + no uppercase (uppercase is no-op on hangul,
   * and 0.22em tracking shreds words like "드 로 잉" / "작 가  노 트").
   * English: keep the tighter editorial tracking on caps. */
  letter-spacing: ${({ $lang }) => ($lang === "ko" ? "0.05em" : "0.22em")};
  text-transform: ${({ $lang }) =>
    $lang === "ko" ? "none" : "uppercase"};
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
    /* No extra margin — italic title's natural trailing space + the JSX
     * whitespace already give a comfortable gap before the comma. */
    margin-left: 0;
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

/* Artist statement section — desktop: in right column below caption.
 * Mobile (≤900px): inherits RightColumn full-width-below-grid layout. */
const StatementSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

/* "View process" / "View final work" toggle — sits in the right column for
 * articles that have processImages. Subtle text-link with hover affordance. */
const ProcessToggle = styled.button`
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 0.5rem;
  background: none;
  border: none;
  padding: 0.6rem 0;
  font: inherit;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  color: #555;
  cursor: pointer;
  border-top: 1px solid #ececec;
  margin-top: 0.5rem;
  padding-top: 1.2rem;
  width: 100%;
  text-align: left;
  transition: color 0.2s;
  &:hover {
    color: #111;
  }
`;

const StatementLabel = styled.p<{ $lang?: string }>`
  font-size: 0.85rem;
  letter-spacing: ${({ $lang }) => ($lang === "ko" ? "0.05em" : "0.22em")};
  text-transform: ${({ $lang }) =>
    $lang === "ko" ? "none" : "uppercase"};
  color: #999;
  margin: 0;
`;

const StatementText = styled.p`
  font-size: 1rem;
  line-height: 1.85;
  color: #333;
  margin: 0;
`;

/* ── Component ───────────────────────────────────────────────────────────── */

const FineArtPage = () => {
  const { t, lang } = useTranslation(translations);
  const { works } = t;
  const searchParams = useSearchParams();
  const router = useRouter();

  const articleParam = searchParams.get("articles");
  const articleId = articleParam ? parseInt(articleParam, 10) : null;
  const article = articleId ? ARTICLES.find((a) => a.id === articleId) : null;

  // Process view toggle — switches the displayed media between the final
  // work (`images`) and the behind-the-scenes process content
  // (`processImages` and/or `processVideo`).
  const view = searchParams.get("view");
  const hasProcessContent =
    !!article?.processImages?.length || !!article?.processVideo;
  const isProcessView = view === "process" && hasProcessContent;
  const displayImages = isProcessView
    ? (article?.processImages ?? [])
    : article?.images ?? [];

  // Lightbox state — index of currently expanded image (null = closed)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const total = displayImages.length;
  const goPrev = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i - 1 + total) % total)),
    [total],
  );
  const goNext = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i + 1) % total)),
    [total],
  );

  // Reset lightbox on article or view change
  useEffect(() => setLightboxIndex(null), [articleId, isProcessView]);

  // Keyboard nav (Esc / ← / →) + body scroll lock
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
  }, [articleId, isProcessView]);

  return (
    <PageWrapper>
      <MainContainer>
        <Section>
          <Breadcrumb>
            <BreadcrumbLink href="/works">{works.title}</BreadcrumbLink>
            <BreadcrumbSep>/</BreadcrumbSep>
            {article ? (
              <>
                <BreadcrumbBtn onClick={() => router.push("/works/fine-art")}>
                  {works.fine_art}
                </BreadcrumbBtn>
                <BreadcrumbSep>/</BreadcrumbSep>
                {isProcessView ? (
                  <>
                    <BreadcrumbBtn
                      onClick={() =>
                        router.push(`/works/fine-art?articles=${article.id}`)
                      }
                    >
                      {article.title}, {article.year}
                    </BreadcrumbBtn>
                    <BreadcrumbSep>/</BreadcrumbSep>
                    <span>{lang === "ko" ? "제작 과정" : "Process"}</span>
                  </>
                ) : (
                  <span>
                    {article.title}, {article.year}
                  </span>
                )}
              </>
            ) : (
              <span>{works.fine_art}</span>
            )}
          </Breadcrumb>

          {article ? (
            <>
              <DetailLayout>
                {article.layout === "stack" ? (
                  <ImageStack>
                    {isProcessView && article.processIntro && (
                      <ProcessIntro>
                        <StatementLabel $lang={lang}>
                          {lang === "ko" ? "제작 과정" : "Process"}
                        </StatementLabel>
                        {article.processIntro[lang].map((para, i) => (
                          <StatementText key={i}>{para}</StatementText>
                        ))}
                      </ProcessIntro>
                    )}
                    {isProcessView && article.processVideo && (
                      <ProcessVideo
                        controls
                        playsInline
                        preload="metadata"
                        src={article.processVideo}
                      />
                    )}
                    {displayImages.map((img, i) => {
                      const src = imgSrc(img);
                      const note = imgNote(img);
                      const cap = imgCaption(img);
                      const altText = cap?.title ?? article.title;
                      const imageEl = (
                        <GridImageWrap
                          onClick={() => setLightboxIndex(i)}
                          aria-label={
                            lang === "ko"
                              ? `${altText} 크게 보기`
                              : `Enlarge ${altText}`
                          }
                        >
                          <GridImage
                            layoutId={`art-${article.id}-${isProcessView ? "p" : "f"}-${i}`}
                            src={src}
                            alt={`${altText} ${i + 1}`}
                            whileHover={{ scale: 1.012 }}
                            transition={{
                              duration: 0.4,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          />
                        </GridImageWrap>
                      );
                      return (
                        <Fragment key={`${isProcessView ? "p" : "f"}-${i}`}>
                          {note && <ImageNote>{note[lang]}</ImageNote>}
                          {cap ? (
                            <FigureBlock>
                              {imageEl}
                              <ImageCaption>
                                {cap.titleKo ? (
                                  <>
                                    {cap.titleKo} / {cap.title}
                                    {cap.year && (
                                      <span className="year"> ({cap.year})</span>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {cap.title}
                                    {cap.year && (
                                      <span className="year">, {cap.year}</span>
                                    )}
                                  </>
                                )}
                                <span className="dim">
                                  {cap.dimensions[lang]}
                                </span>
                              </ImageCaption>
                            </FigureBlock>
                          ) : (
                            imageEl
                          )}
                        </Fragment>
                      );
                    })}
                  </ImageStack>
                ) : (
                  <ImageGrid>
                    {displayImages.map((img, i) => {
                      const src = imgSrc(img);
                      return (
                        <GridImageWrap
                          key={`${isProcessView ? "p" : "f"}-${i}`}
                          onClick={() => setLightboxIndex(i)}
                          aria-label={
                            lang === "ko"
                              ? `${article.title} ${i + 1} 크게 보기`
                              : `Enlarge ${article.title} ${i + 1}`
                          }
                        >
                          <GridImage
                            layoutId={`art-${article.id}-${isProcessView ? "p" : "f"}-${i}`}
                            src={src}
                            alt={`${article.title} ${i + 1}`}
                            whileHover={{ scale: 1.025 }}
                            transition={{
                              duration: 0.4,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          />
                        </GridImageWrap>
                      );
                    })}
                  </ImageGrid>
                )}

                <RightColumn>
                  <CaptionBlock>
                    {article.series !== undefined && (
                      <SeriesChipDetail $lang={lang}>
                        {lang === "ko"
                          ? `시리즈 ${article.series}`
                          : `Series ${article.series}`}
                      </SeriesChipDetail>
                    )}
                    <CaptionLabel $lang={lang}>
                      {article.label
                        ? article.label[lang]
                        : lang === "ko"
                          ? "작업물"
                          : "Works"}
                    </CaptionLabel>
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
                    <CaptionMeta>{article.medium[lang]}</CaptionMeta>
                    {article.dimensions && (
                      <CaptionDim>{article.dimensions[lang]}</CaptionDim>
                    )}
                  </CaptionBlock>

                  {article.seriesPrologue && (
                    <StatementSection>
                      <StatementLabel $lang={lang}>
                        {lang === "ko" ? "시리즈 노트" : "About the Series"}
                      </StatementLabel>
                      {article.seriesPrologue[lang].map((para, i) => (
                        <StatementText key={i}>{para}</StatementText>
                      ))}
                    </StatementSection>
                  )}

                  {article.description && (
                    <StatementSection>
                      <StatementLabel $lang={lang}>
                        {lang === "ko" ? "작가 노트" : "Statement"}
                      </StatementLabel>
                      {article.description[lang].map((para, i) => (
                        <StatementText key={i}>{para}</StatementText>
                      ))}
                    </StatementSection>
                  )}

                  {hasProcessContent && (
                    <ProcessToggle
                      onClick={() =>
                        router.push(
                          isProcessView
                            ? `/works/fine-art?articles=${article.id}`
                            : `/works/fine-art?articles=${article.id}&view=process`,
                        )
                      }
                    >
                      {isProcessView
                        ? lang === "ko"
                          ? "← 최종 작업 보기"
                          : "← View Final Work"
                        : lang === "ko"
                          ? "제작 과정 보기 →"
                          : "View Process →"}
                    </ProcessToggle>
                  )}
                </RightColumn>
              </DetailLayout>

              <BackWrap>
                <BackLink onClick={() => router.push("/works/fine-art")}>
                  {works.fine_art}
                </BackLink>
              </BackWrap>

              {/* Lightbox — sophisticated zoom with morph from grid thumb */}
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

                    {article.layout === "stack" ? (
                      <LightboxImgFit
                        layoutId={`art-${article.id}-${isProcessView ? "p" : "f"}-${lightboxIndex}`}
                        src={imgSrc(displayImages[lightboxIndex])}
                        alt={`${article.title} ${lightboxIndex + 1}`}
                        onClick={(e) => e.stopPropagation()}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 30,
                        }}
                      />
                    ) : (
                      <LightboxImgFixed
                        layoutId={`art-${article.id}-${isProcessView ? "p" : "f"}-${lightboxIndex}`}
                        src={imgSrc(displayImages[lightboxIndex])}
                        alt={`${article.title} ${lightboxIndex + 1}`}
                        onClick={(e) => e.stopPropagation()}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 30,
                        }}
                      />
                    )}

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
                      {(() => {
                        const cap = imgCaption(displayImages[lightboxIndex]);
                        // Per-piece bilingual title (e.g. Cityscapes pieces)
                        if (cap?.titleKo) {
                          return (
                            <>
                              {cap.titleKo} / {cap.title}
                              <span> ({cap.year ?? article.year})</span>
                            </>
                          );
                        }
                        // Article-level bilingual title (e.g. Where They Gather)
                        if (!cap && article.titleKo) {
                          return (
                            <>
                              {article.titleKo} / {article.title}
                              <span> ({article.year})</span>
                            </>
                          );
                        }
                        return (
                          <>
                            {cap?.title ?? article.title}
                            <span>, {cap?.year ?? article.year}</span>
                          </>
                        );
                      })()}
                    </LightboxCaption>
                  </LightboxBackdrop>
                )}
              </AnimatePresence>
            </>
          ) : (
            <>
              <PageTitle>{works.fine_art}</PageTitle>
              {ARTICLES.length === 0 ? (
                <EmptyState>{works.empty}</EmptyState>
              ) : (
                <Grid>
                  {/* Sort: newest year first; within a year, series works
                   * are anchored at the top in series-number order
                   * (Series 1 → 2 → 3), followed by standalone works in
                   * id order. The trilogy thus headlines the whole page
                   * since its members all share the newest year. */}
                  {[...ARTICLES]
                    .sort((a, b) => {
                      const yearDiff =
                        parseInt(b.year, 10) - parseInt(a.year, 10);
                      if (yearDiff !== 0) return yearDiff;

                      const aHasSeries = a.series !== undefined;
                      const bHasSeries = b.series !== undefined;
                      if (aHasSeries !== bHasSeries) {
                        return aHasSeries ? -1 : 1;
                      }
                      if (aHasSeries && bHasSeries) {
                        return (a.series ?? 0) - (b.series ?? 0);
                      }
                      return a.id - b.id;
                    })
                    .map((a) => (
                    <ArticleCard
                      key={a.id}
                      onClick={() =>
                        router.push(`/works/fine-art?articles=${a.id}`)
                      }
                    >
                      <Thumb>
                        {a.series !== undefined && (
                          <SeriesChipCard aria-label={`Series ${a.series}`}>
                            {lang === "ko"
                              ? `시리즈 ${a.series}`
                              : `Series ${a.series}`}
                          </SeriesChipCard>
                        )}
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

export default FineArtPage;
