/**
 * Finding the entry a module's engineering menu lists for a fitted blueprint — see
 * {@link getMenuBlueprintForModule}.
 *
 * It has its own module because it reads every recipe's grades to pair two spellings of
 * one recipe. `ships/blueprint-journal` stays free of that catalogue, so a consumer who
 * only resolves journal collisions does not pay for it.
 *
 * @packageDocumentation
 */

import { getBlueprint } from './blueprints.js';
import { getBlueprintsForModule } from './engineering-options.js';
import { resolveBlueprintForModule } from './blueprint-journal.js';
import { requireStringIfPresent } from '../internal/argument-guards.js';

/**
 * The id a module's ordinary engineering menu lists for the recipe a fitted
 * `BlueprintName` names, or `null` when the menu lists no such recipe.
 *
 * A fitted module and its menu can spell one recipe two ways, so comparing the two ids
 * as written misses a match. This settles both cases where that happens:
 *
 * - **A journal collision.** The game writes `Sensor_LongRange` on a wake scanner, and the
 *   scanner menu lists `Scanner_LongRange`. {@link resolveBlueprintForModule} reads that
 *   id against the module first.
 * - **A generic spelling.** Where a modification applies to several module families, the
 *   menu lists the family's own id and a build authored elsewhere can carry the generic
 *   `Misc_*` id. A life support's Lightweight is `LifeSupport_LightWeight` in the menu and
 *   `Misc_LightWeight` in an EDSY-authored build. A generic id matches the menu entry
 *   that is not itself generic and has the same name, grades and modified stats.
 *
 * The match ignores magnitudes on purpose. `LifeSupport_Shielded` G5 draws +112% power
 * where `Misc_Shielded` draws +100%, and the two are still one menu entry. So use the
 * returned id to find the menu entry, and keep the fitted id for the numbers: a build's
 * engineering already rolls under the recipe it names.
 *
 * A generic id never matches another generic id, and never matches a family recipe that
 * changes different stats. `Misc_LightWeight` on a pulse laser is `null`, because a
 * weapon's Lightweight also cuts distributor draw. `Misc_ChaffCapacity` on a heat sink
 * launcher is `null`: that menu lists `Misc_HeatSinkCapacity`, which is generic too, and
 * the two roll different ammunition.
 *
 * Only the ordinary menu of `ships/engineering-options` is read. A Mercenary recipe sold
 * with a module (`ships/pre-engineered`) is not on that menu, so it is `null` here; it is
 * the same id in `ShipLoadout.availableBlueprints` and needs no matching.
 *
 * @param moduleSymbol - A module symbol, e.g. `"Int_LifeSupport_Size4_Class2"`. Case and
 * leading/trailing whitespace are ignored. An unknown or nullish symbol has no menu.
 * @param blueprintSymbol - A blueprint catalogue or journal id, e.g. `"Misc_LightWeight"`.
 * Case and leading/trailing whitespace are ignored. A nullish id is a miss.
 * @returns The menu's id in the catalogue's own spelling, which joins to `BLUEPRINTS` and
 * equals one entry of {@link getBlueprintsForModule}; or `null` when the menu lists no
 * entry for this recipe.
 *
 * @throws {TypeError} If `moduleSymbol` or `blueprintSymbol` is present and not a string.
 * @example
 * ```ts
 * import { getMenuBlueprintForModule } from '@elite-dangerous-almanac/core/ships/blueprint-menu';
 *
 * // An EDSY-authored build spells a life support's Lightweight generically.
 * getMenuBlueprintForModule('Int_LifeSupport_Size4_Class2', 'Misc_LightWeight');
 * // -> 'LifeSupport_LightWeight'
 *
 * // A wake scanner's journal Long Range is the scanner recipe.
 * getMenuBlueprintForModule('Hpt_CloudScanner_Size0_Class5', 'Sensor_LongRange');
 * // -> 'Scanner_LongRange'
 *
 * // A weapon's Lightweight is a different recipe from the generic one.
 * getMenuBlueprintForModule('Hpt_PulseLaser_Fixed_Small', 'Misc_LightWeight');
 * // -> null
 * ```
 */
export function getMenuBlueprintForModule(
    moduleSymbol: string,
    blueprintSymbol: string,
): string | null {
    requireStringIfPresent(moduleSymbol, 'getMenuBlueprintForModule: moduleSymbol');
    requireStringIfPresent(blueprintSymbol, 'getMenuBlueprintForModule: blueprintSymbol');
    if (blueprintSymbol == null) return null;
    const offered = getBlueprintsForModule(moduleSymbol);
    const resolved = resolveBlueprintForModule(moduleSymbol, blueprintSymbol).trim();
    const wanted = resolved.toLowerCase();
    const listed = offered.find((id) => id.toLowerCase() === wanted);
    if (listed !== undefined) return listed;
    if (!isGenericSpelling(wanted)) return null;
    const signature = recipeSignature(resolved);
    if (signature === null) return null;
    // A generic spelling stands in for a family's id, never for another generic.
    return (
        offered.find((id) => !isGenericSpelling(id) && recipeSignature(id) === signature) ?? null
    );
}

/** Frontier's family-agnostic spelling of a modification, e.g. `Misc_LightWeight`. */
const isGenericSpelling = (blueprintSymbol: string): boolean =>
    blueprintSymbol.toLowerCase().startsWith('misc_');

/**
 * What a blueprint id modifies, without the magnitudes: its display name, and the
 * `label`/`method` pairs each grade carries.
 *
 * Two ids with the same signature are the same modification written twice, which is how
 * a generic spelling is recognised as a family's own. It is blind to the min/max values,
 * because the one published divergence between such a pair is a magnitude:
 * `LifeSupport_Shielded` G5 draws +112% power where `Misc_Shielded` draws +100%.
 * Comparing what a grade touches pairs them; comparing what it rolls would not.
 */
function recipeSignature(blueprintSymbol: string): string | null {
    const blueprint = getBlueprint(blueprintSymbol);
    if (!blueprint) return null;
    const grades = Object.entries(blueprint.grades)
        .map(
            ([grade, { features }]) =>
                `${grade}:${features
                    .map((feature) => `${feature.label}/${feature.method ?? ''}`)
                    .sort()
                    .join(',')}`,
        )
        .sort()
        .join(';');
    return `${blueprint.name.toLowerCase()}|${grades}`;
}
