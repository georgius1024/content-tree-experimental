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

// Input rule types for questions
export type InputRuleType = 'single' | 'multiple';

export type InputRule = {
  type: InputRuleType; // 'single' for 1:n (one correct answer), 'multiple' for m:n (multiple correct answers)
  correctOptions: number[]; // Indices of correct options (0-based)
};

// Slide step
export type Slide = {
  id: string; // UUID
  type: 'slide';
  name: string;
  content: string; // HTML content
};

// Question step
export type Question = {
  id: string; // UUID
  type: 'question';
  name: string;
  slide: string; // HTML content (question text/content)
  options: string[]; // Array of answer options
  inputRule: InputRule; // Rule for validating answers
};

// Step is either a Slide or Question
export type Step = Slide | Question;

// Section contains a set of steps
export type Section = {
  id: string; // UUID
  name: string;
  steps: Step[]; // Ordered array of slides and questions
};

// Course with structure
export type Course = {
  id: string; // UUID
  author: string;
  fullName: string;
  description: string;
  structure: Section[]; // Course structure with sections
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

// Preview runtime types
export type PreviewAnswer = {
  selected: readonly number[]; // chosen option indices
  score: number;               // 0..1
  submittedAt: string;          // ISO timestamp
};

export type PreviewStep = {
  section: Section;
  step: Step;
  sectionIndex: number;
  stepIndex: number;
  globalIndex: number;
  answer?: PreviewAnswer; // if present => submitted/locked
};

export type PreviewState = {
  steps: readonly PreviewStep[]; // flattened course steps (order of play)
  position: number;              // 0-based current index in steps
};

export type SectionSummary = {
  section: Section;
  questions: number;
  correct: number;
  accuracy: number; // 0..1
};

export type PreviewResults = {
  totalQuestions: number;
  totalCorrect: number;
  totalAccuracy: number; // 0..1
  bySection: SectionSummary[];
};