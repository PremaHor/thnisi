import { Navigate, Outlet, useLocation } from "react-router";
import { useFirebase } from "../contexts/FirebaseContext";

export function ProtectedRoute() {
  const { loading, isAuthenticated } = useFirebase();
  const location = useLocation();

  if (loading) {
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
