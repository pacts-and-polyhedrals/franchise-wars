# Release workflow

The repository includes `.github/workflows/release.yml` so future Foundry releases do not need hand-edited manifest links.

1. Commit the completed module to `main`.
2. Create/push a semantic tag such as `v0.3.0` (or run the workflow manually against an existing tag).
3. The workflow patches a release copy of `module.json`, creates a Foundry-compatible ZIP with `module.json` at the ZIP root, calculates SHA-256, and uploads all three release assets.
4. Keep the stable install/update manifest at:
   `https://raw.githubusercontent.com/pacts-and-polyhedrals/franchise-wars/main/module.json`
5. Each release's `download` remains version-pinned, e.g.:
   `https://github.com/pacts-and-polyhedrals/franchise-wars/releases/download/v0.3.0/franchise-wars-v0.3.0.zip`

For v0.3.0, upload/commit the supplied `module.json` to `main` before publishing the tag so the stable manifest advertises the same version as the release.
