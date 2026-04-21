import {
  collection,
  doc,
  addDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  orderBy,
  query,
  where,
  type Unsubscribe,
  type Timestamp,
} from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "./firebase";

const CHATS = "chats";
const MESSAGES = "messages";

/** Shodné s max. délkou v firestore.rules (validMessageText) */
export const MAX_MESSAGE_LENGTH = 5000;

export type FirestoreMessage = {
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp | null;
};

export type FirestoreChat = {
  id: string;
  participantIds: string[];
  lastMessage: string;
  lastMessageAt: Timestamp | null;
  /** Při jednom účastníkovi: jméno protistrany z nabídky (demo) */
  otherPartyName?: string;
  offerId?: string;
};

/**
 * Dva Firebase UID — deterministické ID threadu.
 * Obě strany sestaví stejné id při otevření z nabídky.
 */
export function getDirectChatId(userIdA: string, userIdB: string): string {
  return [userIdA, userIdB].sort().join("_");
}

/**
 * Jeden účastník + konkrétní nabídka (bez druhého Firebase UID v projektu).
 */
export function getSoloThreadChatId(userId: string, offerId: string): string {
  return `solo_${userId}_offer_${offerId}`;
}

function chatDocRef(db: ReturnType<typeof getDb>, chatId: string) {
  return doc(db, CHATS, chatId);
}

function messagesCol(db: ReturnType<typeof getDb>, chatId: string) {
  return collection(db, CHATS, chatId, MESSAGES);
}

export function subscribeChats(
  userId: string,
  onUpdate: (chats: FirestoreChat[]) => void,
  onError?: (e: Error) => void
): Unsubscribe | null {
  if (!isFirebaseConfigured()) return null;
  const db = getDb();
  const q = query(
    collection(db, CHATS),
    where("participantIds", "array-contains", userId),
    orderBy("lastMessageAt", "desc")
  );
  return onSnapshot(
    q,
    (snap) => {
      const list: FirestoreChat[] = snap.docs.map((d) => {
        const x = d.data() as {
          participantIds: string[];
          lastMessage: string;
          lastMessageAt: Timestamp | null;
          otherPartyName?: string;
          offerId?: string;
        };
        return {
          id: d.id,
          participantIds: x.participantIds,
          lastMessage: x.lastMessage ?? "",
          lastMessageAt: x.lastMessageAt ?? null,
          otherPartyName: x.otherPartyName,
          offerId: x.offerId,
        };
      });
      onUpdate(list);
    },
    (err) => onError?.(err as Error)
  );
}

export function subscribeMessages(
  chatId: string,
  onUpdate: (messages: FirestoreMessage[]) => void,
  onError?: (e: Error) => void
): Unsubscribe | null {
  if (!isFirebaseConfigured()) return null;
  const db = getDb();
  const q = query(messagesCol(db, chatId), orderBy("createdAt", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      const list: FirestoreMessage[] = snap.docs.map((d) => {
        const x = d.data() as {
          senderId: string;
          text: string;
          createdAt: Timestamp | null;
        };
        return {
          id: d.id,
          senderId: x.senderId,
          text: x.text,
          createdAt: x.createdAt ?? null,
        };
      });
      onUpdate(list);
    },
    (err) => onError?.(err as Error)
  );
}

export type EnsureSoloThreadParams = {
  chatId: string;
  userId: string;
  otherPartyName: string;
  offerId?: string;
};

export type EnsurePairThreadParams = {
  chatId: string;
  userId: string;
  peerUserId: string;
  otherPartyName?: string;
  offerId?: string;
};

export async function ensureSoloThread(p: EnsureSoloThreadParams): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const db = getDb();
  const ref = chatDocRef(db, p.chatId);
  await setDoc(
    ref,
    {
      participantIds: [p.userId],
      lastMessage: "",
      lastMessageAt: serverTimestamp(),
      otherPartyName: p.otherPartyName,
      offerId: p.offerId ?? null,
    },
    { merge: true }
  );
}

export async function ensurePairThread(p: EnsurePairThreadParams): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const db = getDb();
  const ref = chatDocRef(db, p.chatId);
  const ids = [p.userId, p.peerUserId].sort();
  await setDoc(
    ref,
    {
      participantIds: ids,
      lastMessage: "",
      lastMessageAt: serverTimestamp(),
      otherPartyName: p.otherPartyName ?? null,
      offerId: p.offerId ?? null,
    },
    { merge: true }
  );
}

export async function sendTextMessage(
  chatId: string,
  senderId: string,
  text: string
): Promise<void> {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase není nakonfigurován");
  }
  const db = getDb();
  const textTrim = text.trim();
  if (!textTrim) return;
  if (textTrim.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Zpráva může mít nejvýše ${MAX_MESSAGE_LENGTH} znaků.`);
  }
  const msgCol = messagesCol(db, chatId);
  await addDoc(msgCol, {
    senderId,
    text: textTrim,
    createdAt: serverTimestamp(),
  });
  const cref = chatDocRef(db, chatId);
  await updateDoc(cref, {
    lastMessage: textTrim,
    lastMessageAt: serverTimestamp(),
  });
}

/**
 * Otevře / synchronizuje thread z detailu nabídky.
 */
export async function ensureChatForOfferContext(params: {
  currentUserId: string;
  offerId: string;
  sellerName: string;
  /** Druhý účastník (UID z Firebase) — v produkci z API / users kolekce */
  peerFirebaseUid: string | null | undefined;
}): Promise<string> {
  const { currentUserId, offerId, sellerName, peerFirebaseUid } = params;
  if (peerFirebaseUid) {
    const chatId = getDirectChatId(currentUserId, peerFirebaseUid);
    await ensurePairThread({
      chatId,
      userId: currentUserId,
      peerUserId: peerFirebaseUid,
      otherPartyName: sellerName,
      offerId,
    });
    return chatId;
  }
  const chatId = getSoloThreadChatId(currentUserId, offerId);
  await ensureSoloThread({
    chatId,
    userId: currentUserId,
    otherPartyName: sellerName,
    offerId,
  });
  return chatId;
}
