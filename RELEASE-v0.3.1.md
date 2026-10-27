# The Franchise Wars v0.3.1

Corrective release for Foundry VTT v14 / D&D5e 6.0.6.

## Corrected in this release

- Rebuilt the Actor-art mapping from the Franchise Wars Art Asset Bible / named production sequence instead of franchise-name filename matching.
- Corrected all recovered custom portrait assignments for the 68 franchise managers, recurring cast, Team Deliverables, corporate/board Actors and bespoke foes.
- Ensured every custom Actor portrait and prototype-token image are identical.
- Removed all logo, storefront and headquarters substitutions from Actor portrait/token fields.
- Added an inspectable `data/actor-art-map.json` plus `ACTOR-ART-AUDIT-v0.3.1.md`.
- Fixed Foundry dark-theme journal contrast across normal reading and ProseMirror editing surfaces.
- Installed the campaign author's final 2048x1536 `Brandmere.webp` as `MAP-BRANDMERE__brandmere-official-city-map.webp`, the sole canonical Brandmere city Scene and Gazetteer image.
- The previous Brandmere maps remain superseded reference copies; the official Scene is updated in place on import.

## Explicit original-art recovery gap

The production record confirms six custom originals were generated but their exact standalone binaries are not present/identifiable in the recovered 300-file runtime bundle: **Auntie Vermillia (CO-10c), TK-01 Compliance Officer, TK-02 Senior Auditor, TK-04 Mother Culture, TK-05 Golden Tusk Construct, and TK-07 Shop Steward (Unseen Servant Collective)**.

Those Actors deliberately use a neutral Foundry placeholder in v0.3.1. No unrelated art is substituted. Sebastian Brew-Hartley and Deuce Marchetti also use a neutral placeholder because the recovered Art Asset Bible does not specify dedicated portraits for those public-face Actors.

See `ACTOR-ART-AUDIT-v0.3.1.md` for the complete mapping.
