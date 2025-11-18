import type { Meta, StoryObj } from '@storybook/vue3'
import RichTextView from './RichTextView.vue'
import '../styles/rich-text.css'

const meta = {
  title: 'Content/RichTextView',
  component: RichTextView,
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'text' },
  },
} satisfies Meta<typeof RichTextView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    content: '<p>This is a simple paragraph.</p>',
  },
}

export const WithFormatting: Story = {
  args: {
    content: '<p>This is <strong>bold</strong>, <em>italic</em>, <u>underlined</u>, and <s>strikethrough</s> text.</p>',
  },
}

export const WithHeadings: Story = {
  args: {
    content: `
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <p>Regular paragraph text.</p>
    `,
  },
}

export const WithLists: Story = {
  args: {
    content: `
      <ul>
        <li>Bullet point 1</li>
        <li>Bullet point 2</li>
        <li>Bullet point 3</li>
      </ul>
      <ol>
        <li>Numbered item 1</li>
        <li>Numbered item 2</li>
        <li>Numbered item 3</li>
      </ol>
    `,
  },
}

export const WithBlockquote: Story = {
  args: {
    content: '<blockquote>This is a blockquote with some important text that needs to stand out.</blockquote>',
  },
}

export const WithCode: Story = {
  args: {
    content: `
      <p>Inline <code>code</code> example.</p>
      <pre><code>function example() {
  return "code block";
}</code></pre>
    `,
  },
}

export const WithLinks: Story = {
  args: {
    content: '<p>Visit <a href="https://example.com">example.com</a> for more information.</p>',
  },
}

export const ComplexContent: Story = {
  args: {
    content: `
      <h1>Main Title</h1>
      <p>This is a paragraph with <strong>bold</strong>, <em>italic</em>, and <u>underlined</u> text.</p>
      <h2>Subsection</h2>
      <ul>
        <li>First item</li>
        <li>Second item with <strong>bold text</strong></li>
        <li>Third item</li>
      </ul>
      <blockquote>This is an important quote that should be highlighted.</blockquote>
      <p>More content with <a href="https://example.com">a link</a> and some <code>inline code</code>.</p>
      <pre><code>const example = "code block";
console.log(example);</code></pre>
    `,
  },
}

