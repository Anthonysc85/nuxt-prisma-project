<script setup lang="ts">
import {
  ToolbarRoot,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from "reka-ui";
import {
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  defineProps,
  defineEmits,
} from "vue";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  List,
  ListOrdered,
  TextQuote,
  CodeXml,
} from "lucide-vue-next";

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();

const editor = ref<HTMLElement | null>(null);

// Track which toolbar buttons are active
const activeStates = ref({
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  link: false,
  unorderedList: false,
  orderedList: false,
  blockquote: false,
  code: false,
});

const currentBlock = ref<null | "blockquote" | "pre">(null);

onMounted(() => {
  if (editor.value && props.modelValue)
    editor.value.innerHTML = props.modelValue;

  document.addEventListener("selectionchange", updateActiveStates);
});

watch(
  () => props.modelValue,
  (val) => {
    if (editor.value && editor.value.innerHTML !== val)
      editor.value.innerHTML = val || "";
  }
);

function exec(command: string) {
  if (!editor.value) return;
  editor.value.focus();

  if (command === "createLink") {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;

    let url = prompt("Enter the link URL", "https://");
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = "http://" + url;

    document.execCommand("createLink", false, url);
  } else {
    document.execCommand(command, false, null);
  }

  updateActiveStates();
  emitChange();
}

// Toggle block type (for selected text or future typing)
function toggleBlock(tag: "blockquote" | "pre") {
  if (!editor.value) return;
  editor.value.focus();

  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;

  const parentTag = getParentBlockTag(sel.getRangeAt(0).startContainer);

  if (parentTag === tag) {
    document.execCommand("formatBlock", false, "p");
    currentBlock.value = null;
  } else {
    document.execCommand("formatBlock", false, tag);
    currentBlock.value = tag;
  }

  updateActiveStates();
}

function getParentBlockTag(node: Node): string | null {
  let el: HTMLElement | null =
    node.nodeType === 3 ? node.parentElement : (node as HTMLElement);
  while (el && el !== editor.value) {
    const tag = el.tagName.toLowerCase();
    if (["p", "pre", "blockquote"].includes(tag)) return tag;
    el = el.parentElement;
  }
  return null;
}

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

  // Block type under cursor
  if (!editor.value) return;
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const tag = getParentBlockTag(sel.getRangeAt(0).startContainer);

  activeStates.value.blockquote = tag === "blockquote";
  activeStates.value.code = tag === "pre";
}

// helper: find enclosing <pre> for a given node
function findClosestPre(node: Node | null): HTMLPreElement | null {
  let el =
    node &&
    (node.nodeType === 3
      ? (node.parentElement as HTMLElement)
      : (node as HTMLElement));
  while (el && el !== editor.value) {
    if (el.tagName && el.tagName.toLowerCase() === "pre")
      return el as HTMLPreElement;
    el = el.parentElement as HTMLElement | null;
  }
  return null;
}

// helper: true if caret (collapsed selection) is at very end of the pre
function isCaretAtEndOfPre(pre: HTMLElement, range: Range): boolean {
  if (!range.collapsed) return false;
  const r = document.createRange();
  try {
    r.setStart(range.endContainer, range.endOffset);
    r.setEndAfter(pre);
    return r.toString().length === 0;
  } catch (err) {
    return false;
  }
}

function handleEditorKeydown(e: KeyboardEvent) {
  if (!editor.value) return;

  // keep Shift+Enter behaviour intact (do not exit on shift+enter)
  if (e.key !== "Enter" || (e as KeyboardEvent).shiftKey) return;

  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  const pre = findClosestPre(range.startContainer);

  // if not in a pre, normal enter behavior
  if (!pre) return;

  // if selection is not collapsed, let browser handle (or you can implement replacement logic)
  if (!sel.isCollapsed) return;

  // only prevent default if caret is at the very end of the pre
  if (isCaretAtEndOfPre(pre, range)) {
    e.preventDefault();

    // insert an empty paragraph after the pre and move caret there
    const p = document.createElement("p");
    p.innerHTML = "<br>";
    pre.insertAdjacentElement("afterend", p);

    const newRange = document.createRange();
    newRange.setStart(p, 0);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    // update vue model
    emitChange();
  }
}

// click-outside handler: ensure there is a paragraph after the last <pre>
function handleDocumentClick(e: MouseEvent) {
  if (!editor.value) return;
  const target = e.target as Node;
  if (editor.value.contains(target)) return; // clicked inside - ignore

  const pres = editor.value.querySelectorAll("pre");
  if (pres.length) {
    const lastPre = pres[pres.length - 1] as HTMLElement;
    const nextEl = lastPre.nextElementSibling;
    if (!nextEl || nextEl.tagName.toLowerCase() !== "p") {
      const p = document.createElement("p");
      p.innerHTML = "<br>";
      lastPre.insertAdjacentElement("afterend", p);
      emitChange();
    }
  }

  // update UI state
  currentBlock.value = null;
  updateActiveStates();
}

onMounted(() => {
  if (editor.value && props.modelValue)
    editor.value.innerHTML = props.modelValue;

  document.addEventListener("selectionchange", updateActiveStates);
  editor.value?.addEventListener("keydown", handleEditorKeydown);
  document.addEventListener("click", handleDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("selectionchange", updateActiveStates);
  editor.value?.removeEventListener("keydown", handleEditorKeydown);
  document.removeEventListener("click", handleDocumentClick);
});

function handleInput() {
  emitChange();
}

function emitChange() {
  if (editor.value) emit("update:modelValue", editor.value.innerHTML);
}
</script>

<template>
  <ToolbarRoot
    class="flex px-[10px] py-2 w-full !min-w-max rounded-t-lg bg-gray-900 border-t-2 border-x-2 shadow-2xl border-slate-400 dark:border-gray-700"
  >
    <!-- Formatting buttons -->
    <ToolbarToggleGroup type="multiple" aria-label="Text formatting">
      <ToolbarToggleItem
        :class="activeStates.bold ? 'bg-gray-800 text-white' : ''"
        class="w-8 h-full rounded hover:bg-gray-800"
        @click="exec('bold')"
      >
        <Bold class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>
      <ToolbarToggleItem
        :class="activeStates.italic ? 'bg-gray-800 text-white' : ''"
        class="w-8 h-full rounded hover:bg-gray-800"
        @click="exec('italic')"
      >
        <Italic class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>
      <ToolbarToggleItem
        :class="activeStates.underline ? 'bg-gray-800 text-white' : ''"
        class="w-8 h-full rounded hover:bg-gray-800"
        @click="exec('underline')"
      >
        <Underline class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>
      <ToolbarToggleItem
        :class="activeStates.strikethrough ? 'bg-gray-800 text-white' : ''"
        class="w-8 h-full rounded hover:bg-gray-800"
        @click="exec('strikeThrough')"
      >
        <Strikethrough class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>
    </ToolbarToggleGroup>

    <ToolbarSeparator class="w-[1px] bg-gray-200 mx-[10px]" />

    <!-- Lists & Links -->
    <ToolbarToggleGroup type="multiple" aria-label="Lists & Links">
      <ToolbarToggleItem
        :class="activeStates.unorderedList ? 'bg-gray-800 text-white' : ''"
        class="w-8 h-full rounded hover:bg-gray-800"
        @click="exec('insertUnorderedList')"
      >
        <List class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>
      <ToolbarToggleItem
        :class="activeStates.orderedList ? 'bg-gray-800 text-white' : ''"
        class="w-8 h-full rounded hover:bg-gray-800"
        @click="exec('insertOrderedList')"
      >
        <ListOrdered class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>
      <ToolbarToggleItem
        :class="activeStates.link ? 'bg-gray-800 text-white' : ''"
        class="w-8 h-full rounded hover:bg-gray-800"
        @click="exec('createLink')"
      >
        <Link class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>
    </ToolbarToggleGroup>

    <ToolbarSeparator class="w-[1px] bg-gray-200 mx-[10px]" />

    <!-- Block toggles -->
    <ToolbarToggleGroup type="multiple" aria-label="Blocks">
      <ToolbarToggleItem
        :class="activeStates.blockquote ? 'bg-gray-800 text-white' : ''"
        class="w-8 h-full rounded hover:bg-gray-800"
        @click="toggleBlock('blockquote')"
      >
        <TextQuote class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>
      <ToolbarToggleItem
        :class="activeStates.code ? 'bg-gray-800 text-white' : ''"
        class="w-8 h-full rounded hover:bg-gray-800"
        @click="toggleBlock('pre')"
      >
        <CodeXml class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>
    </ToolbarToggleGroup>
  </ToolbarRoot>

  <div
    ref="editor"
    contenteditable="true"
    class="wysiwyg border-x-2 border-b-2 p-3 min-h-[150px] rounded-b-lg bg-slate-200 dark:bg-gray-800 border-slate-400 dark:border-gray-700"
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

.wysiwyg blockquote {
  border-left: 4px solid #36a3f7;
  margin: 0;
  padding-left: 0.75rem;
  color: #555;
  font-style: italic;
  background-color: #f5f8fb;
}
</style>
<style>
.wysiwyg a {
  color: #569cd6;
  text-decoration: underline;
}

.wysiwyg pre {
  background-color: #1e2938 !important; /* Slack light gray */
  color: #fff;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  width: fit-content;
  font-family: monospace;
  white-space: pre-wrap; /* wrap long lines */
  word-break: break-word;
  text-wrap-mode: wrap !important;
  display: block;
  margin: 0.5rem 0;
  border: 2px solid #484242;
}

.wysiwyg pre div {
  text-wrap-mode: wrap;
}

.wysiwyg pre span {
  background-color: transparent !important;
}
.wysiwyg pre div {
  background-color: transparent !important;
}

.dark .wysiwyg pre {
  background-color: #1e2938 !important; /* Slack dark mode */
  color: #fff;
}

.dark .wysiwyg pre span[style*="color"] {
  filter: brightness(1.2) contrast(0.9);
}

.wysiwyg p {
  background-color: transparent !important;
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
.wysiwyg blockquote {
  border-left: 4px solid #1e2938;
  margin: 0;
  padding-left: 0.75rem;
  color: #030712 !important;
  font-style: italic;
}

.dark .wysiwyg blockquote {
  color: #e6e7eb !important;
  border-left: 4px solid #016176;
}
</style>
