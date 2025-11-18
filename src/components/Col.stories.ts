import type { Meta, StoryObj } from '@storybook/vue3'
import Row from './Row.vue'
import Col from './Col.vue'

const meta = {
  title: 'UI/Col',
  component: Col,
  tags: ['autodocs'],
  argTypes: {
    cols: { control: 'number' },
    gutter: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Col>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    cols: 6,
  },
  render: (args) => ({
    components: { Row, Col },
    setup() {
      return { args }
    },
    template: `
      <Row>
        <Col v-bind="args">
          <div class="bg-blue-100 p-4 rounded">Column (6/12)</div>
        </Col>
        <Col :cols="6">
          <div class="bg-green-100 p-4 rounded">Column (6/12)</div>
        </Col>
      </Row>
    `,
  }),
}

export const Responsive: Story = {
  render: () => ({
    components: { Row, Col },
    template: `
      <Row>
        <Col :cols="12" :md="6" :lg="4">
          <div class="bg-blue-100 p-4 rounded">Full on mobile, half on md, third on lg</div>
        </Col>
        <Col :cols="12" :md="6" :lg="4">
          <div class="bg-green-100 p-4 rounded">Full on mobile, half on md, third on lg</div>
        </Col>
        <Col :cols="12" :md="12" :lg="4">
          <div class="bg-purple-100 p-4 rounded">Full on mobile and md, third on lg</div>
        </Col>
      </Row>
    `,
  }),
}

export const WithOffset: Story = {
  render: () => ({
    components: { Row, Col },
    template: `
      <Row>
        <Col :cols="4" :offset="2">
          <div class="bg-blue-100 p-4 rounded">Column with offset 2</div>
        </Col>
        <Col :cols="4">
          <div class="bg-green-100 p-4 rounded">Column without offset</div>
        </Col>
      </Row>
    `,
  }),
}

export const DifferentSizes: Story = {
  render: () => ({
    components: { Row, Col },
    template: `
      <Row>
        <Col :cols="2">
          <div class="bg-blue-100 p-4 rounded">2 cols</div>
        </Col>
        <Col :cols="4">
          <div class="bg-green-100 p-4 rounded">4 cols</div>
        </Col>
        <Col :cols="6">
          <div class="bg-purple-100 p-4 rounded">6 cols</div>
        </Col>
      </Row>
    `,
  }),
}

