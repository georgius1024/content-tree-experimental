import type { Course } from '@/types';
import { getSampleCourses } from './samples';

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

export function resetAllCourses(locale?: 'en' | 'ru'): void {
  try {
    const currentLocale = locale ?? getCurrentLocale();
    const sampleCourses = getSampleCourses(currentLocale);
    saveAllCourses(sampleCourses);
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
    structure: payload.structure ?? [], // Default to empty structure if not provided
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

