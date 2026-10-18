# AGENTS.md — TypeScript package

Rules for `@elite-dangerous-almanac/core`. The root `AGENTS.md` still applies. Run every command here from `typescript/`.

## Tree-shaking

Consumers, often web apps, must pay only for what they import.

- **Small modules.** One class, interface or feature per file.
- **ESM with `"sideEffects": false`.** No side effects at module top level: no registration on import, no mutable module state.
- **Named exports only.** No default exports and no `export * as X`.
- **Prefer pure functions.** A class must not use static registries or couple to unrelated classes.
- **Never one monolithic data import.** Split catalogues per domain, and per entity group where sensible.

### Subpath exports

The `exports` map in `package.json` has one subpath per feature area and one per runtime module (`./ships/ship-loadout`, `./astro/nebulae-real`, …).

- `tsup.config.ts` derives its entries from the `import` targets. A module without an export row is not built.
- Every module row has both `types` and `import`. `pnpm run test:package` rejects a row that lacks one.
- Export a type-only module's symbols through the runtime entry that owns them. Do not add a declaration-only subpath.
- `./<area>/internal/*` maps to `null`, so an internal deep import fails to resolve. Put `@internal` modules there.
- Root-wide helpers go in `src/internal/`, which has no entry.
- `./assets/*` maps to the string `./assets/*` and publishes the packed SVG tree. `package.test.mjs` names every string-target row.

### Default catalogue arguments

Usability outranks tree-shaking when the two collide. A registry lookup takes an _optional_ catalogue argument that defaults to the whole registry (`getMaterialByName('iron')`).
The default is a static import, so its data stays in the bundle.

Decide by measuring the module's import graph in `dist/`, fully minified, as a consumer's bundler ships it:

- materials ~17 KiB, micro resources ~13 KiB and commodities ~30 KiB are noise;
- `ships/modules` at ~337 KiB (~33 KiB gzipped) is named in its own docs;
- `ALL_NEBULAE` at ~432 KiB is the counter-example, so `astro/nebulae` keeps its argument required.

Default to the whole registry unless that costs more than the rest of the library.
State the choice in the module's docs. Do not reverse a decision without a fresh measurement.

## Adding a module or a feature area

1. Add the module's row to `exports` in `package.json`, with `types` and `import`.
2. For a feature area, also add `src/<area>/index.ts` to `typedoc.json` and a `--test-coverage-include` glob to the `test` script. Without the glob the area is not measured.
3. Add every exported catalogue to `src/catalogue-immutability.test.ts`.
4. Add the matching .NET code in the same change (root `AGENTS.md`, §Feature parity).

## How shared files reach the package

```
data/<domain>/*.jsonc ──(strip comments)──> src/<area>/<catalogue>.ts ──> deepFreeze ──> exported constant
fixtures/<domain>/*.jsonc ──(strip comments)──────────────────────────> src/<area>/*.test.ts
```

- A catalogue module imports its `.jsonc` directly. `scripts/jsonc.mjs` strips comments.
  `scripts/register-jsonc.mjs` wires it into the tests; an esbuild plugin in `tsup.config.ts` wires it into the build.
- `src/jsonc.d.ts` types a `.jsonc` import as `unknown`. The catalogue's cast is the only shape assertion, so keep the interface honest.
- Tests import fixtures `with { type: 'json' }`, typed by the generated `src/fixtures.generated.d.ts`.

## Commands

| Command                           | What it does                                                                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`  | installs exactly what `pnpm-lock.yaml` pins                                                                                           |
| `pnpm run check`                  | check:fixtures → check:i18n-coverage → lint → format:check → typecheck → check:examples → test:wiki → test. **Run before finishing.** |
| `pnpm test`                       | the suite, with the 80% coverage thresholds                                                                                           |
| `pnpm run check:examples`         | type-checks every documented snippet and runs its value claims                                                                        |
| `pnpm run generate:fixtures`      | regenerates the fixture schema and fixture types                                                                                      |
| `pnpm run generate:i18n-coverage` | regenerates the locale-coverage table                                                                                                 |
| `pnpm run format`                 | Prettier over the package and the shared Markdown, schemas, scripts and workflows                                                     |
| `pnpm run audit`                  | `pnpm audit --audit-level=low`                                                                                                        |
| `pnpm run build`                  | builds `dist/` (see below)                                                                                                            |
| `pnpm run test:package`           | imports the built `dist/` and checks every export subpath                                                                             |
| `pnpm run docs`                   | builds the whole wiki, both languages, into `docs/wiki`                                                                               |

Run one test file with the suite's loaders:

```bash
node --import tsx --import ./scripts/register-jsonc.mjs --test src/ships/weapons.test.ts
```

`pnpm run check` does not build. If a change touches the export map, the bundler config or anything a consumer imports, also run `pnpm run build && pnpm run test:package`.

### Documented examples

`check:examples` reads public `@example` fences, the guide pages and both READMEs.

- A trailing `expression; // -> value` runs when the snippet needs no `declare` input.
  Literals compare exactly. A decimal is rounded to the places shown. `0.667…` asserts a prefix.
- Each fence runs in a fresh, time-limited Node process. Keep every fence self-contained and do not start subprocesses.
- Use `declare const input: Type` only for a value the reader supplies.
- Prose, abbreviated values and `yield` expressions stay compile-only and count against a ratchet.

## The build

`pnpm run build` runs six steps. A change to any step changes what consumers receive; run `pnpm run test:package` after it.

1. `scripts/copy-notices.mjs` writes the git-ignored `THIRD_PARTY_NOTICES.md`, `LICENSE` and `PROVENANCE/` copies of the root files.
2. `scripts/copy-assets.mjs` copies `assets/ships/` and `assets/galaxy-map/` to the git-ignored `assets/`. It names each directory it packs.
3. `tsup` bundles ESM to `dist/` with declarations and source maps, and inlines `data/`.
   Terser then strips whitespace only; minification stays the consumer's job. `/* @__PURE__ */` markers stay.
4. `scripts/prune-sourcemap-sources.mjs` removes map segments that name the build workspace or point into inlined data.
5. `scripts/prune-barrel-imports.mjs` blanks redundant bare imports in entry files, with `scripts/strip-bare-imports.mjs`, and removes empty shared chunks.
6. `scripts/attach-barrel-docs.mjs` re-attaches each barrel's `@packageDocumentation` to its `.d.ts`.

## Dependencies

pnpm is pinned, with its hash, by `packageManager` in `package.json`. Run `corepack enable pnpm` (not a bare `corepack enable`, which would shim npm too).
pnpm settings live in `pnpm-workspace.yaml`; its comments explain each one.

- **Seven-day cooldown.** `minimumReleaseAge: 10080` hides releases younger than seven days, and every install audits the lockfile against it.
  Every range floor in `package.json` must be a version that has served the cooldown.
  `.github/dependabot.yml` sets the matching `cooldown` on the npm entry only; other ecosystems reject the key.
- Do not disable the cooldown or add `minimumReleaseAgeExclude` entries to land an update. Take the newest mature version, or wait.
- `allowBuilds` names the packages allowed to run install scripts. Only `esbuild` is on it.
- **TypeScript stays at 5.x.** TypeDoc 0.28 supports 6.0 at most. 6.x also breaks `check:examples` with `TS6059`, because its scratch directory is outside `rootDir`.

## Releasing to npm

Nobody publishes from a laptop. Run **Publish npm Package** (`.github/workflows/publish-npm.yml`) from the Actions tab with `main` selected.

- Every dispatch is a real release. The workflow refuses any ref except the default branch.
- The workflow publishes the next patch on the major.minor line in `package.json`, after the highest patch already on npm.
  To start a new line, change major or minor in `package.json` and merge that first.
- If npm accepts the tarball but the tag or GitHub Release fails, use **Re-run failed jobs**. A new run allocates the next patch.
- The publishing job runs no package code and passes `--ignore-scripts`. Wire any `prepack` or `prepare` script into the unprivileged build job.

One-time setup before the first release:

1. Create an environment named `npm`, restricted to the default branch.
2. On npm, add a GitHub Actions trusted publisher: owner `Elite-Dangerous-Almanac`, repository `Almanac-Core`, workflow `publish-npm.yml`, environment `npm`.
