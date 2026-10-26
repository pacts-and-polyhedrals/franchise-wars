# The Franchise Wars — v0.2.0

**Release channel:** Contractor Orientation  
**Foundry:** v14  
**System:** dnd5e v6  
**Publisher:** Pacts & Polyhedrals

## Release identity

Canonical ZIP: `franchise-wars-v0.2.0.zip`

The ZIP contains a single top-level `franchise-wars/` directory for direct GitHub release use or manual extraction into `Data/modules/`.

## New in v0.2.0

- Professional Session 0 contractor-orientation suite integrated into the managed Journal importer.
- GM-only live run sheet with campaign pitch, timing, spoiler controls and closeout checklist.
- Player-facing orientation journal with the Brandmere/QuestRabbit premise and character-creation requirements.
- House rules, table policy, Open Door, boundaries and Stars & Wishes journal.
- QuestRabbit specialist-position guide referencing the official *Acquisitions Incorporated* subsystem.
- Three-job communal backstory workshop, PC bond prompts, shared NPC and keepsake creation.
- Contractor Personnel File with core and private backstory questions.
- GM hook-mapping journal that ties Session 0 answers to Brandmere without revealing hidden campaign systems.
- Player-facing Session 0 journals default to Observer access; spoiler journals remain GM-only.
- `game.franchiseWars.openSessionZero()` quick-access API.

## Preserved from v0.1.0

- 24 campaign spine missions
- 13 corporation dossiers
- 68 franchise dossiers
- Brandmere city overview and Scene
- Campaign systems and trackers
- Bestiary and corporate merchandise/item material
- GM tables and player handouts
- Final Contract content
- Managed Journal importer and recovery-copy protection
- dnd5e v6 check/save enrichers and branded GM roll-request cards
- Runtime art library and art registry

## First-world installation

1. Install/activate Foundry VTT v14 and dnd5e v6.
2. Place the `franchise-wars` directory in Foundry `Data/modules`, or use the GitHub-hosted manifest once configured.
3. Enable **The Franchise Wars** in a dnd5e world.
4. Log in as GM. Managed content imports/updates automatically.
5. Open **The Franchise Wars → 00 — Command Centre → Session 0 — Contractor Orientation → S0 — GM Run Sheet**.

## Update behaviour

Existing managed journals are updated by stable source ID. If a GM has edited a managed journal since its previous import, the module creates a recovery copy before refreshing generated content.
