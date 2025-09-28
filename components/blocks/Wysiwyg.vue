<script setup lang="ts">
import {
  ToolbarRoot,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from "reka-ui";
import { ref, onMounted } from "vue";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
} from "lucide-vue-next";

const toggleStateSingle = ref("left");
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

// Listen to selection changes
onMounted(() => {
  document.addEventListener("selectionchange", updateActiveStates);
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
        <Bold class="w-[15px] h-[15px] mx-auto" />
      </ToolbarToggleItem>

      <ToolbarToggleItem
        class="w-8 h-full rounded hover:bg-gray-800"
        :class="activeStates.italic ? 'bg-gray-800 text-white' : ''"
        @click="exec('italic')"
      >
        <Italic class="w-[15px] h-[15px] mx-auto" />
      </ToolbarToggleItem>

      <ToolbarToggleItem
        class="w-8 h-full rounded hover:bg-gray-800"
        :class="activeStates.underline ? 'bg-gray-800 text-white' : ''"
        @click="exec('underline')"
      >
        <Underline class="w-[15px] h-[15px] mx-auto" />
      </ToolbarToggleItem>

      <ToolbarToggleItem
        class="w-8 h-full rounded hover:bg-gray-800"
        :class="activeStates.strikethrough ? 'bg-gray-800 text-white' : ''"
        @click="exec('strikeThrough')"
      >
        <Strikethrough class="w-[15px] h-[15px] mx-auto" />
      </ToolbarToggleItem>
    </ToolbarToggleGroup>

    <ToolbarSeparator class="w-[1px] bg-mauve6 mx-[10px]" />

    <!-- Lists -->
    <ToolbarToggleGroup type="multiple" aria-label="Lists & Indent">
      <ToolbarToggleItem
        class="w-8 h-full rounded hover:bg-gray-800"
        :class="activeStates.unorderedList ? 'bg-gray-800 text-white' : ''"
        @click="exec('insertUnorderedList')"
      >
        <List class="w-[15px] h-[15px] mx-auto" />
      </ToolbarToggleItem>

      <ToolbarToggleItem
        class="w-8 h-full rounded hover:bg-gray-800"
        :class="activeStates.orderedList ? 'bg-gray-800 text-white' : ''"
        @click="exec('insertOrderedList')"
      >
        <ListOrdered class="w-[15px] h-[15px] mx-auto" />
      </ToolbarToggleItem>
    </ToolbarToggleGroup>
  </ToolbarRoot>

  <!-- Editable area -->
  <div
    ref="editor"
    contenteditable="true"
    class="wysiwyg border-x border-b p-3 min-h-[150px] rounded-b-lg"
    spellcheck="true"
  ></div>
</template>

<style scoped>
/* Basic styling for the editable area */
[contenteditable="true"] {
  outline: none;
  /* Ensure the content wraps properly */
  white-space: pre-wrap;
  word-wrap: break-word;
  li {
    list-style-type: disc !important;
  }
}

/* Editable area styling */
.wysiwyg {
  outline: none;
  white-space: pre-wrap;
  word-wrap: break-word;

  /* Unordered lists */
  ul {
    list-style-type: disc !important;
    padding-left: 1.5rem; /* add indent */
    margin: 0.5rem 0;
  }

  /* Ordered lists */
  ol {
    list-style-type: decimal !important;
    padding-left: 1.5rem; /* add indent */
    margin: 0.5rem 0;
  }

  /* Optional: indent nested lists further */
  ul ul,
  ol ol {
    padding-left: 2rem;
  }
}
</style>
