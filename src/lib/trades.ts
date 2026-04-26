import {
  addDoc,
  collection,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  doc,
  type Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export type TradeRequestStatus = "pending" | "accepted" | "declined";

export interface TradeRequest {
  id: string;
  offerId: string;
  offerTitle: string;
  requesterId: string;
  requesterName: string;
  ownerId: string;
  ownerName: string;
  status: TradeRequestStatus;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  completedBy: string[];
}

const COLLECTION = "tradeRequests";

function normalize(id: string, data: Record<string, unknown>): TradeRequest {
  return {
    id,
    offerId: String(data.offerId ?? ""),
    offerTitle: String(data.offerTitle ?? ""),
    requesterId: String(data.requesterId ?? ""),
    requesterName: String(data.requesterName ?? ""),
    ownerId: String(data.ownerId ?? ""),
    ownerName: String(data.ownerName ?? ""),
    status: (data.status as TradeRequestStatus) ?? "pending",
    createdAt: (data.createdAt as Timestamp | null) ?? null,
    updatedAt: (data.updatedAt as Timestamp | null) ?? null,
    completedBy: Array.isArray(data.completedBy) ? data.completedBy.map((x) => String(x)) : [],
  };
}

export async function createTradeRequest(input: {
  offerId: string;
  offerTitle: string;
  requesterId: string;
  requesterName: string;
  ownerId: string;
  ownerName: string;
}): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    status: "pending",
    completedBy: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getTradeRequestsForUser(userId: string): Promise<TradeRequest[]> {
  const col = collection(db, COLLECTION);
  const [incomingSnap, outgoingSnap] = await Promise.all([
    getDocs(query(col, where("ownerId", "==", userId), orderBy("createdAt", "desc"))),
    getDocs(query(col, where("requesterId", "==", userId), orderBy("createdAt", "desc"))),
  ]);
  const map = new Map<string, TradeRequest>();
  for (const d of [...incomingSnap.docs, ...outgoingSnap.docs]) {
    map.set(d.id, normalize(d.id, d.data() as Record<string, unknown>));
  }
  return [...map.values()].sort((a, b) => {
    const at = a.createdAt?.toMillis?.() ?? 0;
    const bt = b.createdAt?.toMillis?.() ?? 0;
    return bt - at;
  });
}

export async function updateTradeRequestStatus(
  id: string,
  status: TradeRequestStatus
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

/** Real-time subscription to all trade requests for a user (incoming + outgoing). */
export function subscribeTradeRequestsForUser(
  userId: string,
  onData: (requests: TradeRequest[]) => void,
  onError?: (e: Error) => void
): () => void {
  const col = collection(db, COLLECTION);
  const store = new Map<string, TradeRequest>();

  const emit = () => {
    const list = [...store.values()].sort((a, b) => {
      return (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0);
    });
    onData(list);
  };

  const unsubIn = onSnapshot(
    query(col, where("ownerId", "==", userId), orderBy("createdAt", "desc")),
    (snap) => {
      snap.docs.forEach((d) => store.set(d.id, normalize(d.id, d.data() as Record<string, unknown>)));
      emit();
    },
    onError
  );

  const unsubOut = onSnapshot(
    query(col, where("requesterId", "==", userId), orderBy("createdAt", "desc")),
    (snap) => {
      snap.docs.forEach((d) => {
        if (!store.has(d.id))
          store.set(d.id, normalize(d.id, d.data() as Record<string, unknown>));
      });
      emit();
    },
    onError
  );

  return () => {
    unsubIn();
    unsubOut();
  };
}

/** Real-time subscription na odchozí žádosti (kde jsem já requester). */
export function subscribeOutgoingRequests(
  userId: string,
  onData: (requests: TradeRequest[]) => void,
  onError?: (e: Error) => void
): () => void {
  return onSnapshot(
    query(
      collection(db, COLLECTION),
      where("requesterId", "==", userId),
      orderBy("createdAt", "desc")
    ),
    (snap) => {
      onData(snap.docs.map((d) => normalize(d.id, d.data() as Record<string, unknown>)));
    },
    onError
  );
}

/**
 * Živý počet žádostí (všech stavů) per offerId pro daného vlastníka.
 * Vrací mapu offerId → počet pending žádostí.
 */
export function subscribePendingTradeCountsByOffer(
  ownerId: string,
  onChange: (counts: Record<string, number>) => void
): () => void {
  return onSnapshot(
    query(collection(db, COLLECTION), where("ownerId", "==", ownerId)),
    (snap) => {
      const counts: Record<string, number> = {};
      snap.docs.forEach((d) => {
        const data = d.data() as Record<string, unknown>;
        const offerId = String(data.offerId ?? "");
        const status = String(data.status ?? "");
        if (offerId && status === "pending") {
          counts[offerId] = (counts[offerId] ?? 0) + 1;
        }
      });
      onChange(counts);
    },
    () => onChange({})
  );
}

/** Počet nevyřízených příchozích žádostí (pro badge v navigaci). */
export function subscribePendingIncomingCount(
  userId: string,
  onChange: (count: number) => void
): () => void {
  const col = collection(db, COLLECTION);
  return onSnapshot(
    query(col, where("ownerId", "==", userId), where("status", "==", "pending")),
    (snap) => onChange(snap.size),
    () => onChange(0)
  );
}

/** Vytvoří chat mezi dvěma uživateli (nebo vrátí existující) a vrátí chatId. */
export async function ensureChatForTrade(uid1: string, uid2: string): Promise<string> {
  const sorted = [uid1, uid2].sort();
  const chatId = `${sorted[0]}_${sorted[1]}`;
  const chatRef = doc(db, "chats", chatId);
  const existing = await getDoc(chatRef);
  if (!existing.exists()) {
    await setDoc(chatRef, {
      participantIds: sorted,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  return chatId;
}

export async function markTradeRequestCompleted(id: string, userId: string): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  const data = (snap.data() as Record<string, unknown>) ?? {};
  const completedBy = Array.isArray(data.completedBy) ? data.completedBy.map((x) => String(x)) : [];
  if (!completedBy.includes(userId)) completedBy.push(userId);
  await updateDoc(ref, {
    completedBy,
    updatedAt: serverTimestamp(),
  });
}
