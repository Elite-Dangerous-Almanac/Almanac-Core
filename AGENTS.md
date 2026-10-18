# AGENTS.md

Guidance for AI coding agents in this repository. This file holds the rules for every change.
Each area below has its own `AGENTS.md` with the rules for work there. Read it before you change a file in that area.

| File                     | Read it before you change                                                             |
| ------------------------ | ------------------------------------------------------------------------------------- |
| `data/AGENTS.md`         | a catalogue in `data/`, a fixture in `fixtures/`, a `SOURCES.md` or `ATTRIBUTIONS.md` |
| `typescript/AGENTS.md`   | the TypeScript package: source, exports, build, dependencies, release                 |
| `dotnet/AGENTS.md`       | the .NET package                                                                      |
| `scripts/wiki/AGENTS.md` | the wiki build, `typedoc.json`, a guide page or a namespace page                      |

## Project purpose

**Elite Dangerous Almanac** is a library of static data and calculations for Elite Dangerous app developers and researchers.
It covers astronomy, ships and outfitting, personal equipment, engineering materials, localized display text, market commodities and galaxy-map markers.

## Pre-1.0: breaking changes are acceptable

The library has not reached 1.0. Get the API right; do not preserve what is already published.
Rename a badly named symbol, fix a wrong signature, move a module to the correct subpath, reshape a catalogue that fights its consumers.

Do not add compatibility scaffolding:

- No deprecated aliases, re-exports, shims or `@deprecated` symbols kept "for one more release".
- No dual code paths that accept the old and the new shape of an argument, option or data file.
- No migration prose in the documentation. The pull request and the release notes carry the change.

A breaking change is complete and visible. Update every call site, test, fixture, example and guide in the same change.
Say in the PR description what breaks and what replaces it. Do not call the surface stable anywhere until 1.0 is released.

## Feature parity

The library has a **TypeScript** and a **.NET** implementation. **Python** is planned. Two rules shape every design decision:

1. **Feature parity.** Every implementation exposes the same features and behaviour.
2. **Shared test fixtures.** Every implementation is validated against the same language-neutral fixtures in `fixtures/`.

A new capability, a fix to shared behaviour and the documentation of the changed surface land in TypeScript and .NET in the same change.
This includes the guide pages: `dotnet/docs/guides/` and `typescript/docs/guides/` describe one behaviour, each in its own language.
If one package cannot carry the change, open an issue (§Tracking known gaps), link it from the PR, and state the gap in that package's docs.

Keep shared data and fixtures in language-neutral JSONC so every implementation reads the same file.
Tree-shakeability is part of parity: other implementations mirror the same fine-grained module boundaries.
Where a platform cannot tree-shake, the rule becomes a loading rule (see `dotnet/AGENTS.md`).

## Repository layout

```
data/          # shared static data (JSONC), one folder per domain, each with a SOURCES.md
assets/        # shared visual assets, keyed by catalogue symbol
fixtures/      # shared test fixtures (JSONC); every implementation validates against these
schemas/       # shared JSON Schemas for data payloads and fixtures
docs/          # the wiki's shared landing page; docs/wiki/ is the assembled wiki, not committed
scripts/       # repository tooling for data derivation and the wiki; never shipped in a package
typescript/    # TypeScript library
dotnet/        # .NET library
python/        # (future) Python library; same features, same fixtures
```

`data/`, `fixtures/` and `assets/` belong to no implementation. Never commit a copy of a shared asset inside a language folder.
A build may copy one into the package it packs.

Feature areas, in TypeScript under `typescript/src/` and in .NET as one namespace each under `dotnet/src/EliteDangerousAlmanac/`:

| TypeScript     | .NET           | Contents                                                                                       |
| -------------- | -------------- | ---------------------------------------------------------------------------------------------- |
| `astro/`       | `Astronomy`    | procedural system names, id64 addresses, sectors, regions, nebulae, permit locks, body physics |
| `commodities/` | `Commodities`  | standard and rare market commodities                                                           |
| `equipment/`   | `Equipment`    | Odyssey suits, handheld weapons, suit tools, upgrades, modifications, suit loadouts            |
| `galaxy-map/`  | `GalaxyMap`    | galaxy-map location markers and their colours                                                  |
| `i18n/`        | `Localization` | localized catalogue names, descriptions, labels and diagnostics                                |
| `materials/`   | `Materials`    | engineering materials and micro-resources                                                      |
| `ships/`       | `Ships`        | ship and outfitting catalogues, engineering, loadouts and build metrics                        |

## Rules for every implementation

- **Catalogues are frozen.** A shared catalogue is a process-wide singleton, so one consumer's mutation would change another's lookups.
  TypeScript passes every exported catalogue through `deepFreeze`; .NET uses immutable records and read-only collections.
- **Data files are hand-maintained.** No script in this repository reads, clones or fetches an upstream repository, and none may be added.
  Fetch during acquisition from a scratch directory outside the working tree. Commit only the derived data and its provenance.
- **No packing or minification in source.** Checked-in source, `data/` and `fixtures/` stay readable and well formatted.
  Bundling, minification and payload compaction belong to each package's build step or to the consumer's bundler.
- **Nothing in a data payload that is not data.** Prose goes in the file's comment header (see `data/AGENTS.md`).
- **Tests prove behaviour against the shared fixtures.** Prefer a fixture entry over an inline literal when the value is a fact about the game.
- **Coverage stays at 80% or above** on lines, branches and functions in every implementation, and CI enforces it.
  Write real test cases. Do not exclude code from measurement or add assertion-free tests to reach the number.

## Language and documentation

Use [ASD-STE-100](https://www.asd-ste100.org/) (Simplified Technical English) everywhere: replies, code, comments, documentation, commit messages and pull requests.

- One idea per sentence. Instructions to 20 words, descriptions to 25, paragraphs to six sentences.
- Active voice, present tense. Name who or what does the thing.
- One word, one meaning. Do not vary a term for style.
- Plain, common words. No metaphor, idiom, marketing adjectives, emoji or jargon the reader did not use first. This covers identifiers, test names and headings.
- Say it once and directly. No throat-clearing, self-assessment ("comprehensive", "robust") or empty hedging. If deleting a sentence loses nothing, delete it.
- Write a procedure as numbered steps, with the condition before the action: "If the build fails, read the policy output."

Documentation describes the current state:

- **No changelog residue.** No "previously", "now", "new", "updated", "as of <date>" or diff narration. Git records the change.
- **Delete rather than annotate.** Remove code and prose that do not apply. No commented-out code, "kept for reference" blocks or "(deprecated)" markers.
- **Keep three kinds of historical fact**, each stated as a standing conclusion:
  provenance (in `SOURCES.md`, see `data/AGENTS.md`);
  a rejected alternative, where writing it down stops someone reapplying it;
  a deliberate absence, what it means and what would fill it, linked to its issue.
- **Never write a catalogue's size into prose.** Ask: _would adding a row make this sentence false?_ If yes, delete the number.
  Write what the catalogue holds ("every core internal module, in Frontier's registry order"), and "not every blueprint" instead of a fraction.
  Three kinds of number stay:
  a count a test asserts, pinned in a fixture payload and read by the test;
  a measurement of something outside the repository (a bundle size, a fact about a pinned snapshot or the build corpus);
  a number the game fixes (region ids 1–42, engineering grades 1–5).
  If a figure must appear in prose, generate it, as `scripts/i18n-coverage.mjs` does. Do not add a check that asserts a hand-written figure.

API documentation is a first-class deliverable:

- **Document every public class, function, type and constant in detail**: description, parameters, return values, units, value ranges and examples.
- **Use each language's standard format**: TSDoc in TypeScript, XML documentation comments in C#, Google-style docstrings in Python.
- **The wiki is generated from source comments.** Never hand-edit a generated wiki page. `scripts/wiki/AGENTS.md` describes the build.
- **Document behaviour on the symbol that does it.** An explanation that spans several symbols becomes a guide page in both `docs/guides/` folders.

## Attribution

A source is described in exactly one place, so its licence position cannot drift between copies.

- **`ATTRIBUTIONS.md`** at the root credits every external data source, algorithm and library: author, link, licence position, use, and any licence text that must be reproduced.
- **Everything else names the source and points there.** A data file's comment header, a `SOURCES.md` entry and a doc comment on a ported algorithm name the source and never repeat an author, URL or licence.
- When you add data, port an algorithm or add a dependency that needs credit, update `ATTRIBUTIONS.md` and the provenance in the same change.
- Respect each source's licence terms.
- `README.md` carries a short pointer, not a list.

`data/AGENTS.md` holds the rules for headers, `SOURCES.md`, fixtures and captured builds.

## Tracking known gaps

Open gaps live in GitHub issues on `Elite-Dangerous-Almanac/Almanac-Core`, one issue per gap. When a change uncovers a gap it cannot fix:

1. Search the open issues. If the gap is tracked, add a comment.
2. Otherwise open an issue. State what is missing, what a consumer sees, how it was measured and what would close it.
   Name the area in the body (`ships — data gap`, `ships — API`, …) and label it `bug`, `enhancement`, `documentation` or `help wanted`.
3. Keep the reasoning (sources checked, what was rejected and why) in the domain's `SOURCES.md`.
4. Cite the issue where a reader meets the gap: in Markdown as `#<number>`, in TSDoc and code comments as the full URL.
   Name the symptom in one line; do not paraphrase the issue.

The change that fixes a gap closes its issue and removes the citations.

## Commit identity and personal data

**Commit as the identity git is already configured with. Never set one yourself.**
Do not pass `-c user.name`/`-c user.email`, run `git config` for a different identity, or use `--reset-author`.
A substituted identity no longer matches the signing key, and GitHub marks the commit **Unverified**.

An identity you did not get from git config is a personal detail. A force-push cannot remove it: the old commit stays fetchable by its SHA.
Before you push, confirm the branch carries one identity, the configured one:

```bash
git log --format='%an <%ae> | %cn <%ce>' origin/<default-branch>..HEAD | sort -u
```

Commit messages, PR text, code, data, fixtures and `SOURCES.md` carry **no personal data**: no email addresses, real names, handles, or machine and account names.
Crediting an upstream project and its published author in `ATTRIBUTIONS.md` is required and is not personal data.

## Environment

Development happens in the dev container (`.devcontainer/`): Node 22 with Corepack, Python 3.12 and the .NET SDK that `dotnet/global.json` pins.

Outside the container, `dotnet` may be absent and `builds.dotnet.microsoft.com` may be blocked. Install the SDK from the distribution archive:

```bash
apt-get update && apt-get install -y dotnet-sdk-10.0
```

Run the update first; a stale package list gives 404s that look like a blocked host.
**Never report the .NET suite as unrunnable without trying this.** Both suites run on every change.

## Before you finish

Run the gate of every package you changed. A change to `data/`, `fixtures/` or `schemas/` reaches both packages.

| Package    | Command (from the package folder)                                                                                           |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| TypeScript | `pnpm run check`; if a consumer import, the export map or the build changed, also `pnpm run build && pnpm run test:package` |
| .NET       | `dotnet build coverage.proj`                                                                                                |
| Wiki       | `pnpm run docs` (from `typescript/`) after any change to public docs, in either language                                    |

**Before you open a PR, have a subagent review the complete change.** Fix every meaningful finding, then ask for a new review.
Repeat until the subagent reports no meaningful findings.
