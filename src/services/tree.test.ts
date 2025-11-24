import { describe, it, expect, beforeEach } from 'vitest';
import {
  addNode,
  deleteForest,
  getAllTrees,
  getForest,
  moveNode,
  putForest,
  saveAllTrees,
} from './tree';
import type { TreeItem } from '@/types';

describe('tree service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('moveNode: reorders siblings within same parent correctly', async () => {
    const forestId = 1;
    // Create a temporary parent under root
    await addNode(forestId, 1, { name: 'Reorder Parent', type: 'branch' });
    const forest = await getForest(forestId);
    const parent = forest.find((n) => n.name === 'Reorder Parent' && n.deletedAt === null)!;
    // Add two children under temp parent
    await addNode(forestId, parent.id, { name: 'Sib A', type: 'leaf' });
    await addNode(forestId, parent.id, { name: 'Sib B', type: 'leaf' });
    const forest2 = await getForest(forestId);
    const sibB = forest2.find((n) => n.name === 'Sib B' && n.parentId === parent.id)!;
    // Move last to first within same parent
    await moveNode(forestId, sibB.id, parent.id, 1);
    const after = (await getForest(forestId))
      .filter((n) => n.parentId === parent.id && n.deletedAt === null)
      .sort((a, b) => a.position - b.position);
    expect(after.length).toBe(2);
    expect(after[0]?.id).toBe(sibB.id);
    expect(after.map((n) => n.position)).toEqual([1, 2]);
  });

  it('moveNode: moves to new parent and clamps position, updates path', async () => {
    const forestId = 1;
    // Create a temporary parent and a child under it
    await addNode(forestId, 1, { name: 'Move Parent', type: 'branch' });
    const forest = await getForest(forestId);
    const parent = forest.find((n) => n.name === 'Move Parent' && n.deletedAt === null)!;
    await addNode(forestId, parent.id, { name: 'Child X', type: 'leaf' });
    const forest2 = await getForest(forestId);
    const childX = forest2.find((n) => n.name === 'Child X' && n.parentId === parent.id)!;
    // Move Child X to root at an out-of-range position (will clamp to end)
    await moveNode(forestId, childX.id, null, 999);
    const forest3 = await getForest(forestId);
    const rootChildren = forest3.filter((n) => n.parentId === null && n.deletedAt === null).sort((a, b) => a.position - b.position);
    const moved = forest3.find((n) => n.id === childX.id)!;
    expect(moved.parentId).toBeNull();
    expect(rootChildren.some((n) => n.id === moved.id)).toBe(true);
    // Path should be root-based for moved node
    expect(moved.path).toBe(`/${moved.id}/`);
  });

  it('sample tree: has banking branches and expected leaves', async () => {
    localStorage.clear();
    const forestId = 1;
    const tree = (await getForest(forestId)).filter((n) => n.deletedAt === null);
    const root = tree.find((n) => n.parentId === null)!;
    expect(root.name).toBe('Banking');
    const branches = tree.filter((n) => n.parentId === root.id && n.type === 'branch');
    const branchNames = branches.map((b) => b.name).sort();
    expect(branchNames).toEqual(['Accounts', 'Credits', 'Payments', 'Risks'].sort());
    const leaves = tree.filter((n) => n.type === 'leaf');
    expect(leaves.length).toBeGreaterThanOrEqual(5);
    expect(leaves.length).toBeLessThanOrEqual(7);
    const leafNames = leaves.map((l) => l.name);
    // Presence checks for key banking-oriented leaves
    expect(leafNames).toEqual(
      expect.arrayContaining([
        'Checking Accounts',
        'Savings Accounts',
        'Personal Loans',
        'Credit Cards',
        'Wire Transfers',
        'Credit Risk',
        'AML / KYC',
      ])
    );
  });

  it('putForest: normalizes positions per parent and preserves other forests', async () => {
    const now = new Date().toISOString();
    const forest1: TreeItem[] = [
      { id: 101, forestId: 10, parentId: null, position: 5, path: '/101/', name: 'root-10', type: 'tree', createdAt: now, updatedAt: now, deletedAt: null },
      { id: 102, forestId: 10, parentId: 101, position: 3, path: '/101/102/', name: 'a', type: 'branch', createdAt: now, updatedAt: now, deletedAt: null },
      { id: 103, forestId: 10, parentId: 101, position: 1, path: '/101/103/', name: 'b', type: 'branch', createdAt: now, updatedAt: now, deletedAt: null },
      { id: 104, forestId: 10, parentId: 101, position: 3, path: '/101/104/', name: 'c', type: 'branch', createdAt: now, updatedAt: now, deletedAt: null },
    ];
    const forest2: TreeItem[] = [
      { id: 201, forestId: 20, parentId: null, position: 1, path: '/201/', name: 'root-20', type: 'tree', createdAt: now, updatedAt: now, deletedAt: null },
    ];
    await saveAllTrees([...forest1, ...forest2]);
    // Write forest 10 with out-of-order positions -> should normalize on put
    await putForest(10, forest1);
    const afterAll = await getAllTrees();
    // Forest 20 remains intact
    const f20 = afterAll.filter((n) => n.forestId === 20);
    expect(f20).toHaveLength(1);
    expect(f20[0]?.id).toBe(201);
    // Forest 10 children under 101 must be 1..N without gaps
    const f10Children = (await getForest(10)).filter((n) => n.parentId === 101 && n.deletedAt === null).sort((a, b) => a.position - b.position);
    expect(f10Children.map((n) => n.position)).toEqual([1, 2, 3]);
  });

  it('deleteForest: removes only the specified forest and preserves others', async () => {
    const now = new Date().toISOString();
    const forest1: TreeItem[] = [
      { id: 301, forestId: 30, parentId: null, position: 1, path: '/301/', name: 'root-30', type: 'tree', createdAt: now, updatedAt: now, deletedAt: null },
      { id: 302, forestId: 30, parentId: 301, position: 1, path: '/301/302/', name: 'child-30', type: 'branch', createdAt: now, updatedAt: now, deletedAt: null },
    ];
    const forest2: TreeItem[] = [
      { id: 401, forestId: 40, parentId: null, position: 1, path: '/401/', name: 'root-40', type: 'tree', createdAt: now, updatedAt: now, deletedAt: null },
    ];
    await saveAllTrees([...forest1, ...forest2]);
    // Delete forest 30, forest 40 should remain
    await deleteForest(30);
    let remaining = await getAllTrees();
    expect(remaining.some((n) => n.forestId === 30)).toBe(false);
    expect(remaining.some((n) => n.forestId === 40 && n.id === 401)).toBe(true);
    // Delete forest 40, storage should be empty
    await deleteForest(40);
    remaining = await getAllTrees();
    expect(remaining).toHaveLength(0);
  });
});


