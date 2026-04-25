import { FirebaseError } from "firebase/app";

/** Minimální délka hesla (Firebase vyžaduje min. 6; doporučujeme 8). */
export const MIN_PASSWORD_LENGTH = 8;

export function mapFirebaseAuthError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/invalid-email":
        return "Neplatný formát e-mailu.";
      case "auth/user-disabled":
        return "Tento účet byl zablokován.";
      case "auth/user-not-found":
        return "Účet s tímto e-mailem neexistuje.";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Špatný e-mail nebo heslo.";
      case "auth/email-already-in-use":
        return "Účet s tímto e-mailem už existuje.";
      case "auth/weak-password":
        return "Heslo je příliš slabé. Použijte alespoň 8 znaků.";
      case "auth/operation-not-allowed":
        return "Tento způsob přihlášení není povolený. Zkontrolujte Firebase Authentication → Sign-in method.";
      case "auth/popup-closed-by-user":
        return "Okno přihlášení bylo zavřeno. Zkuste to znovu.";
      case "auth/network-request-failed":
        return "Chyba sítě. Zkontrolujte připojení.";
      case "auth/configuration-not-found":
      case "auth/invalid-api-key":
        return "Chybná konfigurace Firebase (API klíč nebo projekt).";
      default:
        return err.message || "Přihlášení se nezdařilo.";
    }
  }
  if (err instanceof Error) return err.message;
  return "Neznámá chyba.";
}
