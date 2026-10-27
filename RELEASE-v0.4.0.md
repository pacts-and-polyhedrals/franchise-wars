# The Franchise Wars v0.4.0 — Battlemap Library

Feature release for Foundry VTT v14 / D&D5e 6.0.6.

## Added

- **124 top-down tactical battlemap Scenes** (100 px grid, 5 ft squares), imported into a new **The Franchise Wars** Scene folder tree:
  - **Act I — Employee of the Month (13):** QuestRabbit Warren, THAC0 Spell flagship and cellar, Murder King Grand Throne, Gideon Tumble's flat, Brandmere Crier, Gelatinous Cube creamery, Brandmere Canals, Sweet Covenant warehouse, Starkfucks roastery and back office, Wight Castle, Crown & Cleaver Vault.
  - **Act II — The Franchise Wars (11):** Critical Wok, PBG lab, City Chase, Tallow Lane & the Tankard & Tallow (normal and siege variants on one shared base), Old Independents' Quarter, Five Wights glitch kitchen, Executive Collateral Vault, Wand-Mart Supercentre and Cash Office, Drive-Thru Row.
  - **Act III — Hostile Takeover (10):** Pandemonium plantations and overseer's station, Temple of the Healing Hand, Goodberry's HQ, Trademark Hearing court, Chick'n Familiar, Nine Circles legal floor, The First Shop, Throne Tower, Revenant King's crypt.
  - **Act IV — Market Domination (10):** Room 303, the Sleepers' Dream, Grey Café, Construction Site, Crawling City, Glamoured Farm, Deep Dairy, the Crucible dragon boardroom, Counting House reception/floors and Boardroom (reuse for the EGM).
  - **Act V — The Final Acquisition (7):** Grand, Summit and Drowned Tusks, the Last Slice planar route, Avernus toll booth, Signing Room, the Whole Counting House.
  - **Franchise venues (58):** a canonical flagship for every franchise not already covered by a story map — food & takeaway (23), convenience/grocery/retail (12), pizza (5), taverns & bars (6), music venues (2), coffee (5), inns & hospitality (5).
  - **Side-contract environments (15):** alley/loading bay, high street & market, rooftops, sewers, docks, country road, forest habitat, cave/mine, ruined dungeon, graveyard & crypt, independent tavern, noble manor, temple, corporate office/lab, planar portal depot.
- Every Scene ships with **walls, doors (incl. iron, secret, portcullis, gate and glass), windows, low fences/hedges and ambient lights** pre-placed. Dungeon/vault/cavern Scenes start with global illumination off.
- Scene thumbnails and a **Battlemap Library** journal in the Command Centre listing every map, its use and its size.
- `game.franchiseWars.importMaps({force:true})` to re-import maps (restores managed walls/lights; GM-added walls and lights are never deleted).

## Import behaviour

- New Scenes are created in batches of 10 on first GM load after updating.
- Existing managed Scenes update in place; managed walls/lights are only replaced when that map's geometry hash changes.
- The Brandmere city Scene is unchanged.

## Notes

- The maps are procedurally painted in an Inkarnate-style top-down look (textured floors, inked stone/timber/brick walls, cast shadows, lighting) rather than hand-painted.
- Size: ~72 MB of WebP battlemaps + thumbnails.
