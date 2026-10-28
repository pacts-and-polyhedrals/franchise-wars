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

## Upgrading from 0.5.x
On first GM load the module re-imports everything. Journals and actors you edited are copied to the Recovery folders first. The 4 superseded actors move to *Retired Duplicates (safe to delete)*. Tokens are only pre-placed on scenes that have no managed tokens yet; run the **FW: Re-import Battlemaps (force)** macro to restage every map.

## Requirements
Foundry VTT v14 and dnd5e v6. The core-opposition clones and the pregens' class features need the dnd5e SRD compendiums, which ship with the system.
