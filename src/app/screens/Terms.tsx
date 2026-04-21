import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";

export function Terms() {
  const navigate = useNavigate();

  return (
    <div className="app-screen">
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 pt-safe backdrop-blur">
        <div className="app-container flex items-center gap-2 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-secondary transition-colors sm:-ml-1"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="min-w-0 flex-1 text-balance">Podmínky služby</h2>
        </div>
      </div>

      <div className="app-container prose prose-sm max-w-none py-6 pb-8">
        <p className="text-muted-foreground mb-4">Poslední aktualizace: 21. dubna 2026</p>

        <h3>1. Souhlas s podmínkami</h3>
        <p className="text-muted-foreground">
          Používáním TrhniSi vyjadřujete souhlas s těmito podmínkami a zavazujete se je dodržovat.
        </p>

        <h3>2. Chování uživatelů</h3>
        <p className="text-muted-foreground">
          Při směně zboží a služeb se chovejte slušně a poctivě. Podvodné jednání může vést k okamžitému zablokování účtu.
        </p>

        <h3>3. Pravidla směny</h3>
        <p className="text-muted-foreground">
          Všechny směny probíhají v dobré víře. Uživatelé odpovídají za pravdivý popis nabídek a za splnění domluvené směny.
        </p>

        <h3>4. Vlastnictví obsahu</h3>
        <p className="text-muted-foreground">
          K obsahu, který zveřejníte, zůstáváte vlastníkem; současně nám udělujete licenci k jeho zobrazení a šíření v rámci platformy.
        </p>

        <h3>5. Omezení odpovědnosti</h3>
        <p className="text-muted-foreground">
          Platforma usnadňuje kontakt mezi uživateli. Neodpovídáme za kvalitu, bezpečnost ani legalitu směňovaných předmětů.
        </p>

        <h3>6. Ukončení účtu</h3>
        <p className="text-muted-foreground">
          Vyhrazujeme si právo ukončit nebo pozastavit účty porušující tyto podmínky bez předchozího upozornění.
        </p>
      </div>
    </div>
  );
}
