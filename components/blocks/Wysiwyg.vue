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
  Link,
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
  link: false,
  unorderedList: false,
  orderedList: false,
});

// Initialize editor content
onMounted(() => {
  if (editor.value && props.modelValue)
    editor.value.innerHTML = props.modelValue;
  document.addEventListener("selectionchange", updateActiveStates);
});

// Watch for external model changes
watch(
  () => props.modelValue,
  (val) => {
    if (editor.value && editor.value.innerHTML !== val)
      editor.value.innerHTML = val || "";
  }
);

// Apply formatting or create link
function exec(command: string) {
  if (!editor.value) return;
  editor.value.focus();

  if (command === "createLink") {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return; // require selected text

    let url = prompt("Enter the link URL", "https://");
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = "http://" + url;

    document.execCommand("createLink", false, url); // wrap selected text
  } else {
    document.execCommand(command, false, null);
  }

  fixLists();
  updateActiveStates();
  emitChange();
}

// Update active toolbar button states
function updateActiveStates() {
  activeStates.value.bold = document.queryCommandState("bold");
  activeStates.value.italic = document.queryCommandState("italic");
  activeStates.value.underline = document.queryCommandState("underline");
  activeStates.value.strikethrough =
    document.queryCommandState("strikeThrough");
  activeStates.value.link = document.queryCommandState("createLink");
  activeStates.value.unorderedList = document.queryCommandState(
    "insertUnorderedList"
  );
  activeStates.value.orderedList =
    document.queryCommandState("insertOrderedList");
}

// Fix list styles
function fixLists() {
  if (!editor.value) return;
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
}

// Emit HTML to parent
function emitChange() {
  if (editor.value) emit("update:modelValue", editor.value.innerHTML);
}

// Automatically convert typed URLs to links without moving the cursor
function autoLink(editor: HTMLElement) {
  const selection = window.getSelection();
  if (!selection || !editor) return;

  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
  const urlRegex = /(\bhttps?:\/\/[^\s<>]+[^\s.,;<>])/gi;

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const parent = node.parentElement;

    if (!parent || parent.tagName === "A") continue;

    const matches = [...node.textContent!.matchAll(urlRegex)];
    if (!matches.length) continue;

    const frag = document.createDocumentFragment();
    let lastIndex = 0;

    for (const match of matches) {
      const [url] = match;
      const index = match.index!;

      // Add text before the link
      if (index > lastIndex) {
        frag.appendChild(
          document.createTextNode(node.textContent!.slice(lastIndex, index))
        );
      }

      // Create the <a> element
      const a = document.createElement("a");
      a.href = url;
      a.textContent = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      frag.appendChild(a);

      lastIndex = index + url.length;
    }

    // Add remaining text
    if (lastIndex < node.textContent!.length) {
      frag.appendChild(
        document.createTextNode(node.textContent!.slice(lastIndex))
      );
    }

    // Replace the text node with the fragment
    node.parentNode!.replaceChild(frag, node);
  }

  emitChange();
}

// Handle input event
function handleInput() {
  emitChange();
  if (editor.value) autoLink(editor.value);
}
</script>

<template>
  <ToolbarRoot
    class="flex px-[10px] py-2 w-full !min-w-max rounded-t-lg bg-gray-900 border-t border-x shadow-2xl dark:border-gray-700"
  >
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

    <ToolbarToggleGroup type="multiple" aria-label="Lists & Links">
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

      <ToolbarToggleItem
        class="w-8 h-full rounded hover:bg-gray-800"
        :class="activeStates.link ? 'bg-gray-800 text-white' : ''"
        @click="exec('createLink')"
      >
        <Link class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>
    </ToolbarToggleGroup>
  </ToolbarRoot>

  <div
    ref="editor"
    contenteditable="true"
    class="wysiwyg border-x border-b p-3 min-h-[150px] rounded-b-lg dark:bg-gray-950 dark:border-gray-700"
    spellcheck="true"
    @input="handleInput"
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

.wysiwyg a {
  color: #3b82f6;
  text-decoration: underline;
}
</style>
<style>
.wysiwyg a {
  color: #006076;
  text-decoration: underline;
}

.wysiwyg-content a {
  color: #006076;
  text-decoration: underline;
}
</style>
