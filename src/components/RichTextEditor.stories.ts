import type { Meta, StoryObj } from '@storybook/vue3'
import RichTextEditor from './RichTextEditor.vue'
import { ref } from 'vue'

const meta = {
  title: 'Content/RichTextEditor',
  component: RichTextEditor,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'text' },
    placeholder: { control: 'text' },
  },
} satisfies Meta<typeof RichTextEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Start typing...',
  },
  render: (args) => ({
    components: { RichTextEditor },
    setup() {
      const content = ref('')
      return { args, content }
    },
    template: `
      <div class="max-w-2xl">
        <RichTextEditor 
          v-model="content" 
          :placeholder="args.placeholder"
        />
        <div class="mt-4 p-4 bg-gray-50 rounded">
          <p class="text-sm text-gray-600 mb-2">HTML Output:</p>
          <pre class="text-xs">{{ content }}</pre>
        </div>
      </div>
    `,
  }),
}

export const WithInitialContent: Story = {
  args: {
    modelValue: '<p>This is <strong>bold</strong> and <em>italic</em> text.</p>',
  },
  render: (args) => ({
    components: { RichTextEditor },
    setup() {
      const content = ref(args.modelValue)
      return { content }
    },
    template: `
      <div class="max-w-2xl">
        <RichTextEditor v-model="content" />
      </div>
    `,
  }),
}

export const WithComplexContent: Story = {
  render: () => ({
    components: { RichTextEditor },
    setup() {
      const content = ref(`
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <p>This is a paragraph with <strong>bold</strong>, <em>italic</em>, and <u>underlined</u> text.</p>
        <ul>
          <li>Bullet point 1</li>
          <li>Bullet point 2</li>
        </ul>
        <ol>
          <li>Numbered item 1</li>
          <li>Numbered item 2</li>
        </ol>
        <blockquote>This is a quote</blockquote>
      `)
      return { content }
    },
    template: `
      <div class="max-w-2xl">
        <RichTextEditor v-model="content" />
      </div>
    `,
  }),
}

