<template>
  <Draggable
    v-model="localItems"
    item-key="id"
    tag="ul"
    class="flex flex-col gap-1"
    :animation="200"
    :swap-threshold="0.5"
    chosen-class="opacity-60"
    ghost-class="drag-ghost"
    @change="onChange"
  >
    <li
      v-for="(item, index) in localItems"
      :key="item.id"
      class="rounded hover:bg-gray-50 cursor-pointer"
      @click="onItemClick(item.id)"
    >
      <slot name="item" :item="item" :index="index">
        <div class="px-2 py-1 text-sm inline-flex items-center gap-2">
          <Folder v-if="item.type !== 'leaf'" :size="16" class="text-gray-500" aria-hidden="true" />
          <BookOpenCheck v-else :size="16" class="text-gray-500" aria-hidden="true" />
          <span>{{ item.name }}</span>
        </div>
      </slot>
    </li>
  </Draggable>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { VueDraggableNext as Draggable } from 'vue-draggable-next';
import type { TreeItem } from '../types';
import { Folder, BookOpenCheck } from 'lucide-vue-next';

type Props = {
  items: TreeItem[];
  parentId: number | null;
  forestId: number;
};

const props = defineProps<Props>();

const emit = defineEmits<{
  (
    e: 'drop-node',
    payload: { nodeId: number; newParentId: number | null; newPosition: number },
  ): void;
  (e: 'click', payload: { itemId: number }): void;
}>();

const localItems = ref<TreeItem[]>([]);
watch(
  () => props.items,
  (next) => {
    localItems.value = Array.isArray(next) ? [...next] : [];
  },
  { immediate: true },
);

const onChange = (evt: { moved?: { oldIndex: number; newIndex: number } }) => {
  // Ensure we have a valid move
  if (!evt.moved) {
    // Re-sync in case of no-op
    localItems.value = [...props.items];
    return;
  }
  const { oldIndex, newIndex } = evt.moved;
  const node = props.items[oldIndex];
  if (!node) {
    localItems.value = [...props.items];
    return;
  }
  // Emit canonical mutation to parent
  emit('drop-node', {
    nodeId: node.id,
    newParentId: props.parentId,
    newPosition: newIndex + 1,
  });
  // Immediately re-sync to parent (source of truth)
  localItems.value = [...props.items];
};

const onItemClick = (itemId: number) => {
  emit('click', { itemId });
};
</script>

<style scoped>
.drag-ghost {
  border: 2px dashed #d1d5db; /* gray-300 */
  background: #f9fafb; /* gray-50 */
  border-radius: 0.5rem;
}
</style>
