/**
 * PILOT demo catalogue. Fictional operators (names from the old test sheet)
 * with realistic Split 2026 prices, one or two offers each, covering every
 * activity type. Status "demo": shown with a "Demo" badge while
 * SHOW_DEMO_OFFERS is on. E-mails are rewritten to Gmail plus-addresses of the
 * Opsis inbox so nothing can ever reach a real third party.
 */
import type { Activity, Landlord, Operator } from "@/lib/schema";

type DemoOffer = {
  type: string;
  title: string;
  description: string;
  duration: string;
  meeting: string;
  adult: number;
  child: number | null;
  commission: number;
  max: number;
  featured?: boolean;
};

type DemoOperator = { company: string; contact: string; city: string; offers: DemoOffer[] };

const OPS: DemoOperator[] = [
  { company: "Blue Cave Express", contact: "Ante Jurić", city: "Split", offers: [
    { type: "speedboat_tours", title: "Blue Cave & 5 Islands speedboat tour", description: "Full day by speedboat: Blue Cave on Biševo, Vis, the Green Cave, Hvar town and the Pakleni islands. Swim stops included.", duration: "9 h", meeting: "Split, Riva promenade", adult: 125, child: 95, commission: 12, max: 24, featured: true },
  ]},
  { company: "Island Hopper Split", contact: "Maja Kovačić", city: "Split", offers: [
    { type: "speedboat_tours", title: "Hvar & Pakleni islands half-day", description: "Fast half-day to Hvar town and the turquoise bays of the Pakleni islands, with time for a swim and a walk.", duration: "5 h", meeting: "Split, Riva promenade", adult: 85, child: 65, commission: 12, max: 20 },
  ]},
  { company: "Split Luxury Boats", contact: "Ivan Šimunović", city: "Split", offers: [
    { type: "luxury_speedboat", title: "Private speedboat — your own island route", description: "Premium speedboat with skipper for your group only. Pick the bays, beaches and lunch stop yourself.", duration: "8 h", meeting: "Split, ACI marina", adult: 160, child: 120, commission: 10, max: 10, featured: true },
  ]},
  { company: "Dalmatia VIP Cruises", contact: "Ana Perić", city: "Split", offers: [
    { type: "luxury_speedboat", title: "Luxury Blue Lagoon & Šolta day", description: "Small-group premium boat to the Blue Lagoon and the quiet coves of Šolta, with drinks on board.", duration: "7 h", meeting: "Split, ACI marina", adult: 145, child: 110, commission: 10, max: 12 },
  ]},
  { company: "Big Blue Dalmatia", contact: "Petra Vrdoljak", city: "Split", offers: [
    { type: "big_boat_day", title: "Brač & Šolta full day with lunch", description: "Relaxed day on a large wooden boat: Bol's Zlatni Rat beach, Šolta village stop, grilled fish lunch and two swim stops.", duration: "9 h", meeting: "Split, Riva promenade", adult: 65, child: 35, commission: 12, max: 120, featured: true },
  ]},
  { company: "Blue Lagoon Cruises", contact: "Ana Šarić", city: "Trogir", offers: [
    { type: "big_boat_day", title: "Blue Lagoon & Trogir islands cruise", description: "From Trogir to the Blue Lagoon and the island of Šolta, with lunch and drinks on board.", duration: "8 h", meeting: "Trogir, Riva", adult: 55, child: 30, commission: 12, max: 100 },
  ]},
  { company: "Sail Croatia Adventures", contact: "Elena Mandić", city: "Split", offers: [
    { type: "multi_day_boat", title: "3-day island sailing: Hvar, Vis, Brač", description: "Sleep on a sailing yacht, wake up in a new bay every morning. Skipper and cabin included, meals partly.", duration: "3 days", meeting: "Split, ACI marina", adult: 590, child: 450, commission: 10, max: 8 },
  ]},
  { company: "Adriatic Divers", contact: "Ivan Babić", city: "Split", offers: [
    { type: "scuba_diving", title: "Discover scuba — your first dive", description: "Beginner-friendly try-dive with a PADI instructor. Theory, a pool-calm bay and one guided dive.", duration: "3 h", meeting: "Split, Žnjan dive base", adult: 90, child: null, commission: 12, max: 8 },
  ]},
  { company: "Dive Center Kaštela", contact: "Nikola Bašić", city: "Kaštela", offers: [
    { type: "scuba_diving", title: "Two-tank boat dive (certified divers)", description: "Two guided dives at a wreck and a reef wall. Equipment rental available.", duration: "5 h", meeting: "Kaštel Gomilica harbour", adult: 110, child: null, commission: 10, max: 10 },
  ]},
  { company: "Adriatic Kayak Tours", contact: "Marko Perković", city: "Split", offers: [
    { type: "sea_kayaking", title: "Sea kayak around Marjan & caves", description: "Paddle beneath Marjan hill to hidden beaches and sea caves, with a snorkel stop.", duration: "3 h", meeting: "Split, Kašjuni beach", adult: 45, child: 30, commission: 15, max: 24, featured: true },
  ]},
  { company: "Paddle Split", contact: "Lucija Radman", city: "Split", offers: [
    { type: "sup", title: "Sunset SUP tour", description: "Calm stand-up paddle along the coast at golden hour. Beginners welcome.", duration: "2 h", meeting: "Split, Bačvice beach", adult: 35, child: 25, commission: 15, max: 16 },
  ]},
  { company: "Sky High Parasail", contact: "Tomislav Novak", city: "Split", offers: [
    { type: "parasailing", title: "Parasailing above the Split riviera", description: "Fly up to 80 m above the sea, solo or in tandem, with views over the whole riviera.", duration: "1 h", meeting: "Split, Žnjan beach", adult: 70, child: 60, commission: 12, max: 30 },
  ]},
  { company: "Jet Split", contact: "Ivan Krstulović", city: "Split", offers: [
    { type: "jet_ski_safari", title: "Jet ski safari to Čiovo", description: "Guided jet ski ride along the coast to the bays of Čiovo. Driving licence not needed.", duration: "1.5 h", meeting: "Split, Trstenik", adult: 120, child: null, commission: 10, max: 12 },
  ]},
  { company: "Golden Hour Cruises", contact: "Ana Bilić", city: "Split", offers: [
    { type: "sunset_cruise", title: "Sunset cruise with Prosecco", description: "Evening sail along Marjan with a glass of Prosecco as the sun goes down over the islands.", duration: "2 h", meeting: "Split, Riva promenade", adult: 45, child: 25, commission: 15, max: 40 },
  ]},
  { company: "Tuna Hunter Split", contact: "Josip Barić", city: "Split", offers: [
    { type: "fishing", title: "Morning fishing with a local skipper", description: "Traditional Dalmatian fishing at dawn; we grill the catch on board.", duration: "5 h", meeting: "Split, Matejuška harbour", adult: 85, child: 50, commission: 12, max: 8 },
  ]},
  { company: "Learn to Sail Split", contact: "Marin Kovač", city: "Split", offers: [
    { type: "sailing_school", title: "Learn to sail — one-day course", description: "Hands-on day with an instructor: knots, steering and your first tacks.", duration: "6 h", meeting: "Split, ACI marina", adult: 95, child: 70, commission: 10, max: 8 },
  ]},
  { company: "Cable Wake Park", contact: "Hrvoje Galić", city: "Kaštela", offers: [
    { type: "wakeboarding", title: "Wakeboard session at the cable park", description: "Two hours at the cable park with board, vest and a quick lesson.", duration: "2 h", meeting: "Kaštela cable park", adult: 40, child: 30, commission: 12, max: 30 },
  ]},
  { company: "Cetina Canyon Adventures", contact: "Ivan Kulić", city: "Omiš", offers: [
    { type: "rafting", title: "Cetina river rafting", description: "Classic rafting on the Cetina through the canyon, with cliff jumps and a picnic stop.", duration: "4 h", meeting: "Omiš, Radmanove mlinice", adult: 50, child: 35, commission: 12, max: 60, featured: true },
    { type: "canyoning", title: "Cetina canyoning (intermediate)", description: "Hike, abseil, slide and jump down the Cetina canyon with two guides.", duration: "5 h", meeting: "Omiš, Zadvarje", adult: 75, child: null, commission: 12, max: 16 },
  ]},
  { company: "Zipline Omiš", contact: "Marko Perišić", city: "Omiš", offers: [
    { type: "zipline", title: "Zipline over the Cetina canyon (8 lines)", description: "Eight steel lines up to 700 m long and 150 m above the canyon floor.", duration: "3 h", meeting: "Omiš, Lisičina", adult: 65, child: 55, commission: 12, max: 50 },
  ]},
  { company: "Skydive Croatia", contact: "Ivan Radić", city: "Sinj", offers: [
    { type: "skydiving", title: "Tandem skydive over the coast", description: "Freefall from 3,000 m with a certified tandem master. Video package available.", duration: "3 h", meeting: "Sinj airfield", adult: 290, child: null, commission: 8, max: 10 },
  ]},
  { company: "Climb Split", contact: "Goran Tomić", city: "Split", offers: [
    { type: "rock_climbing", title: "Rock climbing on Marjan for beginners", description: "Guided climbing on Marjan's sea cliffs; all gear provided.", duration: "3 h", meeting: "Split, Marjan (Kašjuni)", adult: 60, child: 45, commission: 12, max: 8 },
  ]},
  { company: "Bungee Croatia", contact: "Ana Tomić", city: "Omiš", offers: [
    { type: "bungee", title: "Bridge bungee jump", description: "One jump from a bridge over the river, with instructors and certificate.", duration: "1 h", meeting: "Omiš", adult: 95, child: null, commission: 10, max: 30 },
  ]},
  { company: "Buggy Split Tours", contact: "Hrvoje Perić", city: "Split", offers: [
    { type: "buggy_safari", title: "Buggy safari in the Mosor hills", description: "Drive your own buggy on dirt tracks to panoramic viewpoints above Split.", duration: "3 h", meeting: "Split, Žrnovnica", adult: 110, child: null, commission: 12, max: 16 },
  ]},
  { company: "Paintball Arena Split", contact: "Tomislav Bilić", city: "Split", offers: [
    { type: "paintball", title: "Paintball battle (2 hours)", description: "Team games in a forest arena, 200 balls and full gear included.", duration: "2 h", meeting: "Split, Kamen", adult: 35, child: null, commission: 15, max: 40 },
  ]},
  { company: "Cave Explorers Split", contact: "Ana Zelić", city: "Split", offers: [
    { type: "speleology", title: "Guided cave exploration", description: "Explore a karst cave system with helmets and headlamps; no experience needed.", duration: "4 h", meeting: "Split, Žrnovnica", adult: 55, child: 40, commission: 12, max: 12 },
  ]},
  { company: "Heritage Walks", contact: "Luka Matić", city: "Split", offers: [
    { type: "walking_tour", title: "Diocletian's Palace walking tour", description: "The Roman palace, the cathedral, the cellars and the stories locals tell, with a licensed guide.", duration: "1.5 h", meeting: "Split, Golden Gate", adult: 25, child: 0, commission: 15, max: 40, featured: true },
  ]},
  { company: "Dalmatian Wine Trails", contact: "Maja Tomić", city: "Split", offers: [
    { type: "wine_tasting", title: "Wine tasting in the Kaštela hinterland", description: "Two family wineries, the original Zinfandel (Crljenak) and local cheese and prosciutto.", duration: "4 h", meeting: "Pick-up in Split", adult: 65, child: null, commission: 12, max: 16 },
  ]},
  { company: "Krka Day Trips", contact: "Silvija Mandžukić", city: "Skradin", offers: [
    { type: "national_parks", title: "Krka waterfalls day trip from Split", description: "Coach and guide to Krka National Park with time to walk the boardwalks. Park ticket paid on site.", duration: "9 h", meeting: "Pick-up in Split", adult: 75, child: 45, commission: 12, max: 50 },
  ]},
  { company: "Olive Gold", contact: "Marko Galić", city: "Šolta", offers: [
    { type: "olive_oil", title: "Olive oil tasting at a family grove", description: "Walk the centuries-old grove, see the mill and taste three oils with homemade bread.", duration: "2 h", meeting: "Šolta, Grohote", adult: 30, child: 10, commission: 15, max: 20 },
  ]},
  { company: "Chef Dalmatia", contact: "Ana Čović", city: "Split", offers: [
    { type: "cooking_class", title: "Dalmatian cooking class & market tour", description: "Shop at the green market with a chef, then cook and eat a four-course Dalmatian lunch.", duration: "4 h", meeting: "Split, Green market (Pazar)", adult: 85, child: 45, commission: 15, max: 12 },
  ]},
  { company: "Kings Landing Tours", contact: "Maja Zelić", city: "Split", offers: [
    { type: "got_tour", title: "Game of Thrones locations in Split & Klis", description: "The palace cellars, Meereen's throne room and Klis fortress with a guide who worked as an extra.", duration: "3 h", meeting: "Split, Golden Gate", adult: 45, child: 25, commission: 15, max: 30 },
  ]},
  { company: "Jeep Dalmatia", contact: "Maja Zelić", city: "Split", offers: [
    { type: "jeep_safari", title: "Jeep safari to Mosor & hinterland villages", description: "4x4 tour to mountain viewpoints and stone villages, with a farm snack.", duration: "5 h", meeting: "Pick-up in Split", adult: 75, child: 40, commission: 12, max: 18 },
  ]},
  { company: "Culture Split", contact: "Ante Kovač", city: "Split", offers: [
    { type: "museum_tour", title: "Split museums with an art historian", description: "Meštrović Gallery and the Ethnographic Museum with an expert guide.", duration: "3 h", meeting: "Split, Peristil", adult: 40, child: 20, commission: 15, max: 15 },
  ]},
  { company: "Photo Split", contact: "Marina Perić", city: "Split", offers: [
    { type: "photo_tour", title: "Golden-hour photo walk", description: "A pro photographer takes you to the best viewpoints at the best light; any camera or phone.", duration: "2.5 h", meeting: "Split, Prokurative", adult: 55, child: 30, commission: 15, max: 10 },
  ]},
  { company: "Ethno Dalmatia", contact: "Lucija Babić", city: "Makarska", offers: [
    { type: "ethno_village", title: "Ethno village visit with traditional lunch", description: "Stone houses, traditional crafts and a peka lunch in a restored village.", duration: "5 h", meeting: "Pick-up in Makarska", adult: 60, child: 35, commission: 12, max: 30 },
  ]},
  { company: "Club Central", contact: "Marko Galić", city: "Split", offers: [
    { type: "vip_club", title: "VIP table at a top Split club", description: "Reserved table and fast-track entry. Price is per person with a minimum spend included.", duration: "Evening", meeting: "Split, club entrance", adult: 80, child: null, commission: 15, max: 20 },
  ]},
  { company: "Split Pub Crawl", contact: "Marko Galić", city: "Split", offers: [
    { type: "pub_crawl", title: "Split pub crawl: 4 bars + club", description: "Meet travellers from everywhere, welcome shots and club entry included.", duration: "4 h", meeting: "Split, Fruit square", adult: 25, child: null, commission: 15, max: 60 },
  ]},
  { company: "Party Boat Split", contact: "Ana Čović", city: "Split", offers: [
    { type: "party_boat", title: "Night party boat with DJ", description: "Three hours at sea with a DJ, a swim stop under the stars and a welcome drink.", duration: "3 h", meeting: "Split, Riva promenade", adult: 40, child: null, commission: 15, max: 120 },
  ]},
  { company: "Mix Masters Split", contact: "Maja Zelić", city: "Split", offers: [
    { type: "cocktail_bar", title: "Cocktail masterclass", description: "Learn three classics and one Dalmatian twist from an award-winning bartender.", duration: "2 h", meeting: "Split, old town", adult: 45, child: null, commission: 15, max: 14 },
  ]},
  { company: "Casino Royale Split", contact: "Maja Zelić", city: "Split", offers: [
    { type: "casino_night", title: "Casino night with welcome chips", description: "Entry, welcome chips and a drink at a premium hotel casino. 18+ only.", duration: "3 h", meeting: "Split, hotel casino", adult: 50, child: null, commission: 10, max: 30 },
  ]},
  { company: "Music Under Stars", contact: "Marina Perić", city: "Split", offers: [
    { type: "live_music", title: "Live music evening on a terrace", description: "Acoustic and jazz-pop sets on a terrace above the sea. Seat reservation included.", duration: "3 h", meeting: "Split, Bačvice", adult: 25, child: 0, commission: 15, max: 80 },
  ]},
  { company: "Beach Bar Žnjan", contact: "Marina Perić", city: "Split", offers: [
    { type: "beach_club", title: "Beach club day-to-night pass", description: "Sunbed, welcome cocktail and entry to the sunset DJ party.", duration: "6 h", meeting: "Split, Žnjan beach", adult: 30, child: null, commission: 15, max: 100 },
  ]},
  { company: "Dalmatian Klapa", contact: "Ivan Matić", city: "Split", offers: [
    { type: "folklore_evening", title: "Klapa singing & folklore evening", description: "UNESCO-listed a cappella klapa singing and dances in the palace, with a glass of local wine.", duration: "2 h", meeting: "Split, Peristil", adult: 30, child: 15, commission: 15, max: 60 },
  ]},
  { company: "Starlight Cinema", contact: "Ivan Matić", city: "Split", offers: [
    { type: "open_air_cinema", title: "Open-air cinema night", description: "Summer movies under the pines, deckchair and popcorn included.", duration: "2.5 h", meeting: "Split, Bačvice", adult: 12, child: 8, commission: 15, max: 150 },
  ]},
  { company: "Jazz & Wine Split", contact: "Ivan Matić", city: "Split", offers: [
    { type: "wine_jazz", title: "Wine & jazz evening", description: "Four local wines paired with a live jazz trio in a stone courtyard.", duration: "3 h", meeting: "Split, old town", adult: 45, child: null, commission: 15, max: 40 },
  ]},
  { company: "Airport Shuttle Split", contact: "Maja Zelić", city: "Kaštela", offers: [
    { type: "airport_transfer", title: "Private airport transfer (Split airport)", description: "Door-to-door transfer between Split airport and your accommodation. Price per person.", duration: "30–45 min", meeting: "Split airport arrivals / your address", adult: 20, child: 10, commission: 10, max: 50 },
  ]},
  { company: "Sea Taxi Split", contact: "Goran Šimić", city: "Split", offers: [
    { type: "speedboat_taxi", title: "Speedboat taxi to Hvar or Bol", description: "Fast private ride from Split to Hvar town or Bol, any time of day.", duration: "1 h", meeting: "Split, Riva promenade", adult: 60, child: 40, commission: 10, max: 40 },
  ]},
  { company: "Easy Boat Split", contact: "Petra Jurić", city: "Split", offers: [
    { type: "boat_rental_no_license", title: "Rent a 5 hp boat — full day", description: "Small boat you can drive without a licence; explore Čiovo and Šolta coves yourself. Price per person.", duration: "8 h", meeting: "Split, Spinut marina", adult: 40, child: 20, commission: 12, max: 20 },
  ]},
  { company: "Split Rent", contact: "Ante Kovač", city: "Split", offers: [
    { type: "car_rental", title: "Economy car — 1 day", description: "Compact car with insurance and unlimited km, delivered to your accommodation.", duration: "1 day", meeting: "Delivered to you", adult: 55, child: null, commission: 10, max: 20 },
  ]},
  { company: "Luxury Motors Split", contact: "Nikola Radić", city: "Split", offers: [
    { type: "luxury_car", title: "Convertible sports car — 1 day", description: "Top-down drive along the coast road in a premium convertible.", duration: "1 day", meeting: "Delivered to you", adult: 250, child: null, commission: 10, max: 4 },
  ]},
  { company: "Executive Drive", contact: "Marko Galić", city: "Split", offers: [
    { type: "chauffeur", title: "Chauffeur service — half day", description: "Premium car with an English-speaking driver for your own itinerary.", duration: "4 h", meeting: "Pick-up at your address", adult: 60, child: 30, commission: 10, max: 12 },
  ]},
  { company: "Van Express", contact: "Ana Čović", city: "Kaštela", offers: [
    { type: "van_rental", title: "8-seat van with driver — day trip", description: "Group transport for a day trip anywhere in Dalmatia. Price per person.", duration: "8 h", meeting: "Pick-up at your address", adult: 45, child: 25, commission: 10, max: 16 },
  ]},
  { company: "Moto Split", contact: "Marina Perić", city: "Split", offers: [
    { type: "scooter_rental", title: "Scooter rental — 1 day", description: "125 cc scooter with two helmets; car licence category B is enough.", duration: "1 day", meeting: "Split, Poljud", adult: 40, child: null, commission: 12, max: 20 },
  ]},
  { company: "Bike Split", contact: "Lucija Babić", city: "Split", offers: [
    { type: "bike_rental", title: "E-bike rental — 1 day", description: "E-bike with lock and helmet; perfect for Marjan forest park.", duration: "1 day", meeting: "Split, Bačvice", adult: 35, child: 20, commission: 15, max: 30 },
  ]},
  { company: "Quad Split", contact: "Marko Galić", city: "Split", offers: [
    { type: "quad_atv", title: "Quad / ATV rental — 3 hours", description: "Ride a quad on marked trails above Omiš with a short safety briefing.", duration: "3 h", meeting: "Omiš, Duće", adult: 85, child: null, commission: 12, max: 16 },
  ]},
];

const pad = (n: number) => String(n).padStart(3, "0");
const CREATED = "2026-11-20T08:00:00.000Z";

export function buildDemoData(): { operators: Operator[]; activities: Activity[]; landlords: Landlord[] } {
  const operators: Operator[] = [];
  const activities: Activity[] = [];
  let a = 0;
  OPS.forEach((op, i) => {
    const operatorId = `OP-DEM${pad(i + 1)}`;
    operators.push({
      operator_id: operatorId,
      status: "demo",
      company: op.company,
      contact_person: op.contact,
      email: `opsisdalmatia+demo-${operatorId.toLowerCase()}@gmail.com`,
      phone: "",
      city: op.city,
      website: "",
      address: "",
      business_model: "direct",
      max_per_day: null,
      notes: "PILOT demo operator (fictional)",
      created_at: CREATED,
      approved_at: CREATED,
      manage_version: 1,
      source: "demo-seed",
    });
    for (const o of op.offers) {
      a += 1;
      activities.push({
        activity_id: `A-DEM${pad(a)}`,
        operator_id: operatorId,
        status: "demo",
        type_key: o.type,
        title: o.title,
        description: o.description,
        duration: o.duration,
        meeting_point: o.meeting,
        city: op.city,
        price_adult: o.adult,
        price_child: o.child,
        commission_pct: o.commission,
        max_per_day: o.max,
        image_url: "",
        gallery_url: "",
        featured: !!o.featured,
        created_at: CREATED,
      });
    }
  });
  const landlords: Landlord[] = [
    {
      landlord_id: "L-DEM00001",
      status: "demo",
      full_name: "Demo Iznajmljivač",
      property_name: "Villa Demo Marjan",
      email: "opsisdalmatia+demo-landlord@gmail.com",
      phone: "",
      address: "Demo ulica 1",
      city: "Split",
      area: "split",
      units: 3,
      avg_guests_summer: 40,
      booking_platform: "Booking.com",
      consent_at: CREATED,
      terms_version: "demo",
      created_at: CREATED,
      source: "demo-seed",
    },
  ];
  return { operators, activities, landlords };
}
