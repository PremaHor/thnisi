import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, Link } from "react-router";
import { Home, Plus, MessageCircle, ShoppingBag, User } from "lucide-react";
import { useFirebase } from "../contexts/FirebaseContext";
import { subscribePendingIncomingCount, subscribeOutgoingRequests, type TradeRequestStatus } from "../../lib/trades";

function isNavActive(path: string, pathname: string): boolean {
  if (path === "/") {
    return (
      pathname === "/" ||
      pathname === "/saved" ||
      pathname.startsWith("/offer/")
    );
  }
  if (path === "/chats") {
    return pathname === "/chats" || pathname.startsWith("/chat/");
  }
  if (path === "/profile") {
    return pathname === "/profile" || pathname.startsWith("/profile/");
  }
  if (path === "/my-offers") {
    return pathname === "/my-offers" || pathname === "/trades";
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

function requestNotificationPermission() {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    void Notification.requestPermission();
  }
}

function showTradeNotification(count: number) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  const n = new Notification("TrhniSi — nová žádost o směnu", {
    body: count === 1
      ? "Někdo má zájem o tvoji nabídku. Otevři Žádosti."
      : `Máš ${count} nových žádostí o směnu.`,
    icon: "/app-icon-192.png",
    badge: "/app-icon-192.png",
    tag: "trade-request",
    renotify: true,
  });
  n.onclick = () => { window.focus(); n.close(); };
}

function showDeclinedNotification(offerTitle: string) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  const n = new Notification("TrhniSi — žádost o směnu odmítnuta", {
    body: `Tvoje žádost o nabídku „${offerTitle}" byla odmítnuta.`,
    icon: "/app-icon-192.png",
    badge: "/app-icon-192.png",
    tag: "trade-declined",
    renotify: true,
  });
  n.onclick = () => { window.focus(); n.close(); };
}

function showAcceptedNotification(offerTitle: string) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  const n = new Notification("TrhniSi — žádost o směnu přijata! 🎉", {
    body: `Tvoje žádost o nabídku „${offerTitle}" byla přijata. Otevři Žádosti a zahaj chat.`,
    icon: "/app-icon-192.png",
    badge: "/app-icon-192.png",
    tag: "trade-accepted",
    renotify: true,
  });
  n.onclick = () => {
    window.focus();
    window.location.href = "/trades";
    n.close();
  };
}

/** Sleduje odchozí žádosti a upozorní při pending → declined nebo pending → accepted. */
function useOutgoingRequestNotifications() {
  const { user } = useFirebase();
  // Mapa requestId → předchozí status; null = ještě jsme neviděli první snapshot
  const prevStatuses = useRef<Map<string, TradeRequestStatus> | null>(null);

  useEffect(() => {
    if (!user?.uid) { prevStatuses.current = null; return; }
    const unsub = subscribeOutgoingRequests(user.uid, (requests) => {
      if (prevStatuses.current === null) {
        // První snapshot — pouze inicializujeme mapu, nenotifikujeme
        prevStatuses.current = new Map(requests.map((r) => [r.id, r.status]));
        return;
      }
      requests.forEach((r) => {
        const prev = prevStatuses.current!.get(r.id);
        if (prev === "pending" && r.status === "declined") {
          showDeclinedNotification(r.offerTitle);
        }
        if (prev === "pending" && r.status === "accepted") {
          showAcceptedNotification(r.offerTitle);
        }
        prevStatuses.current!.set(r.id, r.status);
      });
    });
    return () => { unsub(); prevStatuses.current = null; };
  }, [user?.uid]);
}

function usePendingTradeCount(): number {
  const { user } = useFirebase();
  const [count, setCount] = useState(0);
  const prevCount = useRef<number | null>(null);

  // Požádej o povolení notifikací při přihlášení
  useEffect(() => {
    if (user?.uid) requestNotificationPermission();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) { setCount(0); prevCount.current = null; return; }
    const unsub = subscribePendingIncomingCount(user.uid, (newCount) => {
      setCount(newCount);
      // Zobraz notifikaci jen když přibylo (ne při prvním načtení)
      if (prevCount.current !== null && newCount > prevCount.current) {
        showTradeNotification(newCount);
      }
      prevCount.current = newCount;
    });
    return unsub;
  }, [user?.uid]);

  return count;
}

export function RootLayout() {
  const location = useLocation();
  const pendingTrades = usePendingTradeCount();
  useOutgoingRequestNotifications();

  const navItems = [
    { path: "/", icon: Home, label: "Objevuj" },
    { path: "/my-offers", icon: ShoppingBag, label: "Moje", badge: pendingTrades },
    { path: "/create", icon: Plus, label: "Nová" },
    { path: "/chats", icon: MessageCircle, label: "Chaty" },
    { path: "/profile", icon: User, label: "Já" },
  ] as const;

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded-lg focus:border-2 focus:border-foreground focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Přeskočit na obsah
      </a>
      <main
        id="main-content"
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        tabIndex={-1}
      >
        <Outlet />
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 px-3 pb-safe pt-2 backdrop-blur-md"
        role="navigation"
        aria-label="Hlavní navigace"
      >
        <div className="relative mx-auto w-full min-w-0 max-w-md sm:max-w-lg">
          <div className="flex items-end justify-between gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isNavActive(item.path, location.pathname);
              const isCreate = item.path === "/create";
              const badge = "badge" in item ? item.badge : 0;

              if (isCreate) {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={isActive ? "page" : undefined}
                    aria-label="Nová nabídka"
                    title="Nová nabídka"
                    className={`mb-0.5 flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.92] ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-icon-well text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </Link>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center rounded-lg px-0.5 py-1 text-[11px] font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] sm:text-xs ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div className="relative mb-0.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                        isActive ? "bg-primary/12 text-primary" : "bg-transparent text-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 2} />
                    </div>
                    {badge > 0 && (
                      <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-white">
                        {badge > 9 ? "9+" : badge}
                      </span>
                    )}
                  </div>
                  <span className="max-w-full truncate text-center">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
