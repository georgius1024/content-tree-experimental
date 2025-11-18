import type { Meta, StoryObj } from '@storybook/vue3'
import Container from './Container.vue'

const meta = {
  title: 'UI/Container',
  component: Container,
  tags: ['autodocs'],
  argTypes: {
    fluid: { control: 'boolean' },
    maxWidth: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', '2xl', 'full'],
    },
  },
} satisfies Meta<typeof Container>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    maxWidth: '2xl',
  },
  render: (args) => ({
    components: { Container },
    setup() {
      return { args }
    },
    template: `
      <Container v-bind="args">
        <div class="bg-gray-100 p-4 rounded">
          <p>Default container with max-width 2xl</p>
        </div>
      </Container>
    `,
  }),
}

export const Small: Story = {
  args: {
    maxWidth: 'sm',
  },
  render: (args) => ({
    components: { Container },
    setup() {
      return { args }
    },
    template: `
      <Container v-bind="args">
        <div class="bg-gray-100 p-4 rounded">
          <p>Small container (max-width: sm)</p>
        </div>
      </Container>
    `,
  }),
}

export const Large: Story = {
  args: {
    maxWidth: 'xl',
  },
  render: (args) => ({
    components: { Container },
    setup() {
      return { args }
    },
    template: `
      <Container v-bind="args">
        <div class="bg-gray-100 p-4 rounded">
          <p>Large container (max-width: xl)</p>
        </div>
      </Container>
    `,
  }),
}

export const Fluid: Story = {
  args: {
    fluid: true,
  },
  render: (args) => ({
    components: { Container },
    setup() {
      return { args }
    },
    template: `
      <Container v-bind="args">
        <div class="bg-gray-100 p-4 rounded">
          <p>Fluid container (full width)</p>
        </div>
      </Container>
    `,
  }),
}

