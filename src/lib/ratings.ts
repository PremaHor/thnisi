import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export interface Rating {
  id: string;
  raterId: string;
  ratedUserId: string;
  tradeId: string;
  score: 1 | 2 | 3 | 4 | 5;
  createdAt: Timestamp | null;
}

export interface RatingSummary {
  average: number;
  count: number;
  label: string;
}

const COLLECTION = "ratings";

function toRating(id: string, data: Record<string, unknown>): Rating {
  return {
    id,
    raterId: String(data.raterId ?? ""),
    ratedUserId: String(data.ratedUserId ?? ""),
    tradeId: String(data.tradeId ?? ""),
    score: (data.score as 1 | 2 | 3 | 4 | 5) ?? 5,
    createdAt: (data.createdAt as Timestamp | null) ?? null,
  };
}

function computeSummary(ratings: Rating[]): RatingSummary | null {
  if (ratings.length === 0) return null;
  const avg = ratings.reduce((a, r) => a + r.score, 0) / ratings.length;
  return {
    average: avg,
    count: ratings.length,
    label: avg.toFixed(1).replace(".", ","),
  };
}

export async function submitRating(
  raterId: string,
  ratedUserId: string,
  tradeId: string,
  score: 1 | 2 | 3 | 4 | 5
): Promise<void> {
  const already = await hasUserRatedTrade(raterId, tradeId);
  if (already) return;
  await addDoc(collection(db, COLLECTION), {
    raterId,
    ratedUserId,
    tradeId,
    score,
    createdAt: serverTimestamp(),
  });
}

export async function hasUserRatedTrade(
  raterId: string,
  tradeId: string
): Promise<boolean> {
  const snap = await getDocs(
    query(
      collection(db, COLLECTION),
      where("raterId", "==", raterId),
      where("tradeId", "==", tradeId)
    )
  );
  return !snap.empty;
}

export async function getRatingSummaryForUser(
  userId: string
): Promise<RatingSummary | null> {
  const snap = await getDocs(
    query(collection(db, COLLECTION), where("ratedUserId", "==", userId))
  );
  const ratings = snap.docs.map((d) =>
    toRating(d.id, d.data() as Record<string, unknown>)
  );
  return computeSummary(ratings);
}

export async function getRatingBreakdownForUser(
  userId: string
): Promise<Record<1 | 2 | 3 | 4 | 5, number>> {
  const snap = await getDocs(
    query(collection(db, COLLECTION), where("ratedUserId", "==", userId))
  );
  const breakdown: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  snap.docs.forEach((d) => {
    const score = (d.data() as Record<string, unknown>).score as number;
    if (score >= 1 && score <= 5) breakdown[score as 1 | 2 | 3 | 4 | 5]++;
  });
  return breakdown;
}
