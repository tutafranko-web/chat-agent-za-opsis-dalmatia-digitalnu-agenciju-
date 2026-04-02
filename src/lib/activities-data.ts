export interface Activity {
  name: string;
  nameHr: string;
  description: string;
}

export interface Category {
  name: string;
  nameHr: string;
  emoji: string;
  activities: Activity[];
}

export const CATEGORIES: Category[] = [
  {
    name: "Nautical & Water Activities",
    nameHr: "Nautičke i vodene aktivnosti",
    emoji: "🌊",
    activities: [
      {
        name: "Boat Tours",
        nameHr: "Izleti brodom",
        description: "Island hopping itineraries, private tours, and Blue Cave visits",
      },
      {
        name: "Scuba Diving",
        nameHr: "Ronjenje",
        description: "Discover dives and certified excursions along the Dalmatian coast",
      },
      {
        name: "Sea Kayaking",
        nameHr: "Morski kajak",
        description: "Paddling around city walls, caves, and nearby islands",
      },
      {
        name: "Stand Up Paddling (SUP)",
        nameHr: "SUP daske",
        description: "Board rentals and guided sunset paddling tours",
      },
      {
        name: "Parasailing",
        nameHr: "Parasailing",
        description: "Panoramic flights above the Adriatic Sea",
      },
      {
        name: "Jet Ski Safari",
        nameHr: "Jet ski safari",
        description: "Guided high-speed coastal tours along the Riviera",
      },
      {
        name: "Sunset Cruises",
        nameHr: "Sunset krstarenja",
        description: "Relaxing evening boat rides with drinks and music",
      },
      {
        name: "Fishing",
        nameHr: "Ribolov",
        description: "Deep-sea tuna and swordfish fishing trips",
      },
      {
        name: "Sailing School",
        nameHr: "Škola jedrenja",
        description: "Introductory courses and day sailing for all levels",
      },
      {
        name: "Wakeboarding",
        nameHr: "Wakeboarding",
        description: "Cable and boat wakeboarding sessions for beginners and pros",
      },
    ],
  },
  {
    name: "Adrenaline & Adventure",
    nameHr: "Adrenalin i avantura",
    emoji: "🏍️",
    activities: [
      {
        name: "White Water Rafting",
        nameHr: "Rafting",
        description: "River rapids adventure on the Cetina River",
      },
      {
        name: "Zipline",
        nameHr: "Zipline",
        description: "High-speed canyon crossing over the Cetina gorge",
      },
      {
        name: "Canyoning",
        nameHr: "Kanjoning",
        description: "Hiking, sliding, and jumping through river canyons",
      },
      {
        name: "Skydiving",
        nameHr: "Padobranstvo",
        description: "Tandem jumps with breathtaking coastal views",
      },
      {
        name: "Rock Climbing",
        nameHr: "Penjanje po stijenama",
        description: "Guided climbs on natural cliffs near Split and Omiš",
      },
      {
        name: "Bungee Jumping",
        nameHr: "Bungee jumping",
        description: "Bridge jumps for the ultimate adrenaline rush",
      },
      {
        name: "Off-road Buggy Safari",
        nameHr: "Buggy safari",
        description: "Rugged terrain exploration through Dalmatian hinterland",
      },
      {
        name: "Paintball Battles",
        nameHr: "Paintball",
        description: "Tactical team games set in natural surroundings",
      },
      {
        name: "Speleology",
        nameHr: "Speleologija",
        description: "Exploring underground cave systems with expert guides",
      },
    ],
  },
  {
    name: "Transportation Rentals",
    nameHr: "Prijevoz i najam",
    emoji: "🚗",
    activities: [
      {
        name: "Car Rental",
        nameHr: "Najam automobila",
        description: "Economy to luxury vehicle fleet for every budget",
      },
      {
        name: "Scooter & Moto Rental",
        nameHr: "Najam skutera i motora",
        description: "Mopeds and high-cc motorcycles for flexible transport",
      },
      {
        name: "Speedboat Taxi",
        nameHr: "Speedboat taxi",
        description: "Fast inter-island water transport on demand",
      },
      {
        name: "Bicycle & E-bike Rental",
        nameHr: "Najam bicikala i e-bicikala",
        description: "Standard and electric bikes for city and coast rides",
      },
      {
        name: "Boat Rental – No License",
        nameHr: "Najam broda bez dozvole",
        description: "Small 5hp boats for self-drive coastal exploration",
      },
      {
        name: "Chauffeur Service",
        nameHr: "Usluga šofera",
        description: "Luxury car with professional driver for any occasion",
      },
      {
        name: "Quads & ATV Rental",
        nameHr: "Najam quadova i ATV-a",
        description: "Rugged 4-wheelers for off-road exploration",
      },
      {
        name: "Luxury Van Rental",
        nameHr: "Najam luksuznog kombija",
        description: "Group transport for events, tours, or transfers",
      },
      {
        name: "Luxury Car Hire",
        nameHr: "Najam luksuznog automobila",
        description: "Convertibles and sports cars for a premium experience",
      },
      {
        name: "Airport Transfers",
        nameHr: "Aerodromski transferi",
        description: "Private door-to-door pickup and drop-off service",
      },
    ],
  },
  {
    name: "Land Tours & Guided Experiences",
    nameHr: "Kopnene ture i vođena iskustva",
    emoji: "🏛️",
    activities: [
      {
        name: "Walking City Tours",
        nameHr: "Pješačke ture gradom",
        description: "Historical and cultural heritage walks through Split",
      },
      {
        name: "Wine Tasting Tours",
        nameHr: "Ture degustacije vina",
        description: "Visits to local boutique wineries in Dalmatian hinterland",
      },
      {
        name: "National Park Trips",
        nameHr: "Izleti u nacionalne parkove",
        description: "Day tours to Krka, Plitvice, and other natural wonders",
      },
      {
        name: "Olive Oil Tasting",
        nameHr: "Degustacija maslinovog ulja",
        description: "Traditional grove visits with expert-led tasting sessions",
      },
      {
        name: "Gastronomy Classes",
        nameHr: "Gastronomski tečajevi",
        description: "Learn to cook traditional Dalmatian specialties",
      },
      {
        name: "Game of Thrones Tours",
        nameHr: "Game of Thrones ture",
        description: "Visit iconic filming locations in Split and surroundings",
      },
      {
        name: "Jeep Safari",
        nameHr: "Jeep safari",
        description: "Exploring mountains and hinterland villages by 4x4",
      },
      {
        name: "Museum & Gallery Tours",
        nameHr: "Ture muzeja i galerija",
        description: "Expert-led art and history walks through Split's museums",
      },
      {
        name: "Photography Tours",
        nameHr: "Fotografske ture",
        description: "Guided trips to the most photogenic spots in Dalmatia",
      },
      {
        name: "Ethno Village Visits",
        nameHr: "Posjeti etno selima",
        description: "Experience traditional rural life and Dalmatian customs",
      },
    ],
  },
  {
    name: "Nightlife & Entertainment",
    nameHr: "Noćni život i zabava",
    emoji: "🎶",
    activities: [
      {
        name: "VIP Club Booking",
        nameHr: "VIP rezervacija klubova",
        description: "Table reservations in Split's top nightclubs",
      },
      {
        name: "Pub Crawl",
        nameHr: "Pub crawl",
        description: "Guided social bar hopping experience through the old town",
      },
      {
        name: "Party Boat",
        nameHr: "Party brod",
        description: "Night cruises with DJs, open bar, and sea views",
      },
      {
        name: "Cocktail Bar Experiences",
        nameHr: "Koktail bar iskustva",
        description: "Mixology tours and curated cocktail tastings",
      },
      {
        name: "Casino Nights",
        nameHr: "Casino večeri",
        description: "Access to premium gambling venues and entertainment",
      },
      {
        name: "Live Music Events",
        nameHr: "Koncerti i glazbeni eventi",
        description: "Concerts, festivals, and terrace gigs across Split",
      },
      {
        name: "Beach Club Parties",
        nameHr: "Beach club zabave",
        description: "Day-to-night beachfront events with music and drinks",
      },
      {
        name: "Folklore Evenings",
        nameHr: "Folklorne večeri",
        description: "Traditional Croatian music and dance performances",
      },
      {
        name: "Open Air Cinema",
        nameHr: "Kino na otvorenom",
        description: "Movie screenings under the stars in scenic locations",
      },
      {
        name: "Wine & Jazz Nights",
        nameHr: "Vino i jazz večeri",
        description: "Sophisticated evening entertainment with live jazz",
      },
    ],
  },
];

/** Flat list of all activity names across all categories */
export function getAllActivityNames(): string[] {
  return CATEGORIES.flatMap((cat) => cat.activities.map((a) => a.name));
}

/** Find a category by its English name */
export function findCategoryByName(name: string): Category | undefined {
  return CATEGORIES.find(
    (cat) => cat.name.toLowerCase() === name.toLowerCase()
  );
}

/** Total number of activities across all categories */
export const TOTAL_ACTIVITIES = CATEGORIES.reduce(
  (sum, cat) => sum + cat.activities.length,
  0
);
