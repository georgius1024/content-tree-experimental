import type { Meta, StoryObj } from '@storybook/vue3'
import QuestionEditor from './QuestionEditor.vue'
import { ref } from 'vue'
import type { Question } from '../types'

const meta = {
  title: 'Content/QuestionEditor',
  component: QuestionEditor,
  tags: ['autodocs'],
} satisfies Meta<typeof QuestionEditor>

export default meta
type Story = StoryObj<typeof meta>

const createQuestion = (
  name: string,
  slide: string,
  options: string[],
  inputRuleType: 'single' | 'multiple' = 'single',
  correctOptions: number[] = []
): Question => ({
  id: '1',
  type: 'question',
  name,
  slide,
  options,
  inputRule: {
    type: inputRuleType,
    correctOptions
  }
})

export const Default: Story = {
  args: {} as any,
  render: () => ({
    components: { QuestionEditor },
    setup() {
      const question = ref(createQuestion('', '', ['', ''], 'single', []))
      const isValid = ref(false)
      return { question, isValid }
    },
    template: `
      <div class="max-w-3xl p-4">
        <QuestionEditor 
          v-model="question" 
          @update:valid="isValid = $event"
        />
        <div class="mt-4 p-3 rounded-md" :class="isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
          <p class="text-sm font-semibold" :class="isValid ? 'text-green-700' : 'text-red-700'">
            Validation: {{ isValid ? 'Valid ✓' : 'Invalid ✗' }}
          </p>
        </div>
        <div class="mt-8 p-4 bg-gray-100 rounded-md">
          <h3 class="text-sm font-semibold mb-2">JSON Output:</h3>
          <pre class="text-xs overflow-auto">{{ JSON.stringify(question, null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
}

export const WithContent: Story = {
  args: {} as any,
  render: () => ({
    components: { QuestionEditor },
    setup() {
      const question = ref(createQuestion(
        'What is the capital of France?',
        '<p>Select the correct answer:</p>',
        ['London', 'Berlin', 'Paris', 'Madrid'],
        'single',
        [2]
      ))
      return { question }
    },
    template: `
      <div class="max-w-3xl p-4">
        <QuestionEditor v-model="question" />
        <div class="mt-8 p-4 bg-gray-100 rounded-md">
          <h3 class="text-sm font-semibold mb-2">JSON Output:</h3>
          <pre class="text-xs overflow-auto">{{ JSON.stringify(question, null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
}

export const MultipleChoice: Story = {
  args: {} as any,
  render: () => ({
    components: { QuestionEditor },
    setup() {
      const question = ref(createQuestion(
        'Which are programming languages?',
        '<p>Select all that apply:</p>',
        ['HTML', 'JavaScript', 'CSS', 'Python', 'JSON'],
        'multiple',
        [1, 3]
      ))
      return { question }
    },
    template: `
      <div class="max-w-3xl p-4">
        <QuestionEditor v-model="question" />
        <div class="mt-8 p-4 bg-gray-100 rounded-md">
          <h3 class="text-sm font-semibold mb-2">JSON Output:</h3>
          <pre class="text-xs overflow-auto">{{ JSON.stringify(question, null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
}

export const WithRichContent: Story = {
  args: {} as any,
  render: () => ({
    components: { QuestionEditor },
    setup() {
      const question = ref(createQuestion(
        'Advanced Question',
        `
          <h2>Question Title</h2>
          <p>This question contains <strong>bold</strong>, <em>italic</em>, and <u>underlined</u> text.</p>
          <ul>
            <li>First point</li>
            <li>Second point</li>
          </ul>
        `,
        ['Option A', 'Option B', 'Option C', 'Option D'],
        'single',
        [1]
      ))
      return { question }
    },
    template: `
      <div class="max-w-3xl p-4">
        <QuestionEditor v-model="question" />
        <div class="mt-8 p-4 bg-gray-100 rounded-md">
          <h3 class="text-sm font-semibold mb-2">JSON Output:</h3>
          <pre class="text-xs overflow-auto">{{ JSON.stringify(question, null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
}

export const ReadOnly: Story = {
  args: {} as any,
  render: () => ({
    components: { QuestionEditor },
    setup() {
      const question = ref(createQuestion(
        'What is the capital of France?',
        '<p>Select the correct answer:</p>',
        ['London', 'Berlin', 'Paris', 'Madrid'],
        'single',
        [2]
      ))
      return { question }
    },
    template: `
      <div class="max-w-3xl p-4">
        <QuestionEditor v-model="question" :readonly="true" />
        <div class="mt-8 p-4 bg-gray-100 rounded-md">
          <h3 class="text-sm font-semibold mb-2">JSON Output:</h3>
          <pre class="text-xs overflow-auto">{{ JSON.stringify(question, null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
}

