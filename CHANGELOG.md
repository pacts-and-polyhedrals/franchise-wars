# v0.5.0 — Mission Guides
- Rewrote all 24 mission journals (S01–S24) as full DM guides of about 84,000 words in total. Each has a Contract Cover, a DM Overview (synopsis, background, running notes, threads, hook) and five Scene pages. The guide closes with Opposition & Tactics, NPC Dossiers, a Handouts index and Twist, Rewards & Aftermath.
- Every scene has boxed read-aloud text with a **Send to chat** button. It also has a DM description, area features, NPC play notes and a Checks & Roll Requests table, followed by lines to steal, developments, complications and scaling.
- Roll prompts are native dnd5e enrichers (`[[/check]]`, `[[/save]]`, `[[/r]]`). Each one also has a GM **Request** button that posts the roll card to chat with the mission code.
- Every NPC, creature, scene, item and journal mentioned links to its imported document (Actor, battlemap Scene, Receipt Item, franchise and corporation journals). Links resolve by module sourceId at render time.
- Added 24 handout journals in the Handouts folder, one per mission, with more than 110 player handouts in total. They are hidden by default; **Show to players** reveals a single page to everyone.
- Each Receipt box has an **Award Receipt & announce** button, which awards the Receipt Item and posts a "Receipt Acquired" card to chat.
- New enrichers: `@FWLink`, `@FWCheck`, `@FWSave`, `@FWChat`, `@FWShow` and `@FWReceipt`, plus mission-guide CSS.
- Updating re-imports the mission journals. Any of them you have edited are first copied to the Recovery folder.

# v0.4.1
- Fixed: battlemap Scenes imported with no background on Foundry v14. v14 stores the background image on the Scene's embedded Level; the importer now writes each map into the Scene's initial Level (creating a "Ground" Level if none exists).
- Updating from v0.4.0 repairs every already-imported Scene in place; walls, lights, tokens and GM edits are untouched.

# v0.4.0
- Added 124 top-down battlemap Scenes: 51 campaign story maps (Acts I–V, incl. the Tallow Lane siege variant), 58 franchise flagship venues and 15 reusable side-contract environments.
- All Scenes include pre-placed walls, doors, windows and ambient lights; dark locations start with global illumination off.
- Added Scene folder tree, thumbnails and the Battlemap Library journal.
- Scene importer now creates in batches, updates in place, and only replaces managed walls/lights when map geometry changes.
- Added `game.franchiseWars.importMaps({force})`.

# v0.3.0
- Added recurring/mission NPC actors (Pip Ashworth, Ixabeth Vorr, the Last Five-Star Party, Aldric, Rook and others).
- Expanded standard-opposition preload/fallback coverage for the full campaign.
- Made compendium clone imports idempotent and resilient to missing optional actor packs.
- Canonicalised Mortimer Pell across S02, Receipts and the Final Contract references.
- Added repository, manifest, download, readme, changelog and issue URLs to module.json.
- Converted all 337 franchise menu/product entries to native Foundry Items.
- Converted campaign magic merchandise and mission Receipts to native Items.
- Added native D&D5e NPC Actors for bespoke bestiary and recurring franchise/corporate cast.
- Added Team Deliverables and all explicitly referenced core opposition as installed-compendium clones.
- Added v6 Activities/Uses and correct current NPC movement/senses/type schema.
- Added item/actor idempotent import paths.

# Changelog

## 0.3.1 — Actor Art / Journal Contrast / Official Brandmere Map

- Rebuilt franchise staff art mapping from the Art Asset Bible and production briefs.
- Added Xoribble (FR-14), Kaito Rain (FR-28), Grubbo (FR-44), and Bellamy Quill (FR-63) as native NPC Actors.
- Assigned verified custom portrait/token art to all 68 franchise manager Actors.
- Assigned verified recurring-cast art and core-clone overrides for Team Deliverables, Ixabeth Vorr and Aldric.
- Canonicalised PT-10 as King Aldric the Unkind (revenant).
- Removed logo/storefront/headquarters substitutions from corporate/bestiary Actors where no exact portrait binary could be verified.
- Added actor-art audit data and a human-readable audit report.
- Fixed journal dark-theme contrast across page view and ProseMirror edit surfaces.
- Set the exact author-supplied 2048×1536 `MAP-BRANDMERE__brandmere-official-city-map.webp` as the canonical Brandmere city Scene and Gazetteer hero image; previous maps remain superseded reference copies.


## 0.2.0 — Contractor Orientation

- Adds a complete professional Session 0 journal suite under **00 — Command Centre → Session 0 — Contractor Orientation**.
- Adds GM Run Sheet, player orientation, house rules/table policy, QuestRabbit specialist positions, communal backstory workshop, personnel file, and DM hook-integration journals.
- Adapts the official Acquisitions Incorporated company-position subsystem to QuestRabbit while referencing rather than reproducing proprietary rules text.
- Adds default observer access for the player-facing Session 0 journals while keeping campaign-spoiler integration journals GM-only.
- Adds Open Door, campaign boundaries and Stars & Wishes directly to the module.
- Adds the established critical-hit, natural-1, potion, inspiration and blind-death-save house rules.
- Adds the three-job communal-history framework and character-to-character bond prompts.
- Adds `game.franchiseWars.openSessionZero()` for quick GM access.
- Adds Session 0 branding/layout styles.
- Preserves the v0.1.0 campaign content, managed-journal recovery protection, state trackers, roll-request cards and art library.

## 0.1.0 — First Playable Rendition

- First packaged Franchise Wars campaign module for Foundry VTT v14 and dnd5e v6.
- Imports the complete 24-session campaign spine as managed Journal Entries.
- Adds 13 corporation dossiers, 68 franchise dossiers, Brandmere, campaign systems, GM tables, player handouts, bestiary/items, and the Final Contract.
- Adds persistent campaign state for Rabbit Rating, Leverage, Commons Tally, Receipts, Board seats, mission state, clause state, current act, and Grey Creep.
- Adds Franchise Wars-branded dnd5e v6 check/save request cards.
- Adds managed-content recovery copies before source refreshes overwrite GM-edited generated Journals.
- Adds Brandmere city overview Scene.
- Packages the deduplicated Franchise Wars art library.
- Removes one invalid zero-byte duplicate WebP discovered during pre-release validation.
