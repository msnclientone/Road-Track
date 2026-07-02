export type LeadStatus = "New" | "Contacted" | "Confirmed" | "Cancelled";

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
export const emergencyPhone = "+91 94808 56097";

export const heroImage = "/images/kapu-beach.jpg";

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


