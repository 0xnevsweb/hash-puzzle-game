import { describe, it, expect } from 'vitest';
import {
  canAddBridge,
  isVictory,
  checkConnectivity,
  computeCurrentCounts,
} from '../../app/src/utils/hashiLogic.js';

// Easy puzzle layout: four islands at grid corners, each value=2
const makeEasy = () => [
  { id: 0, x: 2, y: 2, value: 2 },
  { id: 1, x: 6, y: 2, value: 2 },
  { id: 2, x: 2, y: 6, value: 2 },
  { id: 3, x: 6, y: 6, value: 2 },
];

// Build a solved Easy puzzle: ring of four single bridges
const solvedEasyBridges = () => {
  const b = new Map<string, number>();
  b.set('2,2,6,2', 1); // top edge
  b.set('2,2,2,6', 1); // left edge
  b.set('6,2,6,6', 1); // right edge
  b.set('2,6,6,6', 1); // bottom edge
  return b;
};

describe('canAddBridge', () => {
  it('allows a valid horizontal bridge', () => {
    const islands = makeEasy();
    const { valid } = canAddBridge(islands, new Map(), islands[0], islands[1], 1);
    expect(valid).toBe(true);
  });

  it('allows a valid vertical bridge', () => {
    const islands = makeEasy();
    const { valid } = canAddBridge(islands, new Map(), islands[0], islands[2], 1);
    expect(valid).toBe(true);
  });

  it('rejects a diagonal connection', () => {
    const islands = makeEasy();
    const { valid, error } = canAddBridge(islands, new Map(), islands[0], islands[3], 1);
    expect(valid).toBe(false);
    expect(error).toMatch(/non-adjacent/i);
  });

  it('rejects exceeding max 2 bridges per pair', () => {
    const islands = makeEasy();
    const bridges = new Map([['2,2,6,2', 2]]);
    const { valid, error } = canAddBridge(islands, bridges, islands[0], islands[1], 1);
    expect(valid).toBe(false);
    expect(error).toMatch(/max 2/i);
  });

  it('rejects when island value would be exceeded', () => {
    const islands = makeEasy();
    // Give island[0] both horizontal and vertical bridges (total = 2 = its value)
    const bridges = new Map([['2,2,6,2', 1], ['2,2,2,6', 1]]);
    const { valid, error } = canAddBridge(islands, bridges, islands[0], islands[1], 1);
    expect(valid).toBe(false);
    expect(error).toMatch(/exceed/i);
  });

  it('does not allow self-connection', () => {
    const islands = makeEasy();
    const { valid } = canAddBridge(islands, new Map(), islands[0], islands[0], 1);
    expect(valid).toBe(false);
  });

  it('rejects a bridge that would cross an existing one', () => {
    const islands = [
      { id: 0, x: 2, y: 4, value: 2 },
      { id: 1, x: 8, y: 4, value: 2 },
      { id: 2, x: 5, y: 2, value: 2 },
      { id: 3, x: 5, y: 6, value: 2 },
    ];
    const bridges = new Map([['5,2,5,6', 1]]);
    const { valid, error } = canAddBridge(islands, bridges, islands[0], islands[1], 1);
    expect(valid).toBe(false);
    expect(error).toMatch(/cross/i);
  });
});

describe('getKey canonicalization (via canAddBridge)', () => {
  it('horizontal and vertical bridges from the same island get distinct keys', () => {
    const islands = makeEasy();
    const bridges = new Map<string, number>();

    // Add horizontal A->B
    const { valid: v1 } = canAddBridge(islands, bridges, islands[0], islands[1], 1);
    expect(v1).toBe(true);
    bridges.set('2,2,6,2', 1);

    // Add vertical A->C -- must not collide with A->B key
    const { valid: v2 } = canAddBridge(islands, bridges, islands[0], islands[2], 1);
    expect(v2).toBe(true);
    bridges.set('2,2,2,6', 1);

    // Both bridges should coexist: A has 2 connections
    const counts = computeCurrentCounts(islands, bridges);
    expect(counts.get(0)).toBe(2);
  });
});

describe('isVictory', () => {
  it('returns false on empty board', () => {
    expect(isVictory(makeEasy(), new Map())).toBe(false);
  });

  it('returns true for fully solved Easy puzzle', () => {
    expect(isVictory(makeEasy(), solvedEasyBridges())).toBe(true);
  });

  it('returns false when not all island values satisfied', () => {
    const partial = new Map([['2,2,6,2', 1]]); // only 1 bridge placed
    expect(isVictory(makeEasy(), partial)).toBe(false);
  });

  it('returns false when counts are satisfied but graph is disconnected', () => {
    const islands = [
      { id: 0, x: 2, y: 2, value: 2 },
      { id: 1, x: 6, y: 2, value: 2 },
      { id: 2, x: 2, y: 8, value: 2 },
      { id: 3, x: 6, y: 8, value: 2 },
    ];
    const bridges = new Map([['2,2,6,2', 2], ['2,8,6,8', 2]]);
    expect(isVictory(islands, bridges)).toBe(false);
  });
});

describe('checkConnectivity', () => {
  it('returns false when graph is disconnected', () => {
    const islands = makeEasy();
    // Only top and bottom edges -- left two isolated from right two
    const bridges = new Map([['2,2,6,2', 1], ['2,6,6,6', 1]]);
    expect(checkConnectivity(islands, bridges)).toBe(false);
  });

  it('returns true when all islands are reachable', () => {
    expect(checkConnectivity(makeEasy(), solvedEasyBridges())).toBe(true);
  });
});

describe('computeCurrentCounts', () => {
  it('counts single bridges correctly', () => {
    const islands = makeEasy();
    const bridges = new Map([['2,2,6,2', 1]]);
    const counts = computeCurrentCounts(islands, bridges);
    expect(counts.get(0)).toBe(1);
    expect(counts.get(1)).toBe(1);
    expect(counts.get(2)).toBe(0);
    expect(counts.get(3)).toBe(0);
  });

  it('counts double bridges correctly', () => {
    const islands = makeEasy();
    const bridges = new Map([['2,2,6,2', 2]]);
    const counts = computeCurrentCounts(islands, bridges);
    expect(counts.get(0)).toBe(2);
    expect(counts.get(1)).toBe(2);
  });
});
