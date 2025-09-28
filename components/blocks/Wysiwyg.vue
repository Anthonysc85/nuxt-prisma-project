<script setup lang="ts">
import {
  ToolbarRoot,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from "reka-ui";
import { ref, onMounted, watch, defineProps, defineEmits } from "vue";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
} from "lucide-vue-next";

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();

const editor = ref<HTMLElement | null>(null);

// Track which buttons are active
const activeStates = ref({
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  unorderedList: false,
  orderedList: false,
});

// Initialize editor content from modelValue
onMounted(() => {
  if (editor.value && props.modelValue) {
    editor.value.innerHTML = props.modelValue;
  }
});

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (val) => {
    if (editor.value && editor.value.innerHTML !== val) {
      editor.value.innerHTML = val || "";
    }
  }
);

// Apply formatting
function exec(command: string, value: string | null = null) {
  if (!editor.value) return;

  editor.value.focus();
  document.execCommand(command, false, value);

  // Fix list styles
  const lists = editor.value.querySelectorAll("ul, ol");
  lists.forEach((list) => {
    if (list.tagName === "UL") {
      (list as HTMLElement).style.listStyleType = "disc";
      (list as HTMLElement).style.paddingLeft = "1.5rem";
    }
    if (list.tagName === "OL") {
      (list as HTMLElement).style.listStyleType = "decimal";
      (list as HTMLElement).style.paddingLeft = "1.5rem";
    }
  });

  updateActiveStates();
  emitChange();
}

// Update which buttons are active
function updateActiveStates() {
  activeStates.value.bold = document.queryCommandState("bold");
  activeStates.value.italic = document.queryCommandState("italic");
  activeStates.value.underline = document.queryCommandState("underline");
  activeStates.value.strikethrough =
    document.queryCommandState("strikeThrough");
  activeStates.value.unorderedList = document.queryCommandState(
    "insertUnorderedList"
  );
  activeStates.value.orderedList =
    document.queryCommandState("insertOrderedList");
}

// Emit updated HTML to parent
function emitChange() {
  if (editor.value) {
    emit("update:modelValue", editor.value.innerHTML);
  }
}

// Listen to selection changes
onMounted(() => {
  document.addEventListener("selectionchange", () => {
    updateActiveStates();
  });
});
</script>

<template>
  <ToolbarRoot
    class="flex px-[10px] py-2 w-full !min-w-max rounded-t-lg bg-gray-900 border-t border-x shadow-2xl"
  >
    <!-- Text formatting -->
    <ToolbarToggleGroup type="multiple" aria-label="Text formatting">
      <ToolbarToggleItem
        class="w-8 h-full rounded hover:bg-gray-800"
        :class="activeStates.bold ? 'bg-gray-800 text-white' : ''"
        @click="exec('bold')"
      >
        <Bold class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>

      <ToolbarToggleItem
        class="w-8 h-full rounded hover:bg-gray-800"
        :class="activeStates.italic ? 'bg-gray-800 text-white' : ''"
        @click="exec('italic')"
      >
        <Italic class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>

      <ToolbarToggleItem
        class="w-8 h-full rounded hover:bg-gray-800"
        :class="activeStates.underline ? 'bg-gray-800 text-white' : ''"
        @click="exec('underline')"
      >
        <Underline class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>

      <ToolbarToggleItem
        class="w-8 h-full rounded hover:bg-gray-800"
        :class="activeStates.strikethrough ? 'bg-gray-800 text-white' : ''"
        @click="exec('strikeThrough')"
      >
        <Strikethrough class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>
    </ToolbarToggleGroup>

    <ToolbarSeparator class="w-[1px] bg-gray-200 mx-[10px]" />

    <!-- Lists -->
    <ToolbarToggleGroup type="multiple" aria-label="Lists & Indent">
      <ToolbarToggleItem
        class="w-8 h-full rounded hover:bg-gray-800"
        :class="activeStates.unorderedList ? 'bg-gray-800 text-white' : ''"
        @click="exec('insertUnorderedList')"
      >
        <List class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>

      <ToolbarToggleItem
        class="w-8 h-full rounded hover:bg-gray-800"
        :class="activeStates.orderedList ? 'bg-gray-800 text-white' : ''"
        @click="exec('insertOrderedList')"
      >
        <ListOrdered class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>
    </ToolbarToggleGroup>
  </ToolbarRoot>

  <!-- Editable area -->
  <div
    ref="editor"
    contenteditable="true"
    class="wysiwyg border-x border-b p-3 min-h-[150px] rounded-b-lg dark:bg-gray-950"
    spellcheck="true"
    @input="emitChange"
  ></div>
</template>

<style scoped>
.wysiwyg {
  outline: none;
  white-space: pre-wrap;
  word-wrap: break-word;
  min-height: 150px;
}

.wysiwyg ul {
  list-style-type: disc !important;
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.wysiwyg ol {
  list-style-type: decimal !important;
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.wysiwyg ul ul,
.wysiwyg ol ol {
  padding-left: 2rem;
}
</style>
