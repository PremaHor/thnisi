import { createBrowserRouter, useRouteError, isRouteErrorResponse } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { SignIn } from "./screens/SignIn";
import { SignUp } from "./screens/SignUp";
import { Browse } from "./screens/Browse";
import { SavedOffers } from "./screens/SavedOffers";
import { OfferDetail } from "./screens/OfferDetail";
import { CreateOffer } from "./screens/CreateOffer";
import { MyOffers } from "./screens/MyOffers";
import { TradeRequests } from "./screens/TradeRequests";
import { Chats } from "./screens/Chats";
import { ChatThread } from "./screens/ChatThread";
import { Profile } from "./screens/Profile";
import { EditProfile } from "./screens/EditProfile";
import { Terms } from "./screens/Terms";
import { Privacy } from "./screens/Privacy";
import { Settings } from "./screens/Settings";
import { SellerProfile } from "./screens/SellerProfile";
import { NotFound } from "./screens/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

function RouteErrorElement() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Neznámá chyba";
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-lg font-semibold">Něco se pokazilo</p>
      <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
      <button
        type="button"
        onClick={() => { window.location.href = "/"; }}
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground"
      >
        Zpět na hlavní stránku
      </button>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    errorElement: <RouteErrorElement />,
    children: [
      { index: true, Component: Browse },
      { path: "saved", Component: SavedOffers },
      { path: "offer/:id", Component: OfferDetail },
      { path: "user/:sellerId", Component: SellerProfile },
      { path: "terms", Component: Terms },
      { path: "privacy", Component: Privacy },
      {
        Component: ProtectedRoute,
        children: [
          { path: "create", Component: CreateOffer },
          { path: "edit/:id", Component: CreateOffer },
          { path: "my-offers", Component: MyOffers },
          { path: "trades", Component: TradeRequests },
          { path: "chats", Component: Chats },
          { path: "chat/:id", Component: ChatThread },
          { path: "profile", Component: Profile },
          { path: "profile/edit", Component: EditProfile },
          { path: "settings", Component: Settings },
        ],
      },
    ],
  },
  {
    path: "/sign-in",
    Component: SignIn,
  },
  {
    path: "/sign-up",
    Component: SignUp,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
