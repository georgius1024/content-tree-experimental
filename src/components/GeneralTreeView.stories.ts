import type { Meta, StoryObj } from '@storybook/vue3'
import GeneralTreeView from './GeneralTreeView.vue'
import Accordion from './Accordion.vue'
import TreeList from './TreeList.vue'
import { ref, computed } from 'vue'
import type { TreeItem } from '../types'
import { Folder, BookOpenCheck } from 'lucide-vue-next'
import { getForest, putForest, moveNode, sortTreeItems } from '../services/tree'
import { CONTENT_FOREST, getSampleTrees } from '../services/samples'

const meta = {
  title: 'UI/GeneralTreeView',
  component: GeneralTreeView,
  tags: ['autodocs'],
} satisfies Meta<typeof GeneralTreeView>

export default meta
type Story = StoryObj<typeof meta>

// Use CONTENT_FOREST for stories to use real sample data

// Helper function to create a draggable tree view wrapper using service functions
const createDraggableTreeView = (
  initialItems: TreeItem[],
  rootItem: TreeItem
) => {
  // Create DraggableTreeNode component outside setup
  const DraggableTreeNode = {
    name: 'DraggableTreeNode',
    components: { Accordion, TreeList, Folder, BookOpenCheck },
    props: {
      item: { type: Object, required: true },
      getChildren: { type: Function, required: true },
      hasChildren: { type: Function, required: true },
      onDropNode: { type: Function, required: true },
      onDropInto: { type: Function, required: true },
      forestId: { type: Number, required: true },
    },
    template: `
      <Accordion
        v-if="hasChildren(item.id)"
        :label="item.name"
        :open="false"
        caret-position="left"
        indicator-type="folder"
      >
        <TreeList
          :items="getChildren(item.id)"
          :parent-id="item.id"
          :forest-id="forestId"
          class="pl-4 md:pl-6"
          @drop-node="onDropNode"
          @drop-into="onDropInto"
        >
          <template #item="{ item: childItem }">
            <DraggableTreeNode
              :item="childItem"
              :get-children="getChildren"
              :has-children="hasChildren"
              :on-drop-node="onDropNode"
              :on-drop-into="onDropInto"
              :forest-id="forestId"
            />
          </template>
        </TreeList>
      </Accordion>
      <div v-else class="px-2 py-1 text-sm inline-flex items-center gap-2">
        <component
          :is="item.type !== 'leaf' ? 'Folder' : 'BookOpenCheck'"
          :size="16"
          class="text-gray-500"
          aria-hidden="true"
        />
        <span>{{ item.name }}</span>
      </div>
    `,
  }

  return {
    components: { Accordion, TreeList, DraggableTreeNode },
    setup() {
      // Initialize forest with initial items
      putForest(CONTENT_FOREST, initialItems)
      
      // Reactive reference to trigger updates
      const refreshKey = ref(0)
      
      // Get forest items reactively
      const forest = computed<TreeItem[]>(() => {
        void refreshKey.value // Trigger reactivity
        return getForest(CONTENT_FOREST)
      })
      
      const getChildren = (parentId: number | null) => {
        return forest.value
          .filter((item) => item.deletedAt === null)
          .filter((item) => (item.parentId ?? null) === (parentId ?? null))
          .sort(sortTreeItems)
      }
      
      const hasChildren = (parentId: number) => {
        return forest.value.some(
          (item) => item.parentId === parentId && item.deletedAt === null
        )
      }
      
      const handleDropNode = (payload: {
        nodeId: number
        newParentId: number | null
        newPosition: number
      }) => {
        try {
          moveNode(CONTENT_FOREST, payload.nodeId, payload.newParentId, payload.newPosition)
          refreshKey.value++
        } catch (error) {
          console.error('Move failed:', error)
        }
      }
      
      const handleDropInto = (payload: {
        nodeId: number
        targetParentId: number
      }) => {
        try {
          const forestItems = getForest(CONTENT_FOREST)
          const childrenCount = forestItems
            .filter((item) => item.deletedAt === null)
            .filter((item) => (item.parentId ?? null) === payload.targetParentId).length
          moveNode(CONTENT_FOREST, payload.nodeId, payload.targetParentId, childrenCount)
          refreshKey.value++
        } catch (error) {
          console.error('Move into failed:', error)
        }
      }

      return {
        root: computed(() => rootItem),
        forestId: CONTENT_FOREST,
        getChildren,
        hasChildren,
        handleDropNode,
        handleDropInto,
      }
    },
    template: `
      <div class="p-4">
        <div v-if="root">
          <Accordion :label="root.name" :open="true" caret-position="left" indicator-type="folder">
            <TreeList
              :items="getChildren(root.id)"
              :parent-id="root.id"
              :forest-id="forestId"
              class="pl-2 md:pl-4"
              @drop-node="handleDropNode"
              @drop-into="handleDropInto"
            >
              <template #item="{ item }">
                <DraggableTreeNode
                  :item="item"
                  :get-children="getChildren"
                  :has-children="hasChildren"
                  :on-drop-node="handleDropNode"
                  :on-drop-into="handleDropInto"
                  :forest-id="forestId"
                />
              </template>
            </TreeList>
          </Accordion>
        </div>
      </div>
    `,
  }
}

export const Default: Story = {
  args: {} as any,
  render: () => {
    // Get sample trees data
    const sampleTrees = getSampleTrees('en')
    
    // Find root item (parentId === null)
    const rootItem = sampleTrees.find((item) => item.parentId === null && item.deletedAt === null)
    
    if (!rootItem) {
      throw new Error('Root item not found in sample trees')
    }
    
    return createDraggableTreeView(sampleTrees, rootItem)
  },
}

export const EmptyTree: Story = {
  args: {} as any,
  render: () => {
    const getChildren = () => []
    const hasChildren = () => false
    
    return {
      components: { GeneralTreeView },
      setup() {
        return { root: null, getChildren, hasChildren }
      },
      template: `
        <GeneralTreeView 
          :root="null"
          :get-children="getChildren"
          :has-children="hasChildren"
        />
      `,
    }
  },
}


