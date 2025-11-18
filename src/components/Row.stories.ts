import type { Meta, StoryObj } from '@storybook/vue3'
import Row from './Row.vue'
import Col from './Col.vue'

const meta = {
  title: 'UI/Row',
  component: Row,
  tags: ['autodocs'],
  argTypes: {
    gutter: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Row>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    gutter: 'md',
  },
  render: (args) => ({
    components: { Row, Col },
    setup() {
      return { args }
    },
    template: `
      <Row v-bind="args">
        <Col :cols="6">
          <div class="bg-blue-100 p-4 rounded">Column 1</div>
        </Col>
        <Col :cols="6">
          <div class="bg-green-100 p-4 rounded">Column 2</div>
        </Col>
      </Row>
    `,
  }),
}

export const ThreeColumns: Story = {
  args: {
    gutter: 'md',
  },
  render: (args) => ({
    components: { Row, Col },
    setup() {
      return { args }
    },
    template: `
      <Row v-bind="args">
        <Col :cols="4">
          <div class="bg-blue-100 p-4 rounded">Column 1</div>
        </Col>
        <Col :cols="4">
          <div class="bg-green-100 p-4 rounded">Column 2</div>
        </Col>
        <Col :cols="4">
          <div class="bg-purple-100 p-4 rounded">Column 3</div>
        </Col>
      </Row>
    `,
  }),
}

export const NoGutter: Story = {
  args: {
    gutter: 'none',
  },
  render: (args) => ({
    components: { Row, Col },
    setup() {
      return { args }
    },
    template: `
      <Row v-bind="args">
        <Col :cols="6" gutter="none">
          <div class="bg-blue-100 p-4 rounded">Column 1</div>
        </Col>
        <Col :cols="6" gutter="none">
          <div class="bg-green-100 p-4 rounded">Column 2</div>
        </Col>
      </Row>
    `,
  }),
}

export const LargeGutter: Story = {
  args: {
    gutter: 'lg',
  },
  render: (args) => ({
    components: { Row, Col },
    setup() {
      return { args }
    },
    template: `
      <Row v-bind="args">
        <Col :cols="6">
          <div class="bg-blue-100 p-4 rounded">Column 1</div>
        </Col>
        <Col :cols="6">
          <div class="bg-green-100 p-4 rounded">Column 2</div>
        </Col>
      </Row>
    `,
  }),
}

