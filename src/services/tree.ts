import type { TreeItem, TreeItemPayload } from '@/types';
import { getSampleTrees } from './samples';

export { CONTENT_FOREST } from './samples';

function getCurrentLocale(): 'en' | 'ru' {
  if (typeof window === 'undefined') {
    return 'en';
  }
  const saved = window.localStorage.getItem('locale');
  if (saved === 'ru' || saved === 'en') {
    return saved;
  }
  const browserLang = window.navigator.language?.split('-')[0]?.toLowerCase();
  return browserLang === 'ru' ? 'ru' : 'en';
}

export async function getAllTrees(): Promise<TreeItem[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  try {
    const stored = localStorage.getItem('tree');
    if (stored) {
      return JSON.parse(stored);
    }
    const locale = getCurrentLocale();
    return getSampleTrees(locale);
  } catch (error) {
    console.error(error);
    const locale = getCurrentLocale();
    return getSampleTrees(locale);
  }
}

export async function saveAllTrees(tree: TreeItem[]): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log('saveAllTrees', tree);
  try {
    localStorage.setItem('tree', JSON.stringify(tree));
  } catch (error) {
    console.error(error);
  }
}

export async function resetAllTrees(locale?: 'en' | 'ru'): Promise<void> {
  try {
    const currentLocale = locale ?? getCurrentLocale();
    const sampleTrees = getSampleTrees(currentLocale);
    await saveAllTrees(sampleTrees);
  } catch (error) {
    console.error(error);
  }
}

function normalizePath(path: string): string {
  // Fix double slashes: /1//19/ -> /1/19/
  return path.replace(/\/+/g, '/').replace(/^\/\//, '/');
}

export async function getForest(forestId: number): Promise<TreeItem[]> {
  const all = await getAllTrees();
  const forest = all.filter((tree) => tree.forestId === forestId);
  // Normalize any corrupted paths (fixes double slashes)
  const needsFix = forest.some((item) => item.path.includes('//'));
  if (needsFix) {
    // First, normalize all paths
    const pathMap = new Map<number, string>();
    const fixed = forest.map((item) => {
      const normalized = normalizePath(item.path);
      pathMap.set(item.id, normalized);
      return {
        ...item,
        path: normalized
      };
    });
    
    // Update descendant paths that reference corrupted parent paths
    const fullyFixed = fixed.map((item) => {
      // Check if this item's path needs to be updated based on parent path changes
      const parent = fixed.find((p) => p.id === item.parentId);
      if (parent && item.path.startsWith(parent.path)) {
        // Path is already correct relative to parent
        return item;
      }
      // Rebuild path from parent if parent exists
      if (item.parentId != null) {
        const parentPath = pathMap.get(item.parentId);
        if (parentPath) {
          const relative = item.path.split('/').filter(Boolean).pop();
          return {
            ...item,
            path: `${parentPath}${relative}/`
          };
        }
      }
      return item;
    });
    
    // Save the fixed paths back
    const otherForests = all.filter((tree) => tree.forestId !== forestId);
    await saveAllTrees([...otherForests, ...fullyFixed]);
    return fullyFixed;
  }
  return forest;
}

export async function putForest(forestId: number, tree: TreeItem[]): Promise<void> {
  const normalized = normalizeForest(tree);
  const all = await getAllTrees();
  const filtered = all.filter((tree) => tree.forestId !== forestId);
  const updated = [...filtered, ...normalized];
  await saveAllTrees(updated);
}

export async function deleteForest(forestId: number): Promise<void> {
  const all = await getAllTrees();
  const filtered = all.filter((tree) => tree.forestId !== forestId);
  await saveAllTrees(filtered);
}

export function sortTreeItems(a: TreeItem, b: TreeItem): number {
  const aIsFolder = a.type !== 'leaf';
  const bIsFolder = b.type !== 'leaf';
  if (aIsFolder !== bIsFolder) {
    return aIsFolder ? -1 : 1; // folders first
  }
  if (a.position !== b.position) {
    return a.position - b.position;
  }
  return a.id - b.id;
}

function normalizeForest(tree: TreeItem[]): TreeItem[] {
  const parentIds = Array.from(
    new Set(tree.map((item) => (item.parentId ?? null)))
  );
  const idToPosition = new Map<number, number>();
  parentIds.forEach((parentId) => {
    const activeSiblings = tree
      .filter((item) => item.deletedAt === null)
      .filter((item) => (item.parentId ?? null) === parentId)
      .sort(sortTreeItems);
    activeSiblings.forEach((item, index) => {
      idToPosition.set(item.id, index); // 0-based
    });
  });
  return tree.map((item) => {
    if (item.deletedAt !== null) {
      return item;
    }
    const newPosition = idToPosition.get(item.id);
    if (newPosition && newPosition !== item.position) {
      return { ...item, position: newPosition };
    }
    return item;
  });
}

export async function getCounter(): Promise<number> {
  const all = await getAllTrees();
  return all.reduce((acc, tree) => Math.max(acc, tree.id), 0) + 1;
}

export async function addNode(forestId: number, parentId: number| null, node: TreeItemPayload): Promise<void> {
  const tree = await getForest(forestId);
  const counter = await getCounter();
  const level = tree.filter((tree) => tree.parentId === parentId).filter((tree) => tree.deletedAt === null);
  const maxPosition = level.length === 0 ? -1 : level.reduce((acc, t) => Math.max(acc, t.position), -1);
  const position = maxPosition + 1; // 0-based
  const parent = tree.find((tree) => tree.id === parentId);
  // Ensure parent path is normalized (no double slashes) before constructing child path
  const parentPath = parent ? normalizePath(parent.path) : '';
  const path = parentPath ? `${parentPath}${counter}/` : `/${counter}/`;
  const newNode: TreeItem = {
    ...node,
    id: counter,
    forestId: forestId,
    parentId: parentId,
    position,
    path,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
  tree.push(newNode);
  await putForest(forestId, tree);
}

export async function deleteNode(forestId: number, nodeId: number): Promise<void> {
  const tree = await getForest(forestId);
  const node = tree.find((item) => item.id === nodeId);
  if (!node) {
    throw new Error('Node not found');
  }
  const updated = tree.map((item) => {
    if (item.id === nodeId) {
      return { ...item, deletedAt: new Date().toISOString() };
    }
    if (item.path.startsWith(node.path)) {
      return { ...item, deletedAt: new Date().toISOString() };
    }
    if (item.parentId === node.parentId && item.position > node.position) {
      return { ...item, position: item.position - 1 };
    }
    return item;
  });
  await putForest(forestId, updated);
}

export async function moveNode(
  forestId: number,
  nodeId: number,
  newParentId: number | null,
  newPosition: number
): Promise<void> {
  const tree = await getForest(forestId);
  const node = tree.find((item) => item.id === nodeId && item.deletedAt === null);
  if (!node) {
    throw new Error('Node not found');
  }
  if (node.parentId === newParentId && newPosition === node.position) {
    return;
  }
  // Prevent moving a node into itself
  if (newParentId === nodeId) {
    throw new Error('Cannot move a node into itself');
  }
  const isDescendant = (candidate: { path: string }) => candidate.path.startsWith(`${node.path}`);
  if (newParentId !== null) {
    const newParent = tree.find((item) => item.id === newParentId && item.deletedAt === null);
    if (!newParent) {
      throw new Error('New parent not found');
    }
    // Prevent moving a node into its own descendant (would create cycle)
    if (isDescendant(newParent)) {
      throw new Error('Cannot move a node into its own descendant');
    }
  }
  const oldParentId = node.parentId ?? null;
  const oldNodePath = node.path;
  const nowIso = new Date().toISOString();
  const newParent = newParentId === null ? null : tree.find((item) => item.id === newParentId && item.deletedAt === null) ?? null;
  const targetSiblings = tree
    .filter((item) => item.deletedAt === null)
    .filter((item) => item.parentId === newParentId);
  const maxTargetPosition = targetSiblings.length === 0 ? -1 : targetSiblings.reduce((acc, item) => Math.max(acc, item.position), -1);
  const clampedNewPosition = Math.max(0, Math.min(newPosition, maxTargetPosition + 1));
  const newBasePath = newParent ? `${newParent.path}${node.id}/` : `/${node.id}/`;
  const willBeInNewParentFlag = node.parentId !== newParentId;
  const updatedAfterOldParentReorder = willBeInNewParentFlag
    ? tree.map((item) => {
        if (item.deletedAt !== null) {
          return item;
        }
        if (item.parentId === oldParentId && item.position > node.position && item.id !== node.id) {
          return { ...item, position: item.position - 1, updatedAt: nowIso };
        }
        return item;
      })
    : tree;
  const updatedAfterNewParentReorder = updatedAfterOldParentReorder.map((item) => {
    if (item.deletedAt !== null) {
      return item;
    }
    if (item.parentId === newParentId) {
      const isSameNode = item.id === node.id;
      const willBeInNewParent = willBeInNewParentFlag;
      if (willBeInNewParent) {
        if (item.position >= clampedNewPosition && !isSameNode) {
          return { ...item, position: item.position + 1, updatedAt: nowIso };
        }
      } else {
        if (!isSameNode) {
          if (node.position < clampedNewPosition && item.position <= clampedNewPosition && item.position > node.position) {
            return { ...item, position: item.position - 1, updatedAt: nowIso };
          }
          if (node.position > clampedNewPosition && item.position >= clampedNewPosition && item.position < node.position) {
            return { ...item, position: item.position + 1, updatedAt: nowIso };
          }
        }
      }
    }
    return item;
  });
  const descendantIds = updatedAfterNewParentReorder
    .filter((item) => item.deletedAt === null && item.path.startsWith(oldNodePath))
    .map((item) => item.id);
  const updated = updatedAfterNewParentReorder.map((item) => {
    if (item.id === node.id) {
      return {
        ...item,
        parentId: newParentId,
        position: clampedNewPosition,
        path: newBasePath,
        updatedAt: nowIso,
      };
    }
    if (descendantIds.includes(item.id)) {
      const relative = item.path.slice(oldNodePath.length);
      return {
        ...item,
        path: `${newBasePath}${relative}`,
        updatedAt: nowIso,
      };
    }
    return item;
  });
  await putForest(forestId, updated);
}

export async function updateNode(forestId: number, nodeId: number, name: string, newParentId: number | null): Promise<void> {
  const tree = await getForest(forestId);
  const node = tree.find((item) => item.id === nodeId && item.deletedAt === null);
  if (!node) {
    throw new Error('Node not found');
  }
  const nameChanged = name !== node.name;
  const parentChanged = (node.parentId ?? null) !== newParentId;
  if (!nameChanged && !parentChanged) {
    return;
  }
  const nowIso = new Date().toISOString();
  if (parentChanged) {
    const targetSiblings = tree
      .filter((item) => item.deletedAt === null)
      .filter((item) => item.parentId === newParentId);
    const maxPosition = targetSiblings.length === 0 ? -1 : targetSiblings.reduce((acc, item) => Math.max(acc, item.position), -1);
    const newPosition = maxPosition + 1;
    await moveNode(forestId, nodeId, newParentId, newPosition);
  }
  if (nameChanged) {
    // Re-fetch the forest in case parent was changed (which would have updated the tree)
    const currentTree = await getForest(forestId);
    const updated = currentTree.map((item) => {
      if (item.id === nodeId) {
        return { ...item, name, updatedAt: nowIso };
      }
      return item;
    });
    await putForest(forestId, updated);
  }
}

export async function attachObjectId(forestId: number, nodeId: number, objectId: string): Promise<void> {
  const tree = await getForest(forestId);
  const nowIso = new Date().toISOString();
  const updated = tree.map((item) =>
    item.id === nodeId ? { ...item, objectId, updatedAt: nowIso } : item
  );
  await putForest(forestId, updated);
}
