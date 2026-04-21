import { useState, useCallback } from "react";
import { Link } from "react-router";
import { Clock, CheckCircle, XCircle, MessageCircle, Star } from "lucide-react";
import { Avatar } from "../components/Avatar";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import {
  getUserRatingSummary,
  hasRatedTrade,
  isTradeMarkedComplete,
  markTradeComplete,
  submitTradeRating,
} from "../data/ratingsStore";

const FILTER_LABELS = {
  all: "Vše",
  incoming: "Příchozí",
  outgoing: "Odchozí",
} as const;

const TYPE_LABELS = {
  incoming: "Příchozí",
  outgoing: "Odchozí",
} as const;

const STATUS_LABELS: Record<string, string> = {
  pending: "Čeká",
  accepted: "Přijato",
  declined: "Odmítnuto",
};

type MockRequest = {
  id: string;
  type: "incoming" | "outgoing";
  user: { name: string; avatar: string };
  /** Klíč pro ratingsStore – koho ohodnotíte po dokončení */
  peerRatingKey: string;
  /** ID nabídky v barterOffers (pro odkaz do chatu) */
  offerId: string;
  offer: string;
  status: "pending" | "accepted" | "declined";
  date: string;
};

const MOCK_REQUESTS: MockRequest[] = [
  {
    id: "1",
    type: "incoming",
    user: { name: "Petr M.", avatar: "" },
    peerRatingKey: "petr-m",
    offerId: "1",
    offer: "Čerstvá bio zelenina",
    status: "pending",
    date: "před 2 h",
  },
  {
    id: "2",
    type: "outgoing",
    user: { name: "Eva N.", avatar: "" },
    peerRatingKey: "eva-n",
    offerId: "4",
    offer: "Domácí chléb a pečivo",
    status: "accepted",
    date: "před 1 dnem",
  },
  {
    id: "3",
    type: "incoming",
    user: { name: "Martin S.", avatar: "" },
    peerRatingKey: "martin-s",
    offerId: "2",
    offer: "Tvorba webů a design",
    status: "declined",
    date: "před 3 dny",
  },
];

export function TradeRequests() {
  const [, setRerender] = useState(0);
  const [filter, setFilter] = useState<"all" | "incoming" | "outgoing">("all");
  const refresh = useCallback(() => setRerender((n) => n + 1), []);

  const [rateTarget, setRateTarget] = useState<{
    tradeId: string;
    peerName: string;
    peerKey: string;
  } | null>(null);
  const [picked, setPicked] = useState<1 | 2 | 3 | 4 | 5 | null>(null);

  const filteredRequests = MOCK_REQUESTS.filter(
    (req) => filter === "all" || req.type === filter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "declined":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string): "warning" | "success" | "destructive" => {
    switch (status) {
      case "pending":
        return "warning";
      case "accepted":
        return "success";
      case "declined":
        return "destructive";
      default:
        return "warning";
    }
  };

  const openRateFlow = (request: MockRequest) => {
    markTradeComplete(request.id);
    if (!hasRatedTrade(request.id)) {
      setPicked(null);
      setRateTarget({
        tradeId: request.id,
        peerName: request.user.name,
        peerKey: request.peerRatingKey,
      });
    }
    refresh();
  };

  const submitPick = () => {
    if (!rateTarget || !picked) return;
    submitTradeRating(rateTarget.tradeId, rateTarget.peerKey, picked);
    setRateTarget(null);
    setPicked(null);
    refresh();
  };

  return (
    <div className="app-screen">
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 pt-safe backdrop-blur">
        <div className="app-container py-4">
          <h1 className="mb-4 min-w-0">Žádosti o směnu</h1>

          <div className="grid min-w-0 grid-cols-3 gap-2">
            {(["all", "incoming", "outgoing"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`min-h-[40px] rounded-lg px-2 py-2 text-sm transition-colors sm:px-4 ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="app-container py-4">
        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageCircle className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2">Žádné žádosti</h3>
            <p className="text-muted-foreground">Vaše žádosti se zobrazí zde</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => {
              const completed = isTradeMarkedComplete(request.id);
              const rated = hasRatedTrade(request.id);
              return (
                <div
                  key={request.id}
                  className="rounded-lg border border-border bg-card p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-start gap-3">
                    <Avatar src={request.user.avatar} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="line-clamp-1">{request.user.name}</h4>
                        <Badge variant={request.type === "incoming" ? "primary" : "secondary"}>
                          {TYPE_LABELS[request.type]}
                        </Badge>
                      </div>
                      <p className="mb-1 line-clamp-1 text-sm text-muted-foreground">
                        {request.offer}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusVariant(request.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(request.status)}
                            {STATUS_LABELS[request.status]}
                          </span>
                        </Badge>
                        {completed && (
                          <Badge variant="outline" className="text-xs">
                            Směna dokončena
                          </Badge>
                        )}
                        {completed && rated && (
                          <span className="text-xs text-muted-foreground">Hodnocení uloženo</span>
                        )}
                        <span className="text-xs text-muted-foreground">{request.date}</span>
                      </div>
                    </div>
                  </div>

                  {request.status === "pending" && request.type === "incoming" && (
                    <div className="flex min-w-0 flex-col gap-2 min-[380px]:flex-row">
                      <Button variant="destructive" size="sm" fullWidth>
                        Odmítnout
                      </Button>
                      <Button size="sm" fullWidth>
                        Přijmout
                      </Button>
                    </div>
                  )}

                  {request.status === "accepted" && (
                    <div className="flex min-w-0 flex-col gap-2">
                      {!completed && (
                        <Button type="button" size="sm" fullWidth onClick={() => openRateFlow(request)}>
                          Dokončit směnu a ohodnotit
                        </Button>
                      )}
                      {completed && !rated && (
                        <Button
                          type="button"
                          size="sm"
                          fullWidth
                          variant="primary"
                          onClick={() => {
                            setPicked(null);
                            setRateTarget({
                              tradeId: request.id,
                              peerName: request.user.name,
                              peerKey: request.peerRatingKey,
                            });
                            refresh();
                          }}
                        >
                          <Star className="mr-2 h-4 w-4" />
                          Ohodnotit {request.user.name}
                        </Button>
                      )}
                      <Link to={`/chat/seller-${request.offerId}`} className="w-full">
                        <Button variant="outline" size="sm" fullWidth>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Do chatu
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(rateTarget)}
        onClose={() => {
          setRateTarget(null);
          setPicked(null);
        }}
        title={rateTarget ? `Jak proběhla směna s ${rateTarget.peerName}?` : undefined}
      >
        {rateTarget && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Jedna až pět hvězd — pomůže ostatním s orientací. Hodnocení můžete dát až po dokončené
              směně.
            </p>
            <div
              className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
              role="group"
              aria-label="Hodnocení od jedné do pěti hvězd"
            >
              {([1, 2, 3, 4, 5] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPicked(n)}
                  className={`rounded-xl p-2 transition-transform active:scale-95 ${
                    picked === n
                      ? "bg-primary/20 ring-2 ring-primary"
                      : "hover:bg-secondary"
                  }`}
                  aria-pressed={picked === n}
                  aria-label={`${n} z 5 hvězd`}
                >
                  <Star
                    className={`h-9 w-9 sm:h-10 sm:w-10 ${
                      picked && n <= picked
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/50"
                    }`}
                    strokeWidth={picked && n <= picked ? 0 : 1.5}
                  />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setRateTarget(null);
                  setPicked(null);
                }}
              >
                Zrušit
              </Button>
              <Button fullWidth disabled={!picked} onClick={submitPick}>
                Uložit hodnocení
              </Button>
            </div>
            {getUserRatingSummary(rateTarget.peerKey) && (
              <p className="text-center text-xs text-muted-foreground">
                Předchozí průměr u tohoto uživatele:{" "}
                {getUserRatingSummary(rateTarget.peerKey)!.label} (
                {getUserRatingSummary(rateTarget.peerKey)!.count} hodn.)
                — po uložení se může mírně změnit.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
