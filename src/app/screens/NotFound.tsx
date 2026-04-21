import { Link } from "react-router";
import { AlertCircle } from "lucide-react";
import { AppLogo } from "../components/AppLogo";
import { Button } from "../components/Button";

export function NotFound() {
  return (
    <div className="app-screen items-center justify-center px-4 text-center">
      <div className="mb-6 flex justify-center">
        <AppLogo to="/" size="md" />
      </div>
      <AlertCircle className="mb-4 h-16 w-16 shrink-0 text-muted-foreground" />
      <h1 className="mb-2 max-w-md text-balance">Stránka nenalezena</h1>
      <p className="mb-6 max-w-md text-balance text-muted-foreground">
        Hledaná stránka neexistuje nebo byla přesunuta.
      </p>
      <Link to="/">
        <Button>Domů</Button>
      </Link>
    </div>
  );
}
