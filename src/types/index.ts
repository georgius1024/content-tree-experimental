export type TreeItem = {
  id: number;
  forestId: number;
  parentId?: number | null;
  position: number;
  path: string;
  name: string;
  type: 'tree' | 'branch' | 'leaf';
  objectId?: string; // UUID for course
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type TreeItemPayload = Omit<
  TreeItem,
  'id' | 'forestId' | 'parentId' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'path' | 'position' | 'objectId'
>;

export type Course = {
  id: string; // UUID
  author: string;
  fullName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};