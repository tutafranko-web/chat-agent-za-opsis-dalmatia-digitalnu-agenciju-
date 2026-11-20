/**
 * Quiz questions (shared by the page and the server). Nine questions condensed
 * from the original 14-question n8n quiz: ideal holiday, adventure comfort,
 * who is travelling, fitness, interests, budget, time of day, base, things to
 * avoid.
 */
import type { Lang } from "./types";

export interface QuizOption {
  key: string;
  label: Record<Lang, string>;
}

export interface QuizQuestion {
  id: "ideal" | "comfort" | "group" | "fitness" | "interests" | "budget" | "time" | "base" | "avoid";
  multi?: { max: number; exclusive?: string };
  label: Record<Lang, string>;
  options: QuizOption[];
}

const o = (key: string, en: string, hr: string): QuizOption => ({ key, label: { en, hr } });

export const QUIZ: QuizQuestion[] = [
  {
    id: "ideal",
    label: { en: "Your ideal holiday day is…", hr: "Vaš idealni dan na odmoru je…" },
    options: [
      o("relax_sea", "Relaxing by the sea", "Opuštanje uz more"),
      o("adventure", "Thrills and adrenaline", "Uzbuđenje i adrenalin"),
      o("culture", "History and old towns", "Povijest i stari gradovi"),
      o("food_wine", "Local food and wine", "Domaća hrana i vino"),
      o("nature", "Nature and landscapes", "Priroda i krajolici"),
      o("nightlife", "Music and nightlife", "Glazba i noćni život"),
    ],
  },
  {
    id: "comfort",
    label: { en: "How adventurous are you?", hr: "Koliko ste avanturistički raspoloženi?" },
    options: [
      o("dry", "I prefer to stay dry and on solid ground", "Radije ostajem na suhom i čvrstom tlu"),
      o("moderate", "I'll try something new with a guide", "Probat ću nešto novo uz vodiča"),
      o("full", "Full send — the crazier the better!", "Do kraja — što luđe, to bolje!"),
    ],
  },
  {
    id: "group",
    label: { en: "Who are you travelling with?", hr: "S kim putujete?" },
    options: [
      o("solo", "Solo", "Sam/sama"),
      o("couple", "Partner", "S partnerom"),
      o("family", "Family with kids", "Obitelj s djecom"),
      o("friends", "Group of friends", "Društvo prijatelja"),
    ],
  },
  {
    id: "fitness",
    label: { en: "Your fitness level", hr: "Vaša kondicija" },
    options: [
      o("relaxed", "Relaxed — easy activities please", "Opušteno — lagane aktivnosti"),
      o("active", "Active — I move regularly", "Aktivno — redovito se krećem"),
      o("athletic", "Athletic — bring on the challenge", "Sportski — volim izazov"),
    ],
  },
  {
    id: "interests",
    multi: { max: 3 },
    label: { en: "What excites you? (up to 3)", hr: "Što vas veseli? (do 3)" },
    options: [
      o("boat_islands", "Boats & islands", "Brodovi i otoci"),
      o("water_sports", "Water sports", "Sportovi na vodi"),
      o("adrenaline", "Adrenaline", "Adrenalin"),
      o("history", "History & culture", "Povijest i kultura"),
      o("food_wine", "Food & wine", "Hrana i vino"),
      o("nature_hiking", "Nature & hiking", "Priroda i šetnje"),
      o("nightlife", "Nightlife", "Noćni život"),
      o("photography", "Photography", "Fotografija"),
      o("relax", "Slow & relaxing", "Polagano i opušteno"),
    ],
  },
  {
    id: "budget",
    label: { en: "Budget per person for one activity", hr: "Budžet po osobi za jednu aktivnost" },
    options: [
      o("b1", "Under €30", "Do 30 €"),
      o("b2", "€30–80", "30–80 €"),
      o("b3", "€80–150", "80–150 €"),
      o("b4", "Doesn't matter", "Nije važno"),
    ],
  },
  {
    id: "time",
    label: { en: "Best time of day for you", hr: "Najbolje doba dana" },
    options: [
      o("morning", "Morning", "Jutro"),
      o("afternoon", "Afternoon", "Poslijepodne"),
      o("evening", "Evening", "Večer"),
      o("any", "Any time", "Bilo kad"),
    ],
  },
  {
    id: "base",
    label: { en: "Where are you staying?", hr: "Gdje ste smješteni?" },
    options: [
      o("split", "Split", "Split"),
      o("trogir", "Trogir & Čiovo", "Trogir i Čiovo"),
      o("kastela", "Kaštela", "Kaštela"),
      o("omis", "Omiš", "Omiš"),
      o("makarska", "Makarska riviera", "Makarska rivijera"),
      o("islands", "On an island", "Na otoku"),
      o("other", "Elsewhere", "Negdje drugdje"),
    ],
  },
  {
    id: "avoid",
    multi: { max: 3, exclusive: "none" },
    label: { en: "Anything to avoid?", hr: "Nešto što želite izbjeći?" },
    options: [
      o("water", "Water activities", "Aktivnosti u vodi"),
      o("heights", "Heights", "Visine"),
      o("speed", "High speed", "Velike brzine"),
      o("none", "Nothing — I'm open to everything", "Ništa — otvoren/a sam za sve"),
    ],
  },
];

export type QuizAnswers = Partial<Record<QuizQuestion["id"], string | string[]>>;
