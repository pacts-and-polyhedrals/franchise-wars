# Franchise Wars v0.3.0 — QA / Regression Gate

## Release target
- Foundry VTT: v14
- D&D5e: v6.0.0 minimum; verified manifest target v6.0.6
- Module ID: `franchise-wars`
- Release tag expected: `v0.3.0`

## Static validation passed
- `module.json` parses as valid JSON and contains stable repository, manifest and versioned download URLs.
- `scripts/main.mjs` passes `node --check`.
- All JSON data files parse successfully.
- 121 managed Journal entries retain valid content hashes.
- 372 managed D&D5e Items have unique source IDs and supported Item types/subtypes.
- 272 Actor definitions/references have unique source IDs: 92 bundled native NPC Actors + 180 installed-D&D5e compendium clone specifications.
- Core opposition cloning prefers the world's selected D&D5e rules generation where exact duplicate names exist, with fallbacks for optional/non-core actor packs.
- 300 deduplicated runtime art binaries are bundled; every internal `modules/franchise-wars/...` art reference resolves to a real file.
- 317 art-registry records resolve to the 300 deduplicated runtime files (duplicates/aliases intentionally share runtime binaries).
- Scene image references resolve.
- Mortimer Pell is canonical throughout runtime/source campaign material; the obsolete Gideon Tumble/G. Tumble references are removed.
- Upgrade path remains idempotent: v0.2.0 worlds import/update Journals, then add Items, Actors and Scenes and set import version to v0.3.0.

## Import behavior
- Managed Journal edits are preserved into the Recovery journal folder before a module-authored update overwrites them.
- Items and native Actors use stable `franchise-wars.sourceId` flags and content hashes.
- Standard D&D opposition is cloned from installed D&D5e Actor compendia at import time so actions, activities and system data remain native to the installed system rather than being frozen as stale copies.
- Compendium clones are update-aware and can be refreshed when their source/specification changes.

## Runtime smoke test still required after upload
This environment cannot launch the user's licensed Foundry server/Forge world. After release upload, enable the module once in a disposable v14/dnd5e-v6 test world and confirm: first import completes without console errors; Item/Actor folders appear; one menu consumable can be dragged to a PC and consumed; one bespoke bestiary Actor opens/rolls; one standard compendium-cloned Actor opens/rolls; Brandmere Scene opens; command-centre and Session 0 journal helpers open.
