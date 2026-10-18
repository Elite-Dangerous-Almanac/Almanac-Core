# AGENTS.md — .NET package

Rules for `EliteDangerousAlmanac`. The root `AGENTS.md` also applies. Run every command here from `dotnet/`.

## Shape

- The library targets .NET Standard 2.1. Its tests run on .NET 10, the SDK that `global.json` pins.
- One namespace per feature area (root `AGENTS.md`, §Repository layout). Keep implementation-only types `internal`.
- The library reads the shared catalogues as embedded resources, keyed by their repository path. `data/` stays the only copy.
- Catalogues use immutable records and `ReadOnlyCollection`/`ReadOnlyDictionary`.
  `tests/.../CatalogueImmutabilityTests.cs` finds every published catalogue by reflection.

## Loading rule

.NET ships one assembly, so a consumer cannot drop a namespace. What they must not pay for is parsing and memory.

- Keep one type per feature-area file.
- Put every catalogue behind a `Lazy<T>` that reads its shared file on first use.

A caller who reads a system name therefore never parses the nebula catalogue.

## Documentation

- The compiler requires an XML documentation comment on every public member. Use `<summary>`, `<param>`, `<returns>`, `<remarks>`, `<exception>` and `<example>`.
- `docs/guides/` carries the same set of guides as `typescript/docs/guides/`, written in C#. Change both in the same change.
- A new namespace needs `docs/namespaces/<Namespace>.md`, or the wiki build fails.
- The wiki reads the C# source, not the XML documentation file. `scripts/wiki/AGENTS.md` describes the reader and the example checker.
  Run `pnpm run docs` from `typescript/` after a change to a public declaration or its comments.

## Commands

| Command                                                                         | What it does                                                                |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `dotnet restore EliteDangerousAlmanac.slnx --locked-mode`                       | restores exactly what the lock files pin                                    |
| `dotnet build EliteDangerousAlmanac.slnx`                                       | builds both projects; analyzers and code style run as errors                |
| `dotnet build coverage.proj`                                                    | runs the suite through coverlet; fails under 80%. **Run before finishing.** |
| `dotnet test EliteDangerousAlmanac.slnx --filter "FullyQualifiedName~XyzTests"` | runs one test class                                                         |
| `dotnet pack src/EliteDangerousAlmanac/EliteDangerousAlmanac.csproj -c Release` | packs the NuGet package                                                     |

Coverage counts the `EliteDangerousAlmanac` assembly only, on lines, branches and methods.

Every project keeps a `packages.lock.json`. When you add or update a package, restore once and commit the changed lock file.

If `dotnet` is missing, follow the root `AGENTS.md`, §Environment.
