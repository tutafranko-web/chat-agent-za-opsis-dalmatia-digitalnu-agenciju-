/**
 * Fixed activity taxonomy shared by the menu, the catalog, the quiz, the
 * operator form and the AI tools. Operators pick a `type_key` from this list,
 * so offers always match the menu (no free-text matching).
 */

export type Lang = "en" | "hr";

export type CategoryKey = "nautical" | "adrenaline" | "transport" | "land" | "nightlife";

export type Interest =
  | "boat_islands"
  | "water_sports"
  | "adrenaline"
  | "history"
  | "food_wine"
  | "nature_hiking"
  | "nightlife"
  | "photography"
  | "relax";

export type Ideal = "relax_sea" | "adventure" | "culture" | "food_wine" | "nightlife" | "nature";

export interface Category {
  key: CategoryKey;
  label: Record<Lang, string>;
  blurb: Record<Lang, string>;
  icon: string;
}

export interface ActivityType {
  key: string;
  category: CategoryKey;
  /** Optional menu group (e.g. the four boat-tour variants sit under "boat_tours"). */
  group?: string;
  label: Record<Lang, string>;
  blurb: Record<Lang, string>;
  icon: string;
  /** Local photo, if we have one; otherwise the UI draws a branded poster. */
  image?: string;
  // Quiz attributes
  interests: Interest[];
  ideals: Ideal[];
  intensity: 0 | 1 | 2 | 3;
  water?: boolean;
  heights?: boolean;
  speed?: boolean;
  kids: boolean;
  evening?: boolean;
  morning?: boolean;
  /** Not a bookable "experience" for the quiz (e.g. car rental, transfers). */
  utility?: boolean;
  /** Words used to map legacy free-text activity names onto this type. */
  synonyms: string[];
}

export const CATEGORIES: Category[] = [
  {
    key: "nautical",
    label: { en: "Sea & boats", hr: "More i brodovi" },
    blurb: { en: "Island hopping, diving, kayaks, sunsets", hr: "Otoci, ronjenje, kajaci, zalasci" },
    icon: "waves",
  },
  {
    key: "adrenaline",
    label: { en: "Adrenaline & adventure", hr: "Adrenalin i avantura" },
    blurb: { en: "Rafting, zipline, canyoning and more", hr: "Rafting, zipline, kanjoning i više" },
    icon: "mountain",
  },
  {
    key: "land",
    label: { en: "Tours & tastings", hr: "Izleti i degustacije" },
    blurb: { en: "Old towns, wine, national parks, food", hr: "Stari gradovi, vino, nacionalni parkovi" },
    icon: "landmark",
  },
  {
    key: "nightlife",
    label: { en: "Nightlife & entertainment", hr: "Noćni život i zabava" },
    blurb: { en: "Party boats, clubs, live music", hr: "Party brodovi, klubovi, glazba uživo" },
    icon: "music",
  },
  {
    key: "transport",
    label: { en: "Transport & rentals", hr: "Prijevoz i najam" },
    blurb: { en: "Transfers, cars, scooters, boats", hr: "Transferi, auti, skuteri, brodice" },
    icon: "car",
  },
];

export const GROUPS: Record<string, { label: Record<Lang, string>; blurb: Record<Lang, string>; icon: string; image?: string }> = {
  boat_tours: {
    label: { en: "Boat tours", hr: "Brodski izleti" },
    blurb: { en: "Blue Cave, Hvar, islands", hr: "Modra špilja, Hvar, otoci" },
    icon: "ship",
    image: "/activities/blue-cave.jpg",
  },
};

const T = (t: ActivityType) => t;

export const TYPES: ActivityType[] = [
  // ── Sea & boats ───────────────────────────────────────────────────────────
  T({
    key: "speedboat_tours", category: "nautical", group: "boat_tours",
    label: { en: "Speedboat island tour", hr: "Speedboat izlet po otocima" },
    blurb: { en: "Blue Cave, Hvar and the Pakleni islands in one fast day", hr: "Modra špilja, Hvar i Pakleni otoci u jednom danu" },
    icon: "ship", image: "/activities/blue-cave.jpg",
    interests: ["boat_islands", "photography"], ideals: ["relax_sea", "adventure"], intensity: 1,
    water: true, speed: true, kids: true, morning: true,
    synonyms: ["speedboat", "blue cave", "5 islands", "island hopping", "boat tour", "boat tours", "hvar"],
  }),
  T({
    key: "luxury_speedboat", category: "nautical", group: "boat_tours",
    label: { en: "Private / luxury speedboat", hr: "Privatni / luksuzni speedboat" },
    blurb: { en: "Premium boat, small group, your own route", hr: "Premium brod, mala grupa, vaša ruta" },
    icon: "gem", image: "/activities/island-aerial.jpg",
    interests: ["boat_islands", "relax", "photography"], ideals: ["relax_sea"], intensity: 0,
    water: true, kids: true,
    synonyms: ["luxury", "private boat", "private tour", "vip boat", "yacht"],
  }),
  T({
    key: "big_boat_day", category: "nautical", group: "boat_tours",
    label: { en: "Full-day big boat excursion", hr: "Cjelodnevni izlet velikim brodom" },
    blurb: { en: "Relaxed day trip with lunch, swim stops and islands", hr: "Opušteni izlet s ručkom, kupanjem i otocima" },
    icon: "sailboat", image: "/activities/island-aerial.jpg",
    interests: ["boat_islands", "relax"], ideals: ["relax_sea"], intensity: 0,
    water: true, kids: true, morning: true,
    synonyms: ["big boat", "one day", "excursion", "brac", "šolta", "solta", "island tour", "lagoon"],
  }),
  T({
    key: "multi_day_boat", category: "nautical", group: "boat_tours",
    label: { en: "Multi-day sailing trip", hr: "Višednevno jedrenje" },
    blurb: { en: "Sleep on board and wake up on a new island", hr: "Spavanje na brodu i svako jutro novi otok" },
    icon: "anchor",
    interests: ["boat_islands", "relax"], ideals: ["relax_sea", "nature"], intensity: 1,
    water: true, kids: false,
    synonyms: ["multi-day", "multi day", "sailing trip", "charter", "yacht charter", "sailing croatia"],
  }),
  T({
    key: "scuba_diving", category: "nautical",
    label: { en: "Scuba diving", hr: "Ronjenje" },
    blurb: { en: "Try-dives and certified dives in clear Adriatic water", hr: "Probna i certificirana ronjenja u bistrom Jadranu" },
    icon: "fish",
    interests: ["water_sports", "nature_hiking"], ideals: ["adventure", "nature"], intensity: 2,
    water: true, kids: false,
    synonyms: ["dive", "diving", "scuba", "padi", "snorkel"],
  }),
  T({
    key: "sea_kayaking", category: "nautical",
    label: { en: "Sea kayaking", hr: "Kajak na moru" },
    blurb: { en: "Paddle along the coast, caves and hidden beaches", hr: "Veslanje uz obalu, špilje i skrivene plaže" },
    icon: "waves",
    interests: ["water_sports", "nature_hiking"], ideals: ["adventure", "nature"], intensity: 2,
    water: true, kids: true, morning: true,
    synonyms: ["kayak", "kajak", "paddle", "sea kayaking"],
  }),
  T({
    key: "sup", category: "nautical",
    label: { en: "Stand-up paddle (SUP)", hr: "Stand-up paddle (SUP)" },
    blurb: { en: "Rentals and calm sunset paddles", hr: "Najam i mirno veslanje u zalazak" },
    icon: "waves",
    interests: ["water_sports", "relax"], ideals: ["relax_sea"], intensity: 1,
    water: true, kids: true,
    synonyms: ["sup", "stand up", "paddleboard", "paddle board"],
  }),
  T({
    key: "parasailing", category: "nautical",
    label: { en: "Parasailing", hr: "Parasailing" },
    blurb: { en: "Fly high above the sea behind a boat", hr: "Let iznad mora iza gliserskog broda" },
    icon: "wind",
    interests: ["adrenaline", "water_sports", "photography"], ideals: ["adventure"], intensity: 2,
    water: true, heights: true, kids: true,
    synonyms: ["parasail", "parasailing", "paragliding sea"],
  }),
  T({
    key: "jet_ski_safari", category: "nautical",
    label: { en: "Jet ski safari", hr: "Jet ski safari" },
    blurb: { en: "Guided high-speed coastal ride", hr: "Vođena brza vožnja uz obalu" },
    icon: "zap",
    interests: ["adrenaline", "water_sports"], ideals: ["adventure"], intensity: 3,
    water: true, speed: true, kids: false,
    synonyms: ["jet ski", "jetski", "jet-ski", "seabob", "flyboard"],
  }),
  T({
    key: "sunset_cruise", category: "nautical",
    label: { en: "Sunset cruise", hr: "Krstarenje u zalazak sunca" },
    blurb: { en: "Evening sail with drinks and golden light", hr: "Večernja plovidba uz piće i zlatno svjetlo" },
    icon: "sunset",
    interests: ["boat_islands", "relax", "photography"], ideals: ["relax_sea"], intensity: 0,
    water: true, kids: true, evening: true,
    synonyms: ["sunset", "evening cruise", "golden hour"],
  }),
  T({
    key: "fishing", category: "nautical",
    label: { en: "Fishing trip", hr: "Ribolov" },
    blurb: { en: "Big-game and traditional fishing with local skippers", hr: "Ribolov s lokalnim skiperima" },
    icon: "fish",
    interests: ["water_sports", "nature_hiking"], ideals: ["nature"], intensity: 1,
    water: true, kids: true, morning: true,
    synonyms: ["fishing", "tuna", "ribolov", "fish"],
  }),
  T({
    key: "sailing_school", category: "nautical",
    label: { en: "Sailing lesson", hr: "Škola jedrenja" },
    blurb: { en: "Learn to sail in a day or two", hr: "Naučite jedriti za dan ili dva" },
    icon: "sailboat",
    interests: ["water_sports"], ideals: ["adventure", "relax_sea"], intensity: 1,
    water: true, kids: true,
    synonyms: ["sailing school", "learn to sail", "sail school", "sailing lesson"],
  }),
  T({
    key: "wakeboarding", category: "nautical",
    label: { en: "Wakeboarding", hr: "Wakeboarding" },
    blurb: { en: "Cable park and boat sessions", hr: "Cable park i vožnja iza broda" },
    icon: "waves", image: "/activities/wakeboarding.jpg",
    interests: ["adrenaline", "water_sports"], ideals: ["adventure"], intensity: 3,
    water: true, speed: true, kids: false,
    synonyms: ["wake", "wakeboard", "cable park", "water ski", "windsurf"],
  }),

  // ── Adrenaline & adventure ────────────────────────────────────────────────
  T({
    key: "rafting", category: "adrenaline",
    label: { en: "White-water rafting", hr: "Rafting" },
    blurb: { en: "Cetina river rapids near Omiš", hr: "Brzaci rijeke Cetine kod Omiša" },
    icon: "waves", image: "/activities/rafting.jpg",
    interests: ["adrenaline", "nature_hiking", "water_sports"], ideals: ["adventure", "nature"], intensity: 2,
    water: true, kids: true, morning: true,
    synonyms: ["rafting", "river", "cetina", "rapids"],
  }),
  T({
    key: "zipline", category: "adrenaline",
    label: { en: "Zipline", hr: "Zipline" },
    blurb: { en: "Fly over the Cetina canyon", hr: "Let iznad kanjona Cetine" },
    icon: "cable", image: "/activities/zipline.jpg",
    interests: ["adrenaline", "photography"], ideals: ["adventure"], intensity: 2,
    heights: true, speed: true, kids: true,
    synonyms: ["zipline", "zip line", "zip-line"],
  }),
  T({
    key: "canyoning", category: "adrenaline",
    label: { en: "Canyoning", hr: "Kanjoning" },
    blurb: { en: "Hike, slide and jump down a river canyon", hr: "Hodanje, klizanje i skokovi niz kanjon" },
    icon: "mountain",
    interests: ["adrenaline", "nature_hiking", "water_sports"], ideals: ["adventure", "nature"], intensity: 3,
    water: true, heights: true, kids: false,
    synonyms: ["canyoning", "canyon", "kanjoning"],
  }),
  T({
    key: "skydiving", category: "adrenaline",
    label: { en: "Tandem skydive", hr: "Tandem skok padobranom" },
    blurb: { en: "Freefall with coastal views", hr: "Slobodan pad s pogledom na obalu" },
    icon: "plane",
    interests: ["adrenaline"], ideals: ["adventure"], intensity: 3,
    heights: true, speed: true, kids: false,
    synonyms: ["skydive", "skydiving", "parachute", "free fall"],
  }),
  T({
    key: "rock_climbing", category: "adrenaline",
    label: { en: "Rock climbing", hr: "Penjanje" },
    blurb: { en: "Guided climbs on natural cliffs", hr: "Vođeno penjanje po prirodnim stijenama" },
    icon: "mountain",
    interests: ["adrenaline", "nature_hiking"], ideals: ["adventure", "nature"], intensity: 3,
    heights: true, kids: false, morning: true,
    synonyms: ["climb", "climbing", "penjanje", "via ferrata"],
  }),
  T({
    key: "bungee", category: "adrenaline",
    label: { en: "Bungee jumping", hr: "Bungee jumping" },
    blurb: { en: "Bridge jumps for the ultimate rush", hr: "Skok s mosta za vrhunski adrenalin" },
    icon: "arrow-down",
    interests: ["adrenaline"], ideals: ["adventure"], intensity: 3,
    heights: true, speed: true, kids: false,
    synonyms: ["bungee", "jump", "bungee jumping"],
  }),
  T({
    key: "buggy_safari", category: "adrenaline",
    label: { en: "Off-road buggy safari", hr: "Buggy safari" },
    blurb: { en: "Dusty trails through the hinterland", hr: "Makadami kroz zaleđe" },
    icon: "truck", image: "/activities/atv-safari.jpg",
    interests: ["adrenaline", "nature_hiking"], ideals: ["adventure"], intensity: 2,
    speed: true, kids: false,
    synonyms: ["buggy", "off-road", "offroad", "safari"],
  }),
  T({
    key: "paintball", category: "adrenaline",
    label: { en: "Paintball", hr: "Paintball" },
    blurb: { en: "Tactical games outdoors", hr: "Taktičke igre u prirodi" },
    icon: "target",
    interests: ["adrenaline"], ideals: ["adventure"], intensity: 2,
    kids: false,
    synonyms: ["paintball", "airsoft"],
  }),
  T({
    key: "speleology", category: "adrenaline",
    label: { en: "Caving", hr: "Speleologija" },
    blurb: { en: "Explore underground caves with a guide", hr: "Istraživanje špilja s vodičem" },
    icon: "mountain",
    interests: ["adrenaline", "nature_hiking"], ideals: ["adventure", "nature"], intensity: 2,
    kids: false,
    synonyms: ["cave", "caving", "speleology", "špilja"],
  }),

  // ── Tours & tastings ──────────────────────────────────────────────────────
  T({
    key: "walking_tour", category: "land",
    label: { en: "Old-town walking tour", hr: "Razgled starog grada" },
    blurb: { en: "Diocletian's Palace and hidden lanes with a local guide", hr: "Dioklecijanova palača i skrivene uličice s vodičem" },
    icon: "landmark",
    interests: ["history", "photography"], ideals: ["culture"], intensity: 0,
    kids: true, morning: true,
    synonyms: ["walking", "walk", "old town", "diocletian", "palace", "city tour", "heritage", "korčula walking", "salona", "klis", "fortress"],
  }),
  T({
    key: "wine_tasting", category: "land",
    label: { en: "Wine tasting tour", hr: "Vinska tura" },
    blurb: { en: "Boutique wineries and local varieties", hr: "Butik vinarije i domaće sorte" },
    icon: "wine",
    interests: ["food_wine"], ideals: ["food_wine", "culture"], intensity: 0,
    kids: false,
    synonyms: ["wine", "winery", "vino", "tasting", "cellar", "vineyard"],
  }),
  T({
    key: "national_parks", category: "land",
    label: { en: "Krka / Plitvice day trip", hr: "Izlet na Krku ili Plitvice" },
    blurb: { en: "Waterfalls and lakes on a guided day trip", hr: "Slapovi i jezera uz vodiča" },
    icon: "trees",
    interests: ["nature_hiking", "photography"], ideals: ["nature"], intensity: 1,
    kids: true, morning: true,
    synonyms: ["krka", "plitvice", "national park", "waterfalls", "imotski lake", "lakes"],
  }),
  T({
    key: "olive_oil", category: "land",
    label: { en: "Olive oil tasting", hr: "Degustacija maslinovog ulja" },
    blurb: { en: "Family groves and tasting", hr: "Obiteljski maslinici i kušanje" },
    icon: "leaf",
    interests: ["food_wine", "nature_hiking"], ideals: ["food_wine"], intensity: 0,
    kids: true,
    synonyms: ["olive", "oil", "maslin"],
  }),
  T({
    key: "cooking_class", category: "land",
    label: { en: "Cooking class / food tour", hr: "Tečaj kuhanja / gastro tura" },
    blurb: { en: "Cook and taste Dalmatian specialities", hr: "Kuhajte i kušajte dalmatinske specijalitete" },
    icon: "chef-hat",
    interests: ["food_wine", "history"], ideals: ["food_wine", "culture"], intensity: 0,
    kids: true,
    synonyms: ["cooking", "food", "gastro", "chef", "culinary", "taste of"],
  }),
  T({
    key: "got_tour", category: "land",
    label: { en: "Game of Thrones tour", hr: "Game of Thrones tura" },
    blurb: { en: "Filming locations in Split and Klis", hr: "Lokacije snimanja u Splitu i Klisu" },
    icon: "crown",
    interests: ["history", "photography"], ideals: ["culture"], intensity: 0,
    kids: true,
    synonyms: ["game of thrones", "got", "thrones", "kings landing", "throne"],
  }),
  T({
    key: "jeep_safari", category: "land",
    label: { en: "Jeep safari", hr: "Jeep safari" },
    blurb: { en: "Mountains, villages and viewpoints", hr: "Planine, sela i vidikovci" },
    icon: "truck", image: "/activities/atv-safari.jpg",
    interests: ["nature_hiking", "adrenaline", "photography"], ideals: ["nature", "adventure"], intensity: 1,
    kids: true,
    synonyms: ["jeep", "4x4", "mountain jeep", "off road tour", "hiking", "mosor", "biokovo", "kozjak", "trek"],
  }),
  T({
    key: "museum_tour", category: "land",
    label: { en: "Museum & gallery tour", hr: "Muzeji i galerije" },
    blurb: { en: "Expert-led art and history visits", hr: "Umjetnost i povijest uz stručnog vodiča" },
    icon: "landmark",
    interests: ["history"], ideals: ["culture"], intensity: 0,
    kids: true,
    synonyms: ["museum", "gallery", "art", "culture"],
  }),
  T({
    key: "photo_tour", category: "land",
    label: { en: "Photography tour", hr: "Foto tura" },
    blurb: { en: "The best viewpoints at the best light", hr: "Najljepši vidikovci u najboljem svjetlu" },
    icon: "camera",
    interests: ["photography", "nature_hiking"], ideals: ["culture", "nature"], intensity: 1,
    kids: true, evening: true,
    synonyms: ["photo", "photography", "lens", "capture"],
  }),
  T({
    key: "ethno_village", category: "land",
    label: { en: "Ethno village visit", hr: "Posjet etno selu" },
    blurb: { en: "Traditional rural life and home cooking", hr: "Tradicionalni život i domaća kuhinja" },
    icon: "home",
    interests: ["history", "food_wine"], ideals: ["culture", "food_wine"], intensity: 0,
    kids: true,
    synonyms: ["ethno", "village", "rural", "heritage village"],
  }),

  // ── Nightlife ─────────────────────────────────────────────────────────────
  T({
    key: "vip_club", category: "nightlife",
    label: { en: "VIP club table", hr: "VIP stol u klubu" },
    blurb: { en: "Table reservations in top clubs", hr: "Rezervacija stola u najboljim klubovima" },
    icon: "sparkles",
    interests: ["nightlife"], ideals: ["nightlife"], intensity: 1,
    kids: false, evening: true,
    synonyms: ["vip", "club", "nightclub", "table"],
  }),
  T({
    key: "pub_crawl", category: "nightlife",
    label: { en: "Pub crawl", hr: "Pub crawl" },
    blurb: { en: "Guided bar hopping with new friends", hr: "Obilazak barova s vodičem i novim prijateljima" },
    icon: "beer",
    interests: ["nightlife"], ideals: ["nightlife"], intensity: 1,
    kids: false, evening: true,
    synonyms: ["pub crawl", "bar crawl", "bar hopping", "pub"],
  }),
  T({
    key: "party_boat", category: "nightlife",
    label: { en: "Party boat", hr: "Party brod" },
    blurb: { en: "Night cruise with DJ and open bar", hr: "Noćna plovidba uz DJ-a" },
    icon: "music",
    interests: ["nightlife", "boat_islands"], ideals: ["nightlife"], intensity: 1,
    water: true, kids: false, evening: true,
    synonyms: ["party boat", "boat party", "floating club", "night cruise"],
  }),
  T({
    key: "cocktail_bar", category: "nightlife",
    label: { en: "Cocktail experience", hr: "Koktel iskustvo" },
    blurb: { en: "Mixology class and tastings", hr: "Radionica miksanja i kušanje" },
    icon: "martini",
    interests: ["nightlife", "food_wine"], ideals: ["nightlife", "food_wine"], intensity: 0,
    kids: false, evening: true,
    synonyms: ["cocktail", "mixology", "bar"],
  }),
  T({
    key: "casino_night", category: "nightlife",
    label: { en: "Casino night", hr: "Večer u kasinu" },
    blurb: { en: "Premium casino entry and tables", hr: "Ulaz i stolovi u kasinu" },
    icon: "dice",
    interests: ["nightlife"], ideals: ["nightlife"], intensity: 0,
    kids: false, evening: true,
    synonyms: ["casino", "poker", "lucky"],
  }),
  T({
    key: "live_music", category: "nightlife",
    label: { en: "Live music & concerts", hr: "Glazba uživo i koncerti" },
    blurb: { en: "Concerts, festivals and terrace gigs", hr: "Koncerti, festivali i svirke na terasama" },
    icon: "music",
    interests: ["nightlife"], ideals: ["nightlife", "culture"], intensity: 0,
    kids: true, evening: true,
    synonyms: ["live music", "concert", "festival", "gig", "stage"],
  }),
  T({
    key: "beach_club", category: "nightlife",
    label: { en: "Beach club party", hr: "Beach club zabava" },
    blurb: { en: "Day-to-night beachfront events", hr: "Zabave na plaži od dana do noći" },
    icon: "palmtree",
    interests: ["nightlife", "relax"], ideals: ["nightlife", "relax_sea"], intensity: 0,
    water: true, kids: false, evening: true,
    synonyms: ["beach club", "beach party", "beach bar"],
  }),
  T({
    key: "folklore_evening", category: "nightlife",
    label: { en: "Klapa & folklore evening", hr: "Klapa i folklorna večer" },
    blurb: { en: "Traditional a cappella singing and dance", hr: "Tradicionalno pjevanje i ples" },
    icon: "music",
    interests: ["history", "nightlife"], ideals: ["culture"], intensity: 0,
    kids: true, evening: true,
    synonyms: ["folklore", "klapa", "traditional", "folk"],
  }),
  T({
    key: "open_air_cinema", category: "nightlife",
    label: { en: "Open-air cinema", hr: "Kino na otvorenom" },
    blurb: { en: "Movies under the stars", hr: "Filmovi pod zvijezdama" },
    icon: "film",
    interests: ["relax"], ideals: ["culture", "relax_sea"], intensity: 0,
    kids: true, evening: true,
    synonyms: ["cinema", "movie", "open air"],
  }),
  T({
    key: "wine_jazz", category: "nightlife",
    label: { en: "Wine & jazz night", hr: "Vino i jazz večer" },
    blurb: { en: "Relaxed evening with local wines and live jazz", hr: "Opuštena večer uz vino i jazz" },
    icon: "wine",
    interests: ["food_wine", "nightlife", "relax"], ideals: ["food_wine", "nightlife"], intensity: 0,
    kids: false, evening: true,
    synonyms: ["jazz", "wine & jazz", "wine and jazz", "vine notes"],
  }),

  // ── Transport & rentals ───────────────────────────────────────────────────
  T({
    key: "airport_transfer", category: "transport",
    label: { en: "Airport transfer", hr: "Transfer s aerodroma" },
    blurb: { en: "Private door-to-door transfer", hr: "Privatni prijevoz od vrata do vrata" },
    icon: "plane", utility: true,
    interests: [], ideals: [], intensity: 0, kids: true,
    synonyms: ["airport", "transfer", "shuttle", "aerodrom"],
  }),
  T({
    key: "speedboat_taxi", category: "transport",
    label: { en: "Speedboat taxi", hr: "Brodski taksi" },
    blurb: { en: "Fast point-to-point rides to the islands", hr: "Brza vožnja do otoka" },
    icon: "ship", utility: true,
    interests: ["boat_islands"], ideals: [], intensity: 1, water: true, speed: true, kids: true,
    synonyms: ["taxi", "sea taxi", "water taxi", "boat cab", "ferry", "fast ferry"],
  }),
  T({
    key: "boat_rental_no_license", category: "transport",
    label: { en: "Boat rental (no licence)", hr: "Najam brodice bez dozvole" },
    blurb: { en: "Small 5 hp boats to explore coves yourself", hr: "Male brodice od 5 KS za samostalno istraživanje" },
    icon: "sailboat",
    interests: ["boat_islands", "relax"], ideals: ["relax_sea"], intensity: 0, water: true, kids: true,
    synonyms: ["no license", "no licence", "boat rental", "rent a boat", "self drive boat"],
  }),
  T({
    key: "car_rental", category: "transport",
    label: { en: "Car rental", hr: "Najam automobila" },
    blurb: { en: "Economy to premium cars", hr: "Od ekonomičnih do premium vozila" },
    icon: "car", utility: true,
    interests: [], ideals: [], intensity: 0, kids: true,
    synonyms: ["car rental", "rent a car", "rent-a-car", "rent"],
  }),
  T({
    key: "luxury_car", category: "transport",
    label: { en: "Luxury car hire", hr: "Najam luksuznog auta" },
    blurb: { en: "Convertibles and sports cars", hr: "Kabrioleti i sportski automobili" },
    icon: "car", utility: true,
    interests: [], ideals: [], intensity: 0, speed: true, kids: false,
    synonyms: ["luxury car", "sports car", "prestige", "luxury motors", "dream drive"],
  }),
  T({
    key: "chauffeur", category: "transport",
    label: { en: "Chauffeur service", hr: "Vozač s automobilom" },
    blurb: { en: "Premium car with a professional driver", hr: "Premium vozilo s profesionalnim vozačem" },
    icon: "car", utility: true,
    interests: [], ideals: [], intensity: 0, kids: true,
    synonyms: ["chauffeur", "driver", "vip transfer", "executive", "luxury ride"],
  }),
  T({
    key: "van_rental", category: "transport",
    label: { en: "Group van", hr: "Kombi za grupe" },
    blurb: { en: "Vans for groups and events", hr: "Kombiji za grupe i događaje" },
    icon: "bus", utility: true,
    interests: [], ideals: [], intensity: 0, kids: true,
    synonyms: ["van", "minibus", "group transport"],
  }),
  T({
    key: "scooter_rental", category: "transport",
    label: { en: "Scooter & moto rental", hr: "Najam skutera i motora" },
    blurb: { en: "Mopeds and motorbikes", hr: "Skuteri i motori" },
    icon: "bike", utility: true,
    interests: ["adrenaline"], ideals: [], intensity: 1, speed: true, kids: false,
    synonyms: ["scooter", "moto", "motorbike", "vespa", "two wheels"],
  }),
  T({
    key: "bike_rental", category: "transport",
    label: { en: "Bike & e-bike rental", hr: "Najam bicikla i e-bicikla" },
    blurb: { en: "Explore Marjan and the coast on two wheels", hr: "Marjan i obala na dva kotača" },
    icon: "bike",
    interests: ["nature_hiking"], ideals: ["nature"], intensity: 1, kids: true,
    synonyms: ["bike", "bicycle", "e-bike", "ebike", "cycle", "pedal", "e-ride", "e-scooter"],
  }),
  T({
    key: "quad_atv", category: "transport",
    label: { en: "Quad / ATV rental", hr: "Najam quada / ATV-a" },
    blurb: { en: "Rugged four-wheelers for the hills", hr: "Četverokotači za brda" },
    icon: "truck", image: "/activities/atv-safari.jpg",
    interests: ["adrenaline", "nature_hiking"], ideals: ["adventure"], intensity: 2, speed: true, kids: false,
    synonyms: ["quad", "atv", "four wheeler"],
  }),
];

const TYPE_MAP = new Map(TYPES.map((t) => [t.key, t]));
export const TYPE_KEYS = TYPES.map((t) => t.key);

export function getType(key: string | null | undefined): ActivityType | undefined {
  return key ? TYPE_MAP.get(key) : undefined;
}

export function getCategory(key: string): Category | undefined {
  return CATEGORIES.find((c) => c.key === key);
}

export function typesInCategory(category: CategoryKey): ActivityType[] {
  return TYPES.filter((t) => t.category === category);
}

export function typeLabel(key: string, lang: Lang): string {
  return getType(key)?.label[lang] ?? key;
}

/** Map a legacy free-text activity name (old sheets) onto a type key. */
export function guessTypeKey(...texts: (string | undefined)[]): string | null {
  const hay = texts.filter(Boolean).join(" | ").toLowerCase();
  if (!hay.trim()) return null;
  let best: { key: string; score: number } | null = null;
  for (const t of TYPES) {
    for (const s of [t.label.en.toLowerCase(), ...t.synonyms]) {
      if (s && hay.includes(s)) {
        const score = s.length;
        if (!best || score > best.score) best = { key: t.key, score };
      }
    }
  }
  return best?.key ?? null;
}

/** Category order + types for the menu, with boat-tour variants grouped. */
export function menuFor(category: CategoryKey): Array<{ kind: "type"; key: string } | { kind: "group"; key: string; types: string[] }> {
  const out: Array<{ kind: "type"; key: string } | { kind: "group"; key: string; types: string[] }> = [];
  const seenGroups = new Set<string>();
  for (const t of typesInCategory(category)) {
    if (t.group) {
      if (seenGroups.has(t.group)) continue;
      seenGroups.add(t.group);
      out.push({ kind: "group", key: t.group, types: TYPES.filter((x) => x.group === t.group).map((x) => x.key) });
    } else {
      out.push({ kind: "type", key: t.key });
    }
  }
  return out;
}

/** Areas a landlord QR link may carry (`?location=`). Used for proximity ranking. */
export const AREAS: Record<string, { label: string; near: string[] }> = {
  split: { label: "Split", near: ["split", "stobreč", "stobrec", "podstrana", "solin", "klis", "žrnovnica"] },
  trogir: { label: "Trogir & Čiovo", near: ["trogir", "čiovo", "ciovo", "seget", "okrug", "slatine"] },
  kastela: { label: "Kaštela", near: ["kaštela", "kastela", "kaštel"] },
  omis: { label: "Omiš", near: ["omiš", "omis", "duće", "duce", "podašpilje"] },
  makarska: { label: "Makarska riviera", near: ["makarska", "brela", "baška voda", "baska voda", "tučepi", "tucepi", "podgora", "živogošće"] },
  islands: { label: "Islands (Brač, Hvar, Šolta, Vis)", near: ["bol", "supetar", "hvar", "jelsa", "šolta", "solta", "vis", "komiža", "postira", "sutivan"] },
  other: { label: "Elsewhere in Dalmatia", near: [] },
};

export function normalizeArea(input: string | null | undefined): string | null {
  if (!input) return null;
  const s = input.toLowerCase().trim();
  if (AREAS[s]) return s;
  for (const [key, a] of Object.entries(AREAS)) if (a.near.some((n) => s.includes(n))) return key;
  return null;
}

export function areaOfCity(city: string): string | null {
  return normalizeArea(city);
}
