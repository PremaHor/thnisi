import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useFirebase } from "../contexts/FirebaseContext";

export function ProtectedRoute() {
  const { loading, isAuthenticated } = useFirebase();
  const location = useLocation();

  // Extra local delay before redirecting to sign-in. Combined with the
  // 1200 ms debounce in useFirebaseAuth, the user has up to ~2 700 ms
  // for Firebase to restore the session from localStorage before they
  // get sent to the sign-in page. Prevents false redirects on iOS PWA.
  const [canRedirect, setCanRedirect] = useState(false);

  useEffect(() => {
    if (loading || isAuthenticated) {
      setCanRedirect(false);
      return;
    }
    const t = setTimeout(() => setCanRedirect(true), 1500);
    return () => clearTimeout(t);
  }, [loading, isAuthenticated]);

  if (loading || (!isAuthenticated && !canRedirect)) {
    return (
      <div className="app-container py-8 text-sm text-muted-foreground">
        Načítání uživatele…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
