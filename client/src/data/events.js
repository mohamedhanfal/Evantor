export const events = [
  {
    id: "1",
    title: "Tech Summit 2026",
    date: "2026-04-15",
    time: "09:00",
    location: "Convention Center, Colombo",
    category: "Technology",
    price: 2500,
    image: "/images/Tech Summit 2026.jpg",
    description:
      "Join industry leaders for keynotes, workshops, and networking. Topics include AI, cloud, and product design.",
    ticketTiers: [
      { name: "Standard", price: 2500, maxPerOrder: 5 },
      { name: "VIP", price: 7500, maxPerOrder: 2 },
      { name: "Workshop Pass", price: 5000, maxPerOrder: 1 },
    ],
  },
  {
    id: "2",
    title: "Jazz Under the Stars",
    date: "2026-03-28",
    time: "19:00",
    location: "Galle Face Green",
    category: "Music",
    price: 1500,
    image: "/images/Jazz Under the Stars.jpg",
    description:
      "An evening of live jazz with local and international artists. Bring a blanket and enjoy the sea breeze.",
    ticketTiers: [
      { name: "General Admission", price: 1500, maxPerOrder: 6 },
      { name: "Premium Seating", price: 3500, maxPerOrder: 4 },
    ],
  },
  {
    id: "3",
    title: "Startup Pitch Night",
    date: "2026-04-02",
    time: "18:30",
    location: "Innovation Hub, Colombo 03",
    category: "Business",
    price: 0,
    image: "/images/Startup Pitch Night.jpg",
    description:
      "Watch early-stage startups pitch to investors. Free entry with registration.",
    ticketTiers: [{ name: "Free Entry", price: 0, maxPerOrder: 2 }],
  },
  {
    id: "4",
    title: "Yoga & Wellness Festival",
    date: "2026-04-20",
    time: "06:00",
    location: "Viharamahadevi Park",
    category: "Wellness",
    price: 1200,
    image: "/images/Yoga & Wellness Festival.jpg",
    description:
      "Morning sessions of yoga, meditation, and wellness talks. All levels welcome.",
    ticketTiers: [
      { name: "Day Pass", price: 1200, maxPerOrder: 4 },
      { name: "Weekend Pass", price: 2000, maxPerOrder: 2 },
    ],
  },
  {
    id: "5",
    title: "Food & Wine Expo",
    date: "2026-04-10",
    time: "11:00",
    location: "BMICH, Colombo",
    category: "Food & Drink",
    price: 2000,
    image: "/images/Food & Wine Expo.jpg",
    description:
      "Taste local and international cuisines, paired with curated wines. Chef demos and live music.",
    ticketTiers: [
      { name: "General", price: 2000, maxPerOrder: 4 },
      { name: "Tasting VIP", price: 5000, maxPerOrder: 2 },
    ],
  },
  {
    id: "6",
    title: "Design Conference",
    date: "2026-04-25",
    time: "08:30",
    location: "Jetwing Colombo Seven",
    category: "Design",
    price: 4000,
    image: "/images/Design Conference.jpg",
    description:
      "UX, UI, and product design talks. Hands-on workshops and portfolio reviews.",
    ticketTiers: [
      { name: "Conference", price: 4000, maxPerOrder: 3 },
      { name: "Conference + Workshop", price: 8000, maxPerOrder: 1 },
    ],
  },
];
