import type { TreeItem, TreeItemPayload } from '@/types';
const SampleTree: TreeItem[] = [
  {
    id: 1,
    forestId: 1,
    parentId: null,
    position: 1,
    path: '/1/',
    name: 'Banking',
    type: 'tree',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  // Branches
  {
    id: 2,
    forestId: 1,
    parentId: 1,
    position: 1,
    path: '/1/2/',
    name: 'Accounts',
    type: 'branch',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: 3,
    forestId: 1,
    parentId: 1,
    position: 2,
    path: '/1/3/',
    name: 'Credits',
    type: 'branch',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: 4,
    forestId: 1,
    parentId: 1,
    position: 3,
    path: '/1/4/',
    name: 'Payments',
    type: 'branch',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: 5,
    forestId: 1,
    parentId: 1,
    position: 4,
    path: '/1/5/',
    name: 'Risks',
    type: 'branch',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  // Leaves under Accounts
  {
    id: 6,
    forestId: 1,
    parentId: 2,
    position: 1,
    path: '/1/2/6/',
    name: 'Checking Accounts',
    type: 'leaf',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: 7,
    forestId: 1,
    parentId: 2,
    position: 2,
    path: '/1/2/7/',
    name: 'Savings Accounts',
    type: 'leaf',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  // Leaves under Credits
  {
    id: 8,
    forestId: 1,
    parentId: 3,
    position: 1,
    path: '/1/3/8/',
    name: 'Personal Loans',
    type: 'leaf',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: 9,
    forestId: 1,
    parentId: 3,
    position: 2,
    path: '/1/3/9/',
    name: 'Credit Cards',
    type: 'leaf',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  // Leaves under Payments
  {
    id: 10,
    forestId: 1,
    parentId: 4,
    position: 1,
    path: '/1/4/10/',
    name: 'Wire Transfers',
    type: 'leaf',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  // Leaves under Risks
  {
    id: 11,
    forestId: 1,
    parentId: 5,
    position: 1,
    path: '/1/5/11/',
    name: 'Credit Risk',
    type: 'leaf',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: 12,
    forestId: 1,
    parentId: 5,
    position: 2,
    path: '/1/5/12/',
    name: 'AML / KYC',
    type: 'leaf',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
];

export function getAllTrees(): TreeItem[] {
  try {
    const stored = localStorage.getItem('tree');
    if (stored) {
      return JSON.parse(stored);
    }
    return SampleTree;
  } catch (error) {
    console.error(error);
    return SampleTree;
  }
}

export function saveAllTrees(tree: TreeItem[]): void {
  try {
    localStorage.setItem('tree', JSON.stringify(tree));
  } catch (error) {
    console.error(error);
  }
}

export function getForest(forestId: number): TreeItem[] {
  const all = getAllTrees();
  return all.filter((tree) => tree.forestId === forestId);
}

export function putForest(forestId: number, tree: TreeItem[]): void {
  const normalized = normalizeForest(tree);
  const all = getAllTrees();
  const filtered = all.filter((tree) => tree.forestId !== forestId);
  const updated = [...filtered, ...normalized];
  saveAllTrees(updated);
}

export function deleteForest(forestId: number): void {
  const all = getAllTrees();
  const filtered = all.filter((tree) => tree.forestId !== forestId);
  saveAllTrees(filtered);
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
      .sort((a, b) => (a.position - b.position) || (a.id - b.id));
    activeSiblings.forEach((item, index) => {
      idToPosition.set(item.id, index + 1);
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

export function getCounter(): number {
  const all = getAllTrees();
  return all.reduce((acc, tree) => Math.max(acc, tree.id), 0) + 1;
}

export function addNode(forestId: number, parentId: number| null, node: TreeItemPayload): void {
  const tree = getForest(forestId);
  const counter = getCounter();
  const level = tree.filter((tree) => tree.parentId === parentId).filter((tree) => tree.deletedAt === null);
  const position = level.reduce((acc, tree) => Math.max(acc, tree.position), 0) + 1;
  const parent = tree.find((tree) => tree.id === parentId);
  const path = `${parent ? parent.path : ''}${parent ? '/' : ''}${counter}/`;
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
  putForest(forestId, tree);
}

export function deleteNode(forestId: number, nodeId: number): void {
  const tree = getForest(forestId);
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
  putForest(forestId, updated);
}

export function moveNode(
  forestId: number,
  nodeId: number,
  newParentId: number | null,
  newPosition: number
): void {
  const tree = getForest(forestId);
  const node = tree.find((item) => item.id === nodeId && item.deletedAt === null);
  if (!node) {
    throw new Error('Node not found');
  }
  if (node.parentId === newParentId && newPosition === node.position) {
    return;
  }
  const isDescendant = (candidate: { path: string }) => candidate.path.startsWith(`${node.path}`);
  if (newParentId !== null) {
    const newParent = tree.find((item) => item.id === newParentId && item.deletedAt === null);
    if (!newParent) {
      throw new Error('New parent not found');
    }
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
  const maxTargetPosition = targetSiblings.reduce((acc, item) => Math.max(acc, item.position), 0);
  const clampedNewPosition = Math.max(1, Math.min(newPosition, maxTargetPosition + 1));
  const newBasePath = newParent ? `${newParent.path}${node.id}/` : `/${node.id}/`;
  const updatedAfterOldParentReorder = tree.map((item) => {
    if (item.deletedAt !== null) {
      return item;
    }
    if (item.parentId === oldParentId && item.position > node.position && item.id !== node.id) {
      return { ...item, position: item.position - 1, updatedAt: nowIso };
    }
    return item;
  });
  const updatedAfterNewParentReorder = updatedAfterOldParentReorder.map((item) => {
    if (item.deletedAt !== null) {
      return item;
    }
    if (item.parentId === newParentId) {
      const isSameNode = item.id === node.id;
      const willBeInNewParent = node.parentId !== newParentId;
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
  putForest(forestId, updated);
}

