# AGENTS.md — wiki build

Rules for the generated wiki, `typescript/typedoc.json` and the guide pages. The root `AGENTS.md` also applies.

## Surfaces

The wiki has two surfaces, one per language, each with its own guides, reference index and sidebar.
`Home` is the shared landing page, written from `docs/wiki-home.md`. `TypeScript` and `DotNet` are the surface pages.
Page names are global on GitHub Wiki, so every .NET page has the prefix `DotNet.`.

**Each surface is self-contained.** A .NET reader never needs a TypeScript page.
`typescript/docs/guides/` and `dotnet/docs/guides/` carry the same set of guides, each in its own language.
A cross-surface link only says the other package exists; it never carries an explanation.

## Build

`pnpm run docs` (from `typescript/`) runs TypeDoc, then `scripts/wiki/build.mjs`, and leaves the finished wiki in the root `docs/wiki`.
`build.mjs` stages the TypeDoc output, generates the .NET pages, writes `Home`, builds every sidebar and checks every link.

### TypeScript reference

TypeDoc with `typedoc-plugin-markdown` and `typedoc-github-wiki-theme` writes `typescript/docs/wiki`.
`typedoc.json` treats warnings as errors.

`typedoc.json` lists one `src/<area>/index.ts` per feature area, plus each leaf module that no barrel re-exports.
**A leaf may be an entry point only if no other entry point re-exports its symbols.**
TypeDoc gives each symbol to one module, and the declaring entry point wins. A re-exported leaf moves the symbol out of the barrel and breaks `{@link}` references.
So a leaf's `@packageDocumentation` is not published when a barrel re-exports it. Put orientation prose on the barrel or on the symbol.

### .NET reference

`dotnet-api.mjs` reads the C# **source**, not the compiler's XML documentation file, which drops every signature.

- `dotnet-source.mjs` reads declarations and `xml-doc.mjs` reads `///` comments.
  Both **throw** on a construct they cannot read, so nothing drops out of the reference silently.
- A nested type is skipped, but a **public** nested type is refused.
- A `<see cref>` to a type outside the library renders as code, not as a link.
- A partial type is one page. The part in `<TypeName>.cs` leads.
- Namespace orientation prose lives in `dotnet/docs/namespaces/<Namespace>.md`.

### C# examples

`dotnet-examples.mjs` checks C# examples without a compiler. It reads every `csharp` code fence under `dotnet/docs/`, `docs/` and the NuGet README, and every `<code>` block in a `///` comment.
A type or member the published surface does not carry fails `test:wiki`.

- Mark a `<code>` block that is not C#, for example `<code language="json">`.
- The checker cannot see a call on a local or a misspelt type, because an unknown name may belong to the BCL. Write examples whose static entry points name what it should check.
- Keep every statement valid C#. A bare member access is not a statement.

### Navigation and links

`sidebar.mjs` builds each surface's sidebar as a collapsible tree from the generated pages.
The .NET tree stops at the type. The build **fails when a generated page is unreachable from a sidebar**.
`check-links.mjs` then checks that every link points at a page that exists.

## Publishing

`.github/workflows/publish-wiki.yml` runs `pnpm run docs` on a push to `main` that touches the documented sources, and pushes `docs/wiki` to `<repo>.wiki.git`.
It needs Node only. The wiki must have one page created by hand before CI can push.

A Python surface, when it lands, is a third entry in the list in `build.mjs`.
