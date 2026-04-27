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
        return "Účet s tímto e-mailem už existuje. Zkuste se přihlásit nebo použijte Google.";
      case "auth/account-exists-with-different-credential":
        return "Tento e-mail je již přihlášen jiným způsobem (např. přes Google). Přihlaste se Googlem a v nastavení přidejte heslo.";
      case "auth/provider-already-linked":
        return "Tento způsob přihlášení je k účtu již přidán.";
      case "auth/credential-already-in-use":
        return "Tyto přihlašovací údaje jsou již použity v jiném účtu.";
      case "auth/weak-password":
        return "Heslo je příliš slabé. Použijte alespoň 8 znaků.";
      case "auth/operation-not-allowed":
        return "Tento způsob přihlášení není povolený. Zkontrolujte Firebase Authentication → Sign-in method.";
      case "auth/popup-closed-by-user":
        return "Okno přihlášení bylo zavřeno. Zkuste to znovu.";
      case "auth/popup-blocked":
        return "Prohlížeč zablokoval přihlašovací okno. Zkuste znovu nebo povolte vyskakovací okna.";
      case "auth/cancelled-popup-request":
        return "Přihlášení bylo zrušeno. Zkuste to znovu.";
      case "auth/operation-not-supported-in-this-environment":
        return "Přihlášení přes Google není v tomto prostředí podporováno.";
      case "auth/unauthorized-domain":
        return "Tato doména není povolena pro přihlášení. Zkontrolujte Firebase → Authentication → Authorized domains.";
      case "auth/network-request-failed":
        return "Chyba sítě. Zkontrolujte připojení.";
      case "auth/too-many-requests":
        return "Příliš mnoho pokusů. Zkuste to za chvíli.";
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
