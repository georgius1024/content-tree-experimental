<template>
  <div class="rich-text-editor">
    <!-- Toolbar -->
    <div
      v-if="editor"
      class="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-md"
    >
      <!-- Text formatting -->
      <button
        type="button"
        :class="[
          'p-1.5 rounded hover:bg-gray-200 transition-colors',
          editor.isActive('bold') ? 'bg-gray-300' : '',
        ]"
        :title="t('richTextEditor.bold')"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <Bold :size="16" class="text-gray-700" />
      </button>
      <button
        type="button"
        :class="[
          'p-1.5 rounded hover:bg-gray-200 transition-colors',
          editor.isActive('italic') ? 'bg-gray-300' : '',
        ]"
        :title="t('richTextEditor.italic')"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <Italic :size="16" class="text-gray-700" />
      </button>
      <button
        type="button"
        :class="[
          'p-1.5 rounded hover:bg-gray-200 transition-colors',
          editor.isActive('underline') ? 'bg-gray-300' : '',
        ]"
        :title="t('richTextEditor.underline')"
        @click="editor.chain().focus().toggleUnderline().run()"
      >
        <UnderlineIcon :size="16" class="text-gray-700" />
      </button>
      <button
        type="button"
        :class="[
          'p-1.5 rounded hover:bg-gray-200 transition-colors',
          editor.isActive('strike') ? 'bg-gray-300' : '',
        ]"
        :title="t('richTextEditor.strike')"
        @click="editor.chain().focus().toggleStrike().run()"
      >
        <Strikethrough :size="16" class="text-gray-700" />
      </button>

      <div class="w-px h-6 bg-gray-300 mx-1" />

      <!-- Headings -->
      <button
        type="button"
        :class="[
          'px-2 py-1 rounded text-sm hover:bg-gray-200 transition-colors',
          editor.isActive('heading', { level: 1 }) ? 'bg-gray-300 font-semibold' : '',
        ]"
        :title="t('richTextEditor.heading1')"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        H1
      </button>
      <button
        type="button"
        :class="[
          'px-2 py-1 rounded text-sm hover:bg-gray-200 transition-colors',
          editor.isActive('heading', { level: 2 }) ? 'bg-gray-300 font-semibold' : '',
        ]"
        :title="t('richTextEditor.heading2')"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </button>
      <button
        type="button"
        :class="[
          'px-2 py-1 rounded text-sm hover:bg-gray-200 transition-colors',
          editor.isActive('heading', { level: 3 }) ? 'bg-gray-300 font-semibold' : '',
        ]"
        :title="t('richTextEditor.heading3')"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        H3
      </button>

      <div class="w-px h-6 bg-gray-300 mx-1" />

      <!-- Lists -->
      <button
        type="button"
        :class="[
          'p-1.5 rounded hover:bg-gray-200 transition-colors',
          editor.isActive('bulletList') ? 'bg-gray-300' : '',
        ]"
        :title="t('richTextEditor.bulletList')"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <List :size="16" class="text-gray-700" />
      </button>
      <button
        type="button"
        :class="[
          'p-1.5 rounded hover:bg-gray-200 transition-colors',
          editor.isActive('orderedList') ? 'bg-gray-300' : '',
        ]"
        :title="t('richTextEditor.orderedList')"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <ListOrdered :size="16" class="text-gray-700" />
      </button>

      <div class="w-px h-6 bg-gray-300 mx-1" />

      <!-- Block elements -->
      <button
        type="button"
        :class="[
          'p-1.5 rounded hover:bg-gray-200 transition-colors',
          editor.isActive('blockquote') ? 'bg-gray-300' : '',
        ]"
        :title="t('richTextEditor.blockquote')"
        @click="editor.chain().focus().toggleBlockquote().run()"
      >
        <Quote :size="16" class="text-gray-700" />
      </button>
      <button
        type="button"
        :class="[
          'p-1.5 rounded hover:bg-gray-200 transition-colors',
          editor.isActive('codeBlock') ? 'bg-gray-300' : '',
        ]"
        :title="t('richTextEditor.codeBlock')"
        @click="editor.chain().focus().toggleCodeBlock().run()"
      >
        <Code :size="16" class="text-gray-700" />
      </button>

      <div class="w-px h-6 bg-gray-300 mx-1" />

      <!-- Link -->
      <button
        type="button"
        :class="[
          'p-1.5 rounded hover:bg-gray-200 transition-colors',
          editor.isActive('link') ? 'bg-gray-300' : '',
        ]"
        :title="editor.isActive('link') ? t('richTextEditor.unlink') : t('richTextEditor.link')"
        @click="setLink"
      >
        <LinkIcon :size="16" class="text-gray-700" />
      </button>

      <div class="w-px h-6 bg-gray-300 mx-1" />

      <!-- Undo/Redo -->
      <button
        type="button"
        class="p-1.5 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :title="t('richTextEditor.undo')"
        :disabled="!editor.can().undo()"
        @click="editor.chain().focus().undo().run()"
      >
        <Undo2 :size="16" class="text-gray-700" />
      </button>
      <button
        type="button"
        class="p-1.5 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :title="t('richTextEditor.redo')"
        :disabled="!editor.can().redo()"
        @click="editor.chain().focus().redo().run()"
      >
        <Redo2 :size="16" class="text-gray-700" />
      </button>
    </div>

    <!-- Editor content -->
    <EditorContent :editor="editor" class="prose prose-sm max-w-none" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { useI18n } from 'vue-i18n'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Undo2,
  Redo2,
} from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
      // Exclude link as we add it separately with custom configuration
      link: false,
      // Exclude underline as we add it separately
      underline: false,
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 underline',
      },
    }),
  ],
  content: props.modelValue,
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
  editorProps: {
    attributes: {
      class:
        'prose prose-sm max-w-none min-h-[150px] px-3 py-2 border-0 focus:outline-none focus:ring-0',
      'data-placeholder': props.placeholder || '',
    },
  },
})

const setLink = () => {
  if (!editor.value) return

  const previousUrl = editor.value.getAttributes('link').href
  const url = window.prompt(t('richTextEditor.link'), previousUrl)

  if (url === null) {
    return
  }

  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

watch(
  () => props.modelValue,
  (value) => {
    const isSame = editor.value?.getHTML() === value
    if (isSame) {
      return
    }
    editor.value?.commands.setContent(value, false)
  },
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.rich-text-editor :deep(.ProseMirror) {
  min-height: 150px;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgb(209 213 219);
  border-top: none;
  border-radius: 0 0 0.375rem 0.375rem;
  outline: none;
}

.rich-text-editor :deep(.ProseMirror:focus) {
  border-color: rgb(59 130 246);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.rich-text-editor :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: rgb(156 163 175);
  pointer-events: none;
  height: 0;
}

.rich-text-editor :deep(.ProseMirror ul),
.rich-text-editor :deep(.ProseMirror ol) {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.rich-text-editor :deep(.ProseMirror h1) {
  font-size: 1.875rem;
  font-weight: 700;
  margin: 1rem 0;
}

.rich-text-editor :deep(.ProseMirror h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0.875rem 0;
}

.rich-text-editor :deep(.ProseMirror h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.75rem 0;
}

.rich-text-editor :deep(.ProseMirror blockquote) {
  border-left: 4px solid rgb(209 213 219);
  padding-left: 1rem;
  margin: 0.5rem 0;
  font-style: italic;
  color: rgb(107 114 128);
}

.rich-text-editor :deep(.ProseMirror code) {
  background-color: rgb(243 244 246);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: monospace;
}

.rich-text-editor :deep(.ProseMirror pre) {
  background-color: rgb(243 244 246);
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin: 0.5rem 0;
  overflow-x: auto;
}

.rich-text-editor :deep(.ProseMirror pre code) {
  background-color: transparent;
  padding: 0;
}
</style>

