import { test } from 'node:test';
import assert from 'node:assert/strict';

import { getMenuBlueprintForModule } from './blueprint-menu.js';
import { BLUEPRINTS } from './blueprints.js';
import { getBlueprintsForModule } from './engineering-options.js';
import { ALL_MODULES } from './modules-all.js';
import fixture from '../../../fixtures/ships/engineering-options.jsonc' with { type: 'json' };

const aliases: Record<string, readonly string[]> = fixture.corpus.blueprintAliases;
const genericIds = Object.keys(BLUEPRINTS).filter((id) => id.toLowerCase().startsWith('misc_'));

test('a generic spelling finds the family entry its module lists', () => {
    for (const [generic, specific] of Object.entries(aliases)) {
        for (const family of specific) {
            const modules = ALL_MODULES.filter((module) =>
                getBlueprintsForModule(module.symbol).includes(family),
            );
            assert.ok(modules.length > 0, `no menu lists ${family}`);
            for (const module of modules) {
                assert.equal(
                    getMenuBlueprintForModule(module.symbol, generic),
                    family,
                    `${module.symbol}: ${generic}`,
                );
            }
        }
    }
    // The case named in the documentation, read without the fixture.
    assert.equal(
        getMenuBlueprintForModule('Int_LifeSupport_Size4_Class2', 'Misc_LightWeight'),
        'LifeSupport_LightWeight',
    );
});

test('a generic spelling finds no family entry outside the pinned pairs', () => {
    // Every module, every generic id: an answer is the id itself where the menu lists it,
    // one of its pinned family ids, or nothing. A widened signature match fails here.
    for (const module of ALL_MODULES) {
        const offered = getBlueprintsForModule(module.symbol);
        for (const generic of genericIds) {
            const found = getMenuBlueprintForModule(module.symbol, generic);
            if (found === null || found === generic) continue;
            assert.ok(
                (aliases[generic] ?? []).includes(found),
                `${module.symbol}: ${generic} found ${found}`,
            );
            assert.ok(offered.includes(found), `${module.symbol}: ${found} is not offered`);
        }
    }
});

test('a generic spelling never stands in for a different recipe', () => {
    // A weapon's Lightweight also cuts distributor draw.
    assert.equal(getMenuBlueprintForModule('Hpt_PulseLaser_Fixed_Small', 'Misc_LightWeight'), null);
    // The menu lists Misc_HeatSinkCapacity, which is generic too, and rolls different ammunition.
    assert.equal(
        getMenuBlueprintForModule('Hpt_HeatSinkLauncher_Turret_Tiny', 'Misc_ChaffCapacity'),
        null,
    );
    // A menu that lists the generic id itself gives that id back.
    assert.equal(
        getMenuBlueprintForModule('Hpt_ChaffLauncher_Tiny', 'Misc_ChaffCapacity'),
        'Misc_ChaffCapacity',
    );
});

test('a journal spelling finds the entry its module lists', () => {
    assert.equal(
        getMenuBlueprintForModule('Hpt_CloudScanner_Size0_Class5', 'Sensor_LongRange'),
        'Scanner_LongRange',
    );
    assert.equal(
        getMenuBlueprintForModule('Int_Sensors_Size4_Class5', 'Sensor_LongRange'),
        'Sensor_LongRange',
    );
    assert.equal(
        getMenuBlueprintForModule('Hpt_MultiCannon_Fixed_Medium', 'Weapon_Overcharged'),
        'MC_Overcharged',
    );
});

test('the answer is the menu spelling, whatever the case and whitespace', () => {
    assert.equal(
        getMenuBlueprintForModule(' int_lifesupport_size4_class2 ', ' lifesupport_lightweight '),
        'LifeSupport_LightWeight',
    );
    assert.equal(
        getMenuBlueprintForModule('Int_LifeSupport_Size4_Class2', ' MISC_LIGHTWEIGHT '),
        'LifeSupport_LightWeight',
    );
});

test('a recipe off the ordinary menu finds nothing', () => {
    // A Mercenary recipe is sold with its module, not listed on the menu.
    assert.equal(getMenuBlueprintForModule('Hpt_Railgun_Fixed_Medium', 'RailGun_LongShot'), null);
    assert.equal(getMenuBlueprintForModule('Int_LifeSupport_Size4_Class2', 'FSD_LongRange'), null);
    assert.equal(getMenuBlueprintForModule('Int_LifeSupport_Size4_Class2', 'NoSuchRecipe'), null);
    assert.equal(
        getMenuBlueprintForModule('Int_LifeSupport_Size4_Class2', 'Misc_NoSuchRecipe'),
        null,
    );
    assert.equal(getMenuBlueprintForModule('NoSuchModule', 'Misc_LightWeight'), null);
});

test('an absent argument is a miss and a wrong type is refused', () => {
    assert.equal(
        getMenuBlueprintForModule('Int_LifeSupport_Size4_Class2', null as unknown as string),
        null,
    );
    assert.equal(
        getMenuBlueprintForModule(undefined as unknown as string, 'Misc_LightWeight'),
        null,
    );
    assert.throws(
        () => getMenuBlueprintForModule('Int_LifeSupport_Size4_Class2', 42 as unknown as string),
        {
            name: 'TypeError',
            message:
                'getMenuBlueprintForModule: blueprintSymbol must be a string, received number 42',
        },
    );
    assert.throws(() => getMenuBlueprintForModule(42 as unknown as string, 'Misc_LightWeight'), {
        name: 'TypeError',
        message: 'getMenuBlueprintForModule: moduleSymbol must be a string, received number 42',
    });
});
