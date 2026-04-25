import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { MessageCircle, Loader2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cs } from "date-fns/locale";
import { Avatar } from "../components/Avatar";
import { useFirebase } from "../contexts/FirebaseContext";
import {
  subscribeChats,
  subscribeHiddenChatIds,
  hideChatFromInbox,
  type FirestoreChat,
} from "../lib/chatService";
import { isFirebaseConfigured } from "../lib/firebase";

function titleForList(c: FirestoreChat, myId: string) {
  if (c.otherPartyName) return c.otherPartyName;
  const other = c.participantIds.find((id) => id !== myId);
  if (other) return `Uživatel ${other.slice(0, 6)}…`;
  return "Konverzace";
}

const MOCK_CHATS = [
  {
    id: "1",
    user: { name: "Petr M.", avatar: "" },
    lastMessage: "Super! Kdy se můžeme sejít?",
    timestamp: "před 2 min",
    unread: 2,
  },
  {
    id: "2",
    user: { name: "Eva N.", avatar: "" },
    lastMessage: "Díky za směnu!",
    timestamp: "před 1 h",
    unread: 0,
  },
  {
    id: "3",
    user: { name: "Jana K.", avatar: "" },
    lastMessage: "Mám zájem o vaši nabídku",
    timestamp: "před 2 d",
    unread: 0,
  },
];

const MOCK_HIDDEN_KEY = "trhnisi:hiddenMockChats:v1";

export function Chats() {
  const { user, loading, configured, error: authError } = useFirebase();
  const isFb = configured && isFirebaseConfigured();
  const [chats, setChats] = useState<FirestoreChat[]>([]);
  const [hiddenChatIds, setHiddenChatIds] = useState<Set<string>>(() => new Set());
  const [mockHiddenIds, setMockHiddenIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(MOCK_HIDDEN_KEY);
      if (!raw) return new Set();
      const arr = JSON.parse(raw) as unknown;
      return new Set(Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : []);
    } catch {
      return new Set();
    }
  });
  const [err, setErr] = useState<Error | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isFb || !user) {
      setChats([]);
      return;
    }
    const unsub = subscribeChats(
      user.uid,
      (list) => setChats(list),
      (e) => setErr(e)
    );
    return () => {
      if (unsub) unsub();
    };
  }, [isFb, user]);

  useEffect(() => {
    if (!isFb || !user) {
      setHiddenChatIds(new Set());
      return;
    }
    const unsub = subscribeHiddenChatIds(
      user.uid,
      (ids) => setHiddenChatIds(ids),
      (e) => setErr(e)
    );
    return () => {
      if (unsub) unsub();
    };
  }, [isFb, user]);

  const persistMockHidden = useCallback((next: Set<string>) => {
    try {
      localStorage.setItem(MOCK_HIDDEN_KEY, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
    setMockHiddenIds(next);
  }, []);

  const useMock = !isFb;

  const rows = useMemo(() => {
    if (useMock) {
      return MOCK_CHATS.filter((c) => !mockHiddenIds.has(c.id)).map((c) => ({
        href: `/chat/${c.id}` as const,
        name: c.user.name,
        last: c.lastMessage,
        time: c.timestamp,
        unread: c.unread,
        key: c.id,
      }));
    }
    if (!user) return [];
    return chats
      .filter((c) => !hiddenChatIds.has(c.id))
      .map((c) => {
        const t = c.lastMessageAt?.toDate();
        return {
          href: `/chat/${encodeURIComponent(c.id)}?name=${encodeURIComponent(titleForList(c, user.uid))}` as const,
          name: titleForList(c, user.uid),
          last: c.lastMessage || "—",
          time: t
            ? formatDistanceToNow(t, { addSuffix: true, locale: cs })
            : "—",
          unread: 0,
          key: c.id,
        };
      });
  }, [chats, hiddenChatIds, mockHiddenIds, useMock, user]);

  const removeChatFromList = useCallback(
    async (chatId: string) => {
      const ok = window.confirm(
        "Odebrat konverzaci ze seznamu? Zprávy zůstanou uložené; po znovuotevření chatu z nabídky se může znovu objevit v seznamu."
      );
      if (!ok) return;
      setRemovingId(chatId);
      try {
        if (useMock) {
          const next = new Set(mockHiddenIds);
          next.add(chatId);
          persistMockHidden(next);
        } else if (user) {
          await hideChatFromInbox(user.uid, chatId);
        }
      } catch (e) {
        setErr(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setRemovingId(null);
      }
    },
    [mockHiddenIds, persistMockHidden, useMock, user]
  );

  return (
    <div className="app-screen">
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 py-4 pt-safe backdrop-blur">
        <div className="app-container">
          <h1>Zprávy</h1>
          {isFb && (
            <p className="text-xs text-muted-foreground mt-1">
              Realtime synchronizace přes Firebase
            </p>
          )}
        </div>
      </div>

      {isFb && loading && (
        <div className="flex justify-center py-8 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" aria-label="Připojování" />
        </div>
      )}

      {authError && (
        <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {authError.message}
        </div>
      )}

      {err && (
        <div className="px-4 py-2 text-sm text-destructive">{err.message}</div>
      )}

      <div className="divide-y divide-border">
        {useMock && !loading
          ? rows.map((r) => (
              <div
                key={r.key}
                className="flex min-h-[72px] min-w-0 items-stretch gap-0 transition-colors hover:bg-secondary"
              >
                <Link
                  to={r.href}
                  className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 sm:px-4"
                >
                  <div className="relative">
                    <Avatar size="lg" />
                    {r.unread > 0 && (
                      <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                        {r.unread}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <h4 className="line-clamp-1">{r.name}</h4>
                      <span className="ml-2 flex-shrink-0 text-xs text-muted-foreground">
                        {r.time}
                      </span>
                    </div>
                    <p
                      className={`line-clamp-1 text-sm ${
                        r.unread > 0 ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {r.last}
                    </p>
                  </div>
                </Link>
                <button
                  type="button"
                  disabled={removingId === r.key}
                  aria-label="Odebrat konverzaci ze seznamu"
                  onClick={(e) => {
                    e.preventDefault();
                    void removeChatFromList(r.key);
                  }}
                  className="flex w-12 shrink-0 items-center justify-center border-l border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                >
                  {removingId === r.key ? (
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  ) : (
                    <Trash2 className="h-5 w-5" aria-hidden />
                  )}
                </button>
              </div>
            ))
          : isFb && !loading
            ? rows.map((r) => (
                <div
                  key={r.key}
                  className="flex min-h-[72px] min-w-0 items-stretch gap-0 transition-colors hover:bg-secondary"
                >
                  <Link
                    to={r.href}
                    className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 sm:px-4"
                  >
                    <Avatar size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <h4 className="line-clamp-1">{r.name}</h4>
                        <span className="ml-2 flex-shrink-0 text-xs text-muted-foreground">
                          {r.time}
                        </span>
                      </div>
                      <p className="line-clamp-1 text-sm text-muted-foreground">{r.last}</p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    disabled={removingId === r.key}
                    aria-label="Odebrat konverzaci ze seznamu"
                    onClick={(e) => {
                      e.preventDefault();
                      void removeChatFromList(r.key);
                    }}
                    className="flex w-12 shrink-0 items-center justify-center border-l border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  >
                    {removingId === r.key ? (
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    ) : (
                      <Trash2 className="h-5 w-5" aria-hidden />
                    )}
                  </button>
                </div>
              ))
            : null}

        {isFb && !loading && !user && !authError && !err && (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center text-muted-foreground text-sm">
            Nepodařilo se přihlásit k Firebase. Zkontrolujte konzoli prohlížeče a nastavení Authentication.
          </div>
        )}

        {isFb && !loading && user && rows.length === 0 && !err && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <MessageCircle className="mb-4 w-16 h-16 text-muted-foreground" />
            <h3 className="mb-2">Zatím žádné konverzace</h3>
            <p className="max-w-sm text-muted-foreground text-sm">
              Otevřete chat u nabídky. Zprávy se zobrazí tady a synchronizují v reálném čase.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
