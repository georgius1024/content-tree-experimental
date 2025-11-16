import type { Course } from '@/types';

const STORAGE_KEY = 'courses';

const nowIso = (): string => new Date().toISOString();

const genUuid = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Simple fallback for environments without crypto.randomUUID
  const s4 = (): string =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .slice(1);
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

export function getAllCourses(): Course[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Course[]) : [];
  } catch {
    return [];
  }
}

export function saveAllCourses(courses: Course[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  } catch {
    // noop
  }
}

export function resetAllCourses(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

export function getCourse(id: string): Course | null {
  return getAllCourses().find((c) => c.id === id) ?? null;
}

export function createCourse(
  payload: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
): Course {
  const course: Course = {
    id: genUuid(),
    author: payload.author,
    fullName: payload.fullName,
    description: payload.description,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    deletedAt: null,
  };
  const all = getAllCourses();
  saveAllCourses([...all, course]);
  return course;
}

export function updateCourse(
  id: string,
  attrs: Partial<Omit<Course, 'id' | 'createdAt'>>
): void {
  const all = getAllCourses();
  const updated = all.map((c) =>
    c.id === id
      ? {
          ...c,
          ...attrs,
          updatedAt: nowIso(),
        }
      : c
  );
  saveAllCourses(updated);
}

export function softDeleteCourse(id: string): void {
  const all = getAllCourses();
  const updated = all.map((c) =>
    c.id === id ? { ...c, deletedAt: nowIso(), updatedAt: nowIso() } : c
  );
  saveAllCourses(updated);
}

