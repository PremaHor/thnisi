import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";

export function Privacy() {
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
          <h2 className="min-w-0 flex-1 text-balance">Ochrana osobních údajů</h2>
        </div>
      </div>

      <div className="app-container prose prose-sm max-w-none py-6 pb-8">
        <p className="text-muted-foreground mb-4">Poslední aktualizace: 21. dubna 2026</p>

        <h3>1. Jaké údaje shromažďujeme</h3>
        <p className="text-muted-foreground">
          Shromažďujeme údaje, které nám sdělíte přímo: jméno, e-mail, údaje v profilu a obsah, který na platformu vložíte.
        </p>

        <h3>2. Jak údaje používáme</h3>
        <p className="text-muted-foreground">
          Údaje používáme k zprostředkování směn, ke zlepšování služeb a ke komunikaci ohledně vašeho účtu a aktivit.
        </p>

        <h3>3. Sdílení informací</h3>
        <p className="text-muted-foreground">
          Vaše osobní údaje neprodáváme. Informace v profilu a nabídky jsou viditelné ostatním uživatelům za účelem směny.
        </p>

        <h3>4. Zabezpečení dat</h3>
        <p className="text-muted-foreground">
          Uplatňujeme opatření k ochraně vašich dat; žádný systém však není zcela bez rizika. Přihlašovací údaje si střežte sami.
        </p>

        <h3>5. Cookies a měření</h3>
        <p className="text-muted-foreground">
          Používáme cookies a podobné technologie ke zlepšení používání služby a analýze provozu platformy.
        </p>

        <h3>6. Vaše práva</h3>
        <p className="text-muted-foreground">
          Máte právo na přístup, opravu nebo výmaz osobních údajů. Pro uplatnění práv nás kontaktujte.
        </p>

        <h3>7. Děti a mládež</h3>
        <p className="text-muted-foreground">
          Služba není určena osobám mladším 18 let. Vědomě nesbíráme údaje od dětí.
        </p>
      </div>
    </div>
  );
}
