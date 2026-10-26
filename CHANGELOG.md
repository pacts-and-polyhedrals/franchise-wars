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
