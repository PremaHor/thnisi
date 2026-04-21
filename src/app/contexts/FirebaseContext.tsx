import { createContext, useContext, type ReactNode } from "react";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";

type FirebaseContextValue = ReturnType<typeof useFirebaseAuth>;

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const value = useFirebaseAuth();
  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
}

export function useFirebase(): FirebaseContextValue {
  const ctx = useContext(FirebaseContext);
  if (ctx == null) {
    throw new Error("useFirebase musí být uvnitř <FirebaseProvider>");
  }
  return ctx;
}
