# The Franchise Wars v1.1.0

Foundry VTT v14 / dnd5e v6 module.

Imported content:
- Player Handbook and 5 pregenerated level-1 contractors
- 146 side-contract guides with handouts
- 165 reskinned core-opposition actors plus bespoke bosses and NPCs, all with portraits and tokens
- 8 roll tables, an ambience playlist (9 original loops) and GM macros
- Campaign Tracker, Clause Debate and Board Vote windows (buttons in the Journals sidebar)
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
- 131 top-down battlemap Scenes with walls, doors, lights, hidden pre-placed encounters, guide pins and ambient sound (see the Battlemap Library journal)
- 300 unique deduplicated runtime art files (336 source image files scanned)

## Install
Extract the `franchise-wars` folder into Foundry Data/modules, restart Foundry, enable the module in a dnd5e v6 world on Foundry v14. The first GM load imports/updates managed journals. Session 0 includes GM-only and player-facing journals with the player orientation, table policy, specialist positions, communal backstory workshop and personnel file ready to use.

## Safety of GM edits
Managed documents use stable source IDs and content hashes. If an update finds that a GM changed a managed journal, it creates a recovery copy before refreshing the generated version.

## Roll requests
The campaign prose contains dnd5e v6 check/save enrichers for explicit DCs found in the source. The GM API also exposes requestCheck/requestSave methods that post Franchise Wars-branded chat cards.


## Release workflow
Every published revision uses one synchronized semantic version across `module.json`, release notes, the GitHub ZIP filename, and the Google Drive archive. The canonical ZIP naming convention is `franchise-wars-vX.Y.Z.zip`.


## v0.3.0 Native D&D5e Documents
- 372 managed world Items generated from franchise menus/products, campaign magic merchandise, and mission receipts.
- 89 managed native NPC Actors plus 134 installed-compendium Actor clones for Team Deliverables and core opposition.
- Uses dnd5e v6 Item/Actor documents, consumable subtypes, item Uses and Activities, current NPC movement/senses fields, and embedded monster features.
- Core-book opposition is materialised from the user's installed dnd5e Actor compendia at import time rather than bundling stale or third-party stat blocks.


## v0.3.1 art and journal correction

This release replaces franchise-logo/storefront Actor substitutions with audited custom portraits, adds the four omitted franchise managers, hardens journal contrast for Foundry dark themes, and makes the user-approved labelled Brandmere map the canonical city scene. See `ACTOR-ART-AUDIT-v0.3.1.md` and `data/actor-art-map.json`.


## v0.4.0 Battlemap Library

124 tactical Scenes (100 px grid): 51 story maps across Acts I–V, a flagship venue for every remaining franchise (58), and 15 reusable side-contract environments. Walls, doors, windows and ambient lights are pre-placed. Re-import with `game.franchiseWars.importMaps({force:true})`. See `RELEASE-v0.4.0.md`.


## v1.0.0 GM tools
Open the Journals sidebar: **Tracker**, **Clauses** and **Board** buttons sit at the top. The same windows are available as macros and as `game.franchiseWars.openTracker()`, `openClauseDebate()` and `openBoardVote()`. `game.franchiseWars.exportToCompendiums()` copies everything into world compendiums. See `RELEASE-v1.0.0.md`.


## v1.1.0 Compendiums and Content Manager
The module ships 8 compendiums in a *The Franchise Wars* folder. **Game Settings → Configure Settings → The Franchise Wars → Open Content Manager** re-imports everything into the world (forced), re-imports maps, or resets campaign progress. Turn off *Import campaign into this world automatically* to work from the compendiums only.
