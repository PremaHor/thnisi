/** Z URL nebo uživatelského vstupu — bez nových řádků, rozumná délka (UI / XSS-hloubka). */
export function sanitizeChatDisplayName(raw: string | null | undefined): string {
  if (!raw) return "Chat";
  const t = raw.replace(/[\r\n\u0000]/g, "").replace(/\s+/g, " ").trim().slice(0, 80);
  return t || "Chat";
}
