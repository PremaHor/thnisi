import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  bio: string;
  location: string;
  avatarUrl: string;
  completedTrades: number;
  ratingAvg: number;
  ratingCount: number;
}

const USERS_COLLECTION = "users";

function normalizeProfile(uid: string, data: Record<string, unknown>): UserProfile {
  return {
    uid,
    email: String(data.email ?? ""),
    name: String(data.name ?? ""),
    bio: String(data.bio ?? ""),
    location: String(data.location ?? ""),
    avatarUrl: String(data.avatarUrl ?? ""),
    completedTrades: Number(data.completedTrades ?? 0),
    ratingAvg: Number(data.ratingAvg ?? 0),
    ratingCount: Number(data.ratingCount ?? 0),
  };
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const ref = doc(db, USERS_COLLECTION, userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return normalizeProfile(snap.id, snap.data() as Record<string, unknown>);
}

export async function upsertUserProfile(
  userId: string,
  data: Partial<Omit<UserProfile, "uid">>
): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, userId);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    await setDoc(ref, {
      uid: userId,
      email: data.email ?? "",
      name: data.name ?? "",
      bio: data.bio ?? "",
      location: data.location ?? "",
      avatarUrl: data.avatarUrl ?? "",
      completedTrades: data.completedTrades ?? 0,
      ratingAvg: data.ratingAvg ?? 0,
      ratingCount: data.ratingCount ?? 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return;
  }
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
