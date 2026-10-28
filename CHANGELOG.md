# v1.0.0 — The Full Campaign
The first complete release: every actor has art, every map is staged, and the GM has live tools for the finale.

**Art and opposition**
- All art from the Drive folder is now on the actors and journals that use it: 182 portraits and 182 tokens.
- The 165 core-opposition actors are renamed and reskinned as Franchise Wars creatures, with their own art and a reskin note. The D&D 5e stat block stays underneath as the hidden mechanical source.
- New core opposition to cover the whole campaign: Store Security Guard, Gelato-Soaked Rat Swarm, Display-Case Cube, Quarterly Storm Hatchling and Legion Siege Ballista (crew).
- The new **Core Opposition Directory** journal lists every reskinned creature by faction (24 pages).
- Boss and corporate sheets are complete stat blocks. Duplicates are resolved: the four superseded actors move to *Retired Duplicates (safe to delete)*.
- Every invented NPC has a sheet: 23 mission-guide NPCs and 45 side-contract NPCs.
- Mission and contract guides show NPC portraits and foe tokens.

**Content**
- 146 side contracts, each with a full guide: player contract slip, DM briefing, three scenes, opposition and payoff, and handouts. This includes the Platinum board-seat contracts.
- 6 new lair battlemaps for S19 (the seven dragons). S23 gains a holdout table and S24 gains epilogue vignettes.
- New **Player Handbook** journal (player-visible): Brandmere for contractors, how the work works, evidence and Leverage, house rules, safety.
- 5 pregenerated level-1 contractors with original ID-badge portraits. Class, species, background, gear, features and spells are pulled from your dnd5e compendiums.
- 8 roll tables: contract types, euphemisms, McGuffin toys, franchise complications, a random Final Contract clause, QuestRabbit reviews, a slogan generator and memos from Head Office.

**Battlemaps**
- 397 encounter tokens are pre-placed hidden on their maps. They are only placed if the scene has none.
- 114 map pins open the matching guide scene.
- 60 Scenes link to their guide page.
- 114 maps have ambient sound.
- New playlist: *The Franchise Wars — Ambience*, 9 original seamless loops.

**GM tools**
- **Campaign Tracker** window: Act, Rabbit Rating, the QuestRabbit cut, Grey Creep, Leverage and seat for each corporation, Final Contract clauses, and the Commons Tally.
- **Clause Debate** window, run by the S24 rules: DC 18 with the Receipt, DC 25 without; three Tally witnesses can void a clause; failure triggers a Ledger Entry; Vend stands at six voided clauses.
- **Board Vote** window, run by the S23 rules: the motion needs six seats flipped or removed. You can demand a proxy for 2 Leverage, and the Tally applies disadvantage.
- Buttons for all three in the Journals sidebar, plus macros in a *The Franchise Wars* macro folder.
- New `@FWLev` journal button that records Leverage and announces it.
- Actor recovery: a GM-edited managed actor is copied to *Recovery* before an update overwrites it.
- `game.franchiseWars.exportToCompendiums()` copies all managed documents into world compendiums.

**Package**
- Art re-encoded to cut the download size.
- GitHub release workflow added (`.github/workflows/release.yml`).
- Printable handouts PDF and GM sourcebook PDF published alongside the release.

# v0.5.1 — Actor Quick References
- Any ability that relies on outside detail now carries that detail on the sheet. Each one has a gold reference box under its description, and the actor's Biography ends with a **GM Quick Reference** section.
  - **Mascot Revenant (Mortimer Pell):** the full d12 Murder King slogan list and what each slogan means (Have It Our Way). How to lay him to rest and the killer's name (Unfinished Shift). Big Wave lines.
  - **Compliance Officer:** d8 breaches to read aloud for Citation, plus lines and behaviour.
  - **Veronique Salt:** d6 Folio sentences (Always Has a Contract), d6 prices (Counteroffer), Hostile Negotiation lines, linked bodyguard stat blocks, and her arc by mission.
  - **Tallis Vend:** true facts for Quill Strike, example Ledger Entry sentences, how to end him (Entry 1), and the Clause Debate rules.
  - **Golden Tusk Construct:** the Notarial Oath text and how to use it against the construct.
  - **Shop Steward:** the six strike demands and what counts as "heard" (Walkout), plus how it spells words.
  - **Mother Culture and Senior Auditor:** voice lines and what calms or drives them.
- Gave 22 franchise staff and corporate NPCs a signature-quirk reference with ready-made lines. Examples: Saffron's affirmations, the Harrow brothers' one-word-each speech, Zip-Zip's thirty-words-a-second patter, Maxim Knell's self-narration, Skritch's letter to the dragon, Tamsin's birthday song and the Gelatinous Cube freezer lullaby.
- Cloned NPCs now get real feature items for traits that existed only as description text:
  - Team Deliverables: Credit Theft.
  - Rook: Foresight and Compelled Courier.
  - Aldric: Vengeful Revenant and Eat the Fallen.
  - Ixabeth Vorr: Objection, Sustained.
- Clones also got reference boxes:
  - Brixley's d12 corporate jargon.
  - Thorne's six named swords.
  - Luma's rate card.
  - Oggo's brochure god.
  - Cadwyn's song for Room 303.
  - The dragons' board grievances.

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
