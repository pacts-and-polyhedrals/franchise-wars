# QA — v0.6.0

## Static package checks

- `module.json`, actor data, journal data, and the actor-art map parse as JSON.
- `scripts/main.mjs` passes Node syntax checking.
- Every local art path referenced by an Actor, journal cover, clone, or art-map record exists in the package.
- Every Actor link used by the journals resolves to a managed Actor entry or compendium clone.
- All 24 mission handout journals have matching cover art.
- The eight expanded side-contract pages are present and linked from the Contractor File.
- The named boss sheets resolve through native dnd5e compendium templates at import; Granny Quean is configured to 150 HP.

## Live Foundry checks not run

No Foundry v14 world was available here. Fresh install, upgrade from 0.4.x, player permissions, handout reveal flow, and interactive guide buttons still need a live-world pass.
