
  # Design barter marketplace PWA

  This is a code bundle for Design barter marketplace PWA. The original project is available at https://www.figma.com/design/NvbXYpgbs9Lg3AEJvV4LWS/Design-barter-marketplace-PWA.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Firebase (realtime chat)

  1. V [Firebase Console](https://console.firebase.google.com) vytvořte projekt, zapněte **Authentication** → **Anonymous** a **Cloud Firestore** (produkční režim).
  2. Nasaďte pravidla z `firestore.rules` (Firebase → Firestore → Pravidla). Pro dotaz v seznamu chatů vytvořte **složený index**: při prvním spuštění v konzoli uvidíte odkaz „Create index“.
  3. Zkopírujte `/.env.example` do `/.env` a doplňte `VITE_FIREBASE_*` z Project settings.
  4. Volitelně: `VITE_DEMO_OPPOSITE_UID` = UID druhého testovacího uživatele (Authentication), aby šel chat 1:1 mezi dvěma účty.

  Bez `.env` zůstává chat v režimu statického náhledu (mock zprávy).

  ## Bezpečnost (nasazené v repu)

  - **`firestore.rules`:** při `update` dokumentu `chats` se **nepřepisuje** pole `participantIds` (kontrola vůči původnímu záznamu) – ochrana před vyhozením druhé strany. Zprávy: jen pole `senderId`, `text`, `createdAt` a text max. **5000** znaků. Mazání chatu/zpráv z klienta není povoleno.
  - **Klient:** odeslání zprávy ořezané na stejnou max. délku; URL fotek u nabídek pouze `http`/`https` (filtr v `userOfferForms`).
  - Dále: [Firebase App Check](https://firebase.google.com/docs/app-check), reálné přihlášení a CSP na produkčním hostingu dle dřívějšího security auditu.
