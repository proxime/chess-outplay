# ♞ Chess Outplay

Aplikacja do gry w szachy **przeciwko AI**, nastawiona na naukę: po każdym ruchu
(Twoim i bota) pojawia się ocena ruchu oraz podpowiedź lepszej alternatywy.
Bez kont, bez bazy danych — wszystko działa lokalnie w przeglądarce.

## Funkcje

- ♟️ Gra przeciwko silnikowi **Stockfish 18** (WASM) na 4 poziomach trudności.
- 🔁 Cofanie i ponawianie ruchów (z możliwością rozegrania partii od nowa z dowolnego miejsca).
- 💡 Ocena każdego ruchu (Najlepszy / Dobry / Niedokładność / Błąd / Gafa) z najlepszą alternatywą.
- 🌱 Eksploracja wariantów — kliknij alternatywę (też dla ruchu bota), aby rozegrać „co by było gdyby".
- ✅ Wyłącznie legalne ruchy (egzekwowane przez `chess.js`), podświetlanie pól.
- 🧠 Cała logika i stan po stronie klienta — gotowe do deployu jako statyczna strona.

## Uruchomienie

```bash
npm install
npm run dev      # serwer deweloperski
```

Inne polecenia:

```bash
npm run build        # type-check + build produkcyjny (-> dist/)
npm run preview      # podgląd buildu produkcyjnego
npm test             # testy jednostkowe logiki (vitest)
npm run engine:smoke # headless test silnika (Node): czy zwraca bestmove
npm run engine:copy  # odśwież pliki Stockfisha z node_modules do public/engine
npm run screenshot   # zrzuty ekranu gry (wymaga: npx playwright install chromium)
npm run build:extension # zbuduj wtyczkę do dist-extension/ (Wczytaj rozpakowane)
```

## Architektura

```
src/
  engine/     integracja Stockfisha + ocena ruchów (czyste, testowane)
    engine.ts     wrapper Web Workera (serializowane zapytania UCI)
    uci.ts        parsowanie protokołu UCI
    evaluate.ts   strata centypionków + klasyfikacja ruchu
    levels.ts     4 poziomy trudności -> opcje UCI
  game/       model stanu gry (niezależny od UI)
    chess.ts        reguły, odtwarzanie pozycji, materiał (chess.js)
    gameReducer.ts  historia + kursor (undo/redo, ucinanie przyszłości)
    useChessVsBot.ts  hook spinający całość — JEDYNE API dla UI
  components/  warstwa prezentacji (design „Ekran gry" z Claude Design)
public/engine/  pliki silnika Stockfish (lite, single-threaded, ~7 MB)
```

Sercem aplikacji jest hook `useChessVsBot()` — UI to czysta prezentacja czytająca
z niego stan. Dzięki temu docelowy design można podpiąć bez zmian w logice.

### Silnik

Używamy buildu **lite, single-threaded** (`stockfish-18-lite-single`) z paczki
[`stockfish`](https://www.npmjs.com/package/stockfish) (Stockfish.js / chess.com).
Nie wymaga nagłówków COOP/COEP ani osobnego pliku sieci NNUE (jest wbudowana),
więc działa jako zwykła statyczna strona. Silnik chodzi w Web Workerze; jego
pliki serwujemy z `public/engine/` (ścieżką absolutną — identycznie w dev i prod).

> Stockfish jest na licencji **GPLv3** — dystrybucja aplikacji podlega jej warunkom.

## Deploy (Vercel)

Vite wykrywany jest automatycznie (`buildCommand: npm run build`,
`outputDirectory: dist`). Konfiguracja w `vercel.json`. Ponieważ silnik działa
po stronie klienta, nie jest potrzebny żaden backend ani funkcje serverless.

## Wtyczka do przeglądarki (Chrome / Edge)

Ten sam kod działa jako rozszerzenie — pływający panel w rogu dowolnej strony.
Apka żyje w `<iframe>` z origin rozszerzenia, więc silnik/WASM korzystają z CSP
rozszerzenia (działa niezależnie od CSP odwiedzanej strony).

```bash
npm run build:extension      # tworzy folder dist-extension/
```

Następnie: `chrome://extensions` → włącz **Tryb dewelopera** → **Wczytaj
rozpakowane** → wskaż folder `dist-extension/`. Panel otwierasz przyciskiem
♞ w rogu strony lub ikoną rozszerzenia na pasku.

Źródła rozszerzenia: `extension/` (`manifest.json`, `content.js`, `background.js`,
`icons/`). Build kopiuje je razem z `dist/` do `dist-extension/`.

## Status

Web (desktop + responsywny widok kompaktowy/mobilny) oraz wtyczka do przeglądarki
(pływający panel) — wszystko spięte z silnikiem i pełną logiką, na bazie makiet
z Claude Design.
