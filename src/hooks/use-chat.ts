"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { sendChatMessage } from "@/lib/n8n-chat-api";
import { useMessageLimit } from "./use-message-limit";
import { useLandlordId } from "./use-landlord-id";
import { useLocation } from "./use-location";

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

const SESSION_KEY = "opsis-chat-session";

const GREETING = `Welcome to Opsis Dalmatia! 🌊
Your personal activity concierge for the Split & Dalmatia region.

Choose a category (type the number):

━━━━━━━━━━━━━━━━━━━━━━━
1️⃣  Nautical & Water Activities
2️⃣  Adrenaline & Adventure 🏍️
3️⃣  Transportation Rentals
4️⃣  Land Tours & Guided Experiences
5️⃣  Nightlife & Entertainment
6️⃣  Quiz Results (paste your quiz score)
7️⃣  Show All Activities
━━━━━━━━━━━━━━━━━━━━━━━

Type a number → see specific activities → pick one to book! 👇
You have 15 messages. I speak all languages.`;

// ── HARDCODED CATEGORY DATA ──────────────────────────────────────────────────
// Category navigation is handled entirely in frontend code — no AI involvement.
// Only when tourist picks a specific activity does the AI agent get called.

const CATEGORIES = [
  {
    name: "Nautical & Water Activities",
    emoji: "🌊",
    prompt:
      "Here are our Nautical & Water Activities! 🌊\n\n" +
      "1. Boat Tours (island hopping itineraries, private tours)\n" +
      "2. Scuba Diving (Discover dives and certified excursions)\n" +
      "3. Sea Kayaking (Paddling around city walls or islands)\n" +
      "4. Stand Up Paddling – SUP (Rentals and sunset tours)\n" +
      "5. Parasailing (Panoramic flights above the sea)\n" +
      "6. Jet Ski Safari (Guided high-speed coastal tours)\n" +
      "7. Sunset Cruises (Relaxing evening boat rides with drinks)\n" +
      "8. Fishing (Tuna and swordfish fishing trips)\n" +
      "9. Sailing School (Introductory courses and day sailing)\n" +
      "10. Wakeboarding (Cable and boat wakeboarding sessions)\n\n" +
      "Which activity interests you? Type the number! 👇\n" +
      "(Type 0 to go back to main menu)",
    activities: [
      "Boat Tours",
      "Scuba Diving",
      "Sea Kayaking",
      "Stand Up Paddling (SUP)",
      "Parasailing",
      "Jet Ski Safari",
      "Sunset Cruises",
      "Fishing",
      "Sailing School",
      "Wakeboarding",
    ],
  },
  {
    name: "Adrenaline & Adventure",
    emoji: "🏍️",
    prompt:
      "Here are our Adrenaline & Adventure options! 🏍️\n\n" +
      "1. White Water Rafting (River rapids adventure)\n" +
      "2. Zipline (High-speed canyon crossing)\n" +
      "3. Canyoning (Hiking, sliding, and jumping down rivers)\n" +
      "4. Skydiving (Tandem jumps with coastal views)\n" +
      "5. Rock Climbing (Guided climbs on natural cliffs)\n" +
      "6. Bungee Jumping (Bridge jumps for the ultimate rush)\n" +
      "7. Off-road Buggy Safari (Rugged terrain exploration)\n" +
      "8. Paintball Battles (Tactical games in nature)\n" +
      "9. Speleology (Exploring underground cave systems)\n\n" +
      "Which one gets your heart pumping? Type the number! 💥\n" +
      "(Type 0 to go back to main menu)",
    activities: [
      "White Water Rafting",
      "Zipline",
      "Canyoning",
      "Skydiving",
      "Rock Climbing",
      "Bungee Jumping",
      "Off-road Buggy Safari",
      "Paintball Battles",
      "Speleology",
    ],
  },
  {
    name: "Transportation Rentals",
    emoji: "🚗",
    prompt:
      "Here are our Transportation Rentals! 🚗\n\n" +
      "1. Car Rental (Economy to luxury vehicle fleet)\n" +
      "2. Scooter & Moto Rental (Mopeds and high-cc motorcycles)\n" +
      "3. Speedboat Taxi (Fast inter-island water transport)\n" +
      "4. Bicycle & E-bike Rental (Standard and electric bikes)\n" +
      "5. Boat Rental – No License (Small 5hp boats for self-drive)\n" +
      "6. Chauffeur Service (Luxury car with professional driver)\n" +
      "7. Quads & ATV Rental (Rugged 4-wheelers for exploration)\n" +
      "8. Luxury Van Rental (Group transport for events or tours)\n" +
      "9. Luxury Car Hire (Convertibles and sports cars)\n" +
      "10. Airport Transfers (Private door-to-door service)\n\n" +
      "Which transport do you need? Type the number! 🚀\n" +
      "(Type 0 to go back to main menu)",
    activities: [
      "Car Rental",
      "Scooter & Moto Rental",
      "Speedboat Taxi",
      "Bicycle & E-bike Rental",
      "Boat Rental – No License",
      "Chauffeur Service",
      "Quads & ATV Rental",
      "Luxury Van Rental",
      "Luxury Car Hire",
      "Airport Transfers",
    ],
  },
  {
    name: "Land Tours & Guided Experiences",
    emoji: "🏛️",
    prompt:
      "Here are our Land Tours & Guided Experiences! 🏛️\n\n" +
      "1. Walking City Tours (Historical and cultural heritage walks)\n" +
      "2. Wine Tasting Tours (Visits to local boutique wineries)\n" +
      "3. National Park Trips (Day tours to Krka or Plitvice)\n" +
      "4. Olive Oil Tasting (Traditional grove visits and tasting)\n" +
      "5. Gastronomy Classes (Learning to cook local specialties)\n" +
      "6. Game of Thrones Tours (Visiting iconic filming locations)\n" +
      "7. Jeep Safari (Exploring mountains and hinterland)\n" +
      "8. Museum & Gallery Tours (Expert-led art and history walks)\n" +
      "9. Photography Tours (Guided trips to the best photo spots)\n" +
      "10. Ethno Village Visits (Experience traditional rural life)\n\n" +
      "Which experience calls to you? Type the number! 🗺️\n" +
      "(Type 0 to go back to main menu)",
    activities: [
      "Walking City Tours",
      "Wine Tasting Tours",
      "National Park Trips",
      "Olive Oil Tasting",
      "Gastronomy Classes",
      "Game of Thrones Tours",
      "Jeep Safari",
      "Museum & Gallery Tours",
      "Photography Tours",
      "Ethno Village Visits",
    ],
  },
  {
    name: "Nightlife & Entertainment",
    emoji: "🎶",
    prompt:
      "Here are our Nightlife & Entertainment options! 🎶\n\n" +
      "1. VIP Club Booking (Table reservations in top nightclubs)\n" +
      "2. Pub Crawl (Guided social bar hopping experience)\n" +
      "3. Party Boat (Night cruises with DJs and open bar)\n" +
      "4. Cocktail Bar Experiences (Mixology tours and tastings)\n" +
      "5. Casino Nights (Access to premium gambling venues)\n" +
      "6. Live Music Events (Concerts, festivals, and terrace gigs)\n" +
      "7. Beach Club Parties (Day-to-night beachfront events)\n" +
      "8. Folklore Evenings (Traditional music and dance shows)\n" +
      "9. Open Air Cinema (Movie screenings under the stars)\n" +
      "10. Wine & Jazz Nights (Sophisticated evening entertainment)\n\n" +
      "Ready to experience Split's nightlife? Type the number! 🥂\n" +
      "(Type 0 to go back to main menu)",
    activities: [
      "VIP Club Booking",
      "Pub Crawl",
      "Party Boat",
      "Cocktail Bar Experiences",
      "Casino Nights",
      "Live Music Events",
      "Beach Club Parties",
      "Folklore Evenings",
      "Open Air Cinema",
      "Wine & Jazz Nights",
    ],
  },
];

const ALL_ACTIVITIES_RESPONSE =
  "Here's everything we offer in Split & Dalmatia! 🌊\n\n" +
  "🌊 NAUTICAL & WATER ACTIVITIES\n" +
  "1. Boat Tours | 2. Scuba Diving | 3. Sea Kayaking | 4. Stand Up Paddling (SUP) | 5. Parasailing | 6. Jet Ski Safari | 7. Sunset Cruises | 8. Fishing | 9. Sailing School | 10. Wakeboarding\n\n" +
  "🏍️ ADRENALINE & ADVENTURE\n" +
  "1. White Water Rafting | 2. Zipline | 3. Canyoning | 4. Skydiving | 5. Rock Climbing | 6. Bungee Jumping | 7. Off-road Buggy Safari | 8. Paintball Battles | 9. Speleology\n\n" +
  "🚗 TRANSPORTATION RENTALS\n" +
  "1. Car Rental | 2. Scooter & Moto Rental | 3. Speedboat Taxi | 4. Bicycle & E-bike Rental | 5. Boat Rental – No License | 6. Chauffeur Service | 7. Quads & ATV Rental | 8. Luxury Van Rental | 9. Luxury Car Hire | 10. Airport Transfers\n\n" +
  "🏛️ LAND TOURS & GUIDED EXPERIENCES\n" +
  "1. Walking City Tours | 2. Wine Tasting Tours | 3. National Park Trips | 4. Olive Oil Tasting | 5. Gastronomy Classes | 6. Game of Thrones Tours | 7. Jeep Safari | 8. Museum & Gallery Tours | 9. Photography Tours | 10. Ethno Village Visits\n\n" +
  "🎶 NIGHTLIFE & ENTERTAINMENT\n" +
  "1. VIP Club Booking | 2. Pub Crawl | 3. Party Boat | 4. Cocktail Bar Experiences | 5. Casino Nights | 6. Live Music Events | 7. Beach Club Parties | 8. Folklore Evenings | 9. Open Air Cinema | 10. Wine & Jazz Nights\n\n" +
  "Type the category number (1-5) then the activity number to start booking! 👇";

// ── SUB-CATEGORIES (activities with nested menus) ────────────────────────────
const SUB_CATEGORIES: Record<string, { prompt: string; activities: string[] }> = {
  "Boat Tours": {
    prompt:
      "What type of Boat Tour are you looking for? ⛵\n\n" +
      "1. Speedboat Tours (fast island-hopping, Blue Cave, Hvar)\n" +
      "2. Luxury Speedboat Tour (premium vessels, small groups)\n" +
      "3. One Day Big Boat Tour (large group, full-day excursions)\n" +
      "4. Multi-Day Boat Tour (overnight sailing, island routes)\n\n" +
      "Type the number! 👇\n(Type 0 to go back)",
    activities: [
      "Speedboat Tours",
      "Luxury Speedboat Tour",
      "One Day Big Boat Tour",
      "Multi-Day Boat Tour",
    ],
  },
};

// ── CHAT PHASE ───────────────────────────────────────────────────────────────
type ChatPhase = "menu" | { category: number } | { subCategory: string } | "booking";

export function useChat() {
  // Start with empty string — populated in useEffect (client-only)
  // This avoids SSR/client hydration mismatch from sessionStorage access
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatPhase, setChatPhase] = useState<ChatPhase>("menu");
  const landlordId = useLandlordId();
  const location = useLocation();
  const { messageCount, canSendMessage, isLastMessage, isLimitReached, incrementCount, resetCount } =
    useMessageLimit(sessionId);
  const abortRef = useRef<AbortController | null>(null);

  // Initialize session ID on client only (avoids SSR mismatch)
  useEffect(() => {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) {
      setSessionId(existing);
    } else {
      const id = uuidv4();
      sessionStorage.setItem(SESSION_KEY, id);
      setSessionId(id);
    }
  }, []);

  // Show greeting once on mount
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: ChatMessage = {
        id: uuidv4(),
        role: "bot",
        content: GREETING,
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
  }, [messages.length]);

  // ── N8N CALL HELPER ────────────────────────────────────────────────────────
  const callN8n = useCallback(
    async (text: string) => {
      setIsLoading(true);
      try {
        const response = await sendChatMessage(sessionId, text, {
          landlordId,
          location,
          messageCount: messageCount + 1,
          isLastMessage,
        });
        incrementCount();
        const botMsg: ChatMessage = {
          id: uuidv4(),
          role: "bot",
          content: response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch {
        const errorMsg: ChatMessage = {
          id: uuidv4(),
          role: "bot",
          content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, landlordId, location, messageCount, isLastMessage, incrementCount]
  );

  // ── SEND MESSAGE ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      if (!sessionId || !text.trim() || !canSendMessage || isLoading) return;

      const trimmed = text.trim();
      const num = parseInt(trimmed, 10);
      const isNum = !isNaN(num) && String(num) === trimmed;

      const userMsg: ChatMessage = {
        id: uuidv4(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // ── STATE: MENU ──────────────────────────────────────────────────
      if (chatPhase === "menu") {
        // "0" or "back" while already on menu — just re-show greeting
        if (trimmed === "0" || trimmed.toLowerCase() === "back") {
          setMessages((prev) => [
            ...prev,
            { id: uuidv4(), role: "bot", content: GREETING, timestamp: new Date() },
          ]);
          return;
        }
        // Categories 1-5 → hardcoded sub-activity list (no n8n)
        if (isNum && num >= 1 && num <= 5) {
          const cat = CATEGORIES[num - 1];
          setMessages((prev) => [
            ...prev,
            { id: uuidv4(), role: "bot", content: cat.prompt, timestamp: new Date() },
          ]);
          setChatPhase({ category: num });
          incrementCount();
          return;
        }
        // Category 7 → show all activities (no n8n)
        if (isNum && num === 7) {
          setMessages((prev) => [
            ...prev,
            { id: uuidv4(), role: "bot", content: ALL_ACTIVITIES_RESPONSE, timestamp: new Date() },
          ]);
          incrementCount();
          return;
        }
        // Category 6 (quiz results) or natural language → n8n
        await callN8n(trimmed);
        return;
      }

      // ── STATE: CATEGORY (showing sub-activity list) ──────────────────
      if (typeof chatPhase === "object" && "category" in chatPhase) {
        // "0" or "back" → return to main menu
        if (trimmed === "0" || trimmed.toLowerCase() === "back") {
          setMessages((prev) => [
            ...prev,
            { id: uuidv4(), role: "bot", content: GREETING, timestamp: new Date() },
          ]);
          setChatPhase("menu");
          return;
        }
        // Valid activity number → resolve name → check sub-categories or send to n8n
        const cat = CATEGORIES[chatPhase.category - 1];
        if (isNum && num >= 1 && num <= cat.activities.length) {
          const activityName = cat.activities[num - 1];
          // Check for sub-categories
          if (SUB_CATEGORIES[activityName]) {
            const sub = SUB_CATEGORIES[activityName];
            setMessages((prev) => [
              ...prev,
              { id: uuidv4(), role: "bot", content: sub.prompt, timestamp: new Date() },
            ]);
            setChatPhase({ subCategory: activityName });
            incrementCount();
            return;
          }
          setChatPhase("booking");
          await callN8n(`I want to book: ${activityName}`);
          return;
        }
        // Non-number or out-of-range → send as-is to n8n (e.g. "how much does it cost?")
        setChatPhase("booking");
        await callN8n(trimmed);
        return;
      }

      // ── STATE: SUB-CATEGORY (e.g. Boat Tours sub-types) ─────────────────
      if (typeof chatPhase === "object" && "subCategory" in chatPhase) {
        if (trimmed === "0" || trimmed.toLowerCase() === "back") {
          const parentIdx = CATEGORIES.findIndex((c) => c.activities.includes(chatPhase.subCategory));
          if (parentIdx >= 0) {
            setMessages((prev) => [
              ...prev,
              { id: uuidv4(), role: "bot", content: CATEGORIES[parentIdx].prompt, timestamp: new Date() },
            ]);
            setChatPhase({ category: parentIdx + 1 });
          } else {
            setMessages((prev) => [
              ...prev,
              { id: uuidv4(), role: "bot", content: GREETING, timestamp: new Date() },
            ]);
            setChatPhase("menu");
          }
          return;
        }
        const sub = SUB_CATEGORIES[chatPhase.subCategory];
        if (sub && isNum && num >= 1 && num <= sub.activities.length) {
          const subName = sub.activities[num - 1];
          setChatPhase("booking");
          await callN8n(`I want to book: ${subName}`);
          return;
        }
        setChatPhase("booking");
        await callN8n(trimmed);
        return;
      }

      // ── STATE: BOOKING (full conversation with n8n AI) ────────────────
      // "0", "back", or "menu" → exit booking, return to main menu
      if (trimmed === "0" || trimmed.toLowerCase() === "back" || trimmed.toLowerCase() === "menu") {
        setMessages((prev) => [
          ...prev,
          { id: uuidv4(), role: "bot", content: GREETING, timestamp: new Date() },
        ]);
        setChatPhase("menu");
        return;
      }
      await callN8n(trimmed);
    },
    [sessionId, chatPhase, canSendMessage, isLoading, incrementCount, callN8n]
  );

  const resetSession = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    resetCount();
    window.location.reload();
  }, [resetCount]);

  const cleanup = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    canSendMessage,
    isLimitReached,
    messageCount,
    resetSession,
    cleanup,
  };
}
