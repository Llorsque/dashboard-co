# Sport Fryslân – Client-side Data Dashboard

- 100% client-side (host op GitHub Pages).
- Upload Excel/CSV via **Kies bestand** en klik **Laad dataset** om zichtbaar te maken.
- 12 vaste tegels (4×3), geen grafieken of tabellen.
- 4 dropdownfilters: Gemeente, Sportbond, Sport, Doelgroep.
- Extra pagina's: Vergelijker, Kaart, Uitleg, Instellingen.

## Publiceren
1. Nieuwe GitHub-repo maken, alle bestanden uploaden.
2. Settings → Pages → Build from branch → `main` → `/root`.
3. Open de Pages-URL.


## Gemeentegrenzen tonen (kaart)
1. Download een GeoJSON met **gemeentegrenzen Friesland** (bijv. via PDOK / CBS).
2. Sla dit bestand op als: `data/friesland-gemeenten.geojson` (exacte bestandsnaam).
3. Open de **Kaart**-pagina en zet de toggle **Toon gemeentegrenzen** aan.
4. Als je een **Gemeente**-filter kiest, wordt die grens extra geaccentueerd.
