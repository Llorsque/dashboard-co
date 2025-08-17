# Sport Fryslân – Client-side Data Dashboard

Een volledig client-side dashboard (zonder backend) dat je op GitHub Pages kunt hosten.
Upload een Excel/CSV-bestand en filter/vergelijk cijfers in een tegel- (vakken)weergave.
Er zijn **geen grafieken of tabellen** – alleen tegels met aantallen en percentages.

## Pagina's
- **Dashboard** – kerncijfers op basis van filters.
- **Vergelijker** – vergelijk twee filter-sets naast elkaar.
- **Kaart** – kaartweergave op basis van kolommen `latitude`/`longitude`.
- **Uitleg** – handleiding en conventies voor data.
- **Instellingen** – themakleuren, typografie, veldmapping en reset.

## Quick start
1. Maak een nieuwe GitHub-repository aan en upload de bestanden uit deze map.
2. Zet **GitHub Pages** aan (Settings → Pages → Build from branch → `main` → `/root`).
3. Open de live-URL en upload een **.xlsx** of **.csv**.
4. Stel in **Instellingen** de veldmapping in (bijv. `naam`, `gemeente`, `latitude`, `longitude`).

## Data eisen
- Ondersteunt `.xlsx` (eerste werkblad) en `.csv` (met header).
- Voor **percentages** wordt standaard het totaal aantal rijen gebruikt (na filter).
- **Kaart** werkt als je kolommen `latitude` en `longitude` hebt (in decimale graden).
- Vrije veldnamen; stel mapping in onder **Instellingen**.

## Branding
- Kleur `--brand` is `#212945` (donkerblauw).
- Accentkleur `--accent` is `#52E8E8` (lichtblauw).
- Typografie: **Archivo** (Google Fonts).
- Alles is aanpasbaar via **Instellingen** en wordt opgeslagen in `localStorage`.

## Ontwikkeling
- Pure HTML/CSS/JS – geen bundlers nodig.
- Externe libs via CDN:
  - [SheetJS](https://sheetjs.com/) voor Excel inlezen.
  - [Leaflet](https://leafletjs.com/) voor de kaart.
- Client-side router (hash-based).

## Licentie
MIT
