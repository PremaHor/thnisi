import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const subcollection = (userId: string) =>
  collection(db, "users", userId, "savedOffers");

export async function getSavedOfferIds(userId: string): Promise<string[]> {
  const snap = await getDocs(subcollection(userId));
  return snap.docs.map((d) => d.id);
}

export async function saveOffer(userId: string, offerId: string): Promise<void> {
  await setDoc(doc(db, "users", userId, "savedOffers", offerId), {
    offerId,
    savedAt: serverTimestamp(),
  });
}

export async function unsaveOffer(
  userId: string,
  offerId: string
): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "savedOffers", offerId));
}
