import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { ChevronLeft, Send, Paperclip, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Avatar } from "../components/Avatar";
import { useFirebase } from "../contexts/FirebaseContext";
import { getBarterOfferById } from "../data/barterOffers";
import {
  subscribeMessages,
  sendTextMessage,
  ensureChatForOfferContext,
} from "../lib/chatService";
import { isFirebaseConfigured } from "../lib/firebase";

const MOCK_MESSAGES = [
  {
    id: "1",
    sender: "other" as const,
    text: "Ahoj! Mám zájem o vaši bio zeleninu.",
    timestamp: "10:30",
  },
  {
    id: "2",
    sender: "me" as const,
    text: "Dobrý den! Je ještě k dispozici. Co byste nabízel/a na oplátku?",
    timestamp: "10:35",
  },
  {
    id: "3",
    sender: "other" as const,
    text: "Dělám domácí zavařeniny. Měl/a byste zájem?",
    timestamp: "10:40",
  },
  {
    id: "4",
    sender: "me" as const,
    text: "To zní skvěle! Máte třeba jahodový džem?",
    timestamp: "10:42",
  },
  {
    id: "5",
    sender: "other" as const,
    text: "Ano! Jahodový i malinový. Kdy se můžeme sejít?",
    timestamp: "10:45",
  },
];

export function ChatThread() {
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, error: authError, configured } = useFirebase();
  const [message, setMessage] = useState("");
  const [resolving, setResolving] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  const [otherName, setOtherName] = useState("Načítám…");
  const [msgError, setMsgError] = useState<Error | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const isFirebase = configured && isFirebaseConfigured();

  // Realtime zprávy
  const [fbMessages, setFbMessages] = useState<
    { id: string; text: string; me: boolean; timeLabel: string }[]
  >([]);

  const scrollBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Vyřešit route (seller-X / přímé chatId) + příprava Firestore
  useEffect(() => {
    if (authLoading || !routeId) return;
    if (!isFirebase) {
      setResolving(false);
      setChatId(null);
      setOtherName("Petr M.");
      return;
    }
    if (!user) {
      setResolving(false);
      return;
    }
    const raw = decodeURIComponent(routeId);
    const peer = import.meta.env.VITE_DEMO_OPPOSITE_UID || searchParams.get("peer") || undefined;
    if (raw.startsWith("seller-")) {
      const offerId = raw.replace(/^seller-/, "");
      const offer = getBarterOfferById(offerId);
      if (!offer) {
        setResolving(false);
        setMsgError(new Error("Nabídka nenalezena"));
        return;
      }
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
    if (oName) setOtherName(decodeURIComponent(oName));
    else setOtherName("Chat");
  }, [authLoading, routeId, user, isFirebase, navigate, searchParams]);

  // Realtime posluchač zpráv
  useEffect(() => {
    if (!isFirebase || !user || !chatId) {
      if (!isFirebase) setFbMessages([]);
      return;
    }
    setMsgError(null);
    const unsub = subscribeMessages(
      chatId,
      (list) => {
        const rows = list.map((m) => {
          const t = m.createdAt?.toDate();
          return {
            id: m.id,
            text: m.text,
            me: m.senderId === user.uid,
            timeLabel: t
              ? format(t, "HH:mm")
              : "…",
          };
        });
        setFbMessages(rows);
        setTimeout(scrollBottom, 50);
      },
      (e) => setMsgError(e)
    );
    return () => {
      if (unsub) unsub();
    };
  }, [isFirebase, user, chatId, scrollBottom]);

  const handleSend = async () => {
    const t = message.trim();
    if (!t) return;
    if (isFirebase && user && chatId) {
      try {
        setMsgError(null);
        await sendTextMessage(chatId, user.uid, t);
        setMessage("");
        scrollBottom();
      } catch (e) {
        setMsgError(e instanceof Error ? e : new Error(String(e)));
      }
      return;
    }
    setMessage("");
  };

  const useMock = !isFirebase || !chatId;
  const showLoad = (authLoading || resolving) && isFirebase;

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col bg-background">
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 pt-safe backdrop-blur">
        <div className="app-container flex items-center gap-3 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <Avatar size="md" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <h4 className="line-clamp-1">{otherName}</h4>
            <p className="text-xs text-muted-foreground">
              {isFirebase && user
                ? "Realtime přes Firestore"
                : "Offline náhled (nakonfigurujte Firebase)"}
            </p>
          </div>
        </div>
      </div>

      {authError && (
        <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {authError.message}
        </div>
      )}
      {msgError && (
        <div className="flex items-center gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-900 dark:text-amber-100">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {msgError.message}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="app-container space-y-3 py-4 pb-28 sm:pb-32">
          {showLoad ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
            </div>
          ) : useMock ? (
            MOCK_MESSAGES.map((msg) => (
              <div
                key={msg.id}
                className={`flex min-w-0 ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[min(18rem,85%)] min-w-0 rounded-2xl px-3 py-2.5 sm:max-w-[75%] sm:px-4 ${
                    msg.sender === "me"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-secondary-foreground rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      msg.sender === "me"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))
          ) : (
            fbMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex min-w-0 ${msg.me ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[min(18rem,85%)] min-w-0 rounded-2xl px-3 py-2.5 sm:max-w-[75%] sm:px-4 ${
                    msg.me
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-secondary-foreground rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      msg.me ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {msg.timeLabel}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="app-sticky-bottom border-t border-border bg-background/95 py-2 pb-safe backdrop-blur sm:py-3">
        <div className="app-container flex min-w-0 items-end gap-1.5 sm:gap-2">
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
            disabled={showLoad}
            aria-label="Příloha"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Napište zprávu…"
            rows={1}
            disabled={showLoad}
            className="min-h-0 min-w-0 flex-1 max-h-32 resize-none rounded-lg border border-border bg-input-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-ring focus:outline-none sm:px-4 sm:py-3"
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
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
