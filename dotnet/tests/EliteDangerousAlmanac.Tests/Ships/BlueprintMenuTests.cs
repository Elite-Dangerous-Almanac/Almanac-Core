using System.Collections.Generic;
using System.Linq;
using EliteDangerousAlmanac.Ships;
using EliteDangerousAlmanac.Tests.Support;
using Xunit;

namespace EliteDangerousAlmanac.Tests.Ships;

/// <summary>The menu entry a fitted blueprint identifier is, measured against the shared fixture.</summary>
public class BlueprintMenuTests
{
    private static readonly Dictionary<string, List<string>> Aliases =
        SharedFixtures.Load<EngineeringOptionsFixture>(
            "fixtures/ships/engineering-options.jsonc").Corpus.BlueprintAliases;

    private static readonly List<string> GenericIds = BlueprintCatalogue.All.Keys
        .Where(id => id.StartsWith("Misc_", System.StringComparison.OrdinalIgnoreCase))
        .ToList();

    [Fact]
    public void AGenericSpellingFindsTheFamilyEntryItsModuleLists()
    {
        foreach ((string generic, List<string> specific) in Aliases)
        {
            foreach (string family in specific)
            {
                List<OutfittingModule> modules = ModuleCatalogue.All
                    .Where(module => EngineeringOptions.BlueprintsFor(module.Symbol).Contains(family))
                    .ToList();
                Assert.True(modules.Count > 0, $"No menu lists {family}.");
                foreach (OutfittingModule module in modules)
                {
                    Assert.Equal(family, BlueprintMenu.FindForModule(module.Symbol, generic));
                }
            }
        }

        // The case named in the documentation, read without the fixture.
        Assert.Equal(
            "LifeSupport_LightWeight",
            BlueprintMenu.FindForModule("Int_LifeSupport_Size4_Class2", "Misc_LightWeight"));
    }

    [Fact]
    public void AGenericSpellingFindsNoFamilyEntryOutsideThePinnedPairs()
    {
        // Every module, every generic identifier: an answer is the identifier itself where the
        // menu lists it, one of its pinned family identifiers, or nothing. A widened signature
        // match fails here.
        foreach (OutfittingModule module in ModuleCatalogue.All)
        {
            IReadOnlyList<string> offered = EngineeringOptions.BlueprintsFor(module.Symbol);
            foreach (string generic in GenericIds)
            {
                string? found = BlueprintMenu.FindForModule(module.Symbol, generic);
                if (found is null || found == generic) continue;
                Assert.True(
                    Aliases.TryGetValue(generic, out List<string>? specific) && specific.Contains(found),
                    $"{module.Symbol}: {generic} found {found}.");
                Assert.Contains(found, offered);
            }
        }
    }

    [Fact]
    public void AGenericSpellingNeverStandsInForADifferentRecipe()
    {
        // A weapon's Lightweight also cuts distributor draw.
        Assert.Null(BlueprintMenu.FindForModule("Hpt_PulseLaser_Fixed_Small", "Misc_LightWeight"));

        // The menu lists Misc_HeatSinkCapacity, which is generic too, and rolls different ammunition.
        Assert.Null(BlueprintMenu.FindForModule("Hpt_HeatSinkLauncher_Turret_Tiny", "Misc_ChaffCapacity"));

        // A menu that lists the generic identifier itself gives that identifier back.
        Assert.Equal(
            "Misc_ChaffCapacity",
            BlueprintMenu.FindForModule("Hpt_ChaffLauncher_Tiny", "Misc_ChaffCapacity"));
    }

    [Fact]
    public void AJournalSpellingFindsTheEntryItsModuleLists()
    {
        Assert.Equal(
            "Scanner_LongRange",
            BlueprintMenu.FindForModule("Hpt_CloudScanner_Size0_Class5", "Sensor_LongRange"));
        Assert.Equal(
            "Sensor_LongRange",
            BlueprintMenu.FindForModule("Int_Sensors_Size4_Class5", "Sensor_LongRange"));
        Assert.Equal(
            "MC_Overcharged",
            BlueprintMenu.FindForModule("Hpt_MultiCannon_Fixed_Medium", "Weapon_Overcharged"));
    }

    [Fact]
    public void TheAnswerIsTheMenuSpellingWhateverTheCaseAndWhitespace()
    {
        Assert.Equal(
            "LifeSupport_LightWeight",
            BlueprintMenu.FindForModule(" int_lifesupport_size4_class2 ", " lifesupport_lightweight "));
        Assert.Equal(
            "LifeSupport_LightWeight",
            BlueprintMenu.FindForModule("Int_LifeSupport_Size4_Class2", " MISC_LIGHTWEIGHT "));
    }

    [Fact]
    public void ARecipeOffTheOrdinaryMenuFindsNothing()
    {
        // A Mercenary recipe is sold with its module, not listed on the menu.
        Assert.Null(BlueprintMenu.FindForModule("Hpt_Railgun_Fixed_Medium", "RailGun_LongShot"));
        Assert.Null(BlueprintMenu.FindForModule("Int_LifeSupport_Size4_Class2", "FSD_LongRange"));
        Assert.Null(BlueprintMenu.FindForModule("Int_LifeSupport_Size4_Class2", "NoSuchRecipe"));
        Assert.Null(BlueprintMenu.FindForModule("Int_LifeSupport_Size4_Class2", "Misc_NoSuchRecipe"));
        Assert.Null(BlueprintMenu.FindForModule("NoSuchModule", "Misc_LightWeight"));
    }

    [Fact]
    public void AnAbsentArgumentIsAMiss()
    {
        Assert.Null(BlueprintMenu.FindForModule("Int_LifeSupport_Size4_Class2", null));
        Assert.Null(BlueprintMenu.FindForModule(null, "Misc_LightWeight"));
    }
}
