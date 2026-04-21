import { Outlet, useLocation, Link } from "react-router";
import { Home, Plus, MessageCircle, ShoppingBag, User } from "lucide-react";

function isNavActive(path: string, pathname: string): boolean {
  if (path === "/") {
    return pathname === "/" || pathname.startsWith("/offer/");
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

export function RootLayout() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Objevuj" },
    { path: "/my-offers", icon: ShoppingBag, label: "Moje" },
    { path: "/create", icon: Plus, label: "Nová" },
    { path: "/chats", icon: MessageCircle, label: "Chaty" },
    { path: "/profile", icon: User, label: "Já" },
  ] as const;

  return (
    <div className="flex h-[100dvh] flex-col bg-transparent">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-2xl focus:border-2 focus:border-ink/30 focus:bg-primary focus:px-4 focus:py-2 focus:shadow-cartoon focus:text-primary-foreground"
      >
        Přeskočit na obsah
      </a>
      <main
        id="main-content"
        className="flex min-h-0 flex-1 touch-pan-y flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain pb-28 [-webkit-overflow-scrolling:touch]"
        tabIndex={-1}
      >
        <Outlet />
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-30 px-3 pb-safe pt-1"
        role="navigation"
        aria-label="Hlavní navigace"
      >
        <div className="relative mx-auto w-full min-w-0 max-w-md sm:max-w-lg">
          <div className="flex items-end justify-between gap-0.5 rounded-[1.9rem] border-[3px] border-border/90 bg-card/95 px-1.5 py-2 shadow-cartoon-sm backdrop-blur-xl dark:border-border/80 dark:shadow-[4px_4px_0_0] dark:shadow-foreground/25">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isNavActive(item.path, location.pathname);
              const isCreate = item.path === "/create";

              if (isCreate) {
                return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={isActive ? "page" : undefined}
                  aria-label="Nová nabídka"
                  title="Nová nabídka"
                  className={`mb-0.5 flex h-[3.5rem] w-[3.5rem] shrink-0 items-center justify-center rounded-2xl border-2 border-ink/20 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-95 active:translate-y-px dark:border-foreground/25 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-cartoon"
                        : "bg-secondary text-foreground shadow-cartoon-sm hover:scale-105 hover:shadow-cartoon"
                    }`}
                  >
                    <Icon className="h-7 w-7" strokeWidth={2.5} />
                  </Link>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-h-[3.15rem] min-w-0 flex-1 flex-col items-center justify-center rounded-xl px-0.5 py-1 font-display text-[9px] font-bold uppercase leading-tight tracking-wide transition-all sm:text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card active:scale-[0.97] ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div
                    className={`mb-0.5 flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                      isActive ? "bg-primary/20 text-foreground" : "bg-transparent"
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
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
