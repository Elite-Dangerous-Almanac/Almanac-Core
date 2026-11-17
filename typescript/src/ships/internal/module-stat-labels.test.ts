import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getModuleBySymbol } from '../modules.js';
import { fieldForLabel, fieldsForLabel } from './module-stat-labels.js';

test('fieldsForLabel answers every field of a two-field label that the record carries', () => {
    const cellBank = getModuleBySymbol('Int_ShieldCellBank_Size1_Class1');
    assert.ok(cellBank);
    assert.equal(fieldForLabel('ShieldBankHeat', cellBank), 'shieldBankHeat');
    assert.deepEqual(fieldsForLabel('ShieldBankHeat', cellBank), ['shieldBankHeat', 'thermalLoad']);
});

test('fieldsForLabel falls back to the field fieldForLabel answers with', () => {
    const beam = getModuleBySymbol('Hpt_BeamLaser_Fixed_Small');
    assert.ok(beam);
    // A weapon carries `maximumRange`, not the scanner's `scannerRange`.
    assert.deepEqual(fieldsForLabel('Range', beam), ['maximumRange']);
    // A cargo rack carries neither field that `Range` writes.
    const rack = getModuleBySymbol('Int_CargoRack_Size1_Class1');
    assert.ok(rack);
    assert.deepEqual(fieldsForLabel('Range', rack), ['maximumRange']);
    assert.deepEqual(fieldsForLabel('ShieldBankHeat'), ['shieldBankHeat']);
    assert.deepEqual(fieldsForLabel('NotALabel', beam), []);
});
