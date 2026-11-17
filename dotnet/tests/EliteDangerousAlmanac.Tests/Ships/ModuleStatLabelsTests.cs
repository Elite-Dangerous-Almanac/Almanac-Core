using EliteDangerousAlmanac.Ships;
using EliteDangerousAlmanac.Ships.Internal;
using Xunit;

namespace EliteDangerousAlmanac.Tests.Ships;

/// <summary>How a journal modifier label resolves to the module stats it writes.</summary>
public class ModuleStatLabelsTests
{
    private static ModuleStats Stats(string symbol) => ModuleCatalogue.FindBySymbol(symbol)!.Stats;

    [Fact]
    public void StatsForAnswersEveryStatOfATwoStatLabelThatTheModuleCarries()
    {
        ModuleStats cellBank = Stats("Int_ShieldCellBank_Size1_Class1");

        Assert.Equal(ModuleStat.ShieldBankHeat, ModuleStatLabels.StatFor("ShieldBankHeat", cellBank));
        Assert.Equal(
            [ModuleStat.ShieldBankHeat, ModuleStat.ThermalLoad],
            ModuleStatLabels.StatsFor("ShieldBankHeat", cellBank));
    }

    [Fact]
    public void StatsForFallsBackToTheStatStatForAnswersWith()
    {
        // A weapon carries the maximum range, not the scanner range.
        Assert.Equal(
            [ModuleStat.MaximumRange],
            ModuleStatLabels.StatsFor("Range", Stats("Hpt_BeamLaser_Fixed_Small")));

        // A cargo rack carries neither stat that Range writes.
        Assert.Equal(
            [ModuleStat.MaximumRange],
            ModuleStatLabels.StatsFor("Range", Stats("Int_CargoRack_Size1_Class1")));
        Assert.Equal([ModuleStat.ShieldBankHeat], ModuleStatLabels.StatsFor("ShieldBankHeat", null));
        Assert.Empty(ModuleStatLabels.StatsFor("NotALabel", Stats("Hpt_BeamLaser_Fixed_Small")));
    }
}
