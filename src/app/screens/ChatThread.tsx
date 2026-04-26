import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { ChevronLeft, Send, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Avatar } from "../components/Avatar";
import { useFirebase } from "../contexts/FirebaseContext";
import { getBarterOfferById } from "../data/barterOffers";
import {
  subscribeMessages,
  sendTextMessage,
  ensureChatForOfferContext,
  unhideChatFromInbox,
} from "../lib/chatService";
import { isFirebaseConfigured } from "../lib/firebase";
import { sanitizeChatDisplayName } from "../lib/sanitizeDisplayText";
import { getUserProfile, type UserProfile } from "../../lib/profile";

type DisplayMessage = {
  id: string;
  text: string;
  senderId: string;
  me: boolean;
  timeLabel: string;
};

export function ChatThread() {
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, error: authError, configured } = useFirebase();
  const [message, setMessage] = useState("");
  const [resolving, setResolving] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  const [otherName, setOtherName] = useState("Načítám…");
  const [otherAvatar, setOtherAvatar] = useState("");
  const [msgError, setMsgError] = useState<Error | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const messagesScrollRef = useRef<HTMLDivElement>(null);

  // Cache profilů účastníků (uid → profil)
  const profileCacheRef = useRef<Map<string, UserProfile>>(new Map());
  const [profileVersion, setProfileVersion] = useState(0);

  const isFirebase = configured && isFirebaseConfigured();
  const [fbMessages, setFbMessages] = useState<DisplayMessage[]>([]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const onScroll = useCallback(() => {
    const el = messagesScrollRef.current;
    if (!el) return;
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }, []);

  // Načti profil pro senderId pokud ještě není v cache
  const ensureProfile = useCallback(async (uid: string) => {
    if (profileCacheRef.current.has(uid)) return;
    try {
      const p = await getUserProfile(uid);
      if (p) {
        profileCacheRef.current.set(uid, p);
        setProfileVersion((v) => v + 1);
      }
    } catch { /* ignorovat */ }
  }, []);

  useEffect(() => {
    if (!isFirebase || !user || !chatId) return;
    void unhideChatFromInbox(user.uid, chatId);
  }, [isFirebase, user, chatId]);

  // Vyřešit route (seller-X / přímé chatId)
  useEffect(() => {
    if (authLoading || !routeId) return;
    if (!isFirebase) {
      setResolving(false);
      setChatId(null);
      setOtherName("Petr M.");
      return;
    }
    if (!user) { setResolving(false); return; }
    const raw = decodeURIComponent(routeId);
    const peer = import.meta.env.VITE_DEMO_OPPOSITE_UID || searchParams.get("peer") || undefined;
    if (raw.startsWith("seller-")) {
      const offerId = raw.replace(/^seller-/, "");
      const offer = getBarterOfferById(offerId);
      if (!offer) { setResolving(false); setMsgError(new Error("Nabídka nenalezena")); return; }
      setResolving(true);
      ensureChatForOfferContext({
        currentUserId: user.uid,
        offerId: offer.id,
        sellerName: offer.seller.name,
        peerFirebaseUid: peer || undefined,
      })
        .then((cid) => {
          setChatId(cid);
          setOtherName(offer.seller.name);
          navigate(`/chat/${encodeURIComponent(cid)}`, { replace: true });
        })
        .catch((e) => setMsgError(e instanceof Error ? e : new Error(String(e))))
        .finally(() => setResolving(false));
      return;
    }
    setChatId(raw);
    setResolving(false);
    const oName = searchParams.get("name");
    if (oName) setOtherName(sanitizeChatDisplayName(decodeURIComponent(oName)));
    else setOtherName("Chat");
  }, [authLoading, routeId, user, isFirebase, navigate, searchParams]);

  // Realtime zprávy
  useEffect(() => {
    if (!isFirebase || !user || !chatId) {
      if (!isFirebase) setFbMessages([]);
      return;
    }
    setMsgError(null);
    const unsub = subscribeMessages(
      chatId,
      (list) => {
        const rows: DisplayMessage[] = list.map((m) => ({
          id: m.id,
          text: m.text,
          senderId: m.senderId,
          me: m.senderId === user.uid,
          timeLabel: m.createdAt ? format(m.createdAt.toDate(), "HH:mm") : "…",
        }));
        setFbMessages(rows);
        // Načti profily nových odesílatelů
        const seen = new Set<string>();
        rows.forEach((r) => {
          if (!seen.has(r.senderId)) { seen.add(r.senderId); void ensureProfile(r.senderId); }
        });
        requestAnimationFrame(() => {
          if (stickToBottomRef.current) scrollToBottom("auto");
        });
      },
      (e) => setMsgError(e)
    );
    return () => { if (unsub) unsub(); };
  }, [isFirebase, user, chatId, scrollToBottom, ensureProfile]);

  // Aktualizuj otherName/otherAvatar jakmile se načtou profily
  useEffect(() => {
    if (!user || !chatId) return;
    const peerUid = chatId.split("_").find((uid) => uid !== user.uid);
    if (!peerUid) return;
    const p = profileCacheRef.current.get(peerUid);
    if (p) {
      if (p.name) setOtherName(p.name);
      if (p.avatarUrl) setOtherAvatar(p.avatarUrl);
    }
  }, [profileVersion, user, chatId]);

  // Scroll na konec při prvním načtení chatu
  useEffect(() => {
    if (!chatId) return;
    stickToBottomRef.current = true;
    requestAnimationFrame(() => scrollToBottom("auto"));
  }, [chatId, scrollToBottom]);

  const handleSend = async () => {
    const t = message.trim();
    if (!t || !isFirebase || !user || !chatId) return;
    try {
      setMsgError(null);
      await sendTextMessage(chatId, user.uid, t);
      setMessage("");
      stickToBottomRef.current = true;
      requestAnimationFrame(() => scrollToBottom("smooth"));
    } catch (e) {
      setMsgError(e instanceof Error ? e : new Error(String(e)));
    }
  };

  const showLoad = (authLoading || resolving) && isFirebase;
  const useMock = !isFirebase || !chatId;

  // Pomocná funkce: zobrazit avatar/jméno jen pro první zprávu v sérii od stejného odesílatele
  const showSenderInfo = (idx: number, msgs: DisplayMessage[]) => {
    if (idx === 0) return true;
    return msgs[idx].senderId !== msgs[idx - 1].senderId;
  };

  const myProfile = user ? profileCacheRef.current.get(user.uid) : undefined;

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col bg-background" style={{ height: "100%" }}>
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-background/95 pt-safe backdrop-blur">
        <div className="app-container flex items-center gap-3 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-secondary"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <Avatar src={otherAvatar} size="md" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <h4 className="line-clamp-1">{otherName}</h4>
            <p className="text-xs text-muted-foreground">Realtime chat</p>
          </div>
        </div>
      </div>

      {authError && (
        <div className="shrink-0 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {authError.message}
        </div>
      )}
      {msgError && (
        <div className="shrink-0 flex items-center gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-900 dark:text-amber-100">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {msgError.message}
        </div>
      )}

      {/* Zprávy — scrollovatelná oblast */}
      <div
        ref={messagesScrollRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
        style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        <div className="space-y-1 px-4 py-4">
          {showLoad ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
            </div>
          ) : useMock ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Zahajte konverzaci první zprávou.
            </p>
          ) : fbMessages.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Zatím žádné zprávy. Napište první zprávu!
            </p>
          ) : (
            fbMessages.map((msg, idx) => {
              const isFirst = showSenderInfo(idx, fbMessages);
              const profile = profileCacheRef.current.get(msg.senderId);
              const avatarSrc = msg.me
                ? (myProfile?.avatarUrl ?? "")
                : (profile?.avatarUrl ?? "");
              const senderName = msg.me
                ? (myProfile?.name || "Já")
                : (profile?.name || otherName);

              return (
                <div
                  key={msg.id}
                  className={`flex min-w-0 items-end gap-2 ${msg.me ? "flex-row-reverse" : "flex-row"} ${isFirst ? "mt-3" : "mt-0.5"}`}
                >
                  {/* Avatar — zobrazit jen pro první v sérii */}
                  <div className="w-8 shrink-0">
                    {isFirst ? (
                      <Avatar src={avatarSrc} size="sm" />
                    ) : (
                      <div className="h-8 w-8" />
                    )}
                  </div>

                  <div className={`flex min-w-0 flex-col gap-0.5 ${msg.me ? "items-end" : "items-start"}`}>
                    {/* Jméno — jen pro první zprávu v sérii */}
                    {isFirst && (
                      <span className="px-1 text-[11px] font-medium text-muted-foreground">
                        {senderName}
                      </span>
                    )}
                    <div
                      className={`max-w-[min(17rem,78vw)] min-w-0 rounded-2xl px-3 py-2 sm:max-w-[65%] sm:px-4 ${
                        msg.me
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p className={`mt-0.5 text-[10px] ${msg.me ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {msg.timeLabel}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {/* Kotva pro scroll na konec */}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>

      {/* Input — přirozená část flex sloupce, NENÍ fixed */}
      <div
        className="shrink-0 border-t border-border bg-background/95 px-4 py-3 backdrop-blur"
        style={{ paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex min-w-0 items-end gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Napište zprávu…"
            rows={1}
            disabled={showLoad}
            className="min-h-0 min-w-0 max-h-32 flex-1 resize-none rounded-2xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!message.trim() || showLoad}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
