# The Franchise Wars v0.2.0 — Contractor Orientation

Foundry VTT v14 / dnd5e v6 module.

Imported content:
- Professional Session 0 contractor-orientation suite
- 24 spine missions
- 13 corporate dossiers
- 68 franchise dossiers
- Bestiary
- Magic items & corporate merchandise
- Final Contract
- Campaign Flowchart
- DM tables
- Brandmere city overview scene
- 300 unique deduplicated runtime art files (336 source image files scanned)

## Install
Extract the `franchise-wars` folder into Foundry Data/modules, restart Foundry, enable the module in a dnd5e v6 world on Foundry v14. The first GM load imports/updates managed journals. Session 0 includes GM-only and player-facing journals with the player orientation, table policy, specialist positions, communal backstory workshop and personnel file ready to use.

## Safety of GM edits
Managed documents use stable source IDs and content hashes. If an update finds that a GM changed a managed journal, it creates a recovery copy before refreshing the generated version.

## Roll requests
The campaign prose contains dnd5e v6 check/save enrichers for explicit DCs found in the source. The GM API also exposes requestCheck/requestSave methods that post Franchise Wars-branded chat cards.


## Release workflow
Every published revision uses one synchronized semantic version across `module.json`, release notes, the GitHub ZIP filename, and the Google Drive archive. The canonical ZIP naming convention is `franchise-wars-vX.Y.Z.zip`.
