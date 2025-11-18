import type { Meta, StoryObj } from '@storybook/vue3'
import SlideEditor from './SlideEditor.vue'
import { ref } from 'vue'
import type { Slide } from '../types'

const meta = {
  title: 'Content/SlideEditor',
  component: SlideEditor,
  tags: ['autodocs'],
} satisfies Meta<typeof SlideEditor>

export default meta
type Story = StoryObj<typeof meta>

const createSlide = (name: string, content: string): Slide => ({
  id: '1',
  type: 'slide',
  name,
  content,
})

export const Default: Story = {
  render: () => ({
    components: { SlideEditor },
    setup() {
      const slide = ref(createSlide('', ''))
      return { slide }
    },
    template: `
      <div class="max-w-3xl">
        <SlideEditor v-model="slide" />
      </div>
    `,
  }),
}

export const WithContent: Story = {
  render: () => ({
    components: { SlideEditor },
    setup() {
      const slide = ref(createSlide(
        'Introduction',
        '<p>This is an <strong>introduction</strong> slide with some content.</p>'
      ))
      return { slide }
    },
    template: `
      <div class="max-w-3xl">
        <SlideEditor v-model="slide" />
      </div>
    `,
  }),
}

export const WithRichContent: Story = {
  render: () => ({
    components: { SlideEditor },
    setup() {
      const slide = ref(createSlide(
        'Advanced Slide',
        `
          <h1>Main Title</h1>
          <h2>Subtitle</h2>
          <p>This slide contains <strong>bold</strong>, <em>italic</em>, and <u>underlined</u> text.</p>
          <ul>
            <li>First point</li>
            <li>Second point</li>
          </ul>
        `
      ))
      return { slide }
    },
    template: `
      <div class="max-w-3xl">
        <SlideEditor v-model="slide" />
      </div>
    `,
  }),
}

export const ReadOnly: Story = {
  args: {} as any,
  render: () => ({
    components: { SlideEditor },
    setup() {
      const slide = ref(createSlide(
        'Read-Only Slide',
        '<p>This slide is in <strong>read-only</strong> mode. All controls are visible but disabled.</p>'
      ))
      return { slide }
    },
    template: `
      <div class="max-w-3xl">
        <SlideEditor v-model="slide" :readonly="true" />
      </div>
    `,
  }),
}

