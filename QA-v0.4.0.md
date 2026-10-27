# QA — v0.4.0

- Scenes: 125 (Brandmere + 124 battlemaps)
- Walls: 8,149 (771 doors) · Ambient lights: 1,098
- All Scene `img`/`thumb` paths resolve inside the package; no wall segment outside Scene bounds; no zero-length walls.
- Wall placement verified by overlay against the painted walls on story, eatery, tavern, inn, carved-cave and street maps.
- `scripts/main.mjs` passes `node --check`.
- Journal entries: 122 (adds Battlemap Library).
