import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { Clock, CheckCircle, XCircle, MessageCircle, Star } from "lucide-react";
import { Avatar } from "../components/Avatar";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { submitRating, hasUserRatedTrade } from "../../lib/ratings";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import {
  ensureChatForTrade,
  subscribeTradeRequestsForUser,
  markTradeRequestCompleted,
  updateTradeRequestStatus,
  type TradeRequest,
} from "../../lib/trades";

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

export function TradeRequests() {
  const { user } = useFirebaseAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "incoming" | "outgoing">("all");
  const [requests, setRequests] = useState<TradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptBusy, setAcceptBusy] = useState<string | null>(null);
  // tradeId → already rated
  const [ratedTrades, setRatedTrades] = useState<Set<string>>(new Set());
  const refresh = useCallback(() => {}, []);

  const [rateTarget, setRateTarget] = useState<{
    tradeId: string;
    peerName: string;
    peerKey: string;
  } | null>(null);
  const [picked, setPicked] = useState<1 | 2 | 3 | 4 | 5 | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setRequests([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeTradeRequestsForUser(
      user.uid,
      (rows) => {
        setRequests(rows);
        setLoading(false);
        setError(null);
        // pro přijaté žádosti zkontroluj Firestore jestli jsi už hodnotil
        const accepted = rows.filter((r) => r.status === "accepted");
        if (accepted.length > 0) {
          void Promise.all(
            accepted.map((r) => hasUserRatedTrade(user.uid, r.id))
          ).then((results) => {
            const s = new Set<string>();
            accepted.forEach((r, i) => { if (results[i]) s.add(r.id); });
            setRatedTrades(s);
          });
        }
      },
      () => {
        setError("Žádosti o směnu se nepodařilo načíst.");
        setLoading(false);
      }
    );
    return unsub;
  }, [user?.uid]);

  const mappedRequests = requests.map((req) => {
    const incoming = req.ownerId === user?.uid;
    const isOutgoing = req.requesterId === user?.uid;
    const peerName = incoming ? req.requesterName : req.ownerName;
    const peerRatingKey = incoming ? req.requesterId : req.ownerId;
    return {
      id: req.id,
      type: incoming ? "incoming" : "outgoing",
      user: { name: peerName, avatar: "" },
      peerRatingKey,
      offerId: req.offerId,
      offer: req.offerTitle,
      status: req.status,
      date: req.createdAt?.toDate().toLocaleString("cs-CZ") ?? "—",
      completedBy: req.completedBy,
      canEditIncoming: incoming && req.status === "pending",
      canComplete: isOutgoing && req.status === "accepted",
      // Příchozí přijaté — vlastník může jít do chatu
      canOwnerChat: incoming && req.status === "accepted",
      requesterId: req.requesterId,
      ownerId: req.ownerId,
    };
  });

  const filteredRequests = mappedRequests.filter((req) => filter === "all" || req.type === filter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "accepted": return <CheckCircle className="h-4 w-4" />;
      case "declined": return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusVariant = (status: string): "warning" | "success" | "destructive" => {
    switch (status) {
      case "pending": return "warning";
      case "accepted": return "success";
      case "declined": return "destructive";
      default: return "warning";
    }
  };

  const handleAccept = async (request: (typeof mappedRequests)[number]) => {
    if (acceptBusy) return;
    setAcceptBusy(request.id);
    try {
      await updateTradeRequestStatus(request.id, "accepted");
      const chatId = await ensureChatForTrade(request.ownerId, request.requesterId, request.offer);
      navigate(`/chat/${chatId}?title=${encodeURIComponent(request.offer)}`);
    } catch (e) {
      console.error("Accept error:", e);
    } finally {
      setAcceptBusy(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    await updateTradeRequestStatus(requestId, "declined");
  };

  const openRateFlow = (request: (typeof filteredRequests)[number]) => {
    if (user?.uid) {
      void markTradeRequestCompleted(request.id, user.uid);
    }
    if (!ratedTrades.has(request.id)) {
      setPicked(null);
      setRateTarget({
        tradeId: request.id,
        peerName: request.user.name,
        peerKey: request.peerRatingKey,
      });
    }
  };

  const submitPick = () => {
    if (!rateTarget || !picked || !user?.uid) return;
    void submitRating(user.uid, rateTarget.peerKey, rateTarget.tradeId, picked).then(() => {
      setRatedTrades((prev) => new Set([...prev, rateTarget.tradeId]));
    });
    setRateTarget(null);
    setPicked(null);
  };

  const goToChat = async (ownerId: string, requesterId: string, offerTitle: string) => {
    const chatId = await ensureChatForTrade(ownerId, requesterId, offerTitle);
    navigate(`/chat/${chatId}?title=${encodeURIComponent(offerTitle)}`);
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
        {loading && <p className="mb-3 text-sm text-muted-foreground">Načítání žádostí…</p>}
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
        {!loading && filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageCircle className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2">Žádné žádosti</h3>
            <p className="text-muted-foreground">Vaše žádosti se zobrazí zde</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => {
              const completed = user?.uid
                ? request.completedBy.includes(user.uid)
                : false;
              const rated = ratedTrades.has(request.id);
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
                      <div className="flex flex-wrap items-center gap-2">
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

                  {/* Příchozí čekající — přijmout / odmítnout */}
                  {request.canEditIncoming && (
                    <div className="flex min-w-0 flex-col gap-2 min-[380px]:flex-row">
                      <Button
                        variant="destructive"
                        size="sm"
                        fullWidth
                        onClick={() => void handleDecline(request.id)}
                      >
                        Odmítnout
                      </Button>
                      <Button
                        size="sm"
                        fullWidth
                        disabled={acceptBusy === request.id}
                        onClick={() => void handleAccept(request)}
                      >
                        {acceptBusy === request.id ? "Otvírám chat…" : "Přijmout a chatovat"}
                      </Button>
                    </div>
                  )}

                  {/* Přijatá žádost — tlačítka akcí */}
                  {request.status === "accepted" && (
                    <div className="flex min-w-0 flex-col gap-2">
                      {/* Do chatu — pro oba účastníky; requester vidí výraznější CTA */}
                      <Button
                        type="button"
                        variant={request.type === "outgoing" ? "default" : "outline"}
                        size="sm"
                        fullWidth
                        onClick={() => void goToChat(request.ownerId, request.requesterId, request.offer)}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        {request.type === "outgoing" ? "Zahájit chat" : "Otevřít chat"}
                      </Button>

                      {/* Dokončit směnu — jen pro toho kdo žádost poslal */}
                      {request.canComplete && !completed && (
                        <Button
                          type="button"
                          size="sm"
                          fullWidth
                          onClick={() => openRateFlow(request)}
                        >
                          Dokončit směnu a ohodnotit
                        </Button>
                      )}
                      {request.canComplete && completed && !rated && (
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
                    picked === n ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-secondary"
                  }`}
                  aria-pressed={picked === n}
                  aria-label={`${n} z 5 hvězd`}
                >
                  <Star
                    className={`h-9 w-9 sm:h-10 sm:w-10 ${
                      picked && n <= picked ? "fill-primary text-primary" : "text-muted-foreground/50"
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
                {getUserRatingSummary(rateTarget.peerKey)!.count} hodn.) — po uložení se může mírně
                změnit.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
