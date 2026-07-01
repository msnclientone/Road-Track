export type LeadStatus = "New" | "Contacted" | "Confirmed" | "Cancelled";

export type Destination = {
  slug: string;
  name: string;
  region: string;
  heroImage: string;
  summary: string;
  bestTime: string;
  tripCostFrom: number;
  distanceFromUdupi: string;
  mapQuery: string;
  attractions: string[];
  idealFor: string[];
  weather: {
    label: string;
    temperature: string;
    note: string;
  };
};

export type Resort = {
  id: string;
  name: string;
  location: string;
  destinationSlug: string;
  image: string;
  priceFrom: number;
  rating: number;
  roomsAvailable: number;
  amenities: string[];
  owner: string;
  status: "Available" | "Few rooms" | "Sold out";
};

export type Vehicle = {
  id: string;
  name: string;
  type: "Sedan" | "SUV" | "Tempo Traveller" | "Mini Bus" | "Bus";
  image: string;
  seats: number;
  ratePerDay: number;
  driver: string;
  phone: string;
  available: boolean;
  packages: string[];
};

export type TourPackage = {
  id: string;
  title: string;
  days: string;
  destinationSlug: string;
  priceFrom: number;
  includes: string[];
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  place: string;
  date: string;
  people: number;
  status: LeadStatus;
  requirement: string;
  assignedTo: string;
  value: number;
};

export const roadTrackPhone =
  process.env.NEXT_PUBLIC_ROAD_TRACK_WHATSAPP ?? "919876543210";
export const emergencyPhone = "+91 98765 43210";

export const heroImage = "/images/kapu-beach.jpg";

export const destinations: Destination[] = [
  {
    slug: "udupi",
    name: "Udupi",
    region: "Temple city and coastal base",
    heroImage:
      "https://upload.wikimedia.org/wikipedia/commons/d/da/Udupi_Krishna_Temple.jpg",
    summary:
      "A practical base for temple visits, family stays, coastal food trails, and quick transfers to Malpe, Kapu, and St. Mary's Island.",
    bestTime: "October to March for beach plans; July to September for monsoon drives.",
    tripCostFrom: 5200,
    distanceFromUdupi: "0 km",
    mapQuery: "Udupi Karnataka tourist places",
    attractions: [
      "Sri Krishna Matha",
      "Manipal End Point",
      "Malpe Sea Walk",
      "Coastal food streets",
    ],
    idealFor: ["Families", "Pilgrimage", "Weekend plans"],
    weather: {
      label: "Coastal humid",
      temperature: "26-32 C",
      note: "Carry light cottons and plan beach visits around sunrise or sunset.",
    },
  },
  {
    slug: "malpe-beach",
    name: "Malpe Beach",
    region: "Beach, sea walk, island transfers",
    heroImage:
      "https://upload.wikimedia.org/wikipedia/commons/4/49/Malpe_Beach_2.jpg",
    summary:
      "A high-demand coastal stop for beach time, island boats, seafood, and short family getaways from Udupi city.",
    bestTime: "November to February for comfortable beach weather.",
    tripCostFrom: 6800,
    distanceFromUdupi: "6 km",
    mapQuery: "Malpe Beach Udupi directions",
    attractions: [
      "Sea Walk",
      "St. Mary's Island ferry point",
      "Fishing harbour",
      "Beach cafes",
    ],
    idealFor: ["Couples", "Families", "Beach trips"],
    weather: {
      label: "Breezy coast",
      temperature: "25-31 C",
      note: "Check ferry status before island plans during heavy rain.",
    },
  },
  {
    slug: "kapu-beach",
    name: "Kapu Beach",
    region: "Lighthouse and sunset coast",
    heroImage: "/images/kapu-beach.jpg",
    summary:
      "A premium sunset route with the lighthouse, clean beach views, and easy pairing with Udupi or Malpe stays.",
    bestTime: "October to March; evenings are the strongest slot.",
    tripCostFrom: 6200,
    distanceFromUdupi: "13 km",
    mapQuery: "Kapu Beach Lighthouse Udupi directions",
    attractions: [
      "Kapu Lighthouse",
      "Beach rocks",
      "Sunset point",
      "Local snack stalls",
    ],
    idealFor: ["Sunset drives", "Photography", "Short trips"],
    weather: {
      label: "Sea breeze",
      temperature: "25-32 C",
      note: "Lighthouse timings can vary, so confirm before starting.",
    },
  },
  {
    slug: "agumbe",
    name: "Agumbe",
    region: "Rainforest drive and viewpoints",
    heroImage:
      "https://upload.wikimedia.org/wikipedia/commons/7/7a/Agumbe_Ghat_Accidents.jpg",
    summary:
      "A Western Ghats route for mist, rainforest drives, viewpoints, waterfalls, and monsoon travel plans.",
    bestTime: "June to September for monsoon, November to January for clearer drives.",
    tripCostFrom: 9800,
    distanceFromUdupi: "55 km",
    mapQuery: "Agumbe sunset point from Udupi",
    attractions: [
      "Sunset Point",
      "Agumbe Ghat",
      "Rainforest trails",
      "Nearby waterfalls",
    ],
    idealFor: ["Trekking", "Monsoon travel", "Photographers"],
    weather: {
      label: "Wet rainforest",
      temperature: "20-27 C",
      note: "Use experienced drivers in monsoon and keep buffer time.",
    },
  },
];

export const resorts: Resort[] = [
  {
    id: "sea-shells",
    name: "Sea Shells Coastal Resort",
    location: "Malpe Beach Road",
    destinationSlug: "malpe-beach",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    priceFrom: 3600,
    rating: 4.7,
    roomsAvailable: 8,
    amenities: ["Pool", "Beach access", "Family rooms", "Breakfast"],
    owner: "Ramesh Shetty",
    status: "Available",
  },
  {
    id: "kapu-coral",
    name: "Kapu Coral Stay",
    location: "Near Kapu Lighthouse",
    destinationSlug: "kapu-beach",
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
    priceFrom: 2800,
    rating: 4.5,
    roomsAvailable: 3,
    amenities: ["Sea view", "Parking", "AC rooms", "Local food"],
    owner: "Nithin Rao",
    status: "Few rooms",
  },
  {
    id: "rainforest-courtyard",
    name: "Rainforest Courtyard",
    location: "Agumbe Ghat Road",
    destinationSlug: "agumbe",
    image:
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
    priceFrom: 4200,
    rating: 4.6,
    roomsAvailable: 5,
    amenities: ["Bonfire", "Trekking desk", "Meals", "Parking"],
    owner: "Meera Hegde",
    status: "Available",
  },
];

export const vehicles: Vehicle[] = [
  {
    id: "innova-crysta",
    name: "Innova Crysta with local driver",
    type: "SUV",
    image:
      "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80",
    seats: 6,
    ratePerDay: 4200,
    driver: "Praveen",
    phone: "+91 90000 11111",
    available: true,
    packages: ["Airport pickup", "Udupi local", "Agumbe day trip"],
  },
  {
    id: "tempo-12",
    name: "12 seater Tempo Traveller",
    type: "Tempo Traveller",
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
    seats: 12,
    ratePerDay: 6800,
    driver: "Faizal",
    phone: "+91 90000 22222",
    available: true,
    packages: ["College group", "Temple circuit", "Beach day"],
  },
  {
    id: "mini-bus-24",
    name: "24 seater mini bus",
    type: "Mini Bus",
    image:
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80",
    seats: 24,
    ratePerDay: 12500,
    driver: "Anand",
    phone: "+91 90000 33333",
    available: false,
    packages: ["School tours", "Wedding guests", "Corporate offsite"],
  },
];

export const tourPackages: TourPackage[] = [
  {
    id: "udupi-two-day",
    title: "2 Days Udupi Coastal Plan",
    days: "2D / 1N",
    destinationSlug: "udupi",
    priceFrom: 14900,
    includes: ["Pickup", "Resort stay", "Malpe and Kapu sightseeing", "Drop"],
  },
  {
    id: "malpe-family",
    title: "Malpe Family Beach Break",
    days: "1D",
    destinationSlug: "malpe-beach",
    priceFrom: 8200,
    includes: ["SUV", "Beach time", "Sea walk", "Callback coordination"],
  },
  {
    id: "agumbe-monsoon",
    title: "Agumbe Monsoon Drive",
    days: "1D",
    destinationSlug: "agumbe",
    priceFrom: 11200,
    includes: ["Experienced driver", "Viewpoints", "Route coordination", "Rain buffer"],
  },
];

export const leads: Lead[] = [
  {
    id: "LD-1048",
    name: "Ananya Rao",
    phone: "+91 99887 11001",
    email: "ananya@example.com",
    place: "Malpe Beach",
    date: "2026-06-18",
    people: 4,
    status: "New",
    requirement: "Family resort and Innova",
    assignedTo: "Road Track central",
    value: 18400,
  },
  {
    id: "LD-1047",
    name: "Rahul Nair",
    phone: "+91 99887 11002",
    email: "rahul@example.com",
    place: "Agumbe",
    date: "2026-06-20",
    people: 8,
    status: "Contacted",
    requirement: "Tempo traveller and rainforest route",
    assignedTo: "Faizal - Tempo 12",
    value: 22600,
  },
  {
    id: "LD-1046",
    name: "Kavya Hegde",
    phone: "+91 99887 11003",
    email: "kavya@example.com",
    place: "Kapu Beach",
    date: "2026-06-21",
    people: 2,
    status: "Confirmed",
    requirement: "Beach stay and sunset pickup",
    assignedTo: "Kapu Coral Stay",
    value: 9600,
  },
  {
    id: "LD-1045",
    name: "Sanjay Kumar",
    phone: "+91 99887 11004",
    email: "sanjay@example.com",
    place: "Udupi",
    date: "2026-06-24",
    people: 18,
    status: "Cancelled",
    requirement: "Mini bus for temple circuit",
    assignedTo: "Road Track central",
    value: 0,
  },
];

export const reviews = [
  {
    name: "Priya M.",
    rating: 5,
    text: "Road Track arranged a clean vehicle, beach stay, and callback updates without confusion.",
  },
  {
    name: "Harish B.",
    rating: 5,
    text: "The driver knew the Agumbe route well and helped us avoid a risky late drive.",
  },
  {
    name: "Sneha K.",
    rating: 4,
    text: "Good resort options around Malpe and fast WhatsApp response.",
  },
];

export const dashboardStats = [
  { label: "Open leads", value: "28", change: "+12%" },
  { label: "Confirmed value", value: "Rs. 3.8L", change: "+18%" },
  { label: "Partner response", value: "14 min", change: "-6 min" },
  { label: "Commission due", value: "Rs. 42K", change: "+9%" },
];

export function getDestination(slug: string) {
  return destinations.find((destination) => destination.slug === slug);
}

export function getNearbyResorts(destinationSlug: string) {
  return resorts.filter((resort) => resort.destinationSlug === destinationSlug);
}

export function getPackages(destinationSlug: string) {
  return tourPackages.filter((pack) => pack.destinationSlug === destinationSlug);
}
