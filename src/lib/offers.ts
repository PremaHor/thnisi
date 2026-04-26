import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export type OfferStatus = "active" | "paused" | "completed" | "deleted";

export interface OfferAttachment {
  name: string;
  url: string;
}

export interface BarterOfferCreateInput {
  title: string;
  description: string;
  wantsInReturn: string;
  category: string;
  location: string;
  lat?: number;
  lng?: number;
  isRemote: boolean;
  image: string;
  images: string[];
  attachments: OfferAttachment[];
  tags: string[];
  sellerId: string;
  sellerName?: string;
  sellerAvatar?: string;
}

export interface BarterOffer extends BarterOfferCreateInput {
  id: string;
  status: OfferStatus;
  viewCount: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

const OFFERS_COLLECTION = "offers";

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

function toOffer(id: string, data: Record<string, unknown>): BarterOffer {
  return {
    id,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    wantsInReturn: String(data.wantsInReturn ?? ""),
    category: String(data.category ?? ""),
    location: String(data.location ?? ""),
    lat: typeof data.lat === "number" ? data.lat : undefined,
    lng: typeof data.lng === "number" ? data.lng : undefined,
    isRemote: Boolean(data.isRemote),
    image: String(data.image ?? ""),
    images: Array.isArray(data.images) ? data.images.map((x) => String(x)) : [],
    attachments: Array.isArray(data.attachments)
      ? data.attachments
          .filter((x): x is { name?: unknown; url?: unknown } => Boolean(x && typeof x === "object"))
          .map((x) => ({ name: String(x.name ?? ""), url: String(x.url ?? "") }))
      : [],
    tags: Array.isArray(data.tags) ? data.tags.map((x) => String(x)) : [],
    sellerId: String(data.sellerId ?? ""),
    status: (data.status as OfferStatus) ?? "active",
    viewCount: typeof data.viewCount === "number" ? data.viewCount : 0,
    createdAt: (data.createdAt as Timestamp | null) ?? null,
    updatedAt: (data.updatedAt as Timestamp | null) ?? null,
  };
}

export async function createOffer(input: BarterOfferCreateInput): Promise<string> {
  const col = collection(db, OFFERS_COLLECTION);
  const { lat, lng, ...rest } = input;
  const payload: Record<string, unknown> = {
    ...rest,
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (typeof lat === "number") payload.lat = lat;
  if (typeof lng === "number") payload.lng = lng;
  const ref = await addDoc(col, payload);
  return ref.id;
}

export async function getActiveOffers(): Promise<BarterOffer[]> {
  const col = collection(db, OFFERS_COLLECTION);
  const q = query(col, where("status", "==", "active"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toOffer(d.id, d.data() as Record<string, unknown>));
}

export async function getOfferById(id: string): Promise<BarterOffer | null> {
  const ref = doc(db, OFFERS_COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return toOffer(snap.id, snap.data() as Record<string, unknown>);
}

export async function getOffersBySellerId(sellerId: string): Promise<BarterOffer[]> {
  const col = collection(db, OFFERS_COLLECTION);
  const q = query(col, where("sellerId", "==", sellerId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toOffer(d.id, d.data() as Record<string, unknown>));
}

export async function updateOffer(
  id: string,
  data: Partial<BarterOfferCreateInput & { status: OfferStatus }>
): Promise<void> {
  const ref = doc(db, OFFERS_COLLECTION, id);
  const { lat, lng, ...rest } = data;
  const payload: Record<string, unknown> = {
    ...stripUndefined(rest),
    updatedAt: serverTimestamp(),
  };
  if (typeof lat === "number") payload.lat = lat;
  if (typeof lng === "number") payload.lng = lng;
  await updateDoc(ref, payload);
}

/** Atomicky zvýší počet zobrazení nabídky o 1. Volat pouze pokud viewer != seller. */
export async function incrementOfferViewCount(id: string): Promise<void> {
  const ref = doc(db, OFFERS_COLLECTION, id);
  await updateDoc(ref, { viewCount: increment(1) });
}

export async function softDeleteOffer(id: string): Promise<void> {
  const ref = doc(db, OFFERS_COLLECTION, id);
  await updateDoc(ref, {
    status: "deleted",
    updatedAt: serverTimestamp(),
  });
}
