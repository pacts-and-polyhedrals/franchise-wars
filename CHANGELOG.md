# v1.1.4 — Handouts to Chat, Readable Cards
**Readable chat cards**
- Contract slips, read-aloud boxes, briefs and handouts sent to chat are now dark ink on paper. Foundry's dark chat theme was painting table cells dark under dark text.
- Table labels no longer break mid-word ("Cont / ract / grad / e"), and wide tables shrink to fit the chat panel.
- "Send contract to chat" now posts the job slip as a styled slip, not italic narration.

**Handouts go to chat, not to the journal**
- Every handout button in the guides (377 of them, now labelled "Send handout to chat") posts just that page to chat, keeping its paper, memo, parchment, note or infernal style.
- No journal permissions change, so players never get access to the rest of the handout journal.
- Every handout page (262) has its own **Send to chat** button at the top, so you can push one straight from the handout journals.
- One-time cleanup on first load: handout journals that older versions opened up (Limited for everyone, pages set to Observer) are made GM-only again.
- Tip: avoid Foundry's own "Show Players" button on handout journals, because it shares the whole journal. Use Send to chat instead.

# v1.1.3 — Every Character Has a Face
**Art**
- Added the 63 new portraits (FW_PT-45 to PT-107), each as a portrait and a token, and updated 86 NPC cards in the mission and contract guides to show them.
- Every actor in the campaign now has its own portrait (345 actors). The only shared image is Petronella Fizzwick's, used by her two sheets for the same character.
- Gregory Latch (PT-107) and Innkeeper Nod Bramblewick (PT-49) no longer share a picture. Azhure (PT-50) now has his own blue portrait.

**Duplicates merged**
- Madam Ossifer: the contract copy is merged into the FR-62 franchise sheet. Her library portrait is kept and PT-85 becomes her token.
- Hrothga the Mild: merged into FR-49 with the PT-78 portrait (FR-49 previously showed a tavern scene).
- Old sheets move to *Retired Duplicates (safe to delete)*, and every link and map token points to the merged sheet.

**Stat blocks matched to the level they're met at**
- Old Mister Kessik: Mummy at 130 hp, CR 9 (was a CR 21 Lich), with Eleven Herbs, Royalty of Spite and Unpaid Rejuvenation.
- Madam Ossifer: a sleepy beholder at CR 4 (Basilisk mechanics, flying) with Dreaming Eyes and Waking Eye Ray. She was a CR 15 Mummy Lord without the Monster Manual.
- The House Croupier: a lesser rakshasa at 60 hp, CR 5, as its contract specifies. Sallow & Tine: two junior-partner rakshasas at 110 hp, CR 8 each. Their top-tier spells are removed.
- HOT NOW: CR 1 (Magma Mephit mechanics) with Brand Flare and the DC 14 Arcana fryer binding (was a CR 5 Fire Elemental at level 2).
- Thaddeus Quell: CR 2 for S04 (Cult Fanatic mechanics) with Order for Inventory Reduction; use the Corporate Research Mage stats in S11.
- Order No. 9: a CR 4 half-assembled slaad with Still Assembling and Special Sauce (was a CR 9 Gray Slaad).
- Mother Rime & Sister Brine: two Night Hags (CR 5 each) sharing Coven Magic (was one CR 2 Sea Hag).
- Baroness Ishrae: CR 5 with a 50 ft swim speed, Blood Frenzy and Shark Court. Without the Monster Manual she is built on a Veteran rather than a CR ½ Sahuagin.
- Evander Keen falls back to a Ghost rather than a Commoner, and gains The Saddest Song.
- The Runaway Scoop: 30 hp, CR 1 for level 1.
- New signature features: Lucky Twenty's Stolen Luck (20/day), King Dunstan's Royal Pardon, the Legion Ballista crew's ballista attack, and Gregory Latch's infernal traits (built on a Noble).
- Ember knows Fire Bolt and Burning Hands; Jory knows Mage Hand and Unseen Servant.
- Each rebuilt sheet says what changed in a stat note at the end of its biography. All new features have dnd5e roll activities.

# v1.1.2 — Full Art Audit
- Matched all 688 images of the full art audit against the 352 actors.
- New portraits and tokens: Ada Fairweather (PT-35), Skarrow Vane (PT-36), Collector Grix (PT-37), the Clerk of the First Sale (PT-38), Foreman Gerrit Hask (PT-39), Arbiter Maud Penhallow (PT-40), Fennel (PT-41), Tobin (PT-42) and Verdigris (PT-44, the blue-green twin).
- Brewmaster Hilde Stonecask now uses the unused dwarf-brewer library portrait. Store Security Guard now uses unregistered output 03.
- Compliance Officer, Former Employee Still on Payroll and Zero-Hour Kitchen Skeleton now have two token faces each (unregistered outputs 01, 02 and 04), so groups of them don't look identical. Each pre-placed token alternates between the faces.
- 17 NPC cards in the mission and contract guides now show the new portraits.
- PT-43 (orange-red dragonborn) is not assigned: Azhure is blue throughout the guides. Azhure keeps the shared Quarterly Storm Dragon art until there is a blue portrait.
- Fixed: the act-map renumbering in v1.1.1 stopped patrons appearing on seven act franchise maps. They're back (680 patrons on 64 maps).
- 289 of 352 actors now have a unique portrait; the 63 still needing one are listed in Franchise-Wars-Portrait-Audit-v2.csv.

# v1.1.1 — Map Staging
- **No duplicate named characters.** A named NPC is placed once per map, even when several scenes share that map. Extra copies from a foe count (for example "×3") become that character's generic counterpart. Team Deliverables ×4 now places Brixley, Thorne, Luma and Oggo. Generic creatures such as Compliance Officers still appear in numbers.
- **Token art fits the token.** Some SRD 5.2 stat blocks set the token image to 2× scale. Every Franchise Wars token now uses 1× scale with the image fitted to the frame, so Large creatures fill their own 2×2 space and no more.
- **Customers on every franchise map.** A new *Franchise Patron* actor (Commoner) with 12 original faces is seated at tables, stools and booths, or browsing shelves in shops, on 64 franchise maps (680 patrons). They are visible and neutral; kitchens, cellars, vaults and back offices are left empty. Each new patron you drag in picks a random face, and you can replace the art in `assets/art/patrons/`.
- **Maps listed in play order.** Each act's maps are numbered in order of first use and show the mission, for example "01 · S01 · QuestRabbit Warren". Scene folders are sorted manually, in campaign order, in the world and in the Battlemaps compendium.
- **Updating:** encounter tokens you haven't moved are restaged automatically. If you've already moved some and want the new staging anyway, run *Content Manager → Re-import battlemaps only*.

# v1.1.0 — Compendiums, Content Manager and the v0.6.0 merge
**Compendiums**
- The whole game now ships as 8 prebuilt compendiums in a **The Franchise Wars** folder in the Compendium sidebar: Campaign Journals (GM), Player Handbook & Session 0 (players can open it), Actors, Bosses & Pregens, Items, Battlemaps, Roll Tables, Ambience and GM Macros.
- The battlemaps carry their walls, lights, hidden encounter tokens, guide pins and ambient sound. Use *Import All Content* with **Keep Document IDs** ticked so tokens and pins stay linked.
- Map backgrounds are applied to the v14 Level automatically when a battlemap comes in from the compendium.
- Journal links resolve to the compendium copy when a document isn't in the world yet.
- The reskinned core opposition is built in from the free dnd5e SRD, 5.2 first and then 5.1. Where the campaign uses a non-SRD creature (for example Death Knight), the compendium copy uses the nearest SRD creature and says so on the sheet. The world import still uses the real stat block if you own that book.

**Game Settings → The Franchise Wars**
- **Open Content Manager** button: re-import everything (forced, with recovery copies of your edits), re-import only the battlemaps, import changes only, copy the world's versions into world compendiums, open the tracker, or reset campaign progress.
- New setting **Import campaign into this world automatically** (on by default). Turn it off to work only from the compendiums.
- New macro **FW: Re-import Everything (force)**.

**Merged from v0.6.0**
- Mortimer Pell is one sheet: the Mascot Revenant carries the Wight Castle night-manager history, and the old FR-05 sheet moves to Retired Duplicates. All 13 guide links and the map tokens now point at the merged sheet.
- The Five Harrow brothers now each have their own sheet (Wight, 60 hp), so S09 can put all five on the map. The collective sheet is kept.
- Cover art added to 38 journals, including all 24 mission handout journals.
- The Command Centre lists the eight route-changing side contracts and what each one changes later in the campaign.
- Doris Plank and Hal Grundy gain the v0.6.0 identity paragraphs; Granny Quean is CR 9.
- Already in 1.0.x and kept: the combat templates for named bosses, the named NPC sheets, the Gideon Tumble's Notebook correction, the Doris and Hal consolidations, and full guides for all eight side contracts. The 1.0.x guides are longer than the v0.6.0 summaries.
- Not merged: the v0.6.0 merge of FR-59 into Gregory Latch, which would delete Innkeeper Nod Bramblewick, the client in the Long Rest Inn contracts. The v0.6.0 draft-portrait review gallery is also not merged, because the final Drive art replaces those drafts.

# v1.0.1 — Import Fix
- Fixed the import failure: Tallis Vend's HP formula held text ("see Entry 1"), which Foundry rejects. The import stopped there.
- One bad actor can no longer stop the import. Failures are skipped, counted in a warning and listed in the console; the rest of the campaign imports normally.
- Every reskinned creature now has a chain of free-SRD stand-ins. Death Knight, Beholder, Champion, Helmed Horror, Bheur Hag and the other non-SRD stat blocks resolve from the books you own; without those books the closest SRD creature is used, so no actor goes missing. The console says when a stand-in was used.

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
