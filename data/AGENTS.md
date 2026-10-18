# AGENTS.md — shared data and fixtures

Rules for the catalogues in `data/`, the fixtures in `fixtures/`, every `SOURCES.md`, `data/SNAPSHOTS.md` and `ATTRIBUTIONS.md`.
The root `AGENTS.md` still applies.

## File format: JSONC

Every catalogue is **JSONC** (`.jsonc`): JSON preceded by a comment header. `typescript/src/<domain>/data-files.test.ts` checks both rules:

1. **Comments are the only JSONC extension.** No trailing commas, unquoted keys or single quotes.
   Without its comments, the file must be strict JSON that any standard parser accepts.
2. **Prose lives in the header comment, never in the payload.** No top-level `attribution`, `description` or `comment` key.
   Every payload byte is inlined into consumers' bundles; comment bytes are not.

Each implementation strips comments in its own loader. Never generate `.json` copies.

> Some editors treat `.jsonc` as JSON5 and add trailing commas. If a data file stops parsing, check what your editor did first.

## The header

Open every catalogue with a comment header that:

- says what the file holds,
- names its source in a line or two,
- points at `ATTRIBUTIONS.md` for credit and at the sibling `SOURCES.md` for provenance.

Copy the header of any `data/astro/*.jsonc` for the shape. Never repeat an author, URL or licence in the header.

## Provenance

Every data update follows `data/SNAPSHOTS.md`. Record the provenance in `data/<domain>/SOURCES.md`, under the catalogue it describes:

- the source, referred to by name,
- its immutable revision or checksum,
- the acquisition date (a fact about the source, not about this repository),
- the derivation,
- every manual correction and the reason for it.

Write it in the present tense, never as a dated log. Example: "`Int_Sensors_Size1_Class{1..5}` `integrity` is 36/32/40/48/44; coriolis-data's size-1 row is a verbatim copy of its size-2 row, so EDSY's figures are used".

`SOURCES.md` documents the data, not the library:

- Do not explain how the library computes, accepts or refuses a value. That belongs in the symbol's doc comment.
- Do not narrate the test suite or list a module's API.
- Do not count the rows a derivation produced.
- Do name the evidence for a value, including a fixture ("a capture states the base reserve as 2"). Do not document the fixture itself.

Keep the reasoning for a known gap here: why a value is absent, which sources were checked and what was rejected.

## Attribution

`ATTRIBUTIONS.md` is the only place a source is credited. It ships to npm as `THIRD_PARTY_NOTICES.md`.
`typescript/THIRD_PARTY_NOTICES.md`, `typescript/LICENSE` and `typescript/PROVENANCE/` are generated, git-ignored copies.
Edit the root files, never the copies. Keep the root `LICENSE` readable from inside a consumer's `node_modules`.

## Acquisition

No script in the repository fetches upstream data (root `AGENTS.md`).
`scripts/data/ships/merge-normalized-catalogues.mjs` joins normalized local arrays that a maintainer prepares.
Write any fetch script in a scratch directory outside the working tree.

## Fixtures

`fixtures/` holds only `.jsonc` files, so its rules live here.

A fixture is the parity contract: it pins behaviour for every language implementation.
Prefer a fixture entry over an inline test literal when the value is a fact about the game.

### File format

Every fixture is JSONC with the same two rules as `data/` (above): comments are the only extension, and prose stays out of the payload.
`typescript/src/fixtures.test.ts` checks both and checks that every fixture has a header.

After you add or change a fixture, run `pnpm run generate:fixtures` from `typescript/`.
It regenerates `schemas/fixtures.schema.json` and `typescript/src/fixtures.generated.d.ts`. `pnpm run check:fixtures` fails when they are stale.

### Provenance lives in the fixture's header

A fixture is documented **in its own header comment and nowhere else**. It gets no entry in any `SOURCES.md`.

- The header says what the fixture pins.
- A capture's header also says where it came from, when it was acquired, its checksum, and anything scrubbed or corrected.
- The project that published a capture is credited in `ATTRIBUTIONS.md` like any other source.

A count a test asserts goes in the payload, not the header. Read it from the test.

### Captured ship builds

A `Loadout` event, a SLEF export or a decoded share link is **Frontier game output**, not the work of the project that held it.
Do not reject a build because its repository states no licence, or a licence that forbids redistributing that repository.

For every build:

1. Credit the source if there is one: `ATTRIBUTIONS.md`, plus file, revision and checksum in the fixture header.
   A build with no traceable origin, like the corpus in `fixtures/ships/builds/`, is acceptable.
2. Scrub the person, keep the game. Remove commander names, account ids, uploaders, home-directory paths and share links.
   Keep ship data such as `ShipName`, `ShipIdent`, `ShipID` and `timestamp`; none of them names a person.
3. Otherwise store the capture verbatim, with its source checksum.

This exception covers builds only. Code, stat tables and derived catalogues keep the licence they ship under.

The build corpus in `fixtures/ships/builds/` is the one fixture a test reads from disk. Its size may stand in its index header, because it grows only when a maintainer adds a capture.
