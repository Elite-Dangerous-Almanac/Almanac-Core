import { init, parse } from 'es-module-lexer';

await init;

/**
 * Blank static bare-import declarations without changing generated positions.
 *
 * Keeping every newline and character position intact preserves source-map positions
 * for the surrounding imports, exports and code.
 */
export function stripBareImports(source) {
    const [imports] = parse(source);
    const ranges = imports
        .filter(
            ({ type, importStart, importEnd }) =>
                type === 'static' && /^import\s*['"]/.test(source.slice(importStart, importEnd)),
        )
        .map(({ importStart, importEnd }) => [
            importStart,
            source[importEnd] === ';' ? importEnd + 1 : importEnd,
        ]);

    let cleaned = source;
    for (const [start, end] of ranges.reverse()) {
        const blank = cleaned.slice(start, end).replace(/[^\r\n]/g, ' ');
        cleaned = `${cleaned.slice(0, start)}${blank}${cleaned.slice(end)}`;
    }
    return cleaned;
}
