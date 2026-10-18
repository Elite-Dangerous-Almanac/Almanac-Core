using System;
using System.Collections.Generic;
using System.Globalization;
using EliteDangerousAlmanac.Internal;

namespace EliteDangerousAlmanac.Ships;

/// <summary>Finds the entry a module's engineering menu lists for a fitted blueprint.</summary>
public static class BlueprintMenu
{
    /// <summary>
    /// The identifier a module's ordinary engineering menu lists for the recipe a fitted
    /// <c>BlueprintName</c> names.
    /// </summary>
    /// <param name="moduleSymbol">
    /// A module symbol, such as <c>Int_LifeSupport_Size4_Class2</c>. Leading and trailing
    /// whitespace and case are ignored. An unknown or absent module offers no menu.
    /// </param>
    /// <param name="blueprintSymbol">
    /// A catalogue or journal blueprint identifier, such as <c>Misc_LightWeight</c>, matched
    /// case-insensitively after trimming.
    /// </param>
    /// <returns>
    /// The menu's identifier in the catalogue's own spelling, which is one entry of
    /// <see cref="EngineeringOptions.BlueprintsFor"/> and finds a recipe in
    /// <see cref="BlueprintCatalogue"/>; or <see langword="null"/> when the menu lists no entry
    /// for this recipe, or when either argument is <see langword="null"/>.
    /// </returns>
    /// <remarks>
    /// <para>
    /// A fitted module and its menu can spell one recipe two ways, so comparing the two
    /// identifiers as written misses a match. This settles both cases where that happens. The
    /// first is a journal collision: the game writes <c>Sensor_LongRange</c> on a wake scanner,
    /// and the scanner menu lists <c>Scanner_LongRange</c>. <see cref="BlueprintJournal"/> reads
    /// that identifier against the module first. The second is a generic spelling: where a
    /// modification applies to several module families, the menu lists the family's own
    /// identifier and a build authored elsewhere can carry the generic <c>Misc_*</c> identifier.
    /// A life support's Lightweight is <c>LifeSupport_LightWeight</c> in the menu and
    /// <c>Misc_LightWeight</c> in an EDSY-authored build. A generic identifier matches the menu
    /// entry that is not itself generic and has the same name, grades and modified stats.
    /// </para>
    /// <para>
    /// The match ignores magnitudes on purpose. The shielded life-support recipe draws twelve
    /// percent more power at grade five than the generic one, and the two are still one menu
    /// entry. So use the returned identifier to find the menu entry, and keep the fitted
    /// identifier for the numbers: a build's engineering already rolls under the recipe it
    /// names.
    /// </para>
    /// <para>
    /// A generic identifier never matches another generic identifier, and never matches a
    /// family recipe that changes different stats. <c>Misc_LightWeight</c> on a pulse laser
    /// finds nothing, because a weapon's Lightweight also cuts distributor draw.
    /// <c>Misc_ChaffCapacity</c> on a heat sink launcher finds nothing: that menu lists
    /// <c>Misc_HeatSinkCapacity</c>, which is generic too, and the two roll different
    /// ammunition.
    /// </para>
    /// <para>
    /// Only the ordinary menu of <see cref="EngineeringOptions"/> is read. A Mercenary recipe
    /// sold with a module is not on that menu, so this finds nothing for it; it is the same
    /// identifier in <see cref="ShipLoadout.AvailableBlueprints"/> and needs no matching.
    /// </para>
    /// </remarks>
    /// <example>
    /// <code>
    /// string? lightweight = BlueprintMenu.FindForModule("Int_LifeSupport_Size4_Class2", "Misc_LightWeight"); // "LifeSupport_LightWeight"
    /// string? longRange = BlueprintMenu.FindForModule("Hpt_CloudScanner_Size0_Class5", "Sensor_LongRange"); // "Scanner_LongRange"
    /// string? none = BlueprintMenu.FindForModule("Hpt_PulseLaser_Fixed_Small", "Misc_LightWeight"); // null
    /// </code>
    /// </example>
    public static string? FindForModule(string? moduleSymbol, string? blueprintSymbol)
    {
        if (blueprintSymbol is null) return null;

        IReadOnlyList<string> offered = EngineeringOptions.BlueprintsFor(moduleSymbol);
        string resolved = BlueprintJournal.ResolveForModule(moduleSymbol, blueprintSymbol).Trim();
        foreach (string id in offered)
        {
            if (RegistryIndex.KeyComparer.Equals(id, resolved)) return id;
        }

        if (!IsGenericSpelling(resolved)) return null;
        string? signature = RecipeSignature(resolved);
        if (signature is null) return null;

        // A generic spelling stands in for a family's identifier, never for another generic.
        foreach (string id in offered)
        {
            if (!IsGenericSpelling(id)
                && string.Equals(RecipeSignature(id), signature, StringComparison.Ordinal))
            {
                return id;
            }
        }

        return null;
    }

    /// <summary>Whether an identifier is Frontier's family-agnostic spelling of a modification.</summary>
    private static bool IsGenericSpelling(string blueprintSymbol) =>
        blueprintSymbol.StartsWith("Misc_", StringComparison.OrdinalIgnoreCase);

    /// <summary>What a recipe changes, without the magnitudes.</summary>
    /// <remarks>
    /// Two identifiers with the same signature are one modification written twice, which is how
    /// a generic spelling is recognised as a family's own. It is deliberately blind to the
    /// minimum and maximum, because the one published divergence between such a pair is a
    /// magnitude: the shielded life-support recipe draws twelve percent more power at grade five
    /// than the generic one. Comparing what a grade touches pairs them; comparing what it rolls
    /// would not.
    /// </remarks>
    private static string? RecipeSignature(string blueprintSymbol)
    {
        Blueprint? blueprint = BlueprintCatalogue.Find(blueprintSymbol);
        if (blueprint is null) return null;

        List<string> grades = [];
        foreach (KeyValuePair<int, BlueprintGrade> entry in blueprint.Grades)
        {
            List<string> legs = [];
            foreach (BlueprintFeature feature in entry.Value.Features)
            {
                legs.Add(feature.Label + "/" + feature.Method);
            }

            legs.Sort(StringComparer.Ordinal);
            grades.Add(entry.Key.ToString(CultureInfo.InvariantCulture) + ":" + string.Join(",", legs));
        }

        grades.Sort(StringComparer.Ordinal);
        return blueprint.Name.ToLowerInvariant() + "|" + string.Join(";", grades);
    }
}
