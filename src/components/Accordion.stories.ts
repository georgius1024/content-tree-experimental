import type { Meta, StoryObj } from '@storybook/vue3'
import Accordion from './Accordion.vue'

const meta = {
  title: 'UI/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    open: { control: 'boolean' },
    duration: { control: 'number' },
    transition: {
      control: 'select',
      options: ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'],
    },
    caretPosition: {
      control: 'select',
      options: ['left', 'right'],
    },
    indicatorType: {
      control: 'select',
      options: ['chevron', 'folder'],
    },
  },
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Accordion Header',
    open: false,
  },
  render: (args) => ({
    components: { Accordion },
    setup() {
      return { args }
    },
    template: `
      <Accordion v-bind="args">
        <div class="p-4">
          <p>This is the accordion content. You can put any content here.</p>
        </div>
      </Accordion>
    `,
  }),
}

export const Open: Story = {
  args: {
    label: 'Open Accordion',
    open: true,
  },
  render: (args) => ({
    components: { Accordion },
    setup() {
      return { args }
    },
    template: `
      <Accordion v-bind="args">
        <div class="p-4">
          <p>This accordion is open by default.</p>
        </div>
      </Accordion>
    `,
  }),
}

export const LeftCaret: Story = {
  args: {
    label: 'Left Caret Position',
    caretPosition: 'left',
  },
  render: (args) => ({
    components: { Accordion },
    setup() {
      return { args }
    },
    template: `
      <Accordion v-bind="args">
        <div class="p-4">
          <p>This accordion has the caret on the left side.</p>
        </div>
      </Accordion>
    `,
  }),
}

export const CustomContent: Story = {
  args: {
    open: false,
  },
  render: (args) => ({
    components: { Accordion },
    setup() {
      return { args }
    },
    template: `
      <Accordion v-bind="args">
        <template #header>
          <span class="font-bold">Custom Header</span>
        </template>
        <div class="p-4 bg-gray-50">
          <h3 class="font-semibold mb-2">Custom Content</h3>
          <p>You can customize both the header and content using slots.</p>
        </div>
      </Accordion>
    `,
  }),
}

export const FolderIndicator: Story = {
  args: {
    label: 'Folder Indicator',
    open: false,
    indicatorType: 'folder',
    caretPosition: 'left',
  },
  render: (args) => ({
    components: { Accordion },
    setup() {
      return { args }
    },
    template: `
      <Accordion v-bind="args">
        <div class="p-4">
          <p>This accordion uses a folder icon that opens/closes instead of rotating chevron.</p>
        </div>
      </Accordion>
    `,
  }),
}

export const FolderIndicatorRight: Story = {
  args: {
    label: 'Folder Indicator Right',
    open: false,
    indicatorType: 'folder',
    caretPosition: 'right',
  },
  render: (args) => ({
    components: { Accordion },
    setup() {
      return { args }
    },
    template: `
      <Accordion v-bind="args">
        <div class="p-4">
          <p>Folder indicator on the right side.</p>
        </div>
      </Accordion>
    `,
  }),
}

export const FolderIndicatorOpen: Story = {
  args: {
    label: 'Open Folder',
    open: true,
    indicatorType: 'folder',
    caretPosition: 'left',
  },
  render: (args) => ({
    components: { Accordion },
    setup() {
      return { args }
    },
    template: `
      <Accordion v-bind="args">
        <div class="p-4">
          <p>This folder is open, showing the open folder icon.</p>
        </div>
      </Accordion>
    `,
  }),
}

