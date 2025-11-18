import type { Meta, StoryObj } from '@storybook/vue3'
import RichTextEditor from './RichTextEditor.vue'
import RichTextView from './RichTextView.vue'
import { ref } from 'vue'
import '../styles/rich-text.css'

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
    modelValue: '',
    placeholder: 'Start typing...',
  } as any,
  render: (args) => ({
    components: { RichTextEditor, RichTextView },
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
        <div class="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
          <p class="text-sm font-semibold text-gray-700 mb-3">Preview (RichTextView):</p>
          <div class="bg-white p-4 rounded border border-gray-200">
            <RichTextView v-if="content" :content="content" />
            <p v-else class="text-gray-400 italic">Start typing to see preview...</p>
          </div>
        </div>
        <div class="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
          <p class="text-sm font-semibold text-gray-700 mb-2">HTML Output:</p>
          <pre class="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">{{ content || '(empty)' }}</pre>
        </div>
      </div>
    `,
  }),
}

export const WithInitialContent: Story = {
  args: {
    modelValue: `
      <h1>Main Heading</h1>
      <h2>Subheading</h2>
      <h3>Section Title</h3>
      <p>This is a paragraph with <strong>bold</strong>, <em>italic</em>, <u>underlined</u>, and <s>strikethrough</s> text.</p>
      <p>Here's a <a href="https://example.com">link</a> to demonstrate link styling.</p>
      <ul>
        <li>First bullet point</li>
        <li>Second bullet point with <strong>bold text</strong></li>
        <li>Third bullet point</li>
      </ul>
      <ol>
        <li>First numbered item</li>
        <li>Second numbered item with <em>italic text</em></li>
        <li>Third numbered item</li>
      </ol>
      <blockquote>This is a blockquote demonstrating the quote styling. It should appear with a left border and italic text.</blockquote>
      <p>Inline <code>code</code> example in a sentence.</p>
      <pre><code>function example() {
  return "This is a code block";
}</code></pre>
    `,
  },
  render: (args) => ({
    components: { RichTextEditor, RichTextView },
    setup() {
      const content = ref(args.modelValue)
      return { content }
    },
    template: `
      <div class="max-w-2xl">
        <RichTextEditor v-model="content" />
        <div class="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
          <p class="text-sm font-semibold text-gray-700 mb-3">Preview (RichTextView):</p>
          <div class="bg-white p-4 rounded border border-gray-200">
            <RichTextView :content="content" />
          </div>
        </div>
        <div class="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
          <p class="text-sm font-semibold text-gray-700 mb-2">HTML Output:</p>
          <pre class="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">{{ content }}</pre>
        </div>
      </div>
    `,
  }),
}

export const WithComplexContent: Story = {
  args: {} as any,
  render: () => ({
    components: { RichTextEditor, RichTextView },
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
        <div class="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
          <p class="text-sm font-semibold text-gray-700 mb-3">Preview (RichTextView):</p>
          <div class="bg-white p-4 rounded border border-gray-200">
            <RichTextView :content="content" />
          </div>
        </div>
        <div class="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
          <p class="text-sm font-semibold text-gray-700 mb-2">HTML Output:</p>
          <pre class="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">{{ content }}</pre>
        </div>
      </div>
    `,
  }),
}

export const ReadOnly: Story = {
  args: {} as any,
  render: () => ({
    components: { RichTextEditor, RichTextView },
    setup() {
      const content = ref(`
        <h1>Read-Only Mode</h1>
        <p>This editor is in <strong>read-only</strong> mode. The toolbar is hidden and the content cannot be edited.</p>
        <p>You can see the formatted content with <em>italic</em>, <u>underlined</u>, and <strong>bold</strong> text.</p>
        <ul>
          <li>First bullet point</li>
          <li>Second bullet point</li>
        </ul>
        <blockquote>This is a blockquote in read-only mode.</blockquote>
      `)
      return { content }
    },
    template: `
      <div class="max-w-2xl">
        <RichTextEditor v-model="content" :readonly="true" />
        <div class="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
          <p class="text-sm font-semibold text-gray-700 mb-3">Preview (RichTextView):</p>
          <div class="bg-white p-4 rounded border border-gray-200">
            <RichTextView :content="content" />
          </div>
        </div>
        <div class="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
          <p class="text-sm font-semibold text-gray-700 mb-2">HTML Output:</p>
          <pre class="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">{{ content }}</pre>
        </div>
      </div>
    `,
  }),
}

