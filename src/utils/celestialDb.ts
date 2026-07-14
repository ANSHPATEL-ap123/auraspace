export interface CelestialNode {
  id: string;
  name: string;
  scientificName?: string; // The question mark makes it optional
  category: "Solar System" | "Deep Space" | "Stars" | "Constellations" | "Dynamic Bodies";
  ra: number;
  dec: number;
  magnitude: number;
  distance: string;
  constellation: string;
  description: string;
  bestViewingMonths: string;
  idealFilter?: string;
  type: string;
}
export const CELESTIAL_CATALOG: CelestialNode[] = [
  // 1. Solar System
  {
    id: "moon",
    name: "The Moon",
    scientificName: "Luna",
    category: "Solar System",
    ra: 1.25,
    dec: 18.5,
    magnitude: -12.7,
    distance: "384,400 km",
    constellation: "Taurus",
    description: "Earth's sole natural satellite. Surface presents prominent craters, lava plains (maria), and high-contrast terminator mountain shadow reliefs.",
    bestViewingMonths: "Year-round",
    idealFilter: "ND / Moon Filter",
    type: "Natural Satellite"
  },
  {
    id: "jupiter",
    name: "Jupiter",
    scientificName: "Jupiter",
    category: "Solar System",
    ra: 3.14,
    dec: 12.8,
    magnitude: -2.8,
    distance: "588 million km",
    constellation: "Aries",
    description: "The largest planet in our solar system. Features iconic cloud belts, the Great Red Spot storm vortex, and four active Galilean moons.",
    bestViewingMonths: "August – December",
    idealFilter: "Color Contrast / Planetary Filter",
    type: "Gas Giant Planet"
  },
  {
    id: "mars",
    name: "Mars",
    scientificName: "Mars",
    category: "Solar System",
    ra: 4.82,
    dec: 23.4,
    magnitude: -1.2,
    distance: "225 million km",
    constellation: "Gemini",
    description: "The Red Planet. Exhibits prominent polar ice caps, rust-colored iron oxide sands, and Olympus Mons, the largest volcano in the solar system.",
    bestViewingMonths: "October – March",
    idealFilter: "Red Interference Filter",
    type: "Terrestrial Planet"
  },
  {
    id: "saturn",
    name: "Saturn",
    scientificName: "Saturn",
    category: "Solar System",
    ra: 5.92,
    dec: -10.2,
    magnitude: 0.6,
    distance: "1.2 billion km",
    constellation: "Aquarius",
    description: "The ringed wonder. Displays majestic ring bands (composed of water ice fragments) and a heavily pressurized gas atmosphere.",
    bestViewingMonths: "July – November",
    idealFilter: "Planetary / Polarizer Filter",
    type: "Gas Giant Planet"
  },
  {
    id: "venus",
    name: "Venus",
    scientificName: "Venus",
    category: "Solar System",
    ra: 0.82,
    dec: 4.5,
    magnitude: -4.4,
    distance: "41 million km",
    constellation: "Pisces",
    description: "The evening star. Enveloped in an incredibly dense, light-reflective carbon-dioxide cloud deck that causes runaway greenhouse effects.",
    bestViewingMonths: "Year-round",
    idealFilter: "Violet / Ultraviolet filter",
    type: "Terrestrial Planet"
  },

  // 2. Deep Space
  {
    id: "andromeda",
    name: "Andromeda Galaxy",
    scientificName: "Messier 31 / NGC 224",
    category: "Deep Space",
    ra: 0.74,
    dec: 41.26,
    magnitude: 3.4,
    distance: "2.537 million light years",
    constellation: "Andromeda",
    description: "A barred spiral galaxy and our nearest galactic neighbor. Containing nearly one trillion stars, it is slowly heading on a collision course with our Milky Way.",
    bestViewingMonths: "September – January",
    idealFilter: "Broadband Light Pollution Filter",
    type: "Spiral Galaxy"
  },
  {
    id: "orion-nebula",
    name: "Orion Nebula",
    scientificName: "Messier 42",
    category: "Deep Space",
    ra: 5.58,
    dec: -5.38,
    magnitude: 4.0,
    distance: "1,344 light years",
    constellation: "Orion",
    description: "An immense, active stellar nursery of glowing hydrogen, helium, and cosmic dust. Easily visible to the naked eye under the belt of Orion.",
    bestViewingMonths: "November – March",
    idealFilter: "Dual-Narrowband (H-Alpha / OIII) Filter",
    type: "Emission Nebula"
  },
  {
    id: "pleiades",
    name: "Pleiades Star Cluster",
    scientificName: "Messier 45",
    category: "Deep Space",
    ra: 3.78,
    dec: 24.1,
    magnitude: 1.6,
    distance: "444 light years",
    constellation: "Taurus",
    description: "Also known as the Seven Sisters. A young open cluster containing middle-aged, hot B-type blue stars surrounded by reflection nebulae.",
    bestViewingMonths: "October – April",
    idealFilter: "None (Luminance focus)",
    type: "Open Star Cluster"
  },
  {
    id: "ring-nebula",
    name: "Ring Nebula",
    scientificName: "Messier 57",
    category: "Deep Space",
    ra: 6.2,
    dec: 33.0,
    magnitude: 8.8,
    distance: "2,300 light years",
    constellation: "Lyra",
    description: "An archetypal planetary nebula formed when a dying red giant star ejected its outer envelope of ionized gas into the surrounding medium.",
    bestViewingMonths: "May – September",
    idealFilter: "OIII / H-Beta Filter",
    type: "Planetary Nebula"
  },

  // 3. Stars
  {
    id: "polaris",
    name: "Polaris",
    scientificName: "Alpha Ursae Minoris",
    category: "Stars",
    ra: 0.52,
    dec: 89.26,
    magnitude: 1.97,
    distance: "433 light years",
    constellation: "Ursa Minor",
    description: "The North Star. Positions itself almost perfectly directly above Earth's northern rotational pole axis, making it appear stationary in the sky.",
    bestViewingMonths: "Year-round (Northern Hemisphere)",
    idealFilter: "None",
    type: "Supergiant Star"
  },
  {
    id: "sirius",
    name: "Sirius",
    scientificName: "Alpha Canis Majoris",
    category: "Stars",
    ra: 6.75,
    dec: -16.7,
    magnitude: -1.46,
    distance: "8.6 light years",
    constellation: "Canis Major",
    description: "The brightest star in the night sky. Actually a binary star system consisting of a main-sequence star (Sirius A) and a faint white dwarf companion (Sirius B).",
    bestViewingMonths: "December – April",
    idealFilter: "Contrast Grid",
    type: "Binary System"
  },
  {
    id: "betelgeuse",
    name: "Betelgeuse",
    scientificName: "Alpha Orionis",
    category: "Stars",
    ra: 5.92,
    dec: 7.4,
    magnitude: 0.5,
    distance: "642 light years",
    constellation: "Orion",
    description: "An aging, colossal red supergiant star nearing the end of its life cycle. Expected to erupt as a spectacular supernova within astronomical timescales.",
    bestViewingMonths: "November – March",
    idealFilter: "Red Spectrum Enhancer",
    type: "Red Supergiant Star"
  },

  // 4. Constellations
  {
    id: "orion-const",
    name: "Orion",
    scientificName: "The Hunter",
    category: "Constellations",
    ra: 5.5,
    dec: 5.0,
    magnitude: 1.2,
    distance: "Varies",
    constellation: "Orion",
    description: "One of the most recognizable and prominent constellations. Easily mapped by the three bright stars of Orion's Belt.",
    bestViewingMonths: "Winter (Northern) / Summer (Southern)",
    idealFilter: "Star-Glow Softening Filter",
    type: "Constellation Group"
  },
  {
    id: "ursa-major",
    name: "Ursa Major",
    scientificName: "The Great Bear",
    category: "Constellations",
    ra: 11.5,
    dec: 55.0,
    magnitude: 2.0,
    distance: "Varies",
    constellation: "Ursa Major",
    description: "A major northern constellation containing the Big Dipper asterism, which is critically used to locate Polaris (The North Star).",
    bestViewingMonths: "Year-round",
    idealFilter: "None",
    type: "Constellation Group"
  },

  // 5. Dynamic Bodies
  {
    id: "iss",
    name: "International Space Station",
    scientificName: "Zarya / ISS",
    category: "Dynamic Bodies",
    ra: 2.1,
    dec: 35.0,
    magnitude: -3.8,
    distance: "420 km altitude",
    constellation: "Variable",
    description: "A habitable artificial satellite orbiting Earth. Reflects high sunlight, appearing as a blazing fast-moving star crossing the sky.",
    bestViewingMonths: "Year-round passes",
    idealFilter: "Fast Tracker ND Filter",
    type: "Low-Earth Orbit Spacecraft"
  }
];

// Helper to convert Right Ascension (RA) and Declination (Dec) to Cartesian coordinates on a celestial sphere
export function celestialToCartesian(ra: number, dec: number, radius: number = 20) {
  const decRad = (dec * Math.PI) / 180;
  
  // Cartesian coordinates on a sphere of specified radius
  const x = radius * Math.cos(decRad) * Math.cos(ra);
  const z = radius * Math.cos(decRad) * Math.sin(ra);
  const y = radius * Math.sin(decRad);
  
  return { x, y, z };
}
