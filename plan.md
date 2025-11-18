# Plan: Course Content Editing System

## Overview

This document outlines the architecture and implementation plan for the course content editing system, which allows users to create and manage course structures with sections, slides, and questions.

## Data Structure

### Types

```typescript
// Input rule types for questions
InputRuleType: 'single' | 'multiple'

InputRule: {
  type: InputRuleType
  correctOptions: number[] // Indices of correct options (0-based)
}

// Slide step
Slide: {
  id: string // UUID
  type: 'slide'
  name: string
  content: string // HTML content
}

// Question step
Question: {
  id: string // UUID
  type: 'question'
  name: string
  slide: string // HTML content (question text/content)
  options: string[] // Array of answer options
  inputRule: InputRule
}

// Step is either a Slide or Question
Step = Slide | Question

// Section contains a set of steps
Section: {
  id: string // UUID
  name: string
  steps: Step[] // Ordered array of slides and questions
}

// Course with structure
Course: {
  id: string // UUID
  author: string
  fullName: string
  description: string
  structure: Section[] // Course structure with sections
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}
```

## Component Architecture

### UI Organization

```
CourseEditorPage (with tabs)
├── Tab: General
│   ├── Short name
│   ├── Full name
│   ├── Author
│   └── Folder picker
├── Tab: Description
│   └── Rich text editor
└── Tab: Structure (NEW)
    └── CourseStructureView
        ├── SectionAccordion (for each section)
        │   ├── Header (section name + edit/delete buttons)
        │   └── StepList
        │       ├── StepListItem (for each step)
        │       │   ├── Icon (slide/question)
        │       │   ├── Step name
        │       │   └── Edit/Delete buttons
        │       ├── Button: Add Slide
        │       └── Button: Add Question
        └── Button: Add Section
```

### Modal Windows

**SectionEditorModal** (z-index: 50)
- Opens from CourseEditorPage when clicking "Edit Section"
- Contains:
  - Section name input
  - StepList (editable, with drag & drop)
  - Add Slide/Question buttons
  - Save/Cancel buttons

**StepEditorModal** (z-index: 60 - higher than SectionEditorModal)
- Opens from CourseEditorPage or SectionEditorModal when clicking "Edit Step"
- Contains:
  - SlideEditor (if step.type === 'slide')
  - QuestionEditor (if step.type === 'question')
  - Save/Cancel buttons

## Component List

### 1. Display Components

#### `CourseStructureView.vue`
**Purpose**: Main component displaying course structure with sections
**Props**:
- `structure: Section[]`
**Emits**:
- `update:structure` - when structure changes
**Features**:
- Renders list of sections as accordions
- "Add Section" button
- Handles section add/delete/reorder

#### `SectionAccordion.vue`
**Purpose**: Accordion component for a single section
**Props**:
- `section: Section`
- `sectionIndex: number`
**Emits**:
- `edit` - when edit button clicked
- `delete` - when delete button clicked
- `update:section` - when section changes
**Features**:
- Collapsible section header with name
- Edit/Delete buttons in header
- StepList in collapsed content
- Uses existing Accordion component

#### `StepList.vue`
**Purpose**: List of steps within a section
**Props**:
- `steps: Step[]`
- `sectionId: string`
- `editable?: boolean` - if true, shows add buttons and allows drag & drop
**Emits**:
- `add-slide` - when "Add Slide" clicked
- `add-question` - when "Add Question" clicked
- `edit-step` - when step edit clicked (stepId: string)
- `delete-step` - when step delete clicked (stepId: string)
- `reorder-steps` - when steps reordered (fromIndex: number, toIndex: number)
**Features**:
- Drag & drop for reordering (using vue-draggable-next)
- Renders StepListItem for each step
- Add Slide/Question buttons (if editable)

#### `StepListItem.vue`
**Purpose**: Single step item in the list
**Props**:
- `step: Step`
- `index: number`
**Emits**:
- `edit` - when edit button clicked
- `delete` - when delete button clicked
**Features**:
- Icon (FileText for slide, HelpCircle for question)
- Step name display
- Edit/Delete buttons (on hover)

### 2. Modal Components

#### `SectionEditorModal.vue`
**Purpose**: Modal dialog for editing a section
**Props**:
- `section: Section | null` - null for creating new section
- `open: boolean`
**Emits**:
- `update:open` - when modal should close/open
- `save` - when save clicked (section: Section)
**Features**:
- Uses Headless UI Dialog
- Section name input
- StepList (editable mode)
- Can open StepEditorModal for editing steps
- Save/Cancel buttons

#### `StepEditorModal.vue`
**Purpose**: Modal dialog for editing a step (slide or question)
**Props**:
- `step: Step | null` - null for creating new step
- `open: boolean`
- `stepType?: 'slide' | 'question'` - required when step is null
**Emits**:
- `update:open` - when modal should close/open
- `save` - when save clicked (step: Step)
**Features**:
- Uses Headless UI Dialog
- Higher z-index than SectionEditorModal
- Conditionally renders SlideEditor or QuestionEditor
- Save/Cancel buttons

### 3. Editor Components

#### `SlideEditor.vue` ✅ (Already created)
**Purpose**: Edit slide content
**Props**:
- `modelValue: Slide`
**Emits**:
- `update:modelValue`
**Features**:
- Name input
- RichTextEditor for content

#### `QuestionEditor.vue` (To be created)
**Purpose**: Edit question content
**Props**:
- `modelValue: Question`
**Emits**:
- `update:modelValue`
**Features**:
- Name input
- RichTextEditor for question text (slide field)
- Options list (add/remove/reorder)
- Input rule type selector (single/multiple)
- Correct options selector (checkboxes/radio buttons)

### 4. Utility Functions

#### `utils/uuid.ts`
**Purpose**: UUID generation utility
**Exports**:
- `genUuid(): string`

#### `services/courseStructure.ts`
**Purpose**: Helper functions for course structure manipulation
**Exports**:
- `createSection(name: string): Section`
- `createSlide(name: string, content: string): Slide`
- `createQuestion(name: string, slide: string, options: string[], inputRule: InputRule): Question`
- `addSectionToCourse(course: Course, section: Section): Course`
- `addStepToSection(section: Section, step: Step): Section`
- `removeSection(course: Course, sectionId: string): Course`
- `removeStep(section: Section, stepId: string): Section`
- `updateSection(course: Course, sectionId: string, updates: Partial<Section>): Course`
- `updateStep(section: Section, stepId: string, updates: Partial<Step>): Section`
- `reorderSteps(section: Section, fromIndex: number, toIndex: number): Section`
- `reorderSections(course: Course, fromIndex: number, toIndex: number): Course`

## User Flow

### Adding a Section
1. User clicks "Add Section" in CourseStructureView
2. SectionEditorModal opens with empty section
3. User enters section name
4. User can add steps (slides/questions) to the section
5. User clicks "Save"
6. Section is added to course structure
7. Modal closes

### Editing a Section
1. User clicks "Edit" button on SectionAccordion header
2. SectionEditorModal opens with section data
3. User can:
   - Edit section name
   - Add/remove/reorder steps
   - Edit steps (opens StepEditorModal)
4. User clicks "Save"
5. Section is updated in course structure
6. Modal closes

### Adding a Step (Slide/Question)
1. User clicks "Add Slide" or "Add Question" in StepList
2. StepEditorModal opens with empty step
3. User fills in step data:
   - For Slide: name + content
   - For Question: name + question text + options + correct answers
4. User clicks "Save"
5. Step is added to section
6. Modal closes

### Editing a Step
1. User clicks "Edit" button on StepListItem
2. StepEditorModal opens with step data
3. User edits step content
4. User clicks "Save"
5. Step is updated in section
6. Modal closes

### Deleting a Section/Step
1. User clicks "Delete" button
2. Confirmation dialog appears
3. User confirms
4. Section/Step is removed from structure

## Implementation Order

### Phase 1: Foundation
1. ✅ Create types (Slide, Question, Section, Step, InputRule)
2. ✅ Update Course type with structure field
3. Create `utils/uuid.ts` - UUID generation utility
4. Create `services/courseStructure.ts` - Structure manipulation functions

### Phase 2: Editor Components
5. ✅ Create `SlideEditor.vue`
6. Create `QuestionEditor.vue`

### Phase 3: Display Components
7. Create `StepListItem.vue`
8. Create `StepList.vue`
9. Create `SectionAccordion.vue`
10. Create `CourseStructureView.vue`

### Phase 4: Modal Components
11. Create `StepEditorModal.vue`
12. Create `SectionEditorModal.vue`

### Phase 5: Integration
13. Add "Structure" tab to CourseEditorPage
14. Integrate CourseStructureView
15. Connect modals to CourseEditorPage
16. Add translations (i18n)

### Phase 6: Polish
17. Add drag & drop for steps
18. Add drag & drop for sections
19. Add validation
20. Add error handling

## Translation Keys (i18n)

### English (`en.ts`)
```typescript
courseStructure: {
  title: 'Course Structure',
  addSection: 'Add Section',
  sectionName: 'Section name',
  sectionNamePlaceholder: 'Enter section name',
  noSections: 'No sections yet. Add your first section.',
  addSlide: 'Add Slide',
  addQuestion: 'Add Question',
  editSection: 'Edit Section',
  deleteSection: 'Delete Section',
  deleteSectionConfirm: 'Delete this section and all its steps?',
  editStep: 'Edit Step',
  deleteStep: 'Delete Step',
  deleteStepConfirm: 'Delete this step?',
}

sectionEditor: {
  title: 'Edit Section',
  newTitle: 'New Section',
  name: 'Section name',
  namePlaceholder: 'Enter section name',
  steps: 'Steps',
}

stepEditor: {
  title: 'Edit Step',
  newSlideTitle: 'New Slide',
  newQuestionTitle: 'New Question',
  save: 'Save',
  cancel: 'Cancel',
}

questionEditor: {
  name: 'Question name',
  namePlaceholder: 'Enter question name',
  questionText: 'Question text',
  questionTextPlaceholder: 'Enter question text',
  options: 'Answer options',
  addOption: 'Add option',
  optionPlaceholder: 'Enter option text',
  inputRule: 'Answer type',
  singleChoice: 'Single choice (1 correct answer)',
  multipleChoice: 'Multiple choice (multiple correct answers)',
  correctAnswers: 'Correct answers',
  selectCorrect: 'Select correct answer(s)',
}
```

### Russian (`ru.ts`)
```typescript
courseStructure: {
  title: 'Структура курса',
  addSection: 'Добавить секцию',
  sectionName: 'Название секции',
  sectionNamePlaceholder: 'Введите название секции',
  noSections: 'Пока нет секций. Добавьте первую секцию.',
  addSlide: 'Добавить слайд',
  addQuestion: 'Добавить вопрос',
  editSection: 'Редактировать секцию',
  deleteSection: 'Удалить секцию',
  deleteSectionConfirm: 'Удалить эту секцию и все её шаги?',
  editStep: 'Редактировать шаг',
  deleteStep: 'Удалить шаг',
  deleteStepConfirm: 'Удалить этот шаг?',
}

sectionEditor: {
  title: 'Редактор секции',
  newTitle: 'Новая секция',
  name: 'Название секции',
  namePlaceholder: 'Введите название секции',
  steps: 'Шаги',
}

stepEditor: {
  title: 'Редактор шага',
  newSlideTitle: 'Новый слайд',
  newQuestionTitle: 'Новый вопрос',
  save: 'Сохранить',
  cancel: 'Отмена',
}

questionEditor: {
  name: 'Название вопроса',
  namePlaceholder: 'Введите название вопроса',
  questionText: 'Текст вопроса',
  questionTextPlaceholder: 'Введите текст вопроса',
  options: 'Варианты ответов',
  addOption: 'Добавить вариант',
  optionPlaceholder: 'Введите текст варианта',
  inputRule: 'Тип ответа',
  singleChoice: 'Один правильный ответ',
  multipleChoice: 'Несколько правильных ответов',
  correctAnswers: 'Правильные ответы',
  selectCorrect: 'Выберите правильный(е) ответ(ы)',
}
```

## Technical Details

### Modal Z-Index Hierarchy
- SectionEditorModal: `z-50`
- StepEditorModal: `z-60` (higher, can be opened from SectionEditorModal)

### Drag & Drop
- Use `vue-draggable-next` (already in project)
- Steps within section: draggable
- Sections: draggable (future enhancement)

### State Management
- Course structure stored in Course.structure
- Local state in CourseEditorPage for editing
- Save to Course on "Save" button click
- Use computed properties for derived state

### Validation
- Section name: required, non-empty
- Step name: required, non-empty
- Question: at least 2 options, at least 1 correct answer
- Slide content: optional but recommended

## Future Enhancements

1. **Drag & drop sections** - reorder sections
2. **Bulk operations** - delete multiple steps
3. **Step templates** - pre-filled step templates
4. **Import/Export** - import structure from JSON
5. **Preview mode** - preview course as student would see it
6. **Step duplication** - duplicate existing steps
7. **Section templates** - pre-filled section templates

