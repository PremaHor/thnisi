/** Příloha u nabídky (PDF nebo obrázek) — URL z úložiště nebo lokální náhled. */
export type OfferAttachment = {
  name: string;
  url: string;
};

/** Veřejná data nabídek pro Objevuj / karty / detail. */
export type BarterOfferPublic = {
  id: string;
  title: string;
  description: string;
  /** Co hledá nabízející na oplátku (orientačně). */
  wantsInReturn: string;
  category: string;
  location: string;
  /** Volitelné soubory (např. PDF katalog) vedle galerie fotek. */
  attachments?: OfferAttachment[];
  /** Zeměpisná šířka místa předání/nabídky (WGS-84) */
  lat?: number;
  /** Zeměpisná délka místa předání/nabídky (WGS-84) */
  lng?: number;
  /** Nabídka je na dálku — neváže se na konkrétní místo */
  isRemote?: boolean;
  image: string;
  images: string[];
  tags: string[];
  /** Klíč pro agregované hodnocení (s ratingsStore) */
  sellerId: string;
  seller: {
    name: string;
    avatar: string;
    bio: string;
    completedTrades: number;
  };
};

export const BARTER_OFFERS: BarterOfferPublic[] = [
  {
    id: "1",
    sellerId: "jana-k",
    title: "Čerstvá bio zelenina",
    description: "Pěstuji bio zeleninu na zahradě a mám letos přebytek.",
    wantsInReturn:
      "Jídlo (zavařeniny, chléb) nebo pár hodin výměnou za běžné práce u mě na zahradě — třeba sečení trávy, hrabání listí. Vše domluvou.",
    category: "Jídlo",
    location: "Praha 3",
    lat: 50.0780,
    lng: 14.4656,
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800",
    images: [
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800",
      "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=800",
    ],
    tags: ["Bio", "Čerstvé", "Sezónní"],
    seller: {
      name: "Jana K.",
      avatar: "",
      bio: "Zahradnice a pekařka v jednom",
      completedTrades: 12,
    },
  },
  {
    id: "2",
    sellerId: "petr-m",
    title: "Tvorba webů a design",
    description: "Profesionální vývoj webů a design pro vaši firmu.",
    wantsInReturn:
      "Služby výměnou (focení, copywriting, lekce kytary…) nebo kvalitní jídlo / ruční produkt — napište, co můžete nabídnout.",
    category: "Služby",
    location: "Na dálku",
    isRemote: true,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
    images: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
    ],
    tags: ["Web", "Design", "Dálkově"],
    seller: {
      name: "Petr M.",
      avatar: "",
      bio: "Vývojář a designér",
      completedTrades: 28,
    },
  },
  {
    id: "3",
    sellerId: "martin-s",
    title: "iPhone 13 Pro",
    description: "iPhone 13 Pro ve skvělém stavu se vším příslušenstvím.",
    wantsInReturn: "Hodí se výměna za jinou elektroniku, sportovní vybavení, nebo rozumnou kombinaci služby + drobnost.",
    category: "Elektronika",
    location: "Brno",
    lat: 49.1951,
    lng: 16.6068,
    image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800",
    images: ["https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800"],
    tags: ["Mobil", "Apple"],
    seller: { name: "Martin S.", avatar: "", bio: "Technologie a hledání férové směny", completedTrades: 5 },
  },
  {
    id: "4",
    sellerId: "eva-n",
    title: "Domácí chléb a pečivo",
    description: "Čerstvé pečivo každý den z bio surovin.",
    wantsInReturn: "Mléčné výrobky, ovoce ze zahrady, nebo třeba drobnou výpomoc v bytě / drobnou opravu.",
    category: "Jídlo",
    location: "Praha 5",
    lat: 50.0699,
    lng: 14.3990,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
    images: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800"],
    tags: ["Pečivo", "Domácí"],
    seller: { name: "Eva N.", avatar: "", bio: "Pekařka", completedTrades: 19 },
  },
  {
    id: "5",
    sellerId: "jakub-v",
    title: "Lekce kytary",
    description: "Naučte se kytaru od zkušeného muzikanta. Všechny úrovně.",
    wantsInReturn: "Hodina z jiné dovednosti (jazyk, vaření…), ošacené hudební vybavení, nebo domluvené drobné služby.",
    category: "Služby",
    location: "Ostrava",
    lat: 49.8209,
    lng: 18.2625,
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800",
    images: ["https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800"],
    tags: ["Hudba", "Kytara"],
    seller: { name: "Jakub V.", avatar: "", bio: "Muzikant", completedTrades: 7 },
  },
  {
    id: "6",
    sellerId: "tomas-l",
    title: "Vintage vinylové desky",
    description: "Sbírka klasického rocku a jazzu z 70.–80. let.",
    wantsInReturn: "Hledám jiné desky, knihy o hudbě, nebo zajímavé věci k výměně — individuálně.",
    category: "Ostatní",
    location: "Praha 1",
    lat: 50.0875,
    lng: 14.4213,
    image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800",
    images: ["https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800"],
    tags: ["Vinyly", "Hudba"],
    seller: { name: "Tomáš L.", avatar: "", bio: "Kolekcionář", completedTrades: 22 },
  },
  {
    id: "7",
    sellerId: "marie-p",
    title: "Čerstvá vejce z farmy",
    description: "Vejce z volného chovu z mé farmy. Možnost vyzvednutí denně.",
    wantsInReturn: "Krmivo pro drobné chovy, pytle brambor, nebo pomoc na farmě na pár hodin dle dohody.",
    category: "Jídlo",
    location: "Kladno",
    lat: 50.1437,
    lng: 14.1044,
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800",
    images: ["https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800"],
    tags: ["Farma", "Vejce"],
    seller: { name: "Marie P.", avatar: "", bio: "Farmaření", completedTrades: 9 },
  },
  {
    id: "8",
    sellerId: "david-k",
    title: "Focení – portréty a akce",
    description: "Profesionální focení akcí, portrétů nebo produktů.",
    wantsInReturn: "Grafická spolupráce, tisk, catering na akce, nebo třeba zahradní úpravy u mě doma.",
    category: "Služby",
    location: "Praha 6",
    lat: 50.1025,
    lng: 14.3872,
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800",
    images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800"],
    tags: ["Fotografie", "Akce"],
    seller: { name: "David K.", avatar: "", bio: "Fotograf", completedTrades: 16 },
  },
];

export function getBarterOfferById(id: string | undefined): BarterOfferPublic | null {
  if (!id) return null;
  return BARTER_OFFERS.find((o) => o.id === id) ?? null;
}

export type SwipeCardOffer = Pick<
  BarterOfferPublic,
  "id" | "sellerId" | "title" | "description" | "wantsInReturn" | "category" | "location" | "image" | "lat" | "lng" | "isRemote"
> & { seller: { name: string; avatar: string } };

export const SWIPE_OFFERS: SwipeCardOffer[] = BARTER_OFFERS.map((o) => ({
  id: o.id,
  sellerId: o.sellerId,
  title: o.title,
  description: o.description,
  wantsInReturn: o.wantsInReturn,
  category: o.category,
  location: o.location,
  lat: o.lat,
  lng: o.lng,
  isRemote: o.isRemote,
  image: o.image,
  seller: { name: o.seller.name, avatar: o.seller.avatar },
}));
