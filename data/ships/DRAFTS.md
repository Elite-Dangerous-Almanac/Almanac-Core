# Unreleased hull drafts — `data/ships/`

This file holds hulls that the game has announced but not released.
A draft is not catalogue data. Neither package loads this file, and no schema validates it.

A hull moves into `ships.jsonc` when every field that `shipCatalogue` requires has a source.
Do not relax the schema to fit a draft, and do not fill a field with an estimate.
When a hull moves, delete its draft here and record its provenance in `SOURCES.md`.

## Anaconda Mk II

Tracked in #80.

### Source

The layout below is a maintainer-supplied reading of the announced hull.
No registry carries the hull, and the game cannot show it until the update that adds it ships.
No game version or acquisition date is recorded for the reading.
A reading on release wins outright where it disagrees with this draft.

### Known values

This partial record uses the `ships.jsonc` record shape. It holds only the fields the reading gives.

```json
{
  "name": "Anaconda Mk II",
  "core": {
    "powerPlant": 8,
    "thrusters": 7,
    "frameShiftDrive": 8,
    "lifeSupport": 5,
    "powerDistributor": 8,
    "sensors": 8
  },
  "hardpoints": [
    { "size": 4 },
    { "size": 3 },
    { "size": 3 },
    { "size": 3 },
    { "size": 3 },
    { "size": 1 },
    { "size": 1 }
  ],
  "utility": 8,
  "optional": [
    { "size": 8 },
    { "size": 7 },
    { "size": 7 },
    { "size": 6, "restriction": "cargo" },
    { "size": 5 },
    { "size": 5 },
    { "size": 5 },
    { "size": 5, "restriction": "military" },
    { "size": 5, "restriction": "military" },
    { "size": 4 },
    { "size": 4 },
    { "size": 3 },
    { "size": 2 },
    { "size": 1 }
  ]
}
```

- The reading gives hardpoints as one huge, four large and two small. The record stores them as sizes 4, 3 and 1.
- The reading gives five size-5 optionals, of which two are military. The record stores three unrestricted and two `military` mounts.
- The reading gives one size-6 optional, and that mount is cargo-only.
- The frame shift drive is size 8. Outfitting sells a size-8 frame shift drive only as a Supercruise Overcharge drive (`Int_Hyperdrive_Overcharge_Size8_Class{1..5}`).
- The mounts are in the descending-size order that `ships.jsonc` uses. The reading does not give the game's own order.

### Missing values

No source gives the fields below. A `ships.jsonc` record needs each of them, or must confirm its absence.

| Field                                                   | What is missing                                                                                                    |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `symbol`                                                | The internal identifier. FDevIDs has no row, and no journal entry names the hull.                                  |
| `manufacturer`                                          | The shipyard manufacturer. The Anaconda is a Faulcon DeLacy hull, but nothing states the Mk II manufacturer.       |
| `size`                                                  | The landing-pad class. The size-4 hardpoint and the size-8 drive do not state it.                                  |
| `entitlement`                                           | Whether a DLC or grant token gates the hull. The field is optional, so a release reading must confirm its absence. |
| `hullMass`                                              | The hull mass, in tonnes.                                                                                          |
| `minimumSpeed`, `maximumSpeed`, `boost`                 | The speed endpoints and the boost speed, in m/s.                                                                   |
| `minPitch`, `pitch`, `minRoll`, `roll`, `minYaw`, `yaw` | The zero- and four-ENG-PIP rotation rates, in deg/s.                                                               |
| `baseShieldStrength`, `baseArmour`, `hardness`          | The base shield strength, the base armour and the hardness.                                                        |
| `masslock`, `crew`                                      | The mass-lock factor and the crew seat count.                                                                      |
| `heatCapacity`, `heatDissipation`                       | The heat capacity and the maximum cooling rate, in thermal-load units per second at heat level 1.                  |
| `reserveFuelCapacity`                                   | The reserve fuel capacity, in tonnes.                                                                              |
| `core.fuelTank`                                         | The fuel-tank size. The reading gives the other six core sizes only.                                               |
| `hullCost`, `retailCost`                                | The bare-hull price and the price with the default modules, in credits.                                            |
| `optional` — planetary approach suite                   | Every released hull has a size-1 `planetaryApproachSuite` mount. The reading does not list one.                    |
| `hardpoints[].name`, `optional[].name`                  | The journal slot keys. Without a `Loadout` event, nothing confirms that the ordinary numbering rules apply.        |

The hull also needs data outside `ships.jsonc`:

| Catalogue                      | What is missing                                               |
| ------------------------------ | ------------------------------------------------------------- |
| `modules-core.jsonc`           | The armour modules: symbols, stats and prices for each grade. |
| `engineering-options.jsonc`    | The engineering family of each armour module.                 |
| `data/i18n/module-names.jsonc` | The localized armour-module names.                            |
| `default-loadouts.jsonc`       | The modules that the shipyard fits at `retailCost`.           |
| `gunsights.jsonc`              | The camera-relative offset of each hardpoint.                 |
| `assets/ships/<symbol>/`       | The gunsight, illustration and schematic drawings.            |
